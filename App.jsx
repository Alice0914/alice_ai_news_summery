import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ArrowRight, X, Filter, ChevronLeft, ChevronRight, Check,
  Linkedin, Facebook, Instagram, User, Home, Compass, Bookmark,
  Briefcase, TrendingUp, HeartPulse, Clapperboard, GraduationCap, Scale,
  Cpu, Coffee, Shield, Bot, Lightbulb, Zap,
  FileText, Image as ImageIcon, Film, Mic, Sparkles, Workflow, Layers, Code,
  Smartphone, Watch, Database, Share2, Server, ShieldCheck, MessageSquare, Heart, PartyPopper, LogOut
} from 'lucide-react';

// import MOCK_NEWS_DATA from './data/final_data_ko.json';

/* CONSTANTS                                                                  */
import {
  CATEGORIES as DATA_CATEGORIES,
  PRODUCT_SERVICES as DATA_SERVICES,
  CORE_ELEMENTS as DATA_CORE,
  PERIODS, TIME_RANGES,
  CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP, migrateIds
} from './constants';

import OnboardingAuth from './components/auth/OnboardingAuth';
import AuthPage from './components/auth/AuthPage';
import PreferencesPage from './components/PreferencesPage'; // NEW: Dedicated preferences editor
import { onAuthStateChanged } from 'firebase/auth'; // Added import
import {
  db, auth, logUserAccess, signInWithGoogle, logout, saveBookmark,
  removeBookmark,
  toggleLike,
  subscribeToUserData,
  saveUserPreferences, // NEW: For preferences persistence
} from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

/* -------------------------------------------------------------------------- */
/* ICONS & STYLES                                                             */
/* -------------------------------------------------------------------------- */

import { SAMPLE_IMAGES } from './constants/images';

const DiscordIcon = ({ className }) => (
  <img
    src="/discord_icon.png"
    alt="Discord"
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);


// Custom Threads Icon
const ThreadsIcon = ({ className }) => (
  <svg viewBox="0 0 192 192" fill="currentColor" className={className}>
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.022 87.845C137.535 83.8954 135.451 79.8115 132.796 76.0847C117.363 54.4279 97.5158 54.4279 81.3858 54.4279C70.1325 54.4279 60.1086 54.4279 50.8412 59.9572C33.1979 70.4851 32.5312 90.6277 32.7486 103.543C32.9659 116.459 34.6191 143.082 66.395 153.208C82.1627 158.232 99.3088 155.698 109.188 147.245L113.729 160.77C100.868 171.77 79.2845 174.636 59.0886 168.199C15.6881 154.368 16.5938 115.397 16.8906 103.275C17.1874 91.1537 19.8299 59.5005 58.7456 36.2779C74.6756 26.7725 91.3093 25.0772 103.226 27.6748C133.037 34.172 149.207 60.0357 153.681 74.8364C157.068 86.0396 156.417 98.2415 151.787 109.133C144.372 126.574 126.91 135.809 109.303 135.809C94.4716 135.809 82.5152 126.377 82.5152 110.884C82.5152 95.3912 95.0442 83.1893 110.406 83.1893C118.892 83.1893 126.044 86.8291 130.638 92.4276C131.026 92.9004 131.401 93.3855 131.764 93.8821C132.228 93.5226 132.686 93.1554 133.136 92.7806C136.634 89.8665 140.407 86.7237 141.537 88.9883ZM110.406 96.6577C102.774 96.6577 96.5828 102.849 96.5828 110.481C96.5828 118.113 102.774 124.305 110.406 124.305C118.038 124.305 124.229 118.113 124.229 110.481C124.229 102.849 118.038 96.6577 110.406 96.6577Z" />
  </svg>
);

const GlobalStyles = () => (
  <style>{`
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-in {
      animation: zoomIn 0.2s ease-out forwards;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom, 20px);
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #334155; /* slate-700 */
      border-radius: 20px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #475569; /* slate-600 */
    }
  `}</style>
);

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

