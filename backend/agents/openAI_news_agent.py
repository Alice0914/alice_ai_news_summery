"""
OpenAI News Agent
Scrapes news articles from OpenAI News website based on date range.
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import json

# Try to use curl_cffi for Cloudflare bypass, fallback to requests
try:
    from curl_cffi import requests as curl_requests
    HAS_CURL_CFFI = True
except ImportError:
    HAS_CURL_CFFI = False


class OpenAINewsAgent:
    """
    OpenAI News scraper that fetches articles within a date range.
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
    
    def _parse_openai_date(self, date_str: str) -> datetime | None:
        """Parse dates like 'Dec 19, 2025', 'October 31, 2024', etc."""
        if not date_str:
            return None
        date_str = date_str.strip()
        formats = [
            '%b %d, %Y',       # Dec 19, 2025
            '%B %d, %Y',       # October 31, 2024
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
            for fmt in ['%Y-%m-%d', '%b %d, %Y', '%B %d, %Y']:
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
        Scrapes article list from https://openai.com/news/
        """
        url = "https://openai.com/news/"
        
        try:
            start_dt = self._normalize_date(self.start_date)
            end_dt = self._normalize_date(self.end_date)
            if start_dt:
                start_dt = start_dt.replace(hour=0, minute=0, second=0)
            if end_dt:
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
            
            print(f"Fetching OpenAI News List... Range: {start_dt} ~ {end_dt}")
            
            response = self._make_request(url)
            
            if response.status_code != 200:
                print(f"Failed to access list page: {response.status_code}")
                return []
                
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            all_links = soup.find_all('a', href=True)
            
            for link in all_links:
                href = link['href']
                if not (href.startswith('/news/') or href.startswith('/index/')):
                    continue
                if len(href) < 8:
                    continue
                
                full_url = f"https://openai.com{href}" if href.startswith('/') else href
                
                card_text = link.get_text("\n", strip=True)
                texts = card_text.split("\n")
                
                found_date = None
                found_date_str = ""
                title_candidate = ""
                
                for t in texts:
                    d = self._parse_openai_date(t)
                    if d:
                        found_date = d
                        found_date_str = t
                        break
                
                h3 = link.find('h3')
                if h3:
                    title_candidate = h3.get_text(strip=True)
                else:
                    candidates = [line for line in texts if line != found_date_str and len(line) > 10]
                    if candidates:
                        title_candidate = candidates[0]
                    else:
                        title_candidate = "No Title Found"
                
                if found_date:
                    if start_dt <= found_date <= end_dt:
                        if not any(a['url'] == full_url for a in articles):
                            articles.append({
                                'url': full_url,
                                'date': found_date_str,
                                'dt': found_date,
                                'title': title_candidate
                            })
            
            print(f"Found {len(articles)} matching articles in list.")
            return articles
            
        except Exception as e:
            print(f"Error in _get_news_list: {e}")
            return []
    
    def _scrape_article_detail(self, url: str, list_info: dict) -> dict | None:
        """
        Scrapes detail of a single OpenAI article.
        """
        try:
            response = self._make_request(url)
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            content_div = soup.find('article')
            if not content_div:
                content_div = soup.find('div', class_=lambda c: c and 'prose' in c)
            
            if not content_div:
                content_div = soup.find('main') or soup.find('body')
                
            if content_div:
                for tag in content_div(['script', 'style', 'button', 'nav', 'footer', 'header', 'form']):
                    tag.decompose()
                raw_content = content_div.get_text(separator='\n', strip=True)
            else:
                raw_content = ""
                
            return {
                "raw_content": raw_content,
                "source_url": url,
                "date": list_info['date'],
                "raw_title": list_info['title'],
                "source_name": "OpenAI"
            }

        except Exception as e:
            print(f"Error scraping article {url}: {e}")
            return None
    
    def run(self) -> list:
        """
        Execute the scraper for the configured date range.
        Returns list of article items.
        """
        print(f"Starting OpenAI News Scraper ({self.start_date} ~ {self.end_date})...")
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
    agent = OpenAINewsAgent(start_date="2026-01-01", end_date="2026-01-04")
    results = agent.run()
    print(json.dumps(results, ensure_ascii=False, indent=2))
