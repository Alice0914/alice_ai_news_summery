import {
  Briefcase, TrendingUp, HeartPulse, Clapperboard, GraduationCap, Scale,
  Cpu, Coffee, Shield, Bot, Lightbulb, Zap,
  FileText, Image as ImageIcon, Film, Mic, Layers, Code,
  Smartphone, Watch, Database, Workflow, Server, ShieldCheck, MessageSquare
} from 'lucide-react';

export const CATEGORIES = [
  { id: '비즈니스', label: 'Business', icon: Briefcase, color: 'text-cyan-400', gradient: 'from-cyan-400 to-blue-500' },
  { id: '금융/투자', label: 'Finance/Investment', icon: TrendingUp, color: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-500' },
  { id: '의료/과학', label: 'Healthcare/Science', icon: HeartPulse, color: 'text-rose-400', gradient: 'from-rose-400 to-pink-500' },
  { id: '엔터테인먼트', label: 'Entertainment', icon: Clapperboard, color: 'text-purple-400', gradient: 'from-purple-400 to-indigo-500' },
  { id: '교육', label: 'Education', icon: GraduationCap, color: 'text-blue-400', gradient: 'from-blue-400 to-indigo-500' },
  { id: '사회/정책', label: 'Society/Policy', icon: Scale, color: 'text-amber-300', gradient: 'from-amber-300 to-orange-500' },
  { id: '로보틱스/물리 AI', label: 'Robotics/Physical AI', icon: Bot, color: 'text-pink-400', gradient: 'from-pink-400 to-rose-500' },
  { id: '하드웨어', label: 'Hardware', icon: Cpu, color: 'text-indigo-400', gradient: 'from-indigo-400 to-violet-500' },
  { id: '라이프스타일', label: 'Lifestyle', icon: Coffee, color: 'text-orange-400', gradient: 'from-orange-400 to-red-500' },
  { id: '국방/보안', label: 'Defense/Security', icon: Shield, color: 'text-teal-400', gradient: 'from-teal-400 to-emerald-500' },
  { id: '연구/혁신', label: 'Research/Innovation', icon: Lightbulb, color: 'text-lime-400', gradient: 'from-lime-400 to-green-500' },
  { id: '에너지/환경', label: 'Energy/Environment', icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-400 to-orange-500' },
];

export const PRODUCT_SERVICES = [
  { id: '텍스트 AI', label: 'Text AI', icon: FileText, color: 'text-blue-400', gradient: 'from-blue-400 to-cyan-400' },
  { id: '이미지 AI', label: 'Image AI', icon: ImageIcon, color: 'text-pink-400', gradient: 'from-pink-400 to-rose-400' },
  { id: '동영상 AI', label: 'Video AI', icon: Film, color: 'text-red-400', gradient: 'from-red-400 to-orange-400' },
  { id: '음성 AI', label: 'Voice AI', icon: Mic, color: 'text-purple-400', gradient: 'from-purple-400 to-violet-400' },
  { id: '에이전트 AI', label: 'Agent AI', icon: Bot, color: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-400' },
  { id: '자동화 AI', label: 'Automation AI', icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-400 to-amber-400' },
  { id: '멀티모달 AI', label: 'Multimodal AI', icon: Layers, color: 'text-indigo-400', gradient: 'from-indigo-400 to-blue-500' },
  { id: '바이브 코딩 AI', label: 'Vibe Coding AI', icon: Code, color: 'text-lime-400', gradient: 'from-lime-400 to-green-400' },
  { id: '로보틱스', label: 'Robotics', icon: MessageSquare, color: 'text-slate-300', gradient: 'from-slate-400 to-gray-400' },
  { id: '엣지/온디바이스 AI', label: 'Edge/On-Device AI', icon: Smartphone, color: 'text-orange-400', gradient: 'from-orange-400 to-amber-400' },
  { id: '웨어러블 AI', label: 'Wearable AI', icon: Watch, color: 'text-teal-400', gradient: 'from-teal-400 to-cyan-400' },
];

export const CORE_ELEMENTS = [
  { id: '데이터', label: 'Data', icon: Database, color: 'text-sky-400', gradient: 'from-sky-400 to-blue-500' },
  { id: '알고리즘', label: 'Algorithm', icon: Workflow, color: 'text-violet-400', gradient: 'from-violet-400 to-purple-500' },
  { id: '컴퓨팅', label: 'Computing', icon: Server, color: 'text-indigo-400', gradient: 'from-indigo-400 to-blue-600' },
  { id: '안전/윤리', label: 'Safety/Ethics', icon: ShieldCheck, color: 'text-emerald-400', gradient: 'from-emerald-400 to-green-500' },
];

export const PERIODS = [
  { id: 'latest', label: 'Newest' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'important', label: 'Highest Impact' },
];

export const TIME_RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
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
