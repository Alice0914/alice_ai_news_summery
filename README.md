# AI Trend 1-Minute ⚡

> **Catch up on AI in 60 seconds. Share it in one tap.**
> A bilingual (English / Korean) news app that hand-picks the day's most important AI stories, ranks them by impact, summarizes them, and lets you broadcast them to Threads / X / LinkedIn / Reddit / WhatsApp instantly.

The whole product is built around two promises:

1. **Read fast.** Every story is pre-deduplicated, pre-scored 0–100, and reduced to a 2–3 sentence summary plus a "Why it matters" hook — so a full daily briefing takes about a minute.
2. **Share frictionlessly.** One button copies a ready-to-post block (title + summary + source link + hashtags) and opens the platform of your choice — no extra editing required.

---

## ✨ Features

- **Daily AI Briefing** — Auto-collected from 9 first-party + journalism sources, scored, and ranked every morning.
- **Top-K Cards** — The day's highest-impact stories surface first, each with a "Why it matters" explanation written for practitioners.
- **One-Tap Sharing** — Pre-formatted post + hashtags + source URL, shipped to Threads / X / LinkedIn / Reddit / WhatsApp / Email.
- **Bilingual (EN / KO)** — Every article ships with English and Korean title / summary / why-it-matters / keywords.
- **Smart Filtering** — Filter by date range, category, AI service, core element, or free-text search.
- **Bookmarks, Likes, View Counts** — Save articles, see what's trending across the user base.
- **Impact Score (0–100)** — A multi-model tournament gives each story a verifiable, model-cross-checked score.
- **Mobile-First Dark UI** — Glassmorphism + Tailwind, optimized for thumb-reach.
- **Firebase Auth** — Google, Email, Twitter, LinkedIn.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Lucide Icons, Framer Motion |
| Backend (pipeline) | Python 3.12, Google Gemini 2.5 (Pro + Flash), xAI Grok 4.1 |
| Embeddings | `gemini-embedding-2-preview` (768-dim) |
| Reranker | `cross-encoder/stsb-roberta-large` (sentence-transformers) |
| Database | Firebase Firestore (`news_feeds/{YYYY-MM}`) |
| Auth | Firebase Auth (Google, Email, Twitter, LinkedIn) |
| i18n | i18next (English + Korean) |
| Build | Webpack 5, Babel, PostCSS |
| Scheduler | GitHub Actions (cron: Mon–Sat 10:00 UTC) |
| Deploy | Vercel |

---

## 🔭 End-to-End Workflow

The product has two halves that meet in Firestore: a **daily backend pipeline** that produces the data, and a **frontend** that lets users read and share it. The diagram below shows the full loop.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          DAILY BACKEND PIPELINE                              │
│                  (GitHub Actions, cron: Mon–Sat 10:00 UTC)                   │
└──────────────────────────────────────────────────────────────────────────────┘

   ┌────────────────────────────────────────────────────────────────────┐
   │  STEP 1 — Parallel Collection                                      │
   │  ThreadPoolExecutor fans out to 9 source collectors                │
   │  → raw articles tagged with source authority tier (1 / 5 / 10)     │
   └────────────────────────────────┬───────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │  STEP 2 — 4-Stage Deduplication                                    │
   │                                                                    │
   │  ┌─Stage 1 — Bi-Encoder Recall   (cosine sim > 0.92)             │
   │  ├─Stage 2 — LLM Event Extract   (entities, type, product, date)  │
   │  ├─Stage 3 — Logical Match       (≥ 2 of 4 fields agree)         │
   │  └─Stage 4 — Cross-Encoder       (score > 0.90)                  │
   │                                                                    │
   │  → Drop lower-priority article, +1 exposure_score to the kept one  │
   └────────────────────────────────┬───────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │  STEP 3 — Tournament Scoring (1–5) + Tagging                       │
   │                                                                    │
   │  Round 1: Gemini 2.5 Pro   (always)                                │
   │  Round 2: Grok 4.1         (only if R1 ≥ 3.0)                      │
   │  Round 3: Gemini 2.5 Pro   (only if avg(R1+R2) ≥ 4.0)              │
   │                                                                    │
   │  final_100 = min(100, avg_star × 20  +  exposure_score × 2)        │
   │  Then Flash tags categories / services / core / why_it_matters     │
   └────────────────────────────────┬───────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │  STEP 4 — Korean Translation + Final JSON                          │
   │  Gemini 2.5 Flash translates title / summary / why / keywords      │
   │  Tags translated deterministically via CATEGORY/SERVICE/CORE_MAP   │
   │  Output: backend/data/final_data/final_news_output_YYYYMMDD.json   │
   └────────────────────────────────┬───────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────┐
   │  STEP 5 — Firestore Upload                                         │
   │  news_feeds/{YYYY-MM} → news[]  (merged, not overwritten)          │
   └────────────────────────────────┬───────────────────────────────────┘
                                    ▼
