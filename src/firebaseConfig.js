import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    runTransaction,
    updateDoc,
    arrayUnion,
    arrayRemove,
    addDoc,
    collectionGroup,
} from 'firebase/firestore';
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged,
    GoogleAuthProvider,
    OAuthProvider,
    TwitterAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    sendPasswordResetEmail,
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

// Log which config values are present (development only)
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

export const initializeAuth = () => {

    if (authPromise) {
        return authPromise;
    }

    authPromise = new Promise((resolve, reject) => {

        const currentUser = auth.currentUser;
        if (currentUser) {
            authInitialized = true;
            if (process.env.NODE_ENV !== 'production') {
                console.log('✅ Firebase Authentication: Already authenticated');
            }
            resolve(currentUser);
            return;
        }


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


                try {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('🔐 Firebase Authentication: Signing in anonymously...');
                    }
                    const credential = await signInAnonymously(auth);
                    console.log('🔐 Firebase Authentication: Signed in anonymously');

                } catch (error) {
                    unsubscribe();
                    authInitialized = false;

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

const ensureLoggedIn = async () => {
    return initializeAuth();
};

// Automatically initialize authentication when the module loads
if (typeof window !== 'undefined') {

    initializeAuth().catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️  Firebase Authentication auto-initialization failed:', error.code);
            console.warn('   Authentication will be retried when needed.');
        }
    });
}

export const logUserAccess = async () => {
    try {

        try {
            await ensureLoggedIn();
        } catch (authError) {

            if (process.env.NODE_ENV !== 'production') {
                console.warn('⚠️  Authentication not available, proceeding without auth:', authError.code);
                console.warn('   (This is OK if your Firestore rules allow unauthenticated writes)');
            }
        }

        const now = new Date();
        const user = auth.currentUser;

        if (user) {
            // New structure: users/{uid}/access_logs/{auto-id}
            await addDoc(collection(db, 'users', user.uid, 'access_logs'), {
                datetime: serverTimestamp(),
            });
        } else {
            // Fallback for completely anonymous/unauth users if needed
            const docId = now.toISOString().replace(/T/, '_').replace(/\..+/, '') + '-' + now.getMilliseconds();
            await setDoc(doc(db, 'user_log', docId), {
                datetime: serverTimestamp(),
            });
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('✅ User access logged to Firestore');
        }
    } catch (error) {

        if (error.code === 'permission-denied') {
            console.error('❌ Firestore permission denied. Check your Firestore security rules.');
            console.error('   You need to allow writes to the "access_logs" subcollection.');
            console.error('   Example rule: allow write: if true; (for testing only)');
        } else {
            console.error("Error logging user access:", error);
        }

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
        if (name) {
            await updateProfile(result.user, { displayName: name });
        }

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

        await updateDoc(userRef, {
            bookmarks: arrayUnion({
                ...newsItem,
                savedAt: Date.now(),
            })
        });
    } catch (error) {
        console.error('Error saving bookmark:', error);

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
                likes: data.likedNews || [],
                bookmarks: data.bookmarks || [],
                preferences: data.preferences || null
            });
        } else {
            callback({ likes: [], bookmarks: [], preferences: null });
        }
    }, (error) => {
        console.error("Error subscribing to user data:", error);

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



    let docId;
    try {
        const dateStr = newsItem.publishedDate;
        if (!dateStr || typeof dateStr !== 'string') throw new Error("Invalid Date String");
        
        // Use YYYY-MM-DD format based on publishedDate string (e.g., '2026-04-10')
        docId = dateStr.substring(0, 10);
    } catch (e) {
        console.warn("Could not parse date for docId, fallback to current day?", e);
        const now = new Date();
        docId = now.toISOString().substring(0, 10);
    }

    const newsDocRef = doc(db, 'news_data', docId);
    const userRef = doc(db, 'users', userId);

    try {
        await runTransaction(db, async (transaction) => {

            const newsDoc = await transaction.get(newsDocRef);
            const userDoc = await transaction.get(userRef);

            if (!newsDoc.exists()) throw new Error("News Document does not exist!");
            if (!userDoc.exists()) throw new Error("User Document does not exist!");

            const newsData = newsDoc.data();
            const newsArray = newsData.news || [];
            const newsIndex = newsArray.findIndex(n => n.id === newsItem.id);

            if (newsIndex === -1) throw new Error("News item not found.");

            const userData = userDoc.data();
            const userLikes = userData.likedNews || [];
            const hasLiked = userLikes.includes(newsItem.id);


            const updatedNewsArray = [...newsArray];
            const currentLikes = updatedNewsArray[newsIndex].likes || 0;

            if (hasLiked) {

                updatedNewsArray[newsIndex].likes = Math.max(0, currentLikes - 1);
                const updatedUserLikes = userLikes.filter(id => id !== newsItem.id);
                transaction.update(userRef, { likedNews: updatedUserLikes });
            } else {

                updatedNewsArray[newsIndex].likes = currentLikes + 1;

                const updatedUserLikes = [...userLikes, newsItem.id];
                transaction.update(userRef, { likedNews: updatedUserLikes });
            }

            transaction.update(newsDocRef, { news: updatedNewsArray });
        });
        console.log(`Like toggled successfully.`);
    } catch (error) {
        console.error("Transaction failed: ", error);

    }
};
/**
 * Generate DiceBear Avatar URL
 * @param {string} seed - User name or email or random string
 * @returns {string} Avatar URL
 */
export const getDiceBearAvatar = (seed) => {


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

