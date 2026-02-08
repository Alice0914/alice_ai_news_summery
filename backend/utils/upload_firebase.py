
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Credential Path (Check .env or default location)
cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not cred_path:
    # Try default relative path if not in env
    cred_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')

print(f"Using credentials from: {cred_path}")

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def upload_articles(json_path):
    print(f"Loading articles from {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        articles = json.load(f)
    
    # Target Document
    doc_ref = db.collection('news_feeds').document('2026-01')
    
    print(f"Uploading {len(articles)} articles to 'news_feeds/2026-01' (appending to 'news' field)...")
    
    # Use ArrayUnion to append without overwriting
    # Note: Firestore Max Document Size is 1MB. 71 articles might exceed this if accumulated.
    # If "news" field gets too big, we might need subcollections.
    # But User requested "news Field". limiting batch size or just try.
    
    # Batch updates if many? ArrayUnion takes list.
    chunk_size = 10
    chunks = [articles[i:i + chunk_size] for i in range(0, len(articles), chunk_size)]
    
    for i, chunk in enumerate(chunks):
        print(f"  Uploading batch {i+1}/{len(chunks)}...")
        try:
            doc_ref.update({
                'news': firestore.ArrayUnion(chunk)
            })
            print("  ✅ Batch success.")
        except Exception as e:
            # If doc doesn't exist, create it first
            if "NOT_FOUND" in str(e) or "No document to update" in str(e):
                print("  ⚠️ Document not found. Creating new document...")
                doc_ref.set({'news': chunk}) # Set initial data
            else:
                print(f"  ❌ Error uploading batch: {e}")

if __name__ == "__main__":
    json_path = os.path.join(os.path.dirname(__file__), '..', 'notebook', 'final_news_verified_20260130.json')
    upload_articles(json_path)
