'use client';
import React from 'react';
import { CalendarIcon, UserIcon, CogIcon} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const userName = 'Jane Doe';
  const stats = {
    totalPresent: 120,
    totalAbsent: 10,
    lastSeen: '2025-07-30',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {userName}</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-8">
        <div className="bg-white shadow rounded-lg p-5 text-center transition-all hover:scale-105">
          <h2 className="text-gray-500">Total Presents</h2>
          <p className="text-2xl font-bold text-green-600">{stats.totalPresent}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-5 text-center transition-all hover:scale-105">
          <h2 className="text-gray-500">Total Absents</h2>
          <p className="text-2xl font-bold text-red-500">{stats.totalAbsent}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-5 text-center transition-all hover:scale-105">
          <h2 className="text-gray-500">Last Attendance</h2>
          <p className="text-lg font-semibold text-gray-800">{stats.lastSeen}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/intern/attendanceHistory" className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all hover:scale-105">
            <CalendarIcon className="h-5 w-5" />
            Attendance
          </a>
          <a href="/intern/profile" className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gray-700 text-white rounded hover:bg-gray-800 transition-all hover:scale-105">
            <UserIcon className="h-5 w-5" />
            Profile
          </a>
          <a href="/intern/settings" className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-all hover:scale-105">
            <CogIcon className="h-5 w-5" />
            Settings
          </a>
          <a href="/intern/performance" className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-all hover:scale-105">
            <CogIcon className="h-5 w-5" />
            performance
          </a>
          <a href="/intern/complaints" className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-all hover:scale-105">
            <CogIcon className="h-5 w-5" />
            complaints
          </a>
        </div>
      </div>
    </div>
  );
}
