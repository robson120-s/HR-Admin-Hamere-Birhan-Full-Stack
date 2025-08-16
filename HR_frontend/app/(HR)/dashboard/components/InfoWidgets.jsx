"use client";

import AttendanceLeaveInfoCard from "./AttendanceLeaveInfoCard";
import ComplaintsCard from "./ComplaintsCard";

// It now receives the full data object as a prop
export default function InfoWidgets({ data }) {
  // We create the specific objects required by the child components from the main data prop
  const attendanceStats = {
    totalLeaves: data.totalOnLeave, // Or another value if you have total allocated leaves
    leavesTaken: data.totalOnLeave, // This might need a different backend field
    leavesAbsent: data.totalAbsentToday,
    pendingApproval: data.pendingLeaveApproval,
    workingDays: data.totalWorkingDays,
    lossOfPay: 0, // Your backend doesn't provide this, so we hardcode 0
  };

  const complaints = data.recentComplaints.map(c => ({
      id: c.createdAt, // Use a unique value like createdAt for the key
      text: c.description,
      time: new Date(c.createdAt).toLocaleDateString(), // Format the date
      unread: true, // Assuming all open complaints are "unread"
  }));

  return (
    <div className="flex flex-col gap-6">
      <AttendanceLeaveInfoCard stats={attendanceStats} />
      <ComplaintsCard complaints={complaints} />
    </div>
  );
}