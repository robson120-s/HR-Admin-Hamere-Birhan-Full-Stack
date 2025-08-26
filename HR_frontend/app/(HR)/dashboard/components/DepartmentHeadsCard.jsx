"use client";

import { Users, Briefcase, Phone } from "lucide-react";

export default function DepartmentHeadsCard({ heads }) {
  // A safety check in case the heads prop is not passed or is empty
  if (!heads || heads.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full h-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Users className="text-blue-500" /> Department Heads
        </h2>
        <p className="text-sm text-gray-500">No department head information available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <Users className="text-blue-500" /> Department Heads
      </h2>

      {/* List of department heads */}
      <div className="space-y-4">
        {heads.map((head) => (
          <div
            key={head.id}
            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            {/* You could add a user photo here later */}
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-white">
                {head.firstName} {head.lastName}
              </p>
              
              {/* Department Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Briefcase size={14} />
                <span>{head.department?.name || "N/A"}</span>
              </div>
              
              {/* Phone Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Phone size={14} />
                <span>{head.phone || "No phone number"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}