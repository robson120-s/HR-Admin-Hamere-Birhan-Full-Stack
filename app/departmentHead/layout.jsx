import '../globals.css';
import React from 'react';
import Sidebar from './Sidebar'; 
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'SJC summer camp',
  icons: {
    icon: '/assets/image/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Toast notifications container */}
        <Toaster position="top-right" />

        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 flex-1 ml-64 p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
