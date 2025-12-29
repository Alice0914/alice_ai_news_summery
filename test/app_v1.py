import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, Share2, Sparkles, Hash, X, 
  ChevronDown, ChevronUp, Zap, ArrowRight, ExternalLink, ThumbsUp, Filter, Copy, Send,
  Linkedin, Facebook, Instagram, User, Home, Compass, Bookmark, CheckCircle2, BarChart2,
  ChevronLeft, RotateCcw
} from 'lucide-react';

/* ===================================================================
   [1] DATA & CONSTANTS
   =================================================================== */

const CATEGORIES = [
  "비즈니스", "테크/AI", "헬스케어/과학", "엔터/창작", 
  "교육", "사회/정책", "하드웨어", "라이프스타일"
];

const CATEGORY_ICONS = {
  '비즈니스': '💼', '테크/AI': '💻', '헬스케어/과학': '🧬', '엔터/창작': '▶️',
  '교육': '🎓', '사회/정책': '⚖️', '하드웨어': '🔌', '라이프스타일': '🛍️'
};

const CORE_ELEMENTS = [
  { id: "데이터", label: "데이터" },
  { id: "알고리즘", label: "알고리즘" },
  { id: "컴퓨트", label: "컴퓨트" },
  { id: "안전/윤리", label: "안전/윤리" }
];

const PRODUCT_SERVICES = [
  { id: "텍스트 AI", label: "텍스트" },
  { id: "이미지 AI", label: "이미지" },
  { id: "동영상 AI", label: "동영상" },
  { id: "음성 AI", label: "음성" },
  { id: "에이전트 AI", label: "에이전트" },
  { id: "자동화 AI", label: "자동화" },
  { id: "멀티모달 AI", label: "멀티모달" },
  { id: "바이브 코딩 AI", label: "바이브 코딩" }
];

const PERIODS = [
  { id: 'latest', label: '최신' },
  { id: '1week', label: '1주' },
  { id: '1month', label: '1개월' },
  { id: 'all', label: '전체' }
];

const MOCK_NEWS_DATA = [
  {
    id: 1,
    title: "OpenAI CEO 샘 알트먼, 구글의 AI 진격에 '경제적 역풍' 우려 표명",
    summary: "샘 알트먼은 내부 메모를 통해 구글의 Gemini 3 등 최근 성과로 인한 경쟁 심화를 경고했습니다. 단기적 압박에도 불구하고 자동화된 AI 연구와 합성 데이터 같은 장기적 베팅에 집중할 것을 주문했습니다.",
    categories: ["비즈니스", "테크/AI"],
    coreElements: ["알고리즘"],
    productServices: ["텍스트 AI"],
    date: "2025.11.24",
    source: "The Information",
    sourceUrl: "https://www.theinformation.com",
    shareCount: 154,
    clickCount: 3200,
    likes: 856,
  },
  {
    id: 2,
    title: "앤스로픽, 코딩과 에이전트 작업에 특화된 'Claude Opus 4.5' 출시",
    summary: "앤스로픽이 새로운 플래그십 모델 Claude Opus 4.5를 출시했습니다. 특히 코딩과 에이전트 벤치마크에서 최고 기록을 경신했으며, 이전 버전 대비 가격을 66% 낮추어 효율성을 극대화했습니다.",
    categories: ["테크/AI", "비즈니스"],
    coreElements: ["알고리즘"],
    productServices: ["텍스트 AI", "에이전트 AI", "바이브 코딩 AI"],
    date: "2025.11.25",
    source: "Anthropic",
    sourceUrl: "https://www.anthropic.com",
    shareCount: 420,
    clickCount: 5100,
    likes: 1240,
  },
  {
    id: 3,
    title: "ChatGPT, 맞춤형 쇼핑 가이드를 제공하는 '쇼핑 어시스턴트' 도입",
    summary: "OpenAI가 GPT-5 mini를 기반으로 한 인터랙티브 쇼핑 어시스턴트를 선보였습니다. 사용자의 질문에 맞춰 제품을 비교하고 신뢰할 수 있는 리뷰를 분석하여 개인화된 구매 가이드를 제공합니다.",
    categories: ["라이프스타일", "테크/AI"],
    coreElements: ["데이터"],
    productServices: ["에이전트 AI", "텍스트 AI"],
    date: "2025.11.25",
    source: "OpenAI",
    sourceUrl: "https://openai.com",
    shareCount: 892,
    clickCount: 4521,
    likes: 980,
  },
  {
    id: 4,
    title: "아마존, 미 연방 기관을 위해 500억 달러 규모 AI 데이터센터 투자",
    summary: "아마존이 2026년부터 미국 연방 기관의 방위 및 정보 작전을 지원하기 위해 500억 달러를 투자하여 AI 및 슈퍼컴퓨팅 데이터센터를 구축합니다.",
    categories: ["비즈니스", "하드웨어", "사회/정책"],
    coreElements: ["컴퓨트", "안전/윤리"],
    productServices: ["자동화 AI"],
    date: "2025.11.25",
    source: "Amazon",
    sourceUrl: "https://www.aboutamazon.com",
    shareCount: 120,
    clickCount: 1500,
    likes: 450,
  },
  {
    id: 5,
    title: "딥시크(DeepSeek), 수학 추론 능력을 갖춘 오픈소스 AI 모델 공개",
    summary: "DeepSeek가 국제수학올림피아드(IMO) 수준의 문제를 해결할 수 있는 오픈소스 모델 DeepSeek-Math-V2를 공개했습니다. 생성-검증 시스템을 통해 논리적 추론 능력을 획기적으로 향상시켰습니다.",
    categories: ["테크/AI", "교육"],
    coreElements: ["알고리즘"],
    productServices: ["텍스트 AI", "자동화 AI"],
    date: "2025.11.28",
    source: "GitHub",
    sourceUrl: "https://github.com",
    shareCount: 300,
    clickCount: 2800,
    likes: 670,
  },
  {
    id: 6,
    title: "알리바바, 자체 LLM 탑재한 'Quark' AI 스마트 안경 출시",
    summary: "알리바바가 자사의 Qwen LLM으로 구동되는 스마트 안경 'Quark'를 중국 시장에 출시했습니다. 가격은 1,899위안부터 시작하며, 시각 정보 처리 및 어시스턴트 기능을 제공합니다.",
    categories: ["하드웨어", "테크/AI"],
    coreElements: ["컴퓨트"],
    productServices: ["멀티모달 AI"],
    date: "2025.11.28",
    source: "Alizila",
    sourceUrl: "https://www.alizila.com",
    shareCount: 210,
    clickCount: 1900,
    likes: 340,
  }
];

