"""
Claude Blog Collector
Wraps the ClaudeBlogsAgent to scrape Claude news dynamically.
"""

import sys
import os
import json
import time
import requests
from datetime import datetime
from bs4 import BeautifulSoup

# Ensure backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

try:
    from .base_collector import BaseCollector
except ImportError:
    # Fallback for standalone testing
    class BaseCollector:
        def __init__(self, start_date, end_date):
            self.start_date = start_date
            self.end_date = end_date
        def run(self): pass


class ClaudeBlogsAgent:
    """
    Claude Blog scraper that fetches articles within a date range.
    """
    
    def __init__(self, start_date: str, end_date: str):
        self.start_date = start_date
        self.end_date = end_date
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def _normalize_date(self, d) -> datetime:
        if isinstance(d, str):
            return datetime.strptime(d, '%Y-%m-%d')
        return d
        
    def _get_news_urls(self) -> list:
        url = "https://claude.com/blog"
        try:
            response = requests.get(url, headers=self.headers)
            if response.status_code != 200:
                print(f"Failed to fetch list page: {response.status_code}")
                return []
                
            soup = BeautifulSoup(response.content, 'html.parser')
            links = soup.find_all('a', href=True)
            candidate_hrefs = [a.get('href') for a in links if '/blog/' in a.get('href')]
            
            # Remove category and pagination links
            valid_urls = set()
            for href in candidate_hrefs:
                if 'category' in href or '?' in href or href.endswith('/blog/') or href.endswith('/blog'):
                    continue
                full_url = f"https://claude.com{href}" if href.startswith('/') else href
                valid_urls.add(full_url)
                
            return list(valid_urls)
        except Exception as e:
            print(f"Error in _get_news_urls: {e}")
            return []

    def _scrape_article_detail(self, url: str) -> dict | None:
        try:
            response = requests.get(url, headers=self.headers)
            if response.status_code != 200:
                return None
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            title = soup.title.string.replace('| Claude', '').strip() if soup.title else "Unknown"
            
            date_str = None
            date_obj = None
            for div in soup.find_all('div'):
                text = div.get_text(strip=True)
                if text.startswith('Date') and len(text) < 30:
                    raw_date = text.replace('Date', '').strip()
                    try:
                        date_obj = datetime.strptime(raw_date, '%B %d, %Y')
                        date_str = date_obj.strftime('%Y-%m-%d')
                    except Exception:
                        date_str = raw_date
                    break
                    
            content_node = soup.find('article') or soup.find('main')
            if content_node:
                for tag in content_node(['script', 'style', 'nav', 'footer', 'form']):
                    tag.decompose()
                full_text = content_node.get_text(separator='\n', strip=True)
            else:
                full_text = soup.body.get_text(separator='\n', strip=True) if soup.body else ""

            return {
                "raw_title": title,
                "raw_content": full_text,
                "source_url": url,
                "date": date_str,
                "parsed_date": date_obj,
                "source_name": "Claude"
            }
        except Exception as e:
            print(f"Error scraping article {url}: {e}")
            return None

    def run(self) -> list:
        print(f"Starting Claude Scraper ({self.start_date} ~ {self.end_date})...")
        try:
            start_dt = self._normalize_date(self.start_date).replace(hour=0, minute=0, second=0)
            end_dt = self._normalize_date(self.end_date).replace(hour=23, minute=59, second=59)
        except Exception as e:
            print(f"Error normalizing dates: {e}")
            return []

        urls = self._get_news_urls()
        results = []
        
        for url in urls:
            details = self._scrape_article_detail(url)
            if details and details.get('parsed_date'):
                if start_dt <= details['parsed_date'] <= end_dt:
                    del details['parsed_date'] # Cleanup internal date object
                    results.append(details)
                    print(f"  > [MATCH] {details['raw_title'][:30]}... ({details['date']})")
                else:
                    print(f"  > [SKIP] out of range: {details.get('date')} ({url})")
            time.sleep(0.5)

        print(f"Done. Scraped {len(results)} articles.")
        return results


class ClaudeCollector(BaseCollector):
    """Collector for Claude news."""
    
    def __init__(self, start_date: str, end_date: str):
        super().__init__(start_date, end_date)
        self.source_name = "Claude"
        self._agent = ClaudeBlogsAgent(start_date, end_date)
    
    def run(self) -> list:
        print(f"[{self.source_name}Collector] Collecting news from {self.start_date} to {self.end_date}...")
        try:
            results = self._agent.run()
            print(f"[{self.source_name}Collector] Collected {len(results)} articles.")
            return results
        except Exception as e:
            print(f"[{self.source_name}Collector] Error: {e}")
            return []
