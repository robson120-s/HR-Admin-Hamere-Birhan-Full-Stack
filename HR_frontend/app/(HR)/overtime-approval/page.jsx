// /overtime-approval/page.jsx
"use client";

import { useEffect, useState, useMemo, useCallback, Fragment } from "react";
import { toast } from "react-hot-toast";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead
} from "../../../components/ui/table";
import { 
  Clock, RefreshCw, Hourglass, ThumbsUp, ThumbsDown,
  Search, ChevronUp, ChevronDown, Info, CheckCircle2, XCircle, Plus
} from "lucide-react";
import { getOvertimeRequests, updateOvertimeStatus } from "../../../lib/api";
import StatusDropdown from "./components/StatusDropdown";
import { SimpleStatusDropdown } from "./components/SimpleStatusDropdown";

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

const StatCard = ({ title, value, icon, className }) => (
  <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-800">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</CardTitle>
      <div className={`rounded-full p-2 ${className}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
    </CardContent>
  </Card>
);


const DetailsModal = ({ request, onClose }) => {
  if (!request) return null;
  
  const getStatusBadgeStyles = (status) => ({
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  }[status] || 'bg-gray-100 text-gray-800');

  const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Overtime Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p><span className="font-medium text-slate-500 dark:text-slate-400 w-32 inline-block">Employee:</span> {`${request.employee.firstName} ${request.employee.lastName}`}</p>
          <p><span className="font-medium text-slate-500 dark:text-slate-400 w-32 inline-block">Date:</span> {new Date(request.date).toLocaleDateString()}</p>
          <p><span className="font-medium text-slate-500 dark:text-slate-400 w-32 inline-block">Time:</span> {`${timeFormatter.format(new Date(request.startTime))} - ${timeFormatter.format(new Date(request.endTime))}`}</p>
          <p><span className="font-medium text-slate-500 dark:text-slate-400 w-32 inline-block">Duration:</span> {parseFloat(request.hours).toFixed(2)} hours</p>
          <p><span className="font-medium text-slate-500 dark:text-slate-400 w-32 inline-block">Compensation:</span> <span className="capitalize">{request.compensationMethod.replace('_', ' ')}</span></p>
          <div className="flex items-center"><span className="font-medium text-slate-500 dark:text-slate-400 w-32 inline-block">Status:</span> 
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeStyles(request.approvalStatus)}`}>
              {request.approvalStatus}
            </span>
          </div>
          {request.approver && <p><span className="font-medium text-slate-500 dark:text-slate-400 w-32 inline-block">Approver:</span> {request.approver.username}</p>}
          <div className="pt-2"><p className="font-medium text-slate-500 dark:text-slate-400">Reason:</p><p className="pl-4 mt-1 text-slate-700 dark:text-slate-300">{request.reason}</p></div>
        </CardContent>
        <div className="flex justify-end p-4 border-t dark:border-slate-700">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function OvertimeApprovalPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [overtimeData, setOvertimeData] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [filters, setFilters] = useState({ searchTerm: "", status: "all" });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 10;



  useEffect(() => {
    setIsLoading(true);
    getOvertimeRequests()
      .then(data => setOvertimeData(data))
      .catch(error => toast.error(error.message))
      .finally(() => setIsLoading(false));
  }, [refreshKey]);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    const newStatus = status.toLowerCase();
    try {
      await updateOvertimeStatus(id, newStatus);
      toast.success(`Request has been updated to ${status}.`);
      // This is the core of the fix: force a re-mount of the table.
      setRefreshKey(prevKey => prevKey + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

 

  const processedData = useMemo(() => {
    let items = [...overtimeData];
    if (filters.status !== 'all') { items = items.filter(item => item.approvalStatus === filters.status); }
    if (filters.searchTerm) { items = items.filter(item => `${item.employee.firstName} ${item.employee.lastName}`.toLowerCase().includes(filters.searchTerm.toLowerCase())); }
    items.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [overtimeData, filters, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedData, currentPage]);
  
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const stats = useMemo(() => ({
    pending: overtimeData.filter(d => d.approvalStatus === 'pending').length,
    approved: overtimeData.filter(d => d.approvalStatus === 'approved').length,
    rejected: overtimeData.filter(d => d.approvalStatus === 'rejected').length,
  }), [overtimeData]);

  const getStatusBadgeStyles = (status) => ({
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  }[status] || 'bg-gray-100 text-gray-800');
  
  const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Clock className="w-8 h-8 text-indigo-600" />
          Overtime Approval
        </h1>
        <div className="flex items-center gap-2">
            
            <Button onClick={() => setRefreshKey(prevKey => prevKey + 1)} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Pending Requests" value={stats.pending} icon={<Hourglass className="w-5 h-5 text-yellow-600" />} className="bg-yellow-100 dark:bg-yellow-900/50" />
        <StatCard title="Approved" value={stats.approved} icon={<ThumbsUp className="w-5 h-5 text-green-600" />} className="bg-green-100 dark:bg-green-900/50" />
        <StatCard title="Rejected" value={stats.rejected} icon={<ThumbsDown className="w-5 h-5 text-red-600" />} className="bg-red-100 dark:bg-red-900/50" />
      </div>

      <Card className="rounded-2xl shadow-md bg-white dark:bg-slate-800">
        <CardHeader className="flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>All Requests</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><Input placeholder="Search employee..." className="pl-9 w-48" value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} /></div>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-40 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800">
              <option value="all">All Statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table  key={refreshKey}>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort('hours')}>Duration (Hrs)</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? ( <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading data...</TableCell></TableRow> ) 
                : paginatedData.length === 0 ? ( <TableRow><TableCell colSpan={7} className="h-24 text-center">No results found.</TableCell></TableRow> ) 
                : (
                  paginatedData.map((row) => {
                    const fullName = `${row.employee.firstName} ${row.employee.lastName}`;
                    const currentStatusDisplay = row.approvalStatus.charAt(0).toUpperCase() + row.approvalStatus.slice(1);
                    return (
                      <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-100">{fullName}</div>
                            <div className="text-sm text-slate-500">{row.employee.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">{`${timeFormatter.format(new Date(row.startTime))} - ${timeFormatter.format(new Date(row.endTime))}`}</TableCell>
                        <TableCell className="text-center font-medium">
  {row.hours != null ? parseFloat(row.hours).toFixed(2) : 'N/A'}
</TableCell>
                        <TableCell className="text-sm text-slate-600 max-w-xs truncate" title={row.reason}>{row.reason}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeStyles(row.approvalStatus)}`}>
                            {row.approvalStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button onClick={() => setSelectedRequest(row)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors" title="View Details">
                                <Info size={16}/>
                            </button>
                            
                              <SimpleStatusDropdown
                                currentStatus={currentStatusDisplay}
                                onStatusChange={(option) => handleUpdateStatus(row.id, option)}
                              />
                            {updatingId === row.id && <RefreshCw className="w-4 h-4 animate-spin"/>}
                            
                            
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between p-4 border-t dark:border-slate-700">
            <div className="text-sm text-slate-500">Page {currentPage} of {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {selectedRequest && <DetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
      {/* Remove the AddOvertimeRequestModal if HR doesn't add requests from this page */}
      {/* <AddOvertimeRequestModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleCreateSuccess} /> */}
    </div>
  );
}