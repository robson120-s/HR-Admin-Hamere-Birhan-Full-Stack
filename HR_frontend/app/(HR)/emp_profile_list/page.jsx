"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Building, LoaderCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { EmployeeCard } from "./components/EmployeeCard";
import { CreateEmployeeModal } from "./components/CreateEmployeeModal";
import { getEmployees } from "../../../lib/api";

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prevKey => prevKey + 1);

  useEffect(() => {
    setIsLoading(true);
    getEmployees()
      .then(data => {
        setEmployees(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        toast.error(error.message || "Failed to fetch employees.");
        setEmployees([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [refreshKey]);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    triggerRefresh();
  };

  // ✅ --- THIS IS THE NEW GROUPING LOGIC ---
  const groupedAndFilteredEmployees = useMemo(() => {
    // 1. First, filter the employees based on the search term
    const filtered = employees.filter(emp =>
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Then, group the filtered results into a dictionary-like object
    const grouped = filtered.reduce((acc, employee) => {
      // Use the department name as the key. Fallback for uncategorized employees.
      const departmentName = employee.department?.name || 'Uncategorized';
      if (!acc[departmentName]) {
        acc[departmentName] = []; // If we haven't seen this department yet, create an empty array for it
      }
      acc[departmentName].push(employee); // Add the employee to their department's array
      return acc;
    }, {});

    // 3. Convert the object into an array of { departmentName, employees } for easy rendering
    return Object.entries(grouped).map(([departmentName, employees]) => ({
      departmentName,
      employees,
    }));
  }, [employees, searchTerm]);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Employee Profiles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View, search, and manage all employee profiles in the organization.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Employee
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search by name, position, or department..."
          className="pl-10 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <LoaderCircle className="animate-spin h-10 w-10 text-indigo-500" />
        </div>
      ) : (
        // ✅ --- THIS IS THE NEW RENDER LOGIC ---
        <div className="space-y-8">
          {groupedAndFilteredEmployees.map(({ departmentName, employees }) => (
            <section key={departmentName}>
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3 mb-4 border-b pb-2 dark:border-slate-700">
                <Building size={20} />
                {departmentName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {employees.map(employee => (
                  <EmployeeCard key={employee.id} employee={employee} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {groupedAndFilteredEmployees.length === 0 && !isLoading && (
        <div className="text-center py-20 text-slate-500">
          <p>No employees found matching your search.</p>
        </div>
      )}

      <CreateEmployeeModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreateSuccess}
      />
    </div>
  );
}