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

from ..config import SOURCE_PRIORITY, SIMILARITY_THRESHOLD, MODEL_EMBEDDING, MODEL_FLASH

# ... (rest of imports)

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

    def _extract_event_details(self, text: str) -> dict:
        """
        Stage 2: Extract structured event details using LLM.
        """
        prompt = f"""
        Extract the following details from the news text below:
        1. entities: List of main companies, labs, or key figures (e.g., "OpenAI", "Google DeepMind")
        2. event_type: One of [Launch, Research, Funding, Partnership, Regulation, Other]
        3. product_name: Specific product or model name (e.g., "GPT-5", "Sora")
        4. date: Event date if mentioned (YYYY-MM-DD)

        Output JSON only:
        {{
            "entities": ["..."],
            "event_type": "...",
            "product_name": "...",
            "date": "..."
        }}

        Text: {text[:2000]}
        """
        try:
            model = genai.GenerativeModel(MODEL_FLASH)
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            return json.loads(response.text)
        except Exception as e:
            print(f"[Deduplicator] Extraction failed: {e}")
            return {}

    def _check_logical_match(self, d1: dict, d2: dict) -> bool:
        """
        Stage 3: Logical verification.
        Returns True if at least 2 conditions match.
        """
        matches = 0
        
        # 1. Entity Match (Overlap)
        ents1 = set(e.lower() for e in d1.get('entities', []))
        ents2 = set(e.lower() for e in d2.get('entities', []))
        if ents1 & ents2:
            matches += 1
            
        # 2. Event Type Match
        if d1.get('event_type') == d2.get('event_type') and d1.get('event_type') != "Other":
            matches += 1
            
        # 3. Product Name Match
        p1 = (d1.get('product_name') or '').lower()
        p2 = (d2.get('product_name') or '').lower()
        if p1 and p2 and (p1 in p2 or p2 in p1):
            matches += 1
            
        # 4. Date Match (Exact)
        if d1.get('date') and d2.get('date') and d1['date'] == d2['date']:
            matches += 1
            
        return matches >= 2

    def run(self, articles: list, target_date: str = None) -> list:
        """
        Deduplicate articles using 4-stage pipeline.
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
        print("[Deduplicator] Finding duplicates (4-Stage: Bi-Encoder -> Extract -> Logic -> Cross-Encoder)...")
        keep_mask = [True] * len(df)
        duplicate_logs = []
        
        # Cache for extracted details to avoid re-running LLM
        details_cache = {}

        for i in range(len(df)):
            if not keep_mask[i]:
                continue
            
            vec_i = np.array(df.iloc[i]['embedding']).reshape(1, -1)
            
            for j in range(i + 1, len(df)):
                if not keep_mask[j]:
                    continue
                
                vec_j = np.array(df.iloc[j]['embedding']).reshape(1, -1)
                sim = cosine_similarity(vec_i, vec_j)[0][0]
                
                # STAGE 1: Recall (Bi-Encoder)
                # Check candidates with similarity > 0.92
                if sim > 0.92:
                    title1 = df.iloc[i]['raw_title']
                    title2 = df.iloc[j]['raw_title']
                    content1 = df.iloc[i].get('content') or df.iloc[i].get('raw_content') or title1
                    content2 = df.iloc[j].get('content') or df.iloc[j].get('raw_content') or title2
                    
                    print(f"  [Stage 1] High Sim: {sim:.4f} ('{title2[:30]}...' vs '{title1[:30]}...')")
                    
                    # STAGE 2: Extraction (LLM)
                    if i not in details_cache:
                        details_cache[i] = self._extract_event_details(content1)
                    if j not in details_cache:
                        details_cache[j] = self._extract_event_details(content2)
                        
                    d1 = details_cache[i]
                    d2 = details_cache[j]
                    
                    # STAGE 3: Logical Verification
                    is_logical_match = self._check_logical_match(d1, d2)
                    
                    if not is_logical_match:
                        print(f"    [-] Logical Mismatch. Keeping.")
                        continue
                        
                    print(f"    [+] Logical Match! Proceeding to Verification.")

                    # STAGE 4: Final Confirmation (Cross-Encoder)
                    is_duplicate, ce_score = self._is_duplicate_cross_encoder(title1, title2)
                    
                    # Higher threshold for Cross-Encoder
                    if ce_score > 0.95:
                        # Mark j as duplicate
                        keep_mask[j] = False
                        # Increment exposure score for i
                        df.at[df.index[i], 'exposure_score'] += 1
                        
                        duplicate_info = {
                            "dropped_article": title2,
                            "kept_article": title1,
                            "similarity_score": float(sim),
                            "cross_encoder_score": ce_score,
                            "logic_details": {"d1": d1, "d2": d2},
                            "dropped_source": df.iloc[j]['source_name'],
                            "kept_source": df.iloc[i]['source_name'],
                            "verification": "4-Stage Logic + CE"
                        }
                        duplicate_logs.append(duplicate_info)
                        print(f"    [+] Duplicate Confirmed (Score: {ce_score:.4f}). Dropping.")
                    else:
                        print(f"    [-] CE Score Low ({ce_score:.4f}). Keeping.")
        
        # Filter and clean
        result_df = df[keep_mask].drop(columns=['embedding', 'priority'])
        result = result_df.to_dict('records')
        
        # Save Deduplication Log
        log_data = {
            "target_date": target_date,
            "total_articles_processed": len(df),
            "unique_articles_count": len(result),
            "duplicates_removed_count": len(duplicate_logs),
            "duplicates_details": duplicate_logs
        }
        
        try:
            # Save to backend/data if possible, else current dir
            date_suffix = f"_{target_date}" if target_date else ""
            log_filename = f"deduplication_log_{int(time.time())}{date_suffix}.json"
            log_path = os.path.join(os.getcwd(), 'backend', 'data', log_filename)
            
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, ensure_ascii=False, indent=2)
            print(f"[Deduplicator] Log saved to {log_path}")
        except Exception as e:
            print(f"[Deduplicator] Failed to save log: {e}")
        
        print(f"[Deduplicator] Reduced to {len(result)} unique articles.")
        return result
