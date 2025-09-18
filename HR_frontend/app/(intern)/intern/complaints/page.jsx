// /departmentHead/complain/page.jsx -> Should be named something like /app/(Staff)/staff/complain/page.jsx
// Corrected to reflect typical staff complaints, not depHead.

"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation'; // Import useRouter

import { MailWarning, Send, Loader2, CheckCircle, AlertCircle, MessageSquare, ShieldCheck, Clock, XCircle, FileWarning, LoaderCircle } from "lucide-react";
import { submitComplaints, getMyComplaint } from "../../../../lib/api"; // Adjust path if needed
import Sidebar from "../Sidebar"; // Adjust path to your Sidebar component
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";


// --- Re-using getLoggedInUserInfo from DashboardPage ---
// This function needs to return all relevant user info from localStorage.
const getLoggedInUserInfo = () => {
  const employeeInfoString = localStorage.getItem('employeeInfo');
  if (employeeInfoString) {
    try {
      const userInfo = JSON.parse(employeeInfoString);
      if (userInfo && typeof userInfo.userId === 'number' && userInfo.roles) {
        return {
          userId: userInfo.userId,
          employeeId: userInfo.employeeId || null, // Can be null
          userName: userInfo.userName || userInfo.username || 'User', // Fallback
          roles: userInfo.roles // Should be an array
        };
      }
    } catch (e) {
      console.error("ComplaintsPage: Error parsing 'employeeInfo' from localStorage. Data might be corrupted.", e);
      localStorage.removeItem('employeeInfo'); // Clear corrupted data
      localStorage.removeItem('authToken');
    }
  }
  return null;
};

