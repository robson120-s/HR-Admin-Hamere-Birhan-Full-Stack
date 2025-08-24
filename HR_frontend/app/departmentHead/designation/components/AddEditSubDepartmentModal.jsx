// app/(departmentHead)/designation/components/AddEditSubDepartmentModal.jsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Building } from "lucide-react";
import { Button } from "../../../../components/ui/Button"; // Adjust path to your shared Button
import { Input } from "../../../../components/ui/input";   // Adjust path to your shared Input
import { Textarea } from "../../../../components/ui/textarea"; // Adjust path to your shared Textarea

// A reusable Modal wrapper component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 rounded-2xl shadow-xl bg-white dark:bg-slate-900 border dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

// The main Add/Edit Modal component
export function AddEditSubDepartmentModal({ open, onClose, onSave, department }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect populates the form when a department is passed for editing.
  useEffect(() => {
    if (open) {
      if (department) {
        // "Edit" mode: set state from the passed department object
        setName(department.name);
        setDescription(department.description || '');
      } else {
        // "Add" mode: reset the form
        setName('');
        setDescription('');
      }
    }
  }, [department, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Sub-department name is required.");
    }
    
    setIsSubmitting(true);
    try {
      // The onSave function is passed from the parent page
      // It will handle the actual API call (create or update).
      await onSave({ name, description });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!open) return null;

  const isEditing = !!department;
  const title = isEditing ? "Edit Sub-Department" : "Add New Sub-Department";

  return (
    <Modal onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Frontend Team, QA Team..."
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this team's purpose or designation..."
              rows={4}
            />
          </div>
        </div>

        <footer className="p-4 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Create Sub-Department")}
          </Button>
        </footer>
      </form>
    </Modal>
  );
}