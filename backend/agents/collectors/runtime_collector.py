"""
Runtime News Collector (The Rundown / The Neuron)
Wraps the AINewsAgent to scrape therundown.ai archive.
"""

import sys
import os
import re
import json
import time
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from dotenv import load_dotenv

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    HAS_SELENIUM = True
except ImportError:
    HAS_SELENIUM = False
    print("[Warning] Selenium not installed. Install with: pip install selenium")

# Ensure backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

try:
    from .base_collector import BaseCollector
except ImportError:
    # Fallback for standalone testing
    class BaseCollector:
        def __init__(self, start_date, end_date):
            self.start_date = start_date
            self.end_date = end_date
        def run(self): pass

# Load environment variables
_current_dir = os.path.dirname(os.path.abspath(__file__))
_root_dir = os.path.abspath(os.path.join(_current_dir, '..', '..', '..'))
_env_path = os.path.join(_root_dir, '.env')
_env_local_path = os.path.join(_root_dir, '.env.local')

if os.path.exists(_env_local_path):
    print(f"[RuntimeCollector] Loading env from {_env_local_path}")
    load_dotenv(_env_local_path)
elif os.path.exists(_env_path):
    print(f"[RuntimeCollector] Loading env from {_env_path}")
    load_dotenv(_env_path)
else:
    print("[RuntimeCollector] Warning: No .env or .env.local found")