// 1. Selection Step Component (Neon Style - Pages 1-3)
const SelectionStep = ({
  title, subtitle, items, selectedIds, onToggle, onNext, nextLabel, onPrev, onSkip
}) => (
  <div className="min-h-[100dvh] w-full bg-[#0f111a] flex flex-col items-center justify-center p-6 font-sans">
    <div className="w-full max-w-2xl flex flex-col h-full max-h-[90vh]">

      {/* Header */}
      <div className="mb-8 md:mb-12 text-center flex-none">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">AI</span>
          <span className="text-white ml-2">1분 트렌드</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          AI 트렌드 확인하고 바로 공유까지, <span className="text-blue-400 font-bold">딱 1분!</span>
        </p>
      </div>

      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
          {selectedIds.length}개 선택됨
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto p-2 pb-4 pr-1 custom-scrollbar">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onToggle(selectedIds, isSelected, item.id)}
              className={`
                relative group flex items-center p-4 rounded-2xl border text-left transition-all duration-300 w-full
                ${isSelected
                  ? 'bg-slate-800 border-slate-500 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.5),0_0_12px_-2px_rgba(255,255,255,0.1)] translate-y-[-2px] translate-x-0'
                  : 'bg-[#1a1d2d]/80 border-slate-700 hover:bg-[#1a1d2d] hover:border-slate-500 hover:shadow-lg'}
              `}
            >
              {/* Glow Effect */}
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br ${item.gradient} opacity-0 blur-xl rounded-full transition-opacity duration-500 ${isSelected ? 'opacity-25' : 'group-hover:opacity-15'}`} />

              {/* Icon */}
              <div className={`relative z-10 mr-4 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon
                  size={24}
                  className={`drop-shadow-md transition-colors duration-300 ${item.color}`}
                  strokeWidth={isSelected ? 2 : 1.5}
                />
              </div>

              {/* Label */}
              <span className="flex-grow text-base md:text-lg font-semibold tracking-wide text-white">
                {item.label}
              </span>

              {/* Checkbox UI */}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border
                ${isSelected
                  ? `bg-gradient-to-br ${item.gradient} border-transparent text-white shadow-lg scale-100`
                  : 'bg-slate-900/50 border-slate-700 text-transparent scale-95'}
              `}>
                <Check size={14} strokeWidth={3} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto pt-6 flex items-center gap-3">
        {onPrev && (
          <button onClick={onPrev} className="px-6 py-4 rounded-2xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all">
            이전
          </button>
        )}

        {onSkip && (
          <button onClick={onSkip} className="px-6 py-4 rounded-2xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all">
            건너뛰기
          </button>
        )}

        <button
          onClick={onNext}
          disabled={selectedIds.length === 0}
          className={`
            flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg
            ${selectedIds.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] shadow-blue-900/20'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}
          `}
        >
          <span>{nextLabel || '다음'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);


// 2. Feature News Card (Top 5) with Visuals
const TopNewsCard = ({ news, index, image, onShare, onSave, isSaved, onToggleLike, isLiked, selectedInterests, selectedServices, selectedCore }) => {
  // Logic to determine which category/service/core to show on the badge (top left)
  // Priority: 1. Matching Category 2. Matching Service 3. Matching Core Element 4. Default Category
  const displayCategory =
    (news.categories || []).find(cat => selectedInterests?.includes(cat)) ||
    (news.productServices || []).find(svc => selectedServices?.includes(svc)) ||
    (news.coreElements || []).find(core => selectedCore?.includes(core)) ||
    news.categories?.[0] || 'AI News';

  // Logic for tags: Show all categories/services/core EXCEPT the one displayed on the badge
  const otherCategories = (news.categories || []).filter(cat => cat !== displayCategory);
  const otherServices = (news.productServices || []).filter(svc => svc !== displayCategory);
  const otherCore = (news.coreElements || []).filter(core => core !== displayCategory);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300 h-auto flex flex-col">
      {/* Conditional Image Rendering: Priority 1: news.imageUrl, Priority 2: Gradient/Fallback */}
      {news.imageUrl ? (
        <div className="absolute top-0 right-0 w-full h-full">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f111a]/10 via-[#0f111a]/80 to-[#0f111a] pointer-events-none"></div>
        </div>
      ) : (
        <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50"></div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1 relative z-10">
        {/* Visual Area for Top News - Optional: We can hide this if we have a full background,
          OR keep it as a smaller thumbnail if intended.
          Given the prompt "show image", let's assume the background IS the image visualization.
          But we need the badge. */}

        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-white/5 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-transparent to-transparent opacity-60 z-10"></div>
          <img
            alt={news.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            src={news.imageUrl || image}
          />
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600/90 text-white backdrop-blur-sm shadow-[0_0_15px_rgba(19,127,236,0.5)]">
              {displayCategory}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold leading-tight text-white group-hover:text-blue-400 transition-colors">
            {news.title}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {news.summary}
          </p>

          {/* Keywords */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(news.searchKeywords || []).map(k => (
              <span key={k} className="text-blue-400 text-xs px-1">#{k.replace(/\s+/g, '')}</span>
            ))}
          </div>

          {/* Filter Tags - Remaining Categories + All Services & Core Elements */}
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {otherCategories.map(cat => (
              <span key={cat} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                {cat}
              </span>
            ))}
            {otherServices.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 text-[10px] font-medium border border-pink-500/20">
                {id}
              </span>
            ))}
            {otherCore.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                {id}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-1">
          <div className="flex items-center gap-4 text-xs font-medium text-white/40">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]"></span>
              {news.publishedDate}
            </span>
            <button onClick={() => onToggleLike && onToggleLike(news)} className={`flex items-center gap-1 p-1 rounded-full hover:bg-white/10 transition-colors ${isLiked ? 'text-rose-500' : 'text-white/60'}`}>
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} /> {news.likes || 0}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onShare(news)} className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={() => onSave && onSave(news)} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isSaved ? 'text-blue-500' : 'text-white/60'}`}>
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            {news.sourceUrl && (
              <a
                href={news.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-blue-600/20 hover:text-blue-400 text-white text-sm font-medium transition-colors border border-white/5 flex items-center gap-1"
              >
                더 읽기 <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        ```
      </div >
    </article >
  );
};

// 3. Simple News List Item (Text Only)
const SimpleNewsItem = ({ news, isExpanded, onToggle, onShare, onSave, isSaved, onToggleLike, isLiked, selectedInterests, selectedServices, selectedCore }) => {
  // Logic to determine which category/service/core to show on the badge (top left)
  const displayCategory =
    (news.categories || []).find(cat => selectedInterests?.includes(cat)) ||
    (news.productServices || []).find(svc => selectedServices?.includes(svc)) ||
    (news.coreElements || []).find(core => selectedCore?.includes(core)) ||
    news.categories?.[0] || 'AI News';

  const otherCategories = (news.categories || []).filter(cat => cat !== displayCategory);
  const otherServices = (news.productServices || []).filter(svc => svc !== displayCategory);
  const otherCore = (news.coreElements || []).filter(core => core !== displayCategory);

  return (
    <article
      className={`
      group flex flex-col gap-2 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300
      ${isExpanded
          ? 'bg-white/[0.08] border-blue-500/30 shadow-lg'
          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'}
    `}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-blue-400 tracking-wide uppercase">
              {displayCategory}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span className="text-[10px] text-white/40">{news.publishedDate}</span>
          </div>
          <h3 className={`text-base font-bold text-white leading-snug transition-colors ${isExpanded ? 'text-blue-300' : 'group-hover:text-blue-400'}`}>
            {news.title}
          </h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="p-1 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '-rotate-90 text-blue-400' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 text-sm text-white/70 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="leading-relaxed mb-2">
            {news.summary}
          </p>

          {/* Keywords */}
          <div className="flex flex-wrap gap-2 mb-3 border-b border-white/5 pb-3">
            {(news.searchKeywords || []).map(k => (
              <span key={k} className="text-blue-400 text-xs px-1">#{k.replace(/\s+/g, '')}</span>
            ))}
          </div>

          {/* Filter Tags - All Categories, Services, Core Elements (Smart Display) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {otherCategories.map(cat => (
              <span key={cat} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                {cat}
              </span>
            ))}
            {otherServices.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 text-[10px] font-medium border border-pink-500/20">
                {id}
              </span>
            ))}
            {otherCore.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                {id}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(news); }} className={`flex items-center gap-1 text-xs p-1 rounded-full hover:bg-white/10 transition-colors ${isLiked ? 'text-rose-500' : 'text-white/60'}`}>
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} /> {news.likes || 0}
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); onSave && onSave(news); }} className={`p-1.5 hover:bg-white/10 rounded-full ${isSaved ? 'text-blue-500' : 'text-white/60'}`}>
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onShare(news); }} className="p-1.5 hover:bg-white/10 rounded-full text-white/60">
                <Share2 className="w-4 h-4" />
              </button>
              {news.sourceUrl && (
                <a
                  href={news.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  원문 <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};


// Filter Constants


/* -------------------------------------------------------------------------- */
/* MAIN APP                                                                   */
/* -------------------------------------------------------------------------- */

// 4. Share Modal Component
const ShareModal = ({ isOpen, onClose, news, onConfirm }) => {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !news) return null;

  const hashtags = news.searchKeywords ? news.searchKeywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ') : '';
  const shareUrl = news.sourceUrl || window.location.href;

  // Construct the full text for preview and sharing
  let fullShareText = '';
  if (message.trim()) fullShareText += `${message}\n\n`;
  fullShareText += `[${news.title}]\n\n${news.summary}\n\n${hashtags}\n\n${shareUrl}`;

  const handleShareClick = () => {
    onConfirm(message);
    setMessage('');
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            공유하기
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">

          {/* Custom Message Input */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
              나의 메시지 추가
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="이 뉴스 어때? 같이 보자!"
              className="w-full h-20 bg-black/20 text-white text-sm p-3 rounded-xl border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none resize-none placeholder:text-white/20"
            />
          </div>

          {/* Preview Card */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 relative group">
            <div className="absolute top-2 right-2 opacity-50 text-[10px] text-white/40 uppercase tracking-widest font-bold">Preview</div>
            <pre className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap font-sans">
              {fullShareText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex gap-3 flex-shrink-0">
          <button
            onClick={handleCopy}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${copied ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            {copied ? '복사됨' : '텍스트 복사'}
          </button>
          <button
            onClick={handleShareClick}
            className="flex-[1.5] py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
          >
            <Share2 className="w-4 h-4" />
            앱으로 공유
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterPage = ({
  isOpen, onClose,
  filterPeriod, setFilterPeriod,
  dateFilter, setDateFilter,
  selectedInterests, setSelectedInterests,
  selectedServices, setSelectedServices,
  selectedCore, setSelectedCore
}) => {
  if (!isOpen) return null;

  // Helpers for toggling
  const toggleSelection = (current, setter, id) => {
    if (current.includes(id)) setter(current.filter(i => i !== id));
    else setter([...current, id]);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f111a] flex items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#141724] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* 1. Sort Order */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 opacity-80">
              <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
              정렬 기준
            </h3>
            <div className="flex gap-2">
              {PERIODS.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setFilterPeriod(period.id)}
                  className={`
                    flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all border
                    ${filterPeriod === period.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}
                  `}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Date Period */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 opacity-80">
              <span className="w-1 h-3 bg-teal-500 rounded-full"></span>
              기간 설정
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateFilter(range.id)}
                  className={`
                    py-1.5 px-3 rounded-lg font-medium text-xs transition-all border text-center
                    ${dateFilter === range.id
                      ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-900/20'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}
                  `}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </section>

          {/* 3. Categories */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 opacity-80">
              <span className="w-1 h-3 bg-purple-500 rounded-full"></span>
              관심 분야
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DATA_CATEGORIES.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelection(selectedInterests, setSelectedInterests, item.id)}
                    className={`
                      flex items-center justify-center py-2 px-3 rounded-lg border transition-all text-center
                      ${isSelected
                        ? 'bg-slate-800 border-slate-500 text-white shadow-md'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'}
                    `}
                  >
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Services & Core Elements (Simplified for space if needed, keeping as is for now) */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 opacity-80">
              <span className="w-1 h-3 bg-pink-500 rounded-full"></span>
              AI 서비스
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {DATA_SERVICES.map((item) => {
                const isSelected = selectedServices.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelection(selectedServices, setSelectedServices, item.id)}
                    className={`
                      px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all
                      ${isSelected
                        ? 'bg-pink-500/10 border-pink-500/50 text-pink-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}
                    `}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. Core Elements */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 opacity-80">
              <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
              핵심 요소
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DATA_CORE.map((item) => {
                const isSelected = selectedCore.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelection(selectedCore, setSelectedCore, item.id)}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg border transition-all
                      ${isSelected
                        ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}
                    `}
                  >
                    <span className="text-xs font-medium">{item.label}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#141724]">
          <button
            onClick={onClose}
            className="w-full shadow-lg shadow-blue-900/20 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            설정 완료
          </button>
        </div>

      </div>
    </div>
  );
};



const App = () => {
  const [step, setStep] = useState(0); // Start at 0 (loading)
  const [authLoading, setAuthLoading] = useState(true); // Splash screen state
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCore, setSelectedCore] = useState([]);
  const [expandedNewsId, setExpandedNewsId] = useState(null);
  const [currentTopIndex, setCurrentTopIndex] = useState(0);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // New Auth Modal State
  const [showLoginToast, setShowLoginToast] = useState(false); // Login Toast State
  const [showSignupToast, setShowSignupToast] = useState(false); // Signup Toast State
  const [showLogoutToast, setShowLogoutToast] = useState(false); // Logout Toast State

  const isSigningUp = useRef(false); // Track if user is signing up

  // Auth State
  const [user, setUser] = useState(null);

  const [savedNewsIds, setSavedNewsIds] = useState(new Set()); // For quick lookup
  const [savedNewsItems, setSavedNewsItems] = useState([]); // For display
  const [likedNewsIds, setLikedNewsIds] = useState(new Set()); // NEW: Like State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'saved', 'profile', 'youtube', 'discord'

  // NEW: Separate state for saved preferences (from DB) vs temporary filters
  const [savedPreferences, setSavedPreferences] = useState({ categories: [], productServices: [], coreElements: [] });
  const hasInitializedFilters = useRef(false); // To prevent re-initializing on every subscription update

  // Track initialization to distinguish between app load and manual login
  const isFirstCheck = useRef(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // 1. Initial App Load (Auto-login check)
      if (isFirstCheck.current) {
        if (currentUser && !currentUser.isAnonymous) {
          console.log('✅ Auto-login: Redirecting to news feed');
          setStep(5);
        } else {
          console.log('🔒 Auto-login failed: Showing login page');
          setStep(0);
        }
        isFirstCheck.current = false;
        setAuthLoading(false);
        return;
      }

      // 2. Subsequent Auth Changes (Manual Login/Logout/Signup)
      if (currentUser && !currentUser.isAnonymous) {
        // User just authenticated
        if (isSigningUp.current) {
          console.log('🎉 Signup Success: Showing welcome toast then redirecting...');
          setShowSignupToast(true);
          setTimeout(() => {
            setShowSignupToast(false);
            setStep(5);
            isSigningUp.current = false; // Reset
          }, 2000);
        } else {
          console.log('✅ Manual Login: Retrieving user data and showing toast...');
          setShowLoginToast(true);
          setStep(5); // Immediate redirect to feed to prevent login form flash
          setTimeout(() => {
            setShowLoginToast(false);
          }, 2000);
        }
      } else {
        // User logged out
        setStep(0);
      }
    });

    let unsubscribeUserData = () => { };

    // Set up data subscription if user is logged in
    // Note: We access the current 'user' state variable effectively via the listener's 'currentUser' 
    // but for the subscription we need to react to state changes if we keep this here.
    // However, mixing the auth listener (run once) and data listener (depends on user) in one effect is tricky.
    // Ideally, we split them. But for minimal disruption, we'll keep the auth listener here and move data sub to a separate effect.

    return () => {
      unsubscribeAuth();
    };
  }, []); // Run ONCE on mount

  // Separate effect for User Data Subscription & Safety Redirect
  useEffect(() => {
    if (user && !user.isAnonymous) {
      // Safety Redirect: If user is logged in but stuck on Login Page (0) or Auth Gate (4.5), go to Feed (5)
      if (step === 0 || step === 4.5) {
        console.log("⚠️ State Mismatch detected: User logged in but on Step 0/4.5. Forcing redirect to Feed.");
        setStep(5);
      }

      const unsubscribeUserData = subscribeToUserData(user.uid, ({ likes, bookmarks, preferences }) => {
        setLikedNewsIds(new Set(likes));
        setSavedNewsItems(bookmarks);
        setSavedNewsIds(new Set(bookmarks.map(b => b.id)));

        if (preferences) {
          setSavedPreferences({
            categories: migrateIds(preferences.categories || [], CATEGORY_ID_MAP),
            productServices: migrateIds(preferences.productServices || [], SERVICE_ID_MAP),
            coreElements: migrateIds(preferences.coreElements || [], CORE_ID_MAP)
          });

          if (!hasInitializedFilters.current) {
            hasInitializedFilters.current = true;
            if (preferences.categories) setSelectedInterests(migrateIds(preferences.categories, CATEGORY_ID_MAP));
            if (preferences.productServices) setSelectedServices(migrateIds(preferences.productServices, SERVICE_ID_MAP));
            if (preferences.coreElements) setSelectedCore(migrateIds(preferences.coreElements, CORE_ID_MAP));
          }
        }
      });
      return () => unsubscribeUserData();
    } else {
      setSavedNewsItems([]);
      setSavedNewsIds(new Set());
      setLikedNewsIds(new Set());
    }
  }, [user, step]); // Added step to dependencies

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // Added explicit navigation for debugging if needed, but the effect usually handles it.
      // setStep(5); 
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    setShowLogoutToast(true);
    // Delay actual logout to let user see the toast
    setTimeout(async () => {
      try {
        await logout();
        setShowLogoutToast(false);
        setIsAuthModalOpen(true);
      } catch (error) {
        console.error("Logout failed", error);
      }
    }, 1500);
  };

  const [filterPeriod, setFilterPeriod] = useState('important'); // Default: Important
  const [dateFilter, setDateFilter] = useState('last_week'); // NEW: Date Filter (Default: Last Week)
  const [currentNews, setCurrentNews] = useState([]);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false); // NEW: For PreferencesPage modal

  const handleToggleSave = async (newsItem) => {
    if (!user || user.isAnonymous) {
      // Trigger Auth Modal if not logged in
      setIsAuthModalOpen(true);
      return;
    }

    try {
      if (savedNewsIds.has(newsItem.id)) {
        await removeBookmark(user.uid, newsItem.id);
      } else {
        await saveBookmark(user.uid, newsItem);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
    }
  };

  const handleToggleLike = async (newsItem) => {
    if (!user || user.isAnonymous) {
      setIsAuthModalOpen(true);
      return;
    }
    const isLiked = likedNewsIds.has(newsItem.id);

    // 1. Optimistic UI Update (Immediate)
    // Update 'likedNewsIds' Set
    const newLikedIds = new Set(likedNewsIds);
    if (isLiked) newLikedIds.delete(newsItem.id);
    else newLikedIds.add(newsItem.id);
    setLikedNewsIds(newLikedIds);

    // Update 'currentNews' (Global Count)
    setCurrentNews(prev => prev.map(item => {
      if (item.id === newsItem.id) {
        return { ...item, likes: isLiked ? Math.max(0, item.likes - 1) : item.likes + 1 };
      }
      return item;
    }));

    // 2. Server Update (Background)
    try {
      await toggleLike(user.uid, newsItem, isLiked);
    } catch (error) {
      console.error("Failed to toggle like", error);
      // Revert on error (optional, but good practice)
      // For MVP, we'll assume success or just log error.
      // Ideally, we would revert state here.
    }
  };

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check for initialization
  const isInitialized = useRef(false);

  useEffect(() => {
    // Fetch News Data from Firestore
    const fetchNews = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const docId = `${year}-${month}`;

      try {
        console.log(`Fetching news for ${docId}...`);
        const docRef = doc(db, 'news_data', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.news && Array.isArray(data.news)) {
            setCurrentNews(data.news);
            console.log(`Loaded ${data.news.length} news items from Firestore.`);
          } else {
            console.warn("Firestore document exists but 'news' array is missing/invalid.");
          }
        } else {
          console.warn(`No news data found for ${docId}.`);
        }
      } catch (error) {
        console.error("Error fetching news from Firestore:", error);
      }
    };

    fetchNews();

    // Prevent double invocation in Strict Mode
    if (!isInitialized.current) {
      logUserAccess();
      isInitialized.current = true;
    }
  }, []);

  // NEW: Save Preferences Trigger (on onboarding completion ONLY)
  // Uses a ref to ensure we only save once when transitioning from onboarding to feed
  const hasOnboardingSaved = useRef(false);
  useEffect(() => {
    // Only save once when: just logged in + completing onboarding (step becomes 5) + not already saved
    if (user && !user.isAnonymous && step === 5 && selectedInterests.length > 0 && !hasOnboardingSaved.current) {
      hasOnboardingSaved.current = true; // Mark as saved to prevent re-saving on filter changes
      saveUserPreferences(user.uid, {
        categories: selectedInterests,
        productServices: selectedServices,
        coreElements: selectedCore
      });
      console.log('✅ Onboarding preferences saved (one-time)');
    }
    // Reset flag if user logs out or goes back to onboarding
    if (!user || step < 5) {
      hasOnboardingSaved.current = false;
    }
  }, [user, step]); // IMPORTANT: Only depend on user and step, NOT on preferences

  const handleToggleInterest = (current, isSelected, id) => {
    if (isSelected) setSelectedInterests(current.filter(i => i !== id));
    else setSelectedInterests([...current, id]);
  };
  const handleToggleService = (current, isSelected, id) => {
    if (isSelected) setSelectedServices(current.filter(i => i !== id));
    else setSelectedServices([...current, id]);
  };
  const handleToggleCore = (current, isSelected, id) => {
    if (isSelected) setSelectedCore(current.filter(i => i !== id));
    else setSelectedCore([...current, id]);
  };

  const getFilteredNews = () => {
    let filtered = [...currentNews];

    // 1. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(query) ||
        news.summary.toLowerCase().includes(query) ||
        (news.searchKeywords && news.searchKeywords.some(k => k.toLowerCase().includes(query)))
      );
    }

    // 2. Date Filter Logic
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date();
      // Reset time to start of day for accurate comparison
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(news => {
        if (!news.publishedDate) return false;
        // Assuming publishedDate is "YYYY-MM-DD"
        const newsDate = new Date(news.publishedDate);
        newsDate.setHours(0, 0, 0, 0);

        const diffTime = today - newsDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            return diffDays === 0;
          case 'yesterday':
            return diffDays === 1;
          case 'this_week': {
            const day = today.getDay(); // 0 (Sun) - 6 (Sat)
            const diffToMonday = day === 0 ? 6 : day - 1;
            const thisMonday = new Date(today);
            thisMonday.setDate(today.getDate() - diffToMonday);
            return newsDate >= thisMonday;
          }
          case 'last_week': {
            const day = today.getDay();
            const diffToMonday = day === 0 ? 6 : day - 1;
            const thisMonday = new Date(today);
            thisMonday.setDate(today.getDate() - diffToMonday);
            const lastMonday = new Date(thisMonday);
            lastMonday.setDate(thisMonday.getDate() - 7);
            return newsDate >= lastMonday && newsDate < thisMonday;
          }
          case 'this_month':
            return newsDate.getMonth() === today.getMonth() && newsDate.getFullYear() === today.getFullYear();
          case 'last_month': {
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            return newsDate.getMonth() === lastMonth.getMonth() && newsDate.getFullYear() === lastMonth.getFullYear();
          }
          default:
            return true;
        }
      });
    }

    // 3. Sort logic 
    if (filterPeriod === 'latest') {
      filtered.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
    } else if (filterPeriod === 'popular') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (filterPeriod === 'important') {
      filtered.sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
    }

    // 4. Filter by selected categories, services, and core elements
    // Only filter if user has made selections (if no selections, show all)
    // 4. Filter by selected categories, services, and core elements (OR logic)
    // Only filter if at least one filter group is active
    const hasInterests = selectedInterests.length > 0;
    const hasServices = selectedServices.length > 0;
    const hasCore = selectedCore.length > 0;

    if (hasInterests || hasServices || hasCore) {
      filtered = filtered.filter(news => {
        const matchInterests = hasInterests && news.categories && news.categories.some(cat => selectedInterests.includes(cat));
        const matchServices = hasServices && news.productServices && news.productServices.some(svc => selectedServices.includes(svc));
        const matchCore = hasCore && news.coreElements && news.coreElements.some(core => selectedCore.includes(core));

        return matchInterests || matchServices || matchCore;
      });
    }

    return filtered;
  };

  // Share State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareNewsItem, setShareNewsItem] = useState(null);

  const handleShare = (news) => {
    setShareNewsItem(news);
    setIsShareModalOpen(true);
  };

  const executeShare = async (customMessage) => {
    if (!shareNewsItem) return;

    const hashtags = shareNewsItem.searchKeywords ? shareNewsItem.searchKeywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ') : '';
    const shareUrl = shareNewsItem.sourceUrl || window.location.href;

    // Fully constructed text again just to be sure for the navigator share
    let shareFullText = '';
    if (customMessage && customMessage.trim()) {
      shareFullText += `${customMessage}\n\n`;
    }
    shareFullText += `[${shareNewsItem.title}]\n\n${shareNewsItem.summary}\n\n${hashtags}\n\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareNewsItem.title,
          text: shareFullText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback if share not supported (though copy button covers this)
      alert('공유하기 창이 닫혔습니다.');
    }
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  // 0. Splash Screen (Loading)
  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f111a] flex flex-col items-center justify-center p-6">
        <div className="mb-4 relative inline-block">
          <img src="/logo.png" alt="AI 1분 트렌드" className="w-24 h-24 object-contain animate-pulse" />
        </div>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 0. Login Page (for logged-out users)
  if (step === 0) {
    // If login success toast is active, show ONLY the toast on a background
    return (
      <>
        <AuthPage
          onAuthSuccess={() => { }} // Logic handled by onAuthStateChanged listener
          onSignupClick={() => setStep(1)} // Go to onboarding for new users
          onSignupStart={() => isSigningUp.current = true}
        />
      </>
    );
  }

  // 1. Onboarding Steps
  if (step === 1) {
    return (
      <div className="min-h-[100dvh] bg-[#0f111a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] opacity-30"></div>

        <div className="text-center max-w-lg z-10 flex flex-col items-center justify-center h-full">
          <div className="mb-4 relative inline-block">
            <img src="/logo.png" alt="AI 1분 트렌드" className="w-32 h-32 object-contain relative z-10" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span> 1분 트렌드
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
            매일 쏟아지는 AI 뉴스,<br />
            <span className="text-white font-bold">핵심만 골라 1분 안에</span> 파악하세요.
          </p>

          <button
            onClick={() => setStep(2)}
            className="group relative px-8 py-5 bg-gradient-to-r from-[#231F55] to-[#070F27] border border-blue-500/30 rounded-2xl w-full max-w-sm shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
            <div className="flex items-center justify-center gap-3 relative z-10">
              <span className="text-lg font-bold text-white group-hover:tracking-wider transition-all">트렌드 확인하기</span>
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <p className="absolute bottom-8 text-slate-600 text-xs text-center">
          AI Trend Daily Digest &copy; 2025
        </p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <SelectionStep
        title="관심 분야 선택"
        subtitle="가장 관심 있는 주제를 1개 이상 선택해주세요."
        items={DATA_CATEGORIES}
        selectedIds={selectedInterests}
        onToggle={(curr, isSel, id) => handleToggleInterest(curr, isSel, id)}
        onNext={() => setStep(3)}
      />
    );
  }

  if (step === 3) {
    return (
      <SelectionStep
        title="AI 서비스 선택"
        subtitle="어떤 AI 서비스를 주로 사용하시나요?"
        items={DATA_SERVICES}
        selectedIds={selectedServices}
        onToggle={(curr, isSel, id) => handleToggleService(curr, isSel, id)}
        onNext={() => setStep(4)}
        onPrev={() => setStep(2)}
        onSkip={() => setStep(4)}
      />
    );
  }

  if (step === 4) {
    return (
      <SelectionStep
        title="핵심 요소 선택"
        subtitle="더 깊이 알고 싶은 기술 요소가 있나요?"
        items={DATA_CORE}
        selectedIds={selectedCore}
        onToggle={(curr, isSel, id) => handleToggleCore(curr, isSel, id)}
        onNext={() => user ? setStep(5) : setStep(4.5)}
        nextLabel="뉴스 피드 보기"
        onPrev={() => setStep(3)}
        onSkip={() => user ? setStep(5) : setStep(4.5)}
      />
    );
  }

  // 4.5 Onboarding Auth Gate
  if (step === 4.5) {
    return (
      <>
        <OnboardingAuth
          setStep={setStep}
          onSignupStart={() => isSigningUp.current = true}
        />
      </>
    );
  }


  // 5. News Feed (Redesigned)
  // 5. News Feed
  const filteredNews = getFilteredNews();
  const displayNews = activeTab === 'saved' ? savedNewsItems : filteredNews;
  const topNews = displayNews.slice(0, 5);
  const otherNews = displayNews.slice(5);

  const handleNextTop = () => {
    setCurrentTopIndex((prev) => (prev + 1) % topNews.length);
  };

  const handlePrevTop = () => {
    setCurrentTopIndex((prev) => (prev - 1 + topNews.length) % topNews.length);
  };

  return (
    <div className="min-h-screen bg-[#101922] text-white font-sans selection:bg-blue-500/30">
      <GlobalStyles />

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-600/10 rounded-full blur-[100px] opacity-20"></div>
      </div>

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-[#0d1117]/95 backdrop-blur-xl border-r border-white/5 z-40 flex-col sidebar">
        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="App Logo" className="w-12 h-12 rounded-xl object-contain shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
              <h1 className="text-[20px] font-bold tracking-tight">
                <span className="gradient-text">AI</span> 1분 트렌드
              </h1>
            </div>
            <p className="text-[14px] text-white/40 pl-1">AI 트렌드를 1분 안에</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1 sidebar-scrollbar overflow-y-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === 'home'
              ? 'bg-blue-500/15 text-blue-400 sidebar-active-indicator'
              : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">홈</span>
          </button>

          <button
            onClick={() => {
              if (user?.isAnonymous) setIsAuthModalOpen(true);
              else setActiveTab('saved');
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === 'saved'
              ? 'bg-blue-500/15 text-blue-400 sidebar-active-indicator'
              : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">저장됨</span>
            {savedNewsItems.length > 0 && (
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                {savedNewsItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === 'profile'
              ? 'bg-blue-500/15 text-blue-400 sidebar-active-indicator'
              : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">마이페이지</span>
          </button>

          <div className="!mt-6 pt-4">
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-white/60 hover:text-[#FF0000] hover:bg-white/5 transition-all"
            >
              <YoutubeIcon className="w-5 h-5" />
              <span className="font-medium">YouTube</span>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-white/60 hover:text-[#5865F2] hover:bg-white/5 transition-all"
            >
              <DiscordIcon className="w-8 h-8 -ml-1.5" />
              <span className="font-medium -ml-1.5">Discord</span>
            </a>
          </div>
        </nav>

        {/* Sidebar Footer - User Info */}
        {user && !user.isAnonymous && (
          <div className="p-4">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 group transition-colors hover:bg-white/10">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.displayName || '사용자'}</p>
                <p className="text-[10px] text-white/40 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area - Offset for sidebar on desktop */}
      <div className="relative z-10 flex flex-col min-h-screen w-full lg:pl-64 pb-20 lg:pb-0">

        {/* Header - Mobile only, hidden on desktop */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#101922]/85 shadow-lg shadow-black/20">
          {/* Mobile header */}
          <div className="flex lg:hidden items-center justify-between max-w-7xl mx-auto w-full px-4 py-3 h-[60px]">

            {isSearchOpen ? (
              /* Search Mode Header */
              <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="뉴스 검색 (제목, 요약, 키워드)"
                    className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none resize-none placeholder:text-white/30 transition-all"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white/50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="p-2 text-sm font-medium text-white/70 hover:text-white whitespace-nowrap"
                >
                  취소
                </button>
              </div>
            ) : (
              /* Normal Header */
              <>
                {/* Logo - Hidden on desktop (shown in sidebar) */}
                <div className="flex items-center gap-3 lg:hidden">
                  <img src="/logo.png" alt="App Logo" className="w-11 h-11 rounded-xl object-contain shadow-[0_0_15px_rgba(19,127,236,0.2)]" />
                  <h1 className="text-lg font-bold tracking-tight text-white/95">AI 1분 트렌드</h1>
                </div>

                {/* Desktop: Only show minimal header - search moved to filter bar */}
                <div className="hidden lg:block"></div>

                <div className="flex items-center gap-2">
                  {/* Search Button - Mobile only */}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className={`lg:hidden flex items-center justify-center w-9 h-9 rounded-full transition-colors border border-white/5 ${searchQuery ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-white/5 hover:bg-white/10 text-white/80'}`}
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Profile Image (if logged in) - Mobile only */}
                  {user && !user.isAnonymous && user.photoURL && (
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shadow-lg relative ml-2 lg:hidden"
                    >
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>



          {/* Desktop: Two-Row Header Layout */}
          <div className="hidden lg:flex flex-col px-8 py-4 w-full max-w-7xl mx-auto gap-4">
            {/* Row 1: Personalized Greeting (Left) + Search Bar (Right) */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center text-xl text-white/90 font-semibold whitespace-nowrap">
                <Sparkles className="w-5 h-5 text-blue-400 mr-2" />
                {user && !user.isAnonymous
                  ? <><span className="text-blue-400 font-bold">{user.displayName || '사용자'}</span>님을 위한 뉴스 브리핑</>
                  : '당신을 위한 뉴스 브리핑'
                }
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="뉴스 검색 (제목, 요약, 키워드)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:bg-white/10 placeholder:text-white/30 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Sort Buttons (Left) + Filter Button (Right) */}
            <div className="flex items-center justify-between mt-2">
              {/* Sort Buttons - Joined Style (Excel-like) */}
              <div className="flex items-center isolate">
                <button
                  onClick={() => setFilterPeriod('latest')}
                  className={`relative px-4 py-1.5 rounded-l-md rounded-r-none text-sm font-medium whitespace-nowrap transition-all border ${filterPeriod === 'latest' ? 'z-10 bg-slate-700 text-white border-slate-600' : 'bg-transparent text-white/50 border-white/20 hover:text-white/80 hover:border-white/40 hover:z-10'}`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setFilterPeriod('popular')}
                  className={`relative px-4 py-1.5 rounded-none -ml-px text-sm font-medium whitespace-nowrap transition-all border ${filterPeriod === 'popular' ? 'z-10 bg-slate-700 text-white border-slate-600' : 'bg-transparent text-white/50 border-white/20 hover:text-white/80 hover:border-white/40 hover:z-10'}`}
                >
                  인기순
                </button>
                <button
                  onClick={() => setFilterPeriod('important')}
                  className={`relative px-4 py-1.5 rounded-r-md rounded-l-none -ml-px text-sm font-medium whitespace-nowrap transition-all border ${filterPeriod === 'important' ? 'z-10 bg-slate-700 text-white border-slate-600' : 'bg-transparent text-white/50 border-white/20 hover:text-white/80 hover:border-white/40 hover:z-10'}`}
                >
                  중요도순
                </button>
              </div>

              {/* Filter Button - Image Style */}
              <button
                onClick={() => setFilterModalOpen(true)}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-transparent hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors border border-white/20 hover:border-white/40"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">필터</span>
              </button>
            </div>
          </div>

          {/* Mobile: Original Filter Bar */}
          <div className="lg:hidden px-4 pb-3 pt-0 w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center isolate overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterPeriod('latest')}
                className={`relative px-4 py-1.5 rounded-l-xl rounded-r-none text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all border ${filterPeriod === 'latest' ? 'z-10 bg-blue-600/90 text-white border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:z-10'}`}
              >
                최신순
              </button>
              <button
                onClick={() => setFilterPeriod('popular')}
                className={`relative px-4 py-1.5 rounded-none -ml-px text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all border ${filterPeriod === 'popular' ? 'z-10 bg-blue-600/90 text-white border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:z-10'}`}
              >
                인기순
              </button>
              <button
                onClick={() => setFilterPeriod('important')}
                className={`relative px-4 py-1.5 rounded-r-xl rounded-l-none -ml-px text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all border ${filterPeriod === 'important' ? 'z-10 bg-blue-600/90 text-white border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:z-10'}`}
              >
                중요도순
              </button>
            </div>
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            <button
              onClick={() => setFilterModalOpen(true)}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 transition-colors backdrop-blur-md"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pt-4 lg:pt-6">

          {/* Conditional Rendering: Search Mode vs Main Feed */}
          {searchQuery ? (
            /* --- SEARCH RESULTS VIEW --- */
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                  "{searchQuery}" 검색 결과 ({filteredNews.length})
                </h2>
                {/* Clear Search Button (Optional, can rely on Header Cancel) */}
              </div>

              {filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {filteredNews.map((news, index) => (
                    <div key={news.id} className="news-card-hover page-transition" style={{ animationDelay: `${index * 0.05}s` }}>
                      <SimpleNewsItem
                        news={news}
                        isExpanded={expandedNewsId === news.id}
                        onToggle={() => setExpandedNewsId(expandedNewsId === news.id ? null : news.id)}
                        onShare={handleShare}
                        onSave={handleToggleSave}
                        isSaved={savedNewsIds.has(news.id)}
                        isLiked={likedNewsIds.has(news.id)}
                        onToggleLike={handleToggleLike}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                  <Search className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/60 text-lg">검색 결과가 없습니다.</p>
                  <p className="text-white/40 text-sm mt-1">다른 키워드로 검색해보세요.</p>
                </div>
              )}
            </section>
          ) : activeTab === 'profile' ? (
            /* --- PROFILE VIEW --- */
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 py-4 lg:py-8">
              <div className="relative bg-white/5 rounded-2xl p-6 lg:p-8 border border-white/10 flex flex-col items-start text-left max-w-2xl mx-auto lg:max-w-3xl">
                {/* Close Button */}
                <button
                  onClick={() => setActiveTab('home')}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Profile Header - Centered */}
                <div className="w-full flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] mb-4 shadow-lg shadow-blue-500/20">
                    <div className="w-full h-full rounded-full bg-[#101922] flex items-center justify-center overflow-hidden">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-white/80" />
                      )}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-1">
                    {(!user || user.isAnonymous) ? '익명 사용자' : (user.displayName || '사용자')}
                  </h2>
                  <p className="text-white/50 text-sm">
                    {(!user || user.isAnonymous) ? '로그인하고 모든 기능을 이용해보세요' : (user.email || '이메일 정보 없음')}
                  </p>
                </div>

                {/* NEW: Show Current Preferences Summary (from DB, not temp filters) */}
                {user && !user.isAnonymous && (savedPreferences.categories.length > 0 || savedPreferences.productServices.length > 0 || savedPreferences.coreElements.length > 0) && (
                  <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 space-y-3">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 내 기본 설정
                    </h3>

                    {/* Categories */}
                    {savedPreferences.categories.length > 0 && (
                      <div>
                        <span className="text-[10px] text-white/40 mb-1 block">관심 분야</span>
                        <div className="flex flex-wrap gap-1">
                          {savedPreferences.categories.slice(0, 3).map(id => {
                            const label = DATA_CATEGORIES.find(c => c.id === id)?.label;
                            return label ? <span key={id} className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300">{label}</span> : null;
                          })}
                          {(savedPreferences.categories.length > 3) && <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300">+{savedPreferences.categories.length - 3}</span>}
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    {savedPreferences.productServices.length > 0 && (
                      <div>
                        <span className="text-[10px] text-white/40 mb-1 block">AI 서비스</span>
                        <div className="flex flex-wrap gap-1">
                          {savedPreferences.productServices.slice(0, 3).map(id => {
                            const label = DATA_SERVICES.find(c => c.id === id)?.label;
                            return label ? <span key={id} className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-300">{label}</span> : null;
                          })}
                          {(savedPreferences.productServices.length > 3) && <span className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-300">+{savedPreferences.productServices.length - 3}</span>}
                        </div>
                      </div>
                    )}

                    {/* Core Elements */}
                    {savedPreferences.coreElements.length > 0 && (
                      <div>
                        <span className="text-[10px] text-white/40 mb-1 block">핵심 요소</span>
                        <div className="flex flex-wrap gap-1">
                          {savedPreferences.coreElements.slice(0, 3).map(id => {
                            const label = DATA_CORE.find(c => c.id === id)?.label;
                            return label ? <span key={id} className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">{label}</span> : null;
                          })}
                          {(savedPreferences.coreElements.length > 3) && <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">+{savedPreferences.coreElements.length - 3}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 w-full">
                  {/* NEW: Edit Preferences Button */}
                  {user && !user.isAnonymous && (
                    <button
                      onClick={() => setPreferencesModalOpen(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white border border-blue-500/20 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <Compass className="w-5 h-5" />
                      관심사 설정 변경
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (!user || user.isAnonymous) {
                        setIsAuthModalOpen(true);
                      } else {
                        handleLogout();
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    {(!user || user.isAnonymous) ? '계정 생성 / 로그인' : '로그아웃'}
                  </button>
                </div>
              </div>
            </section>
          ) : activeTab === 'saved' ? (
            /* --- SAVED NEWS VIEW --- */
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-6 px-1">
                <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                  <Bookmark className="w-5 h-5 text-blue-400 fill-blue-400" />
                  저장된 뉴스 ({savedNewsItems.length})
                </h2>
              </div>

              {savedNewsItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {savedNewsItems.map((news, index) => (
                    <div key={news.id} className="news-card-hover page-transition" style={{ animationDelay: `${index * 0.05}s` }}>
                      <SimpleNewsItem
                        news={news}
                        isExpanded={expandedNewsId === news.id}
                        onToggle={() => setExpandedNewsId(expandedNewsId === news.id ? null : news.id)}
                        onShare={handleShare}
                        onSave={handleToggleSave}
                        isSaved={true}
                        isLiked={likedNewsIds.has(news.id)}
                        onToggleLike={handleToggleLike}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                  <Bookmark className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/60 text-lg">저장된 뉴스가 없습니다.</p>
                  <p className="text-white/40 text-sm mt-1">마음에 드는 뉴스를 저장해보세요.</p>
                </div>
              )}
            </section>
          ) : (
            /* --- MAIN FEED --- */
            <>
              {/* Section: Today's Top 5 */}
              <section className="mb-8 relative">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2 whitespace-nowrap">
                    <span className="w-1.5 h-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                    {(() => {
                      const prefix = {
                        today: '오늘의',
                        yesterday: '어제의',
                        this_week: '이번주의',
                        last_week: '지난주의',
                        this_month: '이번달의',
                        last_month: '지난달의',
                        all: '전체 기간의'
                      }[dateFilter] || '오늘의';

                      const type = filterPeriod === 'latest' ? '최신' :
                        filterPeriod === 'popular' ? '인기' :
                          '중요';

                      return `${prefix} ${type} 뉴스 Top 5`;
                    })()}
                  </h2>
                  {/* Mobile carousel controls */}
                  <div className="flex lg:hidden items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="text-xs font-bold text-white shadow-black drop-shadow-md uppercase tracking-wider mr-1">
                      <span className="text-blue-400 text-sm">{currentTopIndex + 1}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-400">{topNews.length}</span>
                    </span>
                    <button onClick={handlePrevTop} className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 hover:text-white transition-all border border-blue-500/30">
                      <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <button onClick={handleNextTop} className="p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 hover:text-white transition-all border border-blue-500/30">
                      <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Desktop: Center-focused carousel with peek effect */}
                {topNews.length > 0 && (
                  <>
                    {/* Desktop Carousel - 3 visible, center focused */}
                    <div className="hidden lg:block relative">
                      {/* Left Arrow */}
                      <button
                        onClick={handlePrevTop}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 shadow-2xl transition-all hover:scale-110"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      {/* Carousel Container */}
                      <div className="flex items-center justify-center gap-4 px-16 overflow-hidden">
                        {/* Left Peek Card */}
                        <div
                          className="flex-shrink-0 w-[310px] opacity-50 scale-90 blur-[1px] transition-all duration-500 cursor-pointer hover:opacity-70"
                          onClick={handlePrevTop}
                        >
                          {(() => {
                            const prevIndex = (currentTopIndex - 1 + topNews.length) % topNews.length;
                            const news = topNews[prevIndex];
                            return (
                              <article className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 shadow-xl h-[380px] flex flex-col">
                                {/* Image 60% (Increased another 5%) */}
                                <div className="relative h-[60%] overflow-hidden">
                                  <img
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                    src={news.imageUrl || SAMPLE_IMAGES[(prevIndex + (new Date().getDate() * 5)) % SAMPLE_IMAGES.length]}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#101922]/80"></div>
                                  <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/90 text-white">
                                      {news.categories?.[0] || 'AI News'}
                                    </span>
                                  </div>
                                </div>
                                {/* Content 45% */}
                                <div className="flex-1 p-4 flex flex-col gap-2">
                                  <h3 className="text-base font-bold text-white line-clamp-2">{news.title}</h3>
                                  <p className="text-xs text-white/50 line-clamp-3">{news.summary}</p>
                                </div>
                                {/* Actions 10% */}
                                <div className="h-[10%] px-4 pb-3 flex items-center justify-between border-t border-white/5">
                                  <span className="text-xs text-white/40">{news.publishedDate}</span>
                                </div>
                              </article>
                            );
                          })()}
                        </div>

                        {/* Center Card - Full Focus */}
                        <div className="flex-shrink-0 w-[430px] scale-100 transition-all duration-500 z-10">
                          {(() => {
                            const news = topNews[currentTopIndex];
                            return (
                              <article className="group relative overflow-hidden rounded-2xl bg-white/[0.05] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] h-auto min-h-[390px] flex flex-col transition-all duration-300 hover:shadow-[0_0_60px_rgba(59,130,246,0.25)]">
                                {/* Image Fixed Height (Increased another 5%) */}
                                <div className="relative h-[205px] overflow-hidden">
                                  <img
                                    alt={news.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    src={news.imageUrl || SAMPLE_IMAGES[(currentTopIndex + (new Date().getDate() * 5)) % SAMPLE_IMAGES.length]}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#101922]"></div>
                                  <div className="absolute top-3 left-3">
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                                      {(news.categories || []).find(cat => selectedInterests.includes(cat)) ||
                                        (news.productServices || []).find(svc => selectedServices.includes(svc)) ||
                                        (news.coreElements || []).find(core => selectedCore.includes(core)) ||
                                        news.categories?.[0] || 'AI News'}
                                    </span>
                                  </div>
                                </div>

                                {/* Content Auto Height */}
                                <div className="flex-1 p-5 flex flex-col gap-3">
                                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                                    {news.title}
                                  </h3>
                                  <p className="text-sm text-white/60 leading-relaxed">
                                    {news.summary}
                                  </p>
                                  {/* Keywords */}
                                  <div className="flex flex-wrap gap-1.5 mt-auto">
                                    {(news.searchKeywords || []).slice(0, 4).map(k => (
                                      <span key={k} className="text-blue-400 text-xs">#{k.replace(/\s+/g, '')}</span>
                                    ))}
                                  </div>
                                  {/* Tags - All Categories, Services, Core Elements (Smart Display) */}
                                  <div className="flex flex-wrap gap-1.5">
                                    {(news.categories || []).filter(c => c !== ((news.categories || []).find(cat => selectedInterests.includes(cat)) || (news.productServices || []).find(svc => selectedServices.includes(svc)) || (news.coreElements || []).find(core => selectedCore.includes(core)) || news.categories?.[0] || 'AI News')).map(cat => (
                                      <span key={cat} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                                        {cat}
                                      </span>
                                    ))}
                                    {(news.productServices || []).filter(s => s !== ((news.categories || []).find(cat => selectedInterests.includes(cat)) || (news.productServices || []).find(svc => selectedServices.includes(svc)) || (news.coreElements || []).find(core => selectedCore.includes(core)) || news.categories?.[0] || 'AI News')).map(id => (
                                      <span key={id} className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 text-[10px] font-medium border border-pink-500/20">
                                        {id}
                                      </span>
                                    ))}
                                    {(news.coreElements || []).filter(c => c !== ((news.categories || []).find(cat => selectedInterests.includes(cat)) || (news.productServices || []).find(svc => selectedServices.includes(svc)) || (news.coreElements || []).find(core => selectedCore.includes(core)) || news.categories?.[0] || 'AI News')).map(id => (
                                      <span key={id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                                        {id}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Actions Fixed Height */}
                                <div className="h-[60px] px-4 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                                  <div className="flex items-center gap-3 text-xs text-white/40">
                                    <span>{news.publishedDate}</span>
                                    <button
                                      onClick={() => handleToggleLike(news)}
                                      className={`flex items-center gap-1 p-1 rounded-full hover:bg-white/10 transition-colors ${likedNewsIds.has(news.id) ? 'text-rose-500' : ''}`}
                                    >
                                      <Heart className={`w-4 h-4 ${likedNewsIds.has(news.id) ? 'fill-current' : ''}`} />
                                      <span>{news.likes || 0}</span>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleShare(news)} className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors">
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleToggleSave(news)} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${savedNewsIds.has(news.id) ? 'text-blue-500' : 'text-white/60'}`}>
                                      <Bookmark className={`w-4 h-4 ${savedNewsIds.has(news.id) ? 'fill-current' : ''}`} />
                                    </button>
                                    {news.sourceUrl && (
                                      <a
                                        href={news.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium transition-colors flex items-center gap-1"
                                      >
                                        더 읽기 <ArrowRight className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </article>
                            );
                          })()}
                        </div>

                        {/* Right Peek Card */}
                        <div
                          className="flex-shrink-0 w-[310px] opacity-50 scale-90 blur-[1px] transition-all duration-500 cursor-pointer hover:opacity-70"
                          onClick={handleNextTop}
                        >
                          {(() => {
                            const nextIndex = (currentTopIndex + 1) % topNews.length;
                            const news = topNews[nextIndex];
                            return (
                              <article className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 shadow-xl h-[380px] flex flex-col">
                                {/* Image 60% (Increased another 5%) */}
                                <div className="relative h-[60%] overflow-hidden">
                                  <img
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                    src={news.imageUrl || SAMPLE_IMAGES[(nextIndex + (new Date().getDate() * 5)) % SAMPLE_IMAGES.length]}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#101922]/80"></div>
                                  <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/90 text-white">
                                      {news.categories?.[0] || 'AI News'}
                                    </span>
                                  </div>
                                </div>
                                {/* Content 45% */}
                                <div className="flex-1 p-4 flex flex-col gap-2">
                                  <h3 className="text-base font-bold text-white line-clamp-2">{news.title}</h3>
                                  <p className="text-xs text-white/50 line-clamp-3">{news.summary}</p>
                                </div>
                                {/* Actions 10% */}
                                <div className="h-[10%] px-4 pb-3 flex items-center justify-between border-t border-white/5">
                                  <span className="text-xs text-white/40">{news.publishedDate}</span>
                                </div>
                              </article>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Right Arrow */}
                      <button
                        onClick={handleNextTop}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 shadow-2xl transition-all hover:scale-110"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>

                      {/* Carousel Indicators */}
                      <div className="flex justify-center mt-6 gap-2">
                        {topNews.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentTopIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentTopIndex
                              ? 'bg-blue-500 w-6'
                              : 'bg-white/20 hover:bg-white/40'
                              }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Mobile: Single carousel item */}
                    {topNews.length > 0 && (
                      <div className="lg:hidden relative group">
                        <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                          <button onClick={handlePrevTop} className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10 shadow-lg transition-all">
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                        </div>

                        <TopNewsCard
                          key={topNews[currentTopIndex % topNews.length].id}
                          news={topNews[currentTopIndex % topNews.length]}
                          image={SAMPLE_IMAGES[((currentTopIndex % topNews.length) + (new Date().getDate() * 5)) % SAMPLE_IMAGES.length]}
                          onShare={handleShare}
                          onSave={handleToggleSave}
                          isSaved={savedNewsIds.has(topNews[currentTopIndex % topNews.length].id)}
                          isLiked={likedNewsIds.has(topNews[currentTopIndex % topNews.length].id)}
                          onToggleLike={handleToggleLike}
                          selectedInterests={selectedInterests}
                          selectedServices={selectedServices}
                          selectedCore={selectedCore}
                        />

                        <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                          <button onClick={handleNextTop} className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10 shadow-lg transition-all">
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Mobile Indicators */}
                        <div className="flex justify-center mt-4 gap-1.5">
                          {topNews.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentTopIndex(index)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${index === (currentTopIndex % topNews.length)
                                ? 'bg-blue-500 w-4'
                                : 'bg-white/20'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Section: Latest News List */}
              <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                  <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"></span>
                    {(() => {
                      const timeRange = TIME_RANGES.find(r => r.id === dateFilter);
                      return timeRange ? `${timeRange.label} 뉴스` : '나머지 뉴스';
                    })()}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {otherNews.map((news, index) => (
                    <div key={news.id} className="news-card-hover page-transition" style={{ animationDelay: `${index * 0.05}s` }}>
                      <SimpleNewsItem
                        news={news}
                        isExpanded={expandedNewsId === news.id}
                        onToggle={() => setExpandedNewsId(expandedNewsId === news.id ? null : news.id)}
                        onShare={handleShare}
                        onSave={handleToggleSave}
                        isSaved={savedNewsIds.has(news.id)}
                        isLiked={likedNewsIds.has(news.id)}
                        onToggleLike={handleToggleLike}
                        selectedInterests={selectedInterests}
                        selectedServices={selectedServices}
                        selectedCore={selectedCore}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        {/* Bottom Nav (Floating) - Mobile only, hidden on desktop */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-auto lg:hidden">
          <nav className="flex items-center gap-1 px-2 py-2 rounded-full bg-[#101922]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all ${activeTab === 'home' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium">홈</span>
            </button>

            <button
              onClick={() => {
                if (user?.isAnonymous) {
                  setIsAuthModalOpen(true);
                } else {
                  setActiveTab('saved');
                }
              }}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all ${activeTab === 'saved' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Bookmark className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium">저장</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all ${activeTab === 'profile' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium">MY</span>
            </button>

            <a className="flex flex-col items-center justify-end pb-2 w-14 h-12 rounded-full text-white/50 hover:text-[#FF0000] hover:bg-white/5 transition-all" href="https://www.youtube.com" target="_blank" rel="noreferrer">
              <YoutubeIcon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium">Youtube</span>
            </a>
            <a className="flex flex-col items-center justify-end pb-2 w-14 h-12 rounded-full text-white/50 hover:text-[#5865F2] hover:bg-white/5 transition-all" href="https://discord.com" target="_blank" rel="noreferrer">
              <DiscordIcon className="w-8 h-8 mb-0.5 translate-y-[6px]" />
              <span className="text-[9px] font-medium">Discord</span>
            </a>
          </nav>
        </div>

      </div >

      {/* Filter Page - Temporary Filtering Only (No DB Save) */}
      <FilterPage
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        selectedInterests={selectedInterests}
        setSelectedInterests={setSelectedInterests}
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
        selectedCore={selectedCore}
        setSelectedCore={setSelectedCore}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        news={shareNewsItem}
        onConfirm={executeShare}
      />

      {/* Auth Modal */}
      <AuthPage
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onComplete={() => {
          setIsAuthModalOpen(false);
          setShowLoginToast(true);
          setTimeout(() => setShowLoginToast(false), 3000); // Hide after 3s
        }}
      />

      {/* Logout Toast */}
      {
        showLogoutToast && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="bg-[#1a1f2e]/95 backdrop-blur-xl px-10 py-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-5 animate-in zoom-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-1">
                <LogOut className="w-10 h-10 text-red-400" strokeWidth={2} />
              </div>
              <span className="text-white font-bold text-2xl">로그아웃 되었습니다</span>
            </div>
          </div>
        )
      }

      {/* NEW: Preferences Page - Permanent Settings */}
      <PreferencesPage
        isOpen={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
        onSave={(prefs) => {
          // Update saved preferences state (for PreferencesPage to reflect changes)
          setSavedPreferences(prefs);
          // Also update filter state so changes are immediately visible in news feed
          setSelectedInterests(prefs.categories);
          setSelectedServices(prefs.productServices);
          setSelectedCore(prefs.coreElements);
          // Save to Firebase
          if (user && !user.isAnonymous) {
            saveUserPreferences(user.uid, prefs);
          }
        }}
        categories={DATA_CATEGORIES}
        productServices={DATA_SERVICES}
        coreElements={DATA_CORE}
        initialCategories={savedPreferences.categories}
        initialServices={savedPreferences.productServices}
        initialCore={savedPreferences.coreElements}
      />

      {/* GLOBAL TOASTS - Rendered regardless of step */}

      {/* Login Success Toast */}
      {showLoginToast && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
          <div className="bg-[#1a1f2e]/95 backdrop-blur-xl px-10 py-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-5 animate-in zoom-in fade-in duration-300 pointer-events-auto">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
              <PartyPopper className="w-10 h-10 text-blue-400 animate-bounce" strokeWidth={2} />
            </div>
            <span className="text-white font-bold text-2xl">로그인 되었습니다!</span>
          </div>
        </div>
      )}

      {/* Signup Success Toast */}
      {showSignupToast && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
          <div className="bg-[#1a1f2e]/95 backdrop-blur-xl px-10 py-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-5 animate-in zoom-in fade-in duration-300 pointer-events-auto">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
              <Check className="w-10 h-10 text-green-400 animate-bounce" strokeWidth={3} />
            </div>
            <span className="text-white font-bold text-2xl">회원가입 성공!</span>
            <p className="text-white/60 text-sm">환영합니다! 곧 홈으로 이동합니다.</p>
          </div>
        </div>
      )}

    </div >
  );
}

export default App;