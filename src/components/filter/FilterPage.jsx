import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import {
  CATEGORIES as DATA_CATEGORIES,
  PRODUCT_SERVICES as DATA_SERVICES,
  CORE_ELEMENTS as DATA_CORE,
  PERIODS,
  CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP
} from '../../constants';

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

  const getLocalizedTag = (tag) => {
    if (i18n.language !== 'ko') return tag;
    return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
  };

  const toggleSelection = (current, setter, id) => {
    if (current.includes(id)) setter(current.filter(i => i !== id));
    else setter([...current, id]);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f111a] flex items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#141724] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
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

export default FilterPage;
