# AI Trend 1-Minute ⚡

> AI trends at a glance — curated, summarized, and ready to share in 1 minute.

A bilingual (English/Korean) AI news aggregator built with React + Firebase + Gemini. Browse daily AI trends, bookmark your favorites, and share across social platforms.

## ✨ Features

- **Daily AI News Feed** — Auto-collected and summarized from top AI sources
- **Smart Filtering** — Filter by category, AI service, core element, and date range
- **Bilingual Support** — Full English/Korean interface with localized content
- **Social Sharing** — One-click share to Threads, X, LinkedIn, Reddit, WhatsApp, and more
- **Bookmarks & Likes** — Save articles and track what's trending
- **User Accounts** — Google, email, and social login via Firebase Auth
- **Impact Scoring** — Each article scored 0–100 for importance
- **Responsive Design** — Mobile-first dark theme with glassmorphism

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Lucide Icons |
| Backend | Python, Google Gemini (2.5 Flash + Pro) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google, Email, Twitter, LinkedIn) |
| i18n | i18next (English + Korean) |
| Build | Webpack 5, Babel, PostCSS |
| Deploy | Vercel |
| Embeddings | gemini-embedding-2-preview (768-dim) |

## 📁 Project Structure

```
root/
├── src/                        ← Frontend (React)
│   ├── App.jsx                 ← Router (~22 lines)
│   ├── pages/UserApp.jsx       ← Main app logic
│   ├── components/
│   │   ├── auth/               ← Login/signup
│   │   ├── onboarding/         ← User onboarding steps
│   │   ├── news/               ← News cards & list items
│   │   ├── share/              ← Social sharing modal
│   │   ├── filter/             ← Category/date filters
│   │   ├── common/             ← Shared components
│   │   ├── icons/              ← Custom SVG icons
│   │   └── admin/              ← Admin tools
│   ├── constants/              ← Categories, services, mappings
│   ├── locales/                ← en.json, ko.json
│   ├── assets/                 ← Images
│   ├── utils/                  ← Helper functions
│   ├── firebaseConfig.js       ← Firebase setup & API
│   └── i18n.js                 ← Multilingual config
│
├── backend/                    ← Backend (Python)
│   └── agents/                 ← AI news pipeline
│       ├── config.py           ← Model settings
│       ├── pipeline.py         ← Main pipeline
│       ├── taxonomy.py         ← Category classification
│       └── workflow.py         ← Orchestration
│
├── public/                     ← Static files (index.html, favicon)
├── test/                       ← Tests
├── .claude/skills/             ← Claude Code context files
└── CLAUDE.md                   ← Claude Code project guide
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Firebase project with Firestore + Auth enabled

### Installation
```bash
git clone <repo-url>
cd ai_trend_oneMinute_2025_web_en
npm install
```

### Environment Setup
Create `.env.local` in the project root:
```
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Run Development Server
```bash
npm run dev          # Opens at http://localhost:3002
```

### Build for Production
```bash
npm run build        # Output in dist/
```

## 📡 Backend Pipeline

The news pipeline runs separately to collect, process, and upload AI news:

```
RSS/API Sources → Deduplication → Classification → Summarization → Translation → Firestore
```

See [backend/agents/README.md](backend/agents/README.md) for detailed pipeline docs.

## 🌐 Deployment

Deployed on Vercel. Push to main branch triggers auto-deploy.

```bash
# Manual deploy
npx vercel --prod
```

## 📄 License

ISC
