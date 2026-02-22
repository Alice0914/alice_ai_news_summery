"""
Base Collector Class
Provides shared functionality for all news collectors.
"""

from abc import ABC, abstractmethod
from datetime import datetime
import requests
from bs4 import BeautifulSoup


class BaseCollector(ABC):
    """Abstract base class for all news collectors."""
    
    def __init__(self, start_date: str, end_date: str):
        """
        Initialize collector with date range.
        
        Args:
            start_date: Start date in YYYY-MM-DD format (inclusive)
            end_date: End date in YYYY-MM-DD format (inclusive)
        """
        self.start_date = start_date
        self.end_date = end_date
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.source_name = "Unknown"
    
    def _normalize_date(self, date_str: str) -> datetime:
        """Convert YYYY-MM-DD string to datetime."""
        return datetime.strptime(date_str, '%Y-%m-%d')
    
    def _is_in_range(self, article_date: datetime) -> bool:
        """Check if article date falls within the configured range."""
        start_dt = self._normalize_date(self.start_date).replace(hour=0, minute=0, second=0)
        end_dt = self._normalize_date(self.end_date).replace(hour=23, minute=59, second=59)
        return start_dt <= article_date <= end_dt
    
    def _fetch_page(self, url: str) -> BeautifulSoup | None:
        """Fetch and parse a web page."""
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            if response.status_code == 200:
                return BeautifulSoup(response.content, 'html.parser')
            print(f"Failed to fetch {url}: {response.status_code}")
            return None
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    @abstractmethod
    def run(self) -> list:
        """
        Execute the collector and return articles.
        
        Returns:
            List of dicts with keys:
            - raw_content: Full article text
            - source_url: Article URL
            - date: Published date
            - raw_title: Article title
            - source_name: Source name (e.g., "Anthropic")
        """
        pass
    
    def _format_output(self, raw_title: str, raw_content: str, source_url: str, date: str) -> dict:
        """Format article data into standard output format."""
        return {
            "raw_title": raw_title,
            "raw_content": raw_content,
            "source_url": source_url,
            "date": date,
            "source_name": self.source_name
        }