// app/(HR)/departments/components/AddEditDepartmentModal.jsx
"use client";

import { useState, useEffect } from "react";
import { X, Building } from "lucide-react";
import { Button } from "../../../../components/ui/Button"; // Assuming a shared Button component
import { Input } from "../../../../components/ui/input";   // Assuming a shared Input component
import { Textarea } from "../../../../components/ui/textarea"; // Assuming a shared Textarea component

export function AddEditDepartmentModal({ open, onClose, onSave, department, parentId = null, parentName = '' }) {
  // State for the form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to populate the form when editing
  useEffect(() => {
    if (open) {
      if (department) {
        // We are in "Edit" mode
        setName(department.name);
        setDescription(department.description || '');
      } else {
        // We are in "Add" mode, reset the form
        setName('');
        setDescription('');
      }
    }
  }, [department, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      // Basic validation
      alert("Department name is required.");
      return;
    }
    
    setIsSubmitting(true);
    // The onSave function is passed from the parent page and will handle the API call
    await onSave({
      id: department?.id, // Will be undefined when adding
      name,
      description,
      parentId, // Will be null for top-level, or an ID for sub-departments
    });
    setIsSubmitting(false);
  };
  
  // Don't render the modal if it's not open
  if (!open) return null;

  // Dynamically determine the title and description based on the props
  const isEditing = !!department;
  const isSubDepartment = !!parentId;
  const entityType = isSubDepartment ? 'Sub-Department' : 'Department';
  const title = isEditing ? `Edit ${entityType}` : `Add New ${entityType}`;

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      {/* Modal Content */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md">
        <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-md">
                <Building className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Display parent department info when adding a sub-department */}
            {isSubDepartment && !isEditing && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md text-sm">
                    Adding a sub-department to: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{parentName}</span>
                </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {entityType} Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${entityType.toLowerCase()} name`}
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
                placeholder="What is the purpose of this department?"
                rows={4}
              />
            </div>
          </div>

          <footer className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
            <Button type="button" onClick={onClose} className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : `Create ${entityType}`)}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}