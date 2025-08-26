// /departmentHead/complain/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { MailWarning, Send, Loader2, CheckCircle, AlertCircle, MessageSquare, ShieldCheck, Clock, XCircle, FileWarning, LoaderCircle  } from "lucide-react";
import { submitComplaint, getMyComplaints } from "../../../lib/api"; // Adjust path if needed
import Sidebar from "../Sidebar";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from ".//.//../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Loader } from "../../../components/ui/loader";

// ==============================================================================
// HELPER COMPONENT (for displaying a single complaint in the list)
// ==============================================================================
const ComplaintCard = ({ complaint }) => {
    const statusConfig = {
        open: {
            label: "Open",
            icon: <FileWarning className="text-yellow-500" />,
            borderColor: "border-yellow-500",
            bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
        },
        in_review: {
            label: "In Review",
            icon: <Clock className="text-blue-500" />,
            borderColor: "border-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-900/30",
        },
        resolved: {
            label: "Resolved",
            icon: <ShieldCheck className="text-green-500" />,
            borderColor: "border-green-500",
            bgColor: "bg-green-50 dark:bg-green-900/30",
        },
        rejected: {
            label: "Rejected",
            icon: <XCircle className="text-red-500" />,
            borderColor: "border-red-500",
            bgColor: "bg-red-50 dark:bg-red-900/30",
        },
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
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const [myComplaints, setMyComplaints] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const fetchMyComplaints = useCallback(async () => {
    try {
        const data = await getMyComplaints();
        setMyComplaints(data);
    } catch (error) {
        toast.error(error.message);
    } finally {
        setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchMyComplaints();
  }, [fetchMyComplaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const payload = { subject, description };
      await submitComplaint(payload);

      setSubject("");
      setDescription("");
      setSubmitStatus({ ok: true, msg: "Complaint submitted successfully. HR will review it shortly." });
      // ✅ Automatically refresh the list below after successful submission
      await fetchMyComplaints();
    } catch (err) {
      setSubmitStatus({ ok: false, msg: err.message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
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