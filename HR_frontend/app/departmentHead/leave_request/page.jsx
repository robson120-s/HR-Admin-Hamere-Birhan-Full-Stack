// /departmentHead/leave_request/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, Calendar, CheckCircle2, XCircle, Clock, Plus, X, Moon, Sun, LoaderCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { getScopedLeaveRequests, createLeaveRequest, getScopedEmployeesForLeave } from '../../../lib/api'; // Adjust path

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
const DepartmentLeaveRequestPage = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [employees, setEmployees] = useState([]); // For the 'Add New' modal dropdown
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
  });

  useEffect(() => { setMounted(true); }, []);

  // Fetch all necessary data when the page loads
  const fetchPageData = useCallback(async () => {
    try {
      // Fetch both requests in parallel for better performance
      const [leaves, emps] = await Promise.all([
        getScopedLeaveRequests(),
        getScopedEmployeesForLeave(),
      ]);
      setLeaveData(leaves);
      setEmployees(emps);
    } catch (error) {
      toast.error(error.message || "Failed to load page data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);
  
  const getStatusPill = (status) => {
    const baseClasses = "text-xs font-semibold px-2.5 py-1 rounded-full";
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className={`bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 ${baseClasses}`}>Approved</span>;
      case 'pending':
        return <span className={`bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 ${baseClasses}`}>Pending</span>;
      case 'rejected':
        return <span className={`bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 ${baseClasses}`}>Rejected</span>;
      default:
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeave(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!newLeave.employeeId || !newLeave.leaveType || !newLeave.startDate || !newLeave.endDate) {
        toast.error("Please fill in all required fields.");
        return;
    }

    try {
      const newRequest = await createLeaveRequest(newLeave);
      setLeaveData(prevLeaveData => [newRequest, ...prevLeaveData]); // Add new request to the top of the list
      toast.success("Leave request submitted successfully!");
      setIsModalOpen(false); // Close modal on success
      setNewLeave({ employeeId: '', leaveType: 'annual', startDate: '', endDate: '', reason: '' }); // Reset form
    } catch(error) {
        toast.error(error.message);
    }
  };

  const leaveTypes = ['annual', 'sick', 'unpaid', 'maternity', 'other'];
  
  const stats = {
      total: leaveData.length,
      approved: leaveData.filter(l => l.status === 'approved').length,
      rejected: leaveData.filter(l => l.status === 'rejected').length,
      pending: leaveData.filter(l => l.status === 'pending').length,
  };

  if (!mounted) {
      return <div className="bg-gray-50 dark:bg-gray-900 min-h-screen"></div>;
  }
  
  if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" />
        </div>
      );
  }

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-gray-800 dark:text-gray-300">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Leave Management</h1>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center"><div className="bg-purple-100 dark:bg-purple-900/50 p-4 rounded-full"><Calendar className="text-purple-600 dark:text-purple-400 h-6 w-6" /></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Requests</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p></div></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center"><div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-full"><CheckCircle2 className="text-green-600 dark:text-green-400 h-6 w-6" /></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Approved</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p></div></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center"><div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-full"><XCircle className="text-red-600 dark:text-red-400 h-6 w-6" /></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Rejected</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p></div></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center"><div className="bg-yellow-100 dark:bg-yellow-900/50 p-4 rounded-full"><Clock className="text-yellow-600 dark:text-yellow-400 h-6 w-6" /></div><div className="ml-4"><p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p></div></div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Employee Name</th>
                  <th scope="col" className="px-6 py-3">Leave Type</th>
                  <th scope="col" className="px-6 py-3">Leave Duration</th>
                  <th scope="col" className="px-6 py-3">Days</th>
                  <th scope="col" className="px-6 py-3">Reason</th>
                  <th scope="col" className="px-6 py-3">Status from HR</th>
                </tr>
              </thead>
              <tbody>
                {leaveData.map((leave, index) => {
                    const fullName = `${leave.employee.firstName} ${leave.employee.lastName}`;
                    const startDate = new Date(leave.startDate);
                    const endDate = new Date(leave.endDate);
                    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                        <tr key={leave.id || index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{fullName}</td>
                            <td className="px-6 py-4 capitalize">{leave.leaveType}</td>
                            <td className="px-6 py-4">{`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}</td>
                            <td className="px-6 py-4">{days}</td>
                            <td className="px-6 py-4 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                            <td className="px-6 py-4">{getStatusPill(leave.status.charAt(0).toUpperCase() + leave.status.slice(1))}</td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add New Leave</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium mb-1">Employee Name</label>
                  <select id="employeeId" name="employeeId" value={newLeave.employeeId} onChange={handleInputChange} required className="w-full border dark:bg-gray-700 rounded-lg py-2 px-3">
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="leaveType" className="block text-sm font-medium mb-1">Leave Type</label>
                  <select id="leaveType" name="leaveType" value={newLeave.leaveType} onChange={handleInputChange} required className="w-full border dark:bg-gray-700 rounded-lg py-2 px-3">
                    {leaveTypes.map(type => <option key={type} value={type} className="capitalize">{type}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={newLeave.startDate} onChange={handleInputChange} required className="w-full border dark:bg-gray-700 rounded-lg py-2 px-3"/>
                  </div>
                   <div>
                    <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
                    <input type="date" id="endDate" name="endDate" value={newLeave.endDate} onChange={handleInputChange} required className="w-full border dark:bg-gray-700 rounded-lg py-2 px-3"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium mb-1">Reason</label>
                  <textarea id="reason" name="reason" rows="3" value={newLeave.reason} onChange={handleInputChange} required className="w-full border dark:bg-gray-700 rounded-lg py-2 px-3"></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentLeaveRequestPage;