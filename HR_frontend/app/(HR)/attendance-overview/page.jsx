"use client";

import { useState, useMemo } from 'react';
import { 
    FaStar, FaCalendarDay, FaCheck, FaExclamation, FaTimes, FaArrowUp, 
    FaArrowRight, FaHourglassHalf, FaUserCheck, FaUserTimes, FaUserClock 
} from 'react-icons/fa';

// --- Dynamic Date Logic ---
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // 0-indexed (0 for January)
const currentDate = today.getDate(); // Day of the month (1-31)

// Get the total number of days in the current month
const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

// --- Mock Data ---
const employeeSeedData = [
  {
    id: 1,
    name: 'Alexander Smith',
    avatar: 'https://i.pravatar.cc/150?u=alexandersmith',
    baseAttendance: ['Present', 'Present', 'Present', 'Late', 'Present', 'Day Off', 'Day Off']
  },
  {
    id: 2,
    name: 'Amelia Gonzalez',
    avatar: 'https://i.pravatar.cc/150?u=ameliagonzalez',
    baseAttendance: ['Present', 'Present', 'Absent', 'Present', 'Present', 'Day Off', 'Day Off']
  },
  {
    id: 3,
    name: 'Ava Garcia',
    avatar: 'https://i.pravatar.cc/150?u=avagarcia',
    baseAttendance: ['On Leave', 'Present', 'Present', 'Present', 'Late', 'Day Off', 'Day Off']
  },
  {
    id: 4,
    name: 'Benjamin Brown',
    avatar: 'https://i.pravatar.cc/150?u=benjaminbrown',
    baseAttendance: ['Present', 'Late', 'Present', 'Present', 'Present', 'Day Off', 'Day Off']
  },
  {
    id: 5,
    name: 'Charlotte Davis',
    avatar: 'https://i.pravatar.cc/150?u=charlottedavis',
    baseAttendance: ['Absent', 'Present', 'Present', 'Present', 'On Leave', 'Day Off', 'Day Off']
  },
];

// --- MODIFIED: Function to Generate Dynamic Attendance ---
const generateMonthlyAttendance = (employees) => {
  return employees.map(emp => {
    const monthlyAttendance = [];
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      // If the day is in the past or is today, generate a real status
      if (day <= currentDate) {
        monthlyAttendance.push(emp.baseAttendance[(day - 1) % emp.baseAttendance.length]);
      } else {
        // If the day is in the future, mark it as 'Pending'
        monthlyAttendance.push('Pending');
      }
    }
    return { ...emp, attendance: monthlyAttendance };
  });
};

const employeeData = generateMonthlyAttendance(employeeSeedData);


// --- Icon Mapping ---
const statusIcons = {
  'Holiday': <FaStar className="text-purple-500" />,
  'Day Off': <FaCalendarDay className="text-blue-500" />,
  'Present': <FaCheck className="text-green-500" />,
  'Half Day': <FaExclamation className="text-yellow-500" />,
  'Late': <FaExclamation className="text-orange-500" />,
  'Absent': <FaTimes className="text-red-500" />,
  'On Leave': <FaArrowRight className="text-purple-700" />,
  'Pending': <FaHourglassHalf className="text-gray-400" />, // Icon for future dates
  'Default': <FaArrowRight className="text-gray-400" />
};

// --- Attendance Legend Component ---
const AttendanceLegend = () => (
    <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
      <span className="font-bold">Note:</span>
      <div className="flex items-center gap-2"><FaStar className="text-purple-500" /> Holiday</div>
      <div className="flex items-center gap-2"><FaCalendarDay className="text-blue-500" /> Day Off</div>
      <div className="flex items-center gap-2"><FaCheck className="text-green-500" /> Present</div>
      <div className="flex items-center gap-2"><FaExclamation className="text-yellow-500" /> Half Day</div>
      <div className="flex items-center gap-2"><FaExclamation className="text-orange-500" /> Late</div>
      <div className="flex items-center gap-2"><FaTimes className="text-red-500" /> Absent</div>
      <div className="flex items-center gap-2"><FaArrowRight className="text-purple-700" /> On Leave</div>
    </div>
);

