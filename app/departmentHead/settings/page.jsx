// app/(DepHead)/settings/page.jsx
"use client";

import { useState, useEffect } from "react";
// ... other imports
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import Sidebar from "../Sidebar";
import { UserCog, Bell, Save, KeyRound } from 'lucide-react';
import toast from "react-hot-toast";
import { changePassword } from "../../../lib/api"; // Assuming you have this API function

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifyComplaints: true,
  });

  // ✅ 1. ADD 'currentPassword' TO THE STATE
  const [userCredentials, setUserCredentials] = useState({
    username: "dept_head_1",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // This handler already works for the new input, no changes needed
  const handleChange = (e) => {
    setUserCredentials({ ...userCredentials, [e.target.name]: e.target.value });
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    if (userCredentials.newPassword && userCredentials.newPassword !== userCredentials.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    try {
      // ✅ 2. SEND ALL THREE PASSWORDS TO THE API
      await changePassword({
        currentPassword: userCredentials.currentPassword,
        newPassword: userCredentials.newPassword,
      });
      toast.success("Password updated successfully!");
      // Reset all password fields on success
      setUserCredentials({
        ...userCredentials,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to update password.");
    }
  };

  // ... rest of the component (return statement) ...
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <aside className="h-screen sticky top-0"><Sidebar /></aside>
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your account and notification preferences.
            </p>
          </header>

          <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50">
                  <UserCog className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your username and password.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountUpdate} className="space-y-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username" // Add name for consistency
                    value={userCredentials.username}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                   <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                     <KeyRound className="h-4 w-4 text-slate-500" /> Change Password
                   </h4>
                   <div className="space-y-4">
                      {/* ✅ 3. ADD THE 'Current Password' INPUT FIELD */}
                       <Input
                         type="password"
                         name="currentPassword"
                         placeholder="Current Password"
                         value={userCredentials.currentPassword}
                         onChange={handleChange}
                         required // Make it required
                       />
                       <Input
                         type="password"
                         name="newPassword"
                         placeholder="New Password"
                         value={userCredentials.newPassword}
                         onChange={handleChange}
                         required
                       />
                       <Input
                         type="password"
                         name="confirmPassword"
                         placeholder="Confirm New Password"
                         value={userCredentials.confirmPassword}
                         onChange={handleChange}
                         required
                       />
                   </div>
                </div>
                <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Update Account
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Notification Preferences Card remains unchanged */}
        </div>
      </main>
    </div>
  );
}