import React from 'react';

const GlobalStyles = () => (
  <style>{`
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
    
    * { box-sizing: border-box; }
    
    body {
      font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    .theme-dark {
      background: #0B0B15;
      color: #ffffff;
      min-height: 100vh;
    }

    .gradient-card-btn {
      background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
      border: 1px solid rgba(139, 92, 246, 0.5);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: white;
    }
    
    .gradient-card-btn:active {
      transform: scale(0.98);
      opacity: 0.9;
    }

    .gradient-card-btn.unselected {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.95);
    }

    .start-button-gradient {
      background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    }

    .theme-light {
      background-color: #F8F9FD;
      color: #111111;
      min-height: 100vh;
    }

    .news-card-blue {
      background: #FFFFFF;
      border-radius: 16px;
      transition: all 0.2s ease;
    }

    .news-card-blue.collapsed {
      border: 1px solid rgba(30, 41, 59, 0.2);
      box-shadow: 0 4px 6px rgba(30, 41, 59, 0.03);
    }

    .news-card-blue.expanded {
      border: 1px solid #3B82F6;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
    }
    
    .news-card-blue:active {
      transform: scale(0.99);
    }

    .pill-badge {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      font-weight: 700;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }

    .modal-overlay {
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
    }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    .fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `}</style>
);

export default GlobalStyles;