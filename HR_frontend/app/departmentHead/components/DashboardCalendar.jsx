"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
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
    for (let i = 0; i < sortedHolidays.length; i++) {
      const holidayDate = new Date(sortedHolidays[i].date);
      holidayDate.setHours(0, 0, 0, 0);
      
      if (holidayDate >= today) {
        startIndex = i;
        break;
      }
      
      // If we've reached the end and all holidays are in the past,
      // just start from the beginning of next year's holidays
      if (i === sortedHolidays.length - 1) {
        startIndex = 0;
      }
    }
    
    // Always show the next 5 holidays from the found index
    const nextHolidays = sortedHolidays.slice(startIndex, startIndex + 5);
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
          <div className="flex justify-center items-center absolute bottom-1 left-0 right-0">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="text-indigo-500" /> Company Calendar
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6">
            <div className="flex-shrink-0 mx-auto">
                <Calendar
                    onChange={setCalendarDate}
                    value={calendarDate}
                    tileContent={tileContent}
                    className="rounded-lg shadow-inner p-2 bg-slate-50 dark:bg-slate-900/50"
                />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">
                    Next Holidays
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {upcomingHolidays.length > 0 ? (
                        upcomingHolidays.map(holiday => {
                          const holidayDate = new Date(holiday.date);
                          return (
                            <div key={holiday.id} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                                    <Sun size={16} />
                                </div>
                                <div>
                                    <p className="font-medium">{holiday.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                        <p className="text-sm text-slate-400 text-center py-8">No upcoming holidays.</p>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}