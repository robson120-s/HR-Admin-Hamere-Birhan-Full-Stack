"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Import centralized mock data
import { mockSummary, meetingsData } from "../../../lib/mockData";
// Import lightweight components
import SummaryCard from "./components/SummaryCard";
import ThemeToggle from "./components/ThemeToggle";
import FullListView from "./components/FullListView";
import InfoWidgets from "./components/InfoWidgets";
import LoadingSpinner from "./loading";

// Dynamically import heavy components for performance
const AttendanceChart = dynamic(() => import("./components/AttendanceChart"), {
  loading: () => <div className="h-[468px] w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />,
  ssr: false, // This component uses browser APIs, so disable SSR for it
});

const MeetingSchedule = dynamic(() => import("./components/MeetingSchedule"), {
  loading: () => <div className="h-[300px] w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />,
});

const DashboardCalendar = dynamic(() => import("./components/DashboardCalendar"), {
  loading: () => <div className="h-[300px] w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />,
});


export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For now, we set it from our imported mock data
    setData(mockSummary);
  }, []);

  if (!data) {
    return <LoadingSpinner />;
  }

  // If a list (staff/interns) is selected, show only the list view
  if (selectedList) {
    return (
      <FullListView
        listType={selectedList}
        list={selectedList === "staff" ? data.staffList : data.internList}
        onBack={() => setSelectedList(null)}
      />
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors relative">
      <ThemeToggle />

      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        📊 HR Dashboard
      </h1>

      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <SummaryCard title="Total Employee" value={data.totalEmployee} color="bg-yellow-100 dark:bg-yellow-800" onClick={() => router.push("/employee")} />
        <SummaryCard title="Departments" value={data.totalDepartments} color="bg-blue-100 dark:bg-blue-800" onClick={() => router.push("/departments")} />
        <SummaryCard title="Total Staff" value={data.totalStaff} color="bg-green-100 dark:bg-green-800" onClick={() => setSelectedList("staff")} />
        <SummaryCard title="Total Interns" value={data.totalInterns} color="bg-purple-100 dark:bg-purple-800" onClick={() => setSelectedList("interns")} />
        <SummaryCard title="On Leave" value={data.totalOnLeave} color="bg-red-100 dark:bg-red-800" onClick={() => router.push("/leave")} />
      </div>

      {/* Row 2: Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <InfoWidgets />
        <AttendanceChart data={data.attendanceByDepartment} />
      </div>

      {/* Row 3: Meetings and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MeetingSchedule initialMeetings={meetingsData} />
        <DashboardCalendar />
      </div>
    </div>
  );
}