"use client";

// This component receives a "stats" object as a prop and displays its values.
export default function AttendanceLeaveInfoCard({ stats }) {

  // A safety check in case the stats prop is not passed.
  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Attendance & Leaves
        </h2>
        <p>Data is loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
        Attendance & Leaves
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Column 1: Uses data from the 'stats' prop */}
        <div className="space-y-4">
          <div>
            <p className="text-lg font-bold text-blue-500">{stats.totalLeaves}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Total Leaves</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-500">{stats.leavesTaken}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Leaves Taken</p>
          </div>
          <div>
            <p className="text-lg font-bold text-orange-500">{stats.leavesAbsent}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Absent</p>
          </div>
        </div>

        {/* Column 2: Uses data from the 'stats' prop */}
        <div className="space-y-4">
          <div>
            <p className="text-lg font-bold text-purple-500">{stats.pendingApproval}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Pending leave Approval</p>
          </div>
          <div>
            <p className="text-lg font-bold text-sky-500">{stats.workingDays}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">Working Days</p>
          </div>
          <div>
            {/* CHANGE 1: Use the correct variable from the API */}
            <p className="text-lg font-bold text-red-500">{stats.totalComplaintsAllTime}</p>            
            {/* CHANGE 2: Corrected the label to match the data */}
            <p className="text-sm text-gray-500 dark:text-gray-300">Total Complaints</p>
          </div>
        </div>
      </div>
    </div>
  );
}