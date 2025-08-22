// app/(HR)/departments/components/DepartmentCard.jsx
"use client";

import { Building, BookOpen, User, Banknote, Megaphone, ShieldQuestion } from "lucide-react";

// Helper function to get the specific icon for each department
const getDepartmentStyle = (departmentName) => {
    switch (departmentName.toLowerCase()) {
        case 'communication':
            return { icon: <Megaphone className="h-10 w-10 text-rose-500" /> };
        case 'control':
             return { icon: <Building className="h-10 w-10 text-slate-500" /> };
        case 'teaching':
            return { icon: <BookOpen className="h-10 w-10 text-emerald-500" /> };
        // Add other cases for your departments...
        default:
            return { icon: <Building className="h-10 w-10 text-gray-500" /> };
    }
};

export function DepartmentCard({ department, onClick }) {
    // ✅ The data now comes directly from the API, no need for placeholders.
    const totalMembers = department.totalMembers || 0;
    const staffCount = department.staffCount || 0;
    const internCount = department.internCount || 0;

    const style = getDepartmentStyle(department.name);

    return (
        <div 
            onClick={() => onClick(department)} 
            className="w-full max-w-sm mx-auto
                       bg-white dark:bg-slate-800 
                       rounded-2xl shadow-lg 
                       p-8 
                       flex flex-col items-center 
                       border border-transparent hover:border-indigo-500 dark:hover:border-indigo-400
                       transition-all duration-300 ease-in-out 
                       transform hover:-translate-y-1 cursor-pointer"
        >
            {/* The Icon */}
            {style.icon}
            
            {/* Department Name */}
            <h2 className="mt-5 text-2xl font-bold text-slate-800 dark:text-slate-100 text-center">
                {department.name}
            </h2>
            
            {/* Sub-departments List */}
            {department.subDepartments && department.subDepartments.length > 0 && (
                <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400 h-16">
                    {department.subDepartments.map(sub => sub.name).join(' / ')}
                </p>
            )}

            {/* Spacer for consistent height */}
            {(!department.subDepartments || department.subDepartments.length === 0) && (
                <div className="h-16 mt-2"></div>
            )}
            
            {/* ✅ Employee Stats now display the real counts from the database */}
            <div className="mt-6 text-slate-700 dark:text-slate-300 text-center space-y-2 font-semibold">
                <p>Total Members: {department.totalMembers}</p>
                <p>Staff: {department.staffCount}</p>
                <p>Interns: {department.internCount}</p>
            </div>
        </div>
    );
}