/* ===================================================================
   [2] COMPONENTS
   =================================================================== */

const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
    
    * { box-sizing: border-box; }
    
    body {
      font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    /* --- Screen 1: Onboarding (Dark Neon) --- */
    .theme-dark {
      background: #0B0B15; /* Very Dark Background */
      color: #ffffff;
      min-height: 100vh;
    }

    /* Gradient Button for Categories (Used in Onboarding only) */
    .gradient-card-btn {
      background: linear-gradient(135deg, #4C1D95 0%, #8B5CF6 50%, #2DD4BF 100%); /* Deep Purple -> Light Purple -> Tiffany Blue */
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: white;
    }
    
    .gradient-card-btn:active {
      transform: scale(0.98);
      opacity: 0.9;
    }

    .gradient-card-btn.unselected {
      background: rgba(255, 255, 255, 0.05); /* Dim state */
      opacity: 0.6;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: none;
    }

    .start-button-gradient {
      background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    }

    /* --- Screen 2: News Feed (Clean Light) --- */
    .theme-light {
      background-color: #F8F9FD;
      color: #111111;
      min-height: 100vh;
    }

    .news-card-blue {
      background: #FFFFFF;
      border-radius: 16px;
      transition: all 0.2s ease;
    }

    /* Collapsed Card: Very light version of #1E293B */
    .news-card-blue.collapsed {
      border: 1px solid rgba(30, 41, 59, 0.2); /* #1E293B with 20% opacity */
      box-shadow: 0 4px 6px rgba(30, 41, 59, 0.03);
    }

    .news-card-blue.expanded {
      border: 1px solid #3B82F6;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
    }
    
    .news-card-blue:active {
      transform: scale(0.99);
    }

    /* Pill Badges */
    .pill-badge {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      font-weight: 700;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }

    /* Filter Modal Overlay */
    .modal-overlay {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
    }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    .fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `}</style>
);

// Custom Icons
const ThreadsIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M11.66 2.05a8.77 8.77 0 0 1 8.77 8.77v.06a4.39 4.39 0 0 1-8.77 0v-.06a8.77 8.77 0 0 1 8.77-8.77m0-2.05A10.82 10.82 0 0 0 .84 10.82c0 6 4.87 10.82 10.82 10.82a10.76 10.76 0 0 0 7.9-3.4l-1.57-1.42a8.72 8.72 0 0 1-6.33 2.77 8.77 8.77 0 0 1-8.77-8.77A8.77 8.77 0 0 1 11.66 2.05z" />
    <path d="M12.63 7.5a3.32 3.32 0 0 0-3.32 3.32 3.32 3.32 0 0 0 3.32 3.32 3.32 3.32 0 0 0 3.32-3.32 3.32 3.32 0 0 0-3.32-3.32zm0-2.05a5.37 5.37 0 0 1 5.37 5.37 5.37 5.37 0 0 1-5.37 5.37 5.37 5.37 0 0 1-5.37-5.37 5.37 5.37 0 0 1 5.37-5.37z" />
  </svg>
);

// News Card Component
const NewsCard = ({ news, onShare, isExpanded, onToggle, selectedCategories }) => {
  const displayCategory = selectedCategories.length > 0
    ? (news.categories.find(cat => selectedCategories.includes(cat)) || news.categories[0])
    : news.categories[0];

  return (
    <div 
      className={`news-card-blue mb-4 overflow-hidden cursor-pointer ${isExpanded ? 'expanded' : 'collapsed'}`}
      onClick={onToggle}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {isExpanded ? (
               news.categories.map((cat, i) => (
                 <span key={i} className="pill-badge px-2.5 py-0.5 rounded-full text-[11px]">{cat}</span>
               ))
            ) : (
               <span className="pill-badge px-2.5 py-0.5 rounded-full text-[11px]">{displayCategory}</span>
            )}
            <span className="text-[12px] text-gray-400 font-medium ml-1">{news.date}</span>
          </div>
          {!isExpanded && <ChevronDown className="w-5 h-5 text-gray-300" />}
        </div>

        {/* Title */}
        <h3 className={`font-bold text-[#111] leading-snug ${isExpanded ? 'text-[18px] mb-3' : 'text-[16px]'}`}>
          {news.title}
        </h3>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <p className="text-[15px] text-gray-600 leading-relaxed mb-5">
              {news.summary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {news.productServices?.map(ps => (
                <div key={ps} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  <Zap className="w-3 h-3" /> {ps}
                </div>
              ))}
              {news.coreElements?.map(el => (
                <div key={el} className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <Hash className="w-3 h-3" /> {el}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); window.open(news.sourceUrl, '_blank'); }}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 hover:text-blue-600 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  원본보기
                </button>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-400">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {news.likes}
                </div>
              </div>
              
              <div className="flex gap-3">
                 <button className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                    <Bookmark className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={(e) => { e.stopPropagation(); onShare(news); }}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-[13px] font-bold shadow-md hover:bg-blue-700 transition-all flex items-center justify-center"
                >
                  공유
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================================================================
   [3] MAIN APP
   =================================================================== */

const App = () => {
  const [currentPage, setCurrentPage] = useState('selection');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); 
  const [userComment, setUserComment] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState(null); 
  const [filterCore, setFilterCore] = useState([]);
  const [filterProduct, setFilterProduct] = useState([]);
  const [expandedNewsId, setExpandedNewsId] = useState(null);

  const [filterPeriod, setFilterPeriod] = useState('latest');

  useEffect(() => { window.scrollTo(0, 0); }, [currentPage]);
  useEffect(() => { if (shareModalOpen) setUserComment(''); }, [shareModalOpen]);

  const toggleSelection = (list, setList, item) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const toggleFilterCategory = (category) => {
    setActiveFilterCategory(prev => prev === category ? null : category);
  };

  const getFilteredNews = () => {
    let filtered = MOCK_NEWS_DATA;
    if (searchTerm) {
      filtered = filtered.filter(news => news.title.toLowerCase().includes(searchTerm.toLowerCase()) || news.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(news => news.categories.some(cat => selectedCategories.includes(cat)));
    }
    if (filterProduct.length > 0) {
      filtered = filtered.filter(news => news.productServices && news.productServices.some(p => filterProduct.includes(p)));
    }
    if (filterCore.length > 0) {
      filtered = filtered.filter(news => news.coreElements && news.coreElements.some(c => filterCore.includes(c)));
    }
    if (activeTab === 'popular') {
      filtered = [...filtered].sort((a, b) => b.likes - a.likes);
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return filtered;
  };

  const filteredNewsList = getFilteredNews();

  /* --- Screen 1: Onboarding --- */
  if (currentPage === 'selection') {
    return (
      <>
        <GlobalStyles />
        <div className="theme-dark flex flex-col items-center p-6 pb-8">
          <div className="w-full max-w-md flex flex-col flex-1 pt-20">
            <div className="mb-10 text-center">
              <h1 className="text-[42px] font-extrabold leading-tight tracking-tight mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
                <span className="text-white ml-2">1분 트렌드</span>
              </h1>
              <p className="text-gray-400 text-sm">
                AI 트렌드 확인하고 바로 공유까지, <span className="text-blue-400 font-bold">딱 1분!</span>
              </p>
            </div>

            <h2 className="text-left text-lg font-bold text-gray-200 mb-4 pl-1">관심분야 선택</h2>

            <div className="grid grid-cols-2 gap-3 mb-auto">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleSelection(selectedCategories, setSelectedCategories, cat)}
                    className={`
                      relative p-4 rounded-2xl flex items-center gap-3 text-left group
                      gradient-card-btn
                      ${isSelected ? 'selected' : 'unselected'}
                    `}
                  >
                    <span className="text-2xl filter drop-shadow-md">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-[15px] font-bold text-white">
                      {cat}
                    </span>
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-white animate-in zoom-in duration-200">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => selectedCategories.length > 0 && setCurrentPage('feed')}
              disabled={selectedCategories.length === 0}
              className={`
                w-full py-4 rounded-full font-bold text-[16px] flex items-center justify-center gap-2 
                transition-all duration-300 mt-8 mb-4
                ${selectedCategories.length > 0
                  ? 'start-button-gradient text-white hover:scale-[1.02]'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <span>트렌드 확인하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </>
    );
  }

  /* --- Screen 2: News Feed --- */
  return (
    <>
      <GlobalStyles />
      <div className="theme-light flex flex-col relative">
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-40 pb-2 border-b border-gray-100">
          <div className="max-w-md mx-auto px-5 pt-14"> 
            <div className="flex items-center justify-between mb-4">
              <div className="w-8"></div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI 1분 트렌드</h1>
              <div className="flex items-center gap-2">
                <button className="text-slate-900"><User className="w-6 h-6" /></button>
                <button onClick={() => setCurrentPage('selection')} className="text-slate-500 hover:text-slate-900">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="키워드로 AI 트렌드 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-[14px] text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <button 
                onClick={() => setFilterModalOpen(true)}
                className="flex items-center justify-center gap-1 px-4 py-2.5 bg-[#1E293B] text-white rounded-full text-[13px] font-bold shadow-sm hover:opacity-90 transition-all"
              >
                <Filter className="w-4 h-4" />
                필터
              </button>
            </div>

            <div className="relative flex bg-white border border-gray-200 rounded-full p-1 shadow-sm mt-1">
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1E293B] rounded-full shadow-sm transition-all duration-300 ease-out ${activeTab === 'feed' ? 'left-1' : 'left-[calc(50%+2px)]'}`} />
              <button onClick={() => setActiveTab('feed')} className={`flex-1 relative z-10 py-2.5 text-[14px] font-bold text-center transition-colors ${activeTab === 'feed' ? 'text-white' : 'text-gray-500'}`}>최신순</button>
              <button onClick={() => setActiveTab('popular')} className={`flex-1 relative z-10 py-2.5 text-[14px] font-bold text-center transition-colors ${activeTab === 'popular' ? 'text-white' : 'text-gray-500'}`}>인기순</button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 pb-24">
          {filteredNewsList.map((news, index) => (
            <NewsCard 
              key={news.id} 
              news={news} 
              index={index}
              isExpanded={expandedNewsId === news.id}
              selectedCategories={selectedCategories}
              onToggle={() => setExpandedNewsId(expandedNewsId === news.id ? null : news.id)}
              onShare={(n) => { setSelectedNews(n); setShareModalOpen(true); }} 
            />
          ))}
          <div className="text-center pt-8 pb-12 text-gray-400 text-sm font-medium">
            모든 뉴스를 확인했습니다
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-30">
          <div className="max-w-md mx-auto flex justify-around py-3">
            <button className="flex flex-col items-center gap-1 text-blue-600"><Home className="w-6 h-6" /></button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"><Compass className="w-6 h-6" /></button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"><Bookmark className="w-6 h-6" /></button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"><User className="w-6 h-6" /></button>
          </div>
        </nav>

        {filterModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center modal-overlay p-4" onClick={() => setFilterModalOpen(false)}>
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-extrabold text-slate-900">필터</h2>
                <button onClick={() => setFilterModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
              </div>

              {/* Filter Sections ... (Same as before) */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-4">관심분야</h3>
                <div className="flex flex-col gap-3">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedCategories.includes(cat) ? 'border-blue-600' : 'border-gray-300'}`}>
                        {selectedCategories.includes(cat) && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                      </div>
                      <span className={`text-[15px] ${selectedCategories.includes(cat) ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>{cat}</span>
                      <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat)} onChange={() => toggleSelection(selectedCategories, setSelectedCategories, cat)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-4">AI 서비스</h3>
                <div className="flex flex-col gap-3">
                  {PRODUCT_SERVICES.map(ps => (
                    <label key={ps.id} className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${filterProduct.includes(ps.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {filterProduct.includes(ps.id) && <X className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[15px] text-gray-600">{ps.label}</span>
                      <input type="checkbox" className="hidden" onChange={() => toggleSelection(filterProduct, setFilterProduct, ps.id)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 mb-4">AI 핵심요소</h3>
                <div className="flex flex-col gap-3">
                  {CORE_ELEMENTS.map(el => (
                    <label key={el.id} className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${filterCore.includes(el.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {filterCore.includes(el.id) && <X className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[15px] text-gray-600">{el.label}</span>
                      <input type="checkbox" className="hidden" onChange={() => toggleSelection(filterCore, setFilterCore, el.id)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-900 mb-4">기간</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PERIODS.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${filterPeriod === p.id ? 'border-blue-600' : 'border-gray-300'}`}>
                        {filterPeriod === p.id && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                      </div>
                      <span className="text-[15px] text-gray-600">{p.label}</span>
                      <input type="radio" name="period" className="hidden" checked={filterPeriod === p.id} onChange={() => setFilterPeriod(p.id)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => { setSelectedCategories([]); setFilterProduct([]); setFilterCore([]); setFilterPeriod('latest'); }} className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-600 font-bold text-sm">초기화</button>
                <button onClick={() => setFilterModalOpen(false)} className="flex-[2] py-3.5 rounded-xl bg-[#1E293B] text-white font-bold text-sm shadow-lg">적용</button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal with Comment Preview */}
        {shareModalOpen && selectedNews && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]" onClick={() => setShareModalOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative z-10 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-[16px] font-bold text-[#111]">공유하기</h3>
                <button onClick={() => setShareModalOpen(false)} className="p-1 rounded-full bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-5">
                {/* Visual Preview Area */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">PREVIEW</span>
                    </div>
                    
                    {/* User's Comment Display */}
                    {userComment && (
                        <div className="mb-4 text-[15px] font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {userComment}
                        </div>
                    )}

                    {/* Embedded Card */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-bold text-blue-600">{selectedNews.categories[0]}</span>
                            <span className="text-[10px] text-gray-400">{selectedNews.date}</span>
                        </div>
                        <h4 className="text-[14px] font-bold text-[#111] mb-2 leading-snug">{selectedNews.title}</h4>
                        <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">{selectedNews.summary}</p>
                    </div>
                </div>

                <div className="mb-6">
                     <label className="block text-[12px] font-bold text-slate-500 mb-2">코멘트 작성</label>
                     <textarea
                       className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:border-blue-500 transition-all resize-none"
                       rows="2"
                       placeholder="이 뉴스에 대한 생각을 남겨보세요..."
                       value={userComment}
                       onChange={(e) => setUserComment(e.target.value)}
                     />
                </div>

                <div className="flex justify-between items-center gap-2 mb-6 px-1">
                  {[
                    { id: 'Link', icon: <Linkedin className="w-5 h-5" />, color: 'bg-[#0077B5] border-transparent text-white' },
                    { id: 'X', icon: <X className="w-5 h-5" />, color: 'bg-black border-transparent text-white' },
                    { id: 'FB', icon: <Facebook className="w-5 h-5" />, color: 'bg-[#1877F2] border-transparent text-white' },
                    { id: 'IG', icon: <Instagram className="w-5 h-5" />, color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] border-transparent text-white' },
                    { id: 'Th', icon: <ThreadsIcon className="w-5 h-5" />, color: 'bg-black border-transparent text-white' }
                  ].map(sns => (
                    <button key={sns.id} className={`w-12 h-12 flex items-center justify-center rounded-full border ${sns.color} shadow-sm transition-transform active:scale-95`}>{sns.icon}</button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50">URL 복사</button>
                  <button className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700">공유</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default App;