"use client";

import React, { useEffect, useState, useCallback, Fragment } from "react";
import Image from 'next/image';
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Pencil, Trash2, Plus, X, LoaderCircle, ChevronDown, User, Star } from "lucide-react";
import { getSubDepartments, createSubDepartment, updateSubDepartment, deleteSubDepartment } from "../../../lib/api"; // Adjust path
import Sidebar from "../Sidebar";
import { AddEditSubDepartmentModal } from "./components/AddEditSubDepartmentModal";
import { Disclosure, Transition } from '@headlessui/react'; // For the accordion

// ==============================================================================
// REUSABLE MEMBER GRID COMPONENT
// ==============================================================================
const MemberGrid = ({ title, members }) => {
    if (!members || members.length === 0) return null;

    return (
        <div className="mt-4">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 border-b pb-1 dark:border-slate-700">{title}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {members.map(member => (
                    <div key={member.id} className="flex items-center gap-2 p-2 rounded-md bg-slate-100 dark:bg-slate-700/50" title={member.name}>
                        <Image src={member.photo || '/images/default-avatar.png'} alt={member.name} width={24} height={24} className="rounded-full object-cover flex-shrink-0"/>
                        <span className="text-xs text-slate-800 dark:text-slate-200 truncate">{member.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function DesignationPage() {
  const [subDepartments, setSubDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

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

    await toast.promise(actionPromise, {
        loading: 'Saving...',
        success: () => {
            handleCloseModal();
            fetchSubDepts();
            return `Sub-department ${editingDept ? 'updated' : 'created'}!`;
        },
        error: (err) => err.message || `Failed to save sub-department.`
    });
  };
  
  const handleDelete = async (id) => {
      if (window.confirm("Are you sure? This action cannot be undone.")) {
          await toast.promise(deleteSubDepartment(id), {
              loading: 'Deleting...',
              success: () => {
                  fetchSubDepts();
                  return "Sub-department deleted.";
              },
              error: (err) => err.message || "Deletion failed."
          });
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
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, edit, or view the teams and designations within your department.</p>
            </div>
            <Button onClick={() => handleOpenModal()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Sub-Department
            </Button>
        </header>

        {/* ✅ REPLACED Table with a dynamic Accordion List */}
        <div className="space-y-4">
            {subDepartments.length > 0 ? (
                subDepartments.map(sub => (
                    <Disclosure as="div" key={sub.id} className="bg-white dark:bg-slate-800/50 shadow-md rounded-lg">
                        {({ open }) => (
                            <>
                                <div className="flex items-center p-4">
                                    <Disclosure.Button className="flex flex-1 items-center justify-between cursor-pointer group">
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{sub.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{sub.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4 ml-4">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sub.totalMembers} Members</span>
                                            <ChevronDown className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-indigo-500 transition-transform group-hover:text-indigo-700`} />
                                        </div>
                                    </Disclosure.Button>
                                    <div className="pl-4 border-l ml-4 dark:border-slate-700 flex gap-2">
                                        <button onClick={() => handleOpenModal(sub)} title="Edit" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(sub.id)} title="Delete" className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"
                                >
                                    <Disclosure.Panel as="div" className="p-4 border-t dark:border-slate-700">
                                        {sub.totalMembers > 0 ? (
                                            <>
                                                <MemberGrid title="Staff" members={sub.staff} />
                                                <MemberGrid title="Interns" members={sub.interns} />
                                            </>
                                        ) : (
                                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No members are assigned to this sub-department.</p>
                                        )}
                                    </Disclosure.Panel>
                                </Transition>
                            </>
                        )}
                    </Disclosure>
                ))
            ) : (
                <Card className="text-center py-16 text-slate-400">No sub-departments found. Click "Add" to create one.</Card>
            )}
        </div>

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