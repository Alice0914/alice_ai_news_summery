"""
Anthropic Blogs Agent
Scrapes news articles from anthropic.com/news based on date range.
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import json


class AnthropicBlogsAgent:
    """
    Anthropic News scraper that fetches articles within a date range.
    """
    
    def __init__(self, start_input: str, end_input: str):
        """
        Initialize the agent with date range.
        
        Args:
            start_input: Start date in YYYY-MM-DD format (inclusive)
            end_input: End date in YYYY-MM-DD format (inclusive)
        """
        self.start_input = start_input
        self.end_input = end_input
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def _parse_anthropic_date(self, date_str: str) -> datetime | None:
        """Parse dates like 'Dec 19, 2025' or 'Jan 3, 2026'"""
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str.strip(), '%b %d, %Y')
        except ValueError:
            try:
                return datetime.strptime(date_str.strip().split('\n')[0], '%b %d, %Y')
            except:
                return None
    
    def _normalize_date(self, d) -> datetime:
        """Convert string 'YYYY-MM-DD' to datetime, or return datetime as is."""
        if isinstance(d, str):
            return datetime.strptime(d, '%Y-%m-%d')
        return d
    
    def _get_news_list(self) -> list:
        """
        Scrapes the list of articles from Anthropic News.
        Filters articles published between start_input and end_input (inclusive).
        """
        url = "https://www.anthropic.com/news"
        
        # Normalize dates
        start_dt = self._normalize_date(self.start_input)
        end_dt = self._normalize_date(self.end_input)
        
        # Set time boundaries for inclusive range
        start_dt = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        end_dt = end_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        try:
            response = requests.get(url, headers=self.headers)
            if response.status_code != 200:
                print(f"Failed to fetch list page: {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Find all links with time tags
            all_links = soup.find_all('a', href=True)
            candidate_items = [a for a in all_links if a.find('time')]
            
            print(f"Found {len(candidate_items)} potential article cards. "
                  f"Filtering range: {start_dt.strftime('%Y-%m-%d')} ~ {end_dt.strftime('%Y-%m-%d')}")
            
            for item in candidate_items:
                try:
                    href = item.get('href')
                    full_url = f"https://www.anthropic.com{href}" if href.startswith('/') else href
                    
                    time_tag = item.find('time')
                    date_str = time_tag.get_text(strip=True) if time_tag else ""
                    article_date = self._parse_anthropic_date(date_str)
                    
                    full_card_text = item.get_text(" ", strip=True)
                    if date_str:
                        title = full_card_text.replace(date_str, "").strip()
                    else:
                        title = full_card_text
                    
                    if article_date:
                        # Date Range Check (inclusive)
                        if start_dt <= article_date <= end_dt:
                            articles.append({
                                'url': full_url,
                                'title': title,
                                'date': date_str
                            })
                        
                except Exception as e:
                    print(f"Error parsing list item: {e}")
                    continue
                    
            return articles
        except Exception as e:
            print(f"Error in _get_news_list: {e}")
            return []
    
    def _scrape_article_detail(self, url: str) -> dict | None:
        """
        Scrapes detail of a single Anthropic article.
        Returns { 'raw_content', 'source_url', 'date' }
        """
        try:
            response = requests.get(url, headers=self.headers)
            if response.status_code != 200:
                print(f"Failed to fetch article: {url}")
                return None
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find content div
            content_div = soup.find('div', class_=lambda c: c and 'Body-module' in str(c))
            if not content_div:
                content_div = soup.find('article')
            if not content_div:
                content_div = soup.find('main')
            
            if content_div:
                for tag in content_div(['script', 'style', 'button', 'nav', 'footer', 'form']):
                    tag.decompose()
                for h in content_div.find_all('header'):
                    h.decompose()
                full_text = content_div.get_text(separator='\n', strip=True)
            else:
                full_text = soup.body.get_text(separator='\n', strip=True) if soup.body else ""
            
            date_str = "Unknown"
            time_tag = soup.find('time')
            if time_tag:
                date_str = time_tag.get_text(strip=True)

            return {
                "raw_content": full_text,
                "source_url": url,
                "date": date_str
            }

        except Exception as e:
            print(f"Error scraping article {url}: {e}")
            return None
    
    def run(self) -> list:
        """
        Execute the scraper for the configured date range.
        Returns list of article items.
        """
        print(f"Starting Anthropic Scraper ({self.start_input} ~ {self.end_input})...")
        target_articles = self._get_news_list()
        
        results = []
        print(f"Processing {len(target_articles)} articles...")
        
        for article in target_articles:
            print(f"  > Scraping: {article['title'][:30]}... ({article['date']})")
            details = self._scrape_article_detail(article['url'])
            if details:
                if (not details['date'] or details['date'] == "Unknown") and article['date']:
                    details['date'] = article['date']
                
                # Merge Title from List
                details['raw_title'] = article['title']
                details['source_name'] = "Anthropic"
                
                results.append(details)
            time.sleep(1)
            
        print(f"Done. Scraped {len(results)} articles.")
        return results
    
    def run_json(self) -> str:
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)


# Example usage
if __name__ == "__main__":
    agent = AnthropicBlogsAgent(start_input="2025-12-19", end_input="2025-12-31")
    results = agent.run()
    print(json.dumps(results, ensure_ascii=False, indent=2))
