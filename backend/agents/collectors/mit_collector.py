"""
MIT News Collector
Wraps the MITNewsAgent to scrape AI news.
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


class MITAINewsAgent:
    """
    MIT AI News scraper that fetches articles within a date range.
    """
    
    def __init__(self, start_date: str, end_date: str):
        self.start_date = start_date
        self.end_date = end_date
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def _parse_mit_date(self, date_str: str) -> datetime | None:
        """Parse dates like 'January 30, 2026'"""
        if not date_str:
            return None
        date_str = date_str.strip()
        formats = [
            '%B %d, %Y',
            '%b %d, %Y',
            '%Y-%m-%d',
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return None
    
    def _normalize_date(self, d) -> datetime | None:
        if isinstance(d, str):
            for fmt in ['%Y-%m-%d', '%B %d, %Y', '%b %d, %Y']:
                try:
                    return datetime.strptime(d, fmt)
                except ValueError:
                    continue
        return d
    
    def _get_news_list(self) -> list:
        """Scrape article list from MIT News AI topic."""
        url = "https://news.mit.edu/topic/artificial-intelligence2"
        
        try:
            start_dt = self._normalize_date(self.start_date)
            end_dt = self._normalize_date(self.end_date)
            
            if start_dt:
                start_dt = start_dt.replace(hour=0, minute=0, second=0)
            if end_dt:
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
            
            print(f"Fetching MIT News List... Range: {start_dt} ~ {end_dt}")
            
            response = requests.get(url, headers=self.headers, timeout=30)
            if response.status_code != 200:
                print(f"Failed to access list page: {response.status_code}")
                return []
                
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Find article cards
            items = soup.find_all('div', class_=lambda c: c and 'term-page--news-article' in str(c))
            if not items:
                items = soup.find_all('article')
            
            for item in items:
                try:
                    link = item.find('a', href=True)
                    if not link:
                        continue
                    
                    href = link.get('href')
                    full_url = f"https://news.mit.edu{href}" if href.startswith('/') else href
                    
                    # Title
                    title_el = item.find(['h3', 'h2', 'h4'])
                    title = title_el.get_text(strip=True) if title_el else link.get_text(strip=True)
                    
                    # Date
                    time_el = item.find('time')
                    date_str = time_el.get_text(strip=True) if time_el else ""
                    found_date = self._parse_mit_date(date_str)
                    
                    if found_date and start_dt and end_dt:
                        if start_dt <= found_date <= end_dt:
                            if not any(a['url'] == full_url for a in articles):
                                articles.append({
                                    'url': full_url,
                                    'date': date_str,
                                    'dt': found_date,
                                    'title': title
                                })
                except Exception as e:
                    print(f"Error parsing item: {e}")
                    continue
            
            print(f"Found {len(articles)} matching articles in list.")
            return articles
            
        except Exception as e:
            print(f"Error in _get_news_list: {e}")
            return []
    
    def _scrape_article_detail(self, url: str, list_info: dict) -> dict | None:
        """Scrape detail of a single MIT article."""
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            content_div = soup.find('div', class_=lambda c: c and 'news-article--content' in str(c))
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
            
            h1 = soup.find('h1')
            page_title = h1.get_text(strip=True) if h1 else list_info['title']
            
            return {
                "raw_content": raw_content,
                "source_url": url,
                "date": list_info['date'],
                "raw_title": page_title,
                "source_name": "MIT"
            }

        except Exception as e:
            print(f"Error scraping article {url}: {e}")
            return None
    
    def run(self) -> list:
        """Execute the scraper for the configured date range."""
        print(f"Starting MIT News Scraper ({self.start_date} ~ {self.end_date})...")
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
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


class MITCollector(BaseCollector):
    """Collector for MIT AI news."""
    
    def __init__(self, start_date: str, end_date: str):
        super().__init__(start_date, end_date)
        self.source_name = "MIT"
        self._agent = MITAINewsAgent(start_date, end_date)
    
    def run(self) -> list:
        """Run the MIT collector."""
        print(f"[MITCollector] Collecting news from {self.start_date} to {self.end_date}...")
        try:
            results = self._agent.run()
            print(f"[MITCollector] Collected {len(results)} articles.")
            return results
        except Exception as e:
            print(f"[MITCollector] Error: {e}")
            return []