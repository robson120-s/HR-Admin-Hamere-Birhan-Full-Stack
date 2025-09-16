// File: app/(HR)/hr/components/DashboardCalendar.jsx
"use client";

import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css"; // Your custom calendar styles (adjust path if necessary)
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"; // Adjust path
import { Calendar as CalendarIcon, Sun, Briefcase } from "lucide-react"; // Added Briefcase for meetings


// FIX: Modified toDateString to correctly handle dates as UTC days
const toDateString = (date) => {
  const d = new Date(date);
  // Get UTC year, month, and day
  const year = d.getUTCFullYear();
  const month = (d.getUTCMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-indexed
  const day = d.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DashboardCalendar({ events = [] }) { // Accepts a single 'events' prop (holidays + meetings)
  const [calendarDate, onChange] = useState(new Date());

  // Use a memoized map to efficiently look up events by date
  const eventsMap = useMemo(() => {
    const map = new Map();
    events.forEach(event => {
      const dateStr = toDateString(event.date); // Use the fixed toDateString
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr).push(event);
    });
    return map;
  }, [events]);

  // Function to add custom content (like dots) to each calendar tile
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = toDateString(date); // Use the fixed toDateString for the tile date
      const dayEvents = eventsMap.get(dateStr);
      if (dayEvents && dayEvents.length > 0) {
        return (
          <div className="flex justify-center items-center absolute bottom-1 left-0 right-0 space-x-0.5">
            {dayEvents.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className={`h-1.5 w-1.5 rounded-full ${event.type === 'meeting' ? 'bg-blue-500' : 'bg-purple-500'}`}
                title={event.title}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  // Identify holiday tiles for custom styling
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = toDateString(date); // Use the fixed toDateString for the tile date
      const dayEvents = eventsMap.get(dateStr);
      if (dayEvents && dayEvents.some(e => e.type === 'holiday')) {
          return 'holiday-tile'; // Apply custom class if there's a holiday
      }
    }
    return null;
  };

  // Get upcoming holidays specifically from the 'events' prop
  const upcomingHolidays = useMemo(() => {
      const today = new Date();
      // FIX: Ensure 'today' is also treated consistently (e.g., as start of UTC day)
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

      return events
          .filter(event => event.type === 'holiday' && new Date(event.date) >= todayUTC) // Compare with UTC today
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by timestamp
          .slice(0, 4); // Show the next 4 upcoming holidays
  }, [events]);


  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="text-indigo-500" /> Company Calendar
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex-shrink-0 mx-auto">
                <Calendar
                    onChange={onChange}
                    value={calendarDate}
                    tileContent={tileContent}
                    tileClassName={tileClassName}
                    className="rounded-lg shadow-inner p-2 bg-slate-50 dark:bg-slate-900/50"
                />
            </div>
            
            <div className="flex-1 min-w-0 border-t pt-4 dark:border-slate-700">
                <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">Upcoming Holidays</h3>
                <div className="space-y-3">
                    {upcomingHolidays.length > 0 ? (
                        upcomingHolidays.map(h => (
                            <div key={h.id} className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600"><Sun size={16} /></div>
                                <div>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{h.title}</p>
                                    <p className="text-xs text-slate-500">{new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p> {/* FIX: Format date for display */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-4">No upcoming holidays scheduled.</p>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}