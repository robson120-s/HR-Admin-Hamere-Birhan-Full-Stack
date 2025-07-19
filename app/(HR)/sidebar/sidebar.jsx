"use client"; // 👈 Add this line at the top!
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Home, Calendar, Users, Layers, FileText, Settings, PersonStanding, LogOut, Edit } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 m-2 rounded bg-green-100 hover:bg-green-200 fixed z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      <div
        className={`
  fixed top-0 left-0 h-screen bg-green-900 border-r border-green-700
  shadow-lg p-4 w-64 space-y-6 text-white
  overflow-y-auto
  transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  transition-transform duration-200 ease-in-out
  md:translate-x-0 md:static md:shadow-none
`}

      >
        <div className="flex items-center space-x-2">
        <img src="/assets/images/logo.png" alt="Logo" className="w-12 h-12 rounded-full mb-2" /> 
          <span className="text-sm font-bold">ቅዱስ ዮሐንስ አፈወርቅ የዘመነ ክረምት
የሕጻናት ት/ት መርሐግብር</span>
        </div>

        <nav className="flex flex-col space-y-2 mt-8 text-white">
  <SidebarLink href="/" icon={<Home size={18} />} label="Dashboard" />
  <SidebarLink href="/attendance-overview" icon={<Calendar size={18} />} label="Attendance overview" />
  <SidebarLink href="/edit-attendance" icon={<Edit size={18} />} label="Edit attendance" />
  <SidebarLink href="/departments" icon={<Layers size={18} />} label="Departments" />
  <SidebarLink href="/reports" icon={<FileText size={18} />} label="Reports" />

  <hr className="my-4 border-gray-300 opacity-50" />

  <SidebarLink href="/profile" icon={<Users size={18} />} label="Profile" />
  <SidebarLink href="/settings" icon={<Settings size={18} />} label="Settings" />
<SidebarLink 
  href="/logout" icon={<LogOut size={18} className="text-red-600" />} label="Logout" 
  className="text-red-600"
/>
</nav>

      </div>
    </>
  );
}


function SidebarLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center p-2 rounded hover:bg-gray-500 text-white">
      {React.cloneElement(icon, { className: 'text-gold' })}
      <span className="ml-2">{label}</span>
    </Link>
  );
}

