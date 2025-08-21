// app/(HR)/departments/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
// Remove getDepartmentById, we won't need it here for this pattern
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../../lib/api"; 
import { DepartmentCard } from "./components/DepartmentCard";
import { DepartmentDetailView } from "./components/DepartmentDetailView";
import { AddEditDepartmentModal } from "./components/AddEditDepartmentModal";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { Plus, LoaderCircle } from "lucide-react";

import { DepartmentCarousel } from "./components/DepartmentCarousel"; 
import ThemeToggle from "../dashboard/components/ThemeToggle";

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({
        open: false, department: null, parentId: null, parentName: '',
    });

    const fetchDepartments = useCallback(async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
            return data; // ✅ Return the new data
        } catch (error) {
            toast.error("Could not fetch departments.");
            return []; // Return empty array on error
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchDepartments().finally(() => setIsLoading(false));
    }, [fetchDepartments]);

    // ✅ NEW, SIMPLIFIED SAVE HANDLER
    const handleSave = async (data) => {
        // The promise we will show to the user
        const savePromise = data.id 
            ? updateDepartment(data.id, data) 
            : createDepartment(data);

        await toast.promise(
            savePromise,
            {
                loading: 'Saving...',
                success: (savedData) => {
                    // Close the modal immediately on success
                    setModalState({ open: false, department: null, parentId: null, parentName: '' });
                    // Return the success message for the toast
                    return `${data.parentId ? 'Sub-department' : 'Department'} saved successfully!`;
                },
                error: (err) => err.response?.data?.error || "Save operation failed.",
            }
        );

        // ✅ REFETCH AND UPDATE STATE *AFTER* THE SAVE IS COMPLETE
        const freshDepartments = await fetchDepartments();

        // If a department was selected, find its updated version in the new list and set it
        if (selectedDept) {
            const parentId = data.parentId || selectedDept.id;
            const updatedParent = freshDepartments.find(d => d.id === parentId);
            if (updatedParent) {
                setSelectedDept(updatedParent);
            } else {
                // If the parent was deleted or changed, go back to the list view
                setSelectedDept(null);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This action cannot be undone.")) {
            try {
                await deleteDepartment(id);
                toast.success("Department deleted.");
                await fetchDepartments();
                setSelectedDept(null); // Always go back to the list view after deleting
            } catch (error) {
                toast.error(error.response?.data?.error || "Deletion failed.");
            }
        }
    };
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoaderCircle className="animate-spin h-12 w-12 text-indigo-500" />
            </div>
        );
    }
    
    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
            {/* <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
                <ThemeToggle />
            </div> */}

            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center sm:text-left">Departments</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Manage your company's organizational structure.
                    </p>
                </div>
                {!selectedDept && ( // Only show "Add Department" on the main page
                    <Button onClick={() => setModalState({ open: true, department: null, parentId: null, parentName: '' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Department
                    </Button>
                )}
            </header>

            <main>
                {selectedDept ? (
                    <DepartmentDetailView 
                        department={selectedDept} 
                        onBack={() => setSelectedDept(null)}
                        setModalState={setModalState}
                        onDelete={handleDelete}
                    />
                ) : (
                    // ✅ THIS IS THE FIX ✅
                    // A responsive grid that shows 1, 2, or 3 columns depending on screen size.
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {departments.map(dept => (
                            <DepartmentCard key={dept.id} department={dept} onClick={setSelectedDept} />
                        ))}
                    </div>
                )}
            </main>
            
            <AddEditDepartmentModal
                open={modalState.open}
                onClose={() => setModalState({ open: false, department: null, parentId: null, parentName: '' })}
                onSave={handleSave}
                department={modalState.department}
                parentId={modalState.parentId}
                parentName={modalState.parentName}
            />
        </div>
    );
}