// /departmentHead/Sidebar.jsx (or your file path)
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // To track the current page
import {
  Home,
  Calendar,
  LineChart,
  CheckCircle2,
  AlertCircle,
  Settings,
  LogOut,
  Users,
  CalendarOff,
} from "lucide-react";
import { FiDollarSign } from "react-icons/fi";

// Main Sidebar Component
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 m-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 fixed top-2 left-2 z-50"
        aria-label="Toggle Sidebar"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile view */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full bg-green-900 border-r border-green-800 shadow-xl p-4 w-64 text-white flex flex-col
                   transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out
                   md:translate-x-0 z-40
                   scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-green-900`}
      >
        {/* Header/Logo Section */}
        <div className="flex items-center gap-3 p-2 border-b border-white/20 pb-4">
          <Image
            src="/logo.png" // Ensure this path is correct in your `public` folder
            alt="Logo"
            width={48}
            height={48}
            className="rounded-full border-2 border-green-700"
          />
          <span className="text-sm font-bold leading-tight">
            ቅዱስ ዮሐንስ አፈወርቅ <br />
            የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col space-y-1 mt-6 overflow-y-auto">
          <SidebarLink href="/departmentHead" icon={<Home size={18} />} label="Dashboard" />
          <SidebarLink href="/departmentHead/editAttendance" icon={<Calendar size={18} />} label="Mark Attendance" />
          <SidebarLink href="/departmentHead/performance" icon={<LineChart size={18} />} label="Performance" />
          {/* <SidebarLink href="/departmentHead/evaluation" icon={<CheckCircle2 size={20} />} label="Evaluation" /> */}
          <SidebarLink href="/departmentHead/designation" icon={<CheckCircle2 size={20} />} label="Designation" />
          <SidebarLink href="/departmentHead/complain" icon={<AlertCircle size={20} />} label="Complain Request" />
          <SidebarLink href="/departmentHead/payment-status" icon={<FiDollarSign size={18} />} label="Payment Status" />
          <SidebarLink href="/departmentHead/leave_request" icon={<CalendarOff size={18} />} label="Leave Request" />
        </nav>

        {/* Footer Links (Profile, Settings, Logout) */}
        <div className="mt-auto flex-shrink-0">
          <hr className="my-4 border-white/20" />
          <SidebarLink href="/departmentHead/profile" icon={<Users size={18} />} label="Profile" />
          <SidebarLink href="/departmentHead/settings" icon={<Settings size={18} />} label="Settings" />
          <SidebarLink href="/loginpage" icon={<LogOut size={18} />} label="Logout" isDanger={true} />
        </div>
      </aside>
    </>
  );
}

// Reusable Sidebar Link Component with Active State Logic
function SidebarLink({ href, icon, label, isDanger = false }) {
  const pathname = usePathname();
  // Check if the current path starts with the link's href.
  const isActive = (href === "/departmentHead" && pathname === href) || (href !== "/departmentHead" && pathname.startsWith(href));

  const baseClasses = "flex items-center p-2 rounded-md transition-colors duration-200";
  const activeClasses = "bg-green-700 text-white font-semibold";
  const inactiveClasses = isDanger
    ? "text-red-400 hover:bg-red-900/50 hover:text-red-300"
    : "text-green-200 hover:bg-green-800 hover:text-white";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <span className={isDanger ? 'text-red-400' : 'text-green-300'}>
        {icon}
      </span>
      <span className="ml-3 text-sm">{label}</span>
    </Link>
  );
}