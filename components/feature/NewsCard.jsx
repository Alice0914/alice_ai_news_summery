import React from 'react';
import {
  ChevronDown, Zap, Hash, ExternalLink, ThumbsUp, Bookmark
} from 'lucide-react';

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
        <h3 className={`font-bold text-[#111] leading-snug ${isExpanded ? 'text-lg md:text-xl mb-3' : 'text-sm md:text-[16px]'}`}>
          {news.title}
        </h3>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <p className="text-[15px] text-gray-600 leading-relaxed mb-1">
              {news.summary}
            </p>
            <div className="text-[11px] text-gray-400 mb-5 text-left">
              {news.publishedDate || news.date}
            </div>

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

export default NewsCard;