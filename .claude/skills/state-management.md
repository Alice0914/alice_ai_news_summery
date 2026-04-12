# State Management — UI Flow & State Variables

## Step System (Core of UserApp.jsx)

UserApp manages the entire UI flow via the `step` state:

```
step = 0    → AuthPage (login/signup page)
step = 1    → Landing Page (logo + "Explore AI Trends" button)
step = 1.5  → LanguageSelectionStep (language selector: en/ko)
step = 2    → SelectionStep #1 (interest category selection)
step = 3    → SelectionStep #2 (AI service selection)
step = 4    → SelectionStep #3 (core element selection)
step = 4.5  → OnboardingAuth (signup option during onboarding)
step = 5    → News Feed (main app — where users spend most time)
```

### Step Transition Rules
```
First-time visitor:  step 1 → 1.5 → 2 → 3 → 4 → (4.5 optional) → 5
Returning visitor:   localStorage 'hasLoggedInBefore' → jump to step 5
Logged-in user:      onAuthStateChanged → jump to step 5
Logout:              step 0 (login page)
```

## Key State Variables

### Authentication
```jsx
const [user, setUser] = useState(null);              // Firebase User object
const [authLoading, setAuthLoading] = useState(true); // Initial auth check in progress
const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Login modal
const [isLoggingOut, setIsLoggingOut] = useState(false);       // Logout in progress

const isSigningUp = useRef(false);   // Distinguish signup vs login
const isLoggingIn = useRef(false);
const wasLoggedIn = useRef(false);   // Whether user logged in during this session
const isFirstCheck = useRef(true);   // First onAuthStateChanged check
```

### Filter/Search
```jsx
const [selectedInterests, setSelectedInterests] = useState([]);   // Selected category IDs
const [selectedServices, setSelectedServices] = useState([]);     // Selected service IDs
const [selectedCore, setSelectedCore] = useState([]);             // Selected core element IDs
const [filterPeriod, setFilterPeriod] = useState('important');    // Sort: 'important' | 'popular' | 'latest'
const [dateFilter, setDateFilter] = useState('last_week');        // Period: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'all'
const [searchQuery, setSearchQuery] = useState('');               // Search query
const [filterModalOpen, setFilterModalOpen] = useState(false);    // Filter modal open
```

### News Data
```jsx
const [currentNews, setCurrentNews] = useState([]);     // All news (Firestore raw data)
const [newsLoading, setNewsLoading] = useState(true);   // News loading state
const [expandedNewsId, setExpandedNewsId] = useState(null);  // Expanded news item ID
const [currentTopIndex, setCurrentTopIndex] = useState(0);   // Carousel index
```

### User Data (Real-time Sync)
```jsx
const [savedNewsIds, setSavedNewsIds] = useState(new Set());   // Bookmarked news IDs
const [savedNewsItems, setSavedNewsItems] = useState([]);       // Bookmarked news objects
const [likedNewsIds, setLikedNewsIds] = useState(new Set());   // Liked news IDs
```

### UI State
```jsx
const [activeTab, setActiveTab] = useState('home');     // Bottom tab: 'home' | 'saved' | 'profile'
const [isSearchOpen, setIsSearchOpen] = useState(false);
const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
const [isShareModalOpen, setIsShareModalOpen] = useState(false);
const [shareNewsItem, setShareNewsItem] = useState(null);
```

## News Filtering Logic (`getFilteredNews()`)

```
1. Apply language:     title/summary → title_ko/summary_ko (when ko)
2. Search filter:      Match query against title + summary + searchKeywords
3. Date filter:        Only news within dateFilter range
4. Sort:               impactScore (importance) / likes (popularity) / publishedDate (latest)
5. Category filter:    Match selectedInterests + selectedServices + selectedCore (OR condition)
```

## Bottom Tab Navigation (step=5)

```
Bottom Tab Bar
├── 🏠 Home (activeTab='home')     ← News feed + search + filters
├── 📖 Saved (activeTab='saved')   ← Bookmarked news list
└── 👤 Profile (activeTab='profile') ← Profile + password change + logout
```

## Toast Notification Pattern

```jsx
// Login success toast
setShowLoginToast(true);
setTimeout(() => setShowLoginToast(false), 2000);

// Signup success toast
setShowSignupToast(true);
setTimeout(() => {
  setShowSignupToast(false);
  setStep(5);  // Navigate to feed after toast
}, 2000);
```

## Important Notes

1. **Side effects on step change**: `useEffect([user, step])` reloads userData
2. **Unauthenticated bookmark/like**: Always opens `isAuthModalOpen` to prompt login
3. **hasInitializedFilters**: Firestore → filter sync runs only once (prevents duplication)
4. **wasLoggedIn ref**: Controls step=0 redirect after logout (prevents unnecessary transitions on initial load)
