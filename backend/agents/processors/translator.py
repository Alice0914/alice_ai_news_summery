"""
Translator
Translates English content to Korean and generates final output format.
Uses Gemini 2.5 Flash for efficient translation.
"""

import os
import json
import time
import re
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

from ..config import MODEL_FLASH, CATEGORY_MAP, SERVICE_MAP, CORE_MAP

# Load environment
from pathlib import Path
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


class Translator:
    """Translates articles to Korean and formats final output."""
    
    def __init__(self):
        self.model = genai.GenerativeModel(MODEL_FLASH)
    
    def _generate_with_retry(self, prompt, retries=3, delay=5):
        """Generate content with retry logic."""
        for attempt in range(retries):
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                return json.loads(response.text)
            except Exception as e:
                print(f"    ⚠️ API Call failed (Attempt {attempt+1}/{retries}): {e}")
                if "429" in str(e):
                    time.sleep(delay * (attempt + 1) * 2)
                else:
                    time.sleep(delay)
        raise Exception("Max retries exceeded")
    
    def _generate_id(self, title: str, date: str) -> str:
        """Generate a clean URL-safe ID from title."""
        # Clean title
        clean = re.sub(r'[^a-zA-Z0-9\s-]', '', title.lower())
        clean = re.sub(r'\s+', '-', clean.strip())
        clean = clean[:50]
        
        # Add date suffix if available
        if date:
            try:
                # Try to parse and format date
                for fmt in ['%Y-%m-%d', '%b %d, %Y', '%B %d, %Y']:
                    try:
                        dt = datetime.strptime(date, fmt)
                        date_suffix = dt.strftime('%Y%m%d')
                        return f"{clean}-{date_suffix}"
                    except:
                        continue
            except:
                pass
        
        return clean
    
    def _map_tags_to_korean(self, article: dict) -> dict:
        """Map English tags to Korean translations."""
        # Categories
        article['categories_ko'] = [
            CATEGORY_MAP.get(c, c) for c in article.get('categories', [])
        ]
        
        # Product Services
        article['productServices_ko'] = [
            SERVICE_MAP.get(s, s) for s in article.get('productServices', [])
        ]
        
        # Core Elements
        article['coreElements_ko'] = [
            CORE_MAP.get(e, e) for e in article.get('coreElements', [])
        ]
        
        return article
    
    def _create_translation_prompt(self, article: dict) -> str:
        """Create prompt for Korean translation."""
        has_why = article.get('why_it_matters') is not None
        
        why_instruction = ""
        why_output = '"why_it_matters_ko": null,'
        
        if has_why:
            why_instruction = f"""
- why_it_matters: {article.get('why_it_matters', '')}
"""
            why_output = '"why_it_matters_ko": "...(Korean translation)...",'
        
        return f"""
You are a professional Korean translator. Translate the following content to natural Korean.

[Content to Translate]
- title: {article.get('title', '')}
- summary: {article.get('summary', '')}
{why_instruction}
- searchKeywords: {json.dumps(article.get('searchKeywords', []))}

[Rules]
- Use natural, professional Korean
- Keep technical terms in English when commonly used (e.g., AI, LLM, GPT)
- Translate search keywords to Korean equivalents

Output JSON:
{{
  "title_ko": "...",
  "summary_ko": "...",
  {why_output}
  "searchKeywords_ko": ["..."]
}}
"""
    
    def _normalize_date(self, date_str: str) -> str:
        """Normalize date to YYYY-MM-DD format."""
        if not date_str:
            return datetime.now().strftime('%Y-%m-%d')
        
        formats = ['%Y-%m-%d', '%b %d, %Y', '%B %d, %Y', '%m/%d/%Y', '%d/%m/%Y']
        
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str.strip(), fmt)
                return dt.strftime('%Y-%m-%d')
            except:
                continue
        
        # If all fail, return original or today
        return date_str or datetime.now().strftime('%Y-%m-%d')
    
    def run(self, articles: list) -> list:
        """
        Translate articles to Korean and format final output.
        
        Args:
            articles: List of scored and tagged articles
            
        Returns:
            List of final formatted articles with Korean translations
        """
        if not articles:
            return []
        
        print(f"[Translator] Translating {len(articles)} articles to Korean...")
        
        results = []
        
        for i, article in enumerate(articles):
            print(f"  [{i+1}/{len(articles)}] Translating: {article.get('title', '')[:40]}...")
            
            try:
                # Translate
                prompt = self._create_translation_prompt(article)
                trans_data = self._generate_with_retry(prompt)
                
                # Map tag translations
                article = self._map_tags_to_korean(article)
                
                # Format final output
                final_article = {
                    "id": self._generate_id(article.get('title', ''), article.get('date', '')),
                    "title": article.get('title', ''),
                    "title_ko": trans_data.get('title_ko', ''),
                    "summary": article.get('summary', ''),
                    "summary_ko": trans_data.get('summary_ko', ''),
                    "why_it_matters": article.get('why_it_matters'),
                    "why_it_matters_ko": trans_data.get('why_it_matters_ko'),
                    "source": article.get('source_name', ''),
                    "sourceUrl": article.get('source_url', ''),
                    "publishedDate": self._normalize_date(article.get('date', '')),
                    "likes": 0,
                    "viewCount": 0,
                    "shareCount": 0,
                    "impactScore": article.get('impactScore', 0),
                    "impactDetails": article.get('impactDetails', {}),
                    "categories": article.get('categories', []),
                    "categories_ko": article.get('categories_ko', []),
                    "productServices": article.get('productServices', []),
                    "productServices_ko": article.get('productServices_ko', []),
                    "coreElements": article.get('coreElements', []),
                    "coreElements_ko": article.get('coreElements_ko', []),
                    "searchKeywords": article.get('searchKeywords', []),
                    "searchKeywords_ko": trans_data.get('searchKeywords_ko', [])
                }
                
                results.append(final_article)
                time.sleep(1)
                
            except Exception as e:
                print(f"    ❌ Error translating: {e}")
                # Fallback: add with empty Korean fields
                article = self._map_tags_to_korean(article)
                fallback = {
                    "id": self._generate_id(article.get('title', ''), article.get('date', '')),
                    "title": article.get('title', ''),
                    "title_ko": "",
                    "summary": article.get('summary', ''),
                    "summary_ko": "",
                    "why_it_matters": article.get('why_it_matters'),
                    "why_it_matters_ko": None,
                    "source": article.get('source_name', ''),
                    "sourceUrl": article.get('source_url', ''),
                    "publishedDate": self._normalize_date(article.get('date', '')),
                    "likes": 0,
                    "viewCount": 0,
                    "shareCount": 0,
                    "impactScore": article.get('impactScore', 0),
                    "impactDetails": article.get('impactDetails', {}),
                    "categories": article.get('categories', []),
                    "categories_ko": article.get('categories_ko', []),
                    "productServices": article.get('productServices', []),
                    "productServices_ko": article.get('productServices_ko', []),
                    "coreElements": article.get('coreElements', []),
                    "coreElements_ko": article.get('coreElements_ko', []),
                    "searchKeywords": article.get('searchKeywords', []),
                    "searchKeywords_ko": []
                }
                results.append(fallback)
        
        print(f"[Translator] Translation complete.")
        return results