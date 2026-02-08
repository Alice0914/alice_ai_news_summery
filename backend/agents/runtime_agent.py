"""
AI News Runtime Agent
Extracts AI news from therundown.ai archive based on date range.
"""

import os
import re
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from backend/.env
_current_dir = os.path.dirname(os.path.abspath(__file__))
_env_path = os.path.join(_current_dir, '..', '.env')
load_dotenv(_env_path)


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
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")
        
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
        url = f"https://www.therundown.ai/archive?page={page_num}"
        try:
            response = self.scraper.get(url, timeout=10)
            if response.status_code != 200:
                return []
            soup = BeautifulSoup(response.content, 'html.parser')
            links = []
            for a in soup.find_all('a', href=True):
                href = a['href']
                if '/p/' in href and 'archive' not in href:
                    full_link = href if href.startswith('http') else f"https://www.therundown.ai{href}"
                    if full_link not in links:
                        links.append(full_link)
            return links
        except Exception as e:
            print(f"Error fetching archive: {e}")
            return []
    
    def _extract_relevant_content(self, text: str) -> str:
        """Extract relevant content from newsletter."""
        article_date = self._extract_date(text)
        
        start_marker = "LATEST DEVELOPMENTS"
        start_idx = text.find(start_marker)
        if start_idx != -1:
            text = text[start_idx:]
        
        exclude_markers = [
            "PRESENTED BY", "TOGETHER WITH", "AI TRAINING",
            "Trending AI Tools", "Community AI workflows",
            "Highlights: News, Guides & Events", "That's it for today!"
        ]
        include_markers = ["Everything else in AI today"]
        
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
            
            if any(m in stripped for m in exclude_markers):
                skip_section = True
                continue
            
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
        print("  [1] Extraction Agent running...")
        
        prompt = f"""
        You are an expert AI News Data Extractor.
        Split the newsletter into individual news items.

        Article Date: {date}

        Rules:
        - Main items: Look for bold/uppercase section titles.
        - Brief items: Under "Everything else in AI today" — each bullet is one item.
        - Extract source_name and source_url accurately.

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
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            
            items = json.loads(text.strip())
            for item in items:
                if not item.get('raw_title') or not item['raw_title'].strip():
                    # Fallback: Use snippets of content
                    content = item.get('raw_content', '')
                    item['raw_title'] = content[:50].strip() + "..." if content else "Untitled AI News"
            
            return items
        except Exception as e:
            print(f"Error in extraction: {e}")
            return []
    
    def _verify_dates_from_source(self, news_items: list) -> list:
        """Verify and update dates from source URLs."""
        for item in news_items:
            url = item.get('source_url')
            if not url or 'therundown.ai' in url:
                continue
            
            new_date = self._extract_date_from_url(url)
            
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
                        
                        # Time tag
                        if not new_date:
                            time_tag = soup.find('time', datetime=True)
                            if time_tag:
                                new_date = time_tag['datetime'].split('T')[0]
                        
                        # Text fallback
                        if not new_date:
                            for tag in soup(["script", "style"]):
                                tag.decompose()
                            text = soup.get_text()[:3000]
                            new_date = self._extract_date(text)
                
                except Exception:
                    pass
            
            if new_date:
                item['date'] = self._normalize_date(new_date)
        
        return news_items
    
    def run(self) -> list:
        """
        Run the agent and return extracted news items as JSON-serializable list.
        
        Returns:
            List of news items within the specified date range.
        """
        print(f"📅 Date range: {self.start_date} ~ {self.end_date}")
        
        links = self._get_links_from_archive(page_num=1)
        print(f"📎 Found {len(links)} links")
        
        all_results = []
        
        for i, link in enumerate(links):
            print(f"\n[{i+1}/{len(links)}] {link}")
            
            result = self._scrape_article(link)
            if not result:
                continue
            
            archive_date = self._normalize_date(result['date'])
            print(f"    Archive date: {archive_date}")
            
            # Skip if newer than end date
            if archive_date and archive_date > self.end_date:
                print(f"    ⏭️ Newer than end date. Skipping.")
                continue

            # Stop if older than start date
            if archive_date and archive_date < self.start_date:
                print(f"    ⏹️ Reached start date limit. Stopping.")
                break
            
            # Process
            extracted = self._agent_extractor(result['full_text'], archive_date)
            if extracted:
                extracted = self._verify_dates_from_source(extracted)
                all_results.extend(extracted)
        
        # Original premature stop logic removed.
        # We continue until we hit a date OLDER than start_date (handled by loop break above).
        
        print(f"\n✅ Total: {len(all_results)} articles")
        return all_results
    
    def run_json(self) -> str:
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


# Example usage
if __name__ == "__main__":
    #agent = AINewsAgent(start_date="2026-01-27", end_date="2026-01-30")
    agent = AINewsAgent(start_date, end_date)
    results = agent.run()
    print(json.dumps(results, ensure_ascii=False, indent=2))
