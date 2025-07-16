'use client';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { Moon, Sun, Menu } from 'lucide-react';

export default function ClientLayout({ children }) {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex">
      {/* Sidebar (show/hide) */}
      {sidebarOpen && <Sidebar />}

      <main
        className="flex-1 p-6"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <div className="flex justify-between mb-4">
          {/* 📋 Menu button (ALWAYS visible) */}
          <button
            onClick={toggleSidebar}
            className="p-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
          >
            <Menu size={20} />
          </button>

          {/* 🌗 Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
