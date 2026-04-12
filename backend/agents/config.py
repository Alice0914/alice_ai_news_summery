"""
Configuration for the News Pipeline.
Contains category maps, model names, and priority settings.
"""

# Model Configuration
MODEL_PRO = "gemini-2.5-pro"
MODEL_PRO_ULTRA = "gemini-2.5-pro"
MODEL_FLASH = "gemini-2.5-flash"
MODEL_GROK = "grok-4-1-fast-reasoning"
# MODEL_EMBEDDING = "models/gemini-embedding-001"
MODEL_EMBEDDING = "models/gemini-embedding-2-preview"

# Source Priority (Higher = More Authoritative)
SOURCE_PRIORITY = {
    # --- Tier 1: Primary Research Labs & Tech Giants (Priority 10) ---
    "OpenAI": 10,
    "Google": 10,
    "Anthropic": 10,
    "NVIDIA": 10,
    "xAI": 10,
    "DeepMind": 10,
    "MIT": 10,
    "Microsoft": 10,
    "Meta": 10,
    "Apple": 10,
    "Amazon": 10,
    "Databricks": 10,
    "IBM": 10,
    "Alibaba": 10,
    "Tencent": 10,

    # --- Tier 1.5: Key AI Startups & Platforms (Priority 10) ---
    "Hugging Face": 10,
    "Mistral": 10,
    "Cohere": 10,
    "Stability AI": 10,
    "Midjourney": 10,
    "Perplexity": 10,
    "Scale AI": 10,
    "EleutherAI": 10,

    # --- Tier 1.5: Top Academic Research (Priority 10) ---
    "Stanford": 10,
    "Berkeley": 10,
    "CMU": 10,

    # --- Tier 2: Reputable Tech Journalism (Priority 5) ---
    # These generate original reporting, unlike aggregators.
    "TechCrunch": 5,
    "The Verge": 5,
    "VentureBeat": 5,
    "Wired": 5,
    "Ars Technica": 5,
    "Bloomberg": 5,
    "Reuters": 5,

    # --- Tier 3: Aggregators & Newsletters (Priority 1) ---
    "The Rundown": 1,
    "The Neuron": 1,
    "Ben's Bites": 1,
    "TLDR AI": 1,
    "Last Week in AI": 1,
    
    # --- Fallback ---
    "Unknown": 1
}

# Similarity Threshold for Deduplication
SIMILARITY_THRESHOLD = 0.85

# Top K articles for "Why It Matters" generation
TOP_K_WHY_IT_MATTERS = 20

# Category, Service, Core Maps
CATEGORY_MAP = {
    "Business": "비즈니스",
    "Finance/Investment": "금융/투자",
    "Healthcare/Science": "의료/과학",
    "Entertainment/Creative": "엔터테인먼트",
    "Education": "교육",
    "Society/Policy": "사회/정책",
    "Hardware": "하드웨어",
    "Lifestyle": "라이프스타일",
    "Defense/Security": "국방/보안",
    "Robotics/Physical AI": "로보틱스/물리 AI",
    "Research/Innovation": "연구/혁신",
    "Energy/Environment": "에너지/환경",
    "Tech/AI": "테크/AI",
    "Economy": "경제",
    "Automotive": "자동차",
    "Infrastructure": "인프라",
    "Technology": "기술"
}

SERVICE_MAP = {
    "Text AI": "텍스트 AI",
    "Image AI": "이미지 AI",
    "Video AI": "동영상 AI",
    "Voice AI": "음성 AI",
    "Agent AI": "에이전트 AI",
    "Automation AI": "자동화 AI",
    "Multimodal AI": "멀티모달 AI",
    "Vibe Coding AI": "바이브 코딩 AI",
    "Robotics": "로보틱스",
    "Edge/On-Device AI": "엣지/온디바이스 AI",
    "Wearable AI": "웨어러블 AI",
    "Autonomous Driving AI": "자율주행 AI",
    "Generative AI": "생성형 AI",
    "Database/Storage": "데이터베이스/스토리지"
}

CORE_MAP = {
    "Data": "데이터",
    "Algorithm": "알고리즘",
    "Computing": "컴퓨팅",
    "Safety/Ethics": "안전/윤리"
}

def get_allowed_tags():
    """Return lists of allowed tags for prompt guidance."""
    return {
        "categories": list(CATEGORY_MAP.keys()),
        "productServices": list(SERVICE_MAP.keys()),
        "coreElements": list(CORE_MAP.keys())
    }