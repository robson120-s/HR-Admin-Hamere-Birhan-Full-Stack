"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Theme icons
function SunIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="orange" width={24} height={24}>
      <circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" />
      <path stroke="orange" strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className = "" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" width={24} height={24}>
      <path
        stroke="purple"
        strokeWidth="2"
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
      />
    </svg>
  );
}

export default function SettingsPanel() {
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState("medium"); // default

  // Theme state
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Local font size classes
  const fontSizeClass = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  }[fontSize];

  return (
    <div
      className={`max-w-md mx-auto mt-8 p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border dark:border-gray-700 transition-all ${fontSizeClass} relative`}
    >
      {/* Theme toggle button at top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        ⚙️ Settings
      </h2>

      {/* Font size */}
      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300">Font Size</label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
}