// --- Stat Card Component ---
const AttendanceStatCard = ({ title, count, icon, bgColor, textColor }) => (
    <div className={`flex items-center p-4 rounded-lg shadow ${bgColor}`}>
        <div className={`p-3 rounded-full mr-4 ${textColor} bg-white`}>
            {icon}
        </div>
        <div>
            <p className={`text-lg font-bold ${textColor}`}>{count}</p>
            <p className={`text-sm ${textColor}`}>{title}</p>
        </div>
    </div>
);


// --- Main Attendance Page Component ---
export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesToShow, setEntriesToShow] = useState(10);

  // --- Calculate Today's Attendance Counts ---
  const todayIndex = currentDate - 1; // 0-indexed for the array
  const { presentToday, absentToday, onLeaveToday } = useMemo(() => {
    let present = 0;
    let absent = 0;
    let onLeave = 0;
    
    employeeData.forEach(employee => {
        const statusToday = employee.attendance[todayIndex];
        if (statusToday === 'Present' || statusToday === 'Late' || statusToday === 'Half Day') {
            present++;
        } else if (statusToday === 'Absent') {
            absent++;
        } else if (statusToday === 'On Leave') {
            onLeave++;
        }
    });

    return { presentToday: present, absentToday: absent, onLeaveToday: onLeave };
  }, []); // Empty dependency array as employeeData is static for this example


  const filteredEmployees = useMemo(() => {
    return employeeData
      .filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, entriesToShow);
  }, [searchTerm, entriesToShow]);

  // Generate an array of day numbers for the current month
  const daysHeader = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
       <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Overview</h1>
        <p className="text-gray-500">
            {today.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
       </div>
      
      {/* --- Attendance Stats Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <AttendanceStatCard 
            title="Present Today" 
            count={presentToday} 
            icon={<FaUserCheck size={24} />} 
            bgColor="bg-green-500" 
            textColor="text-green-700"
        />
        <AttendanceStatCard 
            title="Absent Today" 
            count={absentToday} 
            icon={<FaUserTimes size={24} />} 
            bgColor="bg-red-500"
            textColor="text-red-700"
        />
        <AttendanceStatCard 
            title="On Leave Today" 
            count={onLeaveToday} 
            icon={<FaUserClock size={24} />} 
            bgColor="bg-purple-500"
            textColor="text-purple-700"
        />
      </div>


      <div className="bg-white p-4 rounded-lg shadow-md">
        <AttendanceLegend />
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2">
            <span>Show</span>
            <select
                value={entriesToShow}
                onChange={(e) => setEntriesToShow(Number(e.target.value))}
                className="border border-gray-300 rounded-md p-2"
            >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
            </select>
            <span>entries</span>
            </div>
            <div className="flex items-center gap-2">
            <span>Search:</span>
            <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md p-2"
            />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 min-w-[200px] sticky left-0 bg-gray-50 z-10">Employee</th>
                {daysHeader.map(day => (
                    <th key={day} scope="col" className={`px-2 py-3 text-center ${day === currentDate ? 'bg-blue-200 text-blue-800 font-bold' : ''}`}>
                        {day}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {filteredEmployees.map(employee => (
                <tr key={employee.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white hover:bg-gray-50 z-10">
                    <div className="flex items-center gap-3">
                        <img className="w-10 h-10 rounded-full" src={employee.avatar} alt={`${employee.name} avatar`} />
                        {employee.name}
                    </div>
                    </td>
                    {employee.attendance.map((status, index) => (
                    <td key={index} className={`px-2 py-4 text-center ${index + 1 === currentDate ? 'bg-blue-50' : ''}`}>
                        <div className="flex justify-center items-center">
                            {statusIcons[status] || statusIcons['Default']}
                        </div>
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}