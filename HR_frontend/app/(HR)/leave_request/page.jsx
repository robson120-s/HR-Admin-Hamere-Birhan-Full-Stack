// /leave_request/page.jsx

"use client";

import { useState, useCallback, memo, useEffect } from 'react';
import { useTheme } from 'next-themes';

// This path alias should be correctly configured in your jsconfig.json
import StatusDropdown from './components/StatusDropdown'; 

// --- NEW, CIRCLE-FREE, MINIMALIST ICONS ---
// A more minimalist "Sun" icon without the outer circle.
const SunIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </svg>
);

// A more minimalist "Moon" icon without the outer circle.
const MoonIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// --- Dedicated component for the theme switcher button ---
const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder to avoid layout shift while mounting.
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <SunIcon className="w-6 h-6 text-yellow-400" />
      ) : (
        <MoonIcon className="w-6 h-6 text-gray-800" />
      )}
    </button>
  );
};


// Helper function to style the visual status badge
const getStatusBadgeStyles = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20';
    case 'Rejected':
      return 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/10';
    default:
      return 'bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-500/10';
  }
};

const LeaveRequestRow = memo(function LeaveRequestRow({ leave, onStatusChange }) {
  const handleStatusUpdate = (newStatus) => {
    onStatusChange(leave.id, newStatus);
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{leave.leaveType}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.leaveDuration}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.days}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.reason}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusBadgeStyles(leave.status)}`}>
          {leave.status}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm">
        <StatusDropdown
          currentStatus={leave.status}
          onStatusChange={handleStatusUpdate}
        />
      </td>
    </tr>
  );
});

const LeaveRequests = () => {
  const initialLeaveData = [
    { id: 1, leaveType: 'Bereavement Leave', leaveDuration: '01 Sep 2024 - 03 Sep 2024', days: 3, reason: 'Family Loss', status: 'Approved' },
    { id: 2, leaveType: 'Sick Leave', leaveDuration: '10 Sep 2024 - 10 Sep 2024', days: 1, reason: 'Flu', status: 'Pending' },
    { id: 3, leaveType: 'Vacation', leaveDuration: '15 Sep 2024 - 20 Sep 2024', days: 5, reason: 'Holiday Trip', status: 'Rejected' },
  ];

  const [leaveRequests, setLeaveRequests] = useState(initialLeaveData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = useCallback((leaveId, newStatus) => {
    setLeaveRequests(currentRequests =>
      currentRequests.map(request =>
        request.id === leaveId
          ? { ...request, status: newStatus }
          : request
      )
    );
  }, []);

  const filteredLeaveData = leaveRequests.filter((leave) =>
    Object.values(leave).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen p-4 md:p-8">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
        <ThemeSwitcher />
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center"><div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full"><svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400">Total Leave</p><p className="text-2xl font-bold">15</p></div></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center"><div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full"><svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400">Approve</p><p className="text-2xl font-bold">12</p></div></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center"><div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full"><svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400">Rejected</p><p className="text-2xl font-bold">2</p></div></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center"><div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full"><svg className="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400">Pending</p><p className="text-2xl font-bold">5</p></div></div>
      </div>

      {/* Leave Request Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm overflow-x-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center"><span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Show</span><select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"><option>10</option><option>25</option><option>50</option></select><span className="ml-2 text-sm text-gray-600 dark:text-gray-400">entries</span></div>
          <div className="flex items-center"><span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Search:</span><input type="text" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
        </div>

        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Leave Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Leave Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeaveData.map((leave) => (
              <LeaveRequestRow 
                key={leave.id} 
                leave={leave} 
                onStatusChange={handleStatusChange} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequests;

