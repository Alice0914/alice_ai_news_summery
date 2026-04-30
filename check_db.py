import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

docs = list(db.collection('news_feeds').stream())
docs.sort(key=lambda x: x.id, reverse=True)

print("All news_feeds documents:")
for d in docs[:10]:
    news_list = d.to_dict().get('news', [])
    print(f"Doc: {d.id}, News Count: {len(news_list)}")
