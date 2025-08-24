import { apiClientDepHead } from './api'; // Import the new client

// ... your other functions ...

export const getDepHeadDashboard = async () => {
    try {
        const response = await apiClientDepHead.get('/dashboard');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Could not fetch dashboard data.");
    }
}