═════════════════════════════════════════════════════════════════════════════
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
└──────────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
   │ Firebase Auth   │ ─▶ │  UserApp.jsx     │ ─▶ │  Top-K cards         │
   │ (Google / etc.) │    │  fetches today's │    │  + summary list      │
   └─────────────────┘    │  news_feeds doc  │    │  + filter / search   │
                          └────────┬─────────┘    └──────────┬───────────┘
                                   │                          │
                                   ▼                          ▼
                          ┌──────────────────┐    ┌──────────────────────┐
                          │  Preferences /   │    │  ShareModal:         │
                          │  bookmarks /     │    │  pre-formatted text  │
                          │  language toggle │    │  + hashtags + URL    │
                          └──────────────────┘    │  → Threads / X /     │
                                                  │    LinkedIn / Reddit │
                                                  └──────────────────────┘
```

### Workflow narrated, step by step

1. **06:00 ET, Mon–Sat** — GitHub Actions fires the cron in [`.github/workflows/daily-news.yml`](.github/workflows/daily-news.yml) and runs `python -m backend.agents.pipeline --smart`. Smart mode collects yesterday's news, except on Monday where it back-fills Sat + Sun together.
2. **Collect** — 9 collector classes hit their respective sources in parallel via `ThreadPoolExecutor` and normalize results into `{raw_title, raw_content, source_name, source_url, date}`. Each source carries a priority tier (10 = primary lab / academic, 5 = tier-1 journalism, 1 = aggregator) that becomes the duplicate tie-breaker downstream.
3. **Deduplicate** — A 4-stage funnel cuts the cross-source repetition while keeping unrelated-but-similar stories apart. The kept article inherits a bonus (`exposure_score += 1` per dropped duplicate) — used later as a scoring boost.
4. **Score + tag** — Each surviving article goes through a 1–3 round tournament. Only promising stories advance to the more expensive rounds, which keeps the LLM bill bounded. Scores are mapped to a 0–100 scale and ordered. The top `TOP_K_WHY_IT_MATTERS = 20` get the extra "Why it matters" generation.
5. **Translate** — Title / summary / why / keywords are translated per-article with Gemini Flash; tag values are translated deterministically through a lookup map (no LLM call needed).
6. **Upload** — `FirestoreUploader` appends articles to `news_feeds/{YYYY-MM}` under a `news[]` field. Existing entries are merged, not overwritten.
7. **Read** — The frontend (`src/pages/UserApp.jsx`) signs the user in via Firebase Auth, pulls the current month's document, and renders Top-K cards plus a filtered, searchable list.
8. **Share** — `ShareModal` builds a pre-formatted block (`📌 [title]\n\nsummary\n\n👉 Source: url\n\n#hashtags`), copies it to the clipboard as both plaintext and HTML, and hands off to the user's chosen platform via web intents.

---

## 🧹 Step 2 — Deduplication, in detail

Implemented in [`backend/agents/processors/deduplicator.py`](backend/agents/processors/deduplicator.py). The goal is to *recall every plausible duplicate cheaply, then prune false positives with progressively more expensive checks.*

