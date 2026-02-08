"""
MIT AI News Agent
Scrapes AI news from MIT News website based on date range.
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import json

# Try to use curl_cffi for better compatibility, fallback to requests
try:
    from curl_cffi import requests as curl_requests
    HAS_CURL_CFFI = True
except ImportError:
    HAS_CURL_CFFI = False


class MITAINewsAgent:
    """
    MIT News AI scraper that fetches articles within a date range.
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
    
    def _parse_mit_date(self, date_str: str) -> datetime | None:
        """Parse dates like 'December 22, 2025'"""
        if not date_str:
            return None
        date_str = date_str.strip()
        formats = [
            '%B %d, %Y',       # December 22, 2025
            '%b %d, %Y',       # Dec 22, 2025
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
                except:
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
        Scrapes article list from https://news.mit.edu/topic/artificial-intelligence2
        """
        url = "https://news.mit.edu/topic/artificial-intelligence2"
        
        try:
            start_dt = self._normalize_date(self.start_date)
            end_dt = self._normalize_date(self.end_date)
            if start_dt:
                start_dt = start_dt.replace(hour=0, minute=0, second=0)
            if end_dt:
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
            
            print(f"Fetching MIT News List... Range: {start_dt} ~ {end_dt}")
            
            response = self._make_request(url)
            if response.status_code != 200:
                print(f"Failed to access list page: {response.status_code}")
                return []
                
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Container: article.term-page--news-article--item
            items = soup.find_all('article', class_=lambda c: c and 'term-page--news-article--item' in c)
            
            for item in items:
                try:
                    # Title & URL
                    title_el = item.find('h3', class_=lambda c: c and 'term-page--news-article--item--title' in c)
                    link = item.find('a', class_=lambda c: c and 'term-page--news-article--item--title--link' in c)
                    
                    if not link and title_el:
                        link = title_el.find('a')
                    
                    if not link:
                        continue
                    
                    href = link.get('href')
                    full_url = f"https://news.mit.edu{href}" if href.startswith('/') else href
                    title = link.get_text(strip=True)
                    
                    # Date
                    date_el = item.find('time')
                    date_str = ""
                    found_date = None
                    
                    if date_el:
                        dt_attr = date_el.get('datetime')
                        text_date = date_el.get_text(strip=True)
                        
                        if dt_attr:
                            try:
                                found_date = datetime.strptime(dt_attr.split('T')[0], '%Y-%m-%d')
                                found_date_str = text_date if text_date else found_date.strftime('%B %d, %Y')
                            except:
                                pass
                                
                        if not found_date:
                            found_date = self._parse_mit_date(text_date)
                            found_date_str = text_date
                    
                    # Filter
                    if found_date:
                        if start_dt <= found_date <= end_dt:
                            if not any(a['url'] == full_url for a in articles):
                                articles.append({
                                    'url': full_url,
                                    'date': found_date_str,
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
        """
        Scrapes detail of a single MIT article.
        """
        try:
            response = self._make_request(url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Main Content
            content_div = soup.find(class_=lambda c: c and 'news-article--content--body' in c)
            
            if not content_div:
                content_div = soup.find('div', itemprop='articleBody')
            
            if content_div:
                for tag in content_div(['script', 'style', 'button', 'nav', 'footer', 'header', 'form', 'iframe']):
                    tag.decompose()
                raw_content = content_div.get_text(separator='\n', strip=True)
            else:
                raw_content = ""
                
            # Title extraction from Page (verification)
            h1 = soup.find('h1')
            page_title = h1.get_text(strip=True) if h1 else list_info['title']
            
            return {
                "raw_content": raw_content,
                "source_url": url,
                "date": list_info['date'],
                "raw_title": page_title,
                "source_name": "MIT News"
            }

        except Exception as e:
            print(f"Error scraping article {url}: {e}")
            return None
    
    def run(self) -> list:
        """
        Execute the scraper for the configured date range.
        Returns list of article items.
        """
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
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


# Example usage
if __name__ == "__main__":
    # agent = MITAINewsAgent(start_date="2025-12-20", end_date="2026-01-31")
    agent = MITAINewsAgent(start_date, end_date)
    results = agent.run()
    print(json.dumps(results, ensure_ascii=False, indent=2))
