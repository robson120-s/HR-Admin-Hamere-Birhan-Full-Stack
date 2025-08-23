// app/(HR)/overtime-approval/components/SimpleStatusDropdown.jsx
"use client";

import { CheckCircle2, Hourglass, XCircle } from "lucide-react";

export function SimpleStatusDropdown({ currentStatus, onStatusChange }) {
  const statusOptions = ['Pending', 'Approved', 'Rejected'];

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 ring-green-600/20';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 ring-yellow-600/20';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 ring-red-600/10';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative w-36">
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`w-full appearance-none rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusStyles(currentStatus)}`}
      >
        {statusOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
}