import axios from "axios";

// --- Base Axios Instances ---
const BASE_URL = "http://localhost:5555/api"; // Centralized base URL

const apiClientHr = axios.create({ baseURL: `${BASE_URL}/hr`, withCredentials: true });
export const apiClientDepHead = axios.create({ baseURL: `${BASE_URL}/dep-head`, withCredentials: true });
export const apiClientStaff = axios.create({ baseURL: `${BASE_URL}/staff`, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
export const apiClientIntern = axios.create({ baseURL: `${BASE_URL}/intern`, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
const apiClientSalary = axios.create({ baseURL: `${BASE_URL}/salary`, withCredentials: true });
const apiClient = axios.create({ baseURL: BASE_URL, withCredentials: true }); // For general auth, upload
const apiClientPolicies = axios.create({ baseURL: `${BASE_URL}/policies`, withCredentials: true });


// --- Interceptor for adding Auth Token (General Purpose) ---
const addAuthTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const employeeInfoString = localStorage.getItem('employeeInfo');
      if (employeeInfoString) {
        try {
          const employeeInfo = JSON.parse(employeeInfoString);
          const token = employeeInfo.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error(`API Client (${instance.defaults.baseURL}): Error parsing employee info for request interceptor:`, e);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// --- Response Interceptor for handling 401 Unauthorized globally ---
const add401Interceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.warn(`API Client (${instance.defaults.baseURL}): Authentication failed (401 Unauthorized). Clearing session and redirecting to login.`, error.response.data);
        localStorage.removeItem('employeeInfo');
        localStorage.removeItem('authToken');
        window.location.href = '/loginpage'; // Full page reload for clean state
      }
      return Promise.reject(error);
    }
  );
};

// --- Apply Interceptors to all Axios instances ONCE ---
[
  apiClientHr, apiClientDepHead, apiClientStaff, apiClientIntern,
  apiClientSalary, apiClientPolicies, apiClient,
].forEach(client => {
  addAuthTokenInterceptor(client);
  add401Interceptor(client);
});

// FIX 1: Ensure login correctly parses and saves employeeInfo for all user types.
// Backend's /api/auth/login should return `{ token, user: { id, username, email, roles, employee: { ... } | null } }`
export const login = async (credentials) => {
  try {
    const response = await apiClient.post(`/auth/login`, credentials);
    const { token, user } = response.data;

    if (!token) {
      console.error("Login successful, but response missing token:", response.data);
      throw new Error("Login response incomplete: No token received.");
    }

    let employeeId = null;
    let userName = user.username; // Default to username from user object

    if (user && user.employee && typeof user.employee.id === 'number') {
      employeeId = user.employee.id;
      userName = `${user.employee.firstName} ${user.employee.lastName}`;
    } else {
      // For roles like HR that don't have an `employee` record, this is expected.
      // The `userName` defaults to `user.username`.
      console.log(`Login: User '${user.username}' (ID: ${user.id}) has roles: [${user.roles.join(', ')}]. No associated employee record found.`);
    }

    localStorage.setItem('employeeInfo', JSON.stringify({
      token: token,
      userId: user.id,          // Store the user's ID
      employeeId: employeeId,    // Will be null for HR, valid for Staff/Dep Head
      userName: userName,
      roles: user.roles          // Store roles for client-side routing
    }));
    localStorage.setItem('authToken', token); // Also store raw token if needed elsewhere

    return response.data; // Return the full response for the calling component
  } catch (error) {
    throw new Error(error.response?.data?.error || "Login failed. Please try again.");
  }
};

/**
 * IMPORTANT: Authentication
 * Your backend uses 'authenticate' and 'authorize("HR")'. This means you MUST
 * send an authentication token with your request. This is usually done by
 * attaching a JWT stored in an HttpOnly cookie, which 'withCredentials: true'
 * handles automatically.
 *
 * If you use an "Authorization: Bearer <token>" header instead, you would
 * configure that here using interceptors. For now, we assume a cookie.
 */
// Use an interceptor to add the auth token to every single request
// apiClient.interceptors.request.use(
//   (config) => {
//     // Retrieve the token from wherever you store it (e.g., localStorage)
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
export const getDashboardData = async () => {
  try {
    // Make the GET request to your /dashboard endpoint
    const response = await apiClientHr.get("/dashboard");
    return response.data; // Return the JSON data from the response
  } catch (error) {
    // Log the error and re-throw it so the component can handle it
    console.error("Failed to fetch dashboard data:", error.response?.data?.error || error.message);
    throw new Error(error.response?.data?.error || "An unknown error occurred.");
  }
};
// lib/api.js - add these to your file

// export const getMeetings = async () => {
//   const response = await apiClientHr.get("/meetings");
//   return response.data;
// };

export const addMeeting = async (meetingData) => {
  const response = await apiClientHr.post("/meetings", meetingData);
  return response.data;
};

export const deleteMeeting = async (id) => {
  await apiClientHr.delete(`/meetings/${id}`);
};
// lib/api.js
export const getEmployeesByRole = async (role) => {
  const response = await apiClientHr.get(`/employees?role=${role}`);
  return response.data;
};

// In your frontend file: lib/api.js

// ... your existing apiClient and other functions ...

export const getComplaints = async () => {
  try {
    const response = await apiClientHr.get("/complaints");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch complaints.");
  }
};

export const updateComplaint = async (id, data) => {
  try {
    // data will be an object like { status: 'resolved', response: '...' }
    const response = await apiClientHr.patch(`/complaints/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not update complaint.");
  }
};

export const createEmployee = async (payload) => {
  try {
    const response = await apiClientHr.post("/employees", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not create employee.");
  }
};

export const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('photo', file); // 'photo' must match the name in the backend `upload.single('photo')`

    // Use the general apiClient
    const response = await apiClient.post('/upload/photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data; // This will return { filePath: '/uploads/photo-12345.jpg' }
};

export const getEmployeeFormLookups = async () => {
    const response = await apiClientHr.get('/employee-form-lookups');
    return response.data;
};

/**
 * Fetches the list of all active employees.
 */
export const getEmployees = async () => {
  try {
    const response = await apiClientHr.get("/employees");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch employees.");
  }
};

/**
 * Fetches a single employee by their ID.
 */
export const getEmployeeById = async (id) => {
  try {
    const response = await apiClientHr.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch employee details.");
  }
};

/**
 * Updates an existing employee's details.
 */
export const updateEmployee = async (id, data) => {
  try {
    const response = await apiClientHr.patch(`/employees/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not update employee.");
  }
};


// --- LOOKUP API FUNCTIONS (For Dropdowns) ---

export const getRoles = async () => {
    const response = await apiClientHr.get("/lookup/roles");
    return response.data;
};

export const getPositionsLookup = async () => {
  try {
    const response = await apiClientHr.get('/lookup/positions');
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    return []; // Return empty array instead of throwing error
  }  
};
export const getDepartmentsLookup = async () => {
  try {
    const response = await apiClientHr.get('/lookup/departments');
    // Extract the 'all' array from the response
    return response.data.all || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

// Do the same for other lookup functions
export const getMaritalStatuses = async () => {
  try {
    const response = await apiClientHr.get('/lookup/marital-statuses');
    return response.data;
  } catch (error) {
    console.error('Error fetching marital statuses:', error);
    return [];
  }
};
export const getEmploymentTypes = async () => {
  try {
    const response = await apiClientHr.get('/lookup/employment-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching employment types:', error);
    return [];
  }
};
export const getJobStatuses = async () => {
  try {
    const response = await apiClientHr.get('/lookup/job-statuses');
    return response.data;
  } catch (error) {
    console.error('Error fetching job statuses:', error);
    return [];
  }
};
export const getAgreementStatuses = async () => {
  try {
    const response = await apiClientHr.get('/lookup/agreement-statuses');
    return response.data;
  } catch (error) {
    console.error('Error fetching agreement statuses:', error);
    return [];
  }
};




export const getTerminations = async () => {
  try {
    const response = await apiClientHr.get("/terminations");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch terminations.");
  }
};

export const createTermination = async (data) => {
    try {
        const response = await apiClientHr.post("/terminations", data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not create termination.");
    }
}

export const updateTermination = async (id, data) => {
  try {
    // data will be an object like { status: 'Voluntary', reason: '...' }
    const response = await apiClientHr.patch(`/terminations/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not update termination.");
  }
};

export const deleteTermination = async (id) => {
    try {
        await apiClientHr.delete(`/terminations/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not delete termination.");
    }
}

export const getTerminationById = async (id) => {
  try {
    const response = await apiClientHr.get(`/terminations/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch termination record.");
  }
};

/**
 * Searches for employees by name.
 * @param {string} query - The search term.
 */
export const searchEmployees = async (query) => {
  try {
    // Use URLSearchParams to safely encode the query
    const params = new URLSearchParams({ q: query });
    const response = await apiClientHr.get(`/employees/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not search for employees.");
  }
};

export const getDepartments = async () => {
    const response = await apiClientHr.get('/departments');
    return response.data;
};

export const getDepartmentById = async (id) => {
    try {
        const response = await apiClientHr.get(`/departments/${id}`); // Assumes a GET /departments/:id endpoint exists
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not fetch department details.");
    }
};

export const createDepartment = async (data) => {
    const response = await apiClientHr.post('/departments', data);
    return response.data;
};

export const updateDepartment = async (id, data) => {
    const response = await apiClientHr.patch(`/departments/${id}`, data);
    return response.data;
};

export const deleteDepartment = async (id) => {
    await apiClientHr.delete(`/departments/${id}`);
};

export const getEmployeesByDepartment = async (id) => {
    const response = await apiClientHr.get(`/departments/${id}/employees`);
    return response.data;
};

export const getLeaveRequests = async () => {
  try {
    const response = await apiClientHr.get("/leaves");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch leave requests.");
  }
};

export const updateLeaveStatus = async (leaveId, status) => {
  try {
    // Map the frontend's capitalized status to the backend's lowercase enum
    const statusPayload = status.toLowerCase();
    const response = await apiClientHr.patch(`/leaves/${leaveId}/status`, { status: statusPayload });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not update leave status.");
  }
};

export const getOvertimeRequests = async () => {
  try {
    const response = await apiClientHr.get("/overtime");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch overtime requests.");
  }
};

export const updateOvertimeStatus = async (id, status) => {
  try {
    const response = await apiClientHr.patch(`/overtime/${id}`, { approvalStatus: status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not update overtime status.");
  }
};

/////////////Attendance approval 
export const getAttendanceForApproval = async (date, page = 1, departmentId = '', search = '') => {
  try {
    const params = new URLSearchParams({
      date,
      page,
      limit: 20,
      ...(departmentId && { departmentId }),
      ...(search && { search })
    });
    
    
    const response = await apiClientHr.get(`/attendance-for-approval?${params}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch data');
  }
};

export const approveAttendance = async (date, employeeIds) => {
  const response = await apiClientHr.post('/approve-attendance', { date, employeeIds });
  return response.data;
};

export const saveAttendances = async (data) => {
  try {
    const response = await apiClientHr.post('/attendance', data);
    return response.data;
  } catch (error) {
    console.error('Error saving attendance:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to save attendance');
  }
};

export const exportAttendance = async (date, departmentId = '') => {
  const params = new URLSearchParams({
    date,
    ...(departmentId && { departmentId })
  });
  
  const response = await apiClientHr.get(`/export-attendance?${params}`, {
    responseType: 'blob' // Important for file downloads
  });
  return response.data;
};


// export const getAttendanceOverview = async (year, month) => {
//   const response = await fetch(`/api/hr/attendance/overview?year=${year}&month=${month}`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch attendance data');
//   }
//   return response.json();
// };
export const getAttendanceOverview = async (year, month) => {
  
    // We send year and month as query parameters
    const response = await apiClientHr.get(`/attendance/overview?year=${year}&month=${month}`);
    return response.data; // Will return { employees, attendanceMap }
  
  
};

export const getAttendanceReport = async (timeframe = 'weekly') => {
  try {
    const response = await apiClientHr.get(`/reports/attendance?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch attendance report.");
  }
}

//Salary
// 1. Function to get the summary card data
export const getSalaryDashboard = async () => {
    const response = await apiClientSalary.get('/dashboard');
    return response.data;
};

// 2. Function to get the main salary table data
export const getSalaryTable = async () => {
    const response = await apiClientSalary.get('/'); // GETs from /api/salary/
    return response.data;
};

// 3. Function to trigger the salary generation process
export const generateSalaries = async () => {
    const response = await apiClientSalary.post('/generate');
    return response.data;
};

// 4. Function to mark a salary as paid
export const paySalary = async (salaryId) => {
    const response = await apiClientSalary.post(`/pay/${salaryId}`);
    return response.data;
};

// 5. Function to update a salary record (for editing)
export const updateSalary = async (salaryId, data) => {
    const response = await apiClientSalary.patch(`/${salaryId}`, data);
    return response.data;
};

//payroll policy
// 1. Function to get all payroll policies
export const getPayrollPolicies = async () => {
    const response = await apiClientPolicies.get('/');
    return response.data;
};

// 2. Function to create a new payroll policy
export const createPayrollPolicy = async (policyData) => {
    const response = await apiClientPolicies.post('/', policyData);
    return response.data;
};

// 3. Function to update an existing payroll policy
export const updatePayrollPolicy = async (policyId, policyData) => {
    const response = await apiClientPolicies.patch(`/${policyId}`, policyData);
    return response.data;
};

// 4. Function to assign a policy to a department
export const assignPolicyToDepartment = async (departmentId, policyId) => {
    // Note: The policyId can be null to reset a department to the default policy
    const response = await apiClientHr.patch(`/departments/${departmentId}/assign-policy`, { policyId });
    return response.data;
};


////////////setting
export const changePassword = async (data) => {
  // ✅ Use the general `apiClient` which points to /api
  const response = await apiClient.patch('/auth/change-password', data);
  return response.data;
};


// profile

export const getHrProfile = async () => {
    try {
        const response = await apiClientHr.get('/profile');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not fetch your profile.");
    }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////DEPARTEMENT HEAD//////////////////////////////////////////////////////////////////////////////////////
export const getDepHeadDashboard = async () => {
    try {
        // Use the new apiClientDepHead
        const response = await apiClientDepHead.get('/dashboard');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not fetch dashboard data.");
    }
}

///PERFORMANCE

export const getPerformanceData = async () => {
    try {
        const response = await apiClientDepHead.get('/performance-data');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not fetch performance data.");
    }
};

export const submitPerformanceReview = async (reviewData) => {
    try {
        const response = await apiClientDepHead.post('/performance-review', reviewData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not submit review.");
    }
};

///////////////Designation

// In your frontend file: lib/api.js
// ... import { apiClientDepHead } ...

export const getSubDepartments = async () => {
    const response = await apiClientDepHead.get('/sub-departments');
    return response.data;
};
export const createSubDepartment = async (data) => {
    const response = await apiClientDepHead.post('/sub-departments', data);
    return response.data;
};
export const updateSubDepartment = async (id, data) => {
    const response = await apiClientDepHead.patch(`/sub-departments/${id}`, data);
    return response.data;
};
export const deleteSubDepartment = async (id) => {
    await apiClientDepHead.delete(`/sub-departments/${id}`);
};

///////Complain request
export const submitComplaint = async (complaintData) => {
    // complaintData will now just be { subject, description }
    try {
        // Use the new, more specific endpoint
        const response = await apiClientDepHead.post('/complaints/submit', complaintData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not submit complaint.");
    }
};
export const getMyComplaints = async () => {
    try {
        const response = await apiClientDepHead.get('/complaints');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not fetch your complaints.");
    }
};

///Leave Request
export const getScopedEmployeesForLeave = async () => {
    const response = await apiClientDepHead.get('/employees-for-leave');
    return response.data;
};
export const getScopedLeaveRequests = async () => {
    const response = await apiClientDepHead.get('/leaves');
    return response.data;
};
export const createLeaveRequest = async (data) => {
    const response = await apiClientDepHead.post('/leaves', data);
    return response.data;
};

//Mark Attendace
export const getAttendanceRoster = async (date) => {
  try {
    const response = await apiClientDepHead.get(`/attendance-roster?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance roster:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch attendance roster');
  }
};

export const saveAttendance = async (data) => {
  try {
    const response = await apiClientDepHead.post('/attendance', data);
    return response.data;
  } catch (error) {
    console.error('Error saving attendance:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to save attendance');
  }
};

export const exportDepHeadAttendance = async (startDate, endDate) => {
    const response = await apiClientDepHead.get(`/export-attendance?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
};

//////////////Attendance-Overview
export const getDepHeadAttendanceOverview = async (year, month) => {
    // We pass the year and month as query parameters
    const response = await apiClientDepHead.get(`/attendance-overview?year=${year}&month=${month}`);
    return response.data;
};

///////////Overtime
export const getDepHeadOvertimeRequests = async () => {
    const response = await apiClientDepHead.get('/overtime-requests');
    return response.data;
};

export const getDepHeadTeamMembers = async () => {
    const response = await apiClientDepHead.get('/team-members');
    return response.data;
};

export const createOvertimeRequest = async (requestData) => {
    const response = await apiClientDepHead.post('/overtime-requests', requestData);
    return response.data;
};

//Payment Status
export const getDepHeadPaymentStatus = async () => {
    const response = await apiClientDepHead.get('/payment-status');
    return response.data;
};



///////PROFILE
export const getMyProfile = async () => {
    try {
        const response = await apiClientDepHead.get('/profile');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not fetch your profile.");
    }
};

//////Settings
/**
 * Updates the password for the logged-in Department Head.
 * @param {object} passwordData - Should contain { currentPassword, newPassword }.
 */

export const changePassworddep = async (passwordData) => {
  try {
    // Use the apiClientDepHead to ensure the request goes to /api/dep-head/...
    const response = await apiClientDepHead.patch("/settings/change-password", passwordData);
    return response.data; // Should return { message: "..." }
  } catch (error) {
    // Re-throw the error with the specific message from the backend
    throw new Error(error.response?.data?.error || "An unknown error occurred.");
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////STAFF//////////////////////////////////////////////////////////////////////////////////////

export const fetchStaffDashboardSummary = async () => {
  try {
    const response = await apiClientStaff.get(`/dashboard/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff dashboard summary:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch dashboard summary.");
  }
};

export const fetchHolidays = async () => { // No change
  try {
    const response = await apiClientStaff.get('/holidays');
    return response.data;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch holidays.");
  }
};

// FIX 3: Removed employeeId parameter, updated URL path
export const fetchRecentActivities = async () => {
  try {
    const response = await apiClientStaff.get(`/dashboard/activities`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch recent activities.");
  }
};

// FIX 4: Removed employeeId parameter, updated URL path
export const fetchStaffAttendanceHistory = async (month, year) => {
  try {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await apiClientStaff.get(`/attendance-history`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching staff attendance history:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch attendance history.");
  }
};

// FIX 5: Removed employeeId parameter from payload (backend now uses req.user.employee.id)
export const submitComplaints = async ({ subject, description }) => {
  try {
    const response = await apiClientStaff.post('/complaints', { subject, description });
    return response.data;
  } catch (error) {
    console.error("Error submitting complaint:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not submit complaint.");
  }
};

// FIX 6: Removed employeeId parameter, updated URL path
export const getMyComplaint = async () => {
  try {
    const response = await apiClientStaff.get(`/complaints`);
    return response.data;
  } catch (error) {
    console.error("Error fetching my complaints:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch your complaints.");
  }
};

// FIX 7: Removed employeeId parameter, updated URL path
export const fetchEmployeeProfile = async () => {
  try {
    const response = await apiClientStaff.get(`/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch employee profile.");
  }
};

// FIX 8: Removed employeeId parameter, updated URL path
export const updateStaffPassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await apiClientStaff.put(`/settings/change-password`, { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not update password.");
  }
};

// FIX 9: Removed employeeId parameter, updated URL path
export const updateStaffNotificationPreference = async (notifyOnComplaint) => {
  try {
    const response = await apiClientStaff.patch(`/settings/notifications`, { notifyOnComplaint });
    return response.data;
  } catch (error) {
    console.error("Error updating notification preference:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not update notification preference.");
  }
};




// ==============================================================================
// NEW INTERN-SPECIFIC API FUNCTIONS (using apiClientIntern)
// ==============================================================================

export const fetchInternDashboardSummary = async (internId) => {
  try {
    const response = await apiClientIntern.get(`/dashboard/${internId}/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching intern dashboard summary:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch intern dashboard summary.");
  }
};

export const fetchInternHolidays = async () => {
  try {
    // Holidays are general, can be fetched via intern client too
    const response = await apiClientIntern.get('/holidays');
    return response.data;
  } catch (error) {
    console.error("Error fetching intern holidays:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch holidays.");
  }
};

export const fetchInternRecentActivities = async (internId) => {
  try {
    const response = await apiClientIntern.get(`/dashboard/${internId}/activities`);
    return response.data;
  } catch (error) {
    console.error("Error fetching intern recent activities:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch intern recent activities.");
  }
};

export const fetchInternAttendanceHistory = async (internId, month, year) => {
  try {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await apiClientIntern.get(`/attendance-history/${internId}`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching intern attendance history:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch intern attendance history.");
  }
};

export const submitInternComplaint = async (internId, { subject, description }) => {
  try {
    const response = await apiClientIntern.post('/complaints', { internId, subject, description });
    return response.data;
  } catch (error) {
    console.error("Error submitting intern complaint:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not submit intern complaint.");
  }
};

export const getInternComplaints = async (internId) => {
  try {
    const response = await apiClientIntern.get(`/complaints/${internId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching intern complaints:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch intern complaints.");
  }
};

export const fetchInternProfile = async (internId) => {
  try {
    const response = await apiClientIntern.get(`/profile/${internId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching intern profile:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not fetch intern profile.");
  }
};

export const updateInternPassword = async (internId, { currentPassword, newPassword }) => {
  try {
    const response = await apiClientIntern.put(`/settings/${internId}/change-password`, { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    console.error("Error updating intern password:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not update intern password.");
  }
};

export const updateInternNotificationPreference = async (internId, notifyOnComplaint) => {
  try {
    const response = await apiClientIntern.patch(`/settings/${internId}/notifications`, { notifyOnComplaint });
    return response.data;
  } catch (error) {
    console.error("Error updating intern notification preference:", error);
    throw new Error(error.response?.data?.message || error.message || "Could not update intern notification preference.");
  }
};


//😍🎉sosi 🌹😍🎉🎉😍😍