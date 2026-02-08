
import os
import json
import time
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class VerificationAgent:
    """
    Agent to verify and re-format news articles from an existing JSON file.
    Input: JSON file path containing list of articles with 'raw_content'.
    Output: Verified and formatted JSON list matching strict schema.
    """
    
    # Predefined Maps based on frontend constants
    CATEGORY_MAP = {
        "Business": "비즈니스",
        "Finance/Investment": "금융/투자",
        "Healthcare/Science": "의료/과학",
        "Entertainment/Creative": "엔터테인먼트",
        "Education": "교육",
        "Society/Policy": "사회/정책",
        "Hardware": "하드웨어",
        "Lifestyle": "라이프스타일",
        "Defense/Security": "국방/보안",
        "Robotics/Physical AI": "로보틱스/물리 AI",
        "Research/Innovation": "연구/혁신",
        "Energy/Environment": "에너지/환경",
        "Tech/AI": "테크/AI",
        "Economy": "경제",
        "Automotive": "자동차",
        "Infrastructure": "인프라",
        "Technology": "기술"
    }

    SERVICE_MAP = {
        "Text AI": "텍스트 AI",
        "Image AI": "이미지 AI",
        "Video AI": "동영상 AI",
        "Voice AI": "음성 AI",
        "Agent AI": "에이전트 AI",
        "Automation AI": "자동화 AI",
        "Multimodal AI": "멀티모달 AI",
        "Vibe Coding AI": "바이브 코딩 AI",
        "Robotics": "로보틱스",
        "Edge/On-Device AI": "엣지/온디바이스 AI",
        "Wearable AI": "웨어러블 AI",
        "Autonomous Driving AI": "자율주행 AI",
        "Generative AI": "생성형 AI",
        "Database/Storage": "데이터베이스/스토리지"
    }

    CORE_MAP = {
        "Data": "데이터",
        "Algorithm": "알고리즘",
        "Computing": "컴퓨팅",
        "Safety/Ethics": "안전/윤리"
    }

    def __init__(self):
        # Use high-quality model for verification (verified available in env)
        self.model_name = "gemini-2.5-pro" 
        self.model = genai.GenerativeModel(self.model_name)

    def verify_and_format(self, input_path: str, output_path: str):
        """
        Load JSON, process each article to match output format, and save.
        """
        print(f"Loading input file: {input_path}")
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                articles = json.load(f)
        except Exception as e:
            print(f"Error loading file: {e}")
            return

        print(f"Found {len(articles)} articles. Starting verification...")
        
        verified_results = []
        
        for i, article in enumerate(articles):
            print(f"[{i+1}/{len(articles)}] Verifying: {article.get('title', 'No Title')}...")
            
            # Use raw_content if available, else summary/content
            content_to_verify = article.get('raw_content') or article.get('content') or article.get('summary')
            if not content_to_verify:
                print("  ⚠️ No content found, skipping.")
                continue
                
            try:
                prompt = self._create_verification_prompt(article, content_to_verify)
                verified_data = self._generate_with_retry(prompt)
                
                # Apply Korean Mapping (Strict Enforcement)
                verified_data = self._map_tags_to_korean(verified_data)

                # Fallback for ID if missing in verified data
                if 'id' not in verified_data:
                    # Generate ID
                     clean_source = re.sub(r'[^a-zA-Z0-9]', '', article.get('source_name', 'Source'))
                     clean_date = re.sub(r'[^a-zA-Z0-9]', '', str(article.get('date', '')))
                     title_slug = re.sub(r'[^a-zA-Z0-9]', '', article.get('title', '')[:20])
                     verified_data['id'] = f"{clean_source}-{clean_date}-{title_slug}".lower()

                verified_results.append(verified_data)
                time.sleep(2) # Rate limit safety
                
            except Exception as e:
                print(f"  ❌ Error verifying article: {e}")
                continue

        # Save Output
        print(f"Saving {len(verified_results)} verified articles to {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(verified_results, f, indent=2, ensure_ascii=False)

    def _generate_with_retry(self, prompt, retries=3):
        for attempt in range(retries):
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                return json.loads(response.text)
            except Exception as e:
                print(f"    ⚠️ API Error (Attempt {attempt+1}): {e}")
                time.sleep(4 * (attempt + 1))
        raise Exception("Max retries exceeded")

    def _create_verification_prompt(self, article, content):
        allowed_categories = list(self.CATEGORY_MAP.keys())
        allowed_services = list(self.SERVICE_MAP.keys())
        allowed_core = list(self.CORE_MAP.keys())

        return f"""
        You are an Expert AI Tech Editor. Verify and format this news article.
        
        Input Data:
        - Original Title: {article.get('title')}
        - Raw Content: {str(content)[:4000]}
        - Date: {article.get('date')}
        
        [STRICT TAGGING RULES]
        You MUST select tags ONLY from the following allowed lists.
        1. Categories: {json.dumps(allowed_categories)}
        2. Product/Services: {json.dumps(allowed_services)}
        3. Core Elements: {json.dumps(allowed_core)}
        
        DO NOT Invent new tags. If nothing fits perfect, choose the closest broad match.
        Multiple tags are allowed.
        
        [Generation Task]
        1. Verify facts against Raw Content.
        2. Generate title/summary in English (natural style).
        3. Generate title/summary in Korean (natural style).
        4. Select appropriate tags from the lists above.
        
        [Output Format JSON]
        {{
          "id": "generated-unique-id-slug", 
          "title": "Natural English Title",
          "title_ko": "Natural Korean Title",
          "summary": "2-line English summary",
          "summary_ko": "2-line Korean summary",
          "why_it_matters": "1-line English significance",
          "why_it_matters_ko": "1-line Korean significance",
          "source": "{article.get('source_name')}",
          "sourceUrl": "{article.get('source_url') or article.get('url')}",
          "publishedDate": "{article.get('date')}",
          "likes": 0,
          "viewCount": 0,
          "shareCount": 0,
          "impactScore": {article.get('impactScore', 0)},
          "impactDetails": {json.dumps(article.get('impactDetails', {}))},
          "categories": ["Tech/AI"], 
          "productServices": ["Generative AI"],
          "coreElements": ["Data"],
          "searchKeywords": ["keyword1"],
          "searchKeywords_ko": ["키워드1"]
        }}
        """

    def _map_tags_to_korean(self, data):
        """Helper to append Korean tag fields based on English selection and STRICTLY filter invalid English tags."""
        
        # Categories
        valid_cats = []
        valid_cats_ko = []
        for c in data.get('categories', []):
            if c in self.CATEGORY_MAP:
                valid_cats.append(c)
                valid_cats_ko.append(self.CATEGORY_MAP[c])
        data['categories'] = valid_cats
        data['categories_ko'] = valid_cats_ko

        # Services
        valid_svcs = []
        valid_svcs_ko = []
        for s in data.get('productServices', []):
            if s in self.SERVICE_MAP:
                valid_svcs.append(s)
                valid_svcs_ko.append(self.SERVICE_MAP[s])
        data['productServices'] = valid_svcs
        data['productServices_ko'] = valid_svcs_ko

        # Core
        valid_cores = []
        valid_cores_ko = []
        for c in data.get('coreElements', []):
            if c in self.CORE_MAP:
                valid_cores.append(c)
                valid_cores_ko.append(self.CORE_MAP[c])
        data['coreElements'] = valid_cores
        data['coreElements_ko'] = valid_cores_ko
        
        return data

if __name__ == "__main__":
    # Test execution - Re-verifying to fix tags
    input_file = "backend/notebook/final_news_verified_20260130.json"
    output_file = "backend/notebook/final_news_reverified_20260130.json"
    
    agent = VerificationAgent()
    agent.verify_and_format(input_file, output_file)
