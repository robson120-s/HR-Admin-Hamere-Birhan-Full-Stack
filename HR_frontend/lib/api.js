// lib/api.js
import axios from "axios";
import Excellentaxios from "axios";

// Create an instance of axios with a base URL.
// Replace 'http://localhost:5000' with your actual backend server address.
const apiClientHr = axios.create({
  baseURL: "http://localhost:5555/api/hr", // Adjust the port and base path as needed
  withCredentials: true, // This is crucial for sending cookies (like auth tokens)
});

export const apiClientDepHead = axios.create({
  baseURL: "http://localhost:5555/api/dep-head", // New, dedicated base URL
  withCredentials: true,
});

const apiClientSalary = axios.create({
  baseURL: "http://localhost:5555/api/salary", // Base path for all salary endpoints
  withCredentials: true,
});

const apiClient = axios.create({
  baseURL: "http://localhost:5555/api", // Note the shorter baseURL
  withCredentials: true,
});
const apiClientPolicies = axios.create({
  baseURL: "http://localhost:5555/api/policies",
  withCredentials: true,
});


const addAuthToken = (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
};

apiClientHr.interceptors.request.use(addAuthToken);
apiClientDepHead.interceptors.request.use(addAuthToken);
apiClient.interceptors.request.use(addAuthToken);
apiClientSalary.interceptors.request.use(addAuthToken);
apiClientSalary.interceptors.request.use(addAuthToken);
apiClientPolicies.interceptors.request.use(addAuthToken);


export const login = async (credentials) => {
  try {
    // This is a public route is solid, and your frontend UI is very attractive. Now, let's connect them to create a fully functional and, so we can make a direct axios call.
    // The baseURL should point to your backend.
    const response = await axios.post("http://localhost:5555/api/auth/login", credentials);
    return response.data; // Will return { token, user }
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

export const getMeetings = async () => {
  const response = await apiClientHr.get("/meetings");
  return response.data;
};

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
};export const createEmployee = async (payload) => {
  try {
    const response = await apiClientHr.post("/employees", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not create employee.");
  }
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
export const getDepartmentsLookup = async () => {
    const response = await apiClientHr.get("/lookup/departments");
    return response.data;
};
export const getPositionsLookup = async () => {
    const response = await apiClientHr.get("/lookup/positions");
    return response.data;
};
export const getMaritalStatuses = async () => {
    const response = await apiClientHr.get("/lookup/marital-statuses");
    return response.data;
};
export const getEmploymentTypes = async () => {
    const response = await apiClientHr.get("/lookup/employment-types");
    return response.data;
};
export const getJobStatuses = async () => {
    const response = await apiClientHr.get("/lookup/job-statuses");
    return response.data;
};
export const getAgreementStatuses = async () => {
    const response = await apiClientHr.get("/lookup/agreement-statuses");
    return response.data;
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


// In your frontend file: lib/api.js

export const getAttendanceOverview = async (year, month) => {
  try {
    // We send year and month as query parameters
    const response = await apiClientHr.get(`/attendance/overview?year=${year}&month=${month}`);
    return response.data; // Will return { employees, attendanceMap }
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch attendance overview.");
  }
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
    const response = await apiClientDepHead.get(`/attendance-roster?date=${date}`);
    return response.data;
};

export const saveAttendance = async (data) => {
    const response = await apiClientDepHead.post('/attendance', data);
    return response.data;
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


//😍🎉sosi 🌹😍🎉🎉😍😍