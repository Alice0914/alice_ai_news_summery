import {
  Briefcase, TrendingUp, HeartPulse, Clapperboard, GraduationCap, Scale,
  Cpu, Coffee, Shield, Bot, Lightbulb, Zap,
  FileText, Image as ImageIcon, Film, Mic, Layers, Code,
  Smartphone, Watch, Database, Workflow, Server, ShieldCheck, MessageSquare
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'Business', label: '비즈니스', icon: Briefcase, color: 'text-cyan-400', gradient: 'from-cyan-400 to-blue-500' },
  { id: 'Finance', label: '금융/투자', icon: TrendingUp, color: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'Healthcare', label: '의료/과학', icon: HeartPulse, color: 'text-rose-400', gradient: 'from-rose-400 to-pink-500' },
  { id: 'Creative', label: '엔터테인먼트', icon: Clapperboard, color: 'text-purple-400', gradient: 'from-purple-400 to-indigo-500' },
  { id: 'Education', label: '교육', icon: GraduationCap, color: 'text-blue-400', gradient: 'from-blue-400 to-indigo-500' },
  { id: 'Society', label: '사회/정책', icon: Scale, color: 'text-amber-300', gradient: 'from-amber-300 to-orange-500' },
  { id: 'Hardware', label: '하드웨어', icon: Cpu, color: 'text-indigo-400', gradient: 'from-indigo-400 to-violet-500' },
  { id: 'Lifestyle', label: '라이프스타일', icon: Coffee, color: 'text-orange-400', gradient: 'from-orange-400 to-red-500' },
  { id: 'Security', label: '국방/보안', icon: Shield, color: 'text-teal-400', gradient: 'from-teal-400 to-emerald-500' },
  { id: 'Robotics', label: '로보틱스/물리 AI', icon: Bot, color: 'text-pink-400', gradient: 'from-pink-400 to-rose-500' },
  { id: 'Research', label: '연구/혁신', icon: Lightbulb, color: 'text-lime-400', gradient: 'from-lime-400 to-green-500' },
  { id: 'Energy', label: '에너지/환경', icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-400 to-orange-500' },
];

export const PRODUCT_SERVICES = [
  { id: 'TextAI', label: '텍스트 AI', icon: FileText, color: 'text-blue-400', gradient: 'from-blue-400 to-cyan-400' },
  { id: 'ImageAI', label: '이미지 AI', icon: ImageIcon, color: 'text-pink-400', gradient: 'from-pink-400 to-rose-400' },
  { id: 'VideoAI', label: '동영상 AI', icon: Film, color: 'text-red-400', gradient: 'from-red-400 to-orange-400' },
  { id: 'VoiceAI', label: '음성 AI', icon: Mic, color: 'text-purple-400', gradient: 'from-purple-400 to-violet-400' },
  { id: 'AgentAI', label: '에이전트 AI', icon: Bot, color: 'text-emerald-400', gradient: 'from-emerald-400 to-teal-400' },
  { id: 'AutoAI', label: '자동화 AI', icon: Zap, color: 'text-yellow-400', gradient: 'from-yellow-400 to-amber-400' },
  { id: 'MultiModal', label: '멀티모달 AI', icon: Layers, color: 'text-indigo-400', gradient: 'from-indigo-400 to-blue-500' },
  { id: 'VibeCoding', label: '바이브 코딩 AI', icon: Code, color: 'text-lime-400', gradient: 'from-lime-400 to-green-400' },
  { id: 'RoboticsAI', label: '로보틱스', icon: MessageSquare, color: 'text-slate-300', gradient: 'from-slate-400 to-gray-400' },
  { id: 'OnDevice', label: '엣지/온디바이스 AI', icon: Smartphone, color: 'text-orange-400', gradient: 'from-orange-400 to-amber-400' },
  { id: 'Wearable', label: '웨어러블 AI', icon: Watch, color: 'text-teal-400', gradient: 'from-teal-400 to-cyan-400' },
];

export const CORE_ELEMENTS = [
  { id: 'Data', label: '데이터', icon: Database, color: 'text-sky-400', gradient: 'from-sky-400 to-blue-500' },
  { id: 'Algorithm', label: '알고리즘', icon: Workflow, color: 'text-violet-400', gradient: 'from-violet-400 to-purple-500' },
  { id: 'Computing', label: '컴퓨팅', icon: Server, color: 'text-indigo-400', gradient: 'from-indigo-400 to-blue-600' },
  { id: 'Safety', label: '안전/윤리', icon: ShieldCheck, color: 'text-emerald-400', gradient: 'from-emerald-400 to-green-500' },
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
