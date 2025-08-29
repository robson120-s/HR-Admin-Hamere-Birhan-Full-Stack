"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { getDashboardData } from "../../../lib/api";
import { addMeeting, deleteMeeting as apiDeleteMeeting } from "../../../lib/api"; 
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Users, Building, User, GraduationCap, CalendarOff, Briefcase, Bell, ArrowRight,
  Hourglass, AlertCircle, LoaderCircle, Calendar as CalendarIcon, Sun, Phone, CalendarCheck2 ,Plus, Trash2, Info
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";
import LoadingSpinner from "./loading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import {Button} from "../../../components/ui/button";
import {Input} from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./components/calendar.css";
import Image from "next/image";

// ==============================================================================
// ALL SUB-COMPONENTS ARE DEFINED HERE
// ==============================================================================

const SummaryCard = ({ title, value, icon, href, colorClass }) => (
  <Link href={href} className="block group">
    <div className={`relative p-5 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-slate-800/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${colorClass}`}>
      <div className="relative z-10">
        <div className="mb-4">{icon}</div>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{title}</p>
      </div>
    </div>
  </Link>
);

const PendingRequestsCard = ({ data }) => {
    const RequestItem = ({ count, label, href, icon }) => (
        <Link href={href} className="block group">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3"><div className="text-slate-500">{icon}</div><span className="font-medium text-slate-700 dark:text-slate-200">{label}</span></div>
                <div className="flex items-center gap-2"><span className={`font-bold text-lg ${count > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-800 dark:text-slate-100'}`}>{count}</span><ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" /></div>
            </div>
        </Link>
    );
    return (
        <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="text-rose-500"/> Action Required</CardTitle><CardDescription>Items that require your immediate attention.</CardDescription></CardHeader>
            <CardContent className="space-y-2">
                <RequestItem count={data.pendingLeaves || 0} label="Leave Requests" href="/leave-request" icon={<CalendarOff size={20} />} />
                <RequestItem count={data.pendingOvertimes || 0} label="Overtime Approvals" href="/overtime-approval" icon={<Hourglass size={20} />} />
                <RequestItem count={data.pendingComplaints || 0} label="Open & In-Review Complaints" href="/complaints" icon={<AlertCircle size={20} />} />
            </CardContent>
        </Card>
    );
};

const DepartmentHeadsCard = ({ heads }) => {
    const HeadContactCard = ({ head }) => {
        const fullName = `${head.firstName} ${head.lastName}`;
        return (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex items-center gap-4 border dark:border-slate-700">
                <div className="relative w-14 h-14 rounded-full flex-shrink-0">
                    <Image src={head.photo || '/images/default-avatar.png'} alt={fullName} fill className="rounded-full object-cover" sizes="56px"/>
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-white truncate" title={fullName}>{fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 truncate"><Briefcase size={12} />{head.department?.name || 'N/A'}</p>
                    <a href={`tel:${head.phone}`} className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold group mt-1"><Phone size={14} /><span className="group-hover:underline">{head.phone || 'No phone'}</span></a>
                </div>
            </div>
        );
    };
    return (
        <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-blue-500" /> Key Contacts</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[24rem] overflow-y-auto pr-2">
                {(!heads || heads.length === 0) ? (<p className="text-sm text-center text-slate-400 py-8">No department heads found.</p>) : (heads.map(head => (<HeadContactCard key={head.id} head={head} />)))}
            </CardContent>
        </Card>
    );
};

const toDateString = (date) => new Date(date).toISOString().split('T')[0];

