"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Icons can be defined here or imported
const SunIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="orange" width={24} height={24}><circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" /><path stroke="orange" strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
);
const MoonIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" width={24} height={24}><path stroke="purple" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
);

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-[120px] h-[40px]" />; // Placeholder to prevent layout shift
  }

  return (
    <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        <span className="text-gray-700 dark:text-gray-200 hidden sm:inline">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      </button>
    </div>
  );
}