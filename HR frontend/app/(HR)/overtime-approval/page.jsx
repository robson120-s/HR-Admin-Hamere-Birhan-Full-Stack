"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Hourglass, 
  ThumbsUp, 
  ThumbsDown,
  Search,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import StatusDropdown from "../leave_request/components/StatusDropdown.jsx";

// Mock Data Generator
const createMockData = () => [
  { 
    id: 1, 
    employee: { name: "Eleanor Vance", id: "EMP001" }, 
    date: "2025-09-15T18:00:00Z", 
    hours: 2.5, 
    reason: "Critical server maintenance.", 
    approvalStatus: "pending", 
    compensationMethod: "cash",
    approver: null,
    approvedAt: null,
    notes: ""
  },
  { 
    id: 2, 
    employee: { name: "Marcus Thorne", id: "EMP002" }, 
    date: "2025-09-14T20:30:00Z", 
    hours: 3.0, 
    reason: "Finalizing Q3 financial report.", 
    approvalStatus: "approved", 
    compensationMethod: "time_off",
    approver: "HR Manager",
    approvedAt: "2025-09-14T21:00:00Z",
    notes: "Approved for time off compensation"
  },
  { 
    id: 3, 
    employee: { name: "Isla Chen", id: "EMP003" }, 
    date: "2025-09-12T17:00:00Z", 
    hours: 1.0, 
    reason: "Extended client call.", 
    approvalStatus: "rejected", 
    compensationMethod: "cash",
    approver: "HR Manager",
    approvedAt: "2025-09-12T18:00:00Z",
    notes: "Reason not sufficient for overtime"
  },
  { 
    id: 4, 
    employee: { name: "Liam Gallagher", id: "EMP004" }, 
    date: "2025-09-18T19:00:00Z", 
    hours: 4.0, 
    reason: "Covering a colleague's shift.", 
    approvalStatus: "pending", 
    compensationMethod: "time_off",
    approver: null,
    approvedAt: null,
    notes: ""
  },
  { 
    id: 5, 
    employee: { name: "Sophia Rossi", id: "EMP005" }, 
    date: "2025-09-20T18:30:00Z", 
    hours: 1.5, 
    reason: "Urgent bug fix deployment.", 
    approvalStatus: "pending", 
    compensationMethod: "cash",
    approver: null,
    approvedAt: null,
    notes: ""
  },
];

