"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import { Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function OvertimeApprovalPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overtimeData, setOvertimeData] = useState([]);
  const [approvingId, setApprovingId] = useState(null);

  const fetchOvertimeData = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/overtime", { cache: "no-store" });
      
      if (!response.ok) {
        throw new Error("Failed to load overtime data");
      }

      const data = await response.json();
      setOvertimeData(Array.isArray(data) ? data : data?.items ?? []);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOvertimeData();
  }, []);

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);
      const response = await fetch(`/api/overtime/approve/${id}`, { 
        method: "POST" 
      });
      
      if (!response.ok) {
        throw new Error("Approval failed");
      }
      
      toast.success("Overtime approved successfully");
      await fetchOvertimeData();
    } catch (error) {
      toast.error(error.message || "Unable to approve overtime");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" /> Overtime Approval
        </h1>
        <Button
          onClick={fetchOvertimeData}
          disabled={isRefreshing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Overtime Approval Table
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-semibold">Username</TableCell>
                  <TableCell className="font-semibold">Employee Name</TableCell>
                  <TableCell className="font-semibold">Overtime Type</TableCell>
                  <TableCell className="font-semibold text-center">Overtime Worked (hours)</TableCell>
                  <TableCell className="font-semibold text-center">Salary Multiplier</TableCell>
                  <TableCell className="font-semibold text-center">Total Overtimes Worked</TableCell>
                  <TableCell className="font-semibold text-center">Status</TableCell>
                  <TableCell className="font-semibold text-center">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!overtimeData || overtimeData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="py-6 text-center text-gray-500">
                        {isLoading ? "Loading..." : "No overtime requests found"}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {overtimeData?.map((row) => {
                  const isApproved = row?.approved === true || String(row?.status).toLowerCase() === "approved";
                  const isCurrentlyApproving = approvingId === (row.id || row._id);
                  
                  return (
                    <TableRow key={row.id || row._id}>
                      <TableCell>{row.username ?? "-"}</TableCell>
                      <TableCell>{row.employeeName ?? row.name ?? "-"}</TableCell>
                      <TableCell>{row.overtimeType ?? "Regular"}</TableCell>
                      <TableCell className="text-center">{row.overtimeHours ?? 0}</TableCell>
                      <TableCell className="text-center">{row.salaryMultiplier ?? "1.75"}</TableCell>
                      <TableCell className="text-center">{row.totalOvertimesWorked ?? 0}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isApproved
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {isApproved ? "Approved" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          disabled={isApproved || isCurrentlyApproving}
                          onClick={() => handleApprove(row.id || row._id)}
                          className={`${
                            isApproved
                              ? "bg-green-600 cursor-not-allowed opacity-70"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approved
                            </>
                          ) : isCurrentlyApproving ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
