"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "./../../components/ui/card";
import {
  UserCheck, UserX, Users, User2, Briefcase, AlertCircle, Star, MessageSquare, Sun, Moon, LoaderCircle, CheckCircle, XCircle, Clock, CalendarCheck2, History
} from "lucide-react";
import Sidebar from "./Sidebar";
import { getDepHeadDashboard } from "./../../lib/api";
import toast from "react-hot-toast";
import { MeetingBoard } from "./components/MeetingBoard";
import DashboardCalendar from "./components/DashboardCalendar";

// ==============================================================================
// ALL SUB-COMPONENTS ARE DEFINED HERE
// ==============================================================================

const PerformanceCard = ({ title, score, icon }) => (
    <Card className="text-center w-full sm:w-56 border-t-4 border-teal-500 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="flex flex-col items-center gap-2 pt-6"><div className="text-teal-500">{icon}</div><CardTitle className="text-base font-semibold text-slate-600 dark:text-slate-300">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{score > 0 ? score.toFixed(1) : "N/A"}</p><p className="text-xs text-slate-400">Average Score</p></CardContent>
    </Card>
);

const RequestsCard = ({ requests }) => {
    const icons = {
        "Leave approved": <CheckCircle className="text-green-500" />,
        "Leave rejected": <XCircle className="text-red-500" />,
        "Overtime approved": <CheckCircle className="text-green-500" />,
        "Overtime rejected": <XCircle className="text-red-500" />,
    };

    return (
        <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="text-purple-500"/> Recent Request Updates</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {requests.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-8">No recent updates on requests.</p>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="flex items-center gap-3">
                            <div className="flex-shrink-0">{icons[req.type]}</div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {req.message}
                                <span className="block text-xs text-slate-400">{new Date(req.date).toLocaleDateString()}</span>
                            </p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function DepartmentHeadDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
  if (data) {
    console.log("Dashboard data:", data);
    console.log("Holidays data:", data.holiday);
  }
}, [data]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const dashboardData = await getDepHeadDashboard();
      setData(dashboardData);
    } catch (error) { 
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Failed to load dashboard data"); 
    }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activityIcons = {
    ATTENDANCE_MARKED: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
    REVIEW_SUBMITTED: <Star className="w-5 h-5 text-teal-500 flex-shrink-0" />,
    OVERTIME_REQUESTED: <Clock className="w-5 h-5 text-sky-500 flex-shrink-0" />,
    LEAVE_REQUESTED: <CalendarCheck2 className="w-5 h-5 text-orange-500 flex-shrink-0" />,
    COMPLAINT_SUBMITTED: <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
    Default: <MessageSquare className="w-5 h-5 text-gray-500 flex-shrink-0" />,
  };

  // Normalize meetings data to ensure it's always an array with proper structure
  const normalizeMeetings = (meetings) => {
    if (!meetings || !Array.isArray(meetings)) return [];
    
    return meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title || 'Untitled Meeting',
      description: meeting.description || '',
      date: meeting.date,
      time: meeting.time || '00:00 - 00:00',
      creator: meeting.creator || null
    }));
  };

  // Prepare events for the calendar (meetings + holidays)
  const prepareCalendarEvents = (meetings = [], holidays = []) => {
    const meetingEvents = meetings.map(meeting => ({
      id: `meeting-${meeting.id}`,
      date: meeting.date,
      type: 'meeting',
      title: meeting.title
    }));

    const holidayEvents = holidays.map(holiday => ({
      id: `holiday-${holiday.id}`,
      date: holiday.date,
      type: 'holiday',
      title: holiday.name
    }));

    return [...meetingEvents, ...holidayEvents];
  };

  const normalizedMeetings = normalizeMeetings(data?.meetings);
  const calendarEvents = prepareCalendarEvents(data?.meetings, data?.holidays || []);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
            <LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Department Dashboard</h1>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-800" />}
            </button>
        </div>
        
        {!data ? (
            <div className="text-center py-20 text-red-500"><p>Could not load dashboard data.</p><p className="text-sm text-slate-400 mt-2">Please try refreshing the page.</p></div>
        ) : (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                  <Card className="text-center bg-white dark:bg-slate-800/50 shadow-sm"><CardHeader><UserCheck className="mx-auto text-green-600 w-8 h-8" /></CardHeader><CardContent><CardTitle className="text-base font-semibold">Present</CardTitle><p className="text-2xl font-bold">{data.present}</p></CardContent></Card>
                  <Card className="text-center bg-white dark:bg-slate-800/50 shadow-sm"><CardHeader><UserX className="mx-auto text-red-600 w-8 h-8" /></CardHeader><CardContent><CardTitle className="text-base font-semibold">Absent</CardTitle><p className="text-2xl font-bold">{data.absent}</p></CardContent></Card>
                  <Card className="text-center bg-white dark:bg-slate-800/50 shadow-sm"><CardHeader><Users className="mx-auto text-blue-600 w-8 h-8" /></CardHeader><CardContent><CardTitle className="text-base font-semibold">Interns</CardTitle><p className="text-2xl font-bold">{data.totalInterns}</p></CardContent></Card>
                  <Card className="text-center bg-white dark:bg-slate-800/50 shadow-sm"><CardHeader><User2 className="mx-auto text-purple-600 w-8 h-8" /></CardHeader><CardContent><CardTitle className="text-base font-semibold">Staff</CardTitle><p className="text-2xl font-bold">{data.totalStaff}</p></CardContent></Card>
                  <Card className="text-center bg-white dark:bg-slate-800/50 shadow-sm"><CardHeader><Briefcase className="mx-auto text-indigo-600 w-8 h-8" /></CardHeader><CardContent><CardTitle className="text-base font-semibold">Sub-Depts</CardTitle><p className="text-2xl font-bold">{data.totalSubDepartment}</p></CardContent></Card>
                </div>

                <div className="mb-10">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-slate-700 dark:text-slate-300">Performance Snapshot</h2>
                    <div className="flex flex-wrap justify-center gap-6">
                        <PerformanceCard title="Overall Performance" score={data.avgPerformance} icon={<Star className="w-8 h-8" />} />
                        <PerformanceCard title="Staff Performance" score={data.staffAvg} icon={<User2 className="w-8 h-8" />} />
                        <PerformanceCard title="Intern Performance" score={data.internAvg} icon={<Users className="w-8 h-8" />} />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
                    <div className="lg:col-span-2">
                        <MeetingBoard meetings={normalizedMeetings} />
                    </div>
                    <div>
                        <RequestsCard requests={data.actionedRequests || []} />
                    </div>
                </div>

                {/* Calendar and Recent Activity Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                    <div>
                        {/* Replace the existing DashboardCalendar usage with: */}
                        <DashboardCalendar holidays={data?.holiday || []} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 text-slate-700 dark:text-slate-300 flex items-center gap-2"><History/> Recent Activity Feed</h2>
                        <div className="space-y-3">
                            {(data.recentActivity && data.recentActivity.length === 0) ? (
                                <p className="text-center py-6 text-gray-500 dark:text-gray-400">No recent activity to show.</p>
                            ) : (
                                (data.recentActivity || []).map(({ id, type, message, date }) => (
                                    <div key={id} className="flex items-start space-x-4 p-3 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm">
                                        <div>{activityIcons[type] || activityIcons.Default}</div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-800 dark:text-gray-100">{message}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </>
        )}
      </main>
    </div>
  );
}