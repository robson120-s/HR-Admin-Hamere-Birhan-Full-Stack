// 'use client';
// import React, { useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// import {
//   Home,
//   Calendar,
//   Users,
//   Settings,
//   LogOut,
//   MessageSquareWarning,
//   BarChart2,
// } from 'lucide-react';

// export default function Sidebar() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <>
      
//       <button
//         className="md:hidden p-2 m-2 rounded bg-green-400 hover:bg-green-600 fixed z-50"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         ☰
//       </button>

      
//       <div
//         className={`fixed top-0 left-0 h-screen bg-green-900 border-r border-green-700
//     shadow-lg p-4 w-64 space-y-6 text-white overflow-y-auto
//     transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
//     transition-transform duration-200 ease-in-out
//     md:translate-x-0 z-40`}
//       >
       
//         <div className="flex items-center space-x-2">
//           <Image src="/logo.png" alt="Logo" width={48}  height={48} className="rounded-full mb-2"/>

//           <span className="text-sm font-bold">
//             ቅዱስ ዮሐንስ አፈወርቅ <br />
//             የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር
//           </span>
//         </div>

        
//         <nav className="flex flex-col space-y-2 mt-8 text-white">
//           <SidebarLink href="/intern" icon={<Home size={18} />} label="Dashboard" />
//           <SidebarLink href="/intern/attendance" icon={<Calendar size={18} />} label="Attendance History" />

//           <hr className="my-4 border-gray-300 opacity-50" />

//           <SidebarLink href="/intern/profile" icon={<Users size={18} />} label="Profile" />
//           <SidebarLink href="/intern/setting" icon={<Settings size={18} />} label="Settings" />
//           <SidebarLink href="/intern/policies" icon={<Users size={18} />} label="Policies" />
//           <SidebarLink href="/intern/complaints" icon={<MessageSquareWarning size={18} />} label="complain" />
//           <SidebarLink href="/intern/performance" icon={<BarChart2 size={18} />} label="Performance" />
//           <SidebarLink
//             href="/loginpage"
//             icon={<LogOut size={18} />}
//             label="Logout"
//             className="text-red-600 hover:bg-red-700"
//           />
//         </nav>
//       </div>
//     </>
//   );
// }


// function SidebarLink({ href, icon, label, className = '' }) {
//   return (
//     <Link href={href} className={`flex items-center p-2 rounded hover:bg-gray-500 text-white ${className}`}>
//       {React.cloneElement(icon, { className: 'text-white' })}
//       <span className="ml-2">{label}</span>
//     </Link>
//   );
// }
'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquareWarning,
  BarChart2,
  FileText,
  Menu, // For mobile menu icon
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();

  // Close mobile sidebar when route changes or on initial load if not desktop
  useEffect(() => {
    if (window.innerWidth < 768) { // md breakpoint
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  return (
    <>
      {/* Mobile toggle button - fixed on top-left of the screen */}
      <button
        className="md:hidden fixed top-4 left-4 p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white z-[99] shadow-md transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-green-800 to-green-900 border-r border-green-700
          shadow-xl p-4 text-white flex flex-col z-50
          ${isCollapsed ? 'w-20' : 'w-64'}
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          transition-all duration-300 ease-in-out
          md:translate-x-0`} 
      >
        {/* Desktop collapse button - positioned relative to the sidebar */}
        <button
          className="hidden md:flex items-center justify-center absolute -right-3 top-20 bg-green-600 hover:bg-green-700 text-white rounded-full w-6 h-6 shadow-md transition-colors z-10"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo and organization name */}
        <div className="flex-shrink-0 pb-4 border-b border-green-700 mb-4">
          <div className="flex flex-col items-center">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
              <Image
                src="/banner.webp"
                alt="Logo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            {!isCollapsed && (
              <div className="text-center mt-3">
                <h2 className="text-sm font-bold leading-tight">
                  ቅዱስ ዮሐንስ አፈወርቅ
                </h2>
                <p className="text-xs text-green-200 mt-1">
                  የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-2 no-scrollbar"> {/* Added no-scrollbar */}
          <SidebarLink href="/intern" icon={<Home size={18} />} label="Dashboard"             isActive={pathname === '/intern'}
            isCollapsed={isCollapsed}/>
           <SidebarLink href="/intern/attendance" icon={<Calendar size={18} />} label="Attendance History"             isActive={pathname === '/intern/attendance'}
            isCollapsed={isCollapsed}/>

           <hr className="my-4 border-gray-300 opacity-50" />

           <SidebarLink href="/intern/profile" icon={<Users size={18} />} label="Profile"             isActive={pathname === '/intern/profile'}
            isCollapsed={isCollapsed}/>
           <SidebarLink href="/intern/setting" icon={<Settings size={18} />} label="Settings"             isActive={pathname === '/intern/setting'}
            isCollapsed={isCollapsed}/>
           <SidebarLink href="/intern/policies" icon={<Users size={18} />} label="Policies"             isActive={pathname === '/intern/policies'}
            isCollapsed={isCollapsed}/>
           <SidebarLink href="/intern/complaints" icon={<MessageSquareWarning size={18} />} label="complain"             isActive={pathname === '/intern/complaints'}
            isCollapsed={isCollapsed}/>
           <SidebarLink href="/intern/performance" icon={<BarChart2 size={18} />} label="Performance"             isActive={pathname === '/intern/performance'}
            isCollapsed={isCollapsed}/>
          {/* <SidebarLink
            href="/staff"
            icon={<Home size={20} />}
            label="Dashboard"
            isActive={pathname === '/staff'}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/staff/attendance"
            icon={<Calendar size={20} />}
            label="Attendance History"
            isActive={pathname === '/staff/attendance'}
            isCollapsed={isCollapsed}
          />
                    <SidebarLink
            href="/staff/complain"
            icon={<FileText size={20} />}
            label="Complaints"
            isActive={pathname === '/staff/complain'}
            isCollapsed={isCollapsed}
          />

          <hr className="my-4 border-green-700" />

          <SidebarLink
            href="/staff/profile"
            icon={<Users size={20} />}
            label="Profile"
            isActive={pathname === '/staff/profile'}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            href="/staff/setting"
            icon={<Settings size={20} />}
            label="Settings"
            isActive={pathname === '/staff/setting'}
            isCollapsed={isCollapsed}
          /> */}

        </nav>

        {/* Logout button */}
        <div className="flex-shrink-0 pt-4 border-t border-green-700 mt-auto"> {/* mt-auto pushes to bottom */}
          <SidebarLink
            href="/loginpage"
            icon={<LogOut size={20} />}
            label="Logout"
            isCollapsed={isCollapsed}
            className="text-green-200 hover:bg-red-700 hover:text-white"
          />
        </div>

        {/* User profile at bottom */}
        {!isCollapsed && (
          <div className="flex-shrink-0 mt-4 p-3 bg-green-700 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Staff User</p>
                <p className="text-xs text-green-200">Administrator</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function SidebarLink({ href, icon, label, isActive = false, isCollapsed = false, className = '' }) {
  return (
    <Link
      href={href}
      className={`relative flex items-center p-3 rounded-lg transition-all duration-200 group
        ${isActive
          ? 'bg-green-700 text-white shadow-inner'
          : 'text-green-100 hover:bg-green-700 hover:text-white'}
        ${className}`}
    >
      {React.cloneElement(icon, {
        className: `flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-green-300 group-hover:text-white'}`
      })}
      {!isCollapsed && <span className="ml-3 font-medium whitespace-nowrap">{label}</span>}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-green-800 rounded-md shadow-lg text-sm font-medium
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </Link>
  );
}