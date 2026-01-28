import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    deleteDoc, // Added
    serverTimestamp,
    onSnapshot, // Added
    query,
    orderBy,
    runTransaction,
    updateDoc, // Added
    arrayUnion, // Added
    arrayRemove, // Added
} from 'firebase/firestore';
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged,
    GoogleAuthProvider,
    OAuthProvider,
    TwitterAuthProvider, // Added
    signInWithPopup,
    signInWithRedirect, // Added: For mobile
    getRedirectResult, // Added: For mobile
    createUserWithEmailAndPassword, // Added
    signInWithEmailAndPassword, // Added
    updateProfile, // Added
    signOut,
    updatePassword, // Added: Password Change
    reauthenticateWithCredential, // Added: Password Change
    EmailAuthProvider, // Added: Password Change
    sendPasswordResetEmail, // Added: Password Reset
} from 'firebase/auth';

// Firebase configuration pulled from environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Debug: Log which config values are present (development only)
if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 Firebase Config Check:');
    Object.keys(firebaseConfig).forEach((key) => {
        const value = firebaseConfig[key];
        const hasValue = value && value !== 'undefined' && String(value).trim() !== '';
        console.log(`  ${hasValue ? '✓' : '✗'} ${key}: ${hasValue ? 'SET' : 'MISSING/EMPTY'}`);
    });
}

// Validate that all required Firebase config values are present
const requiredConfigKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
];

const missingKeys = requiredConfigKeys.filter(
    (key) =>
        !firebaseConfig[key] ||
        firebaseConfig[key] === 'undefined' ||
        firebaseConfig[key] === undefined ||
        String(firebaseConfig[key]).trim() === ''
);

if (missingKeys.length > 0) {
    console.error(
        '❌ Firebase configuration error: Missing required environment variables:',
        missingKeys.join(', ')
    );
    console.error(
        'Please create a .env.local file in the project root with the following variables:'
    );
    console.error(`
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
  `);
    throw new Error(
        `Firebase configuration incomplete. Missing: ${missingKeys.join(', ')}`
    );
}

// Initialize Firebase (singleton pattern to avoid re-initialization in HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

// Track authentication state
let authInitialized = false;
let authPromise = null;

/**
 * Initialize Firebase Authentication (anonymous sign-in).
 * This happens automatically when the module loads, so authentication
 * is ready before the app needs it.
 * 
 * Call this function to ensure authentication is set up.
 * Returns a promise that resolves when authentication is complete.
 */
export const initializeAuth = () => {
    // If already initialized or in progress, return the existing promise
    if (authPromise) {
        return authPromise;
    }

    authPromise = new Promise((resolve, reject) => {
        // Check if user is already authenticated
        const currentUser = auth.currentUser;
        if (currentUser) {
            authInitialized = true;
            if (process.env.NODE_ENV !== 'production') {
                console.log('✅ Firebase Authentication: Already authenticated');
            }
            resolve(currentUser);
            return;
        }

        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {
                if (user) {
                    authInitialized = true;
                    unsubscribe();
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('✅ Firebase Authentication: User authenticated (anonymous)');
                    }
                    resolve(user);
                    return;
                }

                // No user, try to sign in anonymously
                try {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('🔐 Firebase Authentication: Signing in anonymously...');
                    }
                    const credential = await signInAnonymously(auth);
                    console.log('🔐 Firebase Authentication: Signed in anonymously');
                    // The onAuthStateChanged callback will fire again with the new user
                } catch (error) {
                    unsubscribe();
                    authInitialized = false;
                    // Provide helpful error message for common issues
                    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
                        console.error('❌ Firebase Authentication Error:', error.code);
                        console.error('💡 Solution: Enable Anonymous Authentication in Firebase Console:');
                        console.error('   1. Go to Firebase Console > Authentication > Sign-in method');
                        console.error('   2. Enable "Anonymous" sign-in provider');
                        console.error('   3. Save and wait a few seconds for changes to propagate');
                    }
                    reject(error);
                }
            },
            (error) => {
                unsubscribe();
                authInitialized = false;
                reject(error);
            }
        );
    });

    return authPromise;
};

/**
 * Ensure the current user is logged in (anonymous auth).
 * This is a convenience wrapper around initializeAuth().
 * Resolves with a Firebase User object.
 */
const ensureLoggedIn = async () => {
    return initializeAuth();
};

// Automatically initialize authentication when the module loads
if (typeof window !== 'undefined') {
    // Only auto-initialize in browser environment
    initializeAuth().catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️  Firebase Authentication auto-initialization failed:', error.code);
            console.warn('   Authentication will be retried when needed.');
        }
    });
}

/**
 * Log that a user accessed the app.
 * Writes a document into the "user_log" collection with a "datetime" field.
 * 
 * Authentication happens automatically when the module loads (via initializeAuth),
 * so by the time this function is called, the user should already be authenticated.
 * If authentication failed, this will still try to write to Firestore (assuming
 * your Firestore security rules allow unauthenticated writes).
 */
