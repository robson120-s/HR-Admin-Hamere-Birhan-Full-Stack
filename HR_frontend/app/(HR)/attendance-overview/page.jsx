// /attendance-overview/page.jsx
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { getAttendanceOverview } from '../../../lib/api'; // Adjust path if needed
import toast from 'react-hot-toast';
import { 
    FaStar, FaCalendarDay, FaCheck, FaTimes, 
    FaHourglassHalf, FaUserCheck, FaUserTimes, FaUserClock, FaRegCircle 
} from 'react-icons/fa';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { useTheme } from 'next-themes';


// --- Icon and Color Mapping with Dark Mode Support ---
const statusConfig = {
  'present': { icon: <FaCheck />, color: 'text-green-500' },
  'late': { icon: <FaUserClock />, color: 'text-orange-500' },
  'absent': { icon: <FaTimes />, color: 'text-red-500' },
  'half_day': { icon: <FaHourglassHalf />, color: 'text-yellow-500' },
  'on_leave': { icon: <FaCalendarDay />, color: 'text-purple-500' },
  'holiday': { icon: <FaStar />, color: 'text-pink-500' },
  'weekend': { icon: <FaCalendarDay />, color: 'text-sky-500' },
  'pending': { icon: <FaRegCircle />, color: 'text-gray-400 dark:text-gray-600' },
  'default': { icon: <FaRegCircle />, color: 'text-gray-300 dark:text-gray-700' }
};

// --- Attendance Legend Component (Now with Dark Mode styles) ---
const AttendanceLegend = () => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
      <span className="font-semibold">Legend:</span>
      <div className="flex items-center gap-1.5"><FaCheck className="text-green-500"/> Present</div>
      <div className="flex items-center gap-1.5"><FaUserClock className="text-orange-500"/> Late</div>
      <div className="flex items-center gap-1.5"><FaTimes className="text-red-500"/> Absent</div>
      <div className="flex items-center gap-1.5"><FaHourglassHalf className="text-yellow-500"/> Half Day</div>
      <div className="flex items-center gap-1.5"><FaCalendarDay className="text-purple-500"/> On Leave</div>
    </div>
);

// --- Stat Card Component (Now with Dark Mode styles) ---
const AttendanceStatCard = ({ title, count, icon, bgColor, textColor, darkBgColor }) => (
    <div className={`flex items-center p-4 rounded-lg shadow-sm ${bgColor} ${darkBgColor}`}>
        <div className="p-3 rounded-full mr-4 bg-white/80">{icon}</div>
        <div>
            <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
            <p className={`text-sm font-medium ${textColor} opacity-90`}>{title}</p>
        </div>
    </div>
);

// --- Main Attendance Page Component ---
export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { theme } = useTheme(); // For theme-responsive styles

  const fetchAttendance = useCallback(async (date) => {
    setIsLoading(true);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // API expects 1-12
    try {
      const data = await getAttendanceOverview(year, month);
      setEmployees(data.employees);
      setAttendanceMap(data.attendanceMap);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance(currentDate);
  }, [currentDate, fetchAttendance]);

  const handleMonthChange = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysHeader = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Combine employee data with their attendance for the month
  const employeeAttendanceData = useMemo(() => {
    return employees.map(emp => {
      const dailyStatuses = [];
      const empAttendance = attendanceMap[emp.id] || {};
      for (let day = 1; day <= daysInMonth; day++) {
        dailyStatuses.push(empAttendance[day] || 'pending');
      }
      return { ...emp, attendance: dailyStatuses };
    });
  }, [employees, attendanceMap, daysInMonth]);


  // --- Calculate Today's Attendance Counts ---
  const todayStats = useMemo(() => {
    const today = new Date();
    const todayIndex = today.getDate() - 1;
    let present = 0, absent = 0, onLeave = 0;
    
    if (currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
        employeeAttendanceData.forEach(employee => {
            const statusToday = employee.attendance[todayIndex];
            if (statusToday === 'present' || statusToday === 'late' || statusToday === 'half_day') present++;
            else if (statusToday === 'absent') absent++;
            else if (statusToday === 'on_leave') onLeave++;
        });
    }
    return { present, absent, onLeave };
  }, [employeeAttendanceData, currentDate]);


  const filteredEmployees = useMemo(() => {
    return employeeAttendanceData.filter(emp =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employeeAttendanceData, searchTerm]);

  return (
    <div className="container mx-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Attendance Overview</h1>
            <div className="flex items-center gap-2 mt-2">
                <button onClick={() => handleMonthChange(-1)} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronLeft size={20}/></button>
                <span className="text-lg font-semibold w-36 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => handleMonthChange(1)} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronRight size={20}/></button>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {/* Theme switcher would go here if needed */}
        </div>
      </div>
      
      {/* --- Attendance Stats Section with Dark Mode --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AttendanceStatCard title="Present Today" count={todayStats.present} icon={<FaUserCheck size={24} className="text-green-600"/>} bgColor="bg-green-100" darkBgColor="dark:bg-green-900/50" textColor="text-green-800 dark:text-green-300"/>
        <AttendanceStatCard title="Absent Today" count={todayStats.absent} icon={<FaUserTimes size={24} className="text-red-600"/>} bgColor="bg-red-100" darkBgColor="dark:bg-red-900/50" textColor="text-red-800 dark:text-red-300"/>
        <AttendanceStatCard title="On Leave Today" count={todayStats.onLeave} icon={<FaUserClock size={24} className="text-purple-600"/>} bgColor="bg-purple-100" darkBgColor="dark:bg-purple-900/50" textColor="text-purple-800 dark:text-purple-300"/>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
        <div className="flex justify-end mb-4">
            <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md p-2 dark:bg-slate-700 dark:border-slate-600"
            />
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin h-8 w-8 text-indigo-500" /></div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-4 py-3 min-w-[200px] sticky left-0 bg-gray-50 dark:bg-gray-700/50 z-10">Employee</th>
                  {daysHeader.map(day => (
                    <th key={day} scope="col" className={`w-10 px-2 py-3 text-center ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold' : ''}`}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap sticky left-0 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 z-10">
                      <div className="flex items-center gap-3">
                        <img className="w-8 h-8 rounded-full object-cover" src={employee.photo || '/images/default-avatar.png'} alt={`${employee.firstName} avatar`} />
                        <span>{`${employee.firstName} ${employee.lastName}`}</span>
                      </div>
                    </td>
                    {employee.attendance.map((status, index) => (
                      <td key={index} className={`w-10 px-2 py-2 text-center ${index + 1 === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <div className="flex justify-center items-center" title={status.replace('_', ' ')}>
                          {(statusConfig[status] || statusConfig['default']).icon}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <AttendanceLegend />
      </div>
    </div>
  );
}