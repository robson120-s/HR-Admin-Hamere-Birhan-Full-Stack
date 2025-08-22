// app/(HR)/departments/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "../../../lib/api";
import { DepartmentCard } from "./components/DepartmentCard";
import { DepartmentDetailView } from "./components/DepartmentDetailView";
import { AddEditDepartmentModal } from "./components/AddEditDepartmentModal";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/Button";
import { Plus, LoaderCircle } from "lucide-react";
import ThemeToggle from "../dashboard/components/ThemeToggle"; // Assuming path is correct

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [selectedDeptData, setSelectedDeptData] = useState(null); // Holds the rich data for the detail view
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false); // A separate loading state for the detail view
    const [modalState, setModalState] = useState({
        open: false,
        department: null,
        parentId: null,
        parentName: '',
    });

    // Function to fetch the main list of departments for the card view
    const fetchDepartments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            toast.error("Could not fetch departments.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // This function is called when a card is clicked
    const handleSelectDepartment = async (department) => {
        setIsDetailLoading(true); // Show a loader for the detail view
        setSelectedDeptData(null); // Clear old data to ensure the view switches
        try {
            // Fetch the FULL, detailed data for the selected department
            const detailedData = await getDepartmentById(department.id);
            setSelectedDeptData(detailedData);
        } catch (error) {
            toast.error("Could not load department details.");
        } finally {
            setIsDetailLoading(false);
        }
    };

    // This function is called from the detail view to go back
    const handleBackToList = () => {
        setSelectedDeptData(null);
    };

    const handleSave = async (data) => {
        const isUpdating = !!data.id;
        const actionPromise = isUpdating
            ? updateDepartment(data.id, data)
            : createDepartment(data);

        await toast.promise(
            actionPromise,
            {
                loading: 'Saving...',
                success: `Department saved successfully!`,
                error: (err) => err.response?.data?.error || "Save operation failed.",
            }
        );
        
        // Close the modal and refetch the main list
        setModalState({ open: false, department: null, parentId: null, parentName: '' });
        await fetchDepartments();
        
        // If we were in a detail view, we need to refresh it to show the new sub-department
        if (selectedDeptData) {
            const idToRefresh = data.parentId || selectedDeptData.id;
            // Re-run the full detail fetch logic for the parent department
            await handleSelectDepartment({ id: idToRefresh });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This action cannot be undone.")) {
            try {
                await deleteDepartment(id);
                toast.success("Department deleted.");
                await fetchDepartments(); // Refetch the main list
                setSelectedDeptData(null); // Always go back to the list view after deleting
            } catch (error) {
                toast.error(error.response?.data?.error || "Deletion failed.");
            }
        }
    };
    
    // --- RENDER LOGIC ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <LoaderCircle className="animate-spin h-12 w-12 text-indigo-500" />
            </div>
        );
    }
    
    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
            <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20">
                <ThemeToggle />
            </div>

            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center sm:text-left">
                        Company Departments
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Manage your company's organizational structure.
                    </p>
                </div>
                {/* Only show "Add Department" on the main list page */}
                {!selectedDeptData && !isDetailLoading && (
                    <div className="flex-shrink-0">
                        <Button onClick={() => setModalState({ open: true, department: null, parentId: null, parentName: '' })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Department
                        </Button>
                    </div>
                )}
            </header>

            <main className="max-w-7xl mx-auto">
                {/* Logic to show either the detail view, its loader, or the main list */}
                {selectedDeptData || isDetailLoading ? (
                    isDetailLoading ? (
                        <div className="flex items-center justify-center p-20">
                            <LoaderCircle className="animate-spin h-10 w-10 text-indigo-500" />
                        </div>
                    ) : (
                        <DepartmentDetailView 
                            department={selectedDeptData} 
                            onBack={handleBackToList}
                            setModalState={setModalState}
                            onDelete={handleDelete}
                        />
                    )
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {departments.map(dept => (
                            <DepartmentCard key={dept.id} department={dept} onClick={handleSelectDepartment} />
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