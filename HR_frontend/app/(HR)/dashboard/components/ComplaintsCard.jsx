"use client";

// --- CHANGE 1: Import the Link component from next/link ---
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ComplaintsCard({ complaints }) {
  // --- CHANGE 2: Wrap the entire component in the <Link> component ---
  // The 'href' prop tells Next.js where to navigate when clicked.
  return (
    <Link href="/complain_received" className="block cursor-pointer">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full h-full transition-all hover:shadow-xl hover:-translate-y-1">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <AlertCircle className="text-red-500" /> Complaints Received
        </h2>

        <div className="space-y-3">
          {complaints.map((complaint) => (
            // --- CHANGE 3: Removed interactive styles from individual items ---
            // The whole card is now the link, so individual items don't need to look clickable.
            <div
              key={complaint.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                complaint.unread
                  ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"
                  : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
              }`}
            >
              <AlertCircle
                className={`mt-1 flex-shrink-0 ${
                  complaint.unread ? "text-red-500" : "text-gray-400"
                }`}
                size={20}
              />
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    complaint.unread
                      ? "font-semibold text-gray-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {complaint.text}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {complaint.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}