// ==============================================================================
// HELPER COMPONENT (for displaying a single complaint in the list)
// ==============================================================================
const ComplaintCard = ({ complaint }) => {
    const statusConfig = {
        open: { label: "Open", icon: <FileWarning className="text-yellow-500" />, borderColor: "border-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-900/30", },
        in_review: { label: "In Review", icon: <Clock className="text-blue-500" />, borderColor: "border-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/30", },
        resolved: { label: "Resolved", icon: <ShieldCheck className="text-green-500" />, borderColor: "border-green-500", bgColor: "bg-green-50 dark:bg-green-900/30", },
        rejected: { label: "Rejected", icon: <XCircle className="text-red-500" />, borderColor: "border-red-500", bgColor: "bg-red-50 dark:bg-red-900/30", },
    };

    const currentStatus = statusConfig[complaint.status] || statusConfig.open;

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md border-l-4 ${currentStatus.borderColor}`}>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{complaint.subject}</h3>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        {currentStatus.icon}
                        <span>{currentStatus.label}</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Submitted on: {new Date(complaint.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 whitespace-pre-wrap">{complaint.description}</p>
            </div>
            {complaint.response && (
                <div className={`p-5 border-t dark:border-slate-700 rounded-b-lg ${currentStatus.bgColor}`}>
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <MessageSquare size={16} />
                        HR Response (Updated: {new Date(complaint.updatedAt).toLocaleDateString()})
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">
                        "{complaint.response}"
                    </p>
                </div>
            )}
        </div>
    );
};


// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function ComplaintsPage() {
  const router = useRouter(); // Initialize useRouter

  // State to hold user info
  const [userId, setUserId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null); // This can be null for HR etc.
  const [userRoles, setUserRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const [myComplaints, setMyComplaints] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [pageLoading, setPageLoading] = useState(true); // New state for initial page load

  // FIX 1: Initial authentication check and role-based redirection
  useEffect(() => {
    console.log("ComplaintsPage: Initial authentication check initiated.");
    const userInfo = getLoggedInUserInfo();
    if (userInfo && userInfo.userId) {
      setUserId(userInfo.userId);
      setEmployeeId(userInfo.employeeId);
      setUserRoles(userInfo.roles);
      setIsAuthenticated(true);
      console.log(`ComplaintsPage: User ID (${userInfo.userId}), Roles: ${userInfo.roles.join(', ')}. Employee ID: ${userInfo.employeeId}`);

      // --- Role-based redirection logic ---
      if (userInfo.roles.includes('HR') && !userInfo.roles.includes('Staff')) {
        console.warn("ComplaintsPage: HR user accessing Staff Complaints. Redirecting to HR Dashboard.");
        setPageLoading(false);
        router.push('/hr/dashboard'); // Adjust path to your actual HR dashboard
        return;
      }
      if (userInfo.roles.includes('Department Head') && !userInfo.roles.includes('Staff')) {
          console.warn("ComplaintsPage: Department Head user accessing Staff Complaints. Redirecting to Department Head Dashboard.");
          setPageLoading(false);
          router.push('/dep-head/dashboard'); // Adjust path to your actual Department Head dashboard
          return;
      }
      // Add more role-based redirects here if necessary

      // If it's a Staff user BUT they don't have an associated employeeId
      if (userInfo.roles.includes('Staff') && userInfo.employeeId === null) {
          console.error("ComplaintsPage: Staff user found, but no associated employeeId. Cannot load complaints page.");
          localStorage.removeItem('employeeInfo'); // Clear incomplete session
          localStorage.removeItem('authToken');
          setPageLoading(false);
          router.push('/login'); // Redirect to login, as their staff profile is incomplete/invalid
          return;
      }
      setPageLoading(false); // If no redirection, stop page loading

    } else {
      console.warn("ComplaintsPage: No valid user info found in localStorage. Redirecting to login.");
      setPageLoading(false);
      router.push('/login');
    }
  }, [router]);


  // FIX 2: fetchMyComplaints now takes no employeeId parameter
  const fetchMyComplaints = useCallback(async () => {
    // Only proceed if authenticated and a staff member with employeeId
    if (!isAuthenticated || employeeId === null || !userRoles.includes('Staff')) {
      console.log("ComplaintsPage: Skipping fetchMyComplaints (conditions not met).");
      return;
    }

    setIsLoadingList(true);
    try {
        const data = await getMyComplaint(); // No employeeId parameter here!
        setMyComplaints(data);
    } catch (error) {
        toast.error(error.message);
    } finally {
        setIsLoadingList(false);
    }
  }, [isAuthenticated, employeeId, userRoles]); // Dependencies now include isAuthenticated, employeeId, userRoles

  useEffect(() => {
    // Only fetch if authentication check is done and conditions for staff are met
    if (isAuthenticated && employeeId !== null && userRoles.includes('Staff')) {
      fetchMyComplaints();
    }
  }, [isAuthenticated, employeeId, userRoles, fetchMyComplaints]); // Added dependencies

  // FIX 3: handleSubmit now takes no employeeId parameter for submitComplaints
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    // Re-check conditions before submitting
    if (!isAuthenticated || employeeId === null || !userRoles.includes('Staff')) {
        setSubmitStatus({ ok: false, msg: "Authentication error: Not a valid staff member to submit complaint." });
        setSubmitting(false);
        return;
    }

    try {
      const payload = { subject, description };
      await submitComplaints(payload); // No employeeId parameter here!
      
      setSubject("");
      setDescription("");
      setSubmitStatus({ ok: true, msg: "Complaint submitted successfully. HR will review it shortly." });
      
      await fetchMyComplaints(); // Refresh the list
    } catch (err) {
      setSubmitStatus({ ok: false, msg: err.message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  // Display initial page loading
  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  // If redirected, this component will unmount, so no need for further rendering checks here
  // If not redirected, but not authenticated or not staff with employeeId
  if (!isAuthenticated || employeeId === null || !userRoles.includes('Staff')) {
    // This case should ideally be handled by redirection or pageLoading state
    // But as a fallback, display a generic access denied message
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
            <p className="text-red-500 dark:text-red-400">Access Denied: You do not have permission to view this page.</p>
        </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar /> {/* Adjust Sidebar path if needed */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* --- SECTION 1: SUBMIT COMPLAINT FORM --- */}
            <section>
                <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-lg">
                    <MailWarning className="h-8 w-8 text-rose-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Submit a Complaint</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your submission is private and sent directly to the HR department.
                    </p>
                </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white dark:bg-gray-800 shadow-lg p-6">
                {submitStatus && (
                    <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${submitStatus.ok ? "bg-green-100 text-green-800 dark:bg-green-900/50" : "bg-red-100 text-red-800 dark:bg-red-900/50"}`}>
                    {submitStatus.ok ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{submitStatus.msg}</span>
                    </div>
                )}

                <div>
                    <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                    <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Issue with Monthly Report, Workstation Problem"
                    required
                    className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                    <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Please describe the issue in detail..."
                    required
                    className="mt-1"
                    />
                </div>

                <div className="flex items-center pt-2">
                    <Button type="submit" disabled={submitting} className="bg-rose-600 hover:bg-rose-700">
                    {submitting ? (<><Loader2 className="animate-spin h-5 w-5 mr-2" />Submitting...</>) 
                                : (<><Send size={16} className="mr-2"/>Submit Complaint</>)}
                    </Button>
                </div>
                </form>
            </section>

            {/* --- SECTION 2: MY COMPLAINTS LIST --- */}
            <section>
                <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
                    My Complaint History
                </h2>
                <div className="space-y-6">
                    {isLoadingList ? (
                        <div className="text-center py-10"><LoaderCircle className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></div>
                    ) : myComplaints.length > 0 ? (
                        myComplaints.map(complaint => (
                            <ComplaintCard key={complaint.id} complaint={complaint} />
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-500 dark:text-slate-400 border-2 border-dashed dark:border-slate-700 rounded-lg">
                            <p>You have not submitted any complaints yet.</p>
                        </div>
                    )}
                </div>
            </section>

          </div>
        </main>
    </div>
  );
}