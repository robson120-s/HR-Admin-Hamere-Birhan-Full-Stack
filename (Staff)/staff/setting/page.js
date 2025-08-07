'use client';
import React, { useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';

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

export default function SettingsPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [theme, setTheme] = useState("light");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // TODO: Backend call
    alert('Password updated successfully!');
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
      <div className="max-w-xl mx-auto p-6 animate-fadeIn">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: theme === "dark" ? "#fff" : "#1f2937" }}>
          <LockClosedIcon className="h-6 w-6 text-gray-600" />
          Account Settings
        </h1>

        <div className={theme === "dark" ? "bg-gray-800 shadow rounded-lg p-6" : "bg-white shadow rounded-lg p-6"}>
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-all hover:scale-105"
            >
              Update Password
            </button>
          </form>
        </div>

        <div className={theme === "dark" ? "mt-6 bg-gray-800 shadow rounded-lg p-6" : "mt-6 bg-white shadow rounded-lg p-6"}>
          <h2 className="text-lg font-semibold mb-2">🔔 Notification Settings</h2>
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>Coming soon: Customize email and SMS preferences.</p>
        </div>
      </div>
    </div>
  );
}