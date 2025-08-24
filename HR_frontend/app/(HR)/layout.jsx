// Your file path, e.g., app/(HR)/layout.jsx
import '../globals.css';
import React from 'react';
import Sidebar from './sidebar/sidebar.jsx'; 
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../../components/ThemeProvider';

export const metadata = {
  title: 'SJC summer camp',
  icons: {
    icon: '/assets/image/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Toaster position="top-right" />

          <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            
            {/* ✅ THIS IS THE CORRECT LAYOUT FOR A FIXED SIDEBAR */}
            {/* 
              - On mobile (default), there is no margin-left.
              - On medium screens and up (md:), a margin-left of 64 units (16rem, the width of the sidebar) is added.
              - This pushes the main content to the right, perfectly aligning it next to the fixed sidebar.
            */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
