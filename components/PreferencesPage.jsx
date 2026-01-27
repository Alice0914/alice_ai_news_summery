import React, { useState, useEffect } from 'react';
import { X, Check, ArrowLeft, Sparkles, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP } from '../constants';

/**
 * PreferencesPage - Dedicated page for editing user preferences.
 * Unlike FilterPage, changes here are saved permanently to Firestore.
 */
const PreferencesPage = ({
    isOpen,
    onClose,
    onSave,
    categories,
    productServices,
    coreElements,
    initialCategories = [],
    initialServices = [],
    initialCore = [],
    initialLanguage = 'en'
}) => {
    const { t, i18n } = useTranslation();
    const [selectedCategories, setSelectedCategories] = useState(initialCategories);
    const [selectedServices, setSelectedServices] = useState(initialServices);
    const [selectedCore, setSelectedCore] = useState(initialCore);
    const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);

    // Reset to initial values when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedCategories(initialCategories);
            setSelectedServices(initialServices);
            setSelectedCore(initialCore);
            setSelectedLanguage(initialLanguage);
        }
    }, [isOpen, initialCategories, initialServices, initialCore, initialLanguage]);

    const handleToggle = (setter, current, id) => {
        if (current.includes(id)) {
            setter(current.filter(i => i !== id));
        } else {
            setter([...current, id]);
        }
    };

    // Helper: Convert English tag to Korean if language is 'ko'
    const getLocalizedTag = (tag) => {
        if (i18n.language !== 'ko') return tag;
        return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
    };

    const handleSave = () => {
        onSave({
            categories: selectedCategories,
            productServices: selectedServices,
            categories: selectedCategories,
            productServices: selectedServices,
            coreElements: selectedCore,
            language: selectedLanguage
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 bg-[#101922] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-[#101922]/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/70">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        {t('preferences')}
                    </h2>
                    <div className="w-9" /> {/* Spacer for balance */}
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {/* Language Section */}
                    <section>
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-white/60" />
                            {t('language')}
                        </h3>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => {
                                    i18n.changeLanguage('en');
                                    setSelectedLanguage('en');
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-2 ${selectedLanguage === 'en'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <span className="text-xs">🇺🇸</span> {t('english')}
                            </button>
                            <button
                                onClick={() => {
                                    i18n.changeLanguage('ko');
                                    setSelectedLanguage('ko');
                                }}
                                className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-2 ${selectedLanguage === 'ko'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <span className="text-xs">🇰🇷</span> {t('korean')}
                            </button>
                        </div>
                    </section>

                    {/* Categories Section */}
                    <section>
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-blue-500"></span>
                            {t('interests')}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {categories.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleToggle(setSelectedCategories, selectedCategories, item.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedCategories.includes(item.id)
                                        ? 'bg-blue-600/80 text-white border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {item.icon && <item.icon className="w-3 h-3 inline mr-1" />}
                                    {getLocalizedTag(item.id)}
                                    {selectedCategories.includes(item.id) && <Check className="w-2.5 h-2.5 inline ml-1" />}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Services Section */}
                    <section>
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-purple-500"></span>
                            {t('ai_services')}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {productServices.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleToggle(setSelectedServices, selectedServices, item.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedServices.includes(item.id)
                                        ? 'bg-purple-600/80 text-white border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {item.icon && <item.icon className="w-3 h-3 inline mr-1" />}
                                    {getLocalizedTag(item.id)}
                                    {selectedServices.includes(item.id) && <Check className="w-2.5 h-2.5 inline ml-1" />}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Core Elements Section */}
                    <section>
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-emerald-500"></span>
                            {t('core_elements')}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {coreElements.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleToggle(setSelectedCore, selectedCore, item.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedCore.includes(item.id)
                                        ? 'bg-emerald-600/80 text-white border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {item.icon && <item.icon className="w-3 h-3 inline mr-1" />}
                                    {getLocalizedTag(item.id)}
                                    {selectedCore.includes(item.id) && <Check className="w-2.5 h-2.5 inline ml-1" />}
                                </button>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer - Save Button */}
                <div className="sticky bottom-0 bg-[#101922]/95 backdrop-blur-md border-t border-white/10 p-4">
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        {t('save_preferences')}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PreferencesPage;
