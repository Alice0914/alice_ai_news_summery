# Project Structure

## Full Directory Map

```
root/
├── src/                                 ← All frontend code lives here
│   ├── App.jsx                          ← Routing only (~22 lines), UserApp ↔ AdminApp
│   ├── AdminApp.jsx                     ← Admin-only page (localhost restricted)
│   ├── index.js                         ← React entry point
│   ├── index.css                        ← Tailwind base + custom CSS
│   ├── i18n.js                          ← i18next multilingual config (en/ko)
│   ├── firebaseConfig.js                ← Firebase init + all DB/Auth functions
│   │
│   ├── pages/
│   │   └── UserApp.jsx                  ← Main app (state, business logic, rendering)
│   │
│   ├── components/
│   │   ├── auth/                        ← Authentication
│   │   │   ├── AuthPage.jsx             ← Login/signup (social + email)
│   │   │   └── OnboardingAuth.jsx       ← Auth step during onboarding
│   │   ├── onboarding/                  ← Onboarding step UI
│   │   │   ├── SelectionStep.jsx        ← Reusable selector for interests/services/core
│   │   │   └── LanguageSelectionStep.jsx← Language selector (en/ko)
│   │   ├── news/                        ← News display
│   │   │   ├── TopNewsCard.jsx          ← Top carousel card (image + details)
│   │   │   └── SimpleNewsItem.jsx       ← Collapsible list news item
│   │   ├── share/
│   │   │   └── ShareModal.jsx           ← SNS share modal (8 platforms)
│   │   ├── filter/
│   │   │   └── FilterPage.jsx           ← Full-screen category/service/date filter
│   │   ├── common/
│   │   │   └── AsyncImage.jsx           ← Image component with loading spinner
│   │   ├── icons/
│   │   │   ├── DiscordIcon.jsx
│   │   │   ├── YoutubeIcon.jsx
│   │   │   └── ThreadsIcon.jsx
│   │   ├── admin/
│   │   │   ├── AdminUpload.jsx          ← JSON news data upload
│   │   │   └── AdminStats.jsx           ← User statistics dashboard
│   │   ├── layout/
│   │   │   └── GlobalStyles.jsx         ← Global CSS animations/scrollbar
│   │   ├── ui/
│   │   │   ├── Badge.jsx
│   │   │   └── Icons.jsx                ← YoutubeIcon, DiscordIcon re-export
│   │   └── PreferencesPage.jsx          ← User settings (change interests)
│   │
│   ├── constants/
│   │   ├── index.js                     ← CATEGORIES, PRODUCT_SERVICES, CORE_ELEMENTS, PERIODS, ID_MAPs
│   │   └── images.js                    ← SAMPLE_IMAGES array
│   ├── locales/
│   │   ├── en.json                      ← English translation keys
│   │   └── ko.json                      ← Korean translation keys
│   ├── assets/
│   │   ├── logo.png, discord_icon.png, us_flag.png, kr_flag.png
│   └── utils/
│       └── localization.js              ← getLocalizedLabel(), getLocalizedTag()
│
├── backend/                             ← Python backend
│   ├── agents/                          ← AI news collection/processing pipeline
│   │   ├── config.py                    ← Model settings (Gemini)
│   │   ├── pipeline.py                  ← Main pipeline execution
│   │   ├── taxonomy.py                  ← News category classification schema
│   │   └── workflow.py                  ← Workflow orchestration
│   └── data/                            ← Runtime data (empty)
│
├── public/                              ← Static files
│   ├── index.html, favicon.ico, robots.txt, manifest.json
│
├── test/                                ← Test files (preserved)
├── dist/                                ← Webpack build output
│
├── webpack.config.js                    ← entry: ./src/index.js, port: 3005
├── tailwind.config.js                   ← content: ./src/**/*.{js,jsx}
├── package.json                         ← dev: port 3002, build: production
├── vercel.json                          ← Vercel deployment routing
└── .env.local                           ← Firebase env vars (private)
```

## Key Import Dependency Graph

```
index.js → App.jsx → UserApp.jsx (pages/)
                    → AdminApp.jsx

UserApp.jsx imports:
  ├── components/auth/*
  ├── components/onboarding/*
  ├── components/news/*
  ├── components/share/ShareModal
  ├── components/filter/FilterPage
  ├── components/common/AsyncImage
  ├── components/icons/*
  ├── components/PreferencesPage
  ├── constants/ (index.js, images.js)
  ├── firebaseConfig.js
  └── i18n (via react-i18next)
```

## File Placement Rules

| File Type | Location | Example |
|-----------|----------|---------|
| New page | `src/pages/` | `SettingsPage.jsx` |
| UI component | `src/components/{role}/` | `components/news/NewsGrid.jsx` |
| Shared component | `src/components/common/` | `components/common/LoadingSpinner.jsx` |
| Constants/data | `src/constants/` | `constants/categories.js` |
| Utility functions | `src/utils/` | `utils/dateFormat.js` |
| Images | `src/assets/` | `assets/new_icon.png` |
| Translation keys | `src/locales/en.json` + `ko.json` | Update both files simultaneously |
