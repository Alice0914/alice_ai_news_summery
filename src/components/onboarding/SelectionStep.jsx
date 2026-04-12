import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';

const SelectionStep = ({
  title, subtitle, items, selectedIds, onToggle, onNext, nextLabel, onPrev, onSkip
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 w-full bg-[#0f111a] flex flex-col font-sans">
      <div className="w-full h-full flex flex-col max-w-2xl mx-auto relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 w-full">
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
                  <div className={`relative z-10 mr-3 transition-transform duration-100 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <Icon
                      size={20}
                      className={`transition-colors duration-100 ${item.color}`}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                  </div>
                  <span className="flex-grow text-sm md:text-base font-semibold tracking-wide text-white">
                    {item.label}
                  </span>
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

export default SelectionStep;
