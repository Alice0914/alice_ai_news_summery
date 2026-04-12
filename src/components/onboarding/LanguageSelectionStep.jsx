import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import usFlag from '../../assets/us_flag.png';
import krFlag from '../../assets/kr_flag.png';

const LanguageSelectionStep = ({ onNext, onPrev, onSkip }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0f111a] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl flex flex-col h-full max-h-[90vh]">
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
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 blur-xl rounded-full transition-opacity duration-500 ${i18n.language === 'en' ? 'opacity-25' : 'group-hover:opacity-15'}`} />
            <div className={`relative z-10 mr-4 transition-transform duration-300 ${i18n.language === 'en' ? 'scale-110' : 'group-hover:scale-110'}`}>
              <img src={usFlag} alt="US Flag" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <span className="flex-grow text-base md:text-lg font-semibold tracking-wide text-white">
              English
            </span>
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
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-red-500 to-blue-500 opacity-0 blur-xl rounded-full transition-opacity duration-500 ${i18n.language === 'ko' ? 'opacity-25' : 'group-hover:opacity-15'}`} />
            <div className={`relative z-10 mr-4 transition-transform duration-300 ${i18n.language === 'ko' ? 'scale-110' : 'group-hover:scale-110'}`}>
              <img src={krFlag} alt="Korea Flag" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <span className="flex-grow text-base md:text-lg font-semibold tracking-wide text-white">
              한국어
            </span>
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

        <div className="mt-8 pt-6 flex items-center gap-3 w-full border-t border-white/5">
          <button onClick={onPrev} className="px-6 py-4 rounded-2xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all">
            {t('prev')}
          </button>
          {onSkip && (
            <button onClick={onSkip} className="px-6 py-4 rounded-2xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all">
              {t('skip')}
            </button>
          )}
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

export default LanguageSelectionStep;
