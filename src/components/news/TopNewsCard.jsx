import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, ChevronLeft, ChevronRight, Share2, Bookmark, Heart
} from 'lucide-react';
import { CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP } from '../../constants';

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

  const getLocalizedTag = (tag) => {
    if (i18n.language !== 'ko') return tag;
    return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
  };

  const displayCategory =
    (news.categories || []).find(cat => selectedInterests?.includes(cat)) ||
    (news.productServices || []).find(svc => selectedServices?.includes(svc)) ||
    (news.coreElements || []).find(core => selectedCore?.includes(core)) ||
    news.categories?.[0] || t('ai_news_fallback');

  const otherCategories = (news.categories || []).filter(cat => cat !== displayCategory);
  const otherServices = (news.productServices || []).filter(svc => svc !== displayCategory);
  const otherCore = (news.coreElements || []).filter(core => core !== displayCategory);

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300 h-auto flex flex-col">
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
          <div className="flex flex-wrap gap-2 mt-2">
            {(news.searchKeywords || []).map(k => (
              <span key={k} className="text-blue-400 text-xs px-1">#{k.replace(/\s+/g, '')}</span>
            ))}
          </div>
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
      </div>
    </article>
  );
};

export default TopNewsCard;
