"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { 
    Calendar, Save, Download, 
    UserCheck, ClockAlert, UserX, CalendarOff, LoaderCircle, ShieldCheck, CheckCircle
} from "lucide-react";
import Sidebar from "../Sidebar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { getAttendanceRoster, saveAttendance, exportDepHeadAttendance } from "../../../lib/api";

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

const StatusCell = ({ status, onClick, disabled = false, isLocked = false }) => {
    const config = {
        present: { icon: <UserCheck size={18}/>, color: 'text-green-500', bg: 'hover:bg-green-100 dark:hover:bg-green-900/50', title: 'Present' },
        late:    { icon: <ClockAlert size={18}/>, color: 'text-yellow-500', bg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/50', title: 'Late' },
        absent:  { icon: <UserX size={18}/>, color: 'text-rose-500', bg: 'hover:bg-rose-100 dark:hover:bg-rose-900/50', title: 'Absent' },
        on_leave:{ icon: <CalendarOff size={18}/>, color: 'text-purple-500', bg: 'hover:bg-purple-100 dark:hover:bg-purple-900/50', title: 'On Leave' },
        permission: { icon: <ShieldCheck size={18}/>, color: 'text-cyan-500', bg: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/50', title: 'Permission'},
    }[status] || { icon: <UserX size={18}/>, color: 'text-slate-400', bg: 'hover:bg-slate-100 dark:hover:bg-slate-700', title: 'Absent' };

    const finalDisabled = disabled || isLocked;
    
    return (
        <td className="px-2 py-2 text-center">
            <div className="relative w-10 h-10 mx-auto">
                <button 
                    onClick={onClick}
                    disabled={finalDisabled}
                    title={disabled ? "On Approved Leave" : isLocked ? "Attendance Saved" : `Click to change status (current: ${config.title})`}
                    className={`p-2 rounded-full transition-all duration-200 w-full h-full flex items-center justify-center ${finalDisabled ? 'opacity-50 cursor-not-allowed' : `${config.bg} ${config.color} transform hover:scale-110`}`}
                >
                    {config.icon}
                </button>
                {isLocked && !disabled && (
                    <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 pointer-events-none shadow">
                        <CheckCircle size={14} className="text-green-600" />
                    </div>
                )}
            </div>
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

const AttendanceLegend = () => {
    const legendItems = [
        { icon: <UserCheck size={16} />, label: "Present", color: "text-green-500" },
        { icon: <ClockAlert size={16} />, label: "Late", color: "text-yellow-500" },
        { icon: <UserX size={16} />, label: "Absent", color: "text-rose-500" },
        { icon: <ShieldCheck size={16} />, label: "Permission", color: "text-cyan-500" },
        { icon: <CalendarOff size={16} />, label: "On Leave", color: "text-purple-500" },
        { icon: <CheckCircle size={16} />, label: "Saved", color: "text-green-600" },
    ];

    return (
        <Card className="bg-white dark:bg-slate-800/50">
            <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mr-4">Legend:</h3>
                    {legendItems.map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                            <span className={item.color}>{item.icon}</span>
                            <span className="text-xs text-slate-600 dark:text-slate-300">{item.label}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function MarkAttendancePage() {
  const [roster, setRoster] = useState({ subDepartments: [] });
  const [initialAttendance, setInitialAttendance] = useState({});
  const [attendance, setAttendance] = useState({});
  const [onLeaveIds, setOnLeaveIds] = useState(new Set());
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchRoster = useCallback(async (fetchDate) => {
      setIsLoading(true);
      setHasChanges(false);
      try {
          const data = await getAttendanceRoster(fetchDate);
          const attendanceRecords = data.attendanceRecords || {};
          setRoster({ subDepartments: data.subDepartments || [] });
          setAttendance(attendanceRecords);
          setInitialAttendance(JSON.parse(JSON.stringify(attendanceRecords)));
          setOnLeaveIds(new Set(data.onLeaveIds || []));
      } catch (error) { toast.error(error.message); }
      finally { setIsLoading(false); }
  }, []);
  
  useEffect(() => { fetchRoster(date); }, [date, fetchRoster]);
  
  useEffect(() => {
    if (JSON.stringify(initialAttendance) !== JSON.stringify(attendance)) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [attendance, initialAttendance]);

  const handleStatusChange = (employeeId, session) => {
    if (initialAttendance[employeeId]?.[session]) {
        toast.error("This session's attendance has already been saved and cannot be changed.");
        return;
    }
    const statuses = ['present', 'late', 'absent', 'permission'];
    const currentStatus = attendance[employeeId]?.[session] || 'absent';
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    setAttendance(prev => ({ ...prev, [employeeId]: { ...(prev[employeeId] || {}), [session]: newStatus } }));
  };

  const handleMarkAll = (employeesToUpdate, session, status) => {
    const newAttendance = { ...attendance };
    employeesToUpdate.forEach(emp => {
        if (!onLeaveIds.has(emp.id) && !initialAttendance[emp.id]?.[session]) {
            if (!newAttendance[emp.id]) newAttendance[emp.id] = {};
            newAttendance[emp.id][session] = status;
        }
    });
    setAttendance(newAttendance);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    await toast.promise(
        saveAttendance({ date, attendance }),
        {
            loading: 'Saving attendance...',
            success: 'Attendance saved successfully!',
            error: (err) => err.message || 'Failed to save attendance.'
        }
    );
    fetchRoster(date); 
    setIsSaving(false);
  };

  const handleExport = async (rangeType) => {
      let startDate, endDate;
      const selectedDate = new Date(date);
      
      if (rangeType === 'month') {
          startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      } else { // week
          const dayOfWeek = selectedDate.getDay();
          const firstDayOfWeek = new Date(selectedDate);
          firstDayOfWeek.setDate(selectedDate.getDate() - dayOfWeek);
          startDate = firstDayOfWeek;
          endDate = new Date(firstDayOfWeek);
          endDate.setDate(firstDayOfWeek.getDate() + 6);
      }

      const startString = startDate.toISOString().slice(0, 10);
      const endString = endDate.toISOString().slice(0, 10);
      
      const exportPromise = exportDepHeadAttendance(startString, endString);
      
      toast.promise(exportPromise, {
          loading: 'Preparing export...',
          success: (data) => {
              const { employees, attendanceMap } = data;
              
              const worksheetData = [];
              const dateRange = [];
              for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                  dateRange.push(new Date(d).toISOString().slice(0, 10));
              }

              const dateHeaderRow = ["Employee Name"];
              const sessionHeaderRow = [""];
              dateRange.forEach(d => {
                  dateHeaderRow.push(d, null, null);
                  sessionHeaderRow.push("Morning", "Afternoon", "Evening");
              });
              worksheetData.push(dateHeaderRow, sessionHeaderRow);

              const statusSymbolMap = {
                  present: "✔", late: "L", absent: "A", permission: "P", on_leave: "OL",
                  weekend: "W", holiday: "H"
              };
              
              employees.forEach(emp => {
                  const row = [`${emp.firstName} ${emp.lastName}`];
                  dateRange.forEach(d => {
                      const key = `${emp.id}-${d}`;
                      const dayAttendance = attendanceMap[key] || {};
                      row.push(statusSymbolMap[dayAttendance.morning] || '-');
                      row.push(statusSymbolMap[dayAttendance.afternoon] || '-');
                      row.push(statusSymbolMap[dayAttendance.evening] || '-');
                  });
                  worksheetData.push(row);
              });

              const workbook = XLSX.utils.book_new();
              const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
              
              const merges = [];
              for (let i = 0; i < dateRange.length; i++) {
                  merges.push({ s: { r: 0, c: i * 3 + 1 }, e: { r: 0, c: i * 3 + 3 } });
              }
              worksheet["!merges"] = merges;

              const colWidths = [{ wch: 30 }];
              dateRange.forEach(() => colWidths.push({ wch: 10 }, { wch: 10 }, { wch: 10 }));
              worksheet["!cols"] = colWidths;
              
              XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
              const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
              const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
              saveAs(blob, `Attendance_${startString}_to_${endString}.xlsx`);
              
              return "Export successful!";
          },
          error: (err) => err.message || "Export failed."
      });
  };
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-indigo-500" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mark / Edit Daily Attendance</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Select a date to manage attendance. Saved entries are locked.</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48"/>
                {/* --- ✅ MODIFIED: More attractive Save button --- */}
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving || !hasChanges} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transform hover:-translate-y-0.5 transition-all duration-150 disabled:opacity-50 disabled:transform-none"
                >
                    <Save className={`mr-2 h-4 w-4 ${isSaving ? 'animate-spin' : ''}`}/> 
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </header>

        {/* --- ✅ MODIFIED: Placed Legend and Export into a cleaner grid layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AttendanceLegend />
            <Card className="bg-white dark:bg-slate-800/50">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-center gap-4 h-full">
                    <p className="text-sm font-medium">Export Records:</p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleExport('week')} className="transform hover:-translate-y-0.5 transition-transform duration-150">
                            <Download size={16} className="mr-2"/> This Week
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('month')} className="transform hover:-translate-y-0.5 transition-transform duration-150">
                            <Download size={16} className="mr-2"/> This Month
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-96"><LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" /></div>
        ) : (!roster.subDepartments || roster.subDepartments.length === 0) ? (
            <div className="text-center py-20 text-slate-500">No employees found in your department.</div>
        ) : (
            <div className="space-y-8">
                {roster.subDepartments.map(subDept => (
                    <Card key={subDept.id} className="bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 min-w-[250px] sticky left-0 z-10 bg-slate-50 dark:bg-slate-700/50">{subDept.name}</th>
                                        <MarkAllHeader title="Morning" onMarkAll={(status) => handleMarkAll([...subDept.staff, ...subDept.interns], 'morning', status)} />
                                        <MarkAllHeader title="Afternoon" onMarkAll={(status) => handleMarkAll([...subDept.staff, ...subDept.interns], 'afternoon', status)} />
                                        <MarkAllHeader title="Evening" onMarkAll={(status) => handleMarkAll([...subDept.staff, ...subDept.interns], 'evening', status)} />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {subDept.staff.length > 0 && (
                                        <tr className="bg-slate-100 dark:bg-slate-800/50"><td colSpan={4} className="px-4 py-1.5 font-semibold text-xs text-slate-600 dark:text-slate-300">STAFF & MANAGEMENT</td></tr>
                                    )}
                                    {subDept.staff.map(person => {
                                        const isOnLeave = onLeaveIds.has(person.id);
                                        const morningIsLocked = !!initialAttendance[person.id]?.morning;
                                        const afternoonIsLocked = !!initialAttendance[person.id]?.afternoon;
                                        const eveningIsLocked = !!initialAttendance[person.id]?.evening;

                                        return (
                                            <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className={`px-4 py-2 font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-800 z-10 ${isOnLeave ? 'opacity-50' : ''}`}>{person.name}</td>
                                                <StatusCell disabled={isOnLeave} isLocked={morningIsLocked} status={isOnLeave ? 'on_leave' : attendance[person.id]?.morning} onClick={() => handleStatusChange(person.id, 'morning')} />
                                                <StatusCell disabled={isOnLeave} isLocked={afternoonIsLocked} status={isOnLeave ? 'on_leave' : attendance[person.id]?.afternoon} onClick={() => handleStatusChange(person.id, 'afternoon')} />
                                                <StatusCell disabled={isOnLeave} isLocked={eveningIsLocked} status={isOnLeave ? 'on_leave' : attendance[person.id]?.evening} onClick={() => handleStatusChange(person.id, 'evening')} />
                                            </tr>
                                        );
                                    })}
                                    {subDept.interns.length > 0 && (
                                        <tr className="bg-slate-100 dark:bg-slate-800/50"><td colSpan={4} className="px-4 py-1.5 font-semibold text-xs text-slate-600 dark:text-slate-300">INTERNS</td></tr>
                                    )}
                                    {subDept.interns.map(person => {
                                        const isOnLeave = onLeaveIds.has(person.id);
                                        const morningIsLocked = !!initialAttendance[person.id]?.morning;
                                        const afternoonIsLocked = !!initialAttendance[person.id]?.afternoon;
                                        const eveningIsLocked = !!initialAttendance[person.id]?.evening;

                                        return (
                                            <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className={`px-4 py-2 font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-800 z-10 ${isOnLeave ? 'opacity-50' : ''}`}>{person.name}</td>
                                                <StatusCell disabled={isOnLeave} isLocked={morningIsLocked} status={isOnLeave ? 'on_leave' : attendance[person.id]?.morning} onClick={() => handleStatusChange(person.id, 'morning')} />
                                                <StatusCell disabled={isOnLeave} isLocked={afternoonIsLocked} status={isOnLeave ? 'on_leave' : attendance[person.id]?.afternoon} onClick={() => handleStatusChange(person.id, 'afternoon')} />
                                                <StatusCell disabled={isOnLeave} isLocked={eveningIsLocked} status={isOnLeave ? 'on_leave' : attendance[person.id]?.evening} onClick={() => handleStatusChange(person.id, 'evening')} />
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