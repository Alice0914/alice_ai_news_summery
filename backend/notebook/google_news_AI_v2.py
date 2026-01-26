# =============================================================================
# GOOGLE NEWS SCRAPER [VERSION 5.1 - STABLE - PYTHON SCRIPT]
# =============================================================================

import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import re

# FORCE DISABLE CURL_CFFI TO PREVENT CRASHES
HAS_CURL_CFFI = False 

def parse_rss_date(date_str):
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

def resolve_url(url):
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
            if "google.com" not in c and "gstatic" not in c and "w3.org" not in c:
                if best is None or len(c) > len(best):
                    best = c
        return best if best else final_url
    except Exception:
        return url

def extract_article_content(url):
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

def get_google_news_ai(start_date_str, end_date_str, limit=None):
    rss_url = "https://news.google.com/rss/search?q=AI&hl=en-US&gl=US&ceid=US:en"
    
    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    end_date = end_date.replace(hour=23, minute=59, second=59)

    try:
        # Use standard requests only
        response = requests.get(rss_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)

        if response.status_code != 200:
             return []
             
        soup = BeautifulSoup(response.content, 'xml')
        items = soup.find_all('item')
        
        print(f"--- STARTING PROCESS (VERSION 5.1 - Python Script) ---")
        print(f"Found {len(items)} items. Limit set to: {limit}")
        
        articles = []
        processed_count = 0
        
        for item in items:
            # STRICT LIMIT CHECK
            if limit and processed_count >= limit:
                print(f"*** LIMIT REACHED ({limit}) - STOPPING ***")
                break
            
            try:
                title = item.title.get_text(strip=True)
                pub_date_str = item.pubDate.get_text(strip=True)
                link = item.link.get_text(strip=True)
                source_name = item.source.get_text(strip=True) if item.source else "Unknown"
                
                date_obj = parse_rss_date(pub_date_str)
                if not date_obj: continue
                
                date_obj_naive = date_obj.replace(tzinfo=None)
                if not (start_date <= date_obj_naive <= end_date):
                    continue

                processed_count += 1
                print(f"[{processed_count}/{limit}] Processing: {title[:40]}...")
                
                final_url = resolve_url(link)
                raw_content = extract_article_content(final_url)
                
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
                
        return articles
    except Exception as e:
        print(f"Fatal error: {e}")
        return []

# =========================================
# EXECUTION
# =========================================
if __name__ == "__main__":
    s = "2026-01-04"
    e = "2026-01-05"
    res = get_google_news_ai(s, e, limit=3)
    print(f"\nCompleted. Extracted {len(res)} articles.")
    if res:
        print(res[0])
