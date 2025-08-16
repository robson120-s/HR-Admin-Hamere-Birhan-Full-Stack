// This file contains all the static mock data for the dashboard.

export const mockSummary = {
  totalEmployee: 140,
  totalStaff: 25,
  totalInterns: 10,
  totalOnLeave: 5,
  totalDepartments: 5,
  attendanceByDepartment: [
    { department: "Engineering", present: 5 },
    { department: "HR", present: 5 },
    { department: "Marketing", present: 7 },
    { department: "Finance", present: 6 },
    { department: "Operations", present: 12 },
  ],
  staffList: [
    { name: "Abebe", department: "Engineering" },
    { name: "Mulu", department: "HR" },
    { name: "Sara", department: "Marketing" },
    { name: "Samuel", department: "Finance" },
    { name: "Lily", department: "Operations" },
    { name: "Binyam", department: "Engineering" },
    { name: "Hana", department: "Marketing" },
  ],
  internList: [
    { name: "Kebede", department: "Finance" },
    { name: "Hana", department: "Engineering" },
    { name: "Selam", department: "HR" },
    { name: "Teddy", department: "Operations" },
    { name: "Mimi", department: "Marketing" },
    { name: "Betty", department: "Finance" },
  ],
};

export const meetingsData = [
  { title: "Project Kickoff", date: "June 1, 2024", time: "10:00 AM" },
  { title: "Weekly Team Sync", date: "June 5, 2024", time: "02:00 PM" },
  { title: "Client Presentation", date: "June 10, 2024", time: "11:00 AM" },
];

export const complaintsData = [
    { id: 1, text: "Delay in attendance marking", time: "2 hrs ago", unread: true },
    { id: 2, text: "Leave balance calculation issue", time: "Yesterday", unread: false },
    { id: 3, text: "Request to correct working days count", time: "3 days ago", unread: false },
];

export const attendanceLeaveStats = {
    totalLeaves: 10,
    leavesTaken: 6.5,
    leavesAbsent: 6,
    pendingApproval: 1,
    workingDays: 315,
    lossOfPay: 3,
};