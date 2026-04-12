import React, { useState, useEffect } from 'react';
import UserApp from './pages/UserApp';
import AdminApp from './AdminApp';

const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/admin') {
    return <AdminApp />;
  }

  return <UserApp />;
};

export default App;
