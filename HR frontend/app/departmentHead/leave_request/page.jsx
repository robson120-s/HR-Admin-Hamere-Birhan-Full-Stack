'use client'; // Directive to mark this as a Client Component.

import { useState, useEffect } from 'react';
import { ChevronDown, Calendar, CheckCircle2, XCircle, Clock, Plus, X, Moon, Sun } from 'lucide-react';

// NOTE: For the dark theme to work, you MUST update your tailwind.config.js file:
// module.exports = {
//   darkMode: 'class', // <--- Add this line
//   content: [ ... ],
//   theme: { ... },
//   plugins: [ ... ],
// };

// Initial data for the leave requests.
const initialLeaveData = [
    {
      employeeName: 'John Doe',
      leaveType: 'Vacation',
      leaveDuration: '15 Sep 2024 - 20 Sep 2024',
      days: 5,
      reason: 'Family Trip',
      status: 'Pending',
    },
    {
      employeeName: 'Jane Smith',
      leaveType: 'Sick',
      leaveDuration: '10 Sep 2024 - 10 Sep 2024',
      days: 1,
      reason: 'Flu',
      status: 'Approved',
    },
    {
      employeeName: 'Peter Jones',
      leaveType: 'Unpaid',
      leaveDuration: '01 Sep 2024 - 03 Sep 2024',
      days: 3,
      reason: 'Family Loss',
      status: 'Approved',
    },
];

const employees = ['John Doe', 'Jane Smith', 'Peter Jones', 'Mary Williams', 'David Brown', 'Susan Clark'];
const leaveTypes = ['Annual', 'Sick', 'Unpaid', 'Maternity', 'Other'];

const DepartmentLeaveRequestPage = () => {
  const [leaveData, setLeaveData] = useState(initialLeaveData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState('light'); // State for theme management

  // State for the form fields.
  const [newLeave, setNewLeave] = useState({
    employeeName: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
  });

  // Effect to apply the theme class to the document's root element.
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Function to toggle the theme.
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const getStatusPill = (status) => {
    const baseClasses = "text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full";
    switch (status) {
      case 'Approved':
        return <span className={`bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 ${baseClasses}`}>Approved</span>;
      case 'Pending':
        return <span className={`bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 ${baseClasses}`}>Pending</span>;
      case 'Rejected':
        return <span className={`bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 ${baseClasses}`}>Rejected</span>;
      default:
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeave(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!newLeave.employeeName || !newLeave.leaveType || !newLeave.startDate || !newLeave.endDate) {
        alert("Please fill in all required fields.");
        return;
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const startDate = new Date(newLeave.startDate);
    const endDate = new Date(newLeave.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const newRequest = {
      employeeName: newLeave.employeeName,
      leaveType: newLeave.leaveType,
      leaveDuration: `${formatDate(newLeave.startDate)} - ${formatDate(newLeave.endDate)}`,
      days: days,
      reason: newLeave.reason,
      status: 'Pending',
    };

    setLeaveData(prevLeaveData => [...prevLeaveData, newRequest]);
    setIsModalOpen(false);
    setNewLeave({ employeeName: '', leaveType: '', startDate: '', endDate: '', reason: '' });
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-8 font-sans text-gray-800 dark:text-gray-300">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Leave Management</h1>
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                </button>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add New Leave
                </button>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center transition-transform transform hover:scale-105">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-4 rounded-full">
                    <Calendar className="text-purple-600 dark:text-purple-400 h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaveData.length}</p>
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center transition-transform transform hover:scale-105">
                <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-full">
                    <CheckCircle2 className="text-green-600 dark:text-green-400 h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaveData.filter(l => l.status === 'Approved').length}</p>
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center transition-transform transform hover:scale-105">
                <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-full">
                    <XCircle className="text-red-600 dark:text-red-400 h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaveData.filter(l => l.status === 'Rejected').length}</p>
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center transition-transform transform hover:scale-105">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-full">
                    <Clock className="text-yellow-600 dark:text-yellow-400 h-6 w-6" />
                </div>
                <div className="ml-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaveData.filter(l => l.status === 'Pending').length}</p>
                </div>
            </div>
        </div>

        {/* Leave Requests Table Container */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Show</span>
              <div className="relative">
                <select className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">entries</span>
            </div>
            <div className="relative">
              <input type="text" placeholder="Search..." className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full md:w-auto" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Employee Name</th>
                  <th scope="col" className="px-6 py-3">Leave Type</th>
                  <th scope="col" className="px-6 py-3">Leave Duration</th>
                  <th scope="col" className="px-6 py-3">Days</th>
                  <th scope="col" className="px-6 py-3">Reason</th>
                  <th scope="col" className="px-6 py-3">Current Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveData.map((leave, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{leave.employeeName}</td>
                    <td className="px-6 py-4">{leave.leaveType}</td>
                    <td className="px-6 py-4">{leave.leaveDuration}</td>
                    <td className="px-6 py-4">{leave.days}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{leave.reason}</td>
                    <td className="px-6 py-4">{getStatusPill(leave.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add New Leave</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name</label>
                  <select id="employeeName" name="employeeName" value={newLeave.employeeName} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">
                    <option value="">Select Employee</option>
                    {employees.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                  <select id="leaveType" name="leaveType" value={newLeave.leaveType} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={newLeave.startDate} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"/>
                  </div>
                   <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input type="date" id="endDate" name="endDate" value={newLeave.endDate} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"/>
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                  <textarea id="reason" name="reason" rows="3" value={newLeave.reason} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"></textarea>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentLeaveRequestPage;