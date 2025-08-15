// app/(HR)/terminations/components/AddTerminationModal.jsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { createTermination } from "../../../../lib/api"; // Adjust path if needed

export function AddTerminationModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    terminationType: 'Voluntary',
    terminationDate: '',
    reason: '',
    remarks: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newTermination = await createTermination(formData);
      toast.success("Termination record created successfully!");
      onSuccess(newTermination); // Pass the new record back to the parent page
      onClose(); // Close the modal
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Termination</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium">Employee ID</label>
            <input type="number" id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700" />
          </div>
          <div>
            <label htmlFor="terminationType" className="block text-sm font-medium">Termination Type</label>
            <select id="terminationType" name="terminationType" value={formData.terminationType} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700">
              <option>Voluntary</option>
              <option>Involuntary</option>
              <option>Retirement</option>
            </select>
          </div>
          <div>
            <label htmlFor="terminationDate" className="block text-sm font-medium">Termination Date</label>
            <input type="date" id="terminationDate" name="terminationDate" value={formData.terminationDate} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700" />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium">Reason</label>
            <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700"></textarea>
          </div>
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium">Remarks (Optional)</label>
            <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700"></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
              {isSubmitting ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}