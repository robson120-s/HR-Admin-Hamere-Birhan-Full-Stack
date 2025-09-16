// File: app/(HR)/hr/dashboard/page.jsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link"; // Ensure Link is imported
import Image from "next/image"; // Ensure Image is imported

// Adjust these paths based on your actual project structure
import { getDashboardData, addMeeting, deleteMeeting as apiDeleteMeeting } from "../../../lib/api";
import toast from "react-hot-toast";

// UI Components (adjust paths)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

// Lucide Icons (adjust imports if you've consolidated them)
import {
  Users, Building, User, GraduationCap, CalendarOff, Briefcase, Bell, ArrowRight,
  Hourglass, AlertCircle, LoaderCircle, Calendar as CalendarIcon, Phone, Plus, Trash2, Info, Sun
} from "lucide-react";

// Dashboard-specific components (adjust paths)
import ThemeToggle from "./components/ThemeToggle";
import LoadingSpinner from "./loading"; // Assuming loading.jsx defines a default export for a loading spinner

// Import the reusable DashboardCalendar component
import { DashboardCalendar } from "./components/DashboardCalendar";

// Dynamically import potentially heavy components
const AttendanceChart = dynamic(() => import("./components/AttendanceChart"), { ssr: false });
const MeetingSchedule = dynamic(() => import("./components/MeetingSchedule"), { ssr: false });


// ==============================================================================
// Sub-Components (Defined here for clarity, can be moved to separate files)
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
                <RequestItem count={data.pendingLeaves || 0} label="Leave Requests" href="/hr/leave_request" icon={<CalendarOff size={20} />} />
                <RequestItem count={data.pendingOvertimes || 0} label="Overtime Approvals" href="/hr/overtime-approval" icon={<Hourglass size={20} />} />
                <RequestItem count={data.pendingComplaints || 0} label="Open & In-Review Complaints" href="/hr/complain_received" icon={<AlertCircle size={20} />} />
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-blue-500" /> Key Contacts (Department Heads)</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[24rem] overflow-y-auto pr-2">
                {(!heads || heads.length === 0) ? (<p className="text-sm text-center text-slate-400 py-8">No department heads found.</p>) : (heads.map(head => (<HeadContactCard key={head.id} head={head} />)))}
            </CardContent>
        </Card>
    );
};

// ==============================================================================
// MAIN HR DASHBOARD PAGE COMPONENT
// ==============================================================================
export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true); // Always set loading to true when starting a fetch
    try {
      const data = await getDashboardData();
      setDashboardData(data);
      console.log("HR Dashboard data fetched:", data);
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array for useCallback, so it doesn't re-create

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Correctly triggers fetchData on mount

  // Prepare events for the DashboardCalendar (meetings + holidays)
  const calendarEvents = useMemo(() => {
    const events = [];
    if (dashboardData?.meetings) {
      dashboardData.meetings.forEach(meeting => {
        events.push({
          id: `meeting-${meeting.id}`,
          type: 'meeting',
          date: meeting.date,
          title: meeting.title,
          time: meeting.time // Assuming meeting has a time property
        });
      });
    }
    if (dashboardData?.holidays) {
      dashboardData.holidays.forEach(holiday => {
        events.push({
          id: `holiday-${holiday.id}`,
          type: 'holiday',
          date: holiday.date,
          title: holiday.name,
          // No time for holidays usually
        });
      });
    }
    return events;
  }, [dashboardData]);


  if (isLoading) {
    return <LoadingSpinner />; // Make sure LoadingSpinner path is correct
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
      <div className="max-w-7xl mx-auto"> {/* Added max-w-7xl mx-auto for content width control */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">📊 HR Dashboard</h1>
          <ThemeToggle /> {/* Adjust path to ThemeToggle if needed */}
        </header>

        {/* Row 1: The "At a Glance" Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <SummaryCard title="Total Employees" value={dashboardData.totalEmployees} icon={<Users className="w-8 h-8 text-blue-500"/>} href="/hr/emp_profile_list" colorClass="border-t-4 border-blue-500" />
          <SummaryCard title="Main Departments" value={dashboardData.totalMainDepartments} icon={<Building className="w-8 h-8 text-purple-500"/>} href="/hr/departments" colorClass="border-t-4 border-purple-500" />
          <SummaryCard title="Sub-Departments" value={dashboardData.totalSubDepartments} icon={<Briefcase className="w-8 h-8 text-indigo-500"/>} href="/hr/departments" colorClass="border-t-4 border-indigo-500" />
          <SummaryCard title="Staff (incl. Heads)" value={dashboardData.totalStaff} icon={<User className="w-8 h-8 text-emerald-500"/>} href="/hr/emp_profile_list" colorClass="border-t-4 border-emerald-500" />
          <SummaryCard title="Total Interns" value={dashboardData.totalIntern} icon={<GraduationCap className="w-8 h-8 text-orange-500"/>} href="/hr/emp_profile_list" colorClass="border-t-4 border-orange-500" />
          <SummaryCard title="On Leave Today" value={dashboardData.totalOnLeave} icon={<CalendarOff className="w-8 h-8 text-rose-500"/>} href="/hr/leave_request" colorClass="border-t-4 border-rose-500" />
        </div>

        {/* Row 2: The "Action" Zone (Attendance Chart + Pending Requests) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
          <div className="lg:col-span-2">
              <AttendanceChart data={dashboardData.presentPerDepartment} />
          </div>
          <div>
              <PendingRequestsCard data={dashboardData} />
          </div>
        </div>

        {/* Row 3: Meeting Schedule and Company Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-start">
          <div>
              <MeetingSchedule
                  meetings={dashboardData.meetings || []}
                  onUpdate={fetchData}
              />
          </div>
          <div>
              {/* This is where the minimized DashboardCalendar is used */}
              <DashboardCalendar events={calendarEvents} />
          </div>
        </div>

        {/* Row 4: Key Contacts (Department Heads) */}
        <div className="mt-8">
          <DepartmentHeadsCard heads={dashboardData.departmentHeads || []} />
        </div>
      </div> {/* End max-w-7xl mx-auto */}
    </div>
  );
}