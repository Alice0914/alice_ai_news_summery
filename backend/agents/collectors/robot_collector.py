"""
Robot Runtime News Collector
Wraps the RobotRuntimeNewsAgent to scrape and extract robot news.
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
_env_path = os.path.join(_current_dir, '..', '..', '..', '.env')
load_dotenv(_env_path)


class RobotRuntimeNewsAgent:
    """
    Robot News extraction agent that scrapes robotnews.therundown.ai archive
    and extracts individual news items using Gemini API.
    Includes date verification from source URLs.
    """
    
    def __init__(self, start_date: str, end_date: str):
        """
        Initialize the agent with date range.
        
        Args:
            start_date: Start date in YYYY-MM-DD format (older date, inclusive)
            end_date: End date in YYYY-MM-DD format (newer date, inclusive)
        """
        self.start_date = start_date
        self.end_date = end_date
        
        # Configure Gemini API
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            print("[Warning] GOOGLE_API_KEY not found in environment variables. Extraction may fail.")
        elif HAS_GENAI:
            genai.configure(api_key=api_key)
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
        """Get article links from archive page."""
        url = f"https://robotnews.therundown.ai/archive?page={page_num}"
        try:
            print(f"  Fetching archive page {page_num}...")
            response = self.scraper.get(url, timeout=10)
            if response.status_code != 200:
                print(f"  Failed to fetch archive: {response.status_code}")
                return []
            soup = BeautifulSoup(response.content, 'html.parser')
            links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                if '/p/' in href and 'archive' not in href:
                    full_link = href if href.startswith('http') else f"https://robotnews.therundown.ai{href}"
                    if full_link not in links:
                        links.append(full_link)
            return links
        except Exception as e:
            print(f"Error fetching archive: {e}")
            return []
    
    def _extract_relevant_content(self, text: str) -> str:
        """Extract relevant content from newsletter."""
        article_date = self._extract_date(text)
        
        # Determine start of content
        start_marker = "LATEST DEVELOPMENTS"
        start_idx = text.find(start_marker)
        if start_idx != -1:
            text = text[start_idx:]
        
        exclude_markers = [
            "PRESENTED BY", "TOGETHER WITH", "AI TRAINING",
            "Trending AI Tools", "Community AI workflows",
            "Highlights: News, Guides & Events", "That's it for today!"
        ]
        include_markers = ["Everything else in robotics today", "Everything else in AI today"]
        
        lines = text.split('\n')
        result_lines = []
        
        if article_date:
            result_lines.append(f"Date: {article_date}")
            result_lines.append("")
        
        skip_section = False
        for line in lines:
            stripped = line.strip()
            
            if any(m in stripped for m in include_markers):
                skip_section = False
                result_lines.append(line)
                continue
            
            # Check for exclusion
            if any(m in stripped for m in exclude_markers):
                skip_section = True
                continue
            
            # Heuristic: Uppercase headers often restart sections
            if stripped.isupper() and len(stripped) > 3 and ' ' in stripped:
                if not any(m in stripped for m in exclude_markers):
                    skip_section = False
            
            if not skip_section:
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
                
                # Expand links in text for better LLM context
                for a in soup.find_all('a', href=True):
                    if a.get_text(strip=True):
                        a.replace_with(f" {a.get_text(strip=True)} ({a['href']}) ")
                
                raw_text = soup.get_text(separator='\n', strip=True)
                processed = self._extract_relevant_content(raw_text)
                
                # Clean UTM params & whitespace
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
        
        prompt = f"""
        You are an expert Robotics News Data Extractor.
        Split the newsletter into individual news items.

        Article Date: {date}

        Rules:
        - Main items: Look for bold/uppercase section titles.
        - Brief items: Under "Everything else in robotics today" — each bullet is one item.
        - Extract source_name and source_url accurately.
          - **source_name**: Extract the publisher/company name (e.g., "Microsoft", "Unitree").
          - **source_url**: Extract the specific link to the article/paper. DO NOT use the newsletter's archive link.

        Output ONLY a JSON array:
        [
          {{
            "date": "Article date (YYYY-MM-DD)",
            "raw_title": "Original title or first sentence",
            "raw_content": "Full content of this item (exclude URL)",
            "source_name": "Company/Publisher name",
            "source_url": "https://real-article-link.com"
          }}
        ]

        IMPORTANT: raw_title MUST NOT BE EMPTY. If a specific title is missing, generate a short 10-word summary as the title.

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
            # Clean Markdown code blocks if present
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            items = json.loads(text.strip())
            for item in items:
                if not item.get('raw_title') or not item['raw_title'].strip():
                    content = item.get('raw_content', '')
                    item['raw_title'] = content[:50].strip() + "..." if content else "Untitled Robotics News"
            
            return items
        except Exception as e:
            print(f"Error in extraction: {e}")
            return []
    
    def _verify_dates_from_source(self, news_items: list) -> list:
        """
        Verify and update dates from source URLs.
        """
        for item in news_items:
            url = item.get('source_url')
            if not url or 'therundown.ai' in url:
                continue
            
            original_date = item.get('date')
            new_date = self._extract_date_from_url(url)
            
            # If date not in URL, try fetching metadata
            if not new_date:
                try:
                    response = self.scraper.get(url, timeout=15)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
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
                        
                        # Meta tags
                        if not new_date:
                            for meta in soup.find_all('meta', attrs={'property': True}):
                                prop = meta.get('property', '')
                                if 'published_time' in prop or 'date' in prop.lower():
                                    content = meta.get('content', '')
                                    if content:
                                        new_date = content.split('T')[0] if 'T' in content else self._extract_date(content)
                                        if new_date:
                                            break
                except Exception as e:
                    # Not critical, just skip verification
                    pass
            
            if new_date:
                normalized_date = self._normalize_date(new_date)
                if normalized_date and normalized_date != original_date:
                    item['date'] = normalized_date
        
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
        stop_collection = False

        while not stop_collection and page_num <= max_pages:
            links = self._get_links_from_archive(page_num=page_num)
            if not links:
                print("  No more links found.")
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
                    print(f"    ⚠️ Invalid date format: {archive_date_str}. Skipping.")
                    continue
                
                # Check End Date (Too New?)
                if archive_dt > end_dt:
                    print(f"    ⏭️ Newer than end date ({self.end_date}). Skipping.")
                    continue
                
                # Check Start Date (Too Old?)
                if archive_dt < start_dt:
                    print(f"    ⏹️ Older than start date ({self.start_date}). Stopping collection.")
                    stop_collection = True
                    break
                
                # Process Valid Article
                print(f"    ✅ Within date range. Processing...")
                extracted = self._agent_extractor(result['full_text'], archive_date_str)
                if extracted:
                    extracted = self._verify_dates_from_source(extracted)
                    all_results.extend(extracted)
            
            page_num += 1
        
        print(f"\n✅ Total: {len(all_results)} articles")
        return all_results
    
    def run_json(self) -> str:
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


class RobotCollector(BaseCollector):
    """Collector for Robot Runtime news."""
    
    def __init__(self, start_date: str, end_date: str):
        super().__init__(start_date, end_date)
        self.source_name = "Robot Runtime"
        self._agent = RobotRuntimeNewsAgent(start_date, end_date)
    
    def run(self) -> list:
        """Run the Robot Runtime collector."""
        print(f"[RobotCollector] Collecting news from {self.start_date} to {self.end_date}...")
        try:
            results = self._agent.run()
            print(f"[RobotCollector] Collected {len(results)} articles.")
            return results
        except Exception as e:
            print(f"[RobotCollector] Error: {e}")
            return []

# if __name__ == "__main__":
#     # Test execution
#     collector = RobotCollector("2024-01-01", "2026-01-31")
#     results = collector.run()
#     print(json.dumps(results, ensure_ascii=False, indent=2))