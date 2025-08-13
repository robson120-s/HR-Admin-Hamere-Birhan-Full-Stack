// app/(HR)/complaints/components/ComplaintList.jsx

import { FileWarning, ShieldCheck, Mail, Clock, UserCircle } from "lucide-react";

// ✅ NEW: Enhanced styles for a more modern, badge-like look
const statusStyles = {
  open: {
    icon: <FileWarning size={24} className="text-yellow-600 dark:text-yellow-400" />,
    iconBg: "bg-yellow-100 dark:bg-yellow-900",
    badgeBg: "bg-yellow-200/80 dark:bg-yellow-500/30",
    badgeText: "text-yellow-800 dark:text-yellow-300",
  },
  in_review: {
    icon: <Clock size={24} className="text-blue-600 dark:text-blue-400" />,
    iconBg: "bg-blue-100 dark:bg-blue-900",
    badgeBg: "bg-blue-200/80 dark:bg-blue-500/30",
    badgeText: "text-blue-800 dark:text-blue-300",
  },
  resolved: {
    icon: <ShieldCheck size={24} className="text-green-600 dark:text-green-400" />,
    iconBg: "bg-green-100 dark:bg-green-900",
    badgeBg: "bg-green-200/80 dark:bg-green-500/30",
    badgeText: "text-green-800 dark:text-green-300",
  },
  rejected: {
    icon: <Mail size={24} className="text-red-600 dark:text-red-400" />,
    iconBg: "bg-red-100 dark:bg-red-900",
    badgeBg: "bg-red-200/80 dark:bg-red-500/30",
    badgeText: "text-red-800 dark:text-red-300",
  },
};

export function ComplaintList({ complaints, onViewComplaint }) {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <ShieldCheck size={48} className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold">All Clear!</h3>
        <p>There are no complaints to review at this time.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {complaints.map((complaint) => {
        const style = statusStyles[complaint.status];
        return (
          // ✅ NEW: Redesigned card with flex layout and enhanced hover effects
          <div
            key={complaint.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex items-start gap-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            onClick={() => onViewComplaint(complaint)}
          >
            {/* The new icon badge */}
            <div className={`p-3 rounded-full ${style.iconBg}`}>
              {style.icon}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                {/* The new status pill */}
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style.badgeBg} ${style.badgeText}`}>
                  {complaint.status.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate mb-1" title={complaint.subject}>
                {complaint.subject}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {complaint.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <UserCircle size={16} />
                <span>From: <span className="font-semibold text-gray-700 dark:text-gray-200">{complaint.employee.name}</span></span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}