import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Import i18n config

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check for Admin Mode
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);




