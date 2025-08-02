"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const mockDepartments = [
  {
    id: "engineering",
    name: "Engineering",
    staffCount: 8,
    internCount: 2,
    staff: [],
    interns: [],
  },
  {
    id: "hr",
    name: "HR",
    staffCount: 5,
    internCount: 1,
    staff: [],
    interns: [],
  },
  {
    id: "marketing",
    name: "Marketing",
    staffCount: 7,
    internCount: 1,
    staff: [],
    interns: [],
  },
  {
    id: "finance",
    name: "Finance",
    staffCount: 6,
    internCount: 1,
    staff: [],
    interns: [],
  },
  {
    id: "operations",
    name: "Operations",
    staffCount: 12,
    internCount: 2,
    staff: [],
    interns: [],
  },
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 🧪 MOCK DATA
    const mockSummary = {
      totalStaff: 25,
      totalInterns: 10,
      totalDepartments: 5,
      attendanceByDepartment: [
        { department: "Engineering", present: 5 },
        { department: "HR", present: 5 },
        { department: "Marketing", present: 7 },
        { department: "Finance", present: 6 },
        { department: "Operations", present: 12 },
      ],
      staffList: [
        { name: "Abebe", department: "Engineering" },
        { name: "Mulu", department: "HR" },
        { name: "Sara", department: "Marketing" },
        { name: "Samuel", department: "Finance" },
        { name: "Lily", department: "Operations" },
        { name: "Binyam", department: "Engineering" },
        { name: "Hana", department: "Marketing" },
      ],
      internList: [
        { name: "Kebede", department: "Finance" },
        { name: "Hana", department: "Engineering" },
        { name: "Selam", department: "HR" },
        { name: "Teddy", department: "Operations" },
        { name: "Mimi", department: "Marketing" },
        { name: "Betty", department: "Finance" },
      ],
    };

    setData(mockSummary);
  }, []);

  if (!data) return <div className="p-6">Loading summary...</div>;

  // If list is selected
  if (selectedList) {
    const list = selectedList === "staff" ? data.staffList : data.internList;
    const displayList = showAll ? list : list.slice(0, 5);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          {selectedList === "staff" ? "Staff List" : "Intern List"}
        </h1>

        <button
          onClick={() => {
            setSelectedList(null);
            setShowAll(false);
          }}
          className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded hover:bg-gray-500 dark:hover:bg-gray-500 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 transition-colors">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="border-b p-2 text-black dark:text-gray-200">Name</th>
                <th className="border-b p-2 text-black dark:text-gray-200">Department</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((person, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                >
                  <td className="p-2 border-b text-black dark:text-gray-100 font-medium">
                    {person.name}
                  </td>
                  <td className="p-2 border-b text-black dark:text-gray-100">
                    {person.department}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* See more/less button */}
          {list.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              {showAll ? "See less" : "See more"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        📊 Attendance Dashboard
      </h1>

      {/* Summary Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card
          title="Total Staff"
          value={data.totalStaff}
          color="bg-green-100 dark:bg-green-800"
          onClick={() => setSelectedList("staff")}
        />
        <Card
          title="Total Interns"
          value={data.totalInterns}
          color="bg-blue-100 dark:bg-blue-800"
          onClick={() => setSelectedList("intern")}
        />
        <Card
          title="Departments"
          value={data.totalDepartments}
          color="bg-yellow-100 dark:bg-yellow-700"
          onClick={() => router.push("/departments")}
        />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Attendance per Department
        </h2>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.attendanceByDepartment}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="department" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#222",
                  borderColor: "#4ade80",
                  color: "#fff",
                }}
              />
              <Bar dataKey="present" fill="#4ade80" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color, onClick }) {
  return (
    <div
      className={`${color} p-6 rounded-2xl shadow transition-transform hover:scale-105 cursor-pointer transition-colors`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </h2>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
