"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiUsers,
  FiBriefcase,
  FiCheck,
  FiX,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import { useTheme } from "next-themes";
import jsPDF from "jspdf";

const SESSIONS = ["Morning", "Afternoon", "Evening"];

const generatePerson = (idPrefix, name) => ({
  id: idPrefix,
  name,
  attendance: {
    Morning: "absent",
    Afternoon: "absent",
    Evening: "absent",
  },
});

const mockDepartments = [
  {
    id: "dept2",
    name: "Logistics",
    subdepartments: [
      {
        id: "sub1",
        name: "Purchasing",
        staff: [
          generatePerson("s1", "John Doe"),
          generatePerson("s2", "Jane Smith"),
        ],
        interns: [
          generatePerson("i1", "Intern A"),
          generatePerson("i2", "Intern B"),
        ],
      },
      {
        id: "sub2",
        name: "Setup / Transport",
        staff: [
          generatePerson("s3", "Peter Parker"),
          generatePerson("s4", "Mary Jane"),
        ],
        interns: [
          generatePerson("i3", "Intern C"),
          generatePerson("i4", "Intern D"),
        ],
      },
      {
        id: "sub3",
        name: "Kitchen",
        staff: [
          generatePerson("s5", "Gordon Ramsay"),
          generatePerson("s6", "Rachel Ray"),
        ],
        interns: [
          generatePerson("i5", "Intern E"),
          generatePerson("i6", "Intern F"),
        ],
      },
      {
        id: "sub4",
        name: "Health / Salutation",
        staff: [
          generatePerson("s7", "Dr. House"),
          generatePerson("s8", "Dr. Watson"),
        ],
        interns: [
          generatePerson("i7", "Intern G"),
          generatePerson("i8", "Intern H"),
        ],
      },
      {
        id: "sub5",
        name: "Security",
        staff: [
          generatePerson("s9", "James Bond"),
          generatePerson("s10", "Jason Bourne"),
        ],
        interns: [
          generatePerson("i9", "Intern I"),
          generatePerson("i10", "Intern J"),
        ],
      },
    ],
  },
  {
    id: "dept3",
    name: "Teaching",
    subdepartments: [
      {
        id: "sub6",
        name: "Abenet",
        staff: [
          generatePerson("s11", "Teacher One"),
          generatePerson("s12", "Teacher Two"),
        ],
        interns: [
          generatePerson("i11", "Intern K"),
          generatePerson("i12", "Intern L"),
        ],
      },
      {
        id: "sub7",
        name: "Art and Heritage",
        staff: [
          generatePerson("s13", "Artist A"),
          generatePerson("s14", "Artist B"),
        ],
        interns: [
          generatePerson("i13", "Intern M"),
          generatePerson("i14", "Intern N"),
        ],
      },
      {
        id: "sub8",
        name: "Menfesawi Kenwen",
        staff: [
          generatePerson("s15", "Teacher C"),
          generatePerson("s16", "Teacher D"),
        ],
        interns: [
          generatePerson("i15", "Intern O"),
          generatePerson("i16", "Intern P"),
        ],
      },
      {
        id: "sub9",
        name: "Crafts",
        staff: [
          generatePerson("s17", "Craftsman A"),
          generatePerson("s18", "Craftsman B"),
        ],
        interns: [
          generatePerson("i17", "Intern Q"),
          generatePerson("i18", "Intern R"),
        ],
      },
    ],
  },
  {
    id: "dept4",
    name: "Audit and Inspection",
    subdepartments: [],
  },
  {
    id: "dept5",
    name: "Event",
    subdepartments: [
      {
        id: "sub10",
        name: "Extra Curriculum",
        staff: [
          generatePerson("s19", "Coach A"),
          generatePerson("s20", "Coach B"),
        ],
        interns: [
          generatePerson("i19", "Intern S"),
          generatePerson("i20", "Intern T"),
        ],
      },
      {
        id: "sub11",
        name: "Game",
        staff: [
          generatePerson("s21", "Player A"),
          generatePerson("s22", "Player B"),
        ],
        interns: [
          generatePerson("i21", "Intern U"),
          generatePerson("i22", "Intern V"),
        ],
      },
      {
        id: "sub12",
        name: "Event",
        staff: [
          generatePerson("s23", "Event Manager A"),
          generatePerson("s24", "Event Manager B"),
        ],
        interns: [
          generatePerson("i23", "Intern W"),
          generatePerson("i24", "Intern X"),
        ],
      },
    ],
  },
  {
    id: "dept6",
    name: "Finance",
    subdepartments: [],
  },
  {
    id: "dept7",
    name: "Communication",
    subdepartments: [
      {
        id: "sub13",
        name: "IT",
        staff: [
          generatePerson("s25", "IT Specialist A"),
          generatePerson("s26", "IT Specialist B"),
        ],
        interns: [
          generatePerson("i25", "Intern Y"),
          generatePerson("i26", "Intern Z"),
        ],
      },
      {
        id: "sub14",
        name: "Communication",
        staff: [
          generatePerson("s27", "Communicator A"),
          generatePerson("s28", "Communicator B"),
        ],
        interns: [
          generatePerson("i27", "Intern AA"),
          generatePerson("i28", "Intern BB"),
        ],
      },
      {
        id: "sub15",
        name: "Media",
        staff: [
          generatePerson("s29", "Media Specialist A"),
          generatePerson("s30", "Media Specialist B"),
        ],
        interns: [
          generatePerson("i29", "Intern CC"),
          generatePerson("i30", "Intern DD"),
        ],
      },
    ],
  },
];

