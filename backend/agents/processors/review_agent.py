
# backend/agents/processors/review_agent.py

import re
import json
# Removed potentially conflicting imports if they existed in prior versions
# But actually the error is likely from another imported module or environment
# Let's ensure strict imports

from ..taxonomy import CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP

class ReviewAgent:
    """
    Validates News Articles before Saving.
    Ensures data integrity, translation quality, and correct taxonomy.
    """

    def __init__(self):
        self.category_keys = set(CATEGORY_ID_MAP.keys())
        self.service_keys = set(SERVICE_ID_MAP.keys())
        self.core_keys = set(CORE_ID_MAP.keys())
        
        # Regex for Hangul (Korean characters)
        self.hangul_pattern = re.compile(r'[가-힣]')

    def run(self, article: dict) -> dict:
        """
        Validates a SINGLE article.
        Returns result dict with:
        - logic: True/False (Pass/Fail)
        - reason: If failed, list of reasons.
        """
        errors = []

        # 1. Field Completeness Check
        required_fields = ['id', 'title', 'publishedDate', 'summary', 'source', 'sourceUrl', 'impactScore']
        for field in required_fields:
            if field not in article or article[field] is None:
                errors.append(f"Missing required field: {field}")
            elif isinstance(article[field], str) and not article[field].strip():
                errors.append(f"Empty required field: {field}")

        # 2. Translation Check (Must contain Hangul)
        translation_fields = ['title_ko', 'summary_ko']
        for field in translation_fields:
            val = article.get(field, "")
            if not val or not self.hangul_pattern.search(str(val)):
                errors.append(f"Translation Missing or Invalid (No Korean): {field}")

        # 3. Taxonomy Check
        # Categories
        cats = article.get('categories', [])
        if not cats:
            errors.append("Categories list is empty")
        else:
            invalid_cats = [c for c in cats if c not in self.category_keys]
            if invalid_cats:
                errors.append(f"Invalid Categories found: {invalid_cats}")

        # Product Services
        # (Optional but recommended to check if present)
        srvs = article.get('productServices', [])
        invalid_srvs = [s for s in srvs if s not in self.service_keys]
        if invalid_srvs:
            errors.append(f"Invalid ProductServices found: {invalid_srvs}")

        # Core Elements
        elems = article.get('coreElements', [])
        invalid_elems = [e for e in elems if e not in self.core_keys]
        if invalid_elems:
            errors.append(f"Invalid CoreElements found: {invalid_elems}")

        # Result construction
        is_valid = len(errors) == 0
        return {
            "valid": is_valid,
            "errors": errors,
            "article_id": article.get('id', 'unknown')
        }

    def review_batch(self, articles: list) -> tuple[list, list]:
        """
        Reviews a batch of articles.
        Returns: (valid_articles, invalid_articles_with_reasons)
        """
        valid_list = []
        invalid_list = []

        print(f"[ReviewAgent] Reviewing {len(articles)} articles...")

        for article in articles:
            result = self.run(article)
            if result['valid']:
                valid_list.append(article)
            else:
                invalid_entry = {
                    "article": article,
                    "reasons": result['errors']
                }
                invalid_list.append(invalid_entry)
                print(f"  [-] Article Rejected ({article.get('title', 'No Title')[:30]}...): {', '.join(result['errors'])}")

        print(f"[ReviewAgent] Passed: {len(valid_list)}, Rejected: {len(invalid_list)}")
        return valid_list, invalid_list
