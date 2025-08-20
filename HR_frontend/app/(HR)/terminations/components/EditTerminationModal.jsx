// app/(HR)/terminations/components/EditTerminationModal.jsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Loader } from "lucide-react";
// We need two new API functions
import { getTerminationById, updateTermination } from "../../../../lib/api";

export function EditTerminationModal({ terminationId, open, onClose, onSuccess }) {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && terminationId) {
      setIsLoading(true);
      const fetchTermination = async () => {
        try {
          const data = await getTerminationById(terminationId);
          // Format the date for the input[type=date] field
          data.terminationDate = new Date(data.terminationDate).toISOString().split('T')[0];
          setFormData(data);
        } catch (error) {
          toast.error(error.message);
          onClose();
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
      // Map the user-friendly type back to the enum
      const statusMap = { 'Voluntary': 'voluntary', 'Involuntary': 'involuntary', 'Retirement': 'retired' };
      const payload = {
          ...formData,
          status: statusMap[formData.terminationType] || formData.status
      }
      const updated = await updateTermination(terminationId, payload);
      toast.success("Record updated successfully!");
      onSuccess(updated);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Termination Record</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
        </header>

        {isLoading ? (
            <div className="p-10 text-center"><Loader className="animate-spin mx-auto" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium">Employee</label>
              <p className="font-semibold text-lg">{`${formData.employee.firstName} ${formData.employee.lastName}`}</p>
            </div>
            {/* The rest of the form is the same as AddTerminationModal */}
            <div>
              <label htmlFor="terminationType">Termination Type</label>
              <select name="terminationType" value={formData.terminationType} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md">
                <option>Voluntary</option>
                <option>Involuntary</option>
                <option>Retirement</option>
              </select>
            </div>
            <div>
              <label htmlFor="terminationDate">Termination Date</label>
              <input type="date" name="terminationDate" value={formData.terminationDate} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="reason">Reason</label>
              <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}