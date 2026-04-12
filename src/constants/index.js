import {
    Briefcase, TrendingUp, HeartPulse, Clapperboard, GraduationCap, Scale,
    Cpu, Coffee, Shield, Bot, Lightbulb, Zap, Database, Code, Server, ShieldCheck,
    FileText, Image as ImageIcon, Film, Mic, Sparkles, Workflow, Layers, Smartphone, Watch
} from 'lucide-react';

export const PERIODS = [
    { id: 'popular', label: 'Popular' },
    { id: 'important', label: 'Important' }
];

export const TIME_RANGES = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this_week', label: 'This Week' },
    { id: 'last_week', label: 'Last Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'all', label: 'All Time' }
];

export const CATEGORIES = [
    { id: 'Business', icon: Briefcase, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Finance/Investment', icon: TrendingUp, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Healthcare/Science', icon: HeartPulse, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Entertainment/Creative', icon: Clapperboard, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Education', icon: GraduationCap, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Society/Policy', icon: Scale, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Hardware', icon: Cpu, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Lifestyle', icon: Coffee, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Defense/Security', icon: Shield, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Robotics/Physical AI', icon: Bot, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Research/Innovation', icon: Lightbulb, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'Energy/Environment', icon: Zap, color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' }
];

export const PRODUCT_SERVICES = [
    { id: 'Text AI', icon: FileText, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Image AI', icon: ImageIcon, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Video AI', icon: Film, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Voice AI', icon: Mic, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Agent AI', icon: Bot, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Automation AI', icon: Workflow, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Multimodal AI', icon: Layers, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Vibe Coding AI', icon: Sparkles, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Robotics', icon: Bot, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Edge/On-Device AI', icon: Smartphone, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
    { id: 'Wearable AI', icon: Watch, color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' }
];

export const CORE_ELEMENTS = [
    { id: 'Data', icon: Database, color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
    { id: 'Algorithm', icon: Code, color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
    { id: 'Computing', icon: Server, color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
    { id: 'Safety/Ethics', icon: ShieldCheck, color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' }
];

// ID Mappings (English -> Legacy Korean)
export const CATEGORY_ID_MAP = {
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
};

export const SERVICE_ID_MAP = {
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
};

export const CORE_ID_MAP = {
    "Data": "데이터",
    "Algorithm": "알고리즘",
    "Computing": "컴퓨팅",
    "Safety/Ethics": "안전/윤리"
};

// Reverse Mappings (Korean -> English) for migration of old data
export const CATEGORY_ID_MAP_REV = Object.fromEntries(Object.entries(CATEGORY_ID_MAP).map(([k, v]) => [v, k]));
export const SERVICE_ID_MAP_REV = Object.fromEntries(Object.entries(SERVICE_ID_MAP).map(([k, v]) => [v, k]));
export const CORE_ID_MAP_REV = Object.fromEntries(Object.entries(CORE_ID_MAP).map(([k, v]) => [v, k]));

// Migration Helper
export const migrateIds = (list, map) => {
    if (!Array.isArray(list)) return [];
    return list.map(item => map[item] || item);
};

// Deprecated helper kept for compatibility if needed, though App.jsx uses t() directly now
export const getLocalizedLabel = (id, list, lang) => {
    return id;
};
