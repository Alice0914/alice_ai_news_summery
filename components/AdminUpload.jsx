import React, { useState } from 'react';
import { Upload, Check, AlertCircle, FileJson, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AdminUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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

        // Ensure user is authenticated before trying to upload
        try {
            const { ensureLoggedIn } = require('../firebaseConfig');
            await ensureLoggedIn();
            console.log("Details: Auth confirmed.");
        } catch (authErr) {
            console.error("Auth check failed:", authErr);
            // We'll proceed but it might fail if rules require auth
            setError("Authentication failed. Check console.");
        }

        setProgress("Reading file...");

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                console.log("File read successfully. Parsing JSON...");
                const jsonData = JSON.parse(event.target.result);

                if (!Array.isArray(jsonData)) {
                    throw new Error("Invalid JSON format. Expected an array of objects.");
                }

                console.log(`Parsed ${jsonData.length} records.`);
                setProgress(`Processing ${jsonData.length} records...`);

                // Group by Year-Month
                const groupedData = {};

                jsonData.forEach(item => {
                    if (!item.publishedDate) {
                        console.warn("Item missing publishedDate:", item);
                        return;
                    }
                    // Assuming publishedDate is "YYYY-MM-DD"
                    const dateParts = item.publishedDate.split('-');
                    if (dateParts.length < 2) return;

                    const key = `${dateParts[0]}-${dateParts[1]}`; // YYYY-MM

                    if (!groupedData[key]) {
                        groupedData[key] = [];
                    }
                    groupedData[key].push(item);
                });

                const months = Object.keys(groupedData);
                console.log(`Grouped into ${months.length} months:`, months);
                setProgress(`Found data for ${months.length} months. Uploading...`);

                if (months.length === 0) {
                    setError("No valid data found (check publishedDate format).");
                    setUploading(false);
                    return;
                }

                for (const month of months) {
                    const newsItems = groupedData[month];
                    const docRef = doc(db, 'news_data', month);

                    console.log(`Uploading ${newsItems.length} items to ${docRef.path}...`);

                    // Upload grouped data
                    await setDoc(docRef, {
                        news: newsItems,
                        updatedAt: new Date().toISOString()
                    }, { merge: true }); // Merge ensures we update/add to existing without wiping unrelated fields if any

                    console.log(`✅ Uploaded ${month}`);
                }

                setSuccess(true);
                setUploading(false);
                setProgress(null);
                setFile(null); // Reset file input
            } catch (err) {
                console.error("Upload error full details:", err);
                // Check for common permission error
                if (err.code === 'permission-denied') {
                    setError("Permission Denied: You do not have permission to write to 'news_data'. Check Firestore Security Rules.");
                } else {
                    setError(err.message || "Failed to parse or upload data.");
                }
                setUploading(false);
            }
        };

        reader.onerror = (e) => {
            console.error("File read error:", e);
            setError("Failed to read file.");
            setUploading(false);
        };

        reader.readAsText(file);
    };

    return (
        <div className="bg-[#141724] rounded-2xl border border-white/10 p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-400" />
                Upload News Data
            </h2>

            <div className="max-w-xl">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                        Select JSON File
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-neutral-400
                file:mr-4 file:py-3 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600/10 file:text-blue-400
                hover:file:bg-blue-600/20
                cursor-pointer border border-white/10 rounded-xl bg-white/5
              "
                        />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                        Format: Array of news objects. Date field must be "publishedDate": "YYYY-MM-DD".
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-400 animate-in fade-in slide-in-from-top-2">
                        <Check className="w-5 h-5 flex-shrink-0" />
                        <p>Data successfully uploaded to Firestore!</p>
                    </div>
                )}

                {file && !uploading && !success && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <FileJson className="w-6 h-6 text-blue-400" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={processAndUpload}
                    disabled={!file || uploading}
                    className={`
            w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2
            ${uploading
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
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
                        <>
                            <Upload className="w-5 h-5" />
                            Start Upload
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdminUpload;
