import React, { useState, useEffect } from 'react';
import { getCountFromServer, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Users, AlertCircle } from 'lucide-react';

const AdminStats = () => {
    const [visitorCount, setVisitorCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const coll = collection(db, 'user_log');
                const snapshot = await getCountFromServer(coll);
                setVisitorCount(snapshot.data().count);
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError("Failed to load visitor statistics. Check console for details.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="bg-[#141724] rounded-2xl border border-white/10 p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                Visitor Statistics
            </h2>

            {loading && (
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-white/5 rounded w-1/4"></div>
                    <div className="h-12 bg-white/5 rounded w-1/2"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                        <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider mb-2">Total Visitors</p>
                        <div className="text-4xl font-extrabold text-blue-400">
                            {visitorCount !== null ? visitorCount.toLocaleString() : '-'}
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">
                            All time unique access logs
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStats;
