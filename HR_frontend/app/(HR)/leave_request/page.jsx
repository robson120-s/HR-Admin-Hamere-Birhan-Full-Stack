// /leave_request/page.jsx
"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import StatusDropdown from './components/StatusDropdown';
import { getLeaveRequests, updateLeaveStatus } from '../../../lib/api'; // Adjust path if needed

// ==============================================================================
// SUB-COMPONENTS (Defined within the main page file for simplicity)
// ==============================================================================

const SunIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="5"></circle><path d="M12 1v2"></path><path d="M12 21v2"></path><path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 18.36l1.42 1.42"></path><path d="M1 12h2"></path><path d="M21 12h2"></path><path d="M4.22 19.78l1.42-1.42"></path><path d="M18.36 5.64l1.42-1.42"></path>
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) { return <div className="w-10 h-10" />; }

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-800" />}
    </button>
  );
};

const getStatusBadgeStyles = (status) => {
  switch (status) {
    case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 ring-1 ring-inset ring-green-600/20';
    case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20';
    case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 ring-1 ring-inset ring-red-600/10';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10';
  }
};

const LeaveRequestRow = memo(function LeaveRequestRow({ leave, onStatusChange }) {
  const handleStatusUpdate = (newStatus) => {
    onStatusChange(leave.id, newStatus);
  };
  
  const startDate = new Date(leave.startDate);
  const endDate = new Date(leave.endDate);
  const duration = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const statusFormatted = leave.status.charAt(0).toUpperCase() + leave.status.slice(1);
  const fullName = `${leave.employee?.firstName || ''} ${leave.employee?.lastName || 'N/A'}`;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{fullName}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{leave.leaveType}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{duration}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{days}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" title={leave.reason}>{leave.reason || 'N/A'}</td>
      <td className="px-4 py-4 whitespace-nowrap text-sm">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusBadgeStyles(statusFormatted)}`}>
          {statusFormatted}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm">
        <StatusDropdown
          currentStatus={statusFormatted}
          onStatusChange={handleStatusUpdate}
        />
      </td>
    </tr>
  );
});

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      const data = await getLeaveRequests();
      setLeaveRequests(data);
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getLeaveRequests()
      .then(data => setLeaveRequests(data))
      .catch(error => toast.error(error.message))
      .finally(() => setIsLoading(false));
  }, [refreshKey]);

  const handleStatusChange = useCallback(async (leaveId, newStatus) => {
    try {
      // 1. Make the API call first.
      await updateLeaveStatus(leaveId, newStatus);
      toast.success("Leave status updated.");
      
      // 2. If successful, refetch the entire list to get the new state.
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      toast.error(error.message);
    }
  }, [fetchLeaveRequests]);

  const filteredLeaveData = leaveRequests.filter((leave) =>
    (leave.leaveType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (leave.reason?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (leave.employee?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (leave.employee?.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalCount = leaveRequests.length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'rejected').length;
  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen p-4 md:p-8">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
        <ThemeSwitcher />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center"><div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full"><svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400">Total Requests</p><p className="text-2xl font-bold">{totalCount}</p></div></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center"><div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full"><svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400">Approved</p><p className="text-2xl font-bold">{approvedCount}</p></div></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center"><div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full"><svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400">Rejected</p><p className="text-2xl font-bold">{rejectedCount}</p></div></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center"><div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full"><svg className="w-6 h-6 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400">Pending</p><p className="text-2xl font-bold">{pendingCount}</p></div></div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm overflow-x-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center"><span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Show</span><select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"><option>10</option><option>25</option><option>50</option></select><span className="ml-2 text-sm text-gray-600 dark:text-gray-400">entries</span></div>
          <div className="flex items-center"><span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Search:</span><input type="text" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm" placeholder="Search by type, reason, name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
        </div>

        <table key={refreshKey} className="w-full min-w-[800px] min-h-[300px] block">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Leave Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Leave Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
                <tr><td colSpan="7" className="text-center py-16 text-gray-500">Loading leave requests...</td></tr>
            ) : filteredLeaveData.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-16 text-gray-500">No requests match your search.</td></tr>
            ) : (
                filteredLeaveData.map((leave) => (
                  <LeaveRequestRow 
                    key={leave.id} 
                    leave={leave} 
                    onStatusChange={handleStatusChange} 
                  />
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequests;