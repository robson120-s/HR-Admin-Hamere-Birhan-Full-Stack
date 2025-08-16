"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

// Theme icons
function SunIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="orange" width={24} height={24}>
      <circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" />
      <path stroke="orange" strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" width={24} height={24}>
      <path
        stroke="purple"
        strokeWidth="2"
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
      />
    </svg>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState(null);

  // Theme state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mock data simulating fetched attendance report
    const mockReport = {
      totalStaff: 25,
      totalInterns: 10,
      totalDepartments: 5,
      attendanceSummary: {
        present: 30,
        absent: 3,
        late: 2,
        permission: 5,
      },
      departments: [
        {
          name: "Engineering",
          present: 10,
          absent: 1,
          late: 1,
          permission: 2,
          totalStaff: 14,
        },
        {
          name: "HR",
          present: 8,
          absent: 1,
          late: 0,
          permission: 1,
          totalStaff: 10,
        },
        {
          name: "Marketing",
          present: 12,
          absent: 1,
          late: 1,
          permission: 2,
          totalStaff: 16,
        },
        {
          name: "Finance",
          present: 7,
          absent: 0,
          late: 0,
          permission: 0,
          totalStaff: 8,
        },
        {
          name: "Operations",
          present: 13,
          absent: 0,
          late: 0,
          permission: 0,
          totalStaff: 13,
        },
      ],
    };

    setData(mockReport);
  }, []);

  if (!mounted || !data) return <div className="p-6">Loading reports...</div>;

  // Colors for attendance categories
  const COLORS = {
    present: "#22c55e", // green
    absent: "#ef4444",  // red
    late: "#f59e0b",    // amber
    permission: "#3b82f6", // blue
  };

  // Prepare pie data from attendanceSummary
  const pieData = Object.entries(data.attendanceSummary).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: COLORS[key],
  }));

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 max-w-7xl mx-auto relative">
      {/* Theme icons at top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-8">Attendance Reports</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Total Staff" value={data.totalStaff} color="green" />
        <SummaryCard title="Total Interns" value={data.totalInterns} color="blue" />
        <SummaryCard title="Departments" value={data.totalDepartments} color="yellow" />
      </div>

      {/* Attendance pie chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-6">Overall Attendance Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Department attendance bar chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-6">Department-wise Attendance</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.departments} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" stackId="a" fill={COLORS.present} />
            <Bar dataKey="absent" stackId="a" fill={COLORS.absent} />
            <Bar dataKey="late" stackId="a" fill={COLORS.late} />
            <Bar dataKey="permission" stackId="a" fill={COLORS.permission} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed department attendance table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Department Attendance Details</h2>
        <table className="w-full table-auto border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-3">Department</th>
              <th className="p-3">Present</th>
              <th className="p-3">Absent</th>
              <th className="p-3">Late</th>
              <th className="p-3">Permission</th>
              <th className="p-3">Total Staff</th>
            </tr>
          </thead>
          <tbody>
            {data.departments.map(({ name, present, absent, late, permission, totalStaff }) => (
              <tr
                key={name}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-3 font-medium">{name}</td>
                <td className="p-3">{present}</td>
                <td className="p-3">{absent}</td>
                <td className="p-3">{late}</td>
                <td className="p-3">{permission}</td>
                <td className="p-3">{totalStaff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  const bgColors = {
    green: "bg-green-100 dark:bg-green-800",
    blue: "bg-blue-100 dark:bg-blue-800",
    yellow: "bg-yellow-100 dark:bg-yellow-700",
  };
  const textColors = {
    green: "text-green-700 dark:text-green-300",
    blue: "text-blue-700 dark:text-blue-300",
    yellow: "text-yellow-700 dark:text-yellow-300",
  };
  return (
    <div
      className={`${bgColors[color]} p-6 rounded-2xl shadow flex flex-col items-center`}
    >
      <h3 className={`${textColors[color]} font-semibold text-lg`}>{title}</h3>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}