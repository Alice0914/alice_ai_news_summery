import {
  Briefcase, TrendingUp, HeartPulse, Clapperboard, GraduationCap, Scale,
  Cpu, Coffee, Shield, Bot, Lightbulb, Zap,
  FileText, Image as ImageIcon, Film, Mic, Layers, Code,
  Smartphone, Watch, Database, Workflow, Server, ShieldCheck, MessageSquare
} from 'lucide-react';

export const CATEGORIES = [
  { id: '비즈니스', label: '비즈니스', icon: Briefcase, color: 'text-cyan-400', gradient: 'from-cyan-400 to-blue-500' },
  { id: '금융/투자', label: '금융/투자', icon: TrendingUp, color: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-500' },
  { id: '의료/과학', label: '의료/과학', icon: HeartPulse, color: 'text-rose-400', gradient: 'from-rose-400 to-pink-500' },
  { id: '엔터테인먼트', label: '엔터테인먼트', icon: Clapperboard, color: 'text-purple-400', gradient: 'from-purple-400 to-indigo-500' },
  { id: '교육', label: '교육', icon: GraduationCap, color: 'text-blue-400', gradient: 'from-blue-400 to-indigo-500' },
  { id: '사회/정책', label: '사회/정책', icon: Scale, color: 'text-amber-300', gradient: 'from-amber-300 to-orange-500' },
  { id: '하드웨어', label: '하드웨어', icon: Cpu, color: 'text-indigo-400', gradient: 'from-indigo-400 to-violet-500' },
  { id: '라이프스타일', label: '라이프스타일', icon: Coffee, color: 'text-orange-400', gradient: 'from-orange-400 to-red-500' },
  { id: '국방/보안', label: '국방/보안', icon: Shield, color: 'text-teal-400', gradient: 'from-teal-400 to-emerald-500' },
  { id: '로보틱스/물리 AI', label: '로보틱스/물리 AI', icon: Bot, color: 'text-pink-400', gradient: 'from-pink-400 to-rose-500' },
  { id: '연구/혁신', label: '연구/혁신', icon: Lightbulb, color: 'text-lime-400', gradient: 'from-lime-400 to-green-500' },
  { id: '에너지/환경', label: '에너지/환경', icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-400 to-orange-500' },
];

export const PRODUCT_SERVICES = [
  { id: '텍스트 AI', label: '텍스트 AI', icon: FileText, color: 'text-blue-400', gradient: 'from-blue-400 to-cyan-400' },
  { id: '이미지 AI', label: '이미지 AI', icon: ImageIcon, color: 'text-pink-400', gradient: 'from-pink-400 to-rose-400' },
  { id: '동영상 AI', label: '동영상 AI', icon: Film, color: 'text-red-400', gradient: 'from-red-400 to-orange-400' },
  { id: '음성 AI', label: '음성 AI', icon: Mic, color: 'text-purple-400', gradient: 'from-purple-400 to-violet-400' },
  { id: '에이전트 AI', label: '에이전트 AI', icon: Bot, color: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-400' },
  { id: '자동화 AI', label: '자동화 AI', icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-400 to-amber-400' },
  { id: '멀티모달 AI', label: '멀티모달 AI', icon: Layers, color: 'text-indigo-400', gradient: 'from-indigo-400 to-blue-500' },
  { id: '바이브 코딩 AI', label: '바이브 코딩 AI', icon: Code, color: 'text-lime-400', gradient: 'from-lime-400 to-green-400' },
  { id: '로보틱스', label: '로보틱스', icon: MessageSquare, color: 'text-slate-300', gradient: 'from-slate-400 to-gray-400' },
  { id: '엣지/온디바이스 AI', label: '엣지/온디바이스 AI', icon: Smartphone, color: 'text-orange-400', gradient: 'from-orange-400 to-amber-400' },
  { id: '웨어러블 AI', label: '웨어러블 AI', icon: Watch, color: 'text-teal-400', gradient: 'from-teal-400 to-cyan-400' },
];

export const CORE_ELEMENTS = [
  { id: '데이터', label: '데이터', icon: Database, color: 'text-sky-400', gradient: 'from-sky-400 to-blue-500' },
  { id: '알고리즘', label: '알고리즘', icon: Workflow, color: 'text-violet-400', gradient: 'from-violet-400 to-purple-500' },
  { id: '컴퓨팅', label: '컴퓨팅', icon: Server, color: 'text-indigo-400', gradient: 'from-indigo-400 to-blue-600' },
  { id: '안전/윤리', label: '안전/윤리', icon: ShieldCheck, color: 'text-emerald-400', gradient: 'from-emerald-400 to-green-500' },
];

export const PERIODS = [
  { id: 'latest', label: '최신순' },
  { id: 'popular', label: '인기순' },
  { id: 'important', label: '중요도순' },
];

export const TIME_RANGES = [
  { id: 'today', label: '오늘' },
  { id: 'yesterday', label: '어제' },
  { id: 'this_week', label: '이번주' },
  { id: 'last_week', label: '지난주' },
  { id: 'this_month', label: '이번달' },
  { id: 'last_month', label: '지난달' },
];

// ID Migration Maps: Convert old English IDs to new Korean IDs
export const CATEGORY_ID_MAP = {
  'Business': '비즈니스',
  'Finance': '금융/투자',
  'Healthcare': '의료/과학',
  'Creative': '엔터테인먼트',
  'Education': '교육',
  'Society': '사회/정책',
  'Hardware': '하드웨어',
  'Lifestyle': '라이프스타일',
  'Security': '국방/보안',
  'Robotics': '로보틱스/물리 AI',
  'Research': '연구/혁신',
  'Energy': '에너지/환경',
};

export const SERVICE_ID_MAP = {
  'TextAI': '텍스트 AI',
  'ImageAI': '이미지 AI',
  'VideoAI': '동영상 AI',
  'VoiceAI': '음성 AI',
  'AgentAI': '에이전트 AI',
  'AutoAI': '자동화 AI',
  'MultiModal': '멀티모달 AI',
  'VibeCoding': '바이브 코딩 AI',
  'RoboticsAI': '로보틱스',
  'OnDevice': '엣지/온디바이스 AI',
  'Wearable': '웨어러블 AI',
};

export const CORE_ID_MAP = {
  'Data': '데이터',
  'Algorithm': '알고리즘',
  'Computing': '컴퓨팅',
  'Safety': '안전/윤리',
};

// Helper function to migrate old IDs to new IDs
export const migrateIds = (ids, idMap) => {
  return ids.map(id => idMap[id] || id);
};
