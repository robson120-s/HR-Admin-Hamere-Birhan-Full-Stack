"use client";
import React, { useState, useEffect } from "react";
import { FiDollarSign, FiCheckCircle, FiXCircle, FiUsers, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { useTheme } from "next-themes";

// Helper components for theme toggle icons
function SunIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="orange" width={24} height={24}>
      <circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" />
      <path stroke="orange" strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" width={24} height={24}>
      <path stroke="purple" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
  );
}

export default function PaymentStatusPage() {
  const [employees, setEmployees] = useState([]);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    // Mock data for Engineering Department
    const mockEmployees = [
      { id: 1, name: "Ethan Mitchell", status: "paid" },
      { id: 2, name: "Sarah Johnson", status: "unpaid" },
      { id: 3, name: "Michael Brown", status: "paid" },
      { id: 4, name: "Emily Davis", status: "paid" },
      { id: 5, name: "David Wilson", status: "unpaid" },
      { id: 6, name: "Jessica Lee", status: "paid" },
      { id: 7, name: "Robert Taylor", status: "paid" },
      { id: 8, name: "Amanda Garcia", status: "paid" },
      { id: 9, name: "Christopher Martinez", status: "unpaid" },
      { id: 10, name: "Lisa Anderson", status: "paid" },
      { id: 11, name: "James Thompson", status: "paid" },
      { id: 12, name: "Maria Rodriguez", status: "paid" },
      { id: 13, name: "Daniel Lewis", status: "paid" },
      { id: 14, name: "Jennifer White", status: "paid" },
      { id: 15, name: "Kevin Hall", status: "unpaid" },
    ];

    setTimeout(() => setEmployees(mockEmployees), 500);
  }, []);

  if (!mounted) return <div className="p-6">Loading...</div>;

  const totalEmployees = employees.length;
  const paidEmployees = employees.filter(emp => emp.status === "paid").length;
  const unpaidEmployees = employees.filter(emp => emp.status === "unpaid").length;

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
          <FiDollarSign className="mr-3 text-purple-600" />
          Employee Payment Status – Engineering Department
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          A view-only report of the payment status for all employees in your department.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalEmployees}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{paidEmployees}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unpaid</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{unpaidEmployees}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <FiTrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Employee Payment Status</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {employees.map((employee, index) => (
                <tr key={employee.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {employee.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.status === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {employee.status === 'paid' ? (
                        <>
                          <FiCheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-3 h-3 mr-1" />
                          Unpaid
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
            <span className="font-medium">Summary:</span> {paidEmployees} paid, {unpaidEmployees} unpaid out of {totalEmployees} total employees
          </div>
          <div className="flex space-x-2">
            <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
              <FiCheckCircle className="w-4 h-4 mr-1" />
              {totalEmployees > 0 ? Math.round((paidEmployees / totalEmployees) * 100) : 0}% Paid
            </span>
            <span className="inline-flex items-center text-sm text-red-600 dark:text-red-400">
              <FiXCircle className="w-4 h-4 mr-1" />
              {totalEmployees > 0 ? Math.round((unpaidEmployees / totalEmployees) * 100) : 0}% Unpaid
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}