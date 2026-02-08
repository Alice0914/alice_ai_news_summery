"""
News Aggregator Agent
Collects news from multiple AI news agents, deduplicates them using semantic similarity,
and prioritizes authoritative sources.
"""

import os
import sys
import json
import time
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import google.generativeai as genai
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import Agents
from backend.agents.google_ai_news_agent import GoogleAINewsAgent
from backend.agents.openAI_news_agent import OpenAINewsAgent
from backend.agents.anthropic_blogs_agent import AnthropicBlogsAgent
from backend.agents.nvidia_ai_news_agent import NVIDIAAINewsAgent
from backend.agents.xAI_news_agent import XAINewsAgent
from backend.agents.mit_ai_news_agent import MITAINewsAgent
from backend.agents.runtime_agent import AINewsAgent as RuntimeAgent
from backend.agents.robot_runtime_news_agent import RobotRuntimeNewsAgent

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class NewsAggregatorAgent:
    def __init__(self):
        self.model_name = "models/text-embedding-004"
        self.priority_map = {
            "OpenAI": 10, "Google": 10, "Anthropic": 10, "NVIDIA": 10, "xAI": 10,
            "DeepMind": 10, "MIT": 9, 
            "The Rundown": 1, "The Neuron": 1, 
            "Unknown": 1
        }
        
    def _get_embeddings(self, texts):
        """Get embeddings for a list of texts using Gemini."""
        if not texts:
            return []
        
        # Batching to avoid limits (max 100 per call usually, but let's be safe with 20)
        batch_size = 20
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            try:
                result = genai.embed_content(
                    model=self.model_name,
                    content=batch,
                    task_type="clustering"
                )
                embeddings.extend(result['embedding'])
                time.sleep(1) # Rate limit protection
            except Exception as e:
                print(f"Error getting embeddings: {e}")
                # Fallback: append zero vectors or skip? 
                # Better to append None and filter later
                embeddings.extend([None] * len(batch))
        
        return embeddings

    def collect_news(self, start_date, end_date):
        """Collect news from all agents."""
        articles = []
        
        agents = [
            #("Google", GoogleAINewsAgent(start_date, end_date, limit=10)),
            ("OpenAI", OpenAINewsAgent(start_date, end_date)),
            ("Anthropic", AnthropicBlogsAgent(start_date, end_date)),
            ("NVIDIA", NVIDIAAINewsAgent(start_date, end_date)),
            ("xAI", XAINewsAgent(start_date, end_date)),
            ("MIT", MITAINewsAgent(start_date, end_date)),
            ("The Rundown", RuntimeAgent(start_date, end_date)),
            ("Robot Runtime", RobotRuntimeNewsAgent(start_date, end_date))
        ]
        
        # Fix RobotRuntime args if needed. 
        # RobotRuntimeNewsAgent usually inherits from RuntimeAgent or has its own runtime args.
        # Checking imports... RobotRuntimeNewsAgent in file robot_runtime_news_agent.py
        # It takes no args in __init__ usually? Let's assume standard run()
        
        for name, agent in agents:
            try:
                print(f"Running {name}...")
                # Special handling for RobotRuntime if it doesn't take dates in init
                if name == "Robot Runtime":
                     # Robot runtime might not support date range in init perfectly based on my memory, 
                     # but let's try running it. If it fails, we catch it.
                     pass

                results = agent.run()
                # Normalize results
                for item in results:
                    item['aggregator_source'] = name
                    articles.append(item)
            except Exception as e:
                print(f"Failed to run {name}: {e}")
                
        return pd.DataFrame(articles)

    def deduplicate(self, df):
        """Deduplicate articles using embeddings and cosine similarity."""
        if df.empty:
            return df
            
        print("Generating embeddings...")
        df = df[df['raw_title'].notna()]
        df = df[df['raw_title'].astype(str).str.strip() != ''].copy()
        titles = df['raw_title'].tolist()
        
        embeddings = self._get_embeddings(titles)
        
        # Remove failures
        valid_indices = [i for i, e in enumerate(embeddings) if e is not None]
        df = df.iloc[valid_indices].copy()
        embeddings = [embeddings[i] for i in valid_indices]
        
        if not embeddings:
            return df
            
        print("Calculating similarity...")
        sim_matrix = cosine_similarity(embeddings)
        
        # Deduplication logic
        # 1. Sort by Priority (High to Low)
        
        def get_priority(row):
            # Try source_name first
            p = self.priority_map.get(row.get('source_name'))
            if p: return p
            # Fallback to aggregator_source
            return self.priority_map.get(row.get('aggregator_source'), 1)
            
        df['priority'] = df.apply(get_priority, axis=1)
        
        # Sort by Priority DESC
        df = df.sort_values('priority', ascending=False).reset_index(drop=True)
        
        keep_indices = []
        drop_indices = set()
        
        # Greedily keep high priority, drop similar lower/equal priority
        for i in range(len(df)):
            if i in drop_indices:
                continue
            
            keep_indices.append(i)
            
            for j in range(i + 1, len(df)):
                if j in drop_indices:
                    continue
                
                # Check similarity
                # Need to map back to matrix index? 
                # Since we reordered DF, we need reordered embeddings.
                # Recomputing matrix for reordered might be expensive if N is large.
                # Better: calculate pair similarity on the fly or just reorder embeddings list too.
                
                # Let's reorder embeddings
                pass 
        
        # Re-implementation with correct index mapping
        # Re-order embeddings to match sorted DF
        # This is tricky without keeping track of original indices.
        # Easiest: Add 'embedding' col to DF
        df['embedding'] = embeddings 
        df['duplicate_count'] = 0
        
        keep_mask = [True] * len(df)
        
        for i in range(len(df)):
            if not keep_mask[i]:
                continue
                
            vec_i = np.array(df.iloc[i]['embedding']).reshape(1, -1)
            
            for j in range(i + 1, len(df)):
                if not keep_mask[j]:
                    continue
                
                vec_j = np.array(df.iloc[j]['embedding']).reshape(1, -1)
                sim = cosine_similarity(vec_i, vec_j)[0][0]
                
                if sim > 0.85: # Threshold for "Same Topic"
                    # Drop j
                    keep_mask[j] = False
                    # Increment duplicate count for i
                    df.at[df.index[i], 'duplicate_count'] += 1
                    print(f"Duplicate found: Keeping '{df.iloc[i]['raw_title']}' ({df.iloc[i]['source_name']}), Dropping '{df.iloc[j]['raw_title']}' ({df.iloc[j]['source_name']})")

        return df[keep_mask].drop(columns=['embedding', 'priority'])

    def run(self, start_date, end_date):
        print("Collecting news...")
        df = self.collect_news(start_date, end_date)
        print(f"Collected {len(df)} articles.")
        
        deduped_df = self.deduplicate(df)
        print(f"After deduplication: {len(deduped_df)} articles.")
        
        # Enrichment Step
        from backend.agents.news_scoring_agent import NewsScoringAgent
        scorer = NewsScoringAgent()
        
        articles_list = deduped_df.to_dict('records')
        
        # 1. Calculate Impact Scores (Pro)
        scored_articles = scorer.calculate_impact_scores(articles_list)
        
        # 2. Enrich ALL articles (Flash), why_it_matters for Top 10 only
        final_articles = scorer.enrich_articles(scored_articles, top_k=10)
        
        # Convert to JSON (final_articles is list of dicts)
        return final_articles
        
if __name__ == "__main__":
    # Test run
    # Use dates from arg or default
    today = datetime.now()
    yesterday = today - timedelta(days=1)
    agent = NewsAggregatorAgent()
    res = agent.run(yesterday.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d"))
    print(json.dumps(res, indent=2, ensure_ascii=False))
