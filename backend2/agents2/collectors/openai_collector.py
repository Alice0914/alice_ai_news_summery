# backend2/agents2/collectors/openai_collector.py
"""
OpenAI News Collector
Wraps the OpenAINewsAgent to scrape AI news.
Uses Selenium to bypass bot detection.
"""

import sys
import os
import json
import time
from datetime import datetime
from bs4 import BeautifulSoup

# Ensure backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

# Try to import Selenium
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from webdriver_manager.chrome import ChromeDriverManager
    HAS_SELENIUM = True
except ImportError:
    HAS_SELENIUM = False
    print("Warning: Selenium not installed. Install with: pip install selenium webdriver-manager")

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
# OpenAI News Agent (Scraper Logic)
# ------------------------------------------------------------------------

class OpenAINewsAgent:
    """
    OpenAI News scraper that fetches articles within a date range.
    Uses Selenium to bypass bot detection.
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
        self.driver = None
    
    def _init_driver(self):
        """Initialize Selenium WebDriver."""
        if not HAS_SELENIUM:
            raise ImportError("Selenium is required. Install with: pip install selenium webdriver-manager")
        
        if self.driver is None:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
    
    def _close_driver(self):
        """Close Selenium WebDriver."""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
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
                except ValueError:
                    continue
        return d
    
    def _get_news_list(self) -> list:
        """
        Scrapes article list from https://openai.com/news/ using Selenium
        """
        url = "https://openai.com/news/"
        
        try:
            start_dt = self._normalize_date(self.start_date)
            end_dt = self._normalize_date(self.end_date)
            
            # Ensure proper datetime comparison
            if start_dt:
                start_dt = start_dt.replace(hour=0, minute=0, second=0)
            if end_dt:
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
            
            print(f"Fetching OpenAI News List... Range: {start_dt} ~ {end_dt}")
            
            # Initialize Selenium and load page
            self._init_driver()
            self.driver.get(url)
            
            # Wait for page to load
            time.sleep(3)
            
            # Scroll down to load more content
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
            
            # Get page source and parse with BeautifulSoup
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            articles = []
            
            # Find all links that look like news items
            all_links = soup.find_all('a', href=True)
            
            for link in all_links:
                href = link['href']
                
                # Filter strictly for news or index pages
                if not (href.startswith('/news/') or href.startswith('/index/')):
                    continue
                if len(href) < 8: # Filter out short/root links
                    continue
                
                full_url = f"https://openai.com{href}" if href.startswith('/') else href
                
                # Extract text from the card (usually includes Date and Title)
                card_text = link.get_text("\n", strip=True)
                texts = card_text.split("\n")
                
                found_date = None
                found_date_str = ""
                title_candidate = ""
                
                # 1. Try to find the date first
                for t in texts:
                    d = self._parse_openai_date(t)
                    if d:
                        found_date = d
                        found_date_str = t
                        break
                
                # 2. Try to find the title
                h3 = link.find('h3')
                if h3:
                    title_candidate = h3.get_text(strip=True)
                else:
                    # Fallback: Find the longest line that isn't the date
                    candidates = [line for line in texts if line != found_date_str and len(line) > 10]
                    if candidates:
                        title_candidate = candidates[0]
                    else:
                        title_candidate = "No Title Found"
                
                # 3. Filter by date and uniqueness
                if found_date and start_dt and end_dt:
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
            import traceback
            traceback.print_exc()
            return []
    
    def _scrape_article_detail(self, url: str, list_info: dict) -> dict | None:
        """
        Scrapes detail of a single OpenAI article using Selenium.
        """
        try:
            self.driver.get(url)
            time.sleep(2)
            
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Try to find the main content container
            content_div = soup.find('article')
            if not content_div:
                content_div = soup.find('div', class_=lambda c: c and 'prose' in c)
            
            # Fallback to main or body if specific container not found
            if not content_div:
                content_div = soup.find('main') or soup.find('body')
                
            if content_div:
                # Remove non-content elements
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
        try:
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
        finally:
            self._close_driver()
    
    def run_json(self) -> str:
        """Run and return results as JSON string."""
        return json.dumps(self.run(), ensure_ascii=False, indent=2)

# ------------------------------------------------------------------------
# Collector Wrapper
# ------------------------------------------------------------------------

class OpenAICollector(BaseCollector):
    """Collector for OpenAI news."""
    
    def __init__(self, start_date: str, end_date: str):
        super().__init__(start_date, end_date)
        self.source_name = "OpenAI"
        self._agent = OpenAINewsAgent(start_date, end_date)
    
    def run(self) -> list:
        """Run the OpenAI collector."""
        print(f"[OpenAICollector] Collecting news from {self.start_date} to {self.end_date}...")
        try:
            results = self._agent.run()
            print(f"[OpenAICollector] Collected {len(results)} articles.")
            return results
        except Exception as e:
            print(f"[OpenAICollector] Error: {e}")
            return []

# ------------------------------------------------------------------------
# Main Execution
# ------------------------------------------------------------------------

# if __name__ == "__main__":
#     # Test dates
#     start_date = "2024-01-01"
#     end_date = "2026-01-31"
    
#     # Run the collector
#     collector = OpenAICollector(start_date, end_date)
#     results = collector.run()
    
#     print("\n--- JSON Output ---")
#     print(json.dumps(results, ensure_ascii=False, indent=2))
