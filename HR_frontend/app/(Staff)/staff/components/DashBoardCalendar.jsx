// app/staff/DashboardCalendar.jsx
"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
// Adjust this path based on where your components/ui/card.jsx actually is
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Calendar as CalendarIcon, Sun } from "lucide-react";

// Helper function to format a date to 'YYYY-MM-DD' for easy comparison
const toDateString = (date) => new Date(date).toISOString().split('T')[0];

export default function DashboardCalendar({ holidays = [] }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);

  // Get the next holidays regardless of current date
  useEffect(() => {
    // Sort all holidays by date
    const sortedHolidays = [...holidays].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Find the index of the next holiday (first holiday that is today or in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startIndex = 0;
    // Find the first holiday that is today or in the future
    const nextHolidayIndex = sortedHolidays.findIndex(holiday => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0); // Normalize to start of day
      return holidayDate >= today;
    });

    // If no future holidays, show the first few from the start of the list
    if (nextHolidayIndex === -1) {
      startIndex = 0; // Show from beginning if all are past
    } else {
      startIndex = nextHolidayIndex;
    }

    // Always show the next 5 holidays from the found index,
    // handling wrap-around for a continuous display if the year rolls over
    const nextHolidays = [];
    for (let i = 0; i < 5; i++) {
      const holidayToShow = sortedHolidays[(startIndex + i) % sortedHolidays.length];
      if (holidayToShow) {
        nextHolidays.push(holidayToShow);
      }
    }
    // If sortedHolidays is empty, nextHolidays will also be empty.
    // If sortedHolidays has fewer than 5 items, it will correctly display all of them.

    setUpcomingHolidays(nextHolidays);
  }, [holidays]);

  // Create a map of holidays for quick lookup
  const holidaysMap = new Map();
  holidays.forEach(holiday => {
    const dateStr = toDateString(holiday.date);
    holidaysMap.set(dateStr, holiday);
  });

  // This function adds custom content (like dots) to each calendar tile for holidays
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = toDateString(date);
      const holiday = holidaysMap.get(dateStr);
      if (holiday) {
        return (
          // Use absolute positioning relative to the tile's parent.
          // react-calendar's tile is usually `position: relative`
          <div className="flex justify-center items-center absolute bottom-1 left-0 right-0">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-0 overflow-hidden">
        <CardHeader className="px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
                <CalendarIcon className="text-indigo-500 w-6 h-6" /> Company Calendar
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6 p-6 pt-0">
            {/* Calendar Section: Takes 2/5 width on large screens, full width on small */}
            <div className="w-full flex-shrink-0 lg:w-2/5 lg:max-w-none mx-auto lg:mx-0">
                <Calendar
                    onChange={setCalendarDate}
                    value={calendarDate}
                    tileContent={tileContent}
                    className="rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 w-full"
                />
            </div>
            {/* Upcoming Holidays Section: Takes 3/5 width on large screens, full width on small */}
            <div className="flex-1 min-w-0 lg:w-3/5">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    Next Holidays
                </h3>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {upcomingHolidays.length > 0 ? (
                        upcomingHolidays.map(holiday => {
                          const holidayDate = new Date(holiday.date);
                          return (
                            <div key={holiday.id} className="flex items-center gap-3 text-sm p-3 rounded-lg bg-gray-50 dark:bg-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                                    <Sun size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-200">{holiday.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {holidayDate.toLocaleDateString('default', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                          );
                        })
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-8">No upcoming holidays.</p>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}