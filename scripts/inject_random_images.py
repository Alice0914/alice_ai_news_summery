import firebase_admin
from firebase_admin import credentials, firestore
import random
import datetime

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# 1. Image Pool (Add more URLs here)
IMAGE_POOL = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIfWEXbpXO5OCnTu06ycd96UlHV6DuP-xLiA&s", # Robot Hand
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShoKK4j3BqP-Eq46Zk5U4NZE6BTF68r6R9qQ&s", # Blue Brain
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Rmhr_fSskJUOvfZE84F9Dyk7JFO0IWV--g&s", # Cyber Face
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRsa0gvP1z5vTxNHU-C3pmmQvOsE7b0iOucg&s", # AI Network
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9XZ-FRPygIZaCna7F2E71yf4MGBkyXkVj3g&s", # Future City
    # Add more...
]

# 2. Target Date (Default: Current Month)
now = datetime.datetime.now()
DOC_ID = f"{now.year}-{now.month:02d}" # e.g., "2025-12"

# 3. Path to Service Account Key
# IMPORTANT: You must download this from Firebase Console > Project Settings > Service Accounts
SERVICE_ACCOUNT_KEY = "./serviceAccountKey.json"

# ==============================================================================
# MAIN SCRIPT
# ==============================================================================

def inject_random_images():
    # Initialize Firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    doc_ref = db.collection('news_data').document(DOC_ID)
    
    print(f"Fetching document: news_data/{DOC_ID}...")
    doc = doc_ref.get()
    
    if not doc.exists:
        print("Document does not exist!")
        return

    data = doc.to_dict()
    news_list = data.get('news', [])
    
    print(f"Found {len(news_list)} news items.")
    
    # Update Logic: Assign Random Image to Top N items (or all)
    # Let's assign to ALL items for now so any can be Top 5 without missing image
    updated_count = 0
    
    for news in news_list:
        # If you only want to update items that DON'T have an image yet:
        # if 'imageUrl' not in news:
        
        # Or force update all to ensure rotation:
        random_image = random.choice(IMAGE_POOL)
        news['imageUrl'] = random_image
        updated_count += 1

    # Write back to Firestore
    if updated_count > 0:
        doc_ref.update({'news': news_list})
        print(f"Successfully updated {updated_count} news items with random images.")
    else:
        print("No updates made.")

if __name__ == "__main__":
    try:
        inject_random_images()
    except Exception as e:
        print(f"Error: {e}")
        print("Did you place the 'serviceAccountKey.json' file in this directory?")
