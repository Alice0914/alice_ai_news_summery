# backend/agents/pipeline.py
"""
News Processing Pipeline
Main entry point that orchestrates:
1. Parallel data collection from all sources
2. Deduplication with exposure scoring
3. Impact scoring + tagging (combined)
4. Korean translation + final output

Usage:
    from backend2.agents2 import run_pipeline
    output_file = run_pipeline("2026-01-30", "2026-01-30")
"""

import os
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from dotenv import load_dotenv

# Load .env.local from project root
env_path = Path(__file__).resolve().parent.parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

# Collectors
from .collectors import (
    AnthropicCollector,
    MITCollector,
    NVIDIACollector,
    OpenAICollector,
    XAICollector,
    RobotCollector,
    RuntimeCollector,
    TechCrunchCollector
)

# Processors
from .processors import Deduplicator, ScorerTagger, Translator


def _collect_from_source(collector_class, start_date: str, end_date: str) -> list:
    """Helper function to run a single collector."""
    try:
        collector = collector_class(start_date, end_date)
        return collector.run()
    except Exception as e:
        print(f"Error in {collector_class.__name__}: {e}")
        return []


def collect_all_parallel(start_date: str, end_date: str) -> list:
    """
    Step 1: Collect news from all sources in parallel.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        
    Returns:
        Combined list of all collected articles
    """
    print("=" * 60)
    print("STEP 1: Parallel Data Collection")
    print("=" * 60)
    
    collectors = [
        AnthropicCollector,
        MITCollector,
        NVIDIACollector,
        OpenAICollector,
        XAICollector,
        RobotCollector,
        RuntimeCollector,
        TechCrunchCollector
    ]
    
    all_articles = []
    
    # Use ThreadPoolExecutor for parallel execution
    with ThreadPoolExecutor(max_workers=len(collectors)) as executor:
        # Submit all collection tasks
        future_to_collector = {
            executor.submit(_collect_from_source, c, start_date, end_date): c.__name__
            for c in collectors
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_collector):
            collector_name = future_to_collector[future]
            try:
                articles = future.result()
                print(f"  ✅ {collector_name}: {len(articles)} articles")
                all_articles.extend(articles)
            except Exception as e:
                print(f"  ❌ {collector_name}: Error - {e}")
    
    print(f"\nTotal collected: {len(all_articles)} articles\n")
    return all_articles


def deduplicate_articles(articles: list) -> list:
    """
    Step 2: Deduplicate articles using semantic similarity.
    
    Args:
        articles: List of raw articles
        
    Returns:
        Deduplicated list with exposure_score added
    """
    print("=" * 60)
    print("STEP 2: Deduplication")
    print("=" * 60)
    
    deduplicator = Deduplicator()
    result = deduplicator.run(articles)
    
    print(f"\nAfter deduplication: {len(result)} articles\n")
    return result


def score_and_tag(articles: list) -> list:
    """
    Step 3: Score and tag all articles.
    
    Args:
        articles: Deduplicated articles
        
    Returns:
        Scored and tagged articles
    """
    print("=" * 60)
    print("STEP 3: Scoring & Tagging")
    print("=" * 60)
    
    scorer_tagger = ScorerTagger()
    result = scorer_tagger.run(articles)
    
    print(f"\nScored and tagged: {len(result)} articles\n")
    return result


def translate_and_save(articles: list, end_date: str, output_dir: str = None) -> str:
    """
    Step 4: Translate to Korean and save final output.
    
    Args:
        articles: Scored and tagged articles
        end_date: End date for filename
        output_dir: Output directory (default: backend/notebook)
        
    Returns:
        Path to saved file
    """
    print("=" * 60)
    print("STEP 4: Translation & Final Output")
    print("=" * 60)
    
    translator = Translator()
    final_articles = translator.run(articles)
    
    # Determine output path
    if output_dir is None:
        output_dir = os.path.abspath(os.path.join(
            os.path.dirname(__file__), '..', '..', 'backend', 'notebook'
        ))
    
    # Create filename with date
    date_str = end_date.replace('-', '')
    output_filename = f"final_news_output_{date_str}.json"
    output_path = os.path.join(output_dir, output_filename)
    
    # Ensure directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_articles, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved {len(final_articles)} articles to: {output_path}\n")
    return output_path


def run_pipeline(start_date: str, end_date: str, output_dir: str = None) -> str:
    """
    Main Pipeline Function
    Runs the complete news processing pipeline.
    
    Args:
        start_date: Start date in YYYY-MM-DD format (e.g., "2026-01-30")
        end_date: End date in YYYY-MM-DD format (e.g., "2026-01-30")
        output_dir: Optional output directory path
        
    Returns:
        Path to the generated output file
        
    Example:
        >>> from backend2.agents2 import run_pipeline
        >>> output = run_pipeline("2026-01-30", "2026-01-30")
        >>> print(f"Output saved to: {output}")
    """
    print("\n" + "=" * 60)
    print("🚀 AI NEWS PROCESSING PIPELINE")
    print(f"   Date Range: {start_date} ~ {end_date}")
    print("=" * 60 + "\n")
    
    start_time = datetime.now()
    
    # Step 1: Collect
    raw_articles = collect_all_parallel(start_date, end_date)
    
    if not raw_articles:
        print("❌ No articles collected. Exiting.")
        return None
    
    # Step 2: Deduplicate
    unique_articles = deduplicate_articles(raw_articles)
    
    if not unique_articles:
        print("❌ No articles after deduplication. Exiting.")
        return None
    
    # Step 3: Score & Tag
    scored_articles = score_and_tag(unique_articles)
    
    # Step 4: Translate & Save
    output_path = translate_and_save(scored_articles, end_date, output_dir)
    
    # Summary
    elapsed = datetime.now() - start_time
    print("=" * 60)
    print("✅ PIPELINE COMPLETE")
    print(f"   Total Time: {elapsed}")
    print(f"   Output: {output_path}")
    print("=" * 60 + "\n")
    
    return output_path


# CLI Entry Point
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) >= 3:
        start = sys.argv[1]
        end = sys.argv[2]
    else:
        # Default to today
        today = datetime.now().strftime("%Y-%m-%d")
        start = today
        end = today
        print(f"Usage: python pipeline.py <start_date> <end_date>")
        print(f"Defaulting to: {start} ~ {end}")
    
    run_pipeline(start, end)
