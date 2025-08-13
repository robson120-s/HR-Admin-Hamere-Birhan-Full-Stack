// app/(HR)/complaints/components/ComplaintList.jsx
import { FileWarning, ShieldCheck, Mail, Clock } from "lucide-react";

const statusStyles = {
  open: {
    icon: <FileWarning className="text-yellow-500" />,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
    textColor: "text-yellow-600 dark:text-yellow-400",
    borderColor: "border-yellow-300 dark:border-yellow-700",
  },
  in_review: {
    icon: <Clock className="text-blue-500" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-300 dark:border-blue-700",
  },
  resolved: {
    icon: <ShieldCheck className="text-green-500" />,
    bgColor: "bg-green-100 dark:bg-green-900/50",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-300 dark:border-green-700",
  },
  rejected: {
    icon: <Mail className="text-red-500" />,
    bgColor: "bg-red-100 dark:bg-red-900/50",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-300 dark:border-red-700",
  },
};

export function ComplaintList({ complaints, onViewComplaint }) {
  if (complaints.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <ShieldCheck size={48} className="mx-auto mb-4" />
        <h3 className="text-xl">All Clear!</h3>
        <p>There are no complaints to review at this time.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {complaints.map((complaint) => {
        const style = statusStyles[complaint.status];
        return (
          <div
            key={complaint.id}
            className={`p-5 rounded-lg shadow-md border-l-4 transition-transform hover:scale-105 cursor-pointer ${style.bgColor} ${style.borderColor}`}
            onClick={() => onViewComplaint(complaint)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style.bgColor} ${style.textColor}`}>
                {complaint.status.replace("_", " ").toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate mb-1">
              {complaint.subject}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {complaint.description}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                From: <span className="font-medium text-gray-700 dark:text-gray-200">{complaint.employee.name}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}