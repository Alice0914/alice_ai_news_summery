"""
Neuron Daily News Agent
Extracts AI news from theneurondaily.com archive based on date range.
"""

import os
import re
import json
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from backend/.env
_current_dir = os.path.dirname(os.path.abspath(__file__))
_env_path = os.path.join(_current_dir, '..', '.env')
load_dotenv(_env_path)


class NeuronNewsAgent:
    """
    AI News extraction agent that scrapes theneurondaily.com archive
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
        # Neuron URL doesn't usually have date, but just in case
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
        """Get article links and dates from archive page."""
        url = f"https://www.theneurondaily.com/archive?page={page_num}"
        try:
            response = self.scraper.get(url, timeout=10)
            if response.status_code != 200:
                return []
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Beehiiv archive usually lists posts. 
            # We look for 'a' tags with /p/ inside.
            for a in soup.find_all('a', href=True):
                href = a['href']
                if '/p/' in href and 'archive' not in href and 'authors' not in href:
                    full_link = href if href.startswith('http') else f"https://www.theneurondaily.com{href}"
                    text = a.get_text(strip=True)
                    
                    # Extract date from link text or previous sibling?
                    # Based on observation, date might be inside the link text at the start
                    # "Jan 30, 2026 ... Title"
                    extracted_date = self._extract_date(text)
                    
                    # Try to find date in parent container if not in link
                    if not extracted_date:
                        parent_text = a.parent.get_text(separator=' ', strip=True)
                        extracted_date = self._extract_date(parent_text)
                    
                    # Normalize
                    normalized_date = self._normalize_date(extracted_date) if extracted_date else None
                    
                    # Avoid duplicates
                    if not any(item['url'] == full_link for item in articles):
                        articles.append({'url': full_link, 'date': normalized_date})
                        
            return articles
        except Exception as e:
            print(f"Error fetching archive: {e}")
            return []
    
    def _extract_relevant_content(self, text: str) -> str:
        """Extract relevant content from newsletter."""
        # Neuron daily doesn't stick the date at the very top clearly in plain text always,
        # but _scrape_article tries to find it.
        
        exclude_markers = [
            "Treats to Try", "Intelligent Insights", 
            "A Cat’s Commentary", "Prompt Tip of the Day",
            "Why you should trust us", "Advertise with us",
            "Update your email preferences"
        ]
        include_markers = ["Around the Horn"]
        
        lines = text.split('\n')
        result_lines = []
        
        skip_section = False
        for line in lines:
            stripped = line.strip()
            
            # If we hit an include marker, force include (stop skipping)
            if any(m in stripped for m in include_markers):
                skip_section = False
                result_lines.append(line)
                continue
            
            # If we hit an exclude marker, start skipping
            if any(m in stripped for m in exclude_markers):
                skip_section = True
                continue
            
            # Heuristics to stop skipping if headers look like news
            if stripped.startswith("## ") or (stripped.isupper() and len(stripped) > 3 and ' ' in stripped):
                 if not any(m in stripped for m in exclude_markers):
                    skip_section = False
            
            if not skip_section:
                result_lines.append(line)
        
        return '\n'.join(result_lines)
    
    def _scrape_article(self, url: str) -> dict | None:
        """Scrape article content from URL."""
        try:
            response = self.scraper.get(url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            for script in soup(["script", "style", "nav", "footer"]):
                script.decompose()
            
            # Extract date from meta or time tag
            article_date = None
            
            # 1. JSON-LD
            for script in soup.find_all('script', type='application/ld+json'):
                try:
                    data = json.loads(script.string)
                    if isinstance(data, list):
                        data = data[0] if data else {}
                    raw_date = data.get('datePublished') or data.get('dateCreated')
                    if raw_date:
                        article_date = raw_date.split('T')[0]
                        break
                except:
                    continue
            
            # 2. Time tag
            if not article_date:
                time_tag = soup.find('time')
                if time_tag:
                    if time_tag.has_attr('datetime'):
                         article_date = time_tag['datetime'].split('T')[0]
                    else:
                        article_date = self._extract_date(time_tag.get_text())

            for a in soup.find_all('a', href=True):
                if a.get_text(strip=True):
                    a.replace_with(f" {a.get_text(strip=True)} ({a['href']}) ")
            
            raw_text = soup.get_text(separator='\n', strip=True)
            processed = self._extract_relevant_content(raw_text)
            
            # Clean UTM params
            processed = re.sub(r'(&|\?)utm_source=[^\s)]*', '', processed)
            processed = re.sub(r' +', ' ', processed)
            processed = re.sub(r'\n\s*\n\s*\n+', '\n\n', processed)
            
            if not article_date:
                 article_date = self._extract_date(raw_text) or "Unknown Date"
            
            return {
                "full_text": processed.strip(),
                "url": url,
                "date": article_date
            }
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None
    
    def _agent_extractor(self, full_text: str, date: str) -> list:
        """Extract individual news items using Gemini API."""
        print("  [1] Extraction Agent running...")
        
        prompt = f"""
        You are an expert AI News Data Extractor.
        Split the newsletter into individual news items.

        Article Date: {date}

        Rules:
        - The input text comes from 'The Neuron Daily'.
        - Main items: Often have clear headings.
        - Brief items: Under "Around the Horn" — each numbered list item is one news item.
        - Extract source_name and source_url accurately.
        - If the source URL is internal (theneurondaily.com), try to find the external link in the text.

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
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error in extraction: {e}")
            return []
    
    def _verify_dates_from_source(self, news_items: list) -> list:
        """Verify and update dates from source URLs."""
        for item in news_items:
            url = item.get('source_url')
            if not url or 'theneurondaily.com' in url:
                continue
            
            new_date = self._extract_date_from_url(url)
            
            if not new_date:
                try:
                    # Timeout short to avoid hanging
                    response = self.scraper.get(url, timeout=10)
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
                        
                        if not new_date:
                            time_tag = soup.find('time', datetime=True)
                            if time_tag:
                                new_date = time_tag['datetime'].split('T')[0]
                
                except Exception:
                    pass
            
            if new_date:
                item['date'] = self._normalize_date(new_date)
        
        return news_items
    
    
    def run(self) -> list:
        """
        Run the agent and return extracted news items as JSON-serializable list.
        """
        print(f"📅 Date range: {self.start_date} ~ {self.end_date}")
        
        articles_list = self._get_links_from_archive(page_num=1)
        print(f"📎 Found {len(articles_list)} articles in archive")
        
        all_results = []
        
        for i, item in enumerate(articles_list):
            link = item['url']
            archive_date = item['date']
            
            print(f"\n[{i+1}/{len(articles_list)}] {link}")
            if archive_date:
                print(f"    Archive date: {archive_date}")
                
            # Pre-filter by date if available
            if archive_date:
                if archive_date > self.end_date:
                    print(f"    ⏭️ Newer than end date. Skipping.")
                    continue
                if archive_date < self.start_date:
                    print(f"    ⏭️ Older than start date. Skipping.")
                    # Assuming sorted, we might stop here? But let's be safe.
                    # continue 
            
            result = self._scrape_article(link)
            if not result:
                continue
            
            # Use scrape date if archive date was missing, or prefer archive date?
            # Archive date is usually reliable for newsletters.
            final_date = archive_date if archive_date else self._normalize_date(result['date'])
            print(f"    Final date: {final_date}")
            
            # Final Date check
            if final_date:
                if final_date < self.start_date:
                    print(f"    ⏭️ Older than start date. Skipping.")
                    continue
                if final_date > self.end_date:
                    print(f"    ⏭️ Newer than end date. Skipping.")
                    continue
            
            # Process if within range
            extracted = self._agent_extractor(result['full_text'], final_date)
            if extracted:
                extracted = self._verify_dates_from_source(extracted)
                all_results.extend(extracted)
            
            time.sleep(2) # Avoid rate limits
            
        print(f"\n✅ Total: {len(all_results)} articles")
        return all_results
    
    def run_json(self) -> str:
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


# Example usage
if __name__ == "__main__":
    # Example
    today = datetime.now().strftime("%Y-%m-%d")
    # agent = NeuronNewsAgent(start_date="2026-01-28", end_date="2026-01-30")
    agent = NeuronNewsAgent(start_date, end_date)
    results = agent.run()
    print(json.dumps(results, ensure_ascii=False, indent=2))
