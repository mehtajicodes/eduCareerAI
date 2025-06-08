'use client';

import { useState } from 'react';

export const WalletButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const handleAuth = () => {
    if (isAuthenticated) {
      localStorage.removeItem('authUser');
      setIsAuthenticated(false);
      setUsername('');
    } else {
      const user = prompt('Enter your username:');
      if (user) {
        localStorage.setItem('authUser', user);
        setIsAuthenticated(true);
        setUsername(user);
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
    >
      {isAuthenticated ? `Logged in as ${username}` : 'Login'}
    </button>
  );
};