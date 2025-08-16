// app/(HR)/complaints/components/ComplaintList.jsx

import { Hourglass, ClipboardList, ShieldCheck, XCircle, UserCircle } from "lucide-react";

// ✅ NEW: Updated status system with refined colors, labels, and icons.
const statusStyles = {
  pending: {
    label: "Pending Review",
    icon: <Hourglass size={20} />,
    textColor: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-900/50",
    borderColor: "border-amber-500",
    hoverGlow: "hover:shadow-amber-500/20",
  },
  investigating: {
    label: "Investigating",
    icon: <ClipboardList size={20} />,
    textColor: "text-indigo-700 dark:text-indigo-300",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/50",
    borderColor: "border-indigo-500",
    hoverGlow: "hover:shadow-indigo-500/20",
  },
  resolved: {
    label: "Resolved",
    icon: <ShieldCheck size={20} />,
    textColor: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/50",
    borderColor: "border-emerald-500",
    hoverGlow: "hover:shadow-emerald-500/20",
  },
  closed: { // Renamed from 'rejected' for a more neutral tone
    label: "Closed / Rejected",
    icon: <XCircle size={20} />,
    textColor: "text-rose-700 dark:text-rose-300",
    bgColor: "bg-rose-50 dark:bg-rose-900/50",
    borderColor: "border-rose-500",
    hoverGlow: "hover:shadow-rose-500/20",
  },
};

// Map your backend statuses to the new frontend statuses
const mapBackendStatus = (status) => {
    switch(status) {
        case 'open': return 'pending';
        case 'in_review': return 'investigating';
        case 'resolved': return 'resolved';
        case 'rejected': return 'closed';
        default: return 'pending';
    }
}

export function ComplaintList({ complaints, onViewComplaint }) {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        <ShieldCheck size={56} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">All Clear!</h3>
        <p className="mt-2">There are no complaints to review at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {complaints.map((complaint) => {
        // ✅ NEW: Map the backend status to the new frontend style key
        const statusKey = mapBackendStatus(complaint.status);
        const style = statusStyles[statusKey];
        
        // Safety check in case of an unexpected status
        if (!style) return null;

        return (
          // ✅ NEW: Redesigned card with a prominent left border and hover glow effect
          <div
            key={complaint.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col gap-3
                       border-l-4 ${style.borderColor}
                       transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer ${style.hoverGlow}`}
            onClick={() => onViewComplaint(complaint)}
          >
            {/* Card Header: Status and Date */}
            <div className="flex justify-between items-center">
              <div className={`flex items-center gap-2 font-semibold text-sm ${style.textColor}`}>
                {style.icon}
                <span>{style.label}</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {/* Card Body: Subject and Description */}
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate" title={complaint.subject}>
                {complaint.subject}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {complaint.description}
              </p>
            </div>

            {/* Card Footer: Employee Info */}
            <div className="mt-2 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <UserCircle size={18} />
              <span>From: <span className="font-semibold text-gray-700 dark:text-gray-200">{complaint.employee.name}</span></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}