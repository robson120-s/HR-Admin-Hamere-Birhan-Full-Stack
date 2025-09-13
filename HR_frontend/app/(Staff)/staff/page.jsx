// app/staff/DashboardPage.js
'use client';
import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  BellIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import DashboardCalendar from './components/DashBoardCalendar';
// Import the updated API functions
import { fetchStaffDashboardSummary, fetchHolidays, fetchRecentActivities } from '../../../lib/api'; // Path to lib/api.js

export default function DashboardPage() {
  // TODO: IMPORTANT: Replace this with the actual logged-in employee ID from your authentication context.
  // This could come from a global state, context provider, or decoded JWT.
  const employeeId = 1; // Placeholder employee ID for demonstration

  const [userName, setUserName] = useState('Staff Member');
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(0);
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    lastSeen: 'N/A',
    absencesThisWeek: 0,
  });
  const [holidays, setHolidays] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!employeeId) {
          throw new Error('Employee ID not available for fetching dashboard data.');
        }

        const summaryData = await fetchStaffDashboardSummary(employeeId);
        setUserName(summaryData.userName);
        setStats({
          totalPresent: summaryData.totalPresent,
          totalAbsent: summaryData.totalAbsent,
          lastSeen: summaryData.lastSeen,
          absencesThisWeek: summaryData.absencesThisWeek,
        });
        setNotifications(summaryData.notifications);

        const holidaysData = await fetchHolidays();
        setHolidays(holidaysData.map(h => ({ ...h, date: new Date(h.date) })));

        const activitiesData = await fetchRecentActivities(employeeId);
        setRecentActivities(activitiesData);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || 'Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Welcome back, {userName}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              className="relative p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              aria-label={`View ${notifications} notifications`}
            >
              <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-bounce">
                  {notifications}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              title="Toggle theme"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <MoonIcon className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Present Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Present (This Month)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalPresent}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Absent Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Absent (This Month)</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.totalAbsent}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <UserIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Last Seen Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Last Seen (Attendance)</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stats.lastSeen}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Absences This Week Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Absences This Week</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.absencesThisWeek}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dashboard Calendar */}
          <DashboardCalendar holidays={holidays} />

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Activities</h2>
            <ul>
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <li key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 gap-2">
                    <div className="flex items-center space-x-3">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                      ${activity.status === 'On time' || activity.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                         activity.status === 'Pending' || activity.status === 'Late' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                         'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {activity.status}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No recent activities.</p>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}