// /departmentHead/designation/page.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Pencil, Trash2, Plus, X, LoaderCircle } from "lucide-react";
import { getSubDepartments, createSubDepartment, updateSubDepartment, deleteSubDepartment } from "../../../lib/api"; // Adjust path
import Sidebar from "../Sidebar";
import { AddEditSubDepartmentModal } from "./components/AddEditSubDepartmentModal"; // We'll create this

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function DesignationPage() {
  const [subDepartments, setSubDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null); // Tracks the dept being edited

  const fetchSubDepts = useCallback(async () => {
    try {
      const data = await getSubDepartments();
      setSubDepartments(data);
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchSubDepts().finally(() => setIsLoading(false));
  }, [fetchSubDepts]);

  const handleOpenModal = (dept = null) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingDept(null);
  }

  const handleSave = async (formData) => {
    const actionPromise = editingDept
      ? updateSubDepartment(editingDept.id, formData)
      : createSubDepartment(formData);

    await toast.promise(
        actionPromise,
        {
            loading: 'Saving...',
            success: () => {
                handleCloseModal();
                fetchSubDepts(); // Refetch the list to show the new data
                return `Sub-department ${editingDept ? 'updated' : 'created'}!`;
            },
            error: (err) => err.message || `Failed to save sub-department.`
        }
    );
  };
  
  const handleDelete = async (id) => {
      if (window.confirm("Are you sure? This may fail if the department has employees assigned to it.")) {
          const deletePromise = deleteSubDepartment(id);
          await toast.promise(
              deletePromise,
              {
                  loading: 'Deleting...',
                  success: () => {
                      fetchSubDepts(); // Refetch the list
                      return "Sub-department deleted.";
                  },
                  error: (err) => err.message || "Deletion failed."
              }
          );
      }
  };

  if (isLoading) {
    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center">
                <LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" />
            </main>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Manage Sub-Departments</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, edit, or remove teams and designations within your department.</p>
            </div>
            <Button onClick={() => handleOpenModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Sub-Department
            </Button>
        </header>

        <Card className="shadow-lg bg-white dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle>Your Sub-Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="text-left text-sm text-slate-500 dark:text-slate-400">
                    <tr>
                    <th className="p-3">Designation / Team Name</th>
                    <th className="p-3 text-center">Members</th>
                    <th className="p-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
{subDepartments.length > 0 ? (
    subDepartments.map(sub => (
      <tr key={sub.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <td className="p-3">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{sub.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{sub.description}</p>
        </td>
        
        {/* ✅ THIS IS THE FIX ✅ */}
        {/* Display the new, detailed counts from the API */}
        <td className="p-3 text-center text-sm">
            <div className="font-medium text-slate-800 dark:text-slate-100">{sub.totalMembers} Total</div>
            <div className="text-xs text-slate-500">
                ({sub.staffCount} Staff / {sub.internCount} Interns)
            </div>
        </td>
                                <td className="p-3">
                                <div className="flex justify-center gap-3">
                                    <button onClick={() => handleOpenModal(sub)} title="Edit" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(sub.id)} title="Delete" className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="3" className="p-8 text-center text-slate-400">No sub-departments found. Click "Add" to create one.</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </CardContent>
        </Card>

        <AddEditSubDepartmentModal
            open={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            department={editingDept}
        />
      </main>
    </div>
  );
}