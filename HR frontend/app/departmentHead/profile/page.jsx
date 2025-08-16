"use client";
import React, { useState, useEffect, useRef } from "react";
import { FiCamera, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiLinkedin, FiTwitter, FiFacebook, FiInstagram, FiMessageCircle } from "react-icons/fi";
import { useTheme } from "next-themes";

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
      <path stroke="purple" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
  );
}

export default function DepartmentHeadProfilePage() {
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fakeUser = {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      photoUrl: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=8B5CF6&color=fff",
      designation: "Engineering Department",
      position: "Department Head",
      employeeId: "DH-0001",
      dateOfJoining: "15 03 2023",
      phone: "+1(555) 123 4567",
      birthday: "12 April 1985",
      address: "456 Innovation Drive, Tech City, CA 90210, United States",
      gender: "Female",
      emergencyContacts: {
        primary: { name: "Michael Johnson", relationship: "Spouse", phone: "9876543210", email: "michael@example.com", address: "456 Innovation Drive, Tech City" },
        secondary: { name: "Emily Johnson", relationship: "Daughter", phone: "9876543211", email: "emily@example.com", address: "456 Innovation Drive, Tech City" }
      },
      education: [
        { institution: "Stanford University", degree: "MSc in Computer Engineering", period: "2003 - 2005" },
        { institution: "MIT", degree: "BSc in Electrical Engineering", period: "1999 - 2003" }
      ],
      experience: [
        { company: "TechCorp Inc, San Francisco", position: "Senior Engineering Manager", period: "2018 - Present" },
        { company: "Innovation Labs, Seattle", position: "Lead Software Engineer", period: "2012 - 2018" },
        { company: "StartupXYZ, Austin", position: "Software Engineer", period: "2008 - 2012" }
      ],
      bankAccount: { accountHolder: "Sarah Johnson", accountNumber: "987654321", bankName: "TechBank", branch: "San Francisco Branch", swiftCode: "TECHUS44" },
      passport: { number: "B9876543", nationality: "American", issueDate: "20 June 2018", expiryDate: "20 June 2028", scanCopy: "https://example.com/passport-scan-sarah.pdf" },
      socialProfiles: { linkedin: "Sarah Johnson", twitter: "SarahTech", facebook: "Sarah Johnson", instagram: "sarah_tech", whatsapp: "+1(555) 123 4567" }
    };

    setTimeout(() => setUser(fakeUser), 500);
  }, []);

  if (!mounted || !user) return <div className="p-6">Loading profile...</div>;

  const handleImageClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUser((prev) => ({ ...prev, photoUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-32"></div>

        <div className="flex flex-col items-center -mt-16 p-4 relative">
          <div className="relative">
            <img src={user.photoUrl} alt="Profile avatar" className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg" />
            <button onClick={handleImageClick} className="absolute bottom-2 right-2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition-colors">
              <FiCamera className="w-5 h-5" />
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
          <h1 className="text-3xl font-bold mt-4 text-gray-900 dark:text-gray-100">{user.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{user.designation}</p>
          <p className="text-md text-gray-500 dark:text-gray-500">{user.position}</p>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Personal Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
              <FiUser className="mr-2" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ProfileDetail label="Employee ID" value={user.employeeId} icon={<FiUser />} />
                <ProfileDetail label="Date of Joining" value={user.dateOfJoining} icon={<FiCalendar />} />
                <ProfileDetail label="Phone" value={user.phone} icon={<FiPhone />} />
                <ProfileDetail label="Email" value={user.email} icon={<FiMail />} />
              </div>
              <div className="space-y-4">
                <ProfileDetail label="Birthday" value={user.birthday} icon={<FiCalendar />} />
                <ProfileDetail label="Address" value={user.address} icon={<FiMapPin />} />
                <ProfileDetail label="Gender" value={user.gender} icon={<FiUser />} />
              </div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Emergency Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
              <FiMessageCircle className="mr-2" /> Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">Primary Contact</h3>
                <div className="space-y-2">
                  <ProfileDetail label="Name" value={user.emergencyContacts.primary.name} />
                  <ProfileDetail label="Relationship" value={user.emergencyContacts.primary.relationship} />
                  <ProfileDetail label="Phone" value={user.emergencyContacts.primary.phone} />
                  <ProfileDetail label="Email" value={user.emergencyContacts.primary.email} />
                  <ProfileDetail label="Address" value={user.emergencyContacts.primary.address} />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">Secondary Contact</h3>
                <div className="space-y-2">
                  <ProfileDetail label="Name" value={user.emergencyContacts.secondary.name} />
                  <ProfileDetail label="Relationship" value={user.emergencyContacts.secondary.relationship} />
                  <ProfileDetail label="Phone" value={user.emergencyContacts.secondary.phone} />
                  <ProfileDetail label="Email" value={user.emergencyContacts.secondary.email} />
                  <ProfileDetail label="Address" value={user.emergencyContacts.secondary.address} />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Education */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Education Qualification</h2>
            <div className="space-y-4">
              {user.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{edu.institution}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{edu.degree}</p>
                  <p className="text-gray-500 dark:text-gray-500">{edu.period}</p>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Experience */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Experience Details</h2>
            <div className="space-y-4">
              {user.experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{exp.company}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{exp.position}</p>
                  <p className="text-gray-500 dark:text-gray-500">{exp.period}</p>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Bank Account */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Bank Account</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileDetail label="Account Holder Name" value={user.bankAccount.accountHolder} />
                <ProfileDetail label="Account Number" value={user.bankAccount.accountNumber} />
                <ProfileDetail label="Bank Name" value={user.bankAccount.bankName} />
                <ProfileDetail label="Branch" value={user.bankAccount.branch} />
                <ProfileDetail label="SWIFT Code" value={user.bankAccount.swiftCode} />
              </div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Passport */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Passport Information</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileDetail label="Passport Number" value={user.passport.number} />
                <ProfileDetail label="Nationality" value={user.passport.nationality} />
                <ProfileDetail label="Issue Date" value={user.passport.issueDate} />
                <ProfileDetail label="Expiry Date" value={user.passport.expiryDate} />
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Scan Copy</p>
                  <a href={user.passport.scanCopy} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    View Passport Scan
                  </a>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Social Profile */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Social Profile</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileDetail label="LinkedIn" value={user.socialProfiles.linkedin} icon={<FiLinkedin />} />
                <ProfileDetail label="Twitter" value={user.socialProfiles.twitter} icon={<FiTwitter />} />
                <ProfileDetail label="Facebook" value={user.socialProfiles.facebook} icon={<FiFacebook />} />
                <ProfileDetail label="Instagram" value={user.socialProfiles.instagram} icon={<FiInstagram />} />
                <ProfileDetail label="WhatsApp" value={user.socialProfiles.whatsapp} icon={<FiMessageCircle />} />
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
