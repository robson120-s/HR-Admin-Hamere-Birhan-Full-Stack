// /profile/page.jsx (for HR)
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiCamera, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiLinkedin, FiTwitter, FiFacebook, FiInstagram, FiMessageCircle } from "react-icons/fi";
import { useTheme } from "next-themes";
import { getHrProfile } from "../../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import { LoaderCircle, Sun, Moon } from "lucide-react";

// --- (SunIcon, MoonIcon, and ProfileDetail components can remain the same) ---

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const profileData = await getHrProfile();
      setUser(profileData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, [fetchProfile]);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-6 text-center text-red-500">Failed to load profile. Please try again.</div>;
  }

  const handleImageClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUser((prev) => ({ ...prev, photo: reader.result }));
      // In a real app, you would call an API here to save the new photo
      toast.success("Profile picture updated (UI only).");
    };
    reader.readAsDataURL(file);
  };

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="max-w-6xl mx-auto p-6 relative bg-slate-50 dark:bg-slate-900">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="...">
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-32"></div>

        <div className="flex flex-col items-center -mt-16 p-4 relative">
          <div className="relative">
            <img src={user.photo || `https://ui-avatars.com/api/?name=${fullName.replace(' ','+')}&background=22c55e&color=fff`} alt="Profile avatar" className="w-32 h-32 rounded-full ..."/>
            <button onClick={handleImageClick} className="..."><FiCamera /></button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
          <h1 className="text-3xl font-bold mt-4 ...">{fullName}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{user.position?.name || "N/A"}</p>
          <p className="text-md text-gray-500 dark:text-gray-500">{user.department?.name || "N/A"}</p>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Personal Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4 ..."><FiUser className="mr-2" /> Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ProfileDetail label="Employee ID" value={`EMP-${String(user.id).padStart(4, '0')}`} />
                <ProfileDetail label="Date of Joining" value={user.employmentDate ? new Date(user.employmentDate).toLocaleDateString() : 'N/A'} />
                <ProfileDetail label="Phone" value={user.phone} />
                <ProfileDetail label="Email" value={user.user?.email} />
              </div>
              <div className="space-y-4">
                <ProfileDetail label="Birthday" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'} />
                <ProfileDetail label="Address" value={`${user.address || ''}, ${user.subCity || ''}`} />
                <ProfileDetail label="Gender" value={user.sex} />
                 <ProfileDetail label="Marital Status" value={user.maritalStatus?.status} />
              </div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Emergency Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4 ..."><FiMessageCircle className="mr-2" /> Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Primary Contact</h3>
                <div className="space-y-2">
                  <ProfileDetail label="Name" value={user.emergencyContactName} />
                  <ProfileDetail label="Phone" value={user.emergencyContactPhone} />
                </div>
              </div>
              {/* Add secondary contact fields to your schema to display them here */}
            </div>
          </section>
          
          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Education & Financial */}
          <section>
            <h2 className="text-2xl font-bold mb-4 ...">Education & Financial</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileDetail label="Academic Qualification" value={user.academicQualification} />
                <ProfileDetail label="Educational Institution" value={user.educationalInstitution} />
                <ProfileDetail label="Salary" value={user.salary ? `$${parseFloat(user.salary).toFixed(2)}` : 'N/A'} />
                <ProfileDetail label="Account Number" value={user.accountNumber} />
              </div>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}


function ProfileDetail({ label, value, icon }) {
  return (
    <div className="flex items-start space-x-2">
      {icon && <span className="text-gray-500 dark:text-gray-400 mt-1">{icon}</span>}
      <div className="flex-1">
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-base text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </div>
  );
}