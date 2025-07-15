"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("text-base");
  const [mounted, setMounted] = useState(false);

  // On mount, load saved preferences from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const savedDarkMode = localStorage.getItem("darkMode");
      const savedFontSize = localStorage.getItem("fontSize");
      if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");
      if (savedFontSize) setFontSize(savedFontSize);
    } catch (e) {
      // localStorage might be unavailable; fail silently
    }
  }, []);

  // Update body class and save darkMode to localStorage on change
  useEffect(() => {
    if (mounted && typeof document !== "undefined" && document.body) {
      document.body.className = darkMode ? "dark" : "";
      try {
        localStorage.setItem("darkMode", darkMode.toString());
      } catch {}
    }
  }, [darkMode, mounted]);

  // Save fontSize preference to localStorage on change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("fontSize", fontSize);
      } catch {}
    }
  }, [fontSize, mounted]);

  if (!mounted) {
    return null; // Prevent hydration mismatch by rendering nothing on server
  }

  return (
    <div className={`max-w-3xl mx-auto p-6 ${fontSize}`}>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Settings</h1>

        <div className="flex items-center justify-between mb-6">
          <span className="dark:text-gray-200">Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-800" />
            )}
          </button>
        </div>

        <div className="mb-4">
          <span className="dark:text-gray-200 block mb-2">Font Size</span>
          <div className="flex space-x-2">
            {["text-sm", "text-base", "text-lg"].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 ${
                  fontSize === size ? "font-bold underline" : ""
                }`}
              >
                {size === "text-sm"
                  ? "Small"
                  : size === "text-base"
                  ? "Medium"
                  : "Large"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
