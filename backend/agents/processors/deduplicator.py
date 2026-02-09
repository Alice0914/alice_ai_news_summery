# backend/agents/processors/deduplicator.py
"""
Deduplicator
Uses embeddings to find and remove duplicate news articles,
keeping the most authoritative source and tracking exposure_score.
"""

import os
import time
import json
import numpy as np
import pandas as pd
import google.generativeai as genai
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

from ..config import SOURCE_PRIORITY, SIMILARITY_THRESHOLD, MODEL_EMBEDDING

# Load environment
from pathlib import Path
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


class Deduplicator:
    """Deduplicates news articles using semantic similarity."""
    
    def __init__(self):
        self.model_name = MODEL_EMBEDDING
        self.priority_map = SOURCE_PRIORITY
        self.threshold = SIMILARITY_THRESHOLD
        
        if not os.getenv("GOOGLE_API_KEY"):
            print("[Deduplicator] [WARN] GOOGLE_API_KEY not found in environment!")
            
        # Initialize CrossEncoder for Stage 2
        try:
            from sentence_transformers import CrossEncoder
            print("[Deduplicator] Loading CrossEncoder model: cross-encoder/stsb-roberta-large...")
            self.cross_encoder = CrossEncoder('cross-encoder/stsb-roberta-large')
        except Exception as e:
            print(f"[Deduplicator] Failed to load CrossEncoder: {e}")
            self.cross_encoder = None
    
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
                import traceback
                traceback.print_exc()
                print(f"[Deduplicator] Error getting embeddings: {e}")
                embeddings.extend([None] * len(batch))
        
        return embeddings
    
    def _get_priority(self, row) -> int:
        """Get source priority for an article."""
        p = self.priority_map.get(row.get('source_name'))
        if p:
            return p
        return self.priority_map.get("Unknown", 1)
    
    def _is_duplicate_cross_encoder(self, text1: str, text2: str) -> tuple:
        """
        Stage 2: Cross-Encoder verification.
        Returns (is_duplicate: bool, score: float).
        """
        if not self.cross_encoder:
            # Fallback if model failed to load
            return True, 1.0
            
        try:
            # Predict returns a score between 0 and 1
            score = self.cross_encoder.predict([(text1, text2)])[0]
            print(f"    [?] Cross-Encoder Score: {score:.4f}")
            return score >= 0.75, float(score)
        except Exception as e:
            print(f"[Deduplicator] Cross-Encoder check failed: {e}")
            return True, 1.0

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
        print("[Deduplicator] Generating embeddings (Bi-Encoder)...")
        titles = df['raw_title'].tolist()
        embeddings = self._get_embeddings(titles)
        
        # Filter out failed embeddings
        valid_indices = [i for i, e in enumerate(embeddings) if e is not None]
        df = df.iloc[valid_indices].copy()
        embeddings = [embeddings[i] for i in valid_indices]
        
        if not embeddings:
            print("[Deduplicator] [x] No embeddings generated (API Error?). Bypassing deduplication.")
            # Fallback: return original articles
            for article in articles:
                article['exposure_score'] = 1
            return articles
        
        # Add embeddings to DF BEFORE sorting to keep alignment
        df['embedding'] = embeddings
        
        # Add priority and sort
        df['priority'] = df.apply(self._get_priority, axis=1)
        df = df.sort_values('priority', ascending=False).reset_index(drop=True)
        
        df['exposure_score'] = 0
        
        # Deduplication
        print("[Deduplicator] Finding duplicates (Two-Stage: Bi-Encoder + Cross-Encoder)...")
        keep_mask = [True] * len(df)
        duplicate_logs = []
        
        for i in range(len(df)):
            if not keep_mask[i]:
                continue
            
            vec_i = np.array(df.iloc[i]['embedding']).reshape(1, -1)
            
            for j in range(i + 1, len(df)):
                if not keep_mask[j]:
                    continue
                
                vec_j = np.array(df.iloc[j]['embedding']).reshape(1, -1)
                sim = cosine_similarity(vec_i, vec_j)[0][0]
                
                # STAGE 1: Fast Filter (Bi-Encoder)
                # Check candidates with similarity > 0.85
                if sim > 0.85:
                    title1 = df.iloc[i]['raw_title']
                    title2 = df.iloc[j]['raw_title']
                    
                    print(f"  Bi-Encoder Sim: {sim:.4f} ('{title2[:30]}...' vs '{title1[:30]}...')")
                    
                    # STAGE 2: Verification (Cross-Encoder)
                    is_duplicate, ce_score = self._is_duplicate_cross_encoder(title1, title2)
                    
                    if is_duplicate:
                        # Mark j as duplicate
                        keep_mask[j] = False
                        # Increment exposure score for i
                        df.at[df.index[i], 'exposure_score'] += 1
                        
                        duplicate_info = {
                            "dropped_article": title2,
                            "kept_article": title1,
                            "similarity_score": float(sim),
                            "cross_encoder_score": ce_score,
                            "dropped_source": df.iloc[j]['source_name'],
                            "kept_source": df.iloc[i]['source_name'],
                            "verification": "Cross-Encoder"
                        }
                        duplicate_logs.append(duplicate_info)
                        print(f"    [+] Duplicate Confirmed. Dropping.")
                    else:
                        print(f"    [-] Different Content. Keeping.")
        
        # Filter and clean
        result_df = df[keep_mask].drop(columns=['embedding', 'priority'])
        result = result_df.to_dict('records')
        
        # Save Deduplication Log
        log_data = {
            "total_articles_processed": len(df),
            "unique_articles_count": len(result),
            "duplicates_removed_count": len(duplicate_logs),
            "duplicates_details": duplicate_logs
        }
        
        try:
            # Save to backend/data if possible, else current dir
            log_path = os.path.join(os.getcwd(), 'backend', 'data', f"deduplication_log_{int(time.time())}.json")
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, ensure_ascii=False, indent=2)
            print(f"[Deduplicator] Log saved to {log_path}")
        except Exception as e:
            print(f"[Deduplicator] Failed to save log: {e}")
        
        print(f"[Deduplicator] Reduced to {len(result)} unique articles.")
        return result
