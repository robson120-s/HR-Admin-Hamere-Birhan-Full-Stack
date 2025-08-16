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
import { useTheme } from "next-themes";
//calendar
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import "./calendar.css";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { AlertCircle } from "lucide-react";
//meeting schedule component
function MeetingSchedule({ initialMeetings }) {
  const [meetings, setMeetings] = useState(initialMeetings || []);

  const [showForm, setShowForm] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
  });

  // Handle form input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add meeting from form data
  const addMeeting = (e) => {
    e.preventDefault();
    const { title, date, time } = formData;

    if (!title.trim() || !date || !time.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setMeetings([...meetings, { title, date, time }]);
    setFormData({ title: "", date: "", time: "" });
    setShowForm(false);
  };

  // Delete meeting at index i
  const deleteMeeting = (i) => {
    if (window.confirm("Delete this meeting?")) {
      setMeetings(meetings.filter((_, idx) => idx !== i));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          Meeting Schedule
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        >
          <FaPlus className="mr-2" /> Add Meeting
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={addMeeting}
          className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded shadow relative"
        >
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close form"
          >
            <FaTimes />
          </button>

          <div className="mb-3">
            <label
              htmlFor="title"
              className="block text-gray-700 dark:text-gray-200 mb-1"
            >
              Meeting Title
            </label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600"
              type="text"
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="date"
              className="block text-gray-700 dark:text-gray-200 mb-1"
            >
              Meeting Date
            </label>
            <input
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600"
              type="date"
              required
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="time"
              className="block text-gray-700 dark:text-gray-200 mb-1"
            >
              Meeting Time
            </label>
            <input
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600"
              type="text"
              placeholder="E.g. 14:00 - 15:00"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save Meeting
          </button>
        </form>
      )}

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="p-2 text-gray-600 dark:text-gray-300">
              Meeting Title
            </th>
            <th className="p-2 text-gray-600 dark:text-gray-300">
              Meeting Date
            </th>
            <th className="p-2 text-gray-600 dark:text-gray-300">
              Meeting Time
            </th>
          </tr>
        </thead>
        <tbody>
          {meetings.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No meetings scheduled.
              </td>
            </tr>
          )}
          {meetings.map(({ title, date, time }, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <td className="p-2 text-gray-700 dark:text-gray-300">{title}</td>
              <td className="p-2 text-gray-700 dark:text-gray-300">{date}</td>
              <td className="p-2 text-gray-700 dark:text-gray-300">{time}</td>
              <td className="p-2">
                <button
                  onClick={() => deleteMeeting(i)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Meeting"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
  const [calendarDate, setCalendarDate] = useState(new Date());
  const router = useRouter();

  // Theme state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 🧪 MOCK DATA
    const mockSummary = {
      totalEmployee: 140,
      totalStaff: 25,
      totalInterns: 10,
      totalOnLeave: 5,
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

  if (!mounted || !data)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 z-50">
        <svg
          className="animate-spin h-12 w-12 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span className="sr-only">Loading summary...</span>
      </div>
    );

  // If list is selected
  if (selectedList) {
    const list = selectedList === "staff" ? data.staffList : data.internList;
    const displayList = showAll ? list : list.slice(0, 5);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors relative">
        {/* Theme toggle button at top right */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span className="text-gray-700 dark:text-gray-200">
              {theme === "dark" ? "Light" : "Dark"} Mode
            </span>
          </button>
        </div>

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
                <th className="border-b p-2 text-black dark:text-gray-200">
                  Name
                </th>
                <th className="border-b p-2 text-black dark:text-gray-200">
                  Department
                </th>
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
  const meetingsData = [
    { title: "Project Kickoff", date: "June 1, 2024", time: "10:00 AM" },
    { title: "Weekly Team Sync", date: "June 5, 2024", time: "02:00 PM" },
    { title: "Client Presentation", date: "June 10, 2024", time: "11:00 AM" },
    // Add your meetings...
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors relative">
      {/* Theme toggle button at top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          <span className="text-gray-700 dark:text-gray-200">
            {theme === "dark" ? "Light" : "Dark"} Mode
          </span>
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        📊 HR Dashboard
      </h1>

      {/* Summary Figures */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card
          title="Total Employee"
          value={data.totalEmployee}
          color="bg-yellow-100 dark:bg-yellow-700"
          onClick={() => router.push("/employee")}
        />

        <Card
          title="Departments"
          value={data.totalDepartments}
          color="bg-blue-100 dark:bg-blue-700"
          onClick={() => router.push("/departments")}
        />

        <Card
          title="Total Staff"
          value={data.totalStaff}
          color="bg-green-100 dark:bg-green-800"
          onClick={() => setSelectedList("staff")}
        />

        <Card
          title="Total Interns"
          value={data.totalInterns}
          color="bg-green-100 dark:bg-green-800"
          onClick={() => setSelectedList("interns")}
        />

        <Card
          title="On Leave Employee"
          value={data.totalOnLeave}
          color="bg-red-100 dark:bg-red-700"
          onClick={() => router.push("/leave")}
        />
        

        
      </div>

      

      {/* Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance & Leaves */}
        <div className="flex-1 space-y-6">
    {/* Attendance & Leaves */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
        Attendance & Leaves
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Column 1 */}
        <div className="space-y-2">
          <div>
            <span className="text-lg font-bold text-blue-500">10</span>
            <p className="text-sm text-gray-500 dark:text-gray-300">Total Leaves</p>
          </div>
          <div>
            <span className="text-lg font-bold text-green-500">6.5</span>
            <p className="text-sm text-gray-500 dark:text-gray-300">Leaves Taken</p>
          </div>
          <div>
            <span className="text-lg font-bold text-green-500">06</span>
            <p className="text-sm text-gray-500 dark:text-gray-300">Leaves Absent</p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-2">
          <div>
            <span className="text-lg font-bold text-purple-500">1</span>
            <p className="text-sm text-gray-500 dark:text-gray-300">Pending Approval</p>
          </div>
          <div>
            <span className="text-lg font-bold text-sky-500">315</span>
            <p className="text-sm text-gray-500 dark:text-gray-300">Working Days</p>
          </div>
          <div>
            <span className="text-lg font-bold text-red-500">3</span>
            <p className="text-sm text-gray-500 dark:text-gray-300">Loss of Pay</p>
          </div>
        </div>
      </div>
    </div>

    {/* Complaints Received */}
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors">
  <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
    <AlertCircle className="text-red-500" /> Complaints Received
  </h2>

  <div className="space-y-3">
    {[
      { id: 1, text: "Delay in attendance marking", time: "2 hrs ago", unread: true },
      { id: 2, text: "Leave balance calculation issue", time: "Yesterday", unread: false },
      { id: 3, text: "Request to correct working days count", time: "3 days ago", unread: false },
    ].map((complaint) => (
      <div
        key={complaint.id}
        className={`flex items-start gap-3 p-4 rounded-lg border ${
          complaint.unread
            ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-600"
            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
        } hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer`}
      >
        <AlertCircle
          className={`mt-1 ${
            complaint.unread ? "text-red-500" : "text-gray-400"
          }`}
          size={20}
        />
        <div className="flex-1">
          <p
            className={`text-sm ${
              complaint.unread
                ? "font-semibold text-gray-800 dark:text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {complaint.text}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {complaint.time}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>
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

      {/* Meeting Schedule & Calendar */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MeetingSchedule meetings={meetingsData} />
          {/* Calendar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              📅 Calendar
            </h2>
            <div className="flex justify-center">
              <Calendar
                onChange={setCalendarDate}
                value={calendarDate}
                className="rounded-lg shadow-md p-4 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color, onClick }) {
  return (
    <div
      className={`${color} p-3 rounded-lg shadow hover:shadow-md transition-all hover:scale-102 cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </h2>
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}
