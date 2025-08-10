"use client";

export default function SummaryCard({ title, value, color, onClick }) {
  return (
    <div
      className={`${color} p-4 rounded-xl shadow hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
        {title}
      </h2>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
}