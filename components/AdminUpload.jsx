import React, { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle, FileJson, Loader2, Lock, Trash2 } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore'; // Added deleteDoc
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

const AdminUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Auth State
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const ALLOWED_EMAIL = "aliceailab3@gmail.com";

    // Delete State
    const [deleteId, setDeleteId] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.email === ALLOWED_EMAIL) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                if (user) {
                    console.warn(`Unauthorized access attempt by: ${user.email}`);
                }
            }
            setCheckingAuth(false);
        });

        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccess(false);
            setProgress(null);
        }
    };

    const processAndUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setUploading(true);
        setError(null);
        setProgress("Initializing authentication...");

        try {
            if (!auth.currentUser || auth.currentUser.email !== ALLOWED_EMAIL) {
                throw new Error("Unauthorized. Please log in with the admin account.");
            }
        } catch (authErr) {
            console.error("Auth check failed:", authErr);
            setError("Authentication failed. " + authErr.message);
            setUploading(false);
            return;
        }

        setProgress("Reading file...");

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                console.log("File read. Parsing JSON...");
                const jsonData = JSON.parse(event.target.result);

                if (!Array.isArray(jsonData)) {
                    throw new Error("Invalid JSON format. Expected an array of news objects.");
                }

                console.log(`Parsed ${jsonData.length} records.`);
                setProgress(`Processing ${jsonData.length} records...`);

                const groupedData = {};
                jsonData.forEach(item => {
                    if (!item.publishedDate) {
                        console.warn("Item missing publishedDate:", item);
                        return;
                    }
                    const dateParts = item.publishedDate.split('-');
                    if (dateParts.length < 2) return;
                    const docId = `${dateParts[0]}-${dateParts[1]}`; // YYYY-MM
                    if (!groupedData[docId]) groupedData[docId] = [];
                    groupedData[docId].push(item);
                });

                const docIds = Object.keys(groupedData);
                if (docIds.length === 0) {
                    throw new Error("No valid dates found in data. Check 'publishedDate' field.");
                }

                console.log(`Uploading to documents: ${docIds.join(', ')}`);
                setProgress(`Uploading data to ${docIds.length} documents...`);

                for (const docId of docIds) {
                    const newsItems = groupedData[docId];
                    const docRef = doc(db, 'news_feeds', docId);

                    await setDoc(docRef, {
                        news: newsItems,
                        updatedAt: new Date().toISOString()
                    }, { merge: true });

                    console.log(`✅ Uploaded to ${docId}`);
                }

                setSuccess(true);
                setUploading(false);
                setProgress(null);
                setFile(null);
            } catch (err) {
                console.error("Upload failed:", err);
                if (err.code === 'permission-denied') {
                    setError("Permission Denied: Check Firestore Security Rules.");
                } else {
                    setError(err.message || "Failed to process data.");
                }
                setUploading(false);
            }
        };

        reader.onerror = () => {
            setError("Failed to read file.");
            setUploading(false);
        };

        reader.readAsText(file);
    };

    const handleDelete = async () => {
        if (!deleteId.trim()) return alert("Please enter a Document ID to delete.");

        if (!window.confirm(`⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE the document '${deleteId}'?\n\nThis action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'news_feeds', deleteId));
            alert(`✅ Document '${deleteId}' successfully deleted.`);
            setDeleteId('');
        } catch (e) {
            console.error("Delete failed:", e);
            alert(`❌ Delete failed: ${e.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-[#0f111a] flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <Lock className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
                <p className="text-slate-400 max-w-md">
                    This page is restricted to administrators only.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f111a] p-8 text-white flex flex-col items-center overflow-y-auto">
            <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Admin Data Dashboard
            </h1>

            <p className="text-sm text-slate-500 mb-8 flex items-center gap-2">
                <Lock className="w-3 h-3 text-green-500" />
                Authenticated as: <span className="text-blue-400 font-bold">{auth.currentUser?.email}</span>
            </p>

            {/* UPLOAD SECTION */}
            <div className="w-full max-w-xl bg-[#141724] rounded-2xl border border-white/10 p-8 shadow-2xl mb-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-blue-400" />
                    Upload News JSON
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Select Local JSON File
                        </label>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-400
                                file:mr-4 file:py-3 file:px-4
                                file:rounded-xl file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600/10 file:text-blue-400
                                hover:file:bg-blue-600/20
                                cursor-pointer border border-white/10 rounded-xl bg-white/5 p-2
                            "
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400">
                            <Check className="w-5 h-5 flex-shrink-0" />
                            <p>Successfully uploaded all data to Firestore!</p>
                        </div>
                    )}

                    {file && !uploading && !success && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                            <FileJson className="w-6 h-6 text-blue-400" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={processAndUpload}
                        disabled={!file || uploading}
                        className={`
                            w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2
                            ${uploading
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-900/20 active:scale-[0.98]'
                            }
                        `}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {progress || "Uploading..."}
                            </>
                        ) : (
                            "Start Upload"
                        )}
                    </button>
                </div>
            </div>

            {/* DELETE SECTION */}
            <div className="w-full max-w-xl bg-[#141724] rounded-2xl border border-red-500/20 p-8 shadow-2xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-400">
                    <Trash2 className="w-6 h-6" />
                    Delete News Data
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Target Document ID to Delete
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="e.g. 2026-01"
                                className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-red-500 placeholder-slate-600"
                                value={deleteId}
                                onChange={(e) => setDeleteId(e.target.value)}
                            />
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting || !deleteId.trim()}
                                className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/50 rounded-xl hover:bg-red-500/20 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            * Performs a hard delete on 'news_feeds/{'{docId}'}'. Cannot be undone.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-slate-500 text-sm">
                Target Collection: <span className="text-blue-400 font-mono">news_feeds</span>
            </div>
        </div>
    );
};

export default AdminUpload;
