"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Lock, Sun, Moon } from "lucide-react"; // Corrected icon names
// import { Lock, Sun, Moon } from "lucide-react"; // Using lucide-react for icons
import toast from "react-hot-toast"; // Assuming you have react-hot-toast for notifications
import { changePassword } from "../../../lib/api"; // We will create this API function

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState("medium");

  // State for the password form
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handler for form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Frontend validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    try {
      // 2. Call the API
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success(response.message || "Password updated successfully!");
      // Reset form on success
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      // Display error message from the backend
      toast.error(error.message || "Failed to update password.");
    }
  };

  if (!mounted) return null;

  const fontSizeClass = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  }[fontSize];

  return (
    <div className={`max-w-md mx-auto mt-8 p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 transition-all ${fontSizeClass}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">⚙️ Settings</h2>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Change Password Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-gray-500" />
          Change Password
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password (min. 8 characters)"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all hover:scale-105"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Font Size Section */}
      <div className="mt-8">
        <label className="block mb-2 text-gray-700 dark:text-gray-300">Font Size</label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          className="w-full p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
}