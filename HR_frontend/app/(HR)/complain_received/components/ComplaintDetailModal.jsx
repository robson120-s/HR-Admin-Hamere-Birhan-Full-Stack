import { useState } from "react";
import { updateComplaint } from "../../../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import { X, UserCircle, Calendar, MessageSquare, Building } from "lucide-react"; // Import the Building icon

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
      onUpdate(); // This will trigger the main page to refetch and close the modal
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{complaint.subject}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </header>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* --- MODIFIED: The grid now includes department info --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="flex items-center gap-3">
              <UserCircle className="text-gray-400" size={20}/>
              <div>
                <span className="text-gray-500 dark:text-gray-400">From:</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{complaint.employee.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20}/>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Submitted On:</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date(complaint.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            {/* --- ADDITION: Display Department and Sub-Department --- */}
            <div className="flex items-center gap-3 md:col-span-2"> {/* Take full width on medium screens */}
              <Building className="text-gray-400" size={20}/>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Department:</span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {complaint.employee.departmentName} / {complaint.employee.subDepartmentName}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              <MessageSquare size={18}/>
              Full Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
              {complaint.description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 border-t dark:border-gray-700 space-y-4 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          {/* Form remains the same */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Update Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600">
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="response" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">HR Response (Optional)</label>
            <textarea id="response" rows={4} value={response} onChange={(e) => setResponse(e.target.value)} className="w-full p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600" placeholder="Provide a detailed response..."></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? "Updating..." : "Update Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}