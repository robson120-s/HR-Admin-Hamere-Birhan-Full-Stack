"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css"; // Your custom calendar styles

export default function DashboardCalendar() {
  const [calendarDate, setCalendarDate] = useState(new Date());

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors">
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
  );
}