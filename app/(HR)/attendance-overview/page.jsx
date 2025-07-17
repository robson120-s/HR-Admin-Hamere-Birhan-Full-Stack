"use client";

import { useEffect, useState } from "react";
import { staffList, internList, records, totalPresent, totalAbsent, totalUsers } from "../mockup";

export default function AttendanceOverviewPage() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 at first

  useEffect(() => {
    const mockData = {
      totalPresent,
      totalAbsent,
      totalUsers,
      records,
      staffList,
      internList,
    };
    setAttendanceData(mockData);
  }, []);

  if (!attendanceData) return <div className="p-6">Loading attendance overview...</div>;

  // If a list is selected
  if (selectedList) {
    let filteredRecords = [];
    let title = "";

    if (selectedList === "present") {
      filteredRecords = (attendanceData.records || []).filter((r) => r.status === "Present");
      title = "Present Users";
    } else if (selectedList === "absent") {
      filteredRecords = (attendanceData.records || []).filter((r) => r.status === "Absent");
      title = "Absent Users";
    } else if (selectedList === "staff") {
      filteredRecords = attendanceData.staffList || [];
      title = "Staff List";
    }

    const displayedRecords = filteredRecords.slice(0, visibleCount);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{title}</h1>

        <button
          onClick={() => {
            setSelectedList(null);
            setVisibleCount(5);
          }}
          className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          ← Back to Overview
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 transition-colors">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="border-b p-2 text-gray-700 dark:text-gray-300">Name</th>
                <th className="border-b p-2 text-gray-700 dark:text-gray-300">Department</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-2 border-b text-gray-800 dark:text-gray-100">{record.name}</td>
                  <td className="p-2 border-b text-gray-800 dark:text-gray-100">{record.department}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleCount < filteredRecords.length && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                See More
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">🗓️ Attendance Overview</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <Card
          title="Total Present"
          value={attendanceData.totalPresent}
          color="bg-green-100 dark:bg-green-800"
          onClick={() => setSelectedList("present")}
        />
        <Card
          title="Total Absent"
          value={attendanceData.totalAbsent}
          color="bg-red-100 dark:bg-red-800"
          onClick={() => setSelectedList("absent")}
        />
        <Card
          title="Total Staff"
          value={attendanceData.totalUsers}
          color="bg-blue-100 dark:bg-blue-800"
          onClick={() => setSelectedList("staff")}
        />
      </div>

      {/* Attendance list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Today’s Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="border-b p-2 text-gray-700 dark:text-gray-300">Name</th>
                <th className="border-b p-2 text-gray-700 dark:text-gray-300">Department</th>
              </tr>
            </thead>
            <tbody>
              {(attendanceData.records || []).map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-2 border-b text-gray-800 dark:text-gray-100">{record.name}</td>
                  <td className="p-2 border-b text-gray-800 dark:text-gray-100">{record.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color, onClick }) {
  return (
    <div
      className={`${color} p-6 rounded-2xl shadow transition-transform hover:scale-105 cursor-pointer`}
      onClick={onClick}
    >
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
