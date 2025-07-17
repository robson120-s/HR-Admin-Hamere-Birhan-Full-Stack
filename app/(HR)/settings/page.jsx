"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState("medium"); // default

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
      className={`max-w-md mx-auto mt-8 p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border dark:border-gray-700 transition-all ${fontSizeClass}`}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        ⚙️ Settings
      </h2>

      {/* Theme toggle */}
      <div className="mb-4">
        <label className="block mb-1 text-gray-700 dark:text-gray-300">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

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
