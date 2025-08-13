"use client";
import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import {
  Home,
  Calendar,
  Users,
  Layers,
  FileText,
  Settings,
  LogOut,
  Edit,
   IdCard, Lanyard, Clock
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden p-2 m-2 rounded bg-green-100 hover:bg-green-200 fixed z-50"
        aria-label="Toggle Sidebar"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-green-900 border-r border-green-700
    shadow-lg p-4 w-64 space-y-6 text-white overflow-y-auto
    transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
    transition-transform duration-200 ease-in-out
    md:translate-x-0 z-40`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/images/logo.png"
            alt="Logo"
            className="w-12 h-12 rounded-full"
          />
          <span className="text-sm font-bold leading-tight">
            ቅዱስ ዮሐንስ አፈወርቅ የዘመነ ክረምት <br /> የሕጻናት ት/ት መርሐግብር
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-1 mt-8">
          <SidebarLink href="/dashboard" icon={<Home size={18} />} label="Dashboard" />
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
            href="/salary"
            icon={<DollarSign size={18} />}
            label="Salary"
          />
          
          <SidebarLink
            href="/leave_request"
            icon={<Settings size={18} />}
            label="Leave Requests"
          />
          <SidebarLink
            href="/overtime-approval"
            icon={<Clock size={18} />}
            label="Overtime Approval"
          />
          <SidebarLink
            href="/departments"
            icon={<Layers size={18} />}
            label="Departments"
          />
          <SidebarLink
            href="/reports"
            icon={<FileText size={18} />}
            label="Reports"
          />
          <SidebarLink
            href="/emp_profile_list"
            icon={<IdCard size={18} />}
            label="Employee Profile List"
          />

          <hr className="my-4 border-gray-500 opacity-30" />

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
            textColor="text-red-500"
          />
        </nav>
      </aside>
    </>
  );
}

function SidebarLink({ href, icon, label, textColor = "text-white" }) {
  return (
    <Link
      href={href}
      className={`flex items-center p-2 rounded hover:bg-green-800 transition-colors ${textColor}`}
    >
      <span className="text-gold">{icon}</span>
      <span className="ml-2">{label}</span>
    </Link>
  );
}
