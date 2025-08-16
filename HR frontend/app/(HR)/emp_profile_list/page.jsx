// app/(HR)/emp_profile_list/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { UserPlus, Sun, Moon, Briefcase, UserCircle, Phone, Mail } from "lucide-react";
import { CreateEmployeeModal } from "./components/CreateEmployeeModal"; // We'll create this
import { getEmployees, createEmployee } from "../../../lib/api"; // Adjust path if needed

// Main Page Component
export default function EmployeeListPage() {
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // ✅ THIS IS THE FIX ✅
      // Fetch the live data from your backend API
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error(error.message || "Could not fetch employee list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEmployeeCreated = (newEmployee) => {
    setEmployees((prev) => [newEmployee, ...prev]);
    toast.success(`${newEmployee.firstName} ${newEmployee.lastName} has been added.`);
    setOpenCreateModal(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-slate-900">
      {/* Page Header */}
      <header className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Employee Profiles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View, manage, and create employee profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <Button onClick={() => setOpenCreateModal(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </header>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500">Loading...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No employees found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateEmployeeModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreated={handleEmployeeCreated}
      />
    </div>
  );
}

// Attractive Employee Card Component
function EmployeeCard({ employee }) {
  const router = useRouter();
  const fullName = `${employee.firstName} ${employee.lastName}`;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg text-center p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      <img
        src={employee.photo || "/images/default-avatar.png"} // Fallback to a default avatar
        alt={fullName}
        className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-slate-200 dark:border-slate-700"
      />
      <h3 className="mt-4 font-bold text-lg text-slate-900 dark:text-slate-100 truncate" title={fullName}>
        {fullName}
      </h3>
      <p className="text-sm text-indigo-500 dark:text-indigo-400 font-semibold">{employee.position?.name || "No Position"}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{employee.department?.name || "No Department"}</p>
      <Button onClick={() => router.push(`/emp_profile_list/${employee.id}`)} className="mt-5">
        View Profile
      </Button>
    </div>
  );
}

// Simple Button component for reuse
function Button({ children, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm
                        hover:bg-indigo-700 transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                        dark:focus:ring-offset-slate-900 ${className}`}
        >
            {children}
        </button>
    )
}