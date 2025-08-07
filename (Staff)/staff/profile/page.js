'use client';
import React, { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

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

export default function ProfilePage() {
  const [theme, setTheme] = useState("light");
  const user = {
    username: 'janedoe',
    fullName: 'Jane Doe',
    baptismalName: 'Mariamawit',
    email: 'jane@example.com',
    phone: '+1234567890',
    address: '123 Main St, New York',
    subcity: 'Manhattan',
    department: 'Engineering',
    role: 'Frontend Developer',
    maritalStatusId: 'Single',
    sex: 'Female',
    nationality: 'Ethiopian',
    dateBirth: '1995-04-10',
    joined: '2023-06-15',
    salary: '$60,000/year',
    location: 'New York Office',
    empId: 'EMP2025-003',
  };

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
      <div className="max-w-3xl mx-auto p-6 animate-fadeIn">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: theme === "dark" ? "#fff" : "#1f2937" }}>
          <UserCircleIcon className="h-7 w-7 text-blue-600" />
          Your Profile
        </h1>
        <div className={theme === "dark" ? "bg-gray-800 shadow rounded-lg p-6 space-y-4" : "bg-white shadow rounded-lg p-6 space-y-4"}>
          {Object.entries(user).map(([label, value]) => (
            <div key={label} className="flex justify-between border-b py-2">
              <span className={theme === "dark" ? "text-gray-300 capitalize" : "text-gray-600 capitalize"}>
                {label.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className={theme === "dark" ? "font-medium text-white" : "font-medium text-gray-900"}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}