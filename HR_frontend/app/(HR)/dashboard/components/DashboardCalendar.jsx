"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css"; // Your custom calendar styles
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Calendar as CalendarIcon, Briefcase, Sun } from "lucide-react";

// Helper function to format a date to 'YYYY-MM-DD' for easy comparison
const toDateString = (date) => new Date(date).toISOString().split('T')[0];

export  function DashboardCalendar({ events = [] }) { // Expects a prop named 'events'
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Create a map of events for quick lookup
  const eventsMap = new Map();
  events.forEach(event => {
    const dateStr = toDateString(event.date);
    if (!eventsMap.has(dateStr)) {
        eventsMap.set(dateStr, []);
    }
    eventsMap.get(dateStr).push(event);
  });

  // This function adds custom content (like dots) to each calendar tile
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = toDateString(date);
      const dayEvents = eventsMap.get(dateStr);
      if (dayEvents && dayEvents.length > 0) {
        return (
          <div className="flex justify-center items-center absolute bottom-1 left-0 right-0">
            {dayEvents.map(event => (
              <div
                key={event.id}
                className={`h-1.5 w-1.5 rounded-full mx-0.5 ${event.type === 'meeting' ? 'bg-blue-500' : 'bg-purple-500'}`}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };
  
  // Find events for the currently selected day
  const selectedDayEvents = eventsMap.get(toDateString(calendarDate)) || [];

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
                    Events for {calendarDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map(event => (
                            <div key={event.id} className="flex items-center gap-3 text-sm">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${event.type === 'meeting' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {event.type === 'meeting' ? <Briefcase size={16} /> : <Sun size={16} />}
                                </div>
                                <span>{event.title}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-8">No events scheduled for this day.</p>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}