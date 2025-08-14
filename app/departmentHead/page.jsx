"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card";
import {
  UserCheck,
  UserX,
  Users,
  User2,
  AlertCircle,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
} from "lucide-react";
import Sidebar from "./Sidebar";

// PerformanceCard component with icon support
function PerformanceCard({ title, score, icon }) {
  return (
    <Card className="text-center w-48 border border-green-500 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-col items-center gap-2">
        <div className="text-green-600 dark:text-green-400">{icon}</div>
        <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-green-700 dark:text-green-500">
          {score.toFixed(1)}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DepartmentHeadDashboard() {
  const [darkMode, setDarkMode] = useState(false);

  const [data, setData] = useState({
    present: 20,
    absent: 5,
    totalInterns: 50,
    totalStaff: 10,
    pendingComplaints: 3,
    avgPerformance: 8.4,
    recentActivity: [
      {
        id: 1,
        type: "Complaint",
        message: "Intern A reported workload issue",
        date: "2025-08-05",
      },
      {
        id: 2,
        type: "Attendance",
        message: "Staff B marked present",
        date: "2025-08-06",
      },
      {
        id: 3,
        type: "Performance",
        message: "Staff C received a score of 9",
        date: "2025-08-07",
      },
      {
        id: 4,
        type: "Complaint",
        message: "Complaint resolved by Dept Head",
        date: "2025-08-07",
      },
    ],
    staffAvg: 7.8,
    internAvg: 6.5,
  });

  const activityIcons = {
    Complaint: <AlertCircle className="w-6 h-6 text-yellow-600" />,
    Attendance: <CheckCircle className="w-6 h-6 text-green-600" />,
    Performance: <Star className="w-6 h-6 text-teal-600" />,
    Resolved: <XCircle className="w-6 h-6 text-red-600" />,
    Default: <MessageSquare className="w-6 h-6 text-gray-500" />,
  };

  // Theme toggle effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto relative">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun className="w-6 h-6 text-yellow-500" />
          ) : (
            <Moon className="w-6 h-6 text-gray-800" />
          )}
        </button>

        <h1 className="text-3xl font-bold mb-8 text-green-800 dark:text-green-400">
          Department Head Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-10">
          {/* Present */}
          <Card className="text-center border border-green-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <UserCheck className="mx-auto text-green-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-green-800 dark:text-green-300 font-semibold">
                Present
              </CardTitle>
              <p className="text-2xl font-bold text-green-700 dark:text-green-500">
                {data.present}
              </p>
            </CardContent>
          </Card>

          {/* Absent */}
          <Card className="text-center border border-red-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <UserX className="mx-auto text-red-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-red-800 dark:text-red-400 font-semibold">
                Absent
              </CardTitle>
              <p className="text-2xl font-bold text-red-700 dark:text-red-500">
                {data.absent}
              </p>
            </CardContent>
          </Card>

          {/* Total Interns */}
          <Card className="text-center border border-blue-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <Users className="mx-auto text-blue-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-blue-800 dark:text-blue-300 font-semibold">
                Total Interns
              </CardTitle>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-500">
                {data.totalInterns}
              </p>
            </CardContent>
          </Card>

          {/* Total Staff */}
          <Card className="text-center border border-purple-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <User2 className="mx-auto text-purple-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-purple-800 dark:text-purple-300 font-semibold">
                Total Staff
              </CardTitle>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-500">
                {data.totalStaff}
              </p>
            </CardContent>
          </Card>

          {/* Pending Complaints */}
          <Card className="text-center border border-yellow-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <AlertCircle className="mx-auto text-yellow-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-yellow-800 dark:text-yellow-300 font-semibold">
                Pending Complaints
              </CardTitle>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-500">
                {data.pendingComplaints}
              </p>
            </CardContent>
          </Card>

          {/* Average Performance */}
          <Card className="text-center border border-teal-300 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <Star className="mx-auto text-teal-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-teal-800 dark:text-teal-300 font-semibold">
                Avg. Performance
              </CardTitle>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-500">
                {data.avgPerformance.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Cards */}
        <div className="mb-10 flex gap-6 flex-wrap max-w-4xl mx-auto justify-center">
          <PerformanceCard
            title="Staff Performance"
            score={data.staffAvg}
            icon={<User2 className="w-10 h-10" />}
          />
          <PerformanceCard
            title="Intern Performance"
            score={data.internAvg}
            icon={<Users className="w-10 h-10" />}
          />
        </div>

        {/* Recent Activity */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-green-800 dark:text-green-400">
            Recent Activity & Announcements
          </h2>
          <div className="space-y-5">
            {data.recentActivity.length === 0 && (
              <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                No recent activity.
              </p>
            )}
            {data.recentActivity.map(({ id, type, message, date }) => (
              <Card
                key={id}
                className="hover:shadow-lg transition-shadow duration-200 border border-green-300 dark:border-green-700"
              >
                <CardContent className="flex items-center space-x-4">
                  <div>{activityIcons[type] || activityIcons.Default}</div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100">
                      <span className="font-semibold">{type}:</span> {message}
                    </p>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
                    {date}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