export const logUserAccess = async () => {
    try {
        // Ensure authentication is complete (should already be done, but just in case)
        try {
            await ensureLoggedIn();
        } catch (authError) {
            // Authentication failed, but we'll still try to write to Firestore
            if (process.env.NODE_ENV !== 'production') {
                console.warn('⚠️  Authentication not available, proceeding without auth:', authError.code);
                console.warn('   (This is OK if your Firestore rules allow unauthenticated writes)');
            }
        }

        // Generate a custom ID based on current time (e.g., "2023-10-27_10-30-55-123")
        const now = new Date();
        const docId = now.toISOString().replace(/T/, '_').replace(/\..+/, '') + '-' + now.getMilliseconds();

        // Write to Firestore with custom ID
        await setDoc(doc(db, 'user_log', docId), {
            // Use Firestore server timestamp for reliable current time
            datetime: serverTimestamp(),
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log('✅ User access logged to Firestore');
        }
    } catch (error) {
        // If Firestore write fails, provide helpful error message
        if (error.code === 'permission-denied') {
            console.error('❌ Firestore permission denied. Check your Firestore security rules.');
            console.error('   You need to allow writes to the "user_log" collection.');
            console.error('   Example rule: allow write: if true; (for testing only)');
        } else {
            console.error("Error logging user access:", error);
        }
        // Do not re-throw to prevent app crash
    }
};

/**
 * Save User Profile to Firestore 'users' collection
 * @param {object} user - Firebase User object
 */
export const saveUserToFirestore = async (user) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
        }, { merge: true });
        console.log("User data saved to Firestore");
    } catch (error) {
        console.error("Error saving user to Firestore:", error);
    }
};

/**
 * Detect if running on a mobile device
 */
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Sign in with Google
 * - Mobile: Always use redirect (popup is unreliable on mobile browsers)
 * - Desktop: Use popup for better UX
 */
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        // Always use popup - redirect has cross-origin storage issues on mobile
        const result = await signInWithPopup(auth, provider);
        await saveUserToFirestore(result.user);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google', error);
        throw error;
    }
};

/**
 * Handle redirect result (call this on app load)
 */
export const handleGoogleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            await saveUserToFirestore(result.user);
            return result.user;
        }
        return null;
    } catch (error) {
        console.error('Error handling redirect result', error);
        throw error;
    }
};

/**
 * Sign out
 */
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error signing out', error);
        throw error;
    }
};

/**
 * Sign Up with Email and Password
 * @param {string} email
 * @param {string} password
 * @param {string} name
 */
export const signUpWithEmail = async (email, password, name) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile name
        if (name) {
            await updateProfile(result.user, { displayName: name });
        }
        // Refresh user to get updated profile
        await result.user.reload();
        await saveUserToFirestore(auth.currentUser);
        return result.user;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};

/**
 * Sign In with Email and Password
 * @param {string} email
 * @param {string} password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(result.user);
        return result.user;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
};

/**
 * Sign In with Twitter
 */
export const signInWithTwitter = async () => {
    try {
        const provider = new TwitterAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await saveUserToFirestore(result.user);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Twitter', error);
        throw error;
    }
};

/**
 * Sign In with LinkedIn
 */
export const signInWithLinkedIn = async () => {
    try {
        const provider = new OAuthProvider('linkedin.com');
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error('Error signing in with LinkedIn', error);
        throw error;
    }
};

export { app, db, auth, ensureLoggedIn };

/**
 * Re-authenticate and Update Password
 * @param {object} user 
 * @param {string} currentPassword 
 * @param {string} newPassword 
 */
export const reauthenticateAndUpdatePassword = async (user, currentPassword, newPassword) => {
    if (!user || !user.email) throw new Error("Invalid user");

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        console.log("Password updated successfully");
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
};

/**
 * Send Password Reset Email
 * @param {string} email
 */
export const sendResetEmail = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent to:", email);
    } catch (error) {
        console.error("Error sending reset email:", error);
        throw error;
    }
};


/**
 * Save a news item to user's bookmarks (Array)
 * @param {string} userId
 * @param {object} newsItem
 */
export const saveBookmark = async (userId, newsItem) => {
    try {
        const userRef = doc(db, 'users', userId);
        // Add to bookmarks array
        await updateDoc(userRef, {
            bookmarks: arrayUnion({
                ...newsItem,
                savedAt: Date.now(), // Use generic timestamp for array
            })
        });
    } catch (error) {
        console.error('Error saving bookmark:', error);
        // throw error; // Prevent crash
    }
};

/**
 * Remove a bookmark (Array)
 * @param {string} userId
 * @param {string} newsId
 */
export const removeBookmark = async (userId, newsId) => {
    try {
        const userRef = doc(db, 'users', userId);
        // We need to find the item to remove it from array.
        // Since arrayRemove needs the exact object, we read -> filter -> update.
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) return;

            const userData = userDoc.data();
            const bookmarks = userData.bookmarks || [];
            const updatedBookmarks = bookmarks.filter(b => b.id !== newsId);

            transaction.update(userRef, { bookmarks: updatedBookmarks });
        });
    } catch (error) {
        console.error('Error removing bookmark:', error);
        // throw error; // Prevent crash
    }
};

