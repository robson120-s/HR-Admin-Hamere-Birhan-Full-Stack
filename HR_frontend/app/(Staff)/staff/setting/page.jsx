// app/(Staff)/staff/settings/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid'; // Still using this for the main title icon
import {
  Moon as MoonIcon, Sun as SunIcon, KeyRound, BellRing, Settings, Loader2
} from 'lucide-react'; // Lucide for theme icons and sections
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'; // Adjust path
import { Input } from '../../../../components/ui/input'; // Adjust path
import { Button } from '../../../../components/ui/button'; // Adjust path
import { Label } from '../../../../components/ui/label'; // Adjust path
import Sidebar from '../Sidebar'; // Adjust path
import toast, { Toaster } from 'react-hot-toast'; // For notifications

import { updateStaffPassword, updateStaffNotificationPreference, fetchEmployeeProfile } from '../../../../lib/api'; // Adjust path

export default function SettingsPage() {
  // TODO: IMPORTANT: Replace this with the actual logged-in employee ID from your authentication context.
  const employeeId = 1; // Placeholder employee ID for demonstration

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [theme, setTheme] = useState("light"); // Local theme state, consider global state for proper theme management
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  const [notifyOnComplaint, setNotifyOnComplaint] = useState(false);
  const [isNotificationUpdating, setIsNotificationUpdating] = useState(false);
  const [initialProfileLoading, setInitialProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);


  // Fetch initial notification settings on component mount
  useEffect(() => {
    const getInitialSettings = async () => {
      setInitialProfileLoading(true);
      setProfileError(null);
      try {
        if (!employeeId) {
          throw new Error('Employee ID not available for fetching initial settings.');
        }
        const profile = await fetchEmployeeProfile(employeeId);
        if (profile?.user?.notifyOnComplaint !== undefined) {
          setNotifyOnComplaint(profile.user.notifyOnComplaint);
        }
      } catch (err) {
        console.error("Error fetching initial profile for settings:", err);
        setProfileError(err.message || "Failed to load initial settings.");
        toast.error(err.message || "Failed to load initial settings.");
      } finally {
        setInitialProfileLoading(false);
      }
    };

    if (employeeId) {
      getInitialSettings();
    }
  }, [employeeId]);


  // Handle theme state with document class for Tailwind
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check initial theme from localStorage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };


  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setIsPasswordUpdating(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!');
      setIsPasswordUpdating(false);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long!');
      setIsPasswordUpdating(false);
      return;
    }

    try {
      if (!employeeId) {
        throw new Error('Employee ID is missing. Cannot change password.');
      }
      await updateStaffPassword(employeeId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  const handleNotificationToggle = async () => {
    setIsNotificationUpdating(true);
    const newPreference = !notifyOnComplaint;
    try {
      if (!employeeId) {
        throw new Error('Employee ID is missing. Cannot update preferences.');
      }
      await updateStaffNotificationPreference(employeeId, newPreference);
      setNotifyOnComplaint(newPreference);
      toast.success('Notification preference updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update notification preference.');
    } finally {
      setIsNotificationUpdating(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Toaster position="top-right" reverseOrder={false} /> {/* Toast notifications */}
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <Settings className="h-8 w-8 text-indigo-500" />
              Settings
            </h1>
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              title="Toggle theme"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <SunIcon className="h-6 w-6 text-yellow-400" />
              ) : (
                <MoonIcon className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Change Password Section */}
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-0">
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <KeyRound size={24} className="text-blue-500" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={isPasswordUpdating} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 mt-4">
                  {isPasswordUpdating ? (
                    <><Loader2 className="animate-spin h-5 w-5 mr-2" />Updating...</>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Preferences Section */}
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-0">
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <BellRing size={24} className="text-pink-500" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {initialProfileLoading ? (
                <div className="text-center py-4 text-gray-600 dark:text-gray-300">
                  <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2" />
                  Loading preferences...
                </div>
              ) : profileError ? (
                <div className="text-red-500 text-center py-4">Error: {profileError}</div>
              ) : (
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnComplaint" className="text-base cursor-pointer">
                    Receive email notifications for complaint updates
                  </Label>
                  <Button
                    type="button"
                    onClick={handleNotificationToggle}
                    disabled={isNotificationUpdating}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
                      ${notifyOnComplaint ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}
                    `}
                    role="switch"
                    aria-checked={notifyOnComplaint}
                  >
                    <span className="sr-only">Toggle complaint notifications</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${notifyOnComplaint ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                    {isNotificationUpdating && (
                      <Loader2 className="absolute inset-0 m-auto animate-spin h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}