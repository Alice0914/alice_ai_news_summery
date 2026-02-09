
# backend/agents/workflow.py

import os
import sys

# Ensure project root is in sys.path
current_file = os.path.abspath(__file__)
agents_dir = os.path.dirname(current_file)
backend_dir = os.path.dirname(agents_dir)
root_dir = os.path.dirname(backend_dir)

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from dotenv import load_dotenv

# Load Environment Variables from .env.local
env_path = os.path.join(root_dir, '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"Loaded credentials from {env_path}")
else:
    print(f"Warning: .env.local not found at {env_path}")

import json
import logging
from typing import TypedDict, List
from datetime import datetime, timedelta

from langgraph.graph import StateGraph, END

# Absolute imports from the project root
try:
    from backend.agents.collectors.techcrunch_collector import TechCrunchCollector
    from backend.agents.collectors.mit_collector import MITCollector
    from backend.agents.collectors.anthropic_collector import AnthropicCollector
    from backend.agents.collectors.runtime_collector import RuntimeCollector
    from backend.agents.collectors.openai_collector import OpenAICollector
    from backend.agents.collectors.nvidia_collector import NVIDIACollector
    from backend.agents.collectors.robot_collector import RobotCollector
    from backend.agents.collectors.xai_collector import XAICollector
    from backend.agents.processors.scorer_tagger import ScorerTagger
    from backend.agents.processors.translator import Translator
    from backend.agents.processors.deduplicator import Deduplicator
    from backend.agents.processors.review_agent import ReviewAgent
except ImportError as e:
    print(f"Import Error fallback: {e}")
    # Fallback for different execution contexts
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    from agents.collectors.techcrunch_collector import TechCrunchCollector
    from agents.collectors.mit_collector import MITCollector
    from agents.collectors.anthropic_collector import AnthropicCollector
    from agents.collectors.runtime_collector import RuntimeCollector
    from agents.collectors.openai_collector import OpenAICollector
    from agents.collectors.nvidia_collector import NVIDIACollector
    from agents.collectors.robot_collector import RobotCollector
    from agents.collectors.xai_collector import XAICollector
    from agents.processors.scorer_tagger import ScorerTagger
    from agents.processors.translator import Translator
    from agents.processors.deduplicator import Deduplicator
    from agents.processors.review_agent import ReviewAgent


# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- State Definition ---
class PipelineState(TypedDict):
    """
    Represents the state of the news pipeline.
    """
    current_date: str
    existing_articles: List[dict]  # From past 3 days
    new_articles: List[dict]       # Collected today
    processed_articles: List[dict] # After deduplication & processing
    valid_articles: List[dict]     # Passed review
    invalid_articles: List[dict]   # Failed review
    output_dir: str
    exact_mode: bool               # If True, collect only for current_date
    end_date: str                  # Optional end date for range collection

# --- Node Functions ---

def load_history(state: PipelineState) -> PipelineState:
    print("Step 2: Loading History (Dynamic)...")
    output_dir = state['output_dir']
    existing = []
    
    target_date = datetime.strptime(state['current_date'], "%Y-%m-%d")
    
    # 1. Standard Window (Target + past 3 days)
    dates_to_load = set()
    dates_to_load.add(state['current_date'])
    for i in range(1, 4):
        past_date = (target_date - timedelta(days=i)).strftime("%Y-%m-%d")
        dates_to_load.add(past_date)
        
    # 2. Dynamic Window (Dates from collected articles)
    new_articles = state.get('new_articles', [])
    for art in new_articles:
        d = art.get('publishedDate') or art.get('date')
        if d:
            # Simple validation: looks like YYYY-MM-DD
            if len(d) == 10 and d.count('-') == 2:
                dates_to_load.add(d)
    
    print(f"  Loading history for dates: {sorted(list(dates_to_load))}")
    
    for d_str in dates_to_load:
        fpath = os.path.join(output_dir, f"final_news_output_{d_str}.json")
        if os.path.exists(fpath):
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    existing.extend(data)
                print(f"    Loaded {len(data)} articles from {d_str}")
            except Exception as e:
                print(f"    Failed to load {fpath}: {e}")
    
    print(f"  Total existing articles loaded: {len(existing)}")
    return {"existing_articles": existing}


def collect_news(state: PipelineState) -> PipelineState:
    print("Step 1: Collecting News...")
    
    collected = []
    target_date_str = state['current_date']
    target_date_obj = datetime.strptime(target_date_str, "%Y-%m-%d")
    weekday = target_date_obj.weekday()

    # Determine Collection Range
    # Determine Collection Range
    if state.get('exact_mode'):
        print(f"  [Exact Mode] Collection Start: {target_date_str}")
        start_date_obj = target_date_obj
        
        if state.get('end_date'):
            end_date_obj = datetime.strptime(state['end_date'], "%Y-%m-%d")
            print(f"  [Exact Mode] Collection End: {state['end_date']}")
        else:
            end_date_obj = target_date_obj
            
    elif weekday == 0:  # Monday
        # Collect Friday, Saturday, Sunday
        start_date_obj = target_date_obj - timedelta(days=3)
        end_date_obj = target_date_obj - timedelta(days=1)
        print(f"  [Monday Logic] Collecting news from {start_date_obj.strftime('%Y-%m-%d')} (Fri) to {end_date_obj.strftime('%Y-%m-%d')} (Sun)")
    else:  # Tuesday - Sunday
        # Collect Yesterday
        start_date_obj = target_date_obj - timedelta(days=1)
        end_date_obj = target_date_obj - timedelta(days=1)
        print(f"  [Standard Logic] Collecting news from {start_date_obj.strftime('%Y-%m-%d')} (Yesterday)")

    start_date = start_date_obj.strftime("%Y-%m-%d")
    end_date = end_date_obj.strftime("%Y-%m-%d")

    # TechCrunch
    try:
        print("  Running TechCrunchCollector...")
        tc_collector = TechCrunchCollector(start_date=start_date, end_date=end_date)
        if hasattr(tc_collector, 'collect'):
             articles = tc_collector.collect(start_date, end_date)
        else:
             articles = tc_collector.run()
        collected.extend(articles)
    except Exception as e:
        print(f"  TechCrunchCollector failed: {e}")

    # MIT
    try:
        print("  Running MITCollector...")
        mit_collector = MITCollector(start_date=start_date, end_date=end_date) 
        if hasattr(mit_collector, 'collect'):
            articles = mit_collector.collect(start_date, end_date)
        else:
            articles = mit_collector.run()
        collected.extend(articles)
    except Exception as e:
        print(f"  MITCollector failed: {e}")

    # Anthropic
    try:
        print("  Running AnthropicCollector...")
        anth_collector = AnthropicCollector(start_date=start_date, end_date=end_date)
        if hasattr(anth_collector, 'collect'):
            articles = anth_collector.collect(start_date, end_date)
        else:
            articles = anth_collector.run()
        collected.extend(articles)
    except Exception as e:
        print(f"  AnthropicCollector failed: {e}")

    # Runtime (The Rundown)
    try:
        print("  Running RuntimeCollector...")
        runtime_collector = RuntimeCollector(start_date=start_date, end_date=end_date)
        articles = runtime_collector.run()
        collected.extend(articles)
    except Exception as e:
        print(f"  RuntimeCollector failed: {e}")

    # OpenAI
    try:
        print("  Running OpenAICollector...")
        openai_collector = OpenAICollector(start_date=start_date, end_date=end_date)
        articles = openai_collector.run()
        collected.extend(articles)
    except Exception as e:
        print(f"  OpenAICollector failed: {e}")

    # NVIDIA
    try:
        print("  Running NVIDIACollector...")
        nvidia_collector = NVIDIACollector(start_date=start_date, end_date=end_date)
        articles = nvidia_collector.run()
        collected.extend(articles)
    except Exception as e:
        print(f"  NVIDIACollector failed: {e}")

    # Robot Runtime
    try:
        print("  Running RobotCollector...")
        robot_collector = RobotCollector(start_date=start_date, end_date=end_date)
        articles = robot_collector.run()
        collected.extend(articles)
    except Exception as e:
        print(f"  RobotCollector failed: {e}")

    # xAI
    try:
        print("  Running XAICollector...")
        xai_collector = XAICollector(start_date=start_date, end_date=end_date)
        articles = xai_collector.run()
        collected.extend(articles)
    except Exception as e:
        print(f"  XAICollector failed: {e}")
        
    print(f"  Total collected: {len(collected)}")
    
    # Normalize 'date' key to 'publishedDate' for consistency
    for art in collected:
        if 'publishedDate' not in art and 'date' in art:
            art['publishedDate'] = art['date']
            
    return {"new_articles": collected}


def deduplicate(state: PipelineState) -> PipelineState:
    print("Step 3: Deduplicating...")
    
    all_articles = state['existing_articles'] + state['new_articles']
    
    deduplicator = Deduplicator()
    # Pass current_date for log filename
    unique_articles = deduplicator.run(all_articles, target_date=state['current_date'])
    
    existing_ids = set(a.get('link') or a.get('url') or a.get('source_url') for a in state['existing_articles']) 
    
    final_new = []
    for art in unique_articles:
        url = art.get('link') or art.get('url') or art.get('source_url')
        if url and url not in existing_ids:
            final_new.append(art)
        elif not url:
            # Fallback if no URL at all, but print warning
            print(f"  [Warning] Article '{art.get('raw_title', '')[:30]}...' has no URL. Keeping conditionally.")
            final_new.append(art)
        else:
            print(f"  [Info] Article '{art.get('raw_title', '')[:30]}...' found in history. Skipping.")
            
    print(f"  New unique articles to process: {len(final_new)}")
    return {"processed_articles": final_new}


def process_news(state: PipelineState) -> PipelineState:
    print("Step 4: Processing (Score/Tag/Translate)...")
    articles = state['processed_articles']
    
    if not articles:
        print("  No articles to process.")
        return {"processed_articles": []}

    scorer = ScorerTagger()
    print("  Running Scorer/Tagger...")
    scored = scorer.run(articles) 
    
    translator = Translator()
    print("  Running Translator...")
    final_processed = translator.run(scored)
    
    return {"processed_articles": final_processed}


def review_news(state: PipelineState) -> PipelineState:
    print("Step 5: Reviewing...")
    reviewer = ReviewAgent()
    valid, invalid = reviewer.review_batch(state['processed_articles'])
    
    if invalid:
        print(f"  {len(invalid)} articles failed review.")
        
    return {"valid_articles": valid, "invalid_articles": invalid}


def save_news(state: PipelineState) -> PipelineState:
    print("Step 6: Saving (Dynamic Date)...")
    valid = state['valid_articles']
    if not valid:
        print("  No valid new articles to save.")
        return {}
        
    output_dir = state['output_dir']
    
    # Group by Published Date
    articles_by_date = {}
    for art in valid:
        d = art.get('publishedDate') or art.get('date') or state['current_date']
        # Normalize date format just in case
        if not (len(d) == 10 and d.count('-') == 2):
            d = state['current_date'] # Fallback
            
        if d not in articles_by_date:
            articles_by_date[d] = []
        articles_by_date[d].append(art)
        
    # 1. Save to specific date files
    for d_str, articles in articles_by_date.items():
        daily_file = os.path.join(output_dir, f"final_news_output_{d_str}.json")
        daily_data = []
        
        # Load existing if present
        if os.path.exists(daily_file):
            try:
                with open(daily_file, 'r', encoding='utf-8') as f:
                    daily_data = json.load(f)
            except Exception as e:
                print(f"    Failed to load {daily_file}: {e}")
                
        # Append new unique
        existing_ids = set(a.get('id') for a in daily_data if a.get('id'))
        to_add = [a for a in articles if a.get('id') not in existing_ids]
        
        if to_add:
            daily_data.extend(to_add)
            with open(daily_file, 'w', encoding='utf-8') as f:
                json.dump(daily_data, f, ensure_ascii=False, indent=2)
            print(f"  [Daily] Saved {len(to_add)} articles to {daily_file}")
        else:
            print(f"  [Daily] No new articles for {daily_file}")
            
    # 2. Update Main File (Cumulative)
    main_file = os.path.join(output_dir, "final_news_output.json")
    main_data = []
    
    if os.path.exists(main_file):
        try:
            with open(main_file, 'r', encoding='utf-8') as f:
                main_data = json.load(f)
        except Exception as e:
            print(f"  [Warning] Failed to load main file: {e}")
            main_data = []
    
    # Merge only new articles by checking IDs
    existing_ids = set(a.get('id') for a in main_data)
    # We want to add ALL valid articles from this run, regardless of their date bucket,
    # as long as they aren't in the main file yet.
    to_append = [a for a in valid if a.get('id') not in existing_ids]
    
    if to_append:
        main_data.extend(to_append)
        # Sort by date (newest first)
        main_data.sort(key=lambda x: x.get('publishedDate', ''), reverse=True)
        
        with open(main_file, 'w', encoding='utf-8') as f:
            json.dump(main_data, f, ensure_ascii=False, indent=2)
        print(f"  [Main] Updated: {len(to_append)} new articles added. Total: {len(main_data)}")
    else:
        print("  [Main] No new unique articles to add to main database.")
    
    return {}


# --- Graph Construction ---

def create_news_workflow():
    workflow = StateGraph(PipelineState)
    
    # Add Nodes
    workflow.add_node("load_history", load_history)
    workflow.add_node("collect_news", collect_news)
    workflow.add_node("deduplicate", deduplicate)
    workflow.add_node("process_news", process_news)
    workflow.add_node("review_news", review_news)
    workflow.add_node("save_news", save_news)
    
    # Set Entry Point
    workflow.set_entry_point("collect_news")
    
    # Add Edges
    workflow.add_edge("collect_news", "load_history")
    workflow.add_edge("load_history", "deduplicate")
    workflow.add_edge("deduplicate", "process_news")
    workflow.add_edge("process_news", "review_news")
    workflow.add_edge("review_news", "save_news")
    workflow.add_edge("save_news", END)
    
    return workflow.compile()

# --- Execution Entry Point ---
if __name__ == "__main__":
    from datetime import datetime
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", type=str, default=datetime.now().strftime("%Y-%m-%d"), help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end_date", type=str, help="End date (YYYY-MM-DD) for range collection")
    parser.add_argument("--exact", action="store_true", help="Collect news only for the specified date(s)")
    args = parser.parse_args()
    
    app = create_news_workflow()
    
    initial_state = {
        "current_date": args.date,
        "end_date": args.end_date,
        "exact_mode": args.exact,
        "output_dir": os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data")),
        "existing_articles": [],
        "new_articles": [],
        "processed_articles": [], # Initialize
        "valid_articles": [], # Initialize
        "invalid_articles": [] # Initialize
    }
    
    print(f"Starting News Pipeline for {args.date}...")
    final_state = app.invoke(initial_state)
    print("Pipeline Completed.")
