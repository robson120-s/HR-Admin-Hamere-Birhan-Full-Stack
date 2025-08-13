// app/(HR)/complaints/page.jsx
"use client";

import { useState, useEffect } from "react";
import { getComplaints } from "../../../lib/api"; // Adjust path if needed
import { ComplaintList } from "./components/ComplaintList";
import { ComplaintDetailModal } from "./components/ComplaintDetailModal";
import toast from "react-hot-toast";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch or refetch complaints
  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // When a complaint is updated in the modal, refetch the list
  const handleComplaintUpdate = () => {
    fetchComplaints();
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading complaints...</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Complaint Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review and resolve employee complaints.</p>
      </header>

      <ComplaintList
        complaints={complaints}
        onViewComplaint={(complaint) => setSelectedComplaint(complaint)}
      />

      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={handleComplaintUpdate}
        />
      )}
    </div>
  );
}