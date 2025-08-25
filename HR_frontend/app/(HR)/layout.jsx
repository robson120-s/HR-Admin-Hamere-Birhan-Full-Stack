// app/(HR)/layout.jsx
import '../globals.css';
import React from 'react';
import Sidebar from './sidebar/sidebar.jsx'; 
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../../components/ThemeProvider'; // Assuming a shared provider

// Note: Metadata is usually defined in the root layout or the page,
// but it's okay to have it here to be applied to all pages within this layout.
export const metadata = {
  title: 'SJC Summer Camp - HR',
  icons: {
    icon: '/assets/image/logo.png', // Corrected path assumption
  },
};

export default function HrRootLayout({ children }) {
  // This is a nested layout, so we do NOT render <html> or <body> tags here.
  // We only render the components specific to this layout section.
  return (
    <ThemeProvider>
      {/* Toast notifications container */}
      <Toaster position="top-right" />

      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        
        {/* 
          This is the corrected main content area for a fixed sidebar.
          - On mobile (default), there is no margin-left.
          - On medium screens and up (md:), a margin-left of 64 units (16rem) is added
            to make space for the permanently visible sidebar.
        */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}