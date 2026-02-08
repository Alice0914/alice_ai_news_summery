"""
Google AI News Agent
Scrapes AI news from Google News RSS feed based on date range.
Refactored from google_news_AI_v2.py (Version 5.1 - Stable)
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import re
import json

class GoogleAINewsAgent:
    """
    Google News AI scraper that fetches articles within a date range.
    """
    
    def __init__(self, start_date_str: str, end_date_str: str, limit: int = None):
        """
        Initialize the agent with date range.
        
        Args:
            start_date_str: Start date in YYYY-MM-DD format (inclusive)
            end_date_str: End date in YYYY-MM-DD format (inclusive)
            limit: Optional maximum number of articles to fetch
        """
        self.start_date_str = start_date_str
        self.end_date_str = end_date_str
        self.limit = limit
        
    def _parse_rss_date(self, date_str):
        if not date_str: return None
        try:
            dt = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %Z")
            return dt
        except ValueError:
            pass
        try:
            dt = datetime.strptime(date_str.rsplit(' ', 1)[0], "%a, %d %b %Y %H:%M:%S")
            return dt
        except ValueError:
            pass
        return None

    def _resolve_url(self, url):
        """Resolves Google News redirects aggressively."""
        try:
            # Use standard requests with browser headers
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
            resp = requests.get(url, headers=headers, allow_redirects=True, timeout=10)
                
            final_url = resp.url
            if "news.google.com" not in final_url and "consent.google.com" not in final_url:
                return final_url
                
            text = resp.content.decode('utf-8', errors='ignore')
            # Aggressive Regex to find the real link in the Google redirect page
            candidates = re.findall(r'(https?://[^"\'\s<>]+)', text)
            best = None
            for c in candidates:
                if "google.com" not in c and "gstatic" not in c and "w3.org" not in c and "googleusercontent.com" not in c and "googleapis.com" not in c:
                    if best is None or len(c) > len(best):
                        best = c
            return best if best else final_url
        except Exception:
            return url

    def _extract_article_content(self, url):
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
            try:
                response = requests.get(url, headers=headers, timeout=15)
            except:
                return ""
                
            if response.status_code != 200:
                return ""
                
            soup = BeautifulSoup(response.content, 'html.parser')
            # Remove noise
            for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'form', 'button', 'iframe', 'ads', 'noscript']):
                tag.decompose()
                
            paragraphs = soup.find_all('p')
            # Fallback to div if p tags are scarce
            if len(paragraphs) < 2:
                divs = soup.find_all('div')
                for d in divs:
                    txt = d.get_text(separator=' ', strip=True)
                    if len(txt) > 80 and len(txt) < 1000:
                        paragraphs.append(d)

            valid_paragraphs = []
            for p in paragraphs:
                text = p.get_text(separator=' ', strip=True)
                if len(text) > 60 and "cookie" not in text.lower():
                    valid_paragraphs.append(text)
                    
            return "\n\n".join(valid_paragraphs[:2])
        except Exception:
            return ""

    def run(self) -> list:
        """
        Execute the scraper for the configured date range.
        Returns list of article items.
        """
        rss_url = "https://news.google.com/rss/search?q=AI&hl=en-US&gl=US&ceid=US:en"
        
        start_date = datetime.strptime(self.start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(self.end_date_str, "%Y-%m-%d")
        end_date = end_date.replace(hour=23, minute=59, second=59)

        try:
            # Use standard requests only
            response = requests.get(rss_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)

            if response.status_code != 200:
                 return []
                 
            soup = BeautifulSoup(response.content, 'xml')
            items = soup.find_all('item')
            
            print(f"--- STARTING PROCESS (GoogleAINewsAgent) ---")
            print(f"Found {len(items)} items. Limit set to: {self.limit}")
            
            articles = []
            processed_count = 0
            
            for item in items:
                # STRICT LIMIT CHECK
                if self.limit and processed_count >= self.limit:
                    print(f"*** LIMIT REACHED ({self.limit}) - STOPPING ***")
                    break
                
                try:
                    title = item.title.get_text(strip=True)
                    pub_date_str = item.pubDate.get_text(strip=True)
                    link = item.link.get_text(strip=True)
                    source_name = item.source.get_text(strip=True) if item.source else "Unknown"
                    
                    date_obj = self._parse_rss_date(pub_date_str)
                    if not date_obj: continue
                    
                    date_obj_naive = date_obj.replace(tzinfo=None)
                    if not (start_date <= date_obj_naive <= end_date):
                        continue

                    processed_count += 1
                    print(f"[{processed_count}/{self.limit or 'all'}] Processing: {title[:40]}...")
                    
                    final_url = self._resolve_url(link)
                    raw_content = self._extract_article_content(final_url)
                    
                    article_data = {
                        'raw_content': raw_content,
                        'source_url': final_url,
                        'date': date_obj.strftime("%b %d, %Y"),
                        'raw_title': title,
                        'source_name': source_name
                    }
                    articles.append(article_data)
                    time.sleep(1)
                    
                except Exception as e:
                    print(f"Error on item: {e}")
                    continue
                    
            print(f"Done. Scraped {len(articles)} articles.")
            return articles
        except Exception as e:
            print(f"Fatal error: {e}")
            return []
    
    def run_json(self) -> str:
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


# Example usage
if __name__ == "__main__":
    # agent = GoogleAINewsAgent(start_date_str="2026-01-04", end_date_str="2026-01-05", limit=3)
    # results = agent.run()
    # print(json.dumps(results, ensure_ascii=False, indent=2))
    pass
