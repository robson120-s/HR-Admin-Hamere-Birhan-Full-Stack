// /departmentHead/layout.jsx
import '../globals.css';
import React from 'react';
import Sidebar from './Sidebar'; 
import { Toaster } from 'react-hot-toast';

// Metadata can be defined here and will be merged with the root layout's metadata.
export const metadata = {
  title: 'SJC Summer Camp - Dept. Head',
};

// This is a NESTED layout, so it does NOT include <html> or <body> tags.
export default function DepartmentHeadLayout({ children }) {
  return (
    <>
      {/* 
        The Toaster can be placed here or in the root layout.
        Placing it here is fine if only this section needs toasts.
      */}
      <Toaster position="top-right" />

      <div className="flex min-h-screen">
        <Sidebar />
        
        {/* 
          This main content area correctly creates space for the sidebar
          on medium screens and up.
        */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64">
          {children}
        </main>
      </div>
    </>
  );
}