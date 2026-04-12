import React, { useState, useEffect } from 'react';
import { Shield, BarChart2, Upload, AlertTriangle } from 'lucide-react';
import AdminStats from './components/admin/AdminStats';
import AdminUpload from './components/admin/AdminUpload';

const AdminApp = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [isLocalhost, setIsLocalhost] = useState(false);

    useEffect(() => {
        // strict localhost check
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        setIsLocalhost(isLocal);
    }, []);

    if (!isLocalhost) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white p-4">
                <div className="max-w-md text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-neutral-400">Admin tools are only accessible from localhost.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f111a] text-white font-sans">
            <header className="border-b border-white/10 bg-[#141724]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight">Admin Tools</h1>
                    </div>
                    <div className="text-xs font-mono text-neutral-500">
                        LOCAL_ADMIN_MODE
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="col-span-3">
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'stats'
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <BarChart2 className="w-5 h-5" />
                                Visitor Stats
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'upload'
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Upload className="w-5 h-5" />
                                Upload News Data
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="col-span-9">
                        {activeTab === 'stats' && <AdminStats />}
                        {activeTab === 'upload' && <AdminUpload />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminApp;
