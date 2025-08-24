// /departmentHead/settings/page.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Lock, Palette, Bell, Save, KeyRound, UserCog } from "lucide-react";
import { getMyProfile, changePassworddep } from "../../../lib/api"; // Adjust path if needed
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import {AttractiveThemeToggle} from "../components/AttractiveThemeToggle";
import Sidebar from "../Sidebar";

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Placeholder for notification settings
  const [notifications, setNotifications] = useState({
      notifyComplaints: true,
  });

  // Fetch the user's profile to get their current username
  const fetchProfile = useCallback(async () => {
    try {
        const profile = await getMyProfile(); // Assumes you have this API from the profile page
        if (profile && profile.user) {
            setFormData(prev => ({ ...prev, username: profile.user.username }));
        }
    } catch (error) {
        toast.error("Could not fetch user profile information.");
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (formData.newPassword && formData.newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters long.");
    }

    setIsSubmitting(true);
    const passwordPayload = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    };

    try {
      const response = await changePassworddep(passwordPayload);
      toast.success(response.message || "Password updated successfully!");
      // Reset only the password fields on success
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    // Return a skeleton or null to avoid hydration mismatch
    return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900"></div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your account, appearance, and notification preferences.
            </p>
          </header>

          {/* Account Security Card */}
          <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCog className="text-rose-500"/>
                Account Security
              </CardTitle>
              <CardDescription>Update your login credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    // Typically username is not editable, so we can disable it
                    disabled 
                    className="mt-1 cursor-not-allowed"
                  />
                </div>
                
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                   <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                     <KeyRound className="h-4 w-4 text-slate-500" /> Change Password
                   </h4>
                   <div className="space-y-4">
                       <Input
                         type="password"
                         name="currentPassword"
                         placeholder="Current Password"
                         value={formData.currentPassword}
                         onChange={handleChange}
                         required
                       />
                       <Input
                         type="password"
                         name="newPassword"
                         placeholder="New Password (min. 8 characters)"
                         value={formData.newPassword}
                         onChange={handleChange}
                         required
                       />
                       <Input
                         type="password"
                         name="confirmPassword"
                         placeholder="Confirm New Password"
                         value={formData.confirmPassword}
                         onChange={handleChange}
                         required
                       />
                   </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Appearance Card */}
          <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Palette className="text-indigo-500"/>
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <Label className="font-medium text-slate-700 dark:text-slate-200">
                    Theme
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch between light and dark mode.
                  </p>
                </div>
                <AttractiveThemeToggle />
              </div>
            </CardContent>
          </Card>

      
          

        </div>
      </main>
    </div>
  );
}