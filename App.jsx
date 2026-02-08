import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook
import {
  Search, ArrowRight, X, Filter, ChevronLeft, ChevronRight, Check,
  Linkedin, Facebook, Instagram, User, Home, Compass, Bookmark,
  Briefcase, TrendingUp, HeartPulse, Clapperboard, GraduationCap, Scale,
  Cpu, Coffee, Shield, Bot, Lightbulb, Zap,
  FileText, Image as ImageIcon, Film, Mic, Sparkles, Workflow, Layers, Code,
  Smartphone, Watch, Database, Share2, Server, ShieldCheck, MessageSquare, Heart, PartyPopper, LogOut,
  Lock, AlertCircle, Eye, EyeOff, Globe, ChevronDown, LogIn, Copy, ExternalLink, List, Mail // Added icons
} from 'lucide-react';
import logo from './assets/logo.png';
import discordIconImg from './assets/discord_icon.png';

// import MOCK_NEWS_DATA from './data/final_data_ko.json';

/* CONSTANTS                                                                  */
import {
  CATEGORIES as DATA_CATEGORIES,
  PRODUCT_SERVICES as DATA_SERVICES,
  CORE_ELEMENTS as DATA_CORE,
  PERIODS, TIME_RANGES,
  CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP, migrateIds,
  CATEGORY_ID_MAP_REV, SERVICE_ID_MAP_REV, CORE_ID_MAP_REV
} from './constants';

import OnboardingAuth from './components/auth/OnboardingAuth';
import AuthPage from './components/auth/AuthPage';
import PreferencesPage from './components/PreferencesPage'; // NEW: Dedicated preferences editor
import AdminUpload from './components/AdminUpload'; // NEW: Admin Upload Page
import { onAuthStateChanged, updateProfile } from 'firebase/auth'; // Added updateProfile
import {
  db, auth, logUserAccess, signInWithGoogle, logout, saveBookmark,
  removeBookmark,
  toggleLike,
  subscribeToUserData,
  saveUserPreferences,
  reauthenticateAndUpdatePassword, // RESTORED
  getDiceBearAvatar, // Added
  saveUserToFirestore, // Added: to sync changes
  handleGoogleRedirectResult // Added: For mobile redirect
} from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

/* -------------------------------------------------------------------------- */
/* ICONS & STYLES                                                             */
/* -------------------------------------------------------------------------- */

import { SAMPLE_IMAGES } from './constants/images';
import usFlag from './assets/us_flag.png';
import krFlag from './assets/kr_flag.png';

const DiscordIcon = ({ className }) => (
  <img
    src={discordIconImg}
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
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 w-full bg-[#0f111a] flex flex-col font-sans">
      {/* Helper for mobile browser safe areas */}
      <div className="w-full h-full flex flex-col max-w-2xl mx-auto relative">

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 w-full">
          {/* Header */}
          <div className="mb-4 md:mb-6 text-center pt-2 md:pt-4">
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
              <span className="text-white ml-2">{t('app_title')}</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              <span className="text-blue-400 font-bold">{t('selection_header_subtitle')}</span>
            </p>
          </div>

          <div className="flex items-end justify-between mb-3 px-1 sticky top-0 bg-[#0f111a]/95 backdrop-blur-md z-10 py-2 border-b border-white/5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h2>
              {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
              {t('count_selected', { count: selectedIds.length })}
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 content-visibility-auto">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onToggle(selectedIds, isSelected, item.id)}
                  className={`
                  relative group flex items-center p-2.5 rounded-xl border text-left transition-all duration-100 w-full
                  ${isSelected
                      ? 'bg-slate-800 border-slate-500 shadow-md translate-y-[-1px]'
                      : 'bg-[#1a1d2d]/80 border-slate-700 hover:bg-[#1a1d2d] hover:border-slate-500'}
                `}
                >
                  {/* Icon */}
                  <div className={`relative z-10 mr-3 transition-transform duration-100 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Icon
                      size={20}
                      className={`transition-colors duration-100 ${item.color}`}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                  </div>

                  {/* Label */}
                  <span className="flex-grow text-sm md:text-base font-semibold tracking-wide text-white">
                    {item.label}
                  </span>

                  {/* Checkbox UI */}
                  <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center transition-all duration-100 border
                  ${isSelected
                      ? `bg-gradient-to-br ${item.gradient} border-transparent text-white shadow-sm scale-100`
                      : 'bg-slate-900/50 border-slate-700 text-transparent scale-95'}
                `}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation (Static Flex Child) */}
        <div className="w-full p-4 pb-6 bg-[#0f111a] border-t border-white/5 z-20 flex-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            {onPrev && (
              <button onClick={onPrev} className="px-4 py-3 rounded-xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all">
                {t('prev')}
              </button>
            )}

            {onSkip && (
              <button onClick={onSkip} className="px-4 py-3 rounded-xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all">
                {t('skip')}
              </button>
            )}

            <button
              onClick={onNext}
              disabled={selectedIds.length === 0}
              className={`
              flex-1 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg
              ${selectedIds.length > 0
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] shadow-blue-900/20'
                  : 'bg-slate-800 text-slate-600 border border-slate-700 opacity-60'}
            `}
            >
              <span>{nextLabel || 'Next'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
};

const LanguageSelectionStep = ({ onNext, onPrev, onSkip }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0f111a] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl flex flex-col h-full max-h-[90vh]">

        {/* Header - Same as SelectionStep */}
        <div className="mb-8 md:mb-12 text-center flex-none">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">AI</span>
            <span className="text-white ml-2">{t('app_title')}</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            <span className="text-blue-400 font-bold">{t('selection_header_subtitle')}</span>
          </p>
        </div>

        <div className="flex items-end justify-between mb-6 px-1">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{t('language')}</h2>
            <p className="text-sm text-slate-400">{t('select_language_desc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <button
            onClick={() => handleLanguageSelect('en')}
            className={`
              relative group flex items-center p-4 rounded-2xl border text-left transition-all duration-300 w-full
              ${i18n.language === 'en'
                ? 'bg-slate-800 border-slate-500 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.5),0_0_12px_-2px_rgba(255,255,255,0.1)] translate-y-[-2px]'
                : 'bg-[#1a1d2d]/80 border-slate-700 hover:bg-[#1a1d2d] hover:border-slate-500 hover:shadow-lg'}
            `}
          >
            {/* Glow Effect */}
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 blur-xl rounded-full transition-opacity duration-500 ${i18n.language === 'en' ? 'opacity-25' : 'group-hover:opacity-15'}`} />

            {/* Icon */}
            <div className={`relative z-10 mr-4 transition-transform duration-300 ${i18n.language === 'en' ? 'scale-110' : 'group-hover:scale-110'}`}>
              <img src={usFlag} alt="US Flag" className="w-8 h-8 rounded-full object-cover" />
            </div>

            {/* Label */}
            <span className="flex-grow text-base md:text-lg font-semibold tracking-wide text-white">
              English
            </span>

            {/* Checkbox UI */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border
              ${i18n.language === 'en'
                ? 'bg-gradient-to-br from-blue-500 to-purple-500 border-transparent text-white shadow-lg scale-100'
                : 'bg-slate-900/50 border-slate-700 text-transparent scale-95'}
            `}>
              <Check size={14} strokeWidth={3} />
            </div>
          </button>

          <button
            onClick={() => handleLanguageSelect('ko')}
            className={`
              relative group flex items-center p-4 rounded-2xl border text-left transition-all duration-300 w-full
              ${i18n.language === 'ko'
                ? 'bg-slate-800 border-slate-500 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.5),0_0_12px_-2px_rgba(255,255,255,0.1)] translate-y-[-2px]'
                : 'bg-[#1a1d2d]/80 border-slate-700 hover:bg-[#1a1d2d] hover:border-slate-500 hover:shadow-lg'}
            `}
          >
            {/* Glow Effect */}
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-red-500 to-blue-500 opacity-0 blur-xl rounded-full transition-opacity duration-500 ${i18n.language === 'ko' ? 'opacity-25' : 'group-hover:opacity-15'}`} />

            {/* Icon */}
            <div className={`relative z-10 mr-4 transition-transform duration-300 ${i18n.language === 'ko' ? 'scale-110' : 'group-hover:scale-110'}`}>
              <img src={krFlag} alt="Korea Flag" className="w-8 h-8 rounded-full object-cover" />
            </div>

            {/* Label */}
            <span className="flex-grow text-base md:text-lg font-semibold tracking-wide text-white">
              한국어
            </span>

            {/* Checkbox UI */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border
              ${i18n.language === 'ko'
                ? 'bg-gradient-to-br from-red-500 to-blue-500 border-transparent text-white shadow-lg scale-100'
                : 'bg-slate-900/50 border-slate-700 text-transparent scale-95'}
            `}>
              <Check size={14} strokeWidth={3} />
            </div>
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 flex items-center gap-3 w-full border-t border-white/5">
          {/* Prev Button */}
          <button onClick={onPrev} className="px-6 py-4 rounded-2xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all">
            {t('prev')}
          </button>

          {/* Skip Button */}
          {onSkip && (
            <button onClick={onSkip} className="px-6 py-4 rounded-2xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all">
              {t('skip')}
            </button>
          )}

          {/* Next Button */}
          <button
            onClick={onNext}
            className={`
              flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg
              bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02] shadow-blue-900/20
            `}
          >
            <span>{t('next')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};


