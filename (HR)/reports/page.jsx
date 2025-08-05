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

export default function ReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
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

  if (!data) return <div className="p-6">Loading reports...</div>;

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
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 max-w-7xl mx-auto">
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
