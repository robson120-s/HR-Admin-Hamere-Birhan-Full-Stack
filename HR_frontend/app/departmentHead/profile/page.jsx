// /departmentHead/profile/page.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { getMyProfile } from "../../../lib/api"; // Adjust path
import toast from "react-hot-toast";
import { 
    LoaderCircle, Sun, Moon, User, Mail, Phone, Building, Briefcase, Calendar, DollarSign,
    Heart, Shield, FileText, Camera, GraduationCap, Banknote, Siren, Cross
} from "lucide-react";

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

function ProfileDetail({ label, value, icon }) {
  if (!value) return null; // Don't render the field if the value is empty
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 text-slate-500 dark:text-slate-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-base text-slate-800 dark:text-slate-200 break-words">{value}</p>
      </div>
    </div>
  );
}

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function DepartmentHeadProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
        const profileData = await getMyProfile();
        setUserProfile(profileData);
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
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
            <LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" />
        </div>
    );
  }

  if (!userProfile) {
      return <div className="p-6 text-center text-red-500">Failed to load profile. Please try again.</div>;
  }

  const handleImageClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    // ... (UI-only photo update logic remains the same) ...
  };
  
  const fullName = `${userProfile.firstName} ${userProfile.lastName}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative bg-slate-50 dark:bg-slate-900">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-full ...">
          {theme === "dark" ? <Sun/> : <Moon />}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-40"></div>

        <div className="flex flex-col items-center -mt-20 p-4 relative">
          <div className="relative">
            <img 
                src={userProfile.photo || "/images/default-avatar.png"}
                alt="Profile avatar" 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-lg" 
            />
            <button onClick={handleImageClick} className="..." title="Change profile picture">
              <Camera className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
          <h1 className="text-3xl font-bold mt-4 text-gray-900 dark:text-gray-100">{fullName}</h1>
          <p className="text-lg text-indigo-600 dark:text-indigo-400 font-semibold">{userProfile.position?.name || "N/A"}</p>
          <p className="text-md text-gray-500 dark:text-gray-400">{userProfile.department?.name || "N/A"}</p>
        </div>

        <div className="px-6 py-6 space-y-8">
          
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><User /> Personal & Family</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              <ProfileDetail label="First Name" value={userProfile.firstName} />
              <ProfileDetail label="Last Name" value={userProfile.lastName} />
              <ProfileDetail label="Baptismal Name" value={userProfile.baptismalName} />
              <ProfileDetail label="Birthday" value={userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'N/A'} />
              <ProfileDetail label="Gender" value={userProfile.sex} />
              <ProfileDetail label="Nationality" value={userProfile.nationality} />
              <ProfileDetail label="Marital Status" value={userProfile.maritalStatus?.status} />
              <ProfileDetail label="Repentance Father" value={userProfile.repentanceFatherName} />
              <ProfileDetail label="Father's Church" value={userProfile.repentanceFatherChurch} />
              <ProfileDetail label="Father's Phone" value={userProfile.repentanceFatherPhone} />
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Phone /> Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              <ProfileDetail label="Email" value={userProfile.user?.email} />
              <ProfileDetail label="Phone" value={userProfile.phone} />
              <ProfileDetail label="Address" value={userProfile.address} />
              <ProfileDetail label="Sub-City" value={userProfile.subCity} />
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Siren /> Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                <ProfileDetail label="Contact Name" value={userProfile.emergencyContactName} />
                <ProfileDetail label="Contact Phone" value={userProfile.emergencyContactPhone} />
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Briefcase /> Employment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
              <ProfileDetail label="Employee ID" value={`EMP-${String(userProfile.id).padStart(4, '0')}`} />
              <ProfileDetail label="Date of Joining" value={userProfile.employmentDate ? new Date(userProfile.employmentDate).toLocaleDateString() : 'N/A'} />
              <ProfileDetail label="Employment Type" value={userProfile.employmentType?.type} />
              <ProfileDetail label="Job Status" value={userProfile.jobStatus?.status} />
              <ProfileDetail label="Agreement Status" value={userProfile.agreementStatus?.status} />
            </div>
          </section>
          
          <hr className="border-gray-200 dark:border-gray-700" />

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><GraduationCap /> Education & Financials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                <ProfileDetail label="Academic Qualification" value={userProfile.academicQualification} />
                <ProfileDetail label="Institution" value={userProfile.educationalInstitution} />
                <ProfileDetail label="Salary" value={`$${parseFloat(userProfile.salary).toFixed(2)}`} />
                <ProfileDetail label="Bonus" value={`$${parseFloat(userProfile.bonusSalary).toFixed(2)}`} />
                <ProfileDetail label="Account Number" value={userProfile.accountNumber} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}