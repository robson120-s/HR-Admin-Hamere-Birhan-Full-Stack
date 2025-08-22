// lib/api.js
import axios from "axios";

// Create an instance of axios with a base URL.
// Replace 'http://localhost:5000' with your actual backend server address.
const apiClient = axios.create({
  baseURL: "http://localhost:5555/api/hr", // Adjust the port and base path as needed
  withCredentials: true, // This is crucial for sending cookies (like auth tokens)
});

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
    const response = await apiClient.get("/dashboard");
    return response.data; // Return the JSON data from the response
  } catch (error) {
    // Log the error and re-throw it so the component can handle it
    console.error("Failed to fetch dashboard data:", error.response?.data?.error || error.message);
    throw new Error(error.response?.data?.error || "An unknown error occurred.");
  }
};
// lib/api.js - add these to your file

export const getMeetings = async () => {
  const response = await apiClient.get("/meetings");
  return response.data;
};

export const addMeeting = async (meetingData) => {
  const response = await apiClient.post("/meetings", meetingData);
  return response.data;
};

export const deleteMeeting = async (id) => {
  await apiClient.delete(`/meetings/${id}`);
};
// lib/api.js
export const getEmployeesByRole = async (role) => {
  const response = await apiClient.get(`/employees?role=${role}`);
  return response.data;
};

// In your frontend file: lib/api.js

// ... your existing apiClient and other functions ...

export const getComplaints = async () => {
  try {
    const response = await apiClient.get("/complaints");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch complaints.");
  }
};

export const updateComplaint = async (id, data) => {
  try {
    // data will be an object like { status: 'resolved', response: '...' }
    const response = await apiClient.patch(`/complaints/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not update complaint.");
  }
};export const createEmployee = async (payload) => {
  try {
    const response = await apiClient.post("/employees", payload);
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
    const response = await apiClient.get("/employees");
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
    const response = await apiClient.get(`/employees/${id}`);
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
    const response = await apiClient.patch(`/employees/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not update employee.");
  }
};


// --- LOOKUP API FUNCTIONS (For Dropdowns) ---

export const getRoles = async () => {
    const response = await apiClient.get("/lookup/roles");
    return response.data;
};
export const getDepartmentsLookup = async () => {
    const response = await apiClient.get("/lookup/departments");
    return response.data;
};
export const getPositionsLookup = async () => {
    const response = await apiClient.get("/lookup/positions");
    return response.data;
};
export const getMaritalStatuses = async () => {
    const response = await apiClient.get("/lookup/marital-statuses");
    return response.data;
};
export const getEmploymentTypes = async () => {
    const response = await apiClient.get("/lookup/employment-types");
    return response.data;
};
export const getJobStatuses = async () => {
    const response = await apiClient.get("/lookup/job-statuses");
    return response.data;
};
export const getAgreementStatuses = async () => {
    const response = await apiClient.get("/lookup/agreement-statuses");
    return response.data;
};




export const getTerminations = async () => {
  try {
    const response = await apiClient.get("/terminations");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not fetch terminations.");
  }
};

export const createTermination = async (data) => {
    try {
        const response = await apiClient.post("/terminations", data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not create termination.");
    }
}

export const updateTermination = async (id, data) => {
  try {
    // data will be an object like { status: 'Voluntary', reason: '...' }
    const response = await apiClient.patch(`/terminations/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not update termination.");
  }
};

export const deleteTermination = async (id) => {
    try {
        await apiClient.delete(`/terminations/${id}`);
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not delete termination.");
    }
}

export const getTerminationById = async (id) => {
  try {
    const response = await apiClient.get(`/terminations/${id}`);
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
    const response = await apiClient.get(`/employees/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Could not search for employees.");
  }
};

export const getDepartments = async () => {
    const response = await apiClient.get('/departments');
    return response.data;
};

export const getDepartmentById = async (id) => {
    try {
        const response = await apiClient.get(`/departments/${id}`); // Assumes a GET /departments/:id endpoint exists
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not fetch department details.");
    }
};

export const createDepartment = async (data) => {
    const response = await apiClient.post('/departments', data);
    return response.data;
};

export const updateDepartment = async (id, data) => {
    const response = await apiClient.patch(`/departments/${id}`, data);
    return response.data;
};

export const deleteDepartment = async (id) => {
    await apiClient.delete(`/departments/${id}`);
};

export const getEmployeesByDepartment = async (id) => {
    const response = await apiClient.get(`/departments/${id}/employees`);
    return response.data;
};

//sosi 