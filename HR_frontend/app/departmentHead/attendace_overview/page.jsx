"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, Calendar, ChevronLeft, ChevronRight, Check, X, Coffee, Hotel, Briefcase, Minus, Shield, Download } from "lucide-react";
import Sidebar from "../Sidebar";
import Image from 'next/image';
import { getDepHeadAttendanceOverview } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

const StatusCell = ({ status }) => {
    const config = {
        present: { icon: <Check size={14} />, color: 'bg-green-100 text-green-700 dark:bg-green-900/50', title: 'Present' },
        absent: { icon: <X size={14} />, color: 'bg-red-100 text-red-700 dark:bg-red-900/50', title: 'Absent' },
        on_leave: { icon: <Coffee size={14} />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50', title: 'On Leave' },
        permission: { icon: <Shield size={14} />, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50', title: 'Permission' },
        holiday: { icon: <Hotel size={14} />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50', title: 'Holiday' },
        weekend: { icon: <Briefcase size={14} />, color: 'bg-gray-200 text-gray-500 dark:bg-gray-700', title: 'Weekend' },
        half_day: { icon: <Minus size={14} />, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50', title: 'Half Day' },
    }[status] || { icon: null, color: 'bg-gray-50 dark:bg-gray-700/50', title: 'No Record' };

    return (
        <td className="p-0 text-center" title={config.title}>
            <div className={`w-8 h-8 mx-auto flex items-center justify-center ${config.color}`}>
                {config.icon}
            </div>
        </td>
    );
};

// --- ✅ ADDITION 1: A new, dedicated Legend component ---
const AttendanceLegend = () => {
    const legendItems = [
        { icon: <Check size={14} />, label: "Present", color: "bg-green-100 text-green-700" },
        { icon: <X size={14} />, label: "Absent", color: "bg-red-100 text-red-700" },
        { icon: <Coffee size={14} />, label: "On Leave", color: "bg-blue-100 text-blue-700" },
        { icon: <Shield size={14} />, label: "Permission", color: "bg-cyan-100 text-cyan-700" },
        { icon: <Minus size={14} />, label: "Half Day", color: "bg-yellow-100 text-yellow-700" },
        { icon: <Hotel size={14} />, label: "Holiday", color: "bg-purple-100 text-purple-700" },
        { icon: <Briefcase size={14} />, label: "Weekend", color: "bg-gray-200 text-gray-500" },
    ];

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-sm mb-3 text-slate-700 dark:text-slate-200">Legend</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {legendItems.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-6 h-6 flex items-center justify-center rounded-full ${item.color}`}>
                            {item.icon}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function AttendanceOverviewPage() {
    const [viewDate, setViewDate] = useState(new Date());
    const [data, setData] = useState({ employees: [], attendanceMap: {} });
    const [isLoading, setIsLoading] = useState(true);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;

    const fetchOverview = useCallback(async (fetchYear, fetchMonth) => {
        setIsLoading(true);
        try {
            const overviewData = await getDepHeadAttendanceOverview(fetchYear, fetchMonth);
            setData(overviewData);
        } catch (error) {
            toast.error(error.message || "Failed to load attendance overview.");
            setData({ employees: [], attendanceMap: {} });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview(year, month);
    }, [year, month, fetchOverview]);

    const handlePrevMonth = () => setViewDate(new Date(year, month - 2, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month, 1));

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleExportToExcel = () => {
        const worksheetData = data.employees.map(emp => {
            const row = { 'Employee Name': `${emp.firstName} ${emp.lastName}` };
            monthDays.forEach(day => {
                const status = data.attendanceMap[emp.id]?.[day];
                const readableStatus = status ? (status.charAt(0).toUpperCase() + status.slice(1)).replace('_', ' ') : '-';
                row[`Day ${day}`] = readableStatus;
            });
            return row;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const columnWidths = [{ wch: 30 }];
        monthDays.forEach(() => columnWidths.push({ wch: 12 }));
        worksheet['!cols'] = columnWidths;
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Overview");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        const monthName = viewDate.toLocaleString('default', { month: 'long' });
        saveAs(blob, `Attendance_Overview_${monthName}_${year}.xlsx`);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-6 space-y-6">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Monthly Attendance Overview</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            View your team's attendance record for the selected month.
                        </p>
                    </div>
                    <Button 
                        onClick={handleExportToExcel}
                        disabled={isLoading || data.employees.length === 0}
                        variant="outline"
                    >
                        <Download size={16} className="mr-2"/>
                        Export to Excel
                    </Button>
                </header>
                
                {/* --- ✅ ADDITION 2: Place the new Legend component on the page --- */}
                <AttendanceLegend />

                <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center mb-4">
                        <Button variant="outline" onClick={handlePrevMonth}><ChevronLeft size={16} className="mr-2" /> Prev</Button>
                        <div className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Calendar size={20} />
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <Button variant="outline" onClick={handleNextMonth}>Next <ChevronRight size={16} className="ml-2" /></Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse table-fixed">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="sticky left-0 bg-slate-50 dark:bg-slate-700/50 p-2 text-left text-sm font-medium text-slate-600 dark:text-slate-300 w-48 z-10">Employee</th>
                                    {monthDays.map(day => <th key={day} className="p-1 w-7 text-center font-normal text-xs">{day}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={daysInMonth + 1} className="text-center py-20"><LoaderCircle className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></td></tr>
                                ) : data.employees.length === 0 ? (
                                    <tr><td colSpan={daysInMonth + 1} className="text-center py-20 text-slate-500">No employees found in your department.</td></tr>
                                ) : (
                                    data.employees.map(emp => (
                                        <tr key={emp.id} className="border-t dark:border-slate-700">
                                            <td className="sticky left-0 bg-white dark:bg-slate-800 p-2 text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 z-10">
                                                <Image src={emp.photo || '/images/default-avatar.png'} alt={emp.firstName} width={28} height={28} className="rounded-full object-cover"/>
                                                <span className="truncate">{emp.firstName} {emp.lastName}</span>
                                            </td>
                                            {monthDays.map(day => (
                                                <StatusCell key={day} status={data.attendanceMap[emp.id]?.[day]} />
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}