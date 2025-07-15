"use client";
import React, { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Temporary mock data
    const fakeUser = {
      name: "John Doe",
      email: "john.doe@example.com",
      photoUrl: "https://ui-avatars.com/api/?name=John+Doe", // Avatar generator
      role: "Administrator",
      phone: "+1 234 567 890",
      bio: "I love building apps and leading teams.",
    };

    setTimeout(() => {
      setUser(fakeUser);
    }, 500);
  }, []);

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex flex-col items-center bg-white shadow rounded-lg p-6">
        <img
          src={user.photoUrl}
          alt="Profile avatar"
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-green-600"
        />
        <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
        <p className="text-gray-500 mb-2">{user.email}</p>

        <div className="w-full mt-4 space-y-2 text-left">
          <p><span className="font-semibold">Role:</span> {user.role}</p>
          <p><span className="font-semibold">Phone:</span> {user.phone}</p>
          <p><span className="font-semibold">Bio:</span> {user.bio}</p>
        </div>
      </div>
    </div>
  );
}