// Helper Component for Image Loading
const AsyncImage = ({ src, alt, className, placeholderClassName }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
  }, [src]);

  return (
    <>
      {!loaded && (
        <div className={`absolute inset-0 bg-[#0f111a] flex items-center justify-center ${placeholderClassName || ''}`}>
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      {loaded && (
        <img
          src={src}
          alt={alt}
          className={`${className} animate-in fade-in duration-500`}
        />
      )}
    </>
  );
};

// 2. Feature News Card (Top 5) with Visuals
const TopNewsCard = ({ news, index, image, onShare, onSave, isSaved, onToggleLike, isLiked, selectedInterests, selectedServices, selectedCore, onNext, onPrev, current, total }) => {
  const { t, i18n } = useTranslation();
  const [bgLoaded, setBgLoaded] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);

  useEffect(() => {
    if (news.imageUrl) {
      setBgLoaded(false);
      const img = new Image();
      img.onload = () => setBgLoaded(true);
      img.src = news.imageUrl;
    }
  }, [news.imageUrl]);

  useEffect(() => {
    const imgSrc = news.imageUrl || image;
    if (imgSrc) {
      setThumbLoaded(false);
      const img = new Image();
      img.onload = () => setThumbLoaded(true);
      img.src = imgSrc;
    }
  }, [news.imageUrl, image]);

  // Helper: Convert English tag to Korean if language is 'ko'
  const getLocalizedTag = (tag) => {
    if (i18n.language !== 'ko') return tag; // English: use as-is from Firebase
    return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
  };

  // Logic to determine which category/service/core to show on the badge (top left)
  // Priority: 1. Matching Category 2. Matching Service 3. Matching Core Element 4. Default Category
  const displayCategory =
    (news.categories || []).find(cat => selectedInterests?.includes(cat)) ||
    (news.productServices || []).find(svc => selectedServices?.includes(svc)) ||
    (news.coreElements || []).find(core => selectedCore?.includes(core)) ||
    news.categories?.[0] || t('ai_news_fallback');

  // Logic for tags: Show all categories/services/core EXCEPT the one displayed on the badge
  const otherCategories = (news.categories || []).filter(cat => cat !== displayCategory);
  const otherServices = (news.productServices || []).filter(svc => svc !== displayCategory);
  const otherCore = (news.coreElements || []).filter(core => core !== displayCategory);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300 h-auto flex flex-col">
      {/* Conditional Image Rendering: Priority 1: news.imageUrl, Priority 2: Gradient/Fallback */}
      {news.imageUrl ? (
        <div className="absolute top-0 right-0 w-full h-full bg-[#0f111a]">
          {!bgLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          {bgLoaded && (
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover group-hover:opacity-70 transition-opacity duration-500 opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f111a]/10 via-[#0f111a]/80 to-[#0f111a] pointer-events-none"></div>
        </div>
      ) : (
        <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50"></div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1 relative z-10">
        {/* Visual Area for Top News */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-white/5 flex-shrink-0 bg-[#0f111a]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-transparent to-transparent opacity-60 z-10"></div>

          {!thumbLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}

          {thumbLoaded && (
            <img
              alt={news.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700"
              src={news.imageUrl || image}
            />
          )}
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600/90 text-white backdrop-blur-sm shadow-[0_0_15px_rgba(19,127,236,0.5)]">
              {getLocalizedTag(displayCategory)}
            </span>
          </div>

          {/* Mobile Navigation & Pagination (Conditional) */}
          {current && total && (
            <div className="absolute top-3 right-3 z-20">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 text-white backdrop-blur-sm border border-white/10 shadow-lg tracking-wider">
                <span className="text-blue-400">{current}</span>
                <span className="text-white/40 mx-1">/</span>
                <span className="text-white/60">{total}</span>
              </span>
            </div>
          )}
          {onPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute top-1/2 left-2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
          {onNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute top-1/2 right-2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm border border-white/10 transition-all"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
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
                {getLocalizedTag(cat)}
              </span>
            ))}
            {otherServices.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 text-[10px] font-medium border border-pink-500/20">
                {getLocalizedTag(id)}
              </span>
            ))}
            {otherCore.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                {getLocalizedTag(id)}
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
                {i18n.language === 'ko' ? '출처' : 'Source'} <ArrowRight className="w-4 h-4" />
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
  const { t, i18n } = useTranslation();

  // Helper: Convert English tag to Korean if language is 'ko'
  const getLocalizedTag = (tag) => {
    if (i18n.language !== 'ko') return tag; // English: use as-is from Firebase
    return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
  };

  // Logic to determine which category/service/core to show on the badge (top left)
  const displayCategory =
    (news.categories || []).find(cat => selectedInterests?.includes(cat)) ||
    (news.productServices || []).find(svc => selectedServices?.includes(svc)) ||
    (news.coreElements || []).find(core => selectedCore?.includes(core)) ||
    news.categories?.[0] || t('ai_news_fallback');

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
              {getLocalizedTag(displayCategory)}
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
                {getLocalizedTag(cat)}
              </span>
            ))}
            {otherServices.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 text-[10px] font-medium border border-pink-500/20">
                {getLocalizedTag(id)}
              </span>
            ))}
            {otherCore.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                {getLocalizedTag(id)}
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
                  {t('source')} <ArrowRight className="w-3 h-3" />
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

// Helper function for localizing labels in onboarding
const getLocalizedLabel = (id, language) => {
  if (language !== 'ko') return id; // English: use as-is
  return CATEGORY_ID_MAP[id] || SERVICE_ID_MAP[id] || CORE_ID_MAP[id] || id;
};

// 4. Share Modal Component
const ShareModal = ({ isOpen, onClose, news, onConfirm }) => {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !news) return null;

  const hashtags = news.searchKeywords ? news.searchKeywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ') : '';

  // Helper to render bold text for preview
  const renderPreview = (text) => {
    return text.split(/(\*[^*\n]+\*)/g).map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <span key={index} className="text-blue-300 font-bold">{part.slice(1, -1)}</span>;
      }
      return part;
    });
  };
  const shareUrl = news.sourceUrl || window.location.href;

  // Construct the full text for preview and sharing
  let fullShareText = '';
  if (message.trim()) fullShareText += `${message}\n\n`;

  if (news.isSummaryList) {
    fullShareText += `${news.summary}\n\n✨ [${news.title}]: ${shareUrl}\n\n${hashtags}`;
  } else {
    // Single Article Format: 📌 Title -> Summary -> 👉 Source URL -> Hashtags
    fullShareText += `📌 [${news.title}]\n\n${news.summary}\n\n👉 Source: ${shareUrl}\n\n${hashtags}`;
  }

  const handleShareClick = () => {
    onConfirm(message);
    setMessage('');
    onClose();
  };

  const handleCopy = async () => {
    try {
      // Create HTML version of the text
      // 1. Escape HTML formatting characters in the original text (except our bold markers)
      //    (Simplification: Assuming normal text usage, but replacing newlines and bold markers)
      // 2. Replace newlines with <br>
      // 3. Replace *bold* with <b>bold</b>

      const htmlContent = fullShareText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>")
        .replace(/\*([^*\n]+)\*/g, "<b>$1</b>"); // Bold conversion

      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([fullShareText], { type: 'text/plain' }),
        'text/html': new Blob([htmlContent], { type: 'text/html' })
      });

      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      // Fallback for browsers that might not support ClipboardItem or restrictive contexts
      try {
        await navigator.clipboard.writeText(fullShareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr);
      }
    }
  };

  // AddToAny share handler (Updated to include full text + message)
  const handleSNSShare = (platform) => {
    // We already have fullShareText constructed above with Message + Title + Summary + Hashtags + URL
    const encodedFullText = encodeURIComponent(fullShareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(news.title);

    const shareUrls = {
      threads: `https://www.threads.net/intent/post?text=${encodedFullText}`,
      x: `https://twitter.com/intent/tweet?text=${encodedFullText}`, // X takes text parameter
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedFullText}`, // Facebook might ignore quote, but we try
      whatsapp: `https://api.whatsapp.com/send?text=${encodedFullText}`,
      sms: `sms:?body=${encodedFullText}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}&text=${encodedFullText}`,
      linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedFullText}`, // Direct post creation
      email: `mailto:?subject=${encodedTitle}&body=${encodedFullText}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  // Futuristic Minimal Styles
  // Brands: Threads, X, Facebook, LinkedIn, Reddit, WhatsApp, SMS, Email
  const snsButtons = [
    { id: 'threads', label: 'Threads', icon: <img src="https://cdn.simpleicons.org/threads/white" alt="Threads" className="w-4 h-4" /> },
    { id: 'x', label: 'X', icon: <img src="https://cdn.simpleicons.org/x/white" alt="X" className="w-4 h-4" /> },
    { id: 'facebook', label: 'Facebook', icon: <img src="https://cdn.simpleicons.org/facebook/white" alt="Facebook" className="w-4 h-4" /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4 text-white" /> }, // Use Lucide icon for reliability
    { id: 'reddit', label: 'Reddit', icon: <img src="https://cdn.simpleicons.org/reddit/white" alt="Reddit" className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <img src="https://cdn.simpleicons.org/whatsapp/white" alt="WhatsApp" className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4 text-white" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4 text-white" /> },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0f111a] border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0 bg-white/[0.02]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
            <Share2 className="w-4 h-4 text-blue-500" />
            {t('share_modal_title') || 'Share'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar">

          {/* 1. Message & Preview Section (First) */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {i18n.language === 'ko' ? '메시지 & 미리보기' : 'Message & Preview'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={i18n.language === 'ko' ? '추가 메시지를 입력하세요...' : 'Add a custom message...'}
              className="w-full h-16 bg-black/40 text-white text-xs p-3 rounded-xl border border-white/5 focus:border-blue-500/30 outline-none resize-none placeholder:text-white/20 transition-all font-sans"
            />
            <div className="bg-black/40 rounded-xl p-3 border border-white/5">
              <pre className="text-white/60 text-[10px] leading-relaxed whitespace-pre-wrap font-sans max-h-32 overflow-y-auto custom-scrollbar">
                {renderPreview(fullShareText)}
              </pre>
            </div>
          </div>

          {/* 2. Copy Button (Clean, Centered) */}
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${copied
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white border border-transparent shadow-blue-600/20 hover:shadow-blue-500/30'
              }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            {copied
              ? (i18n.language === 'ko' ? '복사 완료!' : 'Copied to Clipboard')
              : (i18n.language === 'ko' ? '전체 내용 복사' : 'Copy Full Text')}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full h-px bg-white/5"></div>
            </div>
            <span className="relative bg-[#0f111a] px-2 text-[9px] text-white/20 uppercase tracking-widest font-bold">
              {i18n.language === 'ko' ? '또는 SNS로 공유' : 'or share via'}
            </span>
          </div>

          {/* 3. Quick Share Grid (Last) */}
          <div>
            <div className="grid grid-cols-4 gap-2">
              {snsButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleSNSShare(btn.id)}
                  className="group bg-white/5 hover:bg-white/10 hover:border-blue-500/30 border border-white/5 p-2.5 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1.5"
                >
                  <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 text-white">
                    {btn.icon}
                  </div>
                  <span className="text-[9px] font-medium text-white/40 group-hover:text-white transition-colors">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

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
  const { t, i18n } = useTranslation();
  if (!isOpen) return null;

  // Helper: Convert English tag to Korean if language is 'ko'
  const getLocalizedTag = (tag) => {
    if (i18n.language !== 'ko') return tag; // English: use as-is
    return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
  };

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
              {t('sort_by')}
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
                  {t(period.id)}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Categories */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 opacity-80">
              <span className="w-1 h-3 bg-purple-500 rounded-full"></span>
              {t('interests')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DATA_CATEGORIES.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelection(selectedInterests, setSelectedInterests, item.id)}
                    className={`
                      flex items-center justify-center py-1.5 px-3 rounded-lg border transition-all text-center
                      ${isSelected
                        ? 'bg-slate-800 border-slate-500 text-white shadow-md'
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'}
                    `}
                  >
                    <span className="text-xs font-medium">{getLocalizedTag(item.id)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Services */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 opacity-80">
              <span className="w-1 h-3 bg-pink-500 rounded-full"></span>
              {t('ai_services')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {DATA_SERVICES.map((item) => {
                const isSelected = selectedServices.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelection(selectedServices, setSelectedServices, item.id)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${isSelected
                        ? 'bg-pink-500/10 border-pink-500/50 text-pink-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}
                    `}
                  >
                    {getLocalizedTag(item.id)}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Core Elements */}
          <section>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 opacity-80">
              <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
              {t('core_elements')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DATA_CORE.map((item) => {
                const isSelected = selectedCore.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelection(selectedCore, setSelectedCore, item.id)}
                    className={`
                      flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium
                      ${isSelected
                        ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}
                    `}
                  >
                    {item.icon && <item.icon className="w-3 h-3" />}
                    {getLocalizedTag(item.id)}
                    {isSelected && <Check className="w-2.5 h-2.5" />}
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
            {t('done')}
          </button>
        </div>

      </div>
    </div>
  );
};



const App = () => {
  // Simple Client-Side Routing for Admin
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/admin') {
    return <AdminUpload />;
  }

  const { t, i18n } = useTranslation(); // Init hook
  const [step, setStep] = useState(0); // Start at 0 (loading)
  const [authLoading, setAuthLoading] = useState(true); // Splash screen state

  // Fallback: Force release authLoading after 3 seconds in case Firebase is slow
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.warn('⚠️ Auth loading timeout - forcing release');
        setAuthLoading(false);
        // Default to news feed if returning user, else landing
        const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');
        setStep(hasLoggedInBefore ? 5 : 1);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [authLoading]);

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
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Logout Progress State
  const [logoutSuccess, setLogoutSuccess] = useState(false); // Logout Success State

  const isSigningUp = useRef(false); // Track if user is signing up
  const isLoggingIn = useRef(false); // Track if login is in progress (prevents page flash)

  // Auth State
  const [user, setUser] = useState(null);

  const [savedNewsIds, setSavedNewsIds] = useState(new Set()); // For quick lookup
  const [savedNewsItems, setSavedNewsItems] = useState([]); // For display
  const [likedNewsIds, setLikedNewsIds] = useState(new Set()); // NEW: Like State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'saved', 'profile', 'youtube', 'discord'

  // Password Features State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false); // Toggle visibility for current password

  // Sidebar State
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); // NEW: Language Dropdown State

  // NEW: Separate state for saved preferences (from DB) vs temporary filters
  const [savedPreferences, setSavedPreferences] = useState({ categories: [], productServices: [], coreElements: [], language: 'en' });
  const hasInitializedFilters = useRef(false); // To prevent re-initializing on every subscription update

  // Track initialization to distinguish between app load and manual login
  const isFirstCheck = useRef(true);

  // Track if user has successfully logged in during this session
  const wasLoggedIn = useRef(false);

  // Helper for converting Onboarding items - MUST be at top before any conditional returns
  // Memoized to prevent re-calculation on every render which might cause delays
  const localizedCategories = React.useMemo(() =>
    DATA_CATEGORIES.map(item => ({ ...item, label: getLocalizedLabel(item.id, i18n.language) })),
    [i18n.language]
  );

  const localizedServices = React.useMemo(() =>
    DATA_SERVICES.map(item => ({ ...item, label: getLocalizedLabel(item.id, i18n.language) })),
    [i18n.language]
  );

  const localizedCore = React.useMemo(() =>
    DATA_CORE.map(item => ({ ...item, label: getLocalizedLabel(item.id, i18n.language) })),
    [i18n.language]
  );

  // Handle mobile Google redirect result on app load
  useEffect(() => {
    handleGoogleRedirectResult()
      .then((user) => {
        if (user) {
          console.log('✅ Mobile redirect login successful:', user.uid);
          localStorage.setItem('hasLoggedInBefore', 'true');
          wasLoggedIn.current = true;
          setUser(user);
          setIsAuthModalOpen(false);
          setStep(5);
        }
      })
      .catch((error) => {
        console.error('Mobile redirect error:', error);
      });
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // 1. Initial App Load (Auto-login check)
      if (isFirstCheck.current) {
        if (currentUser && !currentUser.isAnonymous) {
          console.log('✅ Auto-login: Redirecting to news feed');
          // Mark that this user has logged in before
          localStorage.setItem('hasLoggedInBefore', 'true');
          wasLoggedIn.current = true;
          setStep(5);
        } else {
          // Check if user has logged in before
          const hasLoggedInBefore = localStorage.getItem('hasLoggedInBefore');
          if (hasLoggedInBefore) {
            console.log('🔒 Returning user: Showing news feed (Guest Mode)');
            setStep(5); // Show News Feed for returning users (Guest Mode)
          } else {
            console.log('👋 First-time visitor: Showing landing page');
            setStep(1); // Show landing page for new users
          }
        }
        isFirstCheck.current = false;
        setAuthLoading(false);
        return;
      }

      // 2. Subsequent Auth Changes (Manual Login/Logout/Signup)
      if (currentUser && !currentUser.isAnonymous) {
        wasLoggedIn.current = true; // Mark session as active
        // User just authenticated
        setIsAuthModalOpen(false); // Ensure modal is closed
        if (isSigningUp.current) {
          console.log('🎉 Signup Success: Showing welcome toast then redirecting...');
          localStorage.setItem('hasLoggedInBefore', 'true');
          setShowSignupToast(true);
          setTimeout(() => {
            setShowSignupToast(false);
            setStep(5);
            isSigningUp.current = false; // Reset
          }, 2000);
        } else {
          console.log('✅ Manual Login: Retrieving user data and showing toast...');
          localStorage.setItem('hasLoggedInBefore', 'true');
          setShowLoginToast(true);
          setActiveTab('home'); // Reset to home tab to show news feed, not profile
          setStep(5); // Immediate redirect to feed to prevent login form flash
          setTimeout(() => {
            setShowLoginToast(false);
          }, 2000);
        }
      } else {
        // User logged out
        // Only redirect to Login (0) if we were previously logged in during this session
        if (wasLoggedIn.current) {
          console.log('👋 User logged out: Redirecting to login page');
          setStep(0);
          wasLoggedIn.current = false;
        }
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
    let dataLoadTimeout;
    let unsubscribeUserData = () => { };

    if (user && !user.isAnonymous) {
      // Safety Redirect: If user is logged in but stuck on Login Page (0) or Auth Gate (4.5), go to Feed (5)
      if (step === 0 || step === 4.5) {
        console.log("⚠️ State Mismatch detected: User logged in but on Step 0/4.5. Forcing redirect to Feed.");
        setStep(5);
      }

      // OPTIMIZATION: Defer data loading to prevent blocking UI transition on mobile
      // Show feed immediately (50ms delay for UI to render), then load data in background
      dataLoadTimeout = setTimeout(() => {
        console.log('📊 Loading user data in background...');

        unsubscribeUserData = subscribeToUserData(user.uid, ({ likes, bookmarks, preferences }) => {
          setLikedNewsIds(new Set(likes));
          setSavedNewsItems(bookmarks);
          setSavedNewsIds(new Set(bookmarks.map(b => b.id)));

          if (preferences) {
            if (preferences.language) {
              i18n.changeLanguage(preferences.language);
            }
            setSavedPreferences({
              categories: preferences.categories || [],
              productServices: preferences.productServices || [],
              coreElements: preferences.coreElements || [],
              language: preferences.language || 'en'
            });

            if (!hasInitializedFilters.current) {
              hasInitializedFilters.current = true;
              if (preferences.categories) setSelectedInterests(migrateIds(preferences.categories, CATEGORY_ID_MAP_REV));
              if (preferences.productServices) setSelectedServices(migrateIds(preferences.productServices, SERVICE_ID_MAP_REV));
              if (preferences.coreElements) setSelectedCore(migrateIds(preferences.coreElements, CORE_ID_MAP_REV));
            }
          }
        });
      }, 50);
    } else {
      setSavedNewsItems([]);
      setSavedNewsIds(new Set());
      setLikedNewsIds(new Set());
    }

    return () => {
      if (dataLoadTimeout) clearTimeout(dataLoadTimeout);
      unsubscribeUserData();
    };
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

  const handleRandomAvatar = async () => {
    if (!user) return;
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = getDiceBearAvatar(randomSeed);

    try {
      await updateProfile(user, { photoURL: newAvatarUrl });
      // Sync to Firestore
      await saveUserToFirestore(user);
      // Force refresh/reload might be needed or handled by AuthState?
      // AuthState usually updates automatically.
      alert("Avatar updated! ✨");
    } catch (error) {
      console.error("Error updating avatar:", error);
      alert("Failed to update avatar.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    try {
      await reauthenticateAndUpdatePassword(user, passwordData.current, passwordData.new);
      setPasswordSuccess("Password changed successfully.");
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error("Password change failed", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setPasswordError("Incorrect current password.");
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    // 1. Show logout spinner overlay
    setIsLoggingOut(true);

    // 2. Transition to login screen
    setStep(0);
    setActiveTab('home');
    wasLoggedIn.current = false;
    setIsAuthModalOpen(false);

    try {
      // 3. Wait for Firebase cleanup to complete
      await logout();
      console.log('✅ Logout cleanup completed');

      // 4. Show success message
      setLogoutSuccess(true);

      // 5. Wait 2 seconds, then hide overlay and enable login button
      setTimeout(() => {
        setIsLoggingOut(false);
        setLogoutSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('⚠️ Logout cleanup failed:', error);
      // Still show success to user (client-side cleanup)
      setLogoutSuccess(true);
      setTimeout(() => {
        setIsLoggingOut(false);
        setLogoutSuccess(false);
      }, 2000);
    }
  };

  const [filterPeriod, setFilterPeriod] = useState('important'); // Default: Important
  const [dateFilter, setDateFilter] = useState('last_week'); // NEW: Date Filter (Default: Last Week)
  const [currentNews, setCurrentNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true); // NEW: Track news loading state
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false); // NEW: For PreferencesPage modal

  const handleToggleSave = async (newsItem) => {
    if (!user || user.isAnonymous) {
      // Trigger Auth Modal if not logged in
      setIsAuthModalOpen(true);
      return;
    }

    const isSaved = savedNewsIds.has(newsItem.id);

    // Optimistic Update
    const newSavedIds = new Set(savedNewsIds);
    let newSavedItems = [...savedNewsItems];

    if (isSaved) {
      newSavedIds.delete(newsItem.id);
      newSavedItems = newSavedItems.filter(item => item.id !== newsItem.id);
    } else {
      newSavedIds.add(newsItem.id);
      newSavedItems.push(newsItem);
    }

    setSavedNewsIds(newSavedIds);
    setSavedNewsItems(newSavedItems);

    try {
      if (isSaved) {
        await removeBookmark(user.uid, newsItem.id);
      } else {
        await saveBookmark(user.uid, newsItem);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
      // Revert on error could be implemented here
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
    // Fetch News Data from Firestore (Current + Previous Month)
    const fetchNews = async () => {
      const now = new Date();

      // Calculate Current Month
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDocId = `${currentYear}-${currentMonth}`;

      // Calculate Previous Month
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
      const prevDocId = `${prevYear}-${prevMonth}`;

      const targetDocs = [currentDocId, prevDocId];

      try {
        console.log(`Fetching news for months: ${targetDocs.join(', ')}...`);

        const fetchPromises = targetDocs.map(id => getDoc(doc(db, 'news_feeds', id)));
        const snapshots = await Promise.all(fetchPromises);

        let allNews = [];

        snapshots.forEach((snap, index) => {
          const docId = targetDocs[index];
          if (snap.exists()) {
            const data = snap.data();
            if (data.news && Array.isArray(data.news)) {
              console.log(`Loaded ${data.news.length} items from ${docId}`);
              allNews = [...allNews, ...data.news];
            }
          } else {
            console.warn(`No data found for ${docId}`);
          }
        });

        // Remove duplicates just in case (though unlikely with distinct docs)
        let uniqueNews = Array.from(new Map(allNews.map(item => [item.id, item])).values());

        // Data is stored in English - no migration needed
        // Localization to Korean happens at display time via getLocalizedTag()

        // Sort by date descending (optional here, as getFilteredNews handles it, but good for initial state)
        uniqueNews.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));

        setCurrentNews(uniqueNews);
        setNewsLoading(false); // Data loaded
        console.log(`Total loaded news items: ${uniqueNews.length}`);

      } catch (error) {
        console.error("Error fetching news from Firestore:", error);
        setNewsLoading(false); // Still mark as loaded even on error
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
    // 0. Localize Data based on current language
    const isKo = i18n.language === 'ko';
    let filtered = currentNews.map(item => ({
      ...item,
      title: (isKo && item.title_ko) ? item.title_ko : item.title,
      summary: (isKo && item.summary_ko) ? item.summary_ko : item.summary,
      why_it_matters: (isKo && item.why_it_matters_ko) ? item.why_it_matters_ko : item.why_it_matters,
      searchKeywords: (isKo && item.searchKeywords_ko) ? item.searchKeywords_ko : item.searchKeywords
    }));

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
        // Assuming publishedDate is "YYYY-MM-DD" or "YYYY.MM.DD"
        // Normalize date string: replace dots with dashes and remove spaces
        const normalizedDateStr = news.publishedDate.replace(/\./g, '-').replace(/\s/g, '');
        const newsDate = new Date(normalizedDateStr);
        newsDate.setHours(0, 0, 0, 0);

        const diffTime = today - newsDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Check each case
        let isMatch = false;
        switch (dateFilter) {
          case 'today':
            isMatch = diffDays === 0;
            break;
          case 'yesterday':
            isMatch = diffDays === 1;
            break;
          case 'this_week': {
            const day = today.getDay(); // 0 (Sun) - 6 (Sat)
            const diffToMonday = day === 0 ? 6 : day - 1;
            const thisMonday = new Date(today);
            thisMonday.setDate(today.getDate() - diffToMonday);
            isMatch = newsDate >= thisMonday;
            break;
          }
          case 'last_week': {
            const day = today.getDay();
            const diffToMonday = day === 0 ? 6 : day - 1;
            const thisMonday = new Date(today);
            thisMonday.setDate(today.getDate() - diffToMonday);
            const lastMonday = new Date(thisMonday);
            lastMonday.setDate(thisMonday.getDate() - 7);
            isMatch = newsDate >= lastMonday && newsDate < thisMonday;
            break;
          }
          case 'this_month':
            isMatch = newsDate.getMonth() === today.getMonth() && newsDate.getFullYear() === today.getFullYear();
            break;
          case 'last_month': {
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            isMatch = newsDate.getMonth() === lastMonth.getMonth() && newsDate.getFullYear() === lastMonth.getFullYear();
            // DEBUG LOG
            if (!isMatch && newsDate.getFullYear() === 2025 && newsDate.getMonth() === 11) {
              console.log(`[Filter Debug] Rejected Last Month Item: ${news.title}`, {
                newsDate: newsDate.toISOString(),
                lastMonthTarget: lastMonth.toISOString(),
                matchMonth: newsDate.getMonth() === lastMonth.getMonth(),
                matchYear: newsDate.getFullYear() === lastMonth.getFullYear()
              });
            }
            break;
          }
          default:
            isMatch = true;
        }
        return isMatch;
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

  const resetFilters = () => {
    setSelectedInterests([]);
    setSelectedServices([]);
    setSelectedCore([]);
    setSearchQuery('');
    // Optionally reset date filter but maybe keep it to 'last_week' as baseline
    setDateFilter('last_week');
  };

  // Onboarding Completion Handler
  const completeOnboarding = () => {
    // If user is logged in, save preferences (handled by useEffect) and go to feed
    // If not logged in, go to feed (step 5) or maybe a specific "Guest Feed"?
    // For now, let's assume step 5 is the main feed.
    localStorage.setItem('hasLoggedInBefore', 'true');
    setStep(5);
  };

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
      alert('Share window closed.');
    }
  };

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  // LOGOUT OVERLAY (highest priority - shows over everything)
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="bg-[#1a1d2d] border border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
          {logoutSuccess ? (
            <>
              {/* Success Checkmark */}
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                <Check size={32} className="text-green-500" strokeWidth={3} />
              </div>
              <p className="text-white text-lg font-bold">{t('logout_success') || '로그아웃 성공!'}</p>
            </>
          ) : (
            <>
              {/* Loading Spinner */}
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-white text-lg font-bold">{t('logging_out') || '로그아웃 중...'}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // 0. Splash Screen (Loading)
  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f111a] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 0. Login Page (for logged-out users)
  if (step === 0) {
    return (
      <>
        <AuthPage
          onAuthSuccess={() => {
            // Immediately navigate to news feed after successful login
            localStorage.setItem('hasLoggedInBefore', 'true');
            wasLoggedIn.current = true;
            setShowLoginToast(true);
            setStep(5);
            setTimeout(() => setShowLoginToast(false), 2000);
          }}
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
            <img src={logo} alt="AI 1분 트렌드" className="w-32 h-32 object-contain relative z-10" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span> {t('landing_title_suffix')}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
            {t('landing_subtitle_1')}<br />
            <span className="text-white font-bold">{t('landing_subtitle_2')}</span>
          </p>

          <button
            onClick={() => setStep(1.5)}
            className="group relative px-8 py-5 bg-gradient-to-r from-[#231F55] to-[#070F27] border border-blue-500/30 rounded-2xl w-full max-w-sm shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
            <div className="flex items-center justify-center gap-3 relative z-10">
              <span className="text-lg font-bold text-white group-hover:tracking-wider transition-all">{t('explore_trends')}</span>
              <ArrowRight className="w-7 h-7 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <p className="absolute bottom-8 text-slate-600 text-xs text-center">
          AI Trend Daily Digest &copy; 2025
        </p>
      </div>
    );
  }


  // 1.5 Language Selection
  if (step === 1.5) {
    return (
      <LanguageSelectionStep
        onNext={() => setStep(2)}
        onPrev={() => setStep(1)}
        onSkip={() => setStep(2)}
      />
    );
  }

  if (step === 2) {
    return (
      <SelectionStep
        title={t('interests')}
        description="Select topics you want to follow"
        subtitle={t('select_interests_desc')}
        items={localizedCategories}
        selectedIds={selectedInterests}
        onToggle={handleToggleInterest}
        onNext={() => setStep(3)}
        onPrev={() => setStep(1.5)}
        onSkip={() => setStep(3)}
        nextLabel={t('next')}
      />
    );
  }

  if (step === 3) {
    return (
      <SelectionStep
        title={t('select_services_title')}
        subtitle={t('select_services_desc')}
        items={localizedServices}
        selectedIds={selectedServices}
        onToggle={(curr, isSel, id) => handleToggleService(curr, isSel, id)}
        onNext={() => setStep(4)}
        onPrev={() => setStep(2)}
        onSkip={() => setStep(4)}
        nextLabel={t('next')}
      />
    );
  }

  if (step === 4) {
    return (
      <SelectionStep
        title={t('select_core_title')}
        subtitle={t('select_core_desc')}
        items={localizedCore}
        selectedIds={selectedCore}
        onToggle={(curr, isSel, id) => handleToggleCore(curr, isSel, id)}
        onNext={completeOnboarding}
        nextLabel={t('view_news_feed')}
        onPrev={() => setStep(3)}
        onSkip={completeOnboarding}
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

  // Determine top news count based on date filter
  // For longer periods (monthly), show more top stories (10)
  // For daily/weekly views, show the standard amount (5)
  const topNewsCount = (dateFilter === 'this_month' || dateFilter === 'last_month') ? 10 : 5;

  const topNews = displayNews.slice(0, topNewsCount);
  const otherNews = displayNews.slice(topNewsCount);

  // Helper: Convert English tag to Korean if language is 'ko'
  const getLocalizedTag = (tag) => {
    if (i18n.language !== 'ko') return tag; // English: use as-is from Firebase
    return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
  };

  const handleNextTop = () => {
    setCurrentTopIndex((prev) => (prev + 1) % topNews.length);
  };

  const handlePrevTop = () => {
    setCurrentTopIndex((prev) => (prev - 1 + topNews.length) % topNews.length);
  };

  const handleShareList = () => {
    const periodText = dateFilter.replace('_', ' ');
    const header = i18n.language === 'ko'
      ? `*💡 ${periodText} 주요 AI 뉴스 Top ${topNews.length}*`
      : `*💡 Top ${topNews.length} important AI news stories of the ${periodText}*`;

    const itemsText = topNews.map((news, index) => {
      // Create number emoji up to 10, fallback to number
      const numEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const numEmoji = numEmojis[index] || `${index + 1}️⃣`;

      // Labels based on current language
      const whyLabel = i18n.language === 'ko' ? '왜 중요한가' : 'Why it matters';
      const sourceLabel = i18n.language === 'ko' ? '출처' : 'Source';

      // Note: news.why_it_matters is already localized by getFilteredNews
      const whyText = news.why_it_matters || '';

      // Format: Number + Bold Title \n Summary \n Why It Matters \n Source
      return `${numEmoji} *${news.title}*\n${news.summary}\n➡️ ${whyLabel}: ${whyText}\n👉${sourceLabel}: ${news.sourceUrl}`;
    }).join('\n\n');

    setShareNewsItem({
      title: i18n.language === 'ko' ? 'AI 1분 트렌드' : 'AI 1-Minute Trend',
      summary: `${header}\n\n${itemsText}`,
      searchKeywords: ['AI', 'Trend', 'News'],
      sourceUrl: window.location.href,
      isSummaryList: true
    });
    setIsShareModalOpen(true);
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
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-80 bg-[#0d1117]/95 backdrop-blur-xl border-r border-white/5 z-40 flex-col sidebar">
        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img src={logo} alt="App Logo" className="w-12 h-12 rounded-xl object-contain shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
              <h1 className="text-[20px] font-bold tracking-tight">
                <span className="gradient-text">AI</span> {t('app_title')}
              </h1>
            </div>
            <p className="text-[14px] text-white/40 pl-1">{t('app_subtitle')}</p>
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
            <span className="font-medium">{t('my_page')}</span>
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
            <span className="font-medium">{t('saved_news')}</span>
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
            <span className="font-medium">{t('preferences')}</span>
          </button>

          {/* Language Selection - Globe Dropdown */}
          <div className="relative z-10">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${isLangMenuOpen ? 'bg-white/5 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <span className="font-medium">{i18n.language === 'ko' ? t('korean') : t('english')}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options */}
            {isLangMenuOpen && (
              <div className="mt-2 space-y-1 bg-[#1A1D2D] rounded-xl border border-white/5 p-1 animate-in slide-in-from-top-2 fade-in duration-200 shadow-xl overflow-hidden">
                <button
                  onClick={() => {
                    i18n.changeLanguage('en');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${i18n.language === 'en'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span className="w-4 text-center">🇺🇸</span>
                  {t('english')}
                  {i18n.language === 'en' && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
                <button
                  onClick={() => {
                    i18n.changeLanguage('ko');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${i18n.language === 'ko'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span className="w-4 text-center">🇰🇷</span>
                  {t('korean')}
                  {i18n.language === 'ko' && <Check className="w-3.5 h-3.5 ml-auto" />}
                </button>
              </div>
            )}
          </div>

          <div className="mt-[10vh] pt-4">
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-white/60 hover:text-[#FF0000] hover:bg-white/5 transition-all"
            >
              <YoutubeIcon className="w-5 h-5 text-[#FF0000]" />
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



        <div className="p-4 mt-auto border-t border-white/5">
          {
            user && !user.isAnonymous ? (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 group transition-colors hover:bg-white/10">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                  <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {t('create_account_signin')}
              </button>
            )
          }
        </div>
      </aside>

      {/* Main Content Area - Offset for sidebar on desktop */}
      <div className="relative z-10 flex flex-col min-h-screen w-full lg:pl-80 pb-20 lg:pb-0 overflow-x-hidden">

        {/* Header - Mobile only, hidden on desktop */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#101922]/85 shadow-lg shadow-black/20">
          {/* Mobile header */}
          <div className="flex lg:hidden items-center justify-between w-full px-4 py-3 h-[60px] overflow-hidden">

            {
              isSearchOpen ? (
                /* Search Mode Header */
                <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-2 duration-200" >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('search_placeholder')}
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
                    className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* Normal Header */
                <>
                  {/* Logo - Hidden on desktop (shown in sidebar) */}
                  <div className="flex items-center gap-3 lg:hidden">
                    <img src={logo} alt="App Logo" className="w-11 h-11 rounded-xl object-contain shadow-[0_0_15px_rgba(19,127,236,0.2)]" />
                    <h1 className="text-lg font-bold tracking-tight text-white/95">{t('mobile_app_title')}</h1>
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
                    {user && !user.isAnonymous && user.photoURL ? (
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shadow-lg relative ml-2 lg:hidden"
                      >
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shadow-lg relative ml-2 lg:hidden flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600"
                      >
                        <LogIn className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </>
              )}
          </div >



          {/* Desktop: Two-Row Header Layout */}
          <div className="hidden lg:flex flex-col px-8 py-4 w-full max-w-7xl mx-auto gap-4">
            {/* Row 1: Personalized Greeting (Left) + Search Bar (Right) */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center text-xl text-white/90 font-semibold whitespace-nowrap">
                <Sparkles className="w-5 h-5 text-blue-400 mr-2" />
                {user && !user.isAnonymous
                  ? <><span className="text-blue-400 font-bold">{user.displayName || 'User'}</span>{t('news_briefing_suffix')}</>
                  : t('app_subtitle')
                }
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
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
                  {t('latest')}
                </button>
                <button
                  onClick={() => setFilterPeriod('popular')}
                  className={`relative px-4 py-1.5 rounded-none -ml-px text-sm font-medium whitespace-nowrap transition-all border ${filterPeriod === 'popular' ? 'z-10 bg-slate-700 text-white border-slate-600' : 'bg-transparent text-white/50 border-white/20 hover:text-white/80 hover:border-white/40 hover:z-10'}`}
                >
                  {t('popular')}
                </button>
                <button
                  onClick={() => setFilterPeriod('important')}
                  className={`relative px-4 py-1.5 rounded-r-md rounded-l-none -ml-px text-sm font-medium whitespace-nowrap transition-all border ${filterPeriod === 'important' ? 'z-10 bg-slate-700 text-white border-slate-600' : 'bg-transparent text-white/50 border-white/20 hover:text-white/80 hover:border-white/40 hover:z-10'}`}
                >
                  {t('important')}
                </button>
              </div >

              {/* Filter Button - Image Style */}
              < button
                onClick={() => setFilterModalOpen(true)}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-transparent hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors border border-white/20 hover:border-white/40"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">{t('filter_button')}</span>
              </button >
            </div >
          </div >

          {/* Mobile: Original Filter Bar */}
          < div className="lg:hidden px-4 pb-3 pt-0 w-full max-w-7xl mx-auto flex items-center justify-between gap-3" >
            <div className="flex items-center isolate overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterPeriod('latest')}
                className={`relative px-4 py-1.5 rounded-l-xl rounded-r-none text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all border ${filterPeriod === 'latest' ? 'z-10 bg-blue-600/90 text-white border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:z-10'}`}
              >
                {t('latest')}
              </button>
              <button
                onClick={() => setFilterPeriod('popular')}
                className={`relative px-4 py-1.5 rounded-none -ml-px text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all border ${filterPeriod === 'popular' ? 'z-10 bg-blue-600/90 text-white border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:z-10'}`}
              >
                {t('popular')}
              </button>
              <button
                onClick={() => setFilterPeriod('important')}
                className={`relative px-4 py-1.5 rounded-r-xl rounded-l-none -ml-px text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all border ${filterPeriod === 'important' ? 'z-10 bg-blue-600/90 text-white border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:z-10'}`}
              >
                {t('important')}
              </button>
            </div>
            <div className="h-6 w-px bg-white/10 mx-1"></div>

            <button
              onClick={() => setFilterModalOpen(true)}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 transition-colors backdrop-blur-md"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div >
        </header >

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pt-4 lg:pt-6">

          {/* Conditional Rendering: Search Mode vs Main Feed */}
          {searchQuery ? (
            /* --- SEARCH RESULTS VIEW --- */
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
                  "{searchQuery}" Search Results ({filteredNews.length})
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
                  <p className="text-white/60 text-lg">No search results found.</p>
                  <p className="text-white/40 text-sm mt-1">Try searching with different keywords.</p>
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
                    <div className="w-full h-full rounded-full bg-[#101922] flex items-center justify-center overflow-hidden relative group">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-10 h-10 text-white/80" />
                      )}

                      {/* Randomize Button Overlay */}
                      <button
                        onClick={handleRandomAvatar}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title={t('randomize_profile')}
                      >
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                      </button>
                    </div>
                  </div>

                  {/* Text Button below avatar */}
                  <button
                    onClick={handleRandomAvatar}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-3 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" /> {t('randomize_profile')}
                  </button>

                  <h2 className="text-xl font-bold text-white mb-1">
                    {(!user || user.isAnonymous) ? t('guest_user') : (user.displayName || 'User')}
                  </h2>
                  <p className="text-white/50 text-sm">
                    {(!user || user.isAnonymous) ? t('sign_in_desc') : (user.email || 'No email info')}
                  </p>
                </div>

                {/* NEW: Show Current Preferences Summary (from DB, not temp filters) */}
                {user && !user.isAnonymous && (savedPreferences.categories.length > 0 || savedPreferences.productServices.length > 0 || savedPreferences.coreElements.length > 0) && (
                  <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-4 space-y-3">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {t('my_preferences_title')}
                    </h3>

                    {/* Language Display */}
                    <div>
                      <span className="text-[10px] text-white/40 mb-1 block">{t('language')}</span>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] px-2 py-1 rounded bg-pink-500/20 text-pink-300 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {savedPreferences.language === 'ko' ? t('korean') : t('english')}
                        </span>
                      </div>
                    </div>

                    {/* Categories */}
                    {savedPreferences.categories.length > 0 && (
                      <div>
                        <span className="text-[10px] text-white/40 mb-1 block">{t('interests')}</span>
                        <div className="flex flex-wrap gap-1">
                          {savedPreferences.categories.slice(0, 3).map(id => {
                            return <span key={id} className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300">{getLocalizedTag(id)}</span>;
                          })}
                          {(savedPreferences.categories.length > 3) && <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-300">+{savedPreferences.categories.length - 3}</span>}
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    {savedPreferences.productServices.length > 0 && (
                      <div>
                        <span className="text-[10px] text-white/40 mb-1 block">{t('ai_services')}</span>
                        <div className="flex flex-wrap gap-1">
                          {savedPreferences.productServices.slice(0, 3).map(id => {
                            return <span key={id} className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-300">{getLocalizedTag(id)}</span>;
                          })}
                          {(savedPreferences.productServices.length > 3) && <span className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-300">+{savedPreferences.productServices.length - 3}</span>}
                        </div>
                      </div>
                    )}

                    {/* Core Elements */}
                    {savedPreferences.coreElements.length > 0 && (
                      <div>
                        <span className="text-[10px] text-white/40 mb-1 block">{t('core_elements')}</span>
                        <div className="flex flex-wrap gap-1">
                          {savedPreferences.coreElements.slice(0, 3).map(id => {
                            return <span key={id} className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">{getLocalizedTag(id)}</span>;
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
                      {t('edit_preferences')}
                    </button>
                  )}

                  {/* Password Management Section (Added) */}
                  {user && !user.isAnonymous && user.providerData[0]?.providerId === 'password' && (
                    <div className="w-full rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-all">
                      <button
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="w-full px-5 py-4 flex items-center justify-between text-white hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold text-sm">Password Management</span>
                            <span className="block text-xs text-slate-400">Protect your account with regular updates</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${showPasswordChange ? 'rotate-90' : ''}`} />
                      </button>

                      {showPasswordChange && (
                        <div className="p-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                          <form onSubmit={handlePasswordChange} className="space-y-4">

                            <div>
                              <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Current Password</label>
                              <div className="relative">
                                <input
                                  type={showCurrentPassword ? "text" : "password"}
                                  value={passwordData.current}
                                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                                  placeholder="Enter current password"
                                  required
                                />
                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">New Password</label>
                                <input
                                  type="password"
                                  value={passwordData.new}
                                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                                  placeholder="New Password"
                                  required
                                  minLength={6}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Confirm Password</label>
                                <input
                                  type="password"
                                  value={passwordData.confirm}
                                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                                  placeholder="Re-enter password"
                                  required
                                  minLength={6}
                                />
                              </div>
                            </div>

                            {/* Status Messages */}
                            {passwordError && (
                              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                <AlertCircle className="w-4 h-4" /> {passwordError}
                              </div>
                            )}
                            {passwordSuccess && (
                              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                <Check className="w-4 h-4" /> {passwordSuccess}
                              </div>
                            )}

                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                Update Password
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
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
                    {(!user || user.isAnonymous) ? t('create_account_signin') : t('logout')}
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
                  {t('saved_news')} ({savedNewsItems.length})
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
                  <p className="text-white/60 text-lg">No saved news.</p>
                  <p className="text-white/40 text-sm mt-1">Save news you like to read later.</p>
                </div>
              )}
            </section>
          ) : (
            /* --- MAIN FEED --- */
            <>
              {/* Section: Today's Top 5 */}
              <section className="mb-8 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
                  <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] flex-shrink-0"></span>
                    <span className="break-words">
                      {(() => {
                        // Use specific key for the default important view
                        if (dateFilter === 'today' && filterPeriod === 'important') {
                          return t('today_high_impact');
                        }

                        // Fallback construction for other combos
                        const prefix = {
                          today: t('today') + t('possessive_suffix'),
                          yesterday: t('yesterday') + t('possessive_suffix'),
                          this_week: t('this_week') + t('possessive_suffix'),
                          last_week: t('last_week') + t('possessive_suffix'),
                          this_month: t('this_month') + t('possessive_suffix'),
                          last_month: t('last_month') + t('possessive_suffix'),
                          all: t('all_time_news_prefix')
                        }[dateFilter] || t('today') + t('possessive_suffix');

                        const type = filterPeriod === 'latest' ? t('latest') :
                          filterPeriod === 'popular' ? t('popular') :
                            t('important');

                        return `${prefix} ${type} Top ${topNewsCount}`;
                      })()}
                    </span>
                  </h2>
                  {/* Mobile carousel controls */}
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
                                <div className="relative h-[60%] overflow-hidden bg-[#0f111a]">
                                  <AsyncImage
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                    src={news.imageUrl || SAMPLE_IMAGES[(prevIndex + (new Date().getDate() * 5)) % SAMPLE_IMAGES.length]}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#101922]/80"></div>
                                  <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/90 text-white">
                                      {getLocalizedTag(news.categories?.[0] || 'AI News')}
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
                            const news = topNews[currentTopIndex % topNews.length];
                            return (
                              <article className="group relative overflow-hidden rounded-2xl bg-white/[0.05] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] h-auto min-h-[390px] flex flex-col transition-all duration-300 hover:shadow-[0_0_60px_rgba(59,130,246,0.25)]">
                                {/* Image Fixed Height (Increased another 5%) */}
                                <div className="relative h-[205px] overflow-hidden bg-[#0f111a]">
                                  <AsyncImage
                                    alt={news.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    src={news.imageUrl || SAMPLE_IMAGES[(currentTopIndex + (new Date().getDate() * 5)) % SAMPLE_IMAGES.length]}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#101922]"></div>
                                  <div className="absolute top-3 left-3">
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                                      {getLocalizedTag((news.categories || []).find(cat => selectedInterests.includes(cat)) ||
                                        (news.productServices || []).find(svc => selectedServices.includes(svc)) ||
                                        (news.coreElements || []).find(core => selectedCore.includes(core)) ||
                                        news.categories?.[0] || 'AI News')}
                                    </span>
                                  </div>
                                  <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-black/50 backdrop-blur-md text-white border border-white/10">
                                      {currentTopIndex + 1} / {topNews.length}
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

                                  <div className="mt-1 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-[11px] font-bold text-blue-400 mb-1 uppercase tracking-wider">
                                      <Sparkles className="w-3 h-3 inline-block mr-1" />
                                      {i18n.language === 'ko' ? '왜 중요한가' : 'Why It Matters'}
                                    </p>
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                                      {news.why_it_matters}
                                    </p>
                                  </div>
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
                                        {getLocalizedTag(cat)}
                                      </span>
                                    ))}
                                    {(news.productServices || []).filter(s => s !== ((news.categories || []).find(cat => selectedInterests.includes(cat)) || (news.productServices || []).find(svc => selectedServices.includes(svc)) || (news.coreElements || []).find(core => selectedCore.includes(core)) || news.categories?.[0] || 'AI News')).map(id => (
                                      <span key={id} className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 text-[10px] font-medium border border-pink-500/20">
                                        {getLocalizedTag(id)}
                                      </span>
                                    ))}
                                    {(news.coreElements || []).filter(c => c !== ((news.categories || []).find(cat => selectedInterests.includes(cat)) || (news.productServices || []).find(svc => selectedServices.includes(svc)) || (news.coreElements || []).find(core => selectedCore.includes(core)) || news.categories?.[0] || 'AI News')).map(id => (
                                      <span key={id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                                        {getLocalizedTag(id)}
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
                                        {i18n.language === 'ko' ? '출처' : 'Source'} <ArrowRight className="w-3 h-3" />
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
                                <div className="relative h-[60%] overflow-hidden bg-[#0f111a]">
                                  <AsyncImage
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                    src={news.imageUrl || SAMPLE_IMAGES[(nextIndex + (new Date().getDate() * 5)) % SAMPLE_IMAGES.length]}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#101922]/80"></div>
                                  <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/90 text-white">
                                      {getLocalizedTag(news.categories?.[0] || 'AI News')}
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
                    <div className="lg:hidden relative group">
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
                        onNext={handleNextTop}
                        onPrev={handlePrevTop}
                        current={currentTopIndex + 1}
                        total={topNews.length}
                      />

                      {/* Mobile Indicators - Dots only */}
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

                  </>
                )}
              </section>

              {/* NEW: Top News Text Summary List (Vertical - Unified) */}
              {topNews.length > 0 && (
                <section className="mt-12 mb-16 px-1">
                  <div className="flex items-center gap-2 mb-6">
                    <List className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {i18n.language === 'ko' ? `Top ${topNews.length} 주요 뉴스 요약 리스트` : `Top ${topNews.length} News Summary List`}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 lg:p-8 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -z-10"></div>

                    <div className="flex flex-col">
                      {topNews.map((news, index) => (
                        <div key={news.id} className="mb-8 last:mb-0 border-b border-white/5 last:border-0 pb-8 last:pb-0">
                          <div className="flex items-start gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/20">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                                {news.title}
                              </h3>
                              <p className="text-white/70 text-sm leading-relaxed mb-3">
                                {news.summary}
                              </p>

                              {/* Why It Matters */}
                              {news.why_it_matters && (
                                <div className="mb-3 pl-3 border-l-2 border-blue-500/30">
                                  <p className="text-xs font-bold text-blue-400 mb-0.5 uppercase tracking-wide">
                                    {i18n.language === 'ko' ? '왜 중요한가' : 'Why it matters'}
                                  </p>
                                  <p className="text-sm text-white/80">
                                    {news.why_it_matters}
                                  </p>
                                </div>
                              )}

                              {/* Hashtags */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {(news.searchKeywords || []).map(k => (
                                  <span key={k} className="text-xs text-slate-500">#{k.replace(/\s+/g, '')}</span>
                                ))}
                              </div>

                              {/* Simplified Actions Row */}
                              <div className="flex items-center gap-4 mt-2">
                                {/* Like/Save compact */}
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleToggleLike(news)}
                                    className={`flex items-center gap-1.5 text-xs transition-colors ${likedNewsIds.has(news.id) ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'}`}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${likedNewsIds.has(news.id) ? 'fill-current' : ''}`} />
                                    {news.likes || 0}
                                  </button>
                                  <button
                                    onClick={() => handleToggleSave(news)}
                                    className={`flex items-center gap-1.5 text-xs transition-colors ${savedNewsIds.has(news.id) ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                                  >
                                    <Bookmark className={`w-3.5 h-3.5 ${savedNewsIds.has(news.id) ? 'fill-current' : ''}`} />
                                  </button>
                                </div>

                                {news.sourceUrl && (
                                  <a
                                    href={news.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-auto"
                                  >
                                    {i18n.language === 'ko' ? '출처' : 'Source'} <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Copy All Button - Inside the container, bottom */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                      <button
                        onClick={handleShareList}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        {i18n.language === 'ko' ? '전체 리스트 공유하기' : 'Share Summary List'}
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Section: Latest News List */}
              <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                  <h2 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"></span>
                    {(() => {
                      const prefix = {
                        today: t('today_news_prefix') || "Today's",
                        yesterday: t('yesterday_news_prefix') || "Yesterday's",
                        this_week: t('this_week_news_prefix') || "This Week's",
                        last_week: t('last_week_news_prefix') || "Last Week's",
                        this_month: t('this_month_news_prefix') || "This Month's",
                        last_month: t('last_month_news_prefix') || "Last Month's",
                        all: t('all_time_news_prefix') || "All Time"
                      }[dateFilter] || t('today_news_prefix');

                      return `${prefix} ${t('news_suffix') || 'News'}`;
                    })()}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {otherNews.length > 0 ? (
                    otherNews.map((news, index) => (
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
                    ))
                  ) : newsLoading ? (
                    <div className="lg:col-span-2 py-20 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
                      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  ) : displayNews.length === 0 ? (
                    <div className="lg:col-span-2 py-20 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                        <Filter className="w-10 h-10 text-white/20" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {i18n.language === 'ko' ? '검색 결과가 없습니다' : 'No articles found'}
                      </h3>
                      <p className="text-white/50 text-sm max-w-xs mb-8">
                        {i18n.language === 'ko' ? '선택하신 필터나 검색어에 맞는 기사가 없습니다. 필터를 초기화해보세요.' : 'No articles match your current filters or search. Try resetting them to see more.'}
                      </p>
                      <button
                        onClick={resetFilters}
                        className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-900/40"
                      >
                        {i18n.language === 'ko' ? '필터 및 검색 초기화' : 'Reset Filters & Search'}
                      </button>
                    </div>
                  ) : null}
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
              <span className="text-[9px] font-medium">{t('my_page')}</span>
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
              <span className="text-[9px] font-medium">{t('nav_saved')}</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-full transition-all ${activeTab === 'profile' ? 'text-blue-400 bg-blue-500/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium">{t('nav_profile')}</span>
            </button>

            {/* Mobile Language Toggle (Icon + Text) */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ko' : 'en')}
              className="flex flex-col items-center justify-center w-14 h-12 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <Globe className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium">{i18n.language === 'ko' ? t('nav_lang_ko') : t('nav_lang_en')}</span>
            </button>

            <a className="flex flex-col items-center justify-center w-14 h-12 rounded-full text-white/50 hover:text-[#5865F2] hover:bg-white/5 transition-all" href="https://www.youtube.com" target="_blank" rel="noreferrer">
              <YoutubeIcon className="w-5 h-5 mb-0.1 scale-[1.3] translate-y-[2px]" />
              <span className="text-[9px] font-medium">Youtube</span>
            </a>
            <a className="flex flex-col items-center justify-center w-14 h-12 rounded-full text-white/50 hover:text-[#5865F2] hover:bg-white/5 transition-all" href="https://discord.com" target="_blank" rel="noreferrer">
              <DiscordIcon className="w-8 h-8 -mb-2.5 scale-[1.3] -translate-y-0.5" />
              <span className="text-[9px] font-medium">Discord</span>
            </a>
          </nav>
        </div>

      </div >

      {/* Filter Page - Temporary Filtering Only (No DB Save) */}
      < FilterPage
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
      < ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        news={shareNewsItem}
        onConfirm={executeShare}
      />

      {/* Auth Modal */}
      < AuthPage
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <div className="bg-[#1a1f2e]/95 backdrop-blur-xl px-10 py-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-5 animate-in zoom-in fade-in duration-300 pointer-events-auto">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-1">
                <LogOut className="w-10 h-10 text-red-400" strokeWidth={2} />
              </div>
              <span className="text-white font-bold text-2xl">Logged Out</span>
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
        initialLanguage={savedPreferences.language || i18n.language}
      />

      {/* GLOBAL TOASTS - Rendered regardless of step */}

      {/* Login Success Toast */}
      {
        showLoginToast && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
            <div className="bg-[#1a1f2e]/95 backdrop-blur-xl px-10 py-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-5 animate-in zoom-in fade-in duration-300 pointer-events-auto">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                <PartyPopper className="w-10 h-10 text-blue-400 animate-bounce" strokeWidth={2} />
              </div>
              <span className="text-white font-bold text-2xl">Login Successful!</span>
            </div>
          </div>
        )
      }

      {/* Signup Success Toast */}
      {
        showSignupToast && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
            <div className="bg-[#1a1f2e]/95 backdrop-blur-xl px-10 py-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-5 animate-in zoom-in fade-in duration-300 pointer-events-auto">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                <Check className="w-10 h-10 text-green-400 animate-bounce" strokeWidth={3} />
              </div>
              <span className="text-white font-bold text-2xl">Account Created!</span>
              <p className="text-white/60 text-sm">Welcome! Redirecting...</p>
            </div>
          </div>
        )
      }

    </div >
  );
}

export default App;