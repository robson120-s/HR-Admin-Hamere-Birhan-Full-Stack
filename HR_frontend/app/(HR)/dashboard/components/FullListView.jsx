"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
// import { getEmployeesByRole } from "@/lib/api";
import toast from 'react-hot-toast';

export default function FullListView({ listType, onBack }) {
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const title = listType === "staff" ? "Staff List" : "Intern List";

  useEffect(() => {
    if (!listType) return;
    const fetchList = async () => {
      try {
        setIsLoading(true);
        const role = listType === "staff" ? "Staff" : "Intern";
        const data = await getEmployeesByRole(role);
        setList(data);
      } catch (error) {
        toast.error(`Failed to fetch ${listType} list.`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, [listType]); // Refetch if the listType changes

  if (isLoading) {
      return <div className="min-h-screen flex justify-center items-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 relative">
      <ThemeToggle />
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{title}</h1>
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 rounded">
        ← Back to Dashboard
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Department</th>
            </tr>
          </thead>
          <tbody>
            {list.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3">{person.name}</td>
                <td className="p-3">{person.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}