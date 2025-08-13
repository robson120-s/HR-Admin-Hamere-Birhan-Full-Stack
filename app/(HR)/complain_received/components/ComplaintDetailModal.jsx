// app/(HR)/complaints/components/ComplaintDetailModal.jsx
import { useState } from "react";
import { updateComplaint } from "../../../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import { X } from "lucide-react";

export function ComplaintDetailModal({ complaint, onClose, onUpdate }) {
  const [status, setStatus] = useState(complaint.status);
  const [response, setResponse] = useState(complaint.response || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateComplaint(complaint.id, { status, response });
      toast.success("Complaint updated successfully!");
      onUpdate(); // Refetch the list on the main page
      onClose(); // Close the modal
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Complaint Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </header>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold">Subject:</h3>
            <p className="text-gray-700 dark:text-gray-300">{complaint.subject}</p>
          </div>
          <div>
            <h3 className="font-semibold">From:</h3>
            <p className="text-gray-700 dark:text-gray-300">{complaint.employee.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Submitted On:</h3>
            <p className="text-gray-700 dark:text-gray-300">{new Date(complaint.createdAt).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
            <h3 className="font-semibold">Description:</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{complaint.description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 border-t dark:border-gray-700 space-y-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Update Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">HR Response (Optional)</label>
            <textarea
              id="response"
              rows={4}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Provide a detailed response to the employee..."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Updating..." : "Update Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}