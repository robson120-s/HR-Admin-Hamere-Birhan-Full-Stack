'use client'
import React, { useState, useEffect } from 'react';

// Theme icons
function SunIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="orange" width={24} height={24}>
      <circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" />
      <path stroke="orange" strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" width={24} height={24}>
      <path
        stroke="purple"
        strokeWidth="2"
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
      />
    </svg>
  );
}

export default function AttendanceHistoryPage() {
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Simulate fetching attendance
    const tempData = [
      { date: '2025-07-30', status: 'Present' },
      { date: '2025-07-29', status: 'Absent' },
      { date: '2025-07-28', status: 'Present' },
    ];
    setHistory(tempData);
  }, []);

  return (
    <div className={theme === "dark" ? "min-h-screen bg-gray-900 text-white relative" : "min-h-screen bg-gray-50 text-black relative"}>
      {/* Theme icons at top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
      <div className="max-w-4xl mx-auto p-6">
        <div className={theme === "dark" ? "bg-gray-800 shadow rounded-lg p-6" : "bg-white shadow rounded-lg p-6"}>
          <h2 className="text-xl font-semibold mb-4">📅 Attendance History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className={theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"}>
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index} className={theme === "dark" ? "border-b border-gray-700 hover:bg-gray-900" : "border-b hover:bg-gray-50"}>
                    <td className="px-4 py-2">{entry.date}</td>
                    <td className={`px-4 py-2 font-medium ${entry.status === 'Present' ? 'text-green-600' : 'text-red-500'}`}>
                      {entry.status}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-4 py-4 text-center text-gray-500">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}