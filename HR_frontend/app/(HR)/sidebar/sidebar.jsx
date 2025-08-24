// Your file path, e.g., app/(HR)/sidebar/sidebar.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Users,
  Layers,
  FileText,
  Settings,
  LogOut,
  Edit,
  IdCard,
  Clock,
  DollarSign,
} from "lucide-react";
import { MdOutlineReportProblem } from "react-icons/md";

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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
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
               transform ${
                 isOpen ? "translate-x-0" : "-translate-x-full"
               } transition-transform duration-300 ease-in-out
               md:translate-x-0 z-40
               scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-green-900`}
>
        {/* Header/Logo Section */}
        <div className="flex items-center gap-3 p-2 border-b border-white/20 pb-4">
          <img
            src="/assets/images/logo.png"
            alt="Logo"
            className="w-12 h-12 rounded-full border-2 border-green-700"
          />
          <span className="text-sm font-bold leading-tight">
            ቅዱስ ዮሐንስ አፈወርቅ የዘመነ ክረምት <br /> የሕጻናት ት/ት መርሐግብር
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col space-y-1 mt-6 overflow-y-auto">
          <SidebarLink
            href="/dashboard"
            icon={<Home size={18} />}
            label="Dashboard"
          />
          <SidebarLink
            href="/attendance-overview"
            icon={<Calendar size={18} />}
            label="Attendance Overview"
          />
          <SidebarLink
            href="/edit-attendance"
            icon={<Edit size={18} />}
            label="Edit Attendance"
          />
          <SidebarLink
            href="/departments"
            icon={<Layers size={18} />}
            label="Departments"
          />
          <SidebarLink
            href="/emp_profile_list"
            icon={<IdCard size={18} />}
            label="Employee Profile List"
          />
          <SidebarLink
            href="/reports"
            icon={<FileText size={18} />}
            label="Reports"
          />
          <SidebarLink
            href="/leave_request"
            icon={<FileText size={18} />}
            label="Leave Requests"
          />
          <SidebarLink
            href="/complain_received"
            icon={<MdOutlineReportProblem size={18} />}
            label="Complaint List"
          />
          <SidebarLink
            href="/salary"
            icon={<DollarSign size={18} />}
            label="Salary"
          />
          <SidebarLink
            href="/overtime-approval"
            icon={<Clock size={18} />}
            label="Overtime Approval"
          />
          <SidebarLink
            href="/terminations"
            icon={<FileText size={18} />}
            label="Terminations"
          />
        </nav>

        {/* Footer Links (Profile, Settings, Logout) */}
        <div className="mt-auto flex-shrink-0">
          <hr className="my-4 border-white/20" />
          <SidebarLink
            href="/profile"
            icon={<Users size={18} />}
            label="Profile"
          />
          <SidebarLink
            href="/settings"
            icon={<Settings size={18} />}
            label="Settings"
          />
          <SidebarLink
            href="/loginpage"
            icon={<LogOut size={18} />}
            label="Logout"
            isDanger={true}
          />
        </div>
      </aside>
    </>
  );
}

// Reusable Sidebar Link Component with Active State Logic
function SidebarLink({ href, icon, label, isDanger = false }) {
  const pathname = usePathname();
  const isActive =
    (href === "/dashboard" && pathname === href) ||
    (href !== "/dashboard" && pathname.startsWith(href));

  const baseClasses =
    "flex items-center p-2 rounded-md transition-colors duration-200";

  const activeClasses = "bg-green-700 text-white font-semibold";

  const inactiveClasses = isDanger
    ? "text-red-400 hover:bg-red-900/50 hover:text-red-300"
    : "text-green-200 hover:bg-green-800 hover:text-white";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <span className={isDanger ? "text-red-400" : "text-green-300"}>
        {icon}
      </span>
      <span className="ml-3 text-sm">{label}</span>
    </Link>
  );
}