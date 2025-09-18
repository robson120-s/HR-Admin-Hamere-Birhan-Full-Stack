// pages/index.js
"use client";
import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const InternDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Mock data
  const dashboardData = {
    attendance: {
      present: 42,
      absent: 3,
      late: 2
    },
    performance: {
      score: 87,
      trend: 'up',
      tasksCompleted: 24,
      totalTasks: 30
    },
    recentActivities: [
      { id: 1, action: 'Completed Task', project: 'Website Redesign', time: '2 hours ago' },
      { id: 2, action: 'Submitted Report', project: 'Q3 Analysis', time: 'Yesterday' },
      { id: 3, action: 'Attended Meeting', project: 'Team Sync', time: '2 days ago' },
      { id: 4, action: 'Received Feedback', project: 'Dashboard Design', time: '3 days ago' }
    ]
  };

  // Calendar data (events, holidays, etc.)
  const calendarEvents = [
    { date: new Date(2023, 8, 15), title: 'Project Submission', type: 'deadline' },
    { date: new Date(2023, 8, 18), title: 'Team Meeting', type: 'meeting' },
    { date: new Date(2023, 8, 22), title: 'Performance Review', type: 'review' },
    { date: new Date(2023, 8, 25), title: 'Training Workshop', type: 'training' },
    { date: new Date(2023, 8, 28), title: 'Mentor Session', type: 'mentor' },
    { date: new Date(2023, 8, 30), title: 'Final Presentation', type: 'presentation' },
  ];

  // Function to check if a date has events
  const dateHasEvent = (date) => {
    return calendarEvents.some(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Function to get events for a specific date
  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Function to get event type color
  const getEventTypeColor = (type) => {
    switch(type) {
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'mentor': return 'bg-yellow-100 text-yellow-800';
      case 'presentation': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to navigate months
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Generate days for the calendar
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false
      });
    }
    days.reverse();
    
    // Current month days
    const today = new Date();
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getDate() === today.getDate() && 
                 date.getMonth() === today.getMonth() && 
                 date.getFullYear() === today.getFullYear(),
        hasEvent: dateHasEvent(date)
      });
    }
    
    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Intern Dashboard</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="relative">
              <BellIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                3
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 md:h-10 md:w-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                JD
              </div>
              <span className="text-gray-800 text-sm md:text-base">John Doe</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Attendance Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 md:h-6 md:w-6 mr-2 text-indigo-600" />
                Attendance Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-green-50 p-3 md:p-4 rounded-lg flex items-center">
                  <div className="bg-green-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <CheckCircleIcon className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{dashboardData.attendance.present}</p>
                    <p className="text-gray-600 text-sm md:text-base">Days Present</p>
                  </div>
                </div>
                <div className="bg-red-50 p-3 md:p-4 rounded-lg flex items-center">
                  <div className="bg-red-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <XCircleIcon className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{dashboardData.attendance.absent}</p>
                    <p className="text-gray-600 text-sm md:text-base">Days Absent</p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 md:p-4 rounded-lg flex items-center">
                  <div className="bg-yellow-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <ClockIcon className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{dashboardData.attendance.late}</p>
                    <p className="text-gray-600 text-sm md:text-base">Days Late</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Highlight */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 md:h-6 md:w-6 mr-2 text-indigo-600" />
                Performance Highlights
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eee"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="3"
                        strokeDasharray={`${dashboardData.performance.score}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl md:text-2xl font-bold text-gray-800">{dashboardData.performance.score}%</span>
                      <span className="text-xs text-gray-600">Score</span>
                    </div>
                  </div>
                  <div className="ml-4 md:ml-6">
                    <div className="flex items-center mb-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-2" />
                      <span className="text-gray-800 font-medium text-sm md:text-base">Performance trending up</span>
                    </div>
                    <p className="text-gray-600 text-sm md:text-base">
                      Completed {dashboardData.performance.tasksCompleted} of {dashboardData.performance.totalTasks} tasks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 md:h-6 md:w-6 mr-2 text-indigo-600" />
                Recent Activity
              </h2>
              <div className="space-y-3 md:space-y-4">
                {dashboardData.recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start border-b border-gray-100 pb-3 md:pb-4 last:border-0 last:pb-0">
                    <div className="bg-indigo-100 p-1.5 md:p-2 rounded-full mr-3 md:mr-4">
                      <AcademicCapIcon className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm md:text-base">{activity.action}</h3>
                      <p className="text-gray-600 text-xs md:text-sm">{activity.project}</p>
                    </div>
                    <span className="text-gray-500 text-xs md:text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 md:h-6 md:w-6 mr-2 text-indigo-600" />
                Internship Calendar
              </h2>
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Calendar Week Days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`h-10 md:h-12 flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer
                      ${day.isToday ? 'bg-indigo-100 text-indigo-800 font-bold' : ''}
                      ${day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                      ${selectedDate.getDate() === day.date.getDate() && 
                        selectedDate.getMonth() === day.date.getMonth() && 
                        selectedDate.getFullYear() === day.date.getFullYear() 
                        ? 'ring-2 ring-indigo-500' : ''}
                      hover:bg-gray-100 relative`}
                  >
                    {day.date.getDate()}
                    {day.hasEvent && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Selected Date Events */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  Events on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event, index) => (
                      <div key={index} className={`p-2 rounded-lg text-sm ${getEventTypeColor(event.type)}`}>
                        {event.title}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-2">No events scheduled</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {calendarEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`flex-shrink-0 w-2 h-12 rounded-full ${getEventTypeColor(event.type).split(' ')[0]}`}></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Internship Progress</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800">Days Completed</p>
                  <p className="text-xl font-bold text-blue-800">48/90</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-800">Tasks Pending</p>
                  <p className="text-xl font-bold text-green-800">6</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-800">Meetings</p>
                  <p className="text-xl font-bold text-purple-800">12</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800">Feedback Received</p>
                  <p className="text-xl font-bold text-yellow-800">8</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;