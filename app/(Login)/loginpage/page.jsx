"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState("HR");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    alert(`Logging in as ${role} with name ${name}`);

    if (role === "HR") {
      router.push("/dashboard");
    } else if (role === "admin") {
      router.push("/admin");
    } else if (role === "staff") {
      router.push("/staff");
    } else if (role === "departmentHead") {
      router.push("/departmentHead");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Theme toggle button at top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Left Side - Promo (desktop only) */}
      <div
  className="hidden md:flex w-1/2 relative text-black flex-col justify-center items-center p-8 bg-cover bg-center"
  style={{ backgroundImage: "url('/banner.webp')" }}
>
  {/* Blur overlay */}
  <div className="absolute inset-0 bg-cover bg-center blur-sm" style={{ backgroundImage: "url('/banner.webp')" }}></div>

  {/* Content stays sharp */}
  <div className="relative z-10 flex flex-col items-center">
    <Image
      src="/assets/images/logo.jpg"
      alt="Logo"
      width={120}
      height={120}
      className="rounded-full"
    />
    <h1 className="text-3xl font-bold mt-6 text-center">
      Welcome to SJC Summer Camp HRMS
    </h1>
    <p className="mt-4 text-lg max-w-md text-center">
      Manage attendance, departments, and reports easily with our smart HR
      management system.
    </p>
  </div>
</div>



      {/* Right Side - Login Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white dark:bg-gray-900 p-6 md:p-12">
  <div className="w-full max-w-md">
    {/* Logo for mobile */}
    <div className="flex flex-col items-center mb-8 md:hidden">
      <Image
        src="/assets/images/logo.png"
        alt="Logo"
        width={100}
        height={100}
        className="rounded-full"
      />
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-4">
        SJC Summer Camp HRMS
      </h1>
    </div>

    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
      Login
    </h2>

    {error && (
      <div className="mb-4 text-red-600 dark:text-red-400 text-sm text-center">
        {error}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Username</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
          placeholder="Enter your username"
        />
      </div>

      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
          placeholder="Enter your password"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Select Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="HR">HR</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="departmentHead">Department Head</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
      >
        Login
      </button>
    </form>

    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      © 2025 SJC Summer Camp HRMS
    </p>
  </div>
</div>

    </div>
  );
}