// Theme icons
function SunIcon({ className = "" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="orange"
      width={24}
      height={24}
    >
      <circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" />
      <path
        stroke="orange"
        strokeWidth="2"
        strokeLinecap="round"
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
  );
}

function MoonIcon({ className = "" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={24}
      height={24}
    >
      <path
        stroke="purple"
        strokeWidth="2"
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
      />
    </svg>
  );
}

function PresentIcon() {
  return <FiCheck className="text-green-600 inline" />;
}
function AbsentIcon() {
  return <FiX className="text-red-600 inline" />;
}

export default function EditAttendance() {
  const [departments] = useState(mockDepartments);
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [selectedSubDeptId, setSelectedSubDeptId] = useState(null);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const selectedSubDept = selectedDept?.subdepartments.find(
    (sd) => sd.id === selectedSubDeptId
  );

  function handleBack() {
    if (selectedSubDeptId) {
      setSelectedSubDeptId(null);
    } else if (selectedDeptId) {
      setSelectedDeptId(null);
    }
  }

  function exportPDF() {
    if (!selectedSubDept) {
      toast.error("Please select a subdepartment first.");
      return;
    }
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`${selectedDept.name} - ${selectedSubDept.name} Attendance`, 14, 20);

    let y = 30;

    const drawTable = (title, people) => {
      doc.setFontSize(14);
      doc.text(title, 14, y);
      y += 8;

      doc.setFontSize(12);
      doc.text("Name", 14, y);
      SESSIONS.forEach((session, i) => {
        doc.text(session, 60 + i * 30, y);
      });
      y += 6;

      people.forEach(({ name, attendance }) => {
        doc.text(name, 14, y);
        SESSIONS.forEach((session, i) => {
          const status = attendance[session];
          let mark = "";
          if (status === "present") mark = "✓";
          else if (status === "absent") mark = "✗";
          else mark = status.charAt(0).toUpperCase();
          doc.text(mark, 60 + i * 30, y);
        });
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 10;
    };

    drawTable("Staff", selectedSubDept.staff);
    drawTable("Interns", selectedSubDept.interns);

    doc.save(
      `${selectedDept.name}_${selectedSubDept.name}_Attendance_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  }

  // Theme toggle always visible
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

  // Department page: NO Import or Export buttons, only theme toggle
  if (!selectedDept) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 relative">
        <div className="absolute top-4 right-4 z-10">{ThemeToggle()}</div>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          Select Department to View Attendance
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {departments.map(({ id, name, subdepartments }) => {
            const totalStaff = subdepartments.flatMap((sd) => sd.staff).length;
            const totalInterns = subdepartments.flatMap((sd) => sd.interns).length;
            return (
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
                  <FiUsers className="inline text-green-500" /> Staff: {totalStaff}
                </p>
                <p className="text-gray-700 dark:text-gray-300 flex items-center gap-4 mt-1">
                  <FiUsers className="inline text-blue-500" /> Interns: {totalInterns}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Subdepartment page: Show Import + Export + Theme toggle buttons
  if (selectedDept && !selectedSubDept) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 max-w-4xl mx-auto relative">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            className="flex items-center gap-1 px-3 py-2 rounded bg-black hover:bg-gray-700 text-white transition-colors"
            aria-label="Import attendance"
          >
            <FiDownload size={20} /> Import
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-1 px-3 py-2 rounded bg-black hover:bg-gray-700 text-white transition-colors"
            aria-label="Export attendance to PDF"
          >
            <FiUpload size={20} /> Export PDF
          </button>
          {ThemeToggle()}
        </div>

        <button
          onClick={handleBack}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-6"
        >
          ←
        </button>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Select Subdepartment in {selectedDept.name}
        </h1>

        {selectedDept.subdepartments.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            No subdepartments available for this department.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedDept.subdepartments.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setSelectedSubDeptId(id)}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{name}</h2>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Attendance page (staff and interns) with Import + Export + Theme toggle buttons
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 max-w-6xl mx-auto relative">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          className="flex items-center gap-1 px-3 py-2 rounded bg-black hover:bg-gray-700 text-white transition-colors"
          aria-label="Import attendance"
        >
          <FiDownload size={20} /> Import
        </button>
        <button
          onClick={exportPDF}
          className="flex items-center gap-1 px-3 py-2 rounded bg-black hover:bg-gray-700 text-white transition-colors"
          aria-label="Export attendance to PDF"
        >
          <FiUpload size={20} /> Export PDF
        </button>
        {ThemeToggle()}
      </div>

      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold ml-6 text-gray-900 dark:text-gray-100">
          {selectedSubDept.name} Attendance
        </h1>
      </div>

      <section className="mb-10 overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Staff</h2>
        <table className="w-full table-auto border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-3 text-left text-gray-900 dark:text-gray-100">Name</th>
              {SESSIONS.map((session) => (
                <th key={session} className="p-3 text-center text-gray-900 dark:text-gray-100">
                  {session}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedSubDept.staff.map(({ id, name, attendance }) => (
              <tr key={id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <td className="p-3">{name}</td>
                {SESSIONS.map((session) => {
                  const val = attendance[session];
                  return (
                    <td key={session} className="p-3 text-center">
                      {val === "present" && <PresentIcon />}
                      {val === "absent" && <AbsentIcon />}
                      {val !== "present" && val !== "absent" && (
                        <span className="capitalize">{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Interns</h2>
        <table className="w-full table-auto border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              <th className="p-3 text-left text-gray-900 dark:text-gray-100">Name</th>
              {SESSIONS.map((session) => (
                <th key={session} className="p-3 text-center text-gray-900 dark:text-gray-100">
                  {session}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedSubDept.interns.map(({ id, name, attendance }) => (
              <tr key={id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <td className="p-3">{name}</td>
                {SESSIONS.map((session) => {
                  const val = attendance[session];
                  return (
                    <td key={session} className="p-3 text-center">
                      {val === "present" && <PresentIcon />}
                      {val === "absent" && <AbsentIcon />}
                      {val !== "present" && val !== "absent" && (
                        <span className="capitalize">{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );  
}   