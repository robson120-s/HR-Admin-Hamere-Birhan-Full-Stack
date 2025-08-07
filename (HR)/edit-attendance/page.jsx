"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiUsers, FiBriefcase } from "react-icons/fi";
import { useTheme } from "next-themes";
import { mockDepartments } from "../mockup"; // ✅ update path if needed

const ATTENDANCE_OPTIONS = [
  { label: "Absent", value: "absent" },
  { label: "Present", value: "present" },
  { label: "Late", value: "late" },
  { label: "Permission", value: "permission" },
];

// 🌗 Theme Icons
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
      <path stroke="purple" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
  );
}

export default function EditAttendance() {
  const [departments, setDepartments] = useState(mockDepartments);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const selectedDept = departments.find((d) => d.id === selectedDeptId);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleAttendanceChange(type, id, value) {
    setDepartments((prev) =>
      prev.map((dept) => {
        if (dept.id !== selectedDeptId) return dept;
        return {
          ...dept,
          staff:
            type === "staff"
              ? dept.staff.map((s) =>
                  s.id === id ? { ...s, attendance: value } : s
                )
              : dept.staff,
          interns:
            type === "intern"
              ? dept.interns.map((i) =>
                  i.id === id ? { ...i, attendance: value } : i
                )
              : dept.interns,
        };
      })
    );
  }

  function handleApprove() {
    toast.success(`Attendance for ${selectedDept.name} approved!`);
    setSelectedDeptId(null);
  }

  function handleBack() {
    setSelectedDeptId(null);
  }

  const ThemeToggle = () =>
    mounted && (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    );

  if (!selectedDept) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 relative">
        {/* Theme toggle icon */}
        <div className="absolute top-4 right-4 z-10">{ThemeToggle()}</div>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          Select Department to Edit Attendance
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {departments.map(({ id, name, staff = [], interns = [] }) => (
            <button
              key={id}
              onClick={() => setSelectedDeptId(id)}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex flex-col items-center hover:shadow-xl transition"
            >
              <FiBriefcase className="text-4xl text-green-600 mb-2" />
              <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
                {name}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-4">
                <FiUsers className="inline text-green-500" /> Staff: {staff.length}
              </p>
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-4 mt-1">
                <FiUsers className="inline text-blue-500" /> Interns: {interns.length}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 max-w-6xl mx-auto relative">
      {/* Theme toggle icon */}
      <div className="absolute top-4 right-4 z-10">{ThemeToggle()}</div>

      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          ← Back to Departments
        </button>
        <h1 className="text-3xl font-bold ml-6 text-gray-900 dark:text-gray-100">
          {selectedDept.name} Attendance
        </h1>
      </div>

      {/* Staff table */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Staff
        </h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-3 text-left text-gray-900 dark:text-gray-100">Name</th>
              <th className="p-3 text-left text-gray-900 dark:text-gray-100">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {(selectedDept?.staff ?? []).map(({ id, name, attendance }) => (
              <tr
                key={id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <td className="p-3">{name}</td>
                <td className="p-3">
                  <select
                    className="rounded border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={attendance}
                    onChange={(e) => handleAttendanceChange("staff", id, e.target.value)}
                  >
                    {ATTENDANCE_OPTIONS.map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Interns table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Interns
        </h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-3 text-left text-gray-900 dark:text-gray-100">Name</th>
              <th className="p-3 text-left text-gray-900 dark:text-gray-100">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {(selectedDept?.interns ?? []).map(({ id, name, attendance }) => (
              <tr
                key={id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <td className="p-3">{name}</td>
                <td className="p-3">
                  <select
                    className="rounded border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    value={attendance}
                    onChange={(e) => handleAttendanceChange("intern", id, e.target.value)}
                  >
                    {ATTENDANCE_OPTIONS.filter((o) => o.value !== "late").map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleApprove}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow"
        >
          Approve Attendance
        </button>
      </div>
    </div>
  );
}
