"use client";
import React, { useState, useEffect, useRef } from "react";
import { FiCamera } from "react-icons/fi";
import { useTheme } from "next-themes";

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
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  // Theme state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mock user data
    const fakeUser = {
      name: "John Doe",
      email: "john.doe@example.com",
      photoUrl: "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff",
      role: "Administrator",
      phone: "+1 234 567 890",
      bio: "Passionate about technology, mentoring, and building great products.",
    };

    setTimeout(() => {
      setUser(fakeUser);
    }, 500);
  }, []);

  if (!mounted || !user) {
    return <div className="p-6">Loading profile...</div>;
  }

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser((prev) => ({
        ...prev,
        photoUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
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
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-32"></div>

        <div className="flex flex-col items-center -mt-16 p-4 relative">
          <div className="relative">
            <img
              src={user.photoUrl}
              alt="Profile avatar"
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
            />
            <button
              onClick={handleImageClick}
              className="absolute bottom-2 right-2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
            >
              <FiCamera className="w-5 h-5" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-gray-100">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>

        <div className="px-6 py-4 space-y-3">
          <ProfileDetail label="Role" value={user.role} />
          <ProfileDetail label="Phone" value={user.phone} />
          <ProfileDetail label="Bio" value={user.bio} />
        </div>
      </div>
    </div>
  );
}

function ProfileDetail({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-base text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}