| Stage | Model / Method | Purpose | Pass condition |
|-------|----------------|---------|----------------|
| **1. Recall** | `gemini-embedding-2-preview` (768-dim) + cosine similarity over titles | Fan out: surface every pair that *might* be a duplicate | `sim > 0.92` |
| **2. Extraction** | `gemini-2.5-flash` in JSON mode, on full content | Pull `{entities, event_type, product_name, date}` from each side | always run on candidates |
| **3. Logical Match** | Rule-based comparison of the extracted fields | Reject pairs that share keywords but describe different events | **≥ 2 of 4 fields** must agree (entity overlap, same event_type ≠ "Other", product-name substring match, exact date match) |
| **4. Verification** | `cross-encoder/stsb-roberta-large` re-rank on the title pair | Final semantic confirmation | `cross_encoder_score > 0.90` |

### How the funnel actually runs

```python
# pseudocode of deduplicator.py
embeddings = embed_titles(articles)               # Stage 1 setup
articles.sort_by(source_priority, desc=True)      # tie-breaker order

for i, a in articles:
    for j, b in articles[i+1:]:
        sim = cosine(emb[i], emb[j])
        if sim <= 0.92:        continue           # Stage 1 cutoff
        d1, d2 = extract(a), extract(b)            # Stage 2 (LLM, cached)
        if not logical_match(d1, d2): continue     # Stage 3 (≥ 2/4 fields)
        ce = cross_encoder.predict([(a.title, b.title)])
        if ce <= 0.90:         continue            # Stage 4 cutoff
        drop(b)                                    # b is the lower-priority one
        a.exposure_score += 1                      # reward consensus
```

**Why these specific thresholds?** Cosine sim at 0.92 is loose enough to catch paraphrased titles ("OpenAI launches GPT-X" vs. "GPT-X announced by OpenAI") but tight enough to skip generic AI news pairs. The LLM-extraction + logical-match layer is what rejects "two different OpenAI stories on the same day" — pure embedding similarity alone confuses these constantly. The cross-encoder at 0.90 is the final precision gate: it scores the title pair *in context of each other* rather than as two independent vectors.

