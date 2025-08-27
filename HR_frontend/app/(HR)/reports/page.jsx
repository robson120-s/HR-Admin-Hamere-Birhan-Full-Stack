// /reports/page.jsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { getAttendanceReport } from "../../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import { LoaderCircle, Sun, Moon } from "lucide-react";


function SummaryCard({ title, value, color }) {
  const bgColors = {
    green: "bg-green-100 dark:bg-green-900/50",
    blue: "bg-blue-100 dark:bg-blue-900/50",
    yellow: "bg-yellow-100 dark:bg-yellow-900/50",
  };
  const textColors = {
    green: "text-green-700 dark:text-green-300",
    blue: "text-blue-700 dark:text-blue-300",
    yellow: "text-yellow-700 dark:text-yellow-300",
  };
  return (
    <div
      className={`${bgColors[color]} p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center`}
    >
      <h3 className={`${textColors[color]} font-semibold text-lg text-center`}>{title}</h3>
      <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [timeframe, setTimeframe] = useState("weekly");
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  const fetchReport = useCallback(async (frame) => {
    setIsLoading(true);
    try {
      const data = await getAttendanceReport(frame);
      setReportData(data);
    } catch (error) {
      toast.error(error.message);
      setReportData(null); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(timeframe);
  }, [timeframe, fetchReport]);

  if (!mounted) {
    // Render a placeholder or null to avoid hydration mismatch with theme switcher
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900"></div>;
  }

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" />
        </div>
    );
  }

  if (!reportData) {
      return (
          <div className="min-h-screen flex items-center justify-center text-red-500 p-8">
              Failed to load report data. Please try refreshing the page.
          </div>
      )
  }

  const COLORS = theme === 'dark' 
    ? { present: "#22c55e", absent: "#ef4444", late: "#f59e0b", on_leave: "#a855f7" }
    : { present: "#4ade80", absent: "#f87171", late: "#fbbf24", on_leave: "#c084fc" };
  
  const pieData = Object.entries(reportData.overallAttendance).map(([key, value]) => ({
    name: key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1),
    value,
    color: COLORS[key],
  }));

  const departmentChartData = timeframe === 'monthly' ? reportData.allDepartments : reportData.departmentAttendance;

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 max-w-7xl mx-auto relative">


      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-4xl font-bold">Attendance Report</h1>
            <p className="text-sm text-slate-500 mt-1">
                Displaying {timeframe} data.
            </p>
        </div>
        <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-200 dark:bg-slate-800">
            <button onClick={() => setTimeframe('weekly')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${timeframe === 'weekly' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Weekly</button>
            <button onClick={() => setTimeframe('monthly')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${timeframe === 'monthly' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-600 dark:text-slate-300'}`}>Monthly</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Total Staff" value={reportData.totalStaff} color="green" />
        <SummaryCard title="Total Interns" value={reportData.totalInterns} color="blue" />
        <SummaryCard title="Top-Level Departments" value={reportData.totalTopLevelDepartments} color="yellow" />
      </div>

      {timeframe === 'weekly' && (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6">This Week's Overall Attendance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value, name) => [value, name]}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6">This Week's Attendance (Top-Level Depts)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportData.departmentAttendance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: '1px solid #334155' }} />
                <Legend />
                <Bar dataKey="present" stackId="a" fill={COLORS.present} name="Present" />
                <Bar dataKey="absent" stackId="a" fill={COLORS.absent} name="Absent" />
                <Bar dataKey="late" stackId="a" fill={COLORS.late} name="Late" />
                <Bar dataKey="on_leave" stackId="a" fill={COLORS.on_leave} name="On Leave" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {timeframe === 'monthly' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Monthly Attendance Summary (All Depts)</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700 bg-slate-50 dark:bg-slate-700/50">
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 text-center font-semibold">Present</th>
                  <th className="p-3 text-center font-semibold">Absent</th>
                  <th className="p-3 text-center font-semibold">Late</th>
                  <th className="p-3 text-center font-semibold">On Leave</th>
                </tr>
              </thead>
              <tbody>
                {/* Note: The backend logic for departmentAttendance will need to be adjusted for monthly view to show all depts */}
                {reportData.departmentAttendance.map((dept) => (
                  <tr key={dept.name} className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700">
                    <td className="p-3 font-medium">{dept.name}</td>
                    <td className="p-3 text-center">{dept.present}</td>
                    <td className="p-3 text-center">{dept.absent}</td>
                    <td className="p-3 text-center">{dept.late}</td>
                    <td className="p-3 text-center">{dept.on_leave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}