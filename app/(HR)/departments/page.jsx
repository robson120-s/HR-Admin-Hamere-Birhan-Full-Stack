"use client";

import { useState } from "react";
import { User, Users } from "lucide-react"; // icons
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

export default function DepartmentsPage() {
  const [selectedDept, setSelectedDept] = useState(null);

  // Controls how many to show initially
  const INITIAL_VISIBLE = 3;

  // Track seeMore toggles separately for staff and interns
  const [showAllStaff, setShowAllStaff] = useState(false);
  const [showAllInterns, setShowAllInterns] = useState(false);

  // Theme state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 🧪 MOCK DATA
  const departments = [
    {
      name: "Engineering",
      staffCount: 8,
      internCount: 2,
      staff: [
        { name: "Abebe", role: "Senior Engineer", email: "abebe@company.com", phone: "+251 911 000000", bio: "Loves solving complex problems." },
        { name: "Marta", role: "Software Developer", email: "marta@company.com", phone: "+251 911 111111", bio: "Front-end enthusiast." },
        { name: "Daniel", role: "DevOps Engineer", email: "daniel@company.com", phone: "+251 911 555555", bio: "Passionate about automation." },
        { name: "Fikru", role: "QA Engineer", email: "fikru@company.com", phone: "+251 911 666666", bio: "Detail oriented tester." },
        { name: "Helen", role: "Product Manager", email: "helen@company.com", phone: "+251 911 777777", bio: "Brings product vision to life." },
        { name: "Liya", role: "UX Designer", email: "liya@company.com", phone: "+251 911 888888", bio: "User-focused design lover." },
        { name: "Samuel", role: "Backend Developer", email: "samuel@company.com", phone: "+251 911 999999", bio: "Building scalable APIs." },
        { name: "Tsegaye", role: "Data Scientist", email: "tsegaye@company.com", phone: "+251 911 123456", bio: "Data-driven decision maker." },
      ],
      interns: [
        { name: "Kebede", role: "Intern", email: "kebede@company.com", phone: "+251 911 222222", bio: "Learning React and Node.js." },
        { name: "Ruth", role: "Intern", email: "ruth@company.com", phone: "+251 911 333333", bio: "Eager to learn software development." },
      ],
    },
    {
      name: "HR",
      staffCount: 5,
      internCount: 1,
      staff: [
        { name: "Mulu", role: "HR Manager", email: "mulu@company.com", phone: "+251 911 333333", bio: "Passionate about people and culture." },
        { name: "Helen", role: "Recruiter", email: "helen.hr@company.com", phone: "+251 911 444444", bio: "Finds great talent." },
        { name: "Daniela", role: "HR Coordinator", email: "daniela@company.com", phone: "+251 911 555555", bio: "Keeps HR processes smooth." },
        { name: "Sara", role: "HR Assistant", email: "sara.hr@company.com", phone: "+251 911 666666", bio: "Supports daily HR tasks." },
        { name: "Lily", role: "Compensation Specialist", email: "lily@company.com", phone: "+251 911 777777", bio: "Handles payroll and benefits." },
      ],
      interns: [
        { name: "Sara", role: "Intern", email: "sara@company.com", phone: "+251 911 444444", bio: "Studying business administration." },
      ],
    },
  ];

  if (selectedDept) {
    const staffToShow = showAllStaff ? selectedDept.staff : selectedDept.staff.slice(0, INITIAL_VISIBLE);
    const internsToShow = showAllInterns ? selectedDept.interns : selectedDept.interns.slice(0, INITIAL_VISIBLE);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors relative">
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

        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          {selectedDept.name} Department
        </h1>

        <button
          onClick={() => {
            setSelectedDept(null);
            setShowAllStaff(false);
            setShowAllInterns(false);
          }}
          className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← Back to Departments
        </button>

        {/* Staff List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Users className="w-5 h-5" /> Staff
          </h2>
          <div className="grid gap-4">
            {staffToShow.map((person, idx) => (
              <ProfileCard key={idx} person={person} />
            ))}
          </div>
          {selectedDept.staff.length > INITIAL_VISIBLE && (
            <button
              onClick={() => setShowAllStaff(!showAllStaff)}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showAllStaff ? "See Less" : "See More"}
            </button>
          )}
        </div>

        {/* Interns List */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <User className="w-5 h-5" /> Interns
          </h2>
          <div className="grid gap-4">
            {internsToShow.map((person, idx) => (
              <ProfileCard key={idx} person={person} />
            ))}
          </div>
          {selectedDept.interns.length > INITIAL_VISIBLE && (
            <button
              onClick={() => setShowAllInterns(!showAllInterns)}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showAllInterns ? "See Less" : "See More"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors relative">
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

      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        🏢 Departments
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setSelectedDept(dept)}
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {dept.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Staff: <span className="font-bold">{dept.staffCount}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Interns: <span className="font-bold">{dept.internCount}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileCard({ person }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{person.name}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-1">{person.role}</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{person.email}</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{person.phone}</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{person.bio}</p>
    </div>
  );
}