**Tie-breaking on duplicate.** Articles are pre-sorted by `SOURCE_PRIORITY` ([`config.py:15-68`](backend/agents/config.py#L15-L68)) descending before the loop. So when stage 4 fires, the `i` we keep is always the higher-authority source (OpenAI > TechCrunch > The Rundown). The dropped article's existence still counts — it bumps `exposure_score` on the kept one.

**Logging.** Every run writes `backend/data/deduplication/deduplication_log_<ts>.json` containing every dropped pair with similarity, cross-encoder score, source attributions, and the extracted event details that justified the call. Good for auditing false-positive merges.

**Cost-control trick.** Stage-2 LLM extraction results are cached per-article (`details_cache`) so an article that's a candidate against multiple others is only extracted once.

---

## 🏆 Step 3 — Tournament Scoring + Tagging, in detail

Implemented in [`backend/agents/processors/scorer_tagger.py`](backend/agents/processors/scorer_tagger.py). Two phases — **score**, then **tag** — because tagging is cheap (`Flash`) and scoring is expensive (`Pro` + `Grok`).

### 3a. Tournament Scoring (1–5)

The point of a tournament is **don't pay for what you don't need**. Round 1 alone is enough to dismiss most stories; only candidates that look promising get a second opinion; only top-tier candidates get the final verification.

| Round | Model | Trigger | What it costs |
|-------|-------|---------|---------------|
| **1** | `gemini-2.5-pro` | Always | 1 call per article |
| **2** | `grok-4-1-fast-reasoning` (xAI) | Round-1 score **≥ 3.0** | 1 call per "promising" article (independent second opinion from a different vendor) |
| **3** | `gemini-2.5-pro` | Running average after R1+R2 **≥ 4.0** | 1 call per "top-tier" article (final verification pass) |

Same 1–5 rubric is sent to all three rounds:

```
1 = Garbage / Spam / Irrelevant / Routine update
2 = Minor news, slight feature updates
3 = Standard news, moderate practitioner interest
4 = Important news, high industry impact
5 = Must-read, breakthrough or industry-shifting event
```

**Two prompt-level bonuses** are baked into the rubric so models reliably reward the right things:

- Large-scale consumer adoption signals (App Store ranking entry, MAU surges) → push score higher.
- New tech from Claude / OpenAI / Gemini / Grok or strong open-source releases → push score higher.

### Score aggregation

```text
scores      = [r1] + [r2 if run] + [r3 if run]   # 1–3 numbers
avg_star    = mean(scores)                       # 1.0 – 5.0
base_100    = avg_star × 20                      # 20 – 100
exposure    = article.exposure_score             # set in Step 2
final_100   = min(100, base_100 + exposure × 2)  # final impact score
```

`exposure_score × 2` is the "everyone is covering this" bonus — a story that survived as a duplicate-winner over multiple sources gets up to a flat boost on top of its model average, reflecting industry-wide consensus that wasn't captured by any single model's judgment.

Articles are sorted by `final_100` descending. That ordering is what the next phase reads to decide who gets the (more expensive) `why_it_matters` treatment.

### 3b. Tagging (`gemini-2.5-flash`)

Run on every article after scoring/sorting. Output fields:

| Field | Notes |
|-------|-------|
| `title` | Cleaned, professional English paraphrase of the raw title |
| `summary` | 2–3 sentence factual English summary |
| `searchKeywords` | 3–5 English search keywords |
| `categories` | Strict allowlist of 17 values |
| `productServices` | Strict allowlist of 14 values |
| `coreElements` | Strict allowlist of 4 values |
| `why_it_matters` | **Top `TOP_K_WHY_IT_MATTERS = 20` only** — 1–2 sentences on industry significance |

After the LLM call, tags are **post-filtered against the allowlist** in `config.py` — any value the model hallucinates outside the list is silently dropped. This makes the downstream Korean translation step a safe O(1) dictionary lookup.

#### Classification Tag Vocabulary

Defined in [`backend/agents/config.py:77-119`](backend/agents/config.py#L77-L119). The frontend's `src/constants/index.js` mirrors these — they must stay in sync.

- **`categories` (17)** — `Business`, `Finance/Investment`, `Healthcare/Science`, `Entertainment/Creative`, `Education`, `Society/Policy`, `Hardware`, `Lifestyle`, `Defense/Security`, `Robotics/Physical AI`, `Research/Innovation`, `Energy/Environment`, `Tech/AI`, `Economy`, `Automotive`, `Infrastructure`, `Technology`
- **`productServices` (14)** — `Text AI`, `Image AI`, `Video AI`, `Voice AI`, `Agent AI`, `Automation AI`, `Multimodal AI`, `Vibe Coding AI`, `Robotics`, `Edge/On-Device AI`, `Wearable AI`, `Autonomous Driving AI`, `Generative AI`, `Database/Storage`
- **`coreElements` (4)** — `Data`, `Algorithm`, `Computing`, `Safety/Ethics`

Each English value has a deterministic Korean translation in `CATEGORY_MAP` / `SERVICE_MAP` / `CORE_MAP`, used by Step 4 without an LLM call.

---

## 🌐 Step 4 — Korean Translation + Final JSON

Implemented in [`backend/agents/processors/translator.py`](backend/agents/processors/translator.py). Uses `gemini-2.5-flash`, one call per article.

**LLM-translated** (per-article call):

- `title` → `title_ko`
- `summary` → `summary_ko`
- `why_it_matters` → `why_it_matters_ko` *(only when present, top 20)*
- `searchKeywords[]` → `searchKeywords_ko[]`

Prompt rules: natural professional Korean; keep widely-used technical terms in English (`AI`, `LLM`, `GPT`, etc.); translate keywords to Korean-equivalents.

**Map-based, no LLM:**

- `categories[]` → `categories_ko[]`
- `productServices[]` → `productServices_ko[]`
- `coreElements[]` → `coreElements_ko[]`

The translator also generates a URL-safe `id` (slugified title + `YYYYMMDD`) and normalizes `publishedDate` to `YYYY-MM-DD`. Output is written to `backend/data/final_data/final_news_output_<YYYYMMDD>.json`.

---

## 📤 Step 5 — Firestore Upload

Implemented in [`backend/agents/processors/uploader.py`](backend/agents/processors/uploader.py). Articles are appended to `news_feeds/{YYYY-MM}` under the `news` array field. Existing articles for the month are merged, not overwritten.

---

## 📦 Final Article Schema

Exact shape written to Firestore (and `final_news_output_*.json`):

```json
{
  "id": "openai-launches-new-model-20260507",
  "title": "OpenAI Launches New Model",
  "title_ko": "<Korean translation of title>",
  "summary": "OpenAI announced...",
  "summary_ko": "<Korean translation of summary>",
  "why_it_matters": "This matters because...",
  "why_it_matters_ko": "<Korean translation, top 20 only>",
  "source": "OpenAI",
  "sourceUrl": "https://openai.com/...",
  "publishedDate": "2026-05-07",
  "impactScore": 92.0,
  "impactDetails": {
    "avg_star": 4.5,
    "rounds": 3,
    "exposure_bonus": 2,
    "reasoning": "Industry-shifting capability..."
  },
  "categories": ["Tech/AI", "Research/Innovation"],
  "categories_ko": ["<mapped via CATEGORY_MAP>"],
  "productServices": ["Text AI", "Multimodal AI"],
  "productServices_ko": ["<mapped via SERVICE_MAP>"],
  "coreElements": ["Algorithm"],
  "coreElements_ko": ["<mapped via CORE_MAP>"],
  "searchKeywords": ["GPT", "reasoning", "multimodal"],
  "searchKeywords_ko": ["<LLM-translated keywords>"],
  "likes": 0,
  "viewCount": 0,
  "shareCount": 0
}
```

---

## 📁 Project Structure

```
root/
├── src/                          ← Frontend (React)
│   ├── index.js                  ← React entry point
│   ├── index.css                 ← Tailwind + global styles
│   ├── App.jsx                   ← User-facing router
│   ├── AdminApp.jsx              ← Admin router
│   ├── i18n.js                   ← i18next config (EN / KO)
│   ├── firebaseConfig.js         ← Firebase setup & API
│   ├── pages/UserApp.jsx         ← Main app: feed + Top-K + sharing wiring
│   ├── components/
│   │   ├── PreferencesPage.jsx
│   │   ├── auth/                 ← Login / signup
│   │   ├── onboarding/           ← First-run flow
│   │   ├── news/                 ← TopNewsCard, SimpleNewsItem
│   │   ├── share/                ← ShareModal — one-tap social share
│   │   ├── filter/               ← Category / date filters
│   │   ├── layout/               ← GlobalStyles & layout shells
│   │   ├── common/               ← Shared components
│   │   ├── icons/                ← Custom SVG icons
│   │   ├── ui/                   ← Badge, Icons, primitives
│   │   └── admin/                ← Admin tools
│   ├── constants/                ← Categories, services, mappings (mirror of backend)
│   ├── locales/                  ← en.json, ko.json
│   ├── assets/                   ← Images
│   └── utils/                    ← Helpers
│
├── backend/                      ← Backend (Python)
│   └── agents/
│       ├── config.py             ← Models, source priority, taxonomy maps
│       ├── pipeline.py           ← Main orchestrator (5 steps)
│       ├── taxonomy.py           ← Category classification schema
│       ├── workflow.py           ← Workflow helper
│       ├── collectors/           ← 9 source collectors (RSS / API)
│       └── processors/
│           ├── deduplicator.py   ← 4-stage dedup
│           ├── scorer_tagger.py  ← Tournament scoring + tagging
│           ├── translator.py     ← Korean translation
│           └── uploader.py       ← Firestore upload
│
├── public/                       ← Static files (index.html, favicon, manifest)
├── .github/workflows/            ← daily-news.yml cron
├── requirements.txt              ← Python dependencies
├── package.json                  ← Frontend dependencies
├── webpack.config.js             ← Bundler config
├── tailwind.config.js            ← Tailwind config
└── vercel.json                   ← Vercel deploy config
```

---

## 📄 License

ISC
