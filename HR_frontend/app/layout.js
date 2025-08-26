// app/layout.jsx
import './globals.css';
import React from 'react';
import { ThemeProvider } from '../components/ThemeProvider'; // Assuming this is your custom provider wrapper

// This is the metadata for the entire application.
export const metadata = {
  title: {
    default: 'SJC Summer Camp HRMS',
    template: '%s | SJC Summer Camp HRMS', // Page titles will look like "Dashboard | SJC Summer Camp HRMS"
  },
  description: 'Human Resources Management System for SJC Summer Camp.',
  icons: {
    icon: '/assets/image/logo.png', // Main site icon
  },
};

// This is the ROOT layout. It MUST contain the <html> and <body> tags.
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* The ThemeProvider wraps EVERYTHING, ensuring the theme is available to all pages. */}
        <ThemeProvider>
          {/*
            The `children` prop here will be your nested layouts 
            (like DepartmentHeadLayout) or your page components.
          */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}