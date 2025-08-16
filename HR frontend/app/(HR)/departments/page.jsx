"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Building, Users, User, FileText, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const MOCK = [
  {
    name: "Logistics",
    subdepartments: ["Purchasing", "Setup / Transport", "Kitchen", "Health / Sanitation", "Security"],
    staff: [
      { name: "John Doe", role: "Logistics Manager", email: "john@org.com", phone: "+251900000001", bio: "Oversees logistics operations.", subdept: "Purchasing" },
      { name: "Jane Smith", role: "Procurement Lead", email: "jane@org.com", phone: "+251900000002", bio: "Handles purchasing vendors.", subdept: "Purchasing" },
      { name: "Peter Parker", role: "Transport Lead", email: "peter@org.com", phone: "+251900000003", bio: "Coordinates transport and setup.", subdept: "Setup / Transport" },
      { name: "Gordon Ramsay", role: "Kitchen Manager", email: "gordon@org.com", phone: "+251900000004", bio: "Responsible for kitchen.", subdept: "Kitchen" },
      { name: "James Bond", role: "Security Chief", email: "bond@org.com", phone: "+251900000005", bio: "Security & safety.", subdept: "Security" },
    ],
    interns: [
      { name: "Intern A", role: "Logistics Intern", email: "ia@org.com", phone: "+251900000011", bio: "Learning procurement.", subdept: "Purchasing" },
      { name: "Intern B", role: "Support Intern", email: "ib@org.com", phone: "+251900000012", bio: "Assisting transport team.", subdept: "Setup / Transport" },
    ],
  },
  {
    name: "Teaching",
    subdepartments: ["Abenet", "Art and Heritage", "Menfesawi Kenwen", "Crafts"],
    staff: [
      { name: "Teacher One", role: "Instructor", email: "t1@org.com", phone: "+251900000101", bio: "Teaches Abenet.", subdept: "Abenet" },
      { name: "Artist A", role: "Instructor", email: "artistA@org.com", phone: "+251900000102", bio: "Leads Art & Heritage.", subdept: "Art and Heritage" },
      { name: "Teacher C", role: "Instructor", email: "tC@org.com", phone: "+251900000103", bio: "Menfesawi lessons.", subdept: "Menfesawi Kenwen" },
      { name: "Craftsman A", role: "Instructor", email: "craftA@org.com", phone: "+251900000104", bio: "Handles Crafts.", subdept: "Crafts" },
    ],
    interns: [
      { name: "Intern K", role: "Teaching Intern", email: "ik@org.com", phone: "+251900000111", bio: "Assists lessons.", subdept: "Abenet" },
      { name: "Intern M", role: "Art Intern", email: "im@org.com", phone: "+251900000112", bio: "Assists in art.", subdept: "Art and Heritage" },
    ],
  },
  {
    name: "Audit and Inspection",
    subdepartments: [],
    staff: [
      { name: "Auditor 1", role: "Inspector", email: "audit1@org.com", phone: "+251900000201", bio: "Ensures compliance.", subdept: "" },
      { name: "Auditor 2", role: "Inspector", email: "audit2@org.com", phone: "+251900000202", bio: "Site inspections.", subdept: "" },
    ],
    interns: [
      { name: "Audit Intern", role: "Intern", email: "ai@org.com", phone: "+251900000211", bio: "Assists audits.", subdept: "" },
    ],
  },
  {
    name: "Event",
    subdepartments: ["Extra Curriculum", "Game", "Event"],
    staff: [
      { name: "Coach A", role: "Coach", email: "coachA@org.com", phone: "+251900000301", bio: "Sports & extra curriculum.", subdept: "Extra Curriculum" },
      { name: "Player A", role: "Game Manager", email: "playerA@org.com", phone: "+251900000302", bio: "Manages games.", subdept: "Game" },
      { name: "Event Manager A", role: "Event Manager", email: "emA@org.com", phone: "+251900000303", bio: "Event ops.", subdept: "Event" },
    ],
    interns: [
      { name: "Intern S", role: "Event Intern", email: "is@org.com", phone: "+251900000311", bio: "Assists events.", subdept: "Event" },
    ],
  },
  {
    name: "Finance",
    subdepartments: [],
    staff: [
      { name: "Finance A", role: "Accountant", email: "finA@org.com", phone: "+251900000401", bio: "Handles accounts.", subdept: "" },
    ],
    interns: [],
  },
  {
    name: "Communication",
    subdepartments: ["IT", "Communication", "Media"],
    staff: [
      { name: "IT Specialist A", role: "IT Specialist", email: "itA@org.com", phone: "+251900000501", bio: "Maintains systems.", subdept: "IT" },
      { name: "Communicator A", role: "Comms", email: "comA@org.com", phone: "+251900000502", bio: "Communications.", subdept: "Communication" },
      { name: "Media Specialist A", role: "Media", email: "medA@org.com", phone: "+251900000503", bio: "Covers media.", subdept: "Media" },
    ],
    interns: [
      { name: "Intern Y", role: "IT Intern", email: "iy@org.com", phone: "+251900000511", bio: "Assists IT.", subdept: "IT" },
    ],
  },
];

