# AI News Processing Pipeline v2

## Overview
Improved news processing pipeline with parallel collection, semantic deduplication, and optimized LLM usage.

## Quick Start
```python
from backend2.agents2 import run_pipeline

# Process news for a specific date range
output = run_pipeline("2026-01-30", "2026-01-30")
print(f"Output: {output}")
```

## Pipeline Steps

### Step 1: Parallel Data Collection
- Runs all collectors simultaneously using `ThreadPoolExecutor`
- Sources: Anthropic, MIT, NVIDIA, OpenAI, xAI, Robot Runtime, The Rundown

### Step 2: Deduplication
- Uses Gemini Embeddings for semantic similarity
- Keeps the most authoritative source
- Adds `exposure_score` for duplicate tracking

### Step 3: Scoring & Tagging (Combined)
- **Scoring**: Gemini 2.5 Pro calculates `impactScore` and `impactDetails`
- **Tagging**: Gemini 2.5 Flash adds categories, services, core elements, keywords
- **Why It Matters**: Generated for top 20 articles only

### Step 4: Translation & Output
- Translates title, summary, why_it_matters, keywords to Korean
- Maps tags to Korean using predefined maps
- Saves to `final_news_output_YYYYMMDD.json`

## Folder Structure
```
backend2/agents2/
├── __init__.py         # Exports run_pipeline
├── config.py           # Model settings, tag maps
├── pipeline.py         # Main orchestrator
├── collectors/         # Data collection wrappers
│   ├── anthropic_collector.py
│   ├── mit_collector.py
│   ├── nvidia_collector.py
│   ├── openai_collector.py
│   ├── xai_collector.py
│   ├── robot_collector.py
│   └── runtime_collector.py
└── processors/         # Data processing
    ├── deduplicator.py
    ├── scorer_tagger.py
    └── translator.py
```

## Model Usage
| Task | Model | Reason |
|------|-------|--------|
| Impact Scoring | Gemini 2.5 Pro | Complex reasoning |
| Tagging | Gemini 2.5 Flash | Fast, cost-effective |
| Translation | Gemini 2.5 Flash | Fast, cost-effective |
| Embeddings | text-embedding-005 | Semantic similarity |