/**
 * Subscribe to User Data (Likes & Bookmarks)
 * Single listener for optimization.
 * @param {string} userId
 * @param {function} callback ({ likes: [], bookmarks: [] })
 */
export const subscribeToUserData = (userId, callback) => {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            callback({
                likes: data.likedNews || [], // Array of IDs
                bookmarks: data.bookmarks || [], // Array of Objects
                preferences: data.preferences || null // User Preferences (NEW)
            });
        } else {
            callback({ likes: [], bookmarks: [], preferences: null });
        }
    }, (error) => {
        console.error("Error subscribing to user data:", error);
        // Optionally callback with empty data or handle error state
        callback({ likes: [], bookmarks: [], preferences: null });
    });
};

/**
 * Save User Preferences (Categories, Services, Core Elements)
 * Creates the field if it doesn't exist, updates if it does.
 * @param {string} userId
 * @param {object} preferences - { categories: [], productServices: [], coreElements: [] }
 */
export const saveUserPreferences = async (userId, preferences) => {
    if (!userId) return;
    const userRef = doc(db, 'users', userId);
    try {
        await setDoc(userRef, { preferences }, { merge: true });
        console.log('✅ User preferences saved:', preferences);
    } catch (error) {
        console.error('Error saving preferences:', error);
        // throw error; // Prevent crash
    }
};

/**
 * Toggle Like on a news item (Transaction)
 * Updates both user's likes collection and the global news_data counter.
 * @param {string} userId
 * @param {object} newsItem
 * @param {boolean} isCurrentlyLiked
 */
export const toggleLike = async (userId, newsItem, isCurrentlyLiked) => {
    if (!newsItem.id || !newsItem.publishedDate) {
        console.error("Invalid news item for like toggle:", newsItem);
        return;
    }

    // Derive docId from publishedDate (YYYY-MM-DD...) -> YYYY-MM
    // Assuming ISO format or YYYY-MM-DD
    let docId;
    try {
        const dateStr = newsItem.publishedDate;
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj)) throw new Error("Invalid Date");
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        docId = `${year}-${month}`;
    } catch (e) {
        console.warn("Could not parse date for docId, fallback to current month?", e);
        // Fallback logic could be risky. Let's try to grab from ID if it contains date?
        // Or just use the date string prefix if it is simple YYYY-MM
        docId = newsItem.publishedDate.substring(0, 7);
    }

    const newsDocRef = doc(db, 'news_data', docId);
    const userRef = doc(db, 'users', userId);

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Read news doc & user doc
            const newsDoc = await transaction.get(newsDocRef);
            const userDoc = await transaction.get(userRef);

            if (!newsDoc.exists()) throw new Error("News Document does not exist!");
            if (!userDoc.exists()) throw new Error("User Document does not exist!");

            const newsData = newsDoc.data();
            const newsArray = newsData.news || [];
            const newsIndex = newsArray.findIndex(n => n.id === newsItem.id);

            if (newsIndex === -1) throw new Error("News item not found.");

            const userData = userDoc.data();
            const userLikes = userData.likedNews || []; // Array of IDs
            const hasLiked = userLikes.includes(newsItem.id);

            // Mutate Global Counter
            const updatedNewsArray = [...newsArray];
            const currentLikes = updatedNewsArray[newsIndex].likes || 0;

            if (hasLiked) {
                // Unlike: decrement count, remove ID from user
                updatedNewsArray[newsIndex].likes = Math.max(0, currentLikes - 1);
                const updatedUserLikes = userLikes.filter(id => id !== newsItem.id);
                transaction.update(userRef, { likedNews: updatedUserLikes });
            } else {
                // Like: increment count, add ID to user
                updatedNewsArray[newsIndex].likes = currentLikes + 1;
                // Use set logic for array to avoid dupes (though check above handles it)
                const updatedUserLikes = [...userLikes, newsItem.id];
                transaction.update(userRef, { likedNews: updatedUserLikes });
            }

            // Update Global News
            transaction.update(newsDocRef, { news: updatedNewsArray });
        });
        console.log(`Like toggled successfully.`);
    } catch (error) {
        console.error("Transaction failed: ", error);
        // throw error; // Prevent crash
    }
};
/**
 * Generate DiceBear Avatar URL
 * @param {string} seed - User name or email or random string
 * @returns {string} Avatar URL
 */
export const getDiceBearAvatar = (seed) => {
    // Using 'notionists' style which is professional and clean
    // Fallback to 'initials' if no seed provided
    const safeSeed = seed ? encodeURIComponent(seed) : 'User';
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${safeSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};


/**
 * Subscribe to user's bookmarks
 * @param {string} userId
 * @param {function} callback
 * @returns {function} unsubscribe function
 */
export const subscribeToBookmarks = (userId, callback) => {
    const q = query(
        collection(db, 'users', userId, 'bookmarks'),
        orderBy('savedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const bookmarks = [];
        snapshot.forEach((doc) => {
            bookmarks.push({ id: doc.id, ...doc.data() });
        });
        callback(bookmarks);
    }, (error) => {
        console.error("Error fetching bookmarks:", error);
        callback([]);
    });
};

