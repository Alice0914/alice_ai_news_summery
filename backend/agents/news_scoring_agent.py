
import os
import json
import time
import re
import google.generativeai as genai
import pandas as pd
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class NewsScoringAgent:
    """
    Agent to calculate impact scores and enrich news articles.
    """
    def __init__(self):
        # Configure models based on User Request
        # "gemini-3-pro" requested -> mapped to available high-reasoning model "gemini-2.5-pro"
        self.pro_model_name = "gemini-2.5-pro" 
        # "gemini-2.5-flash" requested -> mapped to available fast model "gemini-2.5-flash"
        self.flash_model_name = "gemini-2.5-flash"
        
        self.pro_model = genai.GenerativeModel(self.pro_model_name)
        self.flash_model = genai.GenerativeModel(self.flash_model_name)

    def _generate_with_retry(self, model, prompt, retries=3, delay=5):
        """Helper to generate content with retry logic."""
        for attempt in range(retries):
            try:
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                return json.loads(response.text)
            except Exception as e:
                print(f"    ⚠️ API Call failed (Attempt {attempt+1}/{retries}): {e}")
                if "429" in str(e):
                    time.sleep(delay * (attempt + 1) * 2) # Exponential backoff for rate limit
                else:
                    time.sleep(delay)
        raise Exception("Max retries exceeded")

    def calculate_impact_scores(self, articles: list) -> list:
        """
        Calculate impact scores for all articles using the Pro model.
        Returns the list of articles with 'impactScore' and 'impactDetails' added.
        """
        if not articles:
            return []
            
        print(f"Calculating Impact Scores for {len(articles)} articles using {self.pro_model_name}...")
        
        results = []
        
        for i, article in enumerate(articles):
            print(f"  [{i+1}/{len(articles)}] Scoring: {article.get('raw_title')[:30]}...")
            try:
                prompt = self._create_impact_prompt(article)
                score_data = self._generate_with_retry(self.pro_model, prompt)
                
                # Merge Score Data
                article['impactScore'] = score_data.get('impactScore', 0)
                article['impactDetails'] = score_data.get('impactDetails', {})
                
                # Apply Duplicate Count Bonus
                bonus = article.get('duplicate_count', 0) * 2
                article['impactScore'] = min(100, article['impactScore'] + bonus)
                
                results.append(article)
                time.sleep(2) # Base Rate limit sleep
                
            except Exception as e:
                print(f"    ❌ Error scoring article: {e}")
                # Fallback defaults
                article['impactScore'] = 0
                article['impactDetails'] = {
                    "industry": 0, "tech": 0, "reach": 0, "longTerm": 0, "socialEthics": 0
                }
                results.append(article)
                
        # Sort by Impact Score
        results.sort(key=lambda x: x['impactScore'], reverse=True)
        return results

    def enrich_articles(self, articles: list, top_k: int = 10) -> list:
        """
        Enrich ALL articles with Metadata using Flash model.
        Top K articles get 'why_it_matters' populated.
        Others get 'why_it_matters': None.
        """
        enriched_results = []
        
        print(f"Enriching {len(articles)} articles using {self.flash_model_name}...")
        
        for i, article in enumerate(articles):
            is_top = i < top_k
            status_icon = "⭐" if is_top else "📝"
            print(f"  [{i+1}/{len(articles)}] {status_icon} Enriching: {article.get('raw_title')[:30]}...")
            
            try:
                prompt = self._create_enrichment_prompt(article, include_why=is_top)
        """
