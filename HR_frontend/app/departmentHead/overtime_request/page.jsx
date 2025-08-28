"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "../../../components/ui/table";
import { Plus, Clock, Hourglass, ThumbsUp, ThumbsDown, X, Sun, Moon, Calendar } from "lucide-react"; // Added new icons
import { getDepHeadOvertimeRequests, getDepHeadTeamMembers, createOvertimeRequest } from "../../../lib/api";

// ==============================================================================
// MODAL FOR ADDING A NEW REQUEST (This is correct and unchanged)
// ==============================================================================
const AddRequestModal = ({ teamMembers, onClose, onAdd }) => {
    // ... (The entire AddRequestModal component remains the same as before)
    const [formData, setFormData] = useState({ employeeId: '', date: new Date().toISOString().slice(0, 10), startTime: '17:00', endTime: '19:00', hours: '8', reason: '', compensationMethod: 'cash', overtimeType: 'WEEKDAY' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => { e.preventDefault(); setIsSubmitting(true); try { await onAdd(formData); onClose(); } finally { setIsSubmitting(false); } };
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center"><h2 className="text-lg font-bold">Request Overtime</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button></header>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div><label htmlFor="employeeId" className="block text-sm font-medium mb-1">Employee</label><select id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required><option value="" disabled>Select an employee...</option>{teamMembers.map(member => (<option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>))}</select></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label htmlFor="date" className="block text-sm font-medium mb-1">Date</label><input type="date" id="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div>
                        <div><label htmlFor="overtimeType" className="block text-sm font-medium mb-1">Overtime Type</label><select id="overtimeType" name="overtimeType" value={formData.overtimeType} onChange={handleChange} className="w-full p-2 border rounded-md"><option value="WEEKDAY">Regular Weekday</option><option value="SUNDAY">Sunday Work</option><option value="HOLIDAY">Holiday Work</option></select></div>
                    </div>
                    {formData.overtimeType === 'WEEKDAY' ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time</label><input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div><div><label htmlFor="endTime" className="block text-sm font-medium mb-1">End Time</label><input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full p-2 border rounded-md" required /></div></div>) : (<div><label htmlFor="hours" className="block text-sm font-medium mb-1">Total Hours Worked</label><input type="number" id="hours" name="hours" value={formData.hours} onChange={handleChange} className="w-full p-2 border rounded-md" required step="0.1" placeholder="e.g., 8" /></div>)}
                    <div><label htmlFor="reason" className="block text-sm font-medium mb-1">Reason</label><textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows="3" className="w-full p-2 border rounded-md" required placeholder="e.g., Urgent project deadline..."></textarea></div>
                    <div><label className="block text-sm font-medium mb-2">Compensation Method</label><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="compensationMethod" value="cash" checked={formData.compensationMethod === 'cash'} onChange={handleChange} /> Cash</label><label className="flex items-center gap-2"><input type="radio" name="compensationMethod" value="time_off" checked={formData.compensationMethod === 'time_off'} onChange={handleChange} /> Time Off</label></div></div>
                    <footer className="pt-4 flex justify-end"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Request"}</Button></footer>
                </form>
            </div>
        </div>
    );
};

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function DepHeadOvertimePage() {
    const [requests, setRequests] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            getDepHeadOvertimeRequests(),
            getDepHeadTeamMembers(),
        ]).then(([requestsData, membersData]) => {
            setRequests(requestsData);
            setTeamMembers(membersData);
        }).catch(error => {
            toast.error(error.message || "Failed to load page data.");
        }).finally(() => {
            setIsLoading(false);
        });
    }, [refreshKey]);

    const handleAddRequest = async (requestData) => {
        await toast.promise(
            createOvertimeRequest(requestData),
            {
                loading: 'Submitting request...',
                success: 'Request submitted successfully!',
                error: (err) => err.response?.data?.error || 'Failed to submit request.',
            }
        );
        triggerRefresh();
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        const icons = {
            pending: <Hourglass size={12} />,
            approved: <ThumbsUp size={12} />,
            rejected: <ThumbsDown size={12} />,
        };
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // ✅ NEW: Helper function to display the overtime type
    const getOvertimeTypeDisplay = (type) => {
        const types = {
            WEEKDAY: { icon: <Moon size={14} className="text-gray-500"/>, text: "Weekday" },
            SUNDAY: { icon: <Sun size={14} className="text-orange-500"/>, text: "Sunday" },
            HOLIDAY: { icon: <Calendar size={14} className="text-purple-500"/>, text: "Holiday" },
        };
        const selected = types[type] || types.WEEKDAY;
        return <div className="flex items-center gap-2">{selected.icon}<span>{selected.text}</span></div>;
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Clock className="w-8 h-8 text-indigo-600" />
                    Overtime Requests
                </h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} className="mr-2"/> Add Request
                </Button>
            </header>

            <Card className="rounded-2xl shadow-md">
                <CardHeader>
                    <CardTitle>Submitted Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Date</TableHead>
                                    {/* ✅ ADDITION: New "Type" column header */}
                                    <TableHead>Type</TableHead>
                                    <TableHead>Hours</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell></TableRow>
                                ) : requests.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-gray-500">No overtime requests found.</TableCell></TableRow>
                                ) : (
                                    requests.map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.employee.firstName} {req.employee.lastName}</TableCell>
                                            <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
                                            {/* ✅ ADDITION: New table cell to display the type */}
                                            <TableCell>{getOvertimeTypeDisplay(req.overtimeType)}</TableCell>
                                            <TableCell>{parseFloat(req.hours).toFixed(2)}</TableCell>
                                            <TableCell className="max-w-xs truncate" title={req.reason}>{req.reason}</TableCell>
                                            <TableCell className="text-center">{getStatusBadge(req.approvalStatus)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && <AddRequestModal teamMembers={teamMembers} onClose={() => setIsModalOpen(false)} onAdd={handleAddRequest} />}
        </div>
    );
}