'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

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
          <Image src="/logo.png" alt="Logo" width={48}  height={48} className="rounded-full mb-2"/>

          <span className="text-sm font-bold">
            ቅዱስ ዮሐንስ አፈወርቅ <br />
            የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር
          </span>
        </div>

        
        <nav className="flex flex-col space-y-2 mt-8 text-white">
          <SidebarLink href="/staff" icon={<Home size={18} />} label="Dashboard" />
          <SidebarLink href="/staff/attendance" icon={<Calendar size={18} />} label="Attendance History" />

          <hr className="my-4 border-gray-300 opacity-50" />

          <SidebarLink href="/staff/profile" icon={<Users size={18} />} label="Profile" />
          <SidebarLink href="/staff/setting" icon={<Settings size={18} />} label="Settings" />
           <SidebarLink href="/staff/complain" icon={<Settings size={18} />} label="complain" />
          <SidebarLink
            href="/loginpage"
            icon={<LogOut size={18} />}
            label="Logout"
            className="text-red-600 hover:bg-red-700"
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
