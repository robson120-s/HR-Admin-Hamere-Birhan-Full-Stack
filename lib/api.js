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
};

//sosi