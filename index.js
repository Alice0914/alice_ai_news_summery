import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Import i18n config

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check for Admin Mode
const isAdminMode = process.env.ADMIN_MODE === true;
let AdminApp = null;

if (isAdminMode) {
    // Dynamically require AdminApp to avoid bundling it in the main app if possible,
    // though typically checking process.env.ADMIN_MODE at build time via DefinePlugin allows for tree shaking of dead code.
    // For simplicity import at top level isn't ideal for splitting, but for this setup:
    AdminApp = require('./AdminApp').default;
    console.log("AdminApp", AdminApp);
} else {
    console.log("App", App);
}

root.render(
    <React.StrictMode>
        {isAdminMode ? <AdminApp /> : <App />}
    </React.StrictMode>
);




