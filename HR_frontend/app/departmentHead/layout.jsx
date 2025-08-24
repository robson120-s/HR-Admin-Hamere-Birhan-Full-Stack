// /departmentHead/layout.jsx (or your file path)
import '../globals.css';
import React from 'react';
import Sidebar from './Sidebar'; 
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../../components/ThemeProvider'; // Assuming a shared provider

export const metadata = {
  title: 'SJC Summer Camp - Dept. Head',
  icons: {
    icon: '/assets/image/logo.png', // Corrected path assumption
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {/* Toast notifications container */}
          <Toaster position="top-right" />

          <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            {/* 
              This is the corrected main content area.
              - No margin-left on mobile.
              - A 64-unit (16rem) margin-left on medium screens and up to make space for the sidebar.
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