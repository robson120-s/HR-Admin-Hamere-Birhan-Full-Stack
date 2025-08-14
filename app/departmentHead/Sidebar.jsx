'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Home,
  Calendar,
  LineChart,
   CheckCircle2,
  AlertCircle,
  Settings,
  LogOut,
  Users,
  DollarSign,
  CalendarOff,
} from 'lucide-react';
import { FiDollarSign } from 'react-icons/fi';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 m-2 rounded bg-green-400 hover:bg-green-600 fixed z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      <div
        className={`fixed top-0 left-0 h-screen bg-green-900 border-r border-green-700
    shadow-lg p-4 w-64 space-y-6 text-white overflow-y-auto
    transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
    transition-transform duration-200 ease-in-out
    md:translate-x-0 z-40`}
      >
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-full mb-2" />
          <span className="text-sm font-bold">
            ቅዱስ ዮሐንስ አፈወርቅ <br />
            የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር
          </span>
        </div>

        <nav className="flex flex-col space-y-2 mt-8 text-white">
          <SidebarLink href="/departmentHead" icon={<Home size={18} />} label="Dashboard" />
          <SidebarLink href="/departmentHead/editAttendance" icon={<Calendar size={18} />} label="Edit attendance" />
          <SidebarLink href="/departmentHead/performance" icon={<LineChart size={18} />} label="Performance" />
          <SidebarLink href="/departmentHead/evaluation" icon={<CheckCircle2 size={20}/>} label="Evaluation" />
            <SidebarLink href="/departmentHead/designation" icon={<CheckCircle2 size={20}/>} label="designation" />
          <SidebarLink href="/departmentHead/complain" icon={<AlertCircle size={20} />} label="Complain Management" />
          <SidebarLink href="/departmentHead/payment-status" icon={<FiDollarSign size={18} />} label="Payment Status" />
          <SidebarLink href="/departmentHead/leave_request" icon={<CalendarOff size={18} />} label="Leave Request" />

          <hr className="my-4 border-gray-300 opacity-50" />

          <SidebarLink href="/departmentHead/profile" icon={<Users size={18} />} label="Profile" />
          <SidebarLink href="/departmentHead/settings" icon={<Settings size={18} />} label="Settings" />
          <SidebarLink
             className="text-red-600 hover:bg-red-700" 
             href="/loginpage"
            icon={<LogOut size={18} />}
            label="Logout"
          
          />
        </nav>
      </div>
    </>
  );
}

function SidebarLink({ href, icon, label, className = '' }) {
  return (
    <Link href={href} className={`flex items-center p-2 rounded hover:bg-gray-500 text-white ${className}`}>
      {React.cloneElement(icon, { className: 'text-white' })}
      <span className="ml-2">{label}</span>
    </Link>
  );
}
