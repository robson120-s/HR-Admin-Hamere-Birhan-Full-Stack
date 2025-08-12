"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Users, CheckCircle2, XCircle, CalendarX2, DollarSign } from "lucide-react";

export default function SalaryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalEmployee: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalLeave: 0,
  });
  const [rows, setRows] = useState([]);
  const [payingId, setPayingId] = useState(null);

  const fetchAll = async () => {
    try {
      setIsRefreshing(true);
      const [dashRes, tableRes] = await Promise.all([
        fetch("/api/salary/dashboard", { cache: "no-store" }),
        fetch("/api/salary", { cache: "no-store" }),
      ]);

      if (!dashRes.ok) throw new Error("Failed to load dashboard summary");
      if (!tableRes.ok) throw new Error("Failed to load salary data");

      const dashData = await dashRes.json();
      const tableData = await tableRes.json();

      setSummary({
        totalEmployee: dashData?.totalEmployee ?? 0,
        totalPaid: dashData?.totalPaid ?? 0,
        totalUnpaid: dashData?.totalUnpaid ?? 0,
        totalLeave: dashData?.totalLeave ?? 0,
      });
      setRows(Array.isArray(tableData) ? tableData : tableData?.items ?? []);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handlePay = async (id) => {
    try {
      setPayingId(id);
      const res = await fetch(`/api/salary/pay/${id}`, { method: "POST" });
      if (!res.ok) throw new Error("Payment failed");
      toast.success("Salary paid successfully");
      await fetchAll();
    } catch (error) {
      toast.error(error.message || "Unable to pay salary");
    } finally {
      setPayingId(null);
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        key: "totalEmployee",
        title: "Total Employee",
        value: summary.totalEmployee,
        icon: Users,
        color: "bg-white dark:bg-gray-800",
      },
      {
        key: "totalPaid",
        title: "Total Paid",
        value: summary.totalPaid,
        icon: CheckCircle2,
        color: "bg-emerald-50 dark:bg-emerald-900/30",
      },
      {
        key: "totalUnpaid",
        title: "Total Unpaid",
        value: summary.totalUnpaid,
        icon: XCircle,
        color: "bg-rose-50 dark:bg-rose-900/30",
      },
      {
        key: "totalLeave",
        title: "Total Leave",
        value: summary.totalLeave,
        icon: CalendarX2,
        color: "bg-amber-50 dark:bg-amber-900/30",
      },
    ],
    [summary]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" /> Salary
        </h1>
        <Button
          onClick={fetchAll}
          disabled={isRefreshing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ key, title, value, icon: Icon, color }) => (
          <Card
            key={key}
            className={`${color} rounded-xl shadow hover:shadow-lg transition-all`}
          >
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {title}
              </CardTitle>
              <Icon className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isLoading ? "-" : value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Salary table */}
      <Card className="rounded-2xl">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            Salary Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-semibold">Username</TableCell>
                  <TableCell className="font-semibold">Employee Name</TableCell>
                  <TableCell className="font-semibold">Department</TableCell>
                  <TableCell className="font-semibold">Role</TableCell>
                  <TableCell className="font-semibold text-center">Absents</TableCell>
                  <TableCell className="font-semibold text-center">Presents</TableCell>
                  <TableCell className="font-semibold text-center">Overtime</TableCell>
                  <TableCell className="font-semibold text-right">Total Salary</TableCell>
                  <TableCell className="font-semibold text-center">Status</TableCell>
                  <TableCell className="font-semibold text-center">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!rows || rows.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <div className="py-6 text-center text-gray-500">
                        {isLoading ? "Loading..." : "No data"}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {rows?.map((row) => {
                  const isPaid = row?.paid === true || String(row?.status).toLowerCase() === "paid";
                  return (
                    <TableRow key={row.id || row._id}>
                      <TableCell>{row.username ?? "-"}</TableCell>
                      <TableCell>{row.employeeName ?? row.name ?? "-"}</TableCell>
                      <TableCell>{row.department ?? "-"}</TableCell>
                      <TableCell>{row.role ?? "-"}</TableCell>
                      <TableCell className="text-center">{row.absents ?? 0}</TableCell>
                      <TableCell className="text-center">{row.presents ?? 0}</TableCell>
                      <TableCell className="text-center">{row.overtime ?? 0}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.totalSalary)}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isPaid
                              ? "bg-green-100 text-green-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          disabled={isPaid || payingId === (row.id || row._id)}
                          onClick={() => handlePay(row.id || row._id)}
                          className={`${
                            isPaid
                              ? "bg-green-600 cursor-not-allowed opacity-70"
                              : "bg-rose-600 hover:bg-rose-700"
                          }`}
                        >
                          {isPaid
                            ? "Paid"
                            : payingId === (row.id || row._id)
                            ? "Paying..."
                            : "Pay"}
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

function formatCurrency(value) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "-";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}
//s

//sosina