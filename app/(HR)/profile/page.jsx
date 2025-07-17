"use client";
import React, { useState, useEffect, useRef } from "react";
import { FiCamera } from "react-icons/fi";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
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

  if (!user) {
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
    <div className="max-w-4xl mx-auto p-6">
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
