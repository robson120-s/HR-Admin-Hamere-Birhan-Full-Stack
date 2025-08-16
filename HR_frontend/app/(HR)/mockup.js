// app/mockup.js

// Add this in app/mockup.js

export const mockAttendanceData = {
  totalPresent: 20,
  totalAbsent: 5,
  totalUsers: 25,
  records: [
    { name: "Abebe", department: "Engineering", status: "Present" },
    { name: "Mulu", department: "HR", status: "Absent" },
    { name: "Sara", department: "Marketing", status: "Present" },
    { name: "Kebede", department: "Finance", status: "Present" },
    { name: "Hana", department: "Operations", status: "Absent" },
    // ... add more as needed
  ],
};


// Mockup Departments (summary info)
export const mockDepartments = [
  {
    id: "engineering",
    name: "Engineering",
    staffCount: 8,
    internCount: 2,
  },
  {
    id: "hr",
    name: "HR",
    staffCount: 5,
    internCount: 1,
  },
  {
    id: "marketing",
    name: "Marketing",
    staffCount: 6,
    internCount: 3,
  },
  {
    id: "finance",
    name: "Finance",
    staffCount: 4,
    internCount: 1,
  },
  {
    id: "operations",
    name: "Operations",
    staffCount: 7,
    internCount: 2,
  },
];

// Mockup Staffs (detailed)
export const mockStaffs = [
  {
    id: 1,
    name: "Abebe",
    role: "Senior Engineer",
    email: "abebe@company.com",
    phone: "+251911000000",
    bio: "Loves solving complex problems.",
    departmentId: "engineering",
  },
  {
    id: 2,
    name: "Marta",
    role: "Software Developer",
    email: "marta@company.com",
    phone: "+251911111111",
    bio: "Front-end enthusiast.",
    departmentId: "engineering",
  },
  {
    id: 3,
    name: "Mulu",
    role: "HR Manager",
    email: "mulu@company.com",
    phone: "+251911333333",
    bio: "Passionate about people and culture.",
    departmentId: "hr",
  },
  {
    id: 4,
    name: "Sara",
    role: "Marketing Specialist",
    email: "sara@company.com",
    phone: "+251911555555",
    bio: "Loves social media marketing.",
    departmentId: "marketing",
  },
  {
    id: 5,
    name: "John",
    role: "Finance Analyst",
    email: "john@company.com",
    phone: "+251911666666",
    bio: "Numbers are life.",
    departmentId: "finance",
  },
  // add more staff as needed
];

// Mockup Interns (detailed)
export const mockInterns = [
  {
    id: 101,
    name: "Kebede",
    role: "Engineering Intern",
    email: "kebede@company.com",
    phone: "+251911222222",
    bio: "Learning React and Node.js.",
    departmentId: "engineering",
  },
  {
    id: 102,
    name: "Sara",
    role: "HR Intern",
    email: "sara@company.com",
    phone: "+251911444444",
    bio: "Studying business administration.",
    departmentId: "hr",
  },
  {
    id: 103,
    name: "Hana",
    role: "Marketing Intern",
    email: "hana@company.com",
    phone: "+251911777777",
    bio: "Creative and enthusiastic.",
    departmentId: "marketing",
  },
  // add more interns as needed
];
