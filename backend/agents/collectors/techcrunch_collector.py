# backend/agents/collectors/techcrunch_collector.py
"""
TechCrunch AI News Collector
Fetches AI news articles from TechCrunch RSS feed within a specified date range.
"""

import sys
import os
import json
import time
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from bs4 import BeautifulSoup

# Ensure backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

# Import BaseCollector
try:
    from .base_collector import BaseCollector
except ImportError:
    # Fallback for standalone testing
    class BaseCollector:
        def __init__(self, start_date, end_date):
            self.start_date = start_date
            self.end_date = end_date
        def run(self): pass


class TechCrunchAIAgent:
    """
    TechCrunch AI News scraper that fetches articles from RSS feed within a date range.
    """
    
    def __init__(self, start_date: str, end_date: str):
        self.start_date = start_date
        self.end_date = end_date
        self.rss_url = "https://techcrunch.com/category/artificial-intelligence/feed/"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def _parse_rss_date(self, date_str: str) -> datetime | None:
        """
        Parse RSS pubDate format: 'Wed, 05 Feb 2026 14:30:00 +0000'
        """
        if not date_str:
            return None
        date_str = date_str.strip()
        
        # Common RSS date formats
        formats = [
            '%a, %d %b %Y %H:%M:%S %z',  # Wed, 05 Feb 2026 14:30:00 +0000
            '%a, %d %b %Y %H:%M:%S %Z',  # Wed, 05 Feb 2026 14:30:00 GMT
            '%Y-%m-%dT%H:%M:%S%z',       # 2026-02-05T14:30:00+00:00
            '%Y-%m-%d %H:%M:%S',         # 2026-02-05 14:30:00
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        print(f"Warning: Could not parse date '{date_str}'")
        return None
    
    def _normalize_date(self, d) -> datetime | None:
        """Normalize date input to datetime object."""
        if isinstance(d, str):
            for fmt in ['%Y-%m-%d', '%B %d, %Y', '%b %d, %Y']:
                try:
                    return datetime.strptime(d, fmt)
                except ValueError:
                    continue
        return d
    
    def _get_rss_articles(self) -> list:
        """Fetch and parse articles from TechCrunch AI RSS feed."""
        try:
            start_dt = self._normalize_date(self.start_date)
            end_dt = self._normalize_date(self.end_date)
            
            if start_dt:
                start_dt = start_dt.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
            if end_dt:
                end_dt = end_dt.replace(hour=23, minute=59, second=59, microsecond=0, tzinfo=None)
            
            print(f"Fetching TechCrunch RSS Feed... Range: {start_dt} ~ {end_dt}")
            
            response = requests.get(self.rss_url, headers=self.headers, timeout=30)
            if response.status_code != 200:
                print(f"Failed to access RSS feed: {response.status_code}")
                return []
            
            # Parse XML
            root = ET.fromstring(response.content)
            articles = []
            
            # Navigate to items in RSS feed
            for item in root.findall('.//item'):
                try:
                    title_elem = item.find('title')
                    link_elem = item.find('link')
                    pubdate_elem = item.find('pubDate')
                    
                    if title_elem is None or link_elem is None or pubdate_elem is None:
                        continue
                    
                    title = title_elem.text or ""
                    url = link_elem.text or ""
                    date_str = pubdate_elem.text or ""
                    
                    # Parse date
                    article_date = self._parse_rss_date(date_str)
                    if not article_date:
                        continue
                    
                    # Remove timezone info for comparison
                    article_date_naive = article_date.replace(tzinfo=None)
                    
                    # Check if within date range
                    if start_dt and end_dt:
                        if start_dt <= article_date_naive <= end_dt:
                            if not any(a['url'] == url for a in articles):
                                articles.append({
                                    'url': url,
                                    'date': date_str,
                                    'dt': article_date_naive,
                                    'title': title
                                })
                                print(f"  ✓ Found: {title[:50]}... ({article_date_naive.strftime('%Y-%m-%d')})")
                
                except Exception as e:
                    print(f"Error parsing RSS item: {e}")
                    continue
            
            print(f"Found {len(articles)} matching articles in RSS feed.")
            return articles
            
        except Exception as e:
            print(f"Error in _get_rss_articles: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _scrape_article_detail(self, url: str, list_info: dict) -> dict | None:
        """Scrape full content of a single TechCrunch article."""
        try:
            print(f"    Fetching content from: {url}")
            response = requests.get(url, headers=self.headers, timeout=30)
            
            if response.status_code != 200:
                print(f"    Failed to fetch article: {response.status_code}")
                return None
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find article content - TechCrunch uses specific class names
            content_div = soup.find('div', class_='article-content')
            if not content_div:
                content_div = soup.find('article')
            if not content_div:
                content_div = soup.find('main')
            
            if content_div:
                # Remove unwanted elements
                for tag in content_div(['script', 'style', 'button', 'nav', 'footer', 'header', 'form', 'aside']):
                    tag.decompose()
                
                # Extract text content
                raw_content = content_div.get_text(separator='\n', strip=True)
            else:
                raw_content = ""
                print(f"    Warning: Could not find article content div")
            
            # Get title from page
            h1 = soup.find('h1')
            page_title = h1.get_text(strip=True) if h1 else list_info['title']
            
            # Convert date to YYYY-MM-DD format
            formatted_date = list_info['dt'].strftime('%Y-%m-%d') if list_info.get('dt') else list_info['date']
            
            return {
                "raw_content": raw_content,
                "source_url": url,
                "date": formatted_date,
                "raw_title": page_title,
                "source_name": "TechCrunch"
            }
        
        except Exception as e:
            print(f"Error scraping article {url}: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def run(self) -> list:
        """Execute the scraper for the configured date range."""
        print(f"Starting TechCrunch AI News Scraper ({self.start_date} ~ {self.end_date})...")
        target_articles = self._get_rss_articles()
        results = []
        
        for i, article in enumerate(target_articles, 1):
            print(f"\n[{i}/{len(target_articles)}] Scraping: {article['title'][:60]}...")
            details = self._scrape_article_detail(article['url'], article)
            if details:
                results.append(details)
                print(f"    ✓ Success")
            else:
                print(f"    ✗ Failed")
            
            # Be polite to the server
            time.sleep(1)
        
        print(f"\n{'='*60}")
        print(f"Done. Successfully scraped {len(results)}/{len(target_articles)} articles.")
        print(f"{'='*60}")
        return results
    
    def run_json(self) -> str:
        """Return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


class TechCrunchCollector(BaseCollector):
    """Collector for TechCrunch AI news."""
    
    def __init__(self, start_date: str, end_date: str):
        super().__init__(start_date, end_date)
        self.source_name = "TechCrunch"
        self._agent = TechCrunchAIAgent(start_date, end_date)
    
    def run(self) -> list:
        """Run the TechCrunch collector."""
        print(f"[TechCrunchCollector] Collecting news from {self.start_date} to {self.end_date}...")
        try:
            results = self._agent.run()
            print(f"[TechCrunchCollector] Collected {len(results)} articles.")
            return results
        except Exception as e:
            print(f"[TechCrunchCollector] Error: {e}")
            import traceback
            traceback.print_exc()
            return []


# Standalone testing
if __name__ == "__main__":
    # Example usage
    collector = TechCrunchCollector(
        start_date="2026-02-01",
        end_date="2026-02-08"
    )
    
    results = collector.run()
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    for i, article in enumerate(results, 1):
        print(f"{i}. {article['raw_title']}")
        print(f"   URL: {article['source_url']}")
        print(f"   Date: {article['date']}")
        print(f"   Content length: {len(article['raw_content'])} chars")
        print()
