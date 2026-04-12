"""
Firestore Uploader (Step 5)
Uploads final processed articles to Firebase Firestore.
Uses firebase-admin SDK with service account credentials.
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment
env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)


class FirestoreUploader:
    """Uploads processed news articles to Firestore."""

    def __init__(self):
        self.db = None
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK."""
        try:
            # Check if already initialized
            firebase_admin.get_app()
            self.db = firestore.client()
            print("[Uploader] Firebase already initialized.")
            return
        except ValueError:
            pass

        # Method 1: Service account JSON string from environment (GitHub Actions)
        sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
        if sa_json:
            try:
                sa_dict = json.loads(sa_json)
                cred = credentials.Certificate(sa_dict)
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                print("[Uploader] Firebase initialized from environment variable.")
                return
            except Exception as e:
                print(f"[Uploader] Failed to init from env var: {e}")

        # Method 2: Service account JSON file (local development)
        sa_file = Path(__file__).resolve().parent.parent.parent.parent / 'serviceAccountKey.json'
        if sa_file.exists():
            try:
                cred = credentials.Certificate(str(sa_file))
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                print(f"[Uploader] Firebase initialized from {sa_file.name}")
                return
            except Exception as e:
                print(f"[Uploader] Failed to init from file: {e}")

        print("[Uploader] ⚠️ No Firebase credentials found. Upload will be skipped.")

    def run(self, articles: list, target_date: str) -> int:
        """
        Upload articles to Firestore.

        Articles are stored in: news_feeds/{YYYY-MM} document
        Each document has a 'news' array field containing all articles for that month.
        New articles are merged (not overwritten) with existing ones.

        Args:
            articles: List of final formatted article dicts
            target_date: Date string in YYYY-MM-DD format

        Returns:
            Number of articles uploaded
        """
        if not self.db:
            print("[Uploader] ⚠️ Firebase not initialized. Skipping upload.")
            return 0

        if not articles:
            print("[Uploader] No articles to upload.")
            return 0

        # Determine collection path: news_feeds/{YYYY-MM}
        try:
            dt = datetime.strptime(target_date, "%Y-%m-%d")
            month_key = dt.strftime("%Y-%m")
        except ValueError:
            month_key = datetime.now().strftime("%Y-%m")

        doc_ref = self.db.collection("news_feeds").document(month_key)

        print(f"[Uploader] Uploading {len(articles)} articles to news_feeds/{month_key}...")

        try:
            # Get existing document
            doc = doc_ref.get()

            if doc.exists:
                existing_data = doc.to_dict()
                existing_news = existing_data.get("news", [])
                existing_ids = {item.get("id") for item in existing_news}

                # Merge: add only new articles (avoid duplicates)
                new_articles = [a for a in articles if a.get("id") not in existing_ids]
                merged_news = existing_news + new_articles

                doc_ref.set({"news": merged_news}, merge=True)
                print(f"[Uploader] ✅ Merged {len(new_articles)} new articles (total: {len(merged_news)}) into news_feeds/{month_key}")
                return len(new_articles)
            else:
                # Create new document
                doc_ref.set({"news": articles})
                print(f"[Uploader] ✅ Created news_feeds/{month_key} with {len(articles)} articles")
                return len(articles)

        except Exception as e:
            print(f"[Uploader] ❌ Upload failed: {e}")
            return 0
