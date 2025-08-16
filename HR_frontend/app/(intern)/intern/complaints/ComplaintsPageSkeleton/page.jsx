"use client";

// It's a good practice to have a separate file for skeleton components
// e.g., components/skeletons/ComplaintsPageSkeleton.tsx

export default function ComplaintsPageSkeleton() {
  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="max-w-2xl mx-auto">
        {/* Skeleton for Header Section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div>
            <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-1.5"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton for the Form */}
        <div className="space-y-6 rounded-2xl border bg-white dark:bg-gray-800 shadow-lg p-6 border-t-4 border-gray-200 dark:border-gray-700">
          {/* Skeleton for Status Message (Optional, can be omitted if not shown on initial load) */}
          {/* <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div> */}

          {/* Skeleton for Subject Input */}
          <div className="space-y-2">
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for Description Textarea */}
          <div className="space-y-2">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton for Action Button */}
          <div className="flex items-center pt-2">
            <div className="h-11 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}