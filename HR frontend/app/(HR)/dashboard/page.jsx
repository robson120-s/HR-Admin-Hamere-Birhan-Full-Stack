"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// --- CHANGE 1: Import the new API function, remove mock data imports ---
import { getDashboardData } from "../../../lib/api";


// Import lightweight components
import SummaryCard from "./components/SummaryCard";
import ThemeToggle from "./components/ThemeToggle";
// import FullListView from "./components/FullListView";
import InfoWidgets from "./components/InfoWidgets";
import LoadingSpinner from "./loading";
import { meetingsData } from "../../../lib/mockData"; // Keep this for now, see note below

// Dynamically import heavy components
const AttendanceChart = dynamic(() => import("./components/AttendanceChart"), { /* ... */ });
const MeetingSchedule = dynamic(() => import("./components/MeetingSchedule"), { /* ... */ });
const DashboardCalendar = dynamic(() => import("./components/DashboardCalendar"), { /* ... */ });

export default function DashboardPage() {
  const router = useRouter();

  // --- CHANGE 2: Add states for loading, error, and the fetched data ---
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- CHANGE 3: Use useEffect to fetch data when the page loads ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // The empty array [] means this effect runs only once on mount

  // --- CHANGE 4: Add UI states for Loading and Error ---
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  // If a list (staff/interns) is selected, show only the list view
  // NOTE: This part needs data from another API endpoint (e.g., /api/hr/employees?role=staff)
  // For now, it will not function as we don't have the lists.
  // if (selectedList) { ... }

  // --- CHANGE 5: Pass REAL data as props to the components ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors relative">
      <ThemeToggle />

      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        📊 HR Dashboard
      </h1>

      {/* Row 1: Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <SummaryCard title="Total Employee" value={dashboardData.totalEmployees} color="bg-yellow-100 dark:bg-yellow-800" />
        <SummaryCard title="Departments" value={dashboardData.totalDepartments} color="bg-blue-100 dark:bg-blue-800" />
        <SummaryCard title="Total Staff" value={dashboardData.totalStaff} color="bg-green-100 dark:bg-green-800" />
        <SummaryCard title="Total Interns" value={dashboardData.totalIntern} color="bg-purple-100 dark:bg-purple-800" />
        <SummaryCard title="On Leave Today" value={dashboardData.totalOnLeave} color="bg-red-100 dark:bg-red-800" />
      </div>

      {/* Row 2: Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <InfoWidgets data={dashboardData} />
        <AttendanceChart data={dashboardData.presentPerDepartment} />
      </div>

      {/* Row 3: Meetings and Calendar */}
      {/* Note: Your backend doesn't provide meeting data, so we keep using mock data for now. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MeetingSchedule initialMeetings={meetingsData} />
        <DashboardCalendar />
      </div>
    </div>
  );
}