const StatCard = ({ title, value, icon, className }) => (
  <Card className="rounded-xl shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      <div className={`rounded-full p-2 ${className}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const ITEMS_PER_PAGE = 5;

export default function OvertimeApprovalPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [overtimeData, setOvertimeData] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  
  const [filters, setFilters] = useState({ searchTerm: "", status: "all" });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOvertimeData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/overtime');
      if (response.ok) {
        const data = await response.json();
        setOvertimeData(data);
      } else {
        // Fallback to mock data if API fails
        setOvertimeData(createMockData());
      }
    } catch (error) {
      console.error('Error fetching overtime data:', error);
      // Fallback to mock data
      setOvertimeData(createMockData());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOvertimeData();
  }, []);

  const handleUpdateStatus = async (id, status, notes = "") => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/overtime/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalStatus: status,
          notes: notes,
          approver: "HR Manager", // In real app, get from auth context
          approvedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setOvertimeData(currentData =>
          currentData.map(item => item.id === id ? updatedRequest : item)
        );
        toast.success(`Request has been ${status}.`);
      } else {
        toast.error('Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Error updating request');
    } finally {
      setUpdatingId(null);
    }
  };

  // inline edit removed to match leave-requests action style

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };
  
  const processedData = useMemo(() => {
    let filteredItems = overtimeData
      .filter(item => item.employee.name.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      .filter(item => filters.status === 'all' || item.approvalStatus === filters.status);

    filteredItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredItems;
  }, [overtimeData, filters, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedData, currentPage]);
  
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const stats = useMemo(() => ({
    pending: overtimeData.filter(d => d.approvalStatus === 'pending').length,
    approved: overtimeData.filter(d => d.approvalStatus === 'approved').length,
    rejected: overtimeData.filter(d => d.approvalStatus === 'rejected').length,
  }), [overtimeData]);

  const getStatusBadgeStyles = (status) => ({
    approved: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20',
    pending: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
    rejected: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/10',
  }[status] || 'bg-gray-100 text-gray-800');

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-600" />
          Overtime Management
        </h1>
        <Button 
          onClick={fetchOvertimeData} 
          disabled={isLoading} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Pending Requests" 
          value={stats.pending} 
          icon={<Hourglass className="w-5 h-5 text-yellow-600" />} 
          className="bg-yellow-100" 
        />
        <StatCard 
          title="Approved" 
          value={stats.approved} 
          icon={<ThumbsUp className="w-5 h-5 text-green-600" />} 
          className="bg-green-100" 
        />
        <StatCard 
          title="Rejected" 
          value={stats.rejected} 
          icon={<ThumbsDown className="w-5 h-5 text-red-600" />} 
          className="bg-red-100" 
        />
      </div>

      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>All Requests</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <Input 
                placeholder="Search employee..." 
                className="pl-9 w-48" 
                value={filters.searchTerm} 
                onChange={e => setFilters({...filters, searchTerm: e.target.value})} 
              />
            </div>
            <select 
              value={filters.status} 
              onChange={e => setFilters({...filters, status: e.target.value})}
              className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-semibold bg-gray-50">Employee</TableCell>
                  <TableCell 
                    className="font-semibold bg-gray-50 cursor-pointer" 
                    onClick={() => handleSort('date')}
                  >
                    Date 
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="inline-block w-4 h-4 ml-1"/> : 
                        <ChevronDown className="inline-block w-4 h-4 ml-1"/>
                    )}
                  </TableCell>
                  <TableCell 
                    className="font-semibold text-center bg-gray-50 cursor-pointer" 
                    onClick={() => handleSort('hours')}
                  >
                    Hours 
                    {sortConfig.key === 'hours' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="inline-block w-4 h-4 ml-1"/> : 
                        <ChevronDown className="inline-block w-4 h-4 ml-1"/>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold max-w-sm bg-gray-50">Reason</TableCell>
                  <TableCell className="font-semibold bg-gray-50">Compensation</TableCell>
                  <TableCell className="font-semibold text-center bg-gray-50">Status</TableCell>
                  <TableCell className="font-semibold text-center bg-gray-50">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => {
                    const isUpdating = updatingId === row.id;
                    
                    return (
                      <TableRow key={row.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{row.employee.name}</div>
                            <div className="text-sm text-gray-500">{row.employee.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(row.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.hours.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                          {row.reason}
                        </TableCell>
                        <TableCell className="capitalize">
                          {row.compensationMethod.replace('_', ' ')}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeStyles(row.approvalStatus)}`}>
                            {row.approvalStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center items-center gap-3">
                            <StatusDropdown
                              currentStatus={
                                row.approvalStatus === 'approved' ? 'Approved' :
                                row.approvalStatus === 'rejected' ? 'Rejected' :
                                'Pending'
                              }
                              onStatusChange={async (option) => {
                                const statusMap = {
                                  Approved: 'approved',
                                  Pending: 'pending',
                                  Rejected: 'rejected',
                                };
                                const newStatus = statusMap[option];
                                if (!newStatus) return;
                                await handleUpdateStatus(row.id, newStatus);
                              }}
                            />
                            {isUpdating && <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => p - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => p + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Employee:</span> {selectedRequest.employee.name}
              </div>
              <div>
                <span className="font-medium">Employee ID:</span> {selectedRequest.employee.id}
              </div>
              <div>
                <span className="font-medium">Date:</span> {new Date(selectedRequest.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Hours:</span> {selectedRequest.hours}
              </div>
              <div>
                <span className="font-medium">Reason:</span> {selectedRequest.reason}
              </div>
              <div>
                <span className="font-medium">Compensation:</span> {selectedRequest.compensationMethod.replace('_', ' ')}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeStyles(selectedRequest.approvalStatus)}`}>
                  {selectedRequest.approvalStatus}
                </span>
              </div>
              {selectedRequest.approver && (
                <div>
                  <span className="font-medium">Approver:</span> {selectedRequest.approver}
                </div>
              )}
              {selectedRequest.approvedAt && (
                <div>
                  <span className="font-medium">Approved At:</span> {new Date(selectedRequest.approvedAt).toLocaleString()}
                </div>
              )}
              {selectedRequest.notes && (
                <div>
                  <span className="font-medium">Notes:</span> {selectedRequest.notes}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}