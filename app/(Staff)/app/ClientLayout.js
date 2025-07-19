'use client';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { Moon, Sun } from 'lucide-react';

export default function ClientLayout({ children }) {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
    
      {sidebarOpen && <Sidebar />}

      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-full"
        style={{
          backgroundColor: 'var(--menu-hover-bg)',
          color: 'var(--foreground)',
        }}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>

    
  );
  
}
