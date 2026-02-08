# backend2/agents2/collectors/xai_collector.py
"""
xAI News Collector
Wraps the XAINewsAgent to scrape AI news.
"""

import sys
import os
import json
import time
import re
import requests
from datetime import datetime
from bs4 import BeautifulSoup

# Ensure backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

# Try to use curl_cffi for better compatibility, fallback to requests
try:
    from curl_cffi import requests as curl_requests
    HAS_CURL_CFFI = True
except ImportError:
    HAS_CURL_CFFI = False

# Import BaseCollector
try:
    from .base_collector import BaseCollector
except ImportError:
    # Fallback for standalone testing if relative import fails
    class BaseCollector:
        def __init__(self, start_date, end_date):
            self.start_date = start_date
            self.end_date = end_date
        def run(self): pass

# ------------------------------------------------------------------------
# xAI News Agent (Scraper Logic)
# ------------------------------------------------------------------------

class XAINewsAgent:
    """
    xAI News scraper that fetches articles within a date range.
    """
    
    def __init__(self, start_date: str, end_date: str):
        """
        Initialize the agent with date range.
        
        Args:
            start_date: Start date in YYYY-MM-DD format (inclusive)
            end_date: End date in YYYY-MM-DD format (inclusive)
        """
        self.start_date = start_date
        self.end_date = end_date
    
    def _parse_xai_date(self, date_str: str) -> datetime | None:
        """Parse dates like 'December 30, 2025'"""
        if not date_str:
            return None
        date_str = date_str.strip()
        formats = [
            '%B %d, %Y',       # December 30, 2025
            '%b %d, %Y',       # Dec 30, 2025
            '%Y-%m-%d',
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return None
    
    def _normalize_date(self, d) -> datetime | None:
        """Normalize date string to datetime object."""
        if isinstance(d, str):
            for fmt in ['%Y-%m-%d', '%B %d, %Y', '%b %d, %Y']:
                try:
                    return datetime.strptime(d, fmt)
                except ValueError:
                    continue
        return d
    
    def _make_request(self, url: str):
        """Make HTTP request with appropriate library."""
        if HAS_CURL_CFFI:
            return curl_requests.get(url, impersonate="chrome", timeout=30)
        else:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            return requests.get(url, headers=headers, timeout=30)
    
    def _get_news_list(self) -> list:
        """
        Scrapes article list from https://x.ai/blog
        """
        url = "https://x.ai/blog"
        
        try:
            start_dt = self._normalize_date(self.start_date)
            end_dt = self._normalize_date(self.end_date)
            
            # Ensure proper datetime comparison
            if start_dt:
                start_dt = start_dt.replace(hour=0, minute=0, second=0)
            if end_dt:
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
            
            print(f"Fetching xAI News List... Range: {start_dt} ~ {end_dt}")
            
            response = self._make_request(url)
            if response.status_code != 200:
                # Fallback to /news if /blog fails
                print(f"Failed to access blog ({response.status_code}), trying /news...")
                response = self._make_request("https://x.ai/news")
                if response.status_code != 200:
                    print(f"Failed to access list page: {response.status_code}")
                    return []
                
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Strategy: xAI links start with /blog or /news
            all_links = soup.find_all('a', href=True)
            
            for link in all_links:
                href = link['href']
                if not (href.startswith('/blog/') or href.startswith('/news/')):
                    continue
                    
                full_url = f"https://x.ai{href}"
                
                # Date extraction from list
                found_date = None
                found_date_str = ""
                
                # Check parent content for date
                container = link
                # Traverse up a few levels to find the container that holds the date text
                for _ in range(3): 
                    if not container:
                        break
                    text = container.get_text("\n")
                    # Try to find date regex in text block
                    match = re.search(r'([A-Z][a-z]+ \d{1,2}, \d{4})', text)
                    if match:
                        d_can = self._parse_xai_date(match.group(1))
                        if d_can:
                            found_date = d_can
                            found_date_str = match.group(1)
                            break
                    container = container.parent
                
                title = link.get_text(strip=True)
                if not title or len(title) < 5:
                    # Maybe title is inside h3/h2 inside link
                    h = link.find(['h1', 'h2', 'h3', 'h4'])
                    if h:
                        title = h.get_text(strip=True)
                
                if found_date:
                    if start_dt <= found_date <= end_dt:
                        if not any(a['url'] == full_url for a in articles):
                            articles.append({
                                'url': full_url,
                                'date': found_date_str,
                                'dt': found_date,
                                'title': title
                            })
            
            print(f"Found {len(articles)} matching articles in list.")
            return articles
            
        except Exception as e:
            print(f"Error in _get_news_list: {e}")
            return []
    
    def _scrape_article_detail(self, url: str, list_info: dict) -> dict | None:
        """
        Scrapes detail of a single xAI article.
        """
        try:
            response = self._make_request(url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Main Content: Usually in div.prose or similar
            content_div = soup.find('div', class_=lambda c: c and 'prose' in c)
            if not content_div:
                content_div = soup.find('article')
            
            if not content_div:
                content_div = soup.find('main')
                
            if content_div:
                for tag in content_div(['script', 'style', 'button', 'nav', 'footer', 'header', 'form']):
                    tag.decompose()
                raw_content = content_div.get_text(separator='\n', strip=True)
            else:
                raw_content = ""
                
            # Title extraction from Page (often better than list)
            h1 = soup.find('h1')
            page_title = h1.get_text(strip=True) if h1 else list_info['title']
            
            return {
                "raw_content": raw_content,
                "source_url": url,
                "date": list_info['date'],
                "raw_title": page_title,
                "source_name": "xAI"
            }

        except Exception as e:
            print(f"Error scraping article {url}: {e}")
            return None
    
    def run(self) -> list:
        """
        Execute the scraper for the configured date range.
        Returns list of article items.
        """
        print(f"Starting xAI News Scraper ({self.start_date} ~ {self.end_date})...")
        target_articles = self._get_news_list()
        results = []
        
        for article in target_articles:
            print(f"  > Scraping: {article['title'][:40]}... ({article['date']})")
            details = self._scrape_article_detail(article['url'], article)
            if details:
                results.append(details)
            time.sleep(1)
            
        print(f"Done. Scraped {len(results)} articles.")
        return results
    
    def run_json(self) -> str:
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


# ------------------------------------------------------------------------
# Collector Wrapper
# ------------------------------------------------------------------------

class XAICollector(BaseCollector):
    """Collector for xAI news."""
    
    def __init__(self, start_date: str, end_date: str):
        super().__init__(start_date, end_date)
        self.source_name = "xAI"
        self._agent = XAINewsAgent(start_date, end_date)
    
    def run(self) -> list:
        """Run the xAI collector."""
        print(f"[XAICollector] Collecting news from {self.start_date} to {self.end_date}...")
        try:
            results = self._agent.run()
            print(f"[XAICollector] Collected {len(results)} articles.")
            return results
        except Exception as e:
            print(f"[XAICollector] Error: {e}")
            return []

# ------------------------------------------------------------------------
# Main Execution
# ------------------------------------------------------------------------

# if __name__ == "__main__":
#     # Test dates
#     start_date = "2024-01-01"
#     end_date = "2026-01-31"
    
#     # Run the collector
#     collector = XAICollector(start_date, end_date)
#     results = collector.run()
    
#     print("\n--- JSON Output ---")
#     print(json.dumps(results, ensure_ascii=False, indent=2))