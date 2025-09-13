// app/staff/AttendanceHistoryPage.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDaysIcon, ClockIcon, XCircleIcon, CheckCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'; // Adjust path
import { fetchStaffAttendanceHistory } from '../../../../lib/api'; // Adjust path
import { format } from 'date-fns';

export default function AttendanceHistoryPage() {
  // TODO: Replace with the actual logged-in employee ID from your authentication context.
  const employeeId = 1; // Placeholder for demonstration

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ]), []);

  useEffect(() => {
    const getAttendanceHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!employeeId) {
          throw new Error('Employee ID not available for fetching attendance history.');
        }
        const data = await fetchStaffAttendanceHistory(employeeId, selectedMonth, selectedYear);
        // Ensure date objects for consistent handling
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
    };

    getAttendanceHistory();
  }, [employeeId, selectedMonth, selectedYear]); // Re-fetch when employeeId, month, or year changes


  // Group records by month for a cleaner display
  const groupedRecords = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return {};

    return attendanceRecords.reduce((acc, record) => {
      const monthYearKey = format(record.date, 'MMMM yyyy');
      if (!acc[monthYearKey]) {
        acc[monthYearKey] = [];
      }
      acc[monthYearKey].push(record);
      return acc;
    }, {});
  }, [attendanceRecords]);


  const getStatusClasses = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'absent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'half_day': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'on_leave': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'permission': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'holiday': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'weekend': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'absent': return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'half_day': return <MinusCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'on_leave': return <CalendarDaysIcon className="w-5 h-5 text-blue-500" />;
      case 'permission': return <ClockIcon className="w-5 h-5 text-purple-500" />;
      default: return <CalendarDaysIcon className="w-5 h-5 text-gray-500" />;
    }
  };

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
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
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
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-300">
            <p>Loading attendance records...</p>
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
                        {record.lateArrival && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            Late
                          </span>
                        )}
                        {record.earlyDeparture && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                            Early
                          </span>
                        )}
                        {record.unplannedAbsence && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            Unplanned Absent
                          </span>
                        )}
                        {record.totalWorkHours && record.status === 'present' && (
                          <span className="text-gray-600 dark:text-gray-300">
                            {record.totalWorkHours.toFixed(2)} hrs
                          </span>
                        )}
                        {record.remarks && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs italic">
                                ({record.remarks})
                            </span>
                        )}
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