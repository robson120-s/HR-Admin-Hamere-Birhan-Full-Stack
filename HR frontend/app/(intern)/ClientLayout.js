'use client';
import { useEffect, useState } from 'react';
import Sidebar from './intern/Sidebar.jsx'; 
import { Moon, Sun } from 'lucide-react';

export default function ClientLayout({ children }) {
  
  const [sidebarOpen, setSidebarOpen] = useState(true);




  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
    
      {sidebarOpen && <Sidebar />}

   

      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>

    
  );
  
}
