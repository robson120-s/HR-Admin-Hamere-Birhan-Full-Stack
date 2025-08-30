"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, Calendar, Users, Briefcase, Check, X, Shield, Clock, CheckCircle, Save, Pencil } from "lucide-react";
import { getAttendanceForApproval, saveAttendance, approveAttendance } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================
const StatusCell = ({ status, onClick, disabled = false }) => {
    const config = {
        present: { icon: <Check size={16} />, color: 'text-green-600', bg: 'hover:bg-green-100 dark:hover:bg-green-900/50' },
        late: { icon: <Clock size={16} />, color: 'text-yellow-600', bg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/50' },
        absent: { icon: <X size={16} />, color: 'text-red-600', bg: 'hover:bg-red-100 dark:hover:bg-red-900/50' },
        permission: { icon: <Shield size={16} />, color: 'text-cyan-600', bg: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/50' },
    };
    const current = config[status] || { icon: '?', color: 'text-gray-500', bg: 'hover:bg-gray-100' };
    return (
        <td className="p-2 text-center">
            <button
                onClick={onClick}
                disabled={disabled}
                title={disabled ? "Approved" : `Change status (current: ${status})`}
                className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center transition-colors ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : `${current.bg} ${current.color}`}`}
            >
                {current.icon}
            </button>
        </td>
    );
};

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function EditAttendancePage() {
    const [pageData, setPageData] = useState({ departments: [], employees: [], attendanceLogs: [], approvedEmployeeIds: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedSubDept, setSelectedSubDept] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    
    // States for Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [editableAttendance, setEditableAttendance] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const fetchData = useCallback(async (date) => {
        setIsLoading(true);
        setSelectedSubDept(null);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        try {
            const result = await getAttendanceForApproval(date);
            setPageData(result);
            
            // Initialize editableAttendance with current logs
            const initialLogs = (result.attendanceLogs || []).reduce((acc, log) => {
                if (!acc[log.employeeId]) acc[log.employeeId] = {};
                const sessionMap = { 1: 'Morning', 2: 'Afternoon', 3: 'Evening' };
                acc[log.employeeId][sessionMap[log.sessionId]] = log.status;
                return acc;
            }, {});
            
            setEditableAttendance(initialLogs);
        } catch (error) {
            toast.error(error.message || "Failed to fetch data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate, fetchData]);

    const handleStatusChange = (employeeId, session) => {
        if (!isEditing) {
            toast.error("Click 'Edit' to make changes.");
            return;
        }
        
        const statuses = ['present', 'late', 'absent', 'permission'];
        const currentStatus = editableAttendance[employeeId]?.[session] || 'absent';
        const currentIndex = statuses.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const newStatus = statuses[nextIndex];

        setEditableAttendance(prev => ({
            ...prev,
            [employeeId]: { ...(prev[employeeId] || {}), [session]: newStatus }
        }));
        
        setHasUnsavedChanges(true);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            // Filter to only include employees in the selected sub-department
            const employeesInSubDept = [
                ...(subDeptForUI?.staff || []).map(e => e.id),
                ...(subDeptForUI?.interns || []).map(e => e.id)
            ];
            
            const filteredAttendance = {};
            Object.keys(editableAttendance).forEach(empId => {
                if (employeesInSubDept.includes(parseInt(empId))) {
                    filteredAttendance[empId] = editableAttendance[empId];
                }
            });
            
            const payload = {
                date: selectedDate,
                attendance: filteredAttendance
            };
            
            await saveAttendance(payload);
            
            toast.success('Changes saved successfully!');
            setHasUnsavedChanges(false);
            
            // Refresh data to get the latest from server
            fetchData(selectedDate);
        } catch (error) {
            toast.error(error.message || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleApprove = async () => {
        if (hasUnsavedChanges) {
            toast.error("Please save your changes before approving.");
            return;
        }
        
        const employeeIds = [
            ...(subDeptForUI?.staff || []).map(e => e.id),
            ...(subDeptForUI?.interns || []).map(e => e.id)
        ];
        
        if (employeeIds.length === 0) {
            toast.error("No employees to approve.");
            return;
        }
        
        setIsApproving(true);
        try {
            await approveAttendance(selectedDate, employeeIds);
            toast.success('Attendance approved successfully!');
            
            // Refresh data to update approval status
            fetchData(selectedDate);
        } catch (error) {
            toast.error(error.message || 'Approval failed.');
        } finally {
            setIsApproving(false);
        }
    };

    const approvedIdsSet = new Set(pageData.approvedEmployeeIds || []);
    const subDeptForUI = selectedSubDept ? {
        ...selectedSubDept,
        staff: (pageData.employees || []).filter(e => 
            e.subDepartmentId === selectedSubDept.id && 
            e.user?.roles[0]?.role.name === 'Staff'
        ),
        interns: (pageData.employees || []).filter(e => 
            e.subDepartmentId === selectedSubDept.id && 
            e.user?.roles[0]?.role.name === 'Intern'
        ),
    } : null;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* SIDEBAR PANEL */}
            <aside className="w-80 border-r dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Departments</h2>
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} />
                    <Input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                    />
                </div>
                <div className="overflow-y-auto flex-1">
                    {isLoading ? (
                        <LoaderCircle className="mx-auto mt-10 animate-spin"/>
                    ) : (
                        (pageData.departments || []).map(dept => (
                            <div key={dept.id} className="mb-4">
                                <h3 className="font-semibold">{dept.name}</h3>
                                <div className="pl-2 border-l-2 mt-2 space-y-1">
                                    {dept.subDepartments.map(sub => (
                                        <button 
                                            key={sub.id} 
                                            onClick={() => setSelectedSubDept(sub)}
                                            className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                                                selectedSubDept?.id === sub.id 
                                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                            }`}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* MAIN CONTENT PANEL */}
            <main className="flex-1 p-6 lg:p-8">
                {!selectedSubDept ? (
                    <div className="flex h-full items-center justify-center text-center text-slate-500">
                        <div>
                            <Briefcase size={48} className="mx-auto mb-4"/>
                            <h2 className="text-xl font-semibold">Select a Sub-Department</h2>
                            <p>Choose a team from the left to review their attendance.</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold">{subDeptForUI.name}</h1>
                                <p className="text-sm text-slate-500">
                                    Reviewing attendance for {new Date(selectedDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Pencil className="mr-2" size={16}/>Edit
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        onClick={handleSaveChanges} 
                                        disabled={isSaving || !hasUnsavedChanges}
                                    >
                                        {isSaving ? (
                                            <LoaderCircle className="mr-2 animate-spin" size={16}/>
                                        ) : (
                                            <Save className="mr-2" size={16}/>
                                        )}
                                        Save Changes
                                    </Button>
                                )}
                                <Button 
                                    size="lg" 
                                    onClick={handleApprove} 
                                    disabled={isApproving || hasUnsavedChanges}
                                >
                                    {isApproving ? (
                                        <LoaderCircle className="mr-2 animate-spin" size={16}/>
                                    ) : (
                                        <CheckCircle className="mr-2" size={16}/>
                                    )}
                                    Approve Group
                                </Button>
                                {isEditing && (
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setHasUnsavedChanges(false);
                                            // Reset to original data
                                            fetchData(selectedDate);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="p-3 text-left text-xs font-medium uppercase">Employee</th>
                                        <th className="p-3 text-center text-xs font-medium uppercase">Morning</th>
                                        <th className="p-3 text-center text-xs font-medium uppercase">Afternoon</th>
                                        <th className="p-3 text-center text-xs font-medium uppercase">Evening</th>
                                        <th className="p-3 text-center text-xs font-medium uppercase">Approval Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {subDeptForUI.staff.map(emp => {
                                        const isApproved = approvedIdsSet.has(emp.id);
                                        return (
                                            <tr key={emp.id} className={isApproved ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                                                <td className="p-3 font-medium">
                                                    {emp.firstName} {emp.lastName}
                                                    {emp.user?.roles[0]?.role.name === 'Staff' && (
                                                        <span className="ml-2 text-xs text-slate-500">(Staff)</span>
                                                    )}
                                                </td>
                                                <StatusCell 
                                                    disabled={isApproved || !isEditing} 
                                                    status={editableAttendance[emp.id]?.Morning} 
                                                    onClick={() => handleStatusChange(emp.id, 'Morning')}
                                                />
                                                <StatusCell 
                                                    disabled={isApproved || !isEditing} 
                                                    status={editableAttendance[emp.id]?.Afternoon} 
                                                    onClick={() => handleStatusChange(emp.id, 'Afternoon')}
                                                />
                                                <StatusCell 
                                                    disabled={isApproved || !isEditing} 
                                                    status={editableAttendance[emp.id]?.Evening} 
                                                    onClick={() => handleStatusChange(emp.id, 'Evening')}
                                                />
                                                <td className="p-3 text-center">
                                                    {isApproved ? (
                                                        <span className="text-xs font-semibold text-green-600 flex items-center justify-center gap-1">
                                                            <CheckCircle size={14}/>Approved
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-yellow-600">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {subDeptForUI.interns.map(emp => {
                                        const isApproved = approvedIdsSet.has(emp.id);
                                        return (
                                            <tr key={emp.id} className={isApproved ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                                                <td className="p-3 font-medium">
                                                    {emp.firstName} {emp.lastName}
                                                    {emp.user?.roles[0]?.role.name === 'Intern' && (
                                                        <span className="ml-2 text-xs text-slate-500">(Intern)</span>
                                                    )}
                                                </td>
                                                <StatusCell 
                                                    disabled={isApproved || !isEditing} 
                                                    status={editableAttendance[emp.id]?.Morning} 
                                                    onClick={() => handleStatusChange(emp.id, 'Morning')}
                                                />
                                                <StatusCell 
                                                    disabled={isApproved || !isEditing} 
                                                    status={editableAttendance[emp.id]?.Afternoon} 
                                                    onClick={() => handleStatusChange(emp.id, 'Afternoon')}
                                                />
                                                <StatusCell 
                                                    disabled={isApproved || !isEditing} 
                                                    status={editableAttendance[emp.id]?.Evening} 
                                                    onClick={() => handleStatusChange(emp.id, 'Evening')}
                                                />
                                                <td className="p-3 text-center">
                                                    {isApproved ? (
                                                        <span className="text-xs font-semibold text-green-600 flex items-center justify-center gap-1">
                                                            <CheckCircle size={14}/>Approved
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-yellow-600">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}