class AINewsAgent:
    """
    AI News extraction agent that scrapes therundown.ai archive
    and extracts individual news items using Gemini API.
    """
    
    def __init__(self, start_date: str, end_date: str):
        """
        Initialize the agent with date range.
        
        Args:
            start_date: Start date in YYYY-MM-DD format (older date)
            end_date: End date in YYYY-MM-DD format (newer date)
        """
        self.start_date = start_date
        self.end_date = end_date
        
        # Configure Gemini API
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            print("[Warning] GOOGLE_API_KEY not found. Extraction will fail.")
        elif HAS_GENAI:
            genai.configure(api_key=api_key)
            # Using 2.0-flash or 1.5-flash (2.5-flash is likely a typo in original)
            self.model = genai.GenerativeModel("gemini-2.0-flash")
        
        # Try to use cloudscraper, fallback to requests
        try:
            import cloudscraper
            self.scraper = cloudscraper.create_scraper()
        except ImportError:
            self.scraper = requests.Session()
            self.scraper.headers.update({'User-Agent': 'Mozilla/5.0'})
    
    def _extract_date(self, text: str) -> str | None:
        """Extract date from text."""
        if not text:
            return None
        months = r'(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec)'
        text_format = rf'{months}\s+\d{{1,2}},?\s+\d{{4}}'
        numeric_format = r'(\d{4}[-./]\d{1,2}[-./]\d{1,2})'
        combined = f'({text_format}|{numeric_format})'
        match = re.search(combined, text, re.IGNORECASE)
        return match.group(0).strip() if match else None
    
    def _extract_date_from_url(self, url: str) -> str | None:
        """Extract YYYY-MM-DD date from URL."""
        match = re.search(r'(\d{4})-(\d{2})-(\d{2})', url)
        if match:
            y, m, d = match.groups()
            return f"{y}-{m}-{d}"
        return None
    
    def _normalize_date(self, date_str: str) -> str | None:
        """Normalize various date formats to YYYY-MM-DD."""
        if not date_str:
            return None
        if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
            return date_str
        
        month_map = {
            'january': '01', 'jan': '01', 'february': '02', 'feb': '02',
            'march': '03', 'mar': '03', 'april': '04', 'apr': '04',
            'may': '05', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07',
            'august': '08', 'aug': '08', 'september': '09', 'sep': '09',
            'october': '10', 'oct': '10', 'november': '11', 'nov': '11',
            'december': '12', 'dec': '12'
        }
        
        match = re.match(r'(\w+)\s+(\d{1,2}),?\s+(\d{4})', date_str, re.IGNORECASE)
        if match:
            month, day, year = match.groups()
            month_num = month_map.get(month.lower())
            if month_num:
                return f"{year}-{month_num}-{int(day):02d}"
        return date_str
    
    def _get_links_from_archive(self, page_num: int = 1) -> list:
        """Get article links from rundown.ai articles page using Selenium."""
        if not HAS_SELENIUM:
            print("[Error] Selenium is required for this collector. Install with: pip install selenium")
            return []
        
        # Build URL with pagination
        if page_num == 1:
            url = "https://www.rundown.ai/articles?category=AI"
        else:
            url = f"https://www.rundown.ai/articles?400ac562_page={page_num}&category=AI"
        
        print(f"  Fetching articles page {page_num} with Selenium...")
        
        driver = None
        try:
            # Setup Chrome options for headless browsing
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.get(url)
            
            # Wait for article links to load (wait for any article link)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/articles/']"))
            )
            
            # Additional wait for JavaScript to fully render
            time.sleep(2)
            
            # Get page source and parse with BeautifulSoup
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                # Match /articles/ pattern (new URL structure)
                if '/articles/' in href and href != '/articles' and '?category' not in href:
                    # Clean up the href - remove any duplicated base URL
                    if href.startswith('http'):
                        full_link = href
                    else:
                        full_link = f"https://www.rundown.ai{href}"
                    
                    # Ensure no duplicate base URL
                    full_link = full_link.replace('https://www.rundown.ai/articleshttps://', 'https://')
                    
                    if full_link not in links:
                        links.append(full_link)
            
            print(f"  Found {len(links)} article links")
            return links
            
        except Exception as e:
            print(f"Error fetching articles with Selenium: {e}")
            return []
        finally:
            if driver:
                driver.quit()
    
    def _extract_relevant_content(self, text: str) -> str:
        """Extract relevant content from newsletter.
        
        Exclusion rules:
        1. Exclude any section that starts with "PRESENTED BY"
        2. Exclude any article that starts with "TOGETHER WITH"
        3. Exclude any article that starts with "AI TRAINING"
        4. Exclude any article in the section "Trending AI Tools"
        5. Exclude any article in the section "Community AI workflows"
        6. Exclude any article in the section "Highlights: News, Guides & Events"
        7. Include all other articles, including those under "Everything else in AI today"
        """
        article_date = self._extract_date(text)
        
        exclude_section_markers = [
            "Trending AI Tools",
            "Community AI workflows",
            "Highlights: News, Guides & Events",
            "That's it for today!",
            "COMMUNITY",
            "QUICK HITS"
        ]
        
        exclude_item_markers = [
            "PRESENTED BY",
            "TOGETHER WITH",
            "AI TRAINING"
        ]
        
        # Company/section headers that indicate MAIN ARTICLES - should always include
        # These reset both skip_section and skip_item
        main_article_headers = [
            "OPENAI",
            "ANTHROPIC",
            "GOOGLE",
            "META",
            "MICROSOFT",
            "NVIDIA",
            "LATEST DEVELOPMENTS",
            "LATEST IN AI"
        ]
        
        # Other markers that indicate we should include content
        include_markers = [
            "Everything else in AI today"
        ]
        
        lines = text.split('\n')
        result_lines = []
        
        if article_date:
            result_lines.append(f"Date: {article_date}")
            result_lines.append("")
        
        skip_section = False
        skip_item = False
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            
            # Check if this is a main article header (company name)
            # These ALWAYS reset both skip flags and include the content
            if stripped in main_article_headers or any(stripped == h for h in main_article_headers):
                skip_section = False
                skip_item = False
                result_lines.append(line)
                continue
            
            # Check if this line starts an include section
            if any(m in stripped for m in include_markers):
                skip_section = False
                skip_item = False
                result_lines.append(line)
                continue
            
            if any(m in stripped for m in exclude_section_markers):
                skip_section = True
                continue
            
            # Check if this line starts an exclude item (temporary)
            if any(stripped.startswith(m) or m in stripped for m in exclude_item_markers):
                skip_item = True
                continue
            
            # Heuristic: Uppercase headers often indicate new content sections
            # Check if it looks like a new major section header
            if stripped.isupper() and len(stripped) > 2:
                # If it's not an exclude marker, consider it a potential article header
                if not any(m in stripped for m in exclude_section_markers + exclude_item_markers):
                    # Single uppercase word could be a company name
                    if ' ' not in stripped or stripped in main_article_headers:
                        skip_item = False
            
            if not stripped and not skip_section:
                skip_item = False
            
            if not skip_section and not skip_item:
                result_lines.append(line)
        
        return '\n'.join(result_lines)
    
    def _scrape_article(self, url: str) -> dict | None:
        """Scrape article content from URL with retry."""
        for attempt in range(3):
            try:
                response = self.scraper.get(url, timeout=30)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                for script in soup(["script", "style", "nav", "footer"]):
                    script.decompose()
                
                for a in soup.find_all('a', href=True):
                    if a.get_text(strip=True):
                        a.replace_with(f" {a.get_text(strip=True)} ({a['href']}) ")
                
                raw_text = soup.get_text(separator='\n', strip=True)
                processed = self._extract_relevant_content(raw_text)
                
                # Clean UTM params
                processed = re.sub(r'(&|\?)utm_source=[^\s)]*', '', processed)
                processed = re.sub(r' +', ' ', processed)
                processed = re.sub(r'\n\s*\n\s*\n+', '\n\n', processed)
                
                article_date = self._extract_date(raw_text) or "Unknown Date"
                
                return {
                    "full_text": processed.strip(),
                    "url": url,
                    "date": article_date
                }
            except Exception as e:
                print(f"Error scraping {url} (Attempt {attempt+1}/3): {e}")
                time.sleep(2 * (attempt + 1))
        return None
    
    def _agent_extractor(self, full_text: str, date: str) -> list:
        """Extract individual news items using Gemini API."""
        if not HAS_GENAI or not hasattr(self, 'model'):
            print("Error: Gemini API not configured.")
            return []
            
        print("  [1] Extraction Agent running...")
        
        print(f"  [DEBUG] Content preview (first 500 chars): {full_text[:500]}...")
        
        # Check if Anthropic content is in the text
        if 'Anthropic' in full_text or 'Opus' in full_text:
            print("  [DEBUG] Anthropic/Opus content FOUND in text")
        else:
            print("  [DEBUG] WARNING: Anthropic/Opus content NOT FOUND in text")
        
        if 'Frontier' in full_text:
            print("  [DEBUG] Frontier content FOUND in text")
        else:
            print("  [DEBUG] WARNING: Frontier content NOT FOUND in text")
        
        prompt = f"""
        You are an expert AI News Data Extractor.
        Your task is to extract ALL individual news items from this newsletter.

        Article Date: {date}

        CRITICAL: This newsletter contains MULTIPLE main news articles. You MUST extract ALL of them.
        
        Look for these types of articles:
        - Articles about OpenAI (GPT, Codex, Frontier, etc.)
        - Articles about Anthropic (Claude, Opus, agent teams, etc.)
        - Articles about Google, Meta, Microsoft, and other AI companies
        - Brief items under "Everything else in AI today"

        EXTRACTION RULES:
        1. MAIN ARTICLES: Major news items with bold/uppercase titles.
           - These are the PRIMARY stories - there are usually 2-4 main articles.
           - Each main article has a title, description, and source link.
           - Extract EVERY main article - do not stop after the first one!
        
        2. BRIEF ITEMS: Under "Everything else in AI today" section.
           - Each bullet point is a separate news item.
           - Extract each bullet as its own item.
        
        3. MUST EXCLUDE:
           - "PRESENTED BY" sponsor content
           - "TOGETHER WITH" sponsor content  
           - "AI TRAINING" promotional content
           - "Trending AI Tools" section
           - "Community AI workflows" section
           - "Highlights: News, Guides & Events" section

        Output ONLY a JSON array with ALL news items:
        [
          {{
            "date": "{date}",
            "raw_title": "Original title or first sentence",
            "raw_content": "Full content of this item",
            "source_name": "Company/Publisher name",
            "source_url": "https://source-link.com"
          }}
        ]
        
        IMPORTANT:
        - Extract ALL main articles (typically 2-4), not just the first one.
        - Do NOT miss any Anthropic or OpenAI articles.
        - raw_title MUST NOT BE EMPTY.

        Text:
        {full_text}
        """
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.1,
                    "response_mime_type": "application/json"
                }
            )
            text = response.text.strip()
            
            # Robust JSON extraction
            # 1. Clean markdown code blocks
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            text = text.strip()
            
            items = []
            try:
                items = json.loads(text)
            except json.JSONDecodeError as e:
                print(f"  [Warning] JSON parse error: {e}. Attempting regex recovery...")
                # 2. Try to find the JSON array list using regex
                match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
                if match:
                    try:
                        items = json.loads(match.group(0))
                        print("  [Success] Recovered JSON via regex.")
                    except json.JSONDecodeError:
                        print("  [Error] Regex check also failed to parse JSON.")
                        # Debugging: Log the problematic text
                        print(f"  [DEBUG] Failed JSON text: {text[:500]}...")
            
            # Final validation
            if not isinstance(items, list):
                print("  [Error] API returned non-list JSON.")
                items = []
                
            for item in items:
                if not item.get('raw_title') or not item['raw_title'].strip():
                    content = item.get('raw_content', '')
                    item['raw_title'] = content[:50].strip() + "..." if content else "Untitled AI News"
            
            print(f"  [1] Extracted {len(items)} news items")
            return items
        except Exception as e:
            print(f"Error in extraction: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _enrich_items(self, news_items: list) -> list:
        """Verify dates and enrich content from source URLs."""
        for item in news_items:
            # Clean title
            if item.get('raw_title'):
                item['raw_title'] = item['raw_title'].replace('\n', ' ').strip()
            
            url = item.get('source_url')
            if not url or 'therundown.ai' in url:
                continue
            
            # Enrich content if short
            # Skip Twitter/X as it requires JS/Login
            if 'x.com' in url or 'twitter.com' in url:
                continue

            original_content = item.get('raw_content', '')
            if len(original_content) < 500:
                try:
                    print(f"    🔍 Enriching content from: {url}")
                    response = self.scraper.get(url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Extract text
                        for script in soup(["script", "style", "nav", "footer", "header"]):
                            script.decompose()
                        
                        text = soup.get_text(separator=' ', strip=True)
                        # Clean up
                        text = re.sub(r'\s+', ' ', text).strip()
                        
                        # Validate text quality
                        if "JavaScript is not available" in text or "Access Denied" in text:
                            print(f"      ⚠️ Enriched text invalid (JS/Auth required). Keeping original.")
                            continue
                            
                        if len(text) > len(original_content):
                            item['raw_content'] = text[:5000]
                            print(f"      ✅ Enriched! New length: {len(item['raw_content'])}")
                        
                        # Date extraction (moved inside success block)
                        new_date = self._extract_date_from_url(url)
                        if not new_date:
                            # JSON-LD
                            for script in soup.find_all('script', type='application/ld+json'):
                                try:
                                    data = json.loads(script.string)
                                    if isinstance(data, list):
                                        data = data[0] if data else {}
                                    raw_date = data.get('datePublished') or data.get('dateCreated')
                                    if raw_date:
                                        new_date = raw_date.split('T')[0] if 'T' in raw_date else self._extract_date(raw_date)
                                        break
                                except:
                                    continue
                            
                            # Meta tags fallback
                            if not new_date:
                                time_tag = soup.find('time', datetime=True)
                                if time_tag:
                                    new_date = time_tag['datetime'].split('T')[0]
                        
                        if new_date:
                             normalized = self._normalize_date(new_date)
                             if normalized:
                                 item['date'] = normalized
                except Exception as e:
                    print(f"      ⚠️ Failed to enrich: {e}")
            
        return news_items
    
    def run(self) -> list:
        """
        Run the agent and return extracted news items.
        Iterates through archive pages until start_date is reached.
        """
        print(f"📅 Date range: {self.start_date} ~ {self.end_date}")
        
        start_dt = datetime.strptime(self.start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(self.end_date, '%Y-%m-%d')
        
        all_results = []
        page_num = 1
        max_pages = 10
        
        while page_num <= max_pages:
            links = self._get_links_from_archive(page_num=page_num)
            if not links:
                print("No more links found.")
                break
                
            print(f"📎 Found {len(links)} links on page {page_num}")
            
            for i, link in enumerate(links):
                print(f"\n[Page {page_num} - {i+1}/{len(links)}] {link}")
                
                result = self._scrape_article(link)
                if not result:
                    continue
                
                archive_date_str = self._normalize_date(result['date'])
                print(f"    Archive date: {archive_date_str}")
                
                if not archive_date_str:
                    print(f"    ⚠️ Could not parse date. Skipping.")
                    continue
                
                try:
                    archive_dt = datetime.strptime(archive_date_str, '%Y-%m-%d')
                except ValueError:
                    print(f"    ⚠️ Invalid date format. Skipping.")
                    continue

                # Check newer limit
                if archive_dt > end_dt:
                    print(f"    ⏭️ Newer than end date. Skipping.")
                    continue

                # Check older limit
                if archive_dt < start_dt:
                    print(f"    ⏹️ Reached start date limit ({self.start_date}). Stopping.")
                    # Return immediately as lists are chronological
                    return all_results
                
                # Process valid article
                print(f"    ✅ Within date range. Processing...")
                extracted = self._agent_extractor(result['full_text'], archive_date_str)
                if extracted:
                    extracted = self._enrich_items(extracted)
                    all_results.extend(extracted)
            
            page_num += 1
            
        print(f"\n✅ Total: {len(all_results)} articles")
        return all_results
    
    def run_json(self) -> str:
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


class RuntimeCollector(BaseCollector):
    """Collector for Runtime (The Rundown) news."""
    
    def __init__(self, start_date: str, end_date: str):
        super().__init__(start_date, end_date)
        self.source_name = "The Rundown"
        self._agent = AINewsAgent(start_date, end_date)
    
    def run(self) -> list:
        """Run the Runtime collector."""
        print(f"[RuntimeCollector] Collecting news from {self.start_date} to {self.end_date}...")
        try:
            results = self._agent.run()
            print(f"[RuntimeCollector] Collected {len(results)} articles.")
            return results
        except Exception as e:
            print(f"[RuntimeCollector] Error: {e}")
            return []

# if __name__ == "__main__":
#     # Test execution
#     # Use a date range that triggers the issue (e.g., Feb 3 2026)
#     collector = RuntimeCollector("2026-02-03", "2026-02-04")
#     results = collector.run()
#     print(json.dumps(results, ensure_ascii=False, indent=2))