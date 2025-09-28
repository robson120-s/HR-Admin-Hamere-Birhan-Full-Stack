"use client"
import { useState, useEffect, useCallback } from "react";
import { 
  Calendar, Users, Filter, Search, CheckCircle, XCircle, Clock, 
  Shield, Save, Download, ChevronLeft, ChevronRight, Edit, CheckSquare,
  Loader, AlertCircle, RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getAttendanceForApproval, approveAttendance, saveAttendances } from "../../../lib/api";

const HRAttendanceApproval = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [approvedEmployeeIds, setApprovedEmployeeIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editableAttendance, setEditableAttendance] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch attendance data using API function
  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAttendanceForApproval(selectedDate);
      setAttendanceData(data.attendanceLogs || []);
      
      // Only set approved IDs if they exist in the response
      if (data.approvedEmployeeIds && Array.isArray(data.approvedEmployeeIds)) {
        setApprovedEmployeeIds(new Set(data.approvedEmployeeIds));
      } else {
        setApprovedEmployeeIds(new Set());
      }
      
      setDepartments(data.departments || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Initialize editable attendance only when entering edit mode
const startEditing = () => {
  const initialEditableAttendance = {};
  attendanceData.forEach(log => {
    const empIdStr = String(log.employeeId);
    if (!initialEditableAttendance[empIdStr]) {
      initialEditableAttendance[empIdStr] = {};
    }
    const sessionName = { 1: 'Morning', 2: 'Afternoon', 3: 'Evening' }[log.sessionId];
    initialEditableAttendance[empIdStr][sessionName] = log.status;
  });
  setEditableAttendance(initialEditableAttendance);
  setIsEditing(true);
};

  // Cancel editing and reset editableAttendance
  const cancelEditing = () => {
    setIsEditing(false);
    setEditableAttendance({});
  };

  // Handle status change
const handleStatusChange = (employeeId, session) => {
  if (!isEditing) {
    toast.error("Please enable edit mode first");
    return;
  }
  
  if (approvedEmployeeIds.has(employeeId)) {
    toast.error("Cannot change status for approved attendance");
    return;
  }
  
  const statuses = ['present', 'late', 'absent', 'permission'];
  const empIdStr = String(employeeId);
  const currentStatus = editableAttendance[empIdStr]?.[session] || 'absent';
  const currentIndex = statuses.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % statuses.length;
  const newStatus = statuses[nextIndex];
  
  setEditableAttendance(prev => ({
    ...prev,
    [empIdStr]: {
      ...(prev[empIdStr] || {}),
      [session]: newStatus
    }
  }));
};


  // Save attendance changes using API function
  const saveAttendanceChanges = async () => {
    setIsSaving(true);
    try {
      // Filter out approved employees from the editable data
      const filteredAttendance = {};
      Object.entries(editableAttendance).forEach(([employeeId, sessions]) => {
        if (!approvedEmployeeIds.has(parseInt(employeeId))) {
          filteredAttendance[employeeId] = sessions;
        }
      });
      
      await saveAttendances({
        date: selectedDate,
        attendance: filteredAttendance
      });
      
      toast.success('Attendance changes saved successfully');
      setIsEditing(false);
      setEditableAttendance({});
      fetchAttendanceData();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Approve attendance using API function
  const approveAttendanceHandler = async () => {
    setIsApproving(true);
    try {
      // Get only unapproved employee IDs
      const unapprovedEmployeeIds = [...new Set(attendanceData
        .map(log => log.employeeId)
        .filter(id => !approvedEmployeeIds.has(id))
      )];
      
      if (unapprovedEmployeeIds.length === 0) {
        toast.error("No pending attendance to approve");
        setIsApproving(false);
        return;
      }
      
      await approveAttendance(selectedDate, unapprovedEmployeeIds);
      
      toast.success('Attendance approved successfully');
      
      // Update the approved employee IDs locally
      const newApprovedIds = new Set(approvedEmployeeIds);
      unapprovedEmployeeIds.forEach(id => newApprovedIds.add(id));
      setApprovedEmployeeIds(newApprovedIds);
      
      // Refresh data to get the latest from server
      fetchAttendanceData();
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error.message);
    } finally {
      setIsApproving(false);
    }
  };

  // Group attendance by employee
  const groupedAttendance = {};
  attendanceData.forEach(log => {
    if (!groupedAttendance[log.employeeId]) {
      groupedAttendance[log.employeeId] = {
        employee: log.employee,
        sessions: {}
      };
    }
    const sessionName = { 1: 'Morning', 2: 'Afternoon', 3: 'Evening' }[log.sessionId];
    groupedAttendance[log.employeeId].sessions[sessionName] = log;
  });

  // Status icons and colors
  const statusConfig = {
    present: { icon: <CheckCircle size={16} />, color: 'text-green-600', bg: 'bg-green-100' },
    late: { icon: <Clock size={16} />, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    absent: { icon: <XCircle size={16} />, color: 'text-red-600', bg: 'bg-red-100' },
    permission: { icon: <Shield size={16} />, color: 'text-blue-600', bg: 'bg-blue-100' }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Attendance Approval</h1>
              <p className="text-gray-600">Review and approve employee attendance</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => fetchAttendanceData()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {isLoading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Refresh
              </button>
              
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Edit size={16} />
                  Edit
                </button>
              ) : (
                <button
                  onClick={saveAttendanceChanges}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                >
                  {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              )}
              
              <button
                onClick={approveAttendanceHandler}
                disabled={isApproving || isEditing || attendanceData.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
              >
                {isApproving ? <Loader size={16} className="animate-spin" /> : <CheckSquare size={16} />}
                Approve All
              </button>
              
              {isEditing && (
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-gray-400" />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600">
                Showing {attendanceData.length} records
              </span>
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-100"></div>
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-100"></div>
              <span className="text-sm">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-100"></div>
              <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-100"></div>
              <span className="text-sm">Permission</span>
            </div>
          </div>

          {/* Attendance Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader size={32} className="animate-spin text-blue-500" />
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <AlertCircle size={48} className="mb-4" />
              <p>No attendance records found for the selected criteria</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-gray-700 font-medium">Employee</th>
                      <th className="px-4 py-3 text-center text-gray-700 font-medium">Morning</th>
                      <th className="px-4 py-3 text-center text-gray-700 font-medium">Afternoon</th>
                      <th className="px-4 py-3 text-center text-gray-700 font-medium">Evening</th>
                      <th className="px-4 py-3 text-center text-gray-700 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedAttendance).map(({ employee, sessions }) => {
                      const isApproved = approvedEmployeeIds.has(employee.id);
                      
                      return (
                        <tr key={employee.id} className={`border-b border-gray-200 hover:bg-gray-50 ${isApproved ? 'bg-green-50' : ''}`}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                              <p className="text-sm text-gray-600">{employee.department?.name || 'No Department'}</p>
                              {employee.subDepartment && (
                                <p className="text-xs text-gray-500">{employee.subDepartment.name}</p>
                              )}
                            </div>
                          </td>
                          
{['Morning', 'Afternoon', 'Evening'].map(session => {
  const log = sessions[session];
  const empIdStr = String(employee.id);
  const status = editableAttendance[empIdStr]?.[session] || (log ? log.status : 'absent');
                            const config = statusConfig[status] || statusConfig.absent;
                            
                            return (
                              <td key={session} className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleStatusChange(employee.id, session)}
                                  disabled={!isEditing || isApproved}
                                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${config.bg} ${config.color} ${isEditing && !isApproved ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                  title={`${session}: ${status}${isApproved ? ' (Approved - cannot edit)' : ''}`}
                                >
                                  {config.icon}
                                </button>
                              </td>
                            );
                          })}
                          
                          <td className="px-4 py-3 text-center">
                            {isApproved ? (
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                <CheckCircle size={14} className="mr-1" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                <Clock size={14} className="mr-1" />
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1 text-gray-700 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full ${currentPage === page ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1 text-gray-700 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};




export default HRAttendanceApproval;
