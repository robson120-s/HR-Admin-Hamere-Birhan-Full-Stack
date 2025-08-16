'use client';
import React, { useState, useEffect } from 'react';
import { CalendarIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const userName = 'Jane Doe';
  const stats = {
    totalPresent: 120,
    totalAbsent: 10,
    lastSeen: '2025-07-30',
  };

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn relative">
      {/* Theme toggle button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:scale-110 transition"
        title="Toggle theme"
      >
        {darkMode ? (
          <SunIcon className="h-5 w-5 text-yellow-400" />
        ) : (
          <MoonIcon className="h-5 w-5 text-gray-800" />
        )}
      </button>

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Welcome, {userName}
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 text-center transition-all hover:scale-105">
          <h2 className="text-gray-500 dark:text-gray-300">Total Presents</h2>
          <p className="text-2xl font-bold text-green-600">{stats.totalPresent}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 text-center transition-all hover:scale-105">
          <h2 className="text-gray-500 dark:text-gray-300">Total Absents</h2>
          <p className="text-2xl font-bold text-red-500">{stats.totalAbsent}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 text-center transition-all hover:scale-105">
          <h2 className="text-gray-500 dark:text-gray-300">Last Attendance</h2>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{stats.lastSeen}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Quick Access</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/staff/attendanceHistory"
            className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all hover:scale-105"
          >
            <CalendarIcon className="h-5 w-5" />
            Attendance
          </a>
          <a
            href="/staff/profile"
            className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gray-700 text-white rounded hover:bg-gray-800 transition-all hover:scale-105"
          >
            <UserIcon className="h-5 w-5" />
            Profile
          </a>
          <a
            href="/staff/settings"
            className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-all hover:scale-105"
          >
            <CogIcon className="h-5 w-5" />
            Settings
          </a>
        </div>
      </div>
    </div>
  );
}
