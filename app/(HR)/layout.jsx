import './globals.css';
import React from 'react';
import Sidebar from './sidebar/sidebar.jsx'; // ✅ adjust to match your filename

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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
