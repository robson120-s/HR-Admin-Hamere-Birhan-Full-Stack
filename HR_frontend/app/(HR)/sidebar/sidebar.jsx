// app/(HR)/sidebar/sidebar.jsx (Adjust your actual file path)
"use client";

import React, { useState, useEffect } from "react"; // Added useEffect for mounted state
import Link from "next/link";
import Image from "next/image"; // Import Image component
import { usePathname, useRouter } from "next/navigation"; // Added useRouter for logout
import {
  Home,
  CalendarDays, // Use CalendarDays for a more general calendar icon
  Users,
  Layers, // For Departments
  FileText, // For Reports, Terminations
  Settings,
  LogOut,
  Edit, // For Edit Attendance
  IdCard, // For Employee Profile List
  Clock, // For Overtime Approval, can also be used for attendance history
  DollarSign, // For Salary
  OctagonMinus, // For Leave Requests
  FileWarning, // Replaced MdOutlineReportProblem for consistency
} from "lucide-react";


// --- Sidebar Component ---
export default function HrSidebar() { // Renamed to HrSidebar for clarity
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // Initialize useRouter
  const pathname = usePathname(); // Get current pathname for active state
  const [mounted, setMounted] = useState(false); // To prevent hydration mismatch for theme toggle

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    // Clear authentication tokens/info from localStorage
    localStorage.removeItem('employeeInfo');
    localStorage.removeItem('authToken');
    // Redirect to the login page (full reload to clear all React state)
    router.push('/loginpage');
    // Optionally: window.location.href = '/login'; for a hard refresh
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 m-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 fixed top-2 left-2 z-50"
        aria-label="Open Sidebar Menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-800 dark:text-white" // Added text color for better visibility
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
          aria-label="Close Sidebar Menu"
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full bg-green-900 border-r border-green-800 shadow-xl p-4 w-64 text-white flex flex-col
                   transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out
                   md:translate-x-0 z-40`}
      >
        {/* Header/Logo Section */}
        <div className="flex items-center gap-3 p-2 border-b border-white/20 pb-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
          <Image
            src="/logo.png" // Ensure this path is correct in your `public` folder
            alt="Company Logo"
            width={48}
            height={48}
            className="rounded-full border-2 border-green-700"
          />
          <span className="text-sm font-bold leading-tight">
            ቅዱስ ዮሐንስ አፈወርቅ የዘመነ ክረምት <br /> የሕጻናት ት/ት መርሐግብር
          </span>
        </div>

        {/* Navigation Links - FIX: This section gets the overflow-y-auto */}
        <nav className="flex-1 flex flex-col space-y-1 mt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-green-900">
          <SidebarLink href="/dashboard" icon={<Home size={18} />} label="Dashboard" />
          <SidebarLink href="/attendance-overview" icon={<CalendarDays size={18} />} label="Attendance Overview" />
          <SidebarLink href="/edit-attendance" icon={<Edit size={18} />} label="Edit Attendance" />
          <SidebarLink href="/departments" icon={<Layers size={18} />} label="Departments" />
          <SidebarLink href="/emp_profile_list" icon={<IdCard size={18} />} label="Employee Profile List" />
          <SidebarLink href="/reports" icon={<FileText size={18} />} label="Reports" />
          <SidebarLink href="/leave_request" icon={<OctagonMinus size={18} />} label="Leave Requests" />
          <SidebarLink href="/complain_received" icon={<FileWarning size={18} />} label="Complaint List" />
          <SidebarLink href="/salary" icon={<DollarSign size={18} />} label="Salary" />
          <SidebarLink href="/overtime-approval" icon={<Clock size={18} />} label="Overtime Approval" />
          <SidebarLink href="/terminations" icon={<FileText size={18} />} label="Terminations" />
        </nav>

        {/* Footer Links (Profile, Settings, Logout) - FIX: Use a button for logout */}
        <div className="mt-auto flex-shrink-0">
          <hr className="my-4 border-white/20" />
          <SidebarLink href="/profile" icon={<Users size={18} />} label="Profile" />
          <SidebarLink href="/settings" icon={<Settings size={18} />} label="Settings" />
          {/* Logout button now triggers the handleLogout function */}
          <button onClick={handleLogout} className="w-full text-left">
            <SidebarLink href="#" icon={<LogOut size={18} />} label="Logout" isDanger={true} />
          </button>
        </div>
      </aside>
    </>
  );
}

// Reusable Sidebar Link Component with Active State Logic
function SidebarLink({ href, icon, label, isDanger = false, onClick }) { // Added onClick prop
  const pathname = usePathname();

  // FIX: Make href relative to the HR route group, e.g., /hr/dashboard
  const fullHref = href.startsWith('/') ? href : `/hr${href}`; // Ensure paths are absolute or prefixed with /hr

  // FIX: Improved isActive logic for root and nested paths within /hr
  const isActive =
    (fullHref === "/dashboard" && pathname === "/dashboard") || // Exact match for the dashboard root
    (fullHref !== "/dashboard" && pathname.startsWith(fullHref)); // StartsWith for other nested routes


  const baseClasses = "flex items-center p-2 rounded-md transition-colors duration-200";
  const activeClasses = "bg-green-700 text-white font-semibold";
  const inactiveClasses = isDanger
    ? "text-red-400 hover:bg-red-900/50 hover:text-red-300"
    : "text-green-200 hover:bg-green-800 hover:text-white";

    const LinkContent = (
        <>
            <span className={isDanger ? "text-red-400" : "text-green-300"}>
                {icon}
            </span>
            <span className="ml-3 text-sm">{label}</span>
        </>
    );

    // If it's a special action link (like logout), render as a button
    if (href === '#') {
        return (
            <button
                onClick={onClick}
                className={`w-full text-left ${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                aria-current={isActive ? "page" : undefined}
            >
                {LinkContent}
            </button>
        );
    }

  return (
    <Link
      href={fullHref} // Use the fullHref
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? "page" : undefined} // ARIA for active link
      onClick={onClick} // Pass onClick for regular links if needed
    >
      {LinkContent}
    </Link>
  );
}