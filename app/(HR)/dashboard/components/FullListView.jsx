"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle"; // Re-using the theme toggle here

export default function FullListView({ listType, list, onBack }) {
  const [showAll, setShowAll] = useState(false);

  const title = listType === "staff" ? "Staff List" : "Intern List";
  const displayList = showAll ? list : list.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors relative">
      <ThemeToggle />

      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {title}
      </h1>

      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 transition-colors">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                Name
              </th>
              <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                Department
              </th>
            </tr>
          </thead>
          <tbody>
            {displayList.map((person, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-3 text-gray-800 dark:text-gray-100 font-medium">
                  {person.name}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-200">
                  {person.department}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* See more/less button */}
        {list.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAll ? "Show Less" : "Show All"}
          </button>
        )}
      </div>
    </div>
  );
}