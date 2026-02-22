"""
Scorer & Tagger (Combined Step 3 + 4)
- Calculates impact scores using Gemini 2.5 Pro
- Tags articles with categories, services, core elements using Gemini 2.5 Flash
- Generates why_it_matters for Top K articles only
"""

import os
import json
import time
import re
import google.generativeai as genai
from dotenv import load_dotenv

from ..config import (
    MODEL_PRO, MODEL_FLASH, TOP_K_WHY_IT_MATTERS,
    CATEGORY_MAP, SERVICE_MAP, CORE_MAP, get_allowed_tags
)

# Load environment
from pathlib import Path
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


class ScorerTagger:
    """Scores and tags news articles."""
    
    def __init__(self):
        self.pro_model = genai.GenerativeModel(MODEL_PRO)
        self.flash_model = genai.GenerativeModel(MODEL_FLASH)
        self.top_k = TOP_K_WHY_IT_MATTERS
        self.allowed_tags = get_allowed_tags()
    
    def _generate_with_retry(self, model, prompt, retries=3, delay=5):
        """Generate content with retry logic."""
        for attempt in range(retries):
            try:
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                result = json.loads(response.text)
                if isinstance(result, list):
                    result = result[0] if result else {}
                return result
            except Exception as e:
                print(f"    ⚠️ API Call failed (Attempt {attempt+1}/{retries}): {e}")
                if "429" in str(e):
                    time.sleep(delay * (attempt + 1) * 2)
                else:
                    time.sleep(delay)
        raise Exception("Max retries exceeded")
    
    def _create_scoring_prompt(self, article: dict) -> str:
        """Create prompt for impact scoring."""
        return f"""
You are an expert AI news analyst. Analyze this article and calculate its impact score.

Title: {article.get('raw_title', '')}
Content: {str(article.get('raw_content', ''))[:3000]}
Source: {article.get('source_name', '')}

Calculate the impact score based on these criteria (each 0-25):
- industry: Industry-wide impact (disruption, market changes)
- tech: Technical significance (innovation, breakthrough)
- reach: Audience reach and public interest
- longTerm: Long-term implications
- socialEthics: Social/ethical considerations

Output JSON:
{{
  "impactScore": <total 0-100>,
  "impactDetails": {{
    "industry": <0-25>,
    "tech": <0-25>,
    "reach": <0-25>,
    "longTerm": <0-25>,
    "socialEthics": <0-25>
  }}
}}
"""
    
    def _create_tagging_prompt(self, article: dict, include_why: bool) -> str:
        """Create prompt for tagging and optional why_it_matters generation."""
        why_instruction = ""
        why_output = '"why_it_matters": null,'
        
        if include_why:
            why_instruction = """
- why_it_matters: Write 1-2 sentences explaining why this news is significant for AI industry professionals.
"""
            why_output = '"why_it_matters": "...",'
        
        return f"""
You are an expert AI news editor. Analyze this article and extract metadata.

Title: {article.get('raw_title', '')}
Content: {str(article.get('raw_content', ''))[:3000]}
Source: {article.get('source_name', '')}

[Strict Tagging Rules]
Select tags ONLY from these lists:
- categories: {json.dumps(self.allowed_tags['categories'])}
- productServices: {json.dumps(self.allowed_tags['productServices'])}
- coreElements: {json.dumps(self.allowed_tags['coreElements'])}

[Required Output]
- title: Clean, professional English title (paraphrase if needed)
- summary: 2-3 sentence factual summary in English
- searchKeywords: 3-5 relevant search keywords in English
{why_instruction}

Output JSON:
{{
  "title": "...",
  "summary": "...",
  {why_output}
  "categories": ["..."],
  "productServices": ["..."],
  "coreElements": ["..."],
  "searchKeywords": ["..."]
}}
"""
    
    def _filter_tags(self, data: dict) -> dict:
        """Filter tags to only include valid ones from the allowed lists."""
        # Filter categories
        if 'categories' in data:
            data['categories'] = [c for c in data['categories'] if c in CATEGORY_MAP]
        
        # Filter productServices
        if 'productServices' in data:
            data['productServices'] = [s for s in data['productServices'] if s in SERVICE_MAP]
        
        # Filter coreElements
        if 'coreElements' in data:
            data['coreElements'] = [e for e in data['coreElements'] if e in CORE_MAP]
        
        return data
    
    def _score_with_grok(self, article: dict) -> float:
        """Score article using Grok 4.1 (xAI)."""
        xai_key = os.getenv("XAI_API_KEY")
        if not xai_key:
            print("    [Grok] No API Key found.")
            return 0
            
        import requests
        
        prompt = self._create_scoring_prompt(article)
        
        try:
            response = requests.post(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {xai_key}"
                },
                json={
                    "messages": [
                        {"role": "system", "content": "You are an expert AI news analyst. Respond only with JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "model": "grok-4-1-fast-reasoning",
                    "stream": False,
                    "temperature": 0.1
                },
                timeout=45
            )
            
            if response.status_code == 200:
                content = response.json()['choices'][0]['message']['content']
                # Clean markdown code blocks if present
                content = content.replace('```json', '').replace('```', '').strip()
                data = json.loads(content)
                return float(data.get('impactScore', 0))
            else:
                print(f"    [Grok] API Error: {response.status_code} - {response.text}")
                return 0
        except Exception as e:
            print(f"    [Grok] Request failed: {e}")
            return 0

    def run(self, articles: list) -> list:
        """
        Score and tag all articles.
        
        Args:
            articles: List of article dicts with raw_title, raw_content, etc.
            
        Returns:
            List with impactScore, impactDetails, tags, and why_it_matters added.
        """
        if not articles:
            return []
        
        results = []
        
        # Step 1: Score all articles using Pro model
        print(f"[ScorerTagger] Scoring {len(articles)} articles with {MODEL_PRO}...")
        
        for i, article in enumerate(articles):
            print(f"  [{i+1}/{len(articles)}] Scoring: {article.get('raw_title', '')[:40]}...")
            try:
                # 1. Gemini Scoring
                prompt = self._create_scoring_prompt(article)
                score_data = self._generate_with_retry(self.pro_model, prompt)
                
                gemini_score = score_data.get('impactScore', 0)
                
                # Exposure Bonus (applied to gemini_score first)
                exposure = article.get('exposure_score', 0)
                gemini_score = min(100, gemini_score + exposure * 2)
                
                article['gemini_score'] = gemini_score
                article['impactDetails'] = score_data.get('impactDetails', {})
                article['impactDetails']['exposure_score'] = exposure
                
                # 2. Multi-Model Refinement (Grok)
                final_score = gemini_score
                grok_score_1 = 0
                grok_score_2 = 0
                
                if gemini_score >= 85:
                    print(f"    [+] High Impact ({gemini_score}). Refining with Grok...")
                    grok_score_1 = self._score_with_grok(article)
                    time.sleep(5)
                    grok_score_2 = self._score_with_grok(article)
                    
                    if grok_score_1 > 0 and grok_score_2 > 0:
                        avg_score = (gemini_score + grok_score_1 + grok_score_2) / 3
                        final_score = avg_score
                        print(f"    [=] Refined Score: {final_score:.1f} (Gemini: {gemini_score}, Grok: {grok_score_1}, {grok_score_2})")
                    else:
                        print(f"    [!] Grok scoring failed. Reverting to Gemini score.")
                
                article['grok_score_1'] = grok_score_1
                article['grok_score_2'] = grok_score_2
                article['impactScore'] = final_score
                
                time.sleep(2)
                
            except Exception as e:
                print(f"    ❌ Error scoring: {e}")
                article['gemini_score'] = 0
                article['grok_score_1'] = 0
                article['grok_score_2'] = 0
                article['impactScore'] = 0
                article['impactDetails'] = {"industry": 0, "tech": 0, "reach": 0, "longTerm": 0, "socialEthics": 0}
        
        # Sort by impact score
        articles.sort(key=lambda x: x.get('impactScore', 0), reverse=True)
        
        # Step 2: Tag all articles using Flash model
        print(f"[ScorerTagger] Tagging {len(articles)} articles with {MODEL_FLASH}...")
        
        for i, article in enumerate(articles):
            is_top = i < self.top_k
            icon = "⭐" if is_top else "📝"
            print(f"  [{i+1}/{len(articles)}] {icon} Tagging: {article.get('raw_title', '')[:40]}...")
            
            try:
                prompt = self._create_tagging_prompt(article, include_why=is_top)
                tag_data = self._generate_with_retry(self.flash_model, prompt)
                
                # Filter tags
                tag_data = self._filter_tags(tag_data)
                
                # Merge data
                article['title'] = tag_data.get('title') or article.get('raw_title', '')
                
                # Summary fallback
                summary = tag_data.get('summary')
                if not summary:
                     # Fallback to raw content if summary is empty
                     raw = article.get('raw_content', '')
                     # Clean up formatting for fallback
                     summary = raw.replace('\n', ' ').strip()[:500]
                article['summary'] = summary
                
                article['why_it_matters'] = tag_data.get('why_it_matters') if is_top else None
                article['categories'] = tag_data.get('categories', [])
                article['productServices'] = tag_data.get('productServices', [])
                article['coreElements'] = tag_data.get('coreElements', [])
                article['searchKeywords'] = tag_data.get('searchKeywords', [])
                
                results.append(article)
                time.sleep(1)
                
            except Exception as e:
                print(f"    ❌ Error tagging: {e}")
                article['title'] = article.get('raw_title', '')
                # Fallback on error
                raw = article.get('raw_content', '')
                article['summary'] = raw.replace('\n', ' ').strip()[:500]
                article['why_it_matters'] = None
                article['categories'] = []
                article['productServices'] = []
                article['coreElements'] = []
                article['searchKeywords'] = []
                results.append(article)
        
        print(f"[ScorerTagger] Completed scoring and tagging.")
        return results