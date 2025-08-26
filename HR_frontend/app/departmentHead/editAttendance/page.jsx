// /departmentHead/editAttendance/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { 
    Calendar, Save, User, ChevronDown, Download, Users, Briefcase, 
    UserCheck, ClockAlert, UserX, CalendarOff, LoaderCircle, ShieldCheck
} from "lucide-react";
import Sidebar from "../Sidebar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { getAttendanceRoster, saveAttendance } from "../../../lib/api"; // Adjust path if needed

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

const StatusCell = ({ status, onClick, disabled = false }) => {
    const config = {
        present: { icon: <UserCheck size={18}/>, color: 'text-green-500', bg: 'hover:bg-green-100 dark:hover:bg-green-900/50', title: 'Present' },
        late:    { icon: <ClockAlert size={18}/>, color: 'text-yellow-500', bg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/50', title: 'Late' },
        absent:  { icon: <UserX size={18}/>, color: 'text-rose-500', bg: 'hover:bg-rose-100 dark:hover:bg-rose-900/50', title: 'Absent' },
        on_leave:{ icon: <CalendarOff size={18}/>, color: 'text-purple-500', bg: 'hover:bg-purple-100 dark:hover:bg-purple-900/50', title: 'On Leave' },
        permission: { icon: <ShieldCheck size={18}/>, color: 'text-cyan-500', bg: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/50', title: 'Permission'},
    }[status] || { icon: <UserX size={18}/>, color: 'text-slate-400', bg: 'hover:bg-slate-100 dark:hover:bg-slate-700', title: 'Absent' };

    return (
        <td className="px-2 py-2 text-center">
            <button 
                onClick={onClick}
                disabled={disabled}
                title={disabled ? "On Approved Leave" : `Click to change status (current: ${config.title})`}
                className={`p-2 rounded-full transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : `${config.bg} ${config.color}`}`}
            >
                {config.icon}
            </button>
        </td>
    );
};

const MarkAllHeader = ({ title, onMarkAll }) => (
    <th scope="col" className="px-2 py-3 text-center w-40">
        <div className="flex flex-col items-center gap-2">
            <span className="font-semibold">{title}</span>
            <div className="flex gap-1">
                <Button size="xs" onClick={() => onMarkAll('present')} className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900">All P</Button>
                <Button size="xs" onClick={() => onMarkAll('absent')} className="bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-200 dark:hover:bg-rose-900">All A</Button>
            </div>
        </div>
    </th>
);


// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function MarkAttendancePage() {
 const [roster, setRoster] = useState({ subDepartments: [] });
  const [attendance, setAttendance] = useState({});
  const [onLeaveIds, setOnLeaveIds] = useState(new Set());
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Your fetchRoster and other handlers are correct.
  const fetchRoster = useCallback(async (fetchDate) => {
      setIsLoading(true);
      try {
          const data = await getAttendanceRoster(fetchDate);
          // The API now sends 'subDepartments', so we set the whole roster object
          setRoster({ subDepartments: data.subDepartments || [] });
          setAttendance(data.attendanceRecords || {});
          setOnLeaveIds(new Set(data.onLeaveIds || []));
      } catch (error) { toast.error(error.message); }
      finally { setIsLoading(false); }
  }, []);
  
  useEffect(() => { fetchRoster(date); }, [date, fetchRoster]);

  const handleStatusChange = (employeeId, session) => {
    const statuses = ['present', 'late', 'absent', 'permission']; // 'on_leave' is not manually selectable
    const currentStatus = attendance[employeeId]?.[session] || 'absent';
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    setAttendance(prev => ({
        ...prev,
        [employeeId]: {
            ...(prev[employeeId] || {}),
            [session]: newStatus
        }
    }));
  };

  const handleMarkAll = (employeesToUpdate, session, status) => {
    const newAttendance = { ...attendance };
    employeesToUpdate.forEach(emp => {
        if (!onLeaveIds.has(emp.id)) { // Don't mark attendance for people on leave
            if (!newAttendance[emp.id]) newAttendance[emp.id] = {};
            newAttendance[emp.id][session] = status;
        }
    });
    setAttendance(newAttendance);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    const promise = saveAttendance({ date, attendance });
    
    toast.promise(promise, {
        loading: 'Saving attendance...',
        success: 'Attendance saved successfully!',
        error: (err) => err.message || 'Failed to save attendance.'
    });

    try {
        await promise;
    } catch(e) {
        // Handled by toast.promise
    } finally {
        setIsSaving(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-indigo-500" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mark Daily Attendance</h1>
                    <p className="text-sm text-slate-500">Select a date and manage attendance for your teams.</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48"/>
                <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className={`mr-2 h-4 w-4 ${isSaving ? 'animate-spin' : ''}`}/> 
                    {isSaving ? "Saving..." : "Save Attendance"}
                </Button>
            </div>
        </header>

        {isLoading ? (
            <div className="flex justify-center items-center h-96"><LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" /></div>
        ) : roster.length === 0 ? (
            <div className="text-center py-20 text-slate-500">No employees found in your department.</div>
        ) : (
            <div className="space-y-8">
                {roster && Array.isArray(roster.subDepartments) && roster.subDepartments.map(subDept => (
                    <Card key={subDept.id} className="bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 min-w-[250px] sticky left-0 z-10 bg-slate-50 dark:bg-slate-700/50">
                                            {subDept.name}
                                        </th>
                                        <MarkAllHeader title="Morning" onMarkAll={(status) => handleMarkAll([...subDept.staff, ...subDept.interns], 'morning', status)} />
                                        <MarkAllHeader title="Afternoon" onMarkAll={(status) => handleMarkAll([...subDept.staff, ...subDept.interns], 'afternoon', status)} />
                                        <MarkAllHeader title="Evening" onMarkAll={(status) => handleMarkAll([...subDept.staff, ...subDept.interns], 'evening', status)} />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {subDept.staff.length > 0 && (
                                        <tr className="bg-slate-100 dark:bg-slate-800/50"><td colSpan={4} className="px-4 py-1.5 font-semibold text-xs text-slate-600 dark:text-slate-300">STAFF</td></tr>
                                    )}
                                    {subDept.staff.map(person => {
                                        const isOnLeave = onLeaveIds.has(person.id);
                                        return (
                                            <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className={`px-4 py-2 font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-800 z-10 ${isOnLeave ? 'opacity-50' : ''}`}>{person.name}</td>
                                                <StatusCell disabled={isOnLeave} status={isOnLeave ? 'on_leave' : attendance[person.id]?.morning} onClick={() => handleStatusChange(person.id, 'morning')} />
                                                <StatusCell disabled={isOnLeave} status={isOnLeave ? 'on_leave' : attendance[person.id]?.afternoon} onClick={() => handleStatusChange(person.id, 'afternoon')} />
                                                <StatusCell disabled={isOnLeave} status={isOnLeave ? 'on_leave' : attendance[person.id]?.evening} onClick={() => handleStatusChange(person.id, 'evening')} />
                                            </tr>
                                        );
                                    })}
                                    {subDept.interns.length > 0 && (
                                        <tr className="bg-slate-100 dark:bg-slate-800/50"><td colSpan={4} className="px-4 py-1.5 font-semibold text-xs text-slate-600 dark:text-slate-300">INTERNS</td></tr>
                                    )}
                                    {subDept.interns.map(person => {
                                        const isOnLeave = onLeaveIds.has(person.id);
                                        return (
                                            <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className={`px-4 py-2 font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-800 z-10 ${isOnLeave ? 'opacity-50' : ''}`}>{person.name}</td>
                                                <StatusCell disabled={isOnLeave} status={isOnLeave ? 'on_leave' : attendance[person.id]?.morning} onClick={() => handleStatusChange(person.id, 'morning')} />
                                                <StatusCell disabled={isOnLeave} status={isOnLeave ? 'on_leave' : attendance[person.id]?.afternoon} onClick={() => handleStatusChange(person.id, 'afternoon')} />
                                                <StatusCell disabled={isOnLeave} status={isOnLeave ? 'on_leave' : attendance[person.id]?.evening} onClick={() => handleStatusChange(person.id, 'evening')} />
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}