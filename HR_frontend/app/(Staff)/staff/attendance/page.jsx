// app/(Staff)/staff/attendance-history/page.jsx

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { useRouter } from 'next/navigation'; // Import useRouter
// import { CalendarDaysIcon, ClockIcon, XCircleIcon, CheckCircleIcon, MinusCircleIcon, LoaderCircle } from '@heroicons/react/24/outline'; // Added LoaderCircle
import { CalendarDaysIcon, ClockIcon, XCircleIcon, CheckCircleIcon, MinusCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'; // Adjust path
import { fetchStaffAttendanceHistory } from '../../../../lib/api'; // Adjust path
import { format } from 'date-fns';

// --- Re-using getLoggedInUserInfo from DashboardPage ---
// This function needs to return all relevant user info from localStorage.
const getLoggedInUserInfo = () => {
  const employeeInfoString = localStorage.getItem('employeeInfo');
  if (employeeInfoString) {
    try {
      const userInfo = JSON.parse(employeeInfoString);
      if (userInfo && typeof userInfo.userId === 'number' && userInfo.roles) {
        return {
          userId: userInfo.userId,
          employeeId: userInfo.employeeId || null, // Can be null
          userName: userInfo.userName || userInfo.username || 'User', // Fallback
          roles: userInfo.roles // Should be an array
        };
      }
    } catch (e) {
      console.error("AttendanceHistoryPage: Error parsing 'employeeInfo' from localStorage. Data might be corrupted.", e);
      localStorage.removeItem('employeeInfo'); // Clear corrupted data
      localStorage.removeItem('authToken');
    }
  }
  return null;
};


export default function AttendanceHistoryPage() {
  const router = useRouter(); // Initialize useRouter

  // State to hold user info
  const [userId, setUserId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null); // This can be null for HR etc.
  const [userRoles, setUserRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading for data fetch
  const [pageLoading, setPageLoading] = useState(true); // New state for initial page load/auth
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed month

  // Generate years for dropdown (e.g., current year and past 5 years)
  const years = useMemo(() => {
    const yearsArray = [];
    for (let i = 0; i < 5; i++) {
      yearsArray.push(currentYear - i);
    }
    return yearsArray;
  }, [currentYear]);

  // Months for dropdown
  const months = useMemo(() => ([
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' },
  ]), []);


  // FIX 1: Initial authentication check and role-based redirection
  useEffect(() => {
    console.log("AttendanceHistoryPage: Initial authentication check initiated.");
    const userInfo = getLoggedInUserInfo();
    if (userInfo && userInfo.userId) {
      setUserId(userInfo.userId);
      setEmployeeId(userInfo.employeeId);
      setUserRoles(userInfo.roles);
      setIsAuthenticated(true);
      console.log(`AttendanceHistoryPage: User ID (${userInfo.userId}), Roles: ${userInfo.roles.join(', ')}. Employee ID: ${userInfo.employeeId}`);

      // --- Role-based redirection logic ---
      if (userInfo.roles.includes('HR') && !userInfo.roles.includes('Staff')) {
        console.warn("AttendanceHistoryPage: HR user accessing Staff Attendance. Redirecting to HR Dashboard.");
        setPageLoading(false);
        router.push('/hr/dashboard'); // Adjust path to your actual HR dashboard
        return;
      }
      if (userInfo.roles.includes('Department Head') && !userInfo.roles.includes('Staff')) {
          console.warn("AttendanceHistoryPage: Department Head user accessing Staff Attendance. Redirecting to Department Head Dashboard.");
          setPageLoading(false);
          router.push('/dep-head/dashboard'); // Adjust path to your actual Department Head dashboard
          return;
      }
      // Add more role-based redirects here if necessary

      // If it's a Staff user BUT they don't have an associated employeeId
      if (userInfo.roles.includes('Staff') && userInfo.employeeId === null) {
          console.error("AttendanceHistoryPage: Staff user found, but no associated employeeId. Cannot load attendance history.");
          localStorage.removeItem('employeeInfo'); // Clear incomplete session
          localStorage.removeItem('authToken');
          setPageLoading(false);
          router.push('/login'); // Redirect to login, as their staff profile is incomplete/invalid
          return;
      }
      setPageLoading(false); // If no redirection, stop page loading

    } else {
      console.warn("AttendanceHistoryPage: No valid user info found in localStorage. Redirecting to login.");
      setPageLoading(false);
      router.push('/login');
    }
  }, [router]);


  // FIX 2: getAttendanceHistory now uses state variables and no employeeId parameter
  const getAttendanceHistory = useCallback(async () => {
    // Only proceed if authenticated AND it's a Staff role with a valid employeeId
    if (!isAuthenticated || employeeId === null || !userRoles.includes('Staff')) {
      console.log("AttendanceHistoryPage: Skipping data fetch (conditions not met for Staff attendance).");
      setLoading(false); // Stop data loading if conditions not met
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // No employeeId parameter here, backend derives it from the token
      const data = await fetchStaffAttendanceHistory(selectedMonth, selectedYear);
      setAttendanceRecords(data.map(record => ({
        ...record,
        date: new Date(record.date),
      })));
    } catch (err) {
      console.error("Error fetching attendance history:", err);
      setError(err.message || "Failed to load attendance history.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, employeeId, userRoles, selectedMonth, selectedYear]); // Dependencies for useCallback

  // Trigger data fetch when relevant state changes
  useEffect(() => {
    if (isAuthenticated && employeeId !== null && userRoles.includes('Staff')) {
      getAttendanceHistory();
    }
  }, [isAuthenticated, employeeId, userRoles, selectedMonth, selectedYear, getAttendanceHistory]);


  // Group records by month for a cleaner display (useMemo is correct)
  const groupedRecords = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return {};
    return attendanceRecords.reduce((acc, record) => {
      const monthYearKey = format(record.date, 'MMMM yyyy');
      if (!acc[monthYearKey]) { acc[monthYearKey] = []; }
      acc[monthYearKey].push(record);
      return acc;
    }, {});
  }, [attendanceRecords]);


  const getStatusClasses = (status) => { /* ... */ return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'; };
  const getStatusIcon = (status) => { /* ... */ return <CalendarDaysIcon className="w-5 h-5 text-gray-500" />; };


  // Display initial page loading
  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">

<ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
      </div>
    );
  }

  // Fallback for access denied if not redirected
  if (!isAuthenticated || employeeId === null || !userRoles.includes('Staff')) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-500">
            <p className="text-red-500 dark:text-red-400">Access Denied: You do not have permission to view this page.</p>
        </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-indigo-500" /> My Attendance History
        </h1>

        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-0 overflow-hidden mb-8">
          <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Filter History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Year
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                {years.map((year) => (<option key={year} value={year}>{year}</option>))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Month
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                {months.map((month) => (<option key={month.value} value={month.value}>{month.name}</option>))}
              </select>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-300">
            
<ArrowPathIcon className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
            <p className="mt-2">Loading attendance records...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative dark:bg-red-900/30 dark:text-red-300 mb-8" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && Object.keys(groupedRecords).length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No attendance records found for the selected period.</p>
          </div>
        )}

        {!loading && !error && Object.keys(groupedRecords).length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedRecords).map(([monthYear, records]) => (
              <Card key={monthYear} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-0 overflow-hidden">
                <CardHeader className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                    {monthYear}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-gray-200 dark:divide-gray-700">
                  {records.map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 text-center">
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{format(record.date, 'dd')}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{format(record.date, 'EEE')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {record.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {record.lateArrival && (<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">Late</span>)}
                        {record.earlyDeparture && (<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Early</span>)}
                        {record.unplannedAbsence && (<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">Unplanned Absent</span>)}
                        {record.totalWorkHours && record.status === 'present' && (<span className="text-gray-600 dark:text-gray-300">{record.totalWorkHours.toFixed(2)} hrs</span>)}
                        {record.remarks && (<span className="text-gray-500 dark:text-gray-400 text-xs italic">({record.remarks})</span>)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}