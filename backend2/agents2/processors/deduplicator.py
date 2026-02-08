# backend2/agents2/processors/deduplicator.py
"""
Deduplicator
Uses embeddings to find and remove duplicate news articles,
keeping the most authoritative source and tracking exposure_score.
"""

import os
import time
import numpy as np
import pandas as pd
import google.generativeai as genai
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

from ..config import SOURCE_PRIORITY, SIMILARITY_THRESHOLD, MODEL_EMBEDDING

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend', '.env'))
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


class Deduplicator:
    """Deduplicates news articles using semantic similarity."""
    
    def __init__(self):
        self.model_name = MODEL_EMBEDDING
        self.priority_map = SOURCE_PRIORITY
        self.threshold = SIMILARITY_THRESHOLD
    
    def _get_embeddings(self, texts: list) -> list:
        """Get embeddings for a list of texts."""
        if not texts:
            return []
        
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
                time.sleep(0.5)  # Rate limit protection
            except Exception as e:
                print(f"[Deduplicator] Error getting embeddings: {e}")
                embeddings.extend([None] * len(batch))
        
        return embeddings
    
    def _get_priority(self, row) -> int:
        """Get source priority for an article."""
        p = self.priority_map.get(row.get('source_name'))
        if p:
            return p
        return self.priority_map.get("Unknown", 1)
    
    def run(self, articles: list) -> list:
        """
        Deduplicate articles.
        
        Args:
            articles: List of article dicts with 'raw_title', 'source_name', etc.
            
        Returns:
            Deduplicated list with 'exposure_score' added to each article.
        """
        if not articles:
            return []
        
        print(f"[Deduplicator] Processing {len(articles)} articles...")
        
        # Convert to DataFrame
        df = pd.DataFrame(articles)
        
        # Filter out empty titles
        df = df[df['raw_title'].notna()]
        df = df[df['raw_title'].astype(str).str.strip() != ''].copy()
        
        if df.empty:
            return []
        
        # Get embeddings
        print("[Deduplicator] Generating embeddings...")
        titles = df['raw_title'].tolist()
        embeddings = self._get_embeddings(titles)
        
        # Filter out failed embeddings
        valid_indices = [i for i, e in enumerate(embeddings) if e is not None]
        df = df.iloc[valid_indices].copy()
        embeddings = [embeddings[i] for i in valid_indices]
        
        if not embeddings:
            return []
        
        # Add priority and sort
        df['priority'] = df.apply(self._get_priority, axis=1)
        df = df.sort_values('priority', ascending=False).reset_index(drop=True)
        
        # Reorder embeddings to match sorted DF
        sorted_embeddings = [embeddings[i] for i in df.index.tolist()] if len(embeddings) == len(df) else embeddings
        df['embedding'] = sorted_embeddings
        df['exposure_score'] = 0
        
        # Deduplication
        print("[Deduplicator] Finding duplicates...")
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
                
                if sim > self.threshold:
                    # Mark j as duplicate
                    keep_mask[j] = False
                    # Increment exposure score for i
                    df.at[df.index[i], 'exposure_score'] += 1
                    print(f"  Duplicate: '{df.iloc[j]['raw_title'][:40]}...' -> Keeping '{df.iloc[i]['raw_title'][:40]}...'")
        
        # Filter and clean
        result_df = df[keep_mask].drop(columns=['embedding', 'priority'])
        result = result_df.to_dict('records')
        
        print(f"[Deduplicator] Reduced to {len(result)} unique articles.")
        return result