const DashboardCalendar = ({ holidays = [] }) => {
    const [value, onChange] = useState(new Date());

    const holidayDates = useMemo(() => {
        const dates = new Set();
        holidays.forEach(h => dates.add(toDateString(h.date)));
        return dates;
    }, [holidays]);

    const tileClassName = ({ date, view }) => {
        if (view === 'month' && holidayDates.has(toDateString(date))) {
            return 'holiday-tile'; // Custom class for styling
        }
        return null;
    };
    
    const upcomingHolidays = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        return holidays
            .filter(h => new Date(h.date) >= today)
            .slice(0, 4); // Show the next 4 upcoming holidays
    }, [holidays]);

    return (
        <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarIcon className="text-indigo-500" /> Company Calendar</CardTitle></CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0 mx-auto">
                    <Calendar onChange={onChange} value={value} tileClassName={tileClassName} className="rounded-lg shadow-inner bg-slate-50 dark:bg-slate-900/50" />
                </div>
                <div className="flex-1 min-w-0 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 dark:border-slate-700">
                    <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">Upcoming Holidays</h3>
                    <div className="space-y-3">
                        {upcomingHolidays.length > 0 ? (
                            upcomingHolidays.map(h => (
                                <div key={h.id} className="flex items-center gap-3 text-sm">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600"><Sun size={16} /></div>
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-300">{h.name}</p>
                                        <p className="text-xs text-slate-500">{new Date(h.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (<p className="text-sm text-slate-400 text-center py-8">No upcoming holidays scheduled.</p>)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Dynamically import heavy components
const AttendanceChart = dynamic(() => import("./components/AttendanceChart"), { ssr: false });
const MeetingSchedule = dynamic(() => import("./components/MeetingSchedule"), { ssr: false });

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

const fetchData = useCallback(async () => {
  if (!dashboardData) setIsLoading(true);
  try {
    const data = await getDashboardData();
    setDashboardData(data);
    console.log("Dashboard data:", data); // Add this to see what's in the response
    console.log("Meetings data:", data.meetings); // Specifically check meetings
  } catch (err) {
    toast.error(err.message || "Failed to load dashboard data.");
  } finally {
    setIsLoading(false);
  }
}, [dashboardData]);

  // ✅ CORRECTED: This useEffect now correctly fetches data only once on initial mount
  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: Could not load dashboard data. Please try refreshing.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">📊 HR Dashboard</h1>
        <ThemeToggle />
      </header>

      {/* Row 1: The "At a Glance" Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <SummaryCard title="Total Employees" value={dashboardData.totalEmployees} icon={<Users className="w-8 h-8 text-blue-500"/>} href="/emp_profile_list" colorClass="border-t-4 border-blue-500" />
        <SummaryCard title="Main Departments" value={dashboardData.totalMainDepartments} icon={<Building className="w-8 h-8 text-purple-500"/>} href="/departments" colorClass="border-t-4 border-purple-500" />
        <SummaryCard title="Sub-Departments" value={dashboardData.totalSubDepartments} icon={<Briefcase className="w-8 h-8 text-indigo-500"/>} href="/departments" colorClass="border-t-4 border-indigo-500" />
        <SummaryCard title="Staff (incl. Heads)" value={dashboardData.totalStaff} icon={<User className="w-8 h-8 text-emerald-500"/>} href="/emp_profile_list" colorClass="border-t-4 border-emerald-500" />
        <SummaryCard title="Total Interns" value={dashboardData.totalIntern} icon={<GraduationCap className="w-8 h-8 text-orange-500"/>} href="/emp_profile_list" colorClass="border-t-4 border-orange-500" />
        <SummaryCard title="On Leave Today" value={dashboardData.totalOnLeave} icon={<CalendarOff className="w-8 h-8 text-rose-500"/>} href="/leave-request" colorClass="border-t-4 border-rose-500" />
      </div>

       {/* Row 2: The "Action" Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
        <div className="lg:col-span-2">
            <AttendanceChart data={dashboardData.presentPerDepartment} />
        </div>
        <div>
            <PendingRequestsCard data={dashboardData} />
        </div>
      </div>

      {/* Row 3: The "Information" Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
            {/* ✅ Use meetings from dashboardData */}
            <MeetingSchedule 
                meetings={dashboardData.meetings || []} 
                onUpdate={fetchData} 
            />
        </div>
        <div>
            {/* ✅ We now pass the holidays data from the dashboard fetch */}
            <DashboardCalendar holidays={dashboardData.holidays || []} />
        </div>
      </div>

       {/* Row 4: Key Contacts */}
      <div className="mt-8">
        <DepartmentHeadsCard heads={dashboardData.departmentHeads || []} />
      </div>
    </div>
  );
}