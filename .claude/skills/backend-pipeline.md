# Backend Pipeline — AI News Processing

## Tech Stack

- **Language**: Python
- **LLM**: Google Gemini (`gemini-2.5-flash-preview-04-17`)
- **Embeddings**: `gemini-embedding-2-preview` (768 dimensions)
- **Database**: Firebase Firestore (news storage)

## Directory Structure

```
backend/
├── __init__.py
├── agents/
│   ├── config.py          ← Model/API configuration
│   ├── pipeline.py        ← Main pipeline execution
│   ├── taxonomy.py        ← News category classification schema
│   ├── workflow.py        ← Workflow orchestrator
│   └── README.md          ← Agent documentation
└── data/                  ← Runtime data (empty)
```

## config.py Key Settings

```python
MODEL_LLM = "gemini-2.5-flash-preview-04-17"
MODEL_EMBEDDING = "gemini-embedding-2-preview"   # 768-dim, highest performance
EMBEDDING_DIM = 768
```

## News Pipeline Flow

```
1. News Collection (RSS/API)
   ↓
2. Deduplication (embedding similarity)
   ↓
3. Category Classification (based on taxonomy.py)
   - Categories: AI Research, LLM, Computer Vision, etc.
   - Product Services: ChatGPT, Gemini, Claude, etc.
   - Core Elements: Text, Image, Video, etc.
   ↓
4. Summary Generation (Gemini)
   - English original summary
   - Korean translation (title_ko, summary_ko, searchKeywords_ko)
   ↓
5. Impact Score Assignment (impactScore: 0~100)
   ↓
6. Firestore Upload
   - Collection: news_feeds/{YYYY-MM}
   - Field: news (array)
```

## taxonomy.py Category Schema

### Categories (Interest Areas)
```
AI Research, LLM, Computer Vision, Robotics, Healthcare AI,
Entertainment AI, Education AI, Finance AI, Legal AI, AI Ethics
```

### Product Services (AI Services)
```
ChatGPT, GPT-4, Gemini, Claude, Copilot, Midjourney, DALL-E,
Stable Diffusion, Sora, Perplexity, DeepSeek, Grok, Meta AI,
AWS AI, Google Cloud AI, Azure AI
```

### Core Elements
```
Text, Image, Video, Audio, Code, Multimodal,
Agents, Hardware, API/Platform, Safety/Security
```

## News Data Schema (Firestore Format)

```json
{
  "id": "uuid-v4",
  "title": "English title",
  "title_ko": "Korean title",
  "summary": "English summary...",
  "summary_ko": "Korean summary...",
  "why_it_matters": "Why this matters...",
  "why_it_matters_ko": "Korean why it matters...",
  "searchKeywords": ["keyword1", "keyword2"],
  "searchKeywords_ko": ["keyword1_ko", "keyword2_ko"],
  "categories": ["AI Research", "LLM"],
  "productServices": ["Gemini"],
  "coreElements": ["Text", "Multimodal"],
  "sourceUrl": "https://original-article.com",
  "imageUrl": "https://thumbnail-image.jpg",
  "publishedDate": "2026-04-10",
  "impactScore": 85,
  "likes": 0
}
```

## Frontend Sync Points

- Categories/services/core elements in `src/constants/index.js` **must** stay in sync with `taxonomy.py`
- `CATEGORY_ID_MAP`, `SERVICE_ID_MAP`, `CORE_ID_MAP` = English → Korean label mapping
- When adding a new category: update `taxonomy.py` + `constants/index.js` + `locales/ko.json` together
