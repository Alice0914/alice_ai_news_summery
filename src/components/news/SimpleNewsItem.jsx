import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, ChevronLeft, Share2, Bookmark, Heart
} from 'lucide-react';
import { CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP } from '../../constants';

const SimpleNewsItem = ({ news, isExpanded, onToggle, onShare, onSave, isSaved, onToggleLike, isLiked, selectedInterests, selectedServices, selectedCore }) => {
  const { t, i18n } = useTranslation();

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

      {isExpanded && (
        <div className="mt-2 text-sm text-white/70 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="leading-relaxed mb-2">
            {news.summary}
          </p>
          <div className="flex flex-wrap gap-2 mb-3 border-b border-white/5 pb-3">
            {(news.searchKeywords || []).map(k => (
              <span key={k} className="text-blue-400 text-xs px-1">#{k.replace(/\s+/g, '')}</span>
            ))}
          </div>
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

export default SimpleNewsItem;
