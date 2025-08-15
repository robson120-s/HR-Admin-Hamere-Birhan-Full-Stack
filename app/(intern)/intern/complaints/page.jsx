"use client";
import { useState, useEffect } from "react";
import ComplaintsPageSkeleton from "./loading";
import { MailWarning, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function ComplaintsPage() {
  const [employeeId] = useState(null); // e.g., 1 or fetched value
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  // Loading and error states for initial data fetch
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [complainData, setcomplainData] = useState(null);

  // Stub for fetching complaint data (replace with your actual API call)
  const getcomplainData = async () => {
    // Simulate API call delay
    return new Promise((resolve) => setTimeout(() => resolve({}), 500));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getcomplainData();
        setcomplainData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <ComplaintsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const payload = {
        subject,
        description,
        ...(employeeId ? { employeeId } : {}),
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to submit complaint");
      }

      setSubject("");
      setDescription("");
      setStatus({ ok: true, msg: "Complaint submitted. HR will review it." });
    } catch (err) {
      setStatus({ ok: false, msg: err.message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-4">
          <MailWarning className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Submit a Complaint</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your submission is private and sent directly to HR.
            </p>
          </div>
        </div>

        {/* Form with enhanced styling */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border bg-white dark:bg-gray-800 shadow-lg p-6 border-t-4 border-green-600"
        >
          {/* Status Message Area */}
          {status && (
            <div
              className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                status.ok
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
              }`}
            >
              {status.ok ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{status.msg}</span>
            </div>
          )}

          {/* Form Input: Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subject</label>
            <input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Brief title of your complaint"
              required
            />
          </div>

          {/* Form Input: Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Describe the issue with dates, people involved, and any evidence."
              required
            />
          </div>

          {/* Action Button */}
          <div className="flex items-center pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-transparent shadow-sm bg-green-600 text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>