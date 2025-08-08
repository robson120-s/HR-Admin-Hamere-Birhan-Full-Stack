"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card";
import {
  UserCheck,
  UserX,
  Users,
  User2,
  AlertCircle,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "./Sidebar";

export default function DepartmentHeadDashboard() {
  const [data, setData] = useState({
    present: 20,
    absent: 5,
    totalInterns: 50,
    totalStaff: 10,
    pendingComplaints: 3,
    avgPerformance: 8.4,
    recentActivity: [
      { id: 1, type: "Complaint", message: "Intern A reported workload issue", date: "2025-08-05" },
      { id: 2, type: "Attendance", message: "Staff B marked present", date: "2025-08-06" },
      { id: 3, type: "Performance", message: "Staff C received a score of 9", date: "2025-08-07" },
      { id: 4, type: "Complaint", message: "Complaint resolved by Dept Head", date: "2025-08-07" },
    ],
  });

  const activityIcons = {
    Complaint: <AlertCircle className="w-6 h-6 text-yellow-600" />,
    Attendance: <CheckCircle className="w-6 h-6 text-green-600" />,
    Performance: <Star className="w-6 h-6 text-teal-600" />,
    Resolved: <XCircle className="w-6 h-6 text-red-600" />,
    Default: <MessageSquare className="w-6 h-6 text-gray-500" />,
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Department Head Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {/* Present */}
          <Card className="text-center">
            <CardHeader>
              <UserCheck className="mx-auto text-green-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-black dark:text-white">Present</CardTitle>
              <p className="text-2xl font-bold text-green-700">{data.present}</p>
            </CardContent>
          </Card>

          {/* Absent */}
          <Card className="text-center">
            <CardHeader>
              <UserX className="mx-auto text-red-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-black dark:text-white">Absent</CardTitle>
              <p className="text-2xl font-bold text-red-700">{data.absent}</p>
            </CardContent>
          </Card>

          {/* Total Interns */}
          <Card className="text-center">
            <CardHeader>
              <Users className="mx-auto text-blue-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-black dark:text-white">Total Interns</CardTitle>
              <p className="text-2xl font-bold text-blue-700">{data.totalInterns}</p>
            </CardContent>
          </Card>

          {/* Total Staff */}
          <Card className="text-center">
            <CardHeader>
              <User2 className="mx-auto text-purple-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-black dark:text-white">Total Staff</CardTitle>
              <p className="text-2xl font-bold text-purple-700">{data.totalStaff}</p>
            </CardContent>
          </Card>

          {/* Pending Complaints */}
          <Card className="text-center">
            <CardHeader>
              <AlertCircle className="mx-auto text-yellow-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-black dark:text-white">Pending Complaints</CardTitle>
              <p className="text-2xl font-bold text-yellow-700">{data.pendingComplaints}</p>
            </CardContent>
          </Card>

          {/* Average Performance */}
          <Card className="text-center">
            <CardHeader>
              <Star className="mx-auto text-teal-600 w-8 h-8" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg text-black dark:text-white">Avg. Performance</CardTitle>
              <p className="text-2xl font-bold text-teal-700">{data.avgPerformance.toFixed(1)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Container */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Recent Activity & Announcements</h2>
          <div className="space-y-4">
            {data.recentActivity.length === 0 && (
              <p className="text-center py-6 text-gray-500 dark:text-gray-400">No recent activity.</p>
            )}
            {data.recentActivity.map(({ id, type, message, date }) => (
              <Card key={id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="flex items-center space-x-4">
                  <div>{activityIcons[type] || activityIcons.Default}</div>
                  <div className="flex-1">
                    <p className="text-black dark:text-white">
                      <span className="font-semibold">{type}:</span> {message}
                    </p>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">{date}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
