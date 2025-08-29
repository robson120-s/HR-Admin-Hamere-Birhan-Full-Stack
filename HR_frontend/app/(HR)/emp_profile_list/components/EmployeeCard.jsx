"use client";

import Image from 'next/image';
import Link from 'next/link'; // ✅ --- ADDITION 1: Import the Link component ---
import { User, Briefcase, Phone, Mail } from 'lucide-react';

export function EmployeeCard({ employee }) {
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const position = employee.position?.name || 'No Position';
  const department = employee.department?.name || 'No Department';

  return (
    // ✅ --- ADDITION 2: Wrap the entire card in a Link component ---
    // The `href` dynamically points to the detail page for this specific employee.
    <Link href={`/emp_profile_list/${employee.id}`} className="block">
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden 
                   border border-transparent hover:border-indigo-500 dark:hover:border-indigo-400
                   transition-all duration-300 ease-in-out 
                   transform hover:-translate-y-1 group h-full" // Added h-full for consistent height in a grid
      >
        <div className="relative h-24 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/70 dark:to-purple-900/70">
          {/* Placeholder for a potential cover image */}
        </div>

        <div className="p-4 pt-0 -mt-12 flex flex-col items-center text-center">
          {/* Profile Picture */}
          <div className="relative w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-lg">
            <Image 
              src={employee.photo || '/images/default-avatar.png'}
              alt={fullName}
              fill // Use fill instead of layout="fill" for Next.js v13+
              className="rounded-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Provide sizes prop for better performance
            />
          </div>

          {/* Name and Position */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {fullName}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{position}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{department}</p>
          </div>

          {/* Contact Info */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 w-full space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-center gap-2">
              <Mail size={14} />
              <span className="truncate">{employee.user?.email || 'No email'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone size={14} />
              <span>{employee.phone || 'No phone'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}