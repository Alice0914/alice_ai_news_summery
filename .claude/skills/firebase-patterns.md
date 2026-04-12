# Firebase Patterns — Auth/DB Reference

## Available Functions from firebaseConfig.js

### Authentication
```js
import {
  auth,                          // Firebase Auth instance
  signInWithGoogle,              // Google popup login → returns User
  signInWithTwitter,             // Twitter login
  signInWithLinkedIn,            // LinkedIn login
  signUpWithEmail,               // Email signup (email, password, name)
  signInWithEmail,               // Email login (email, password)
  sendResetEmail,                // Send password reset email
  logout,                        // Sign out
  reauthenticateAndUpdatePassword, // Change password (user, currentPw, newPw)
  handleGoogleRedirectResult,    // Handle mobile redirect result
  getDiceBearAvatar,             // Generate random avatar URL (seed)
  saveUserToFirestore,           // Save user info to Firestore
  logUserAccess,                 // Log access event
} from '../firebaseConfig';
```

### Data (Firestore)
```js
import {
  db,                            // Firestore instance
  saveBookmark,                  // Save bookmark (uid, newsItem)
  removeBookmark,                // Remove bookmark (uid, newsId)
  toggleLike,                    // Toggle like (uid, newsItem, isCurrentlyLiked)
  subscribeToUserData,           // Real-time user data subscription (uid, callback)
  saveUserPreferences,           // Save preferences (uid, {categories, productServices, coreElements})
} from '../firebaseConfig';
```

## Firestore Collection Schema

```
Firestore
├── news_feeds/{YYYY-MM}               ← Monthly news documents
│   └── news: [                         ← News array
│       {
│         id: "uuid",
│         title: "...",               title_ko: "...",
│         summary: "...",             summary_ko: "...",
│         why_it_matters: "...",      why_it_matters_ko: "...",
│         searchKeywords: [...],      searchKeywords_ko: [...],
│         categories: ["AI Research", ...],
│         productServices: ["ChatGPT", ...],
│         coreElements: ["Text", ...],
│         sourceUrl: "https://...",
│         imageUrl: "https://...",
│         publishedDate: "2026-04-10",
│         impactScore: 85,
│         likes: 12
│       }, ...
│     ]
│
├── users/{uid}                         ← User profile
│   ├── email, displayName, photoURL
│   ├── createdAt, lastLoginAt
│   └── preferences: {
│       categories: [...],
│       productServices: [...],
│       coreElements: [...],
│       language: "en" | "ko"
│     }
│
├── users/{uid}/bookmarks/{newsId}      ← Bookmarks (subcollection)
│   └── { ...full news data, savedAt }
│
├── users/{uid}/likes/{newsId}          ← Likes (subcollection)
│   └── { newsId, likedAt }
│
└── access_logs/{auto-id}              ← Access logs
    └── { uid, timestamp, userAgent, ... }
```

## Auth Flow

```
App start → onAuthStateChanged listener
  ├── Logged-in user found → step=5 (news feed)
  ├── Returning visitor (localStorage) → step=5 (guest mode)
  └── First visit → step=1 (landing page)

Social login → signInWithGoogle()
  → triggers onAuthStateChanged
  → saveUserToFirestore()
  → setStep(5)

Logout → logout()
  → setStep(0) (login page)
  → wasLoggedIn.current = false
```

## Bookmark/Like Pattern (Optimistic Updates)

```jsx
// This project's pattern: update UI first → save to server async

const handleToggleSave = async (newsItem) => {
  // 1. Unauthenticated user → show login modal
  if (!user || user.isAnonymous) {
    setIsAuthModalOpen(true);
    return;
  }

  // 2. Update UI immediately (optimistic)
  const newSavedIds = new Set(savedNewsIds);
  if (isSaved) newSavedIds.delete(newsItem.id);
  else newSavedIds.add(newsItem.id);
  setSavedNewsIds(newSavedIds);

  // 3. Save to server (async)
  try {
    if (isSaved) await removeBookmark(user.uid, newsItem.id);
    else await saveBookmark(user.uid, newsItem);
  } catch (error) {
    console.error("Failed to toggle bookmark", error);
    // No rollback — subscribeToUserData will sync
  }
};
```

## Real-time Data Subscription

```jsx
// subscribeToUserData uses onSnapshot — detects real-time changes
useEffect(() => {
  if (user && !user.isAnonymous) {
    const unsubscribe = subscribeToUserData(user.uid, ({ likes, bookmarks, preferences }) => {
      setLikedNewsIds(new Set(likes));
      setSavedNewsItems(bookmarks);
      setSavedNewsIds(new Set(bookmarks.map(b => b.id)));

      if (preferences?.language) i18n.changeLanguage(preferences.language);
      if (preferences?.categories) setSelectedInterests(migrateIds(preferences.categories, CATEGORY_ID_MAP_REV));
    });
    return () => unsubscribe();
  }
}, [user]);
```
