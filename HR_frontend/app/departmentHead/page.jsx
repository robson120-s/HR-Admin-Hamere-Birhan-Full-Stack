// /departmentHead/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"; // Using path alias
import {
  UserCheck,
  UserX,
  Users,
  User2,
  Briefcase,
  AlertCircle,
  Star,
  MessageSquare,
  Sun,
  Moon,
  LoaderCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { getDepHeadDashboard } from "../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import { MeetingBoard } from "./components/MeetingBoard"; // Import the new MeetingBoard component

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

function PerformanceCard({ title, score, icon }) {
  return (
    <Card className="text-center w-full sm:w-48 border border-green-500 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow duration-300">
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

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function DepartmentHeadDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const dashboardData = await getDepHeadDashboard();
      setData(dashboardData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activityIcons = {
    Complaint: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    Attendance: <CheckCircle className="w-6 h-6 text-green-500" />,
    Performance: <Star className="w-6 h-6 text-teal-500" />,
    Resolved: <XCircle className="w-6 h-6 text-red-500" />,
    Default: <MessageSquare className="w-6 h-6 text-gray-500" />,
  };

  if (!mounted) {
    return <div className="flex min-h-screen bg-white dark:bg-gray-900"></div>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">
              Department Head Dashboard
            </h1>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-800" />}
            </button>
        </div>
        
        {!data ? (
            <div className="text-center py-20 text-red-500">
                <p>Could not load dashboard data.</p>
                <p className="text-sm text-slate-400 mt-2">Please try refreshing the page.</p>
            </div>
        ) : (
            <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                  <Card className="text-center border border-green-300 dark:border-green-800 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md">
                    <CardHeader><UserCheck className="mx-auto text-green-600 w-8 h-8" /></CardHeader>
                    <CardContent><CardTitle className="text-base font-semibold">Present Today</CardTitle><p className="text-2xl font-bold">{data.present}</p></CardContent>
                  </Card>
                  <Card className="text-center border border-red-300 dark:border-red-800 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md">
                    <CardHeader><UserX className="mx-auto text-red-600 w-8 h-8" /></CardHeader>
                    <CardContent><CardTitle className="text-base font-semibold">Absent Today</CardTitle><p className="text-2xl font-bold">{data.absent}</p></CardContent>
                  </Card>
                  <Card className="text-center border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md">
                    <CardHeader><Users className="mx-auto text-blue-600 w-8 h-8" /></CardHeader>
                    <CardContent><CardTitle className="text-base font-semibold">Total Interns</CardTitle><p className="text-2xl font-bold">{data.totalInterns}</p></CardContent>
                  </Card>
                  <Card className="text-center border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md">
                    <CardHeader><User2 className="mx-auto text-purple-600 w-8 h-8" /></CardHeader>
                    <CardContent><CardTitle className="text-base font-semibold">Total Staff</CardTitle><p className="text-2xl font-bold">{data.totalStaff}</p></CardContent>
                  </Card>
                  <Card className="text-center border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md">
                    <CardHeader><Briefcase className="mx-auto text-indigo-600 w-8 h-8" /></CardHeader>
                    <CardContent><CardTitle className="text-base font-semibold">Sub Departments</CardTitle><p className="text-2xl font-bold">{data.totalSubDepartment}</p></CardContent>
                  </Card>
                </div>

                {/* Performance Cards */}
                <div className="flex flex-wrap justify-center gap-6 mb-10">
                  <PerformanceCard title="Overall Performance" score={data.avgPerformance} icon={<Star className="w-10 h-10" />} />
                  <PerformanceCard title="Staff Performance" score={data.staffAvg} icon={<User2 className="w-10 h-10" />} />
                  <PerformanceCard title="Intern Performance" score={data.internAvg} icon={<Users className="w-10 h-10" />} />
                </div>
                
                {/* Recent Activity & Meeting Board Grid */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Column 1: Meeting Board */}
                    <section>
                        <MeetingBoard />
                    </section>
                    {/* Column 2: Recent Activity */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6 text-green-800 dark:text-green-400">
                            Recent Department Activity
                        </h2>
                        <div className="space-y-4">
                            {data.recentActivity.length === 0 ? (
                            <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                                No recent activity in your department.
                            </p>
                            ) : (
                            data.recentActivity.map(({ id, type, message, date }) => (
                                <Card key={id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-400 dark:border-green-700/50 bg-white dark:bg-slate-800/50">
                                <CardContent className="flex items-center space-x-4 p-4">
                                    <div>{activityIcons[type] || activityIcons.Default}</div>
                                    <div className="flex-1">
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {message}
                                    </p>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                                    {new Date(date).toLocaleDateString()}
                                    </div>
                                </CardContent>
                                </Card>
                            ))
                            )}
                        </div>
                    </section>

                    
                </div>
            </>
        )}
      </main>
    </div>
  );
}