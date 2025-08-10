"use client";

import AttendanceLeaveInfoCard from "./AttendanceLeaveInfoCard";
import ComplaintsCard from "./ComplaintsCard";
import { complaintsData, attendanceLeaveStats } from "../../../../lib/mockData";

export default function InfoWidgets() {
  return (
    <div className="flex flex-col gap-6">
      <AttendanceLeaveInfoCard stats={attendanceLeaveStats} />
      <ComplaintsCard complaints={complaintsData} />
    </div>
  );
}