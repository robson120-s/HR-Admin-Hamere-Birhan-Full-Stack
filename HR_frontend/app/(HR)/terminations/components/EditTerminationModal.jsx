// app/(HR)/terminations/components/EditTerminationModal.jsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Loader } from "lucide-react";
import { getTerminationById, updateTermination } from "../../../../lib/api"; // Adjust path if needed

export function EditTerminationModal({ terminationId, open, onClose, onSuccess }) {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch data only when the modal is opened with a valid ID
    if (open && terminationId) {
      setIsLoading(true);
      const fetchTermination = async () => {
        try {
          const data = await getTerminationById(terminationId);
          
          // 1. Format the date correctly for the <input type="date"> field
          if (data.terminationDate) {
            data.terminationDate = new Date(data.terminationDate).toISOString().split('T')[0];
          }

          // 2. Map the backend status (e.g., 'voluntary') to the frontend display value (e.g., 'Voluntary')
          const statusMap = { 
            'voluntary': 'Voluntary', 
            'involuntary': 'Involuntary', 
            'retired': 'Retirement' 
          };
          data.terminationType = statusMap[data.status] || 'Voluntary'; // Set the new 'terminationType' field for the form

          setFormData(data);
        } catch (error) {
          toast.error(error.message);
          onClose(); // Close modal on fetch error
        } finally {
          setIsLoading(false);
        }
      };
      fetchTermination();
    }
  }, [open, terminationId, onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 3. Map the user-friendly type from the form back to the backend enum value before sending
      const statusMap = { 
        'Voluntary': 'voluntary', 
        'Involuntary': 'involuntary', 
        'Retirement': 'retired' 
      };
      const payload = {
          reason: formData.reason,
          terminationDate: formData.terminationDate,
          status: statusMap[formData.terminationType], // Use the correct form field name 'terminationType'
      };
      
      const updatedTermination = await updateTermination(terminationId, payload);
      toast.success("Record updated successfully!");
      onSuccess(updatedTermination); // Pass the updated record back to the parent page
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Termination Record</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </header>

        {isLoading ? (
            <div className="p-16 flex items-center justify-center">
                <Loader className="animate-spin text-indigo-500" />
            </div>
        ) : formData && ( // Add a check for formData to prevent rendering errors
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Employee</label>
              <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                  {`${formData.employee?.firstName || ''} ${formData.employee?.lastName || ''}`}
              </p>
            </div>
            
            <div>
              <label htmlFor="terminationType" className="block text-sm font-medium">Termination Type</label>
              <select 
                id="terminationType" 
                name="terminationType" 
                value={formData.terminationType} 
                onChange={handleChange} 
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option>Voluntary</option>
                <option>Involuntary</option>
                <option>Retirement</option>
              </select>
            </div>

            <div>
              <label htmlFor="terminationDate" className="block text-sm font-medium">Termination Date</label>
              <input 
                type="date" 
                id="terminationDate" 
                name="terminationDate" 
                value={formData.terminationDate} 
                onChange={handleChange} 
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium">Reason</label>
              <textarea 
                id="reason" 
                name="reason" 
                value={formData.reason || ''} // Handle null values gracefully
                onChange={handleChange} 
                rows={3} 
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}