// Export all departments data to Excel with department selected option at bottom
function exportAllDepartmentsToExcel(departments) {
  const rows = [];

  departments.forEach((dept) => {
    const subs = dept.subdepartments.length ? dept.subdepartments : [""];

    subs.forEach((sub) => {
      rows.push({
        Department: dept.name,
        Subdepartment: sub || "(General)",
        Role: "----",
        Name: "",
        Email: "",
        Phone: "",
        Bio: "",
      });

      const staffInSub = dept.staff.filter((s) => (s.subdept || "") === (sub || ""));
      staffInSub.forEach((s) => {
        rows.push({
          Department: dept.name,
          Subdepartment: sub || "(General)",
          Role: "Staff",
          Name: s.name,
          Email: s.email,
          Phone: s.phone,
          Bio: s.bio,
        });
      });

      const internsInSub = dept.interns.filter((i) => (i.subdept || "") === (sub || ""));
      internsInSub.forEach((i) => {
        rows.push({
          Department: dept.name,
          Subdepartment: sub || "(General)",
          Role: "Intern",
          Name: i.name,
          Email: i.email,
          Phone: i.phone,
          Bio: i.bio,
        });
      });

      rows.push({ Department: "", Subdepartment: "", Role: "", Name: "", Email: "", Phone: "", Bio: "" });
    });
  });

  rows.push({
    Department: "Exported Departments Count",
    Subdepartment: departments.length,
    Role: "",
    Name: "",
    Email: "",
    Phone: "",
    Bio: "",
  });

  const ws = XLSX.utils.json_to_sheet(rows, { origin: "A1" });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "AllDepartments");

  ws["!cols"] = [
    { wch: 20 },
    { wch: 25 },
    { wch: 10 },
    { wch: 30 },
    { wch: 35 },
    { wch: 15 },
    { wch: 45 },
  ];

  XLSX.writeFile(wb, `All_Departments_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export default function DepartmentsPage() {
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewPerson, setViewPerson] = useState(null);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDeptIcon = (deptName) => {
    switch (deptName) {
      case "Logistics":
        return <Building className="w-10 h-10 text-yellow-600" />;
      case "Teaching":
        return <FileText className="w-10 h-10 text-green-600" />;
      case "Audit and Inspection":
        return <Users className="w-10 h-10 text-red-600" />;
      case "Event":
        return <User className="w-10 h-10 text-purple-600" />;
      case "Finance":
        return <Building className="w-10 h-10 text-blue-600" />;
      case "Communication":
        return <Users className="w-10 h-10 text-pink-600" />;
      default:
        return <Building className="w-10 h-10 text-gray-600" />;
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header and Controls */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-center flex-grow text-gray-900 dark:text-gray-100">
          Company Departments
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => exportAllDepartmentsToExcel(MOCK)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            title="Export all departments to Excel"
          >
            Export All Excel
          </button>

          <button
            aria-label="Toggle Dark Mode"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-6 h-6 text-yellow-500" />
            ) : (
              <Moon className="w-6 h-6 text-gray-800" />
            )}
          </button>
        </div>
      </div>

      {/* Department Cards */}
      {!selectedDept ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
          {MOCK.map((dept) => (
            <div
              key={dept.name}
              onClick={() => setSelectedDept(dept)}
              className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-3xl shadow-lg cursor-pointer p-8 w-64 hover:scale-105 transform transition"
              title={`View ${dept.name} department`}
            >
              {getDeptIcon(dept.name)}
              <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
                {dept.name}
              </h2>
              {dept.subdepartments.length > 0 && (
                <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 italic max-w-[14rem]">
                  Subdepartments: {dept.subdepartments.join(", ")}
                </p>
              )}
              <div className="mt-4 text-gray-700 dark:text-gray-300 text-center space-y-1">
                <p>
                  <strong>Staff:</strong> {dept.staff.length}
                </p>
                <p>
                  <strong>Interns:</strong> {dept.interns.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Subdepartment + People List */
        <div>
          <button
            onClick={() => setSelectedDept(null)}
            className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            ← 
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {selectedDept.name} Department
          </h2>

          {(selectedDept.subdepartments.length ? selectedDept.subdepartments : ["General"]).map((sub) => {
            const staffList = selectedDept.staff.filter((s) => (s.subdept || "General") === (sub || "General"));
            const internsList = selectedDept.interns.filter((i) => (i.subdept || "General") === (sub || "General"));

            return (
              <section
                key={sub}
                className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users className="inline-block w-6 h-6 text-blue-500" /> {sub || "General"}
                </h3>

                {/* Staff */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Staff</h4>
                  {staffList.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">No staff in this subdepartment.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-w-3xl">
                      {staffList.map((person, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center py-2"
                        >
                          <div className="text-gray-900 dark:text-gray-100 font-medium">{person.name}</div>
                          <button
                            onClick={() => setViewPerson(person)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          >
                            View
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Interns */}
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Interns</h4>
                  {internsList.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">No interns in this subdepartment.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-w-3xl">
                      {internsList.map((person, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center py-2"
                        >
                          <div className="text-gray-900 dark:text-gray-100 font-medium">{person.name}</div>
                          <button
                            onClick={() => setViewPerson(person)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          >
                            View
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {viewPerson && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setViewPerson(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{viewPerson.name}</h3>
            <p className="mb-1 text-gray-700 dark:text-gray-300"><strong>Role:</strong> {viewPerson.role}</p>
            <p className="mb-1 text-gray-700 dark:text-gray-300"><strong>Email:</strong> {viewPerson.email}</p>
            <p className="mb-1 text-gray-700 dark:text-gray-300"><strong>Phone:</strong> {viewPerson.phone}</p>
            <p className="mt-3 text-gray-600 dark:text-gray-400">{viewPerson.bio}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewPerson(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
