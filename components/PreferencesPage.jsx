import React, { useState, useEffect } from 'react';
import { X, Check, ArrowLeft, Sparkles } from 'lucide-react';

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
    initialCore = []
}) => {
    const [selectedCategories, setSelectedCategories] = useState(initialCategories);
    const [selectedServices, setSelectedServices] = useState(initialServices);
    const [selectedCore, setSelectedCore] = useState(initialCore);

    // Reset to initial values when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedCategories(initialCategories);
            setSelectedServices(initialServices);
            setSelectedCore(initialCore);
        }
    }, [isOpen, initialCategories, initialServices, initialCore]);

    const handleToggle = (setter, current, id) => {
        if (current.includes(id)) {
            setter(current.filter(i => i !== id));
        } else {
            setter([...current, id]);
        }
    };

    const handleSave = () => {
        onSave({
            categories: selectedCategories,
            productServices: selectedServices,
            coreElements: selectedCore
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
                        내 기본 설정
                    </h2>
                    <div className="w-9" /> {/* Spacer for balance */}
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">

                    {/* Categories Section */}
                    <section>
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-blue-500"></span>
                            관심 분야
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
                                    {item.label}
                                    {selectedCategories.includes(item.id) && <Check className="w-2.5 h-2.5 inline ml-1" />}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Services Section */}
                    <section>
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-purple-500"></span>
                            AI 서비스
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
                                    {item.label}
                                    {selectedServices.includes(item.id) && <Check className="w-2.5 h-2.5 inline ml-1" />}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Core Elements Section */}
                    <section>
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-emerald-500"></span>
                            핵심 요소
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
                                    {item.label}
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
                        설정 완료
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PreferencesPage;
