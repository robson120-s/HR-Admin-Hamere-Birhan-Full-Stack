// /settings/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Lock, Palette, Bell, Save, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { changePassword } from "../../../lib/api"; // Adjust path if needed
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { AttractiveThemeToggle } from "../dashboard/components/AttractiveThemeToggle"; // Reusing the attractive toggle

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (formData.newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters long.");
    }

    setIsSubmitting(true);
    try {
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success(response.message || "Password updated successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
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
              <Lock className="text-rose-500"/>
              Account Security
            </CardTitle>
            <CardDescription>Update your login credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-slate-500"/> Change Password
              </h4>
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
              <Button type="submit" disabled={isSubmitting} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Updating..." : "Update Password"}
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

        {/* Notifications Card */}
        {/* <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Bell className="text-blue-500"/>
                    Notifications
                </CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <Label htmlFor="notifyComplaints" className="font-medium text-slate-700 dark:text-slate-200">
                    Notify on New Complaints
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive an email when a new complaint is submitted.
                  </p>
                </div>
                <Switch
                  id="notifyComplaints"
                  // checked={...}
                  // onCheckedChange={...}
                />
              </div>
            </CardContent>
        </Card> */}

      </div>
    </div>
  );
}