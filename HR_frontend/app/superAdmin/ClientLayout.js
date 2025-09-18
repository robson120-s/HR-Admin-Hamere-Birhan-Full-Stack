'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar'; // Adjust path if necessary

export default function ClientLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />

      {/* Main content area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
          ${isMobileSidebarOpen ? 'ml-0' : 'ml-0' /* On mobile, sidebar overlays, so no margin push */}
          p-4 md:p-6`}
      >
        {children}
      </div>
    </div>
  );
}