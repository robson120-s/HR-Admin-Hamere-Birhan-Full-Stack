"use client"

import { useState } from "react"
import { Input } from "/components/ui/input"
import { Button } from "/components/ui/button"
import { Switch } from "/components/ui/switch"
import { Label } from "/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "/components/ui/card"
import { Textarea } from "/components/ui/textarea"
import Sidebar from "../Sidebar"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoAssign: true,
    requireApproval: false,
    notifyComplaints: false,
  })

  const [departmentInfo, setDepartmentInfo] = useState({
    departmentName: "Software Engineering",
    staffCount: 10,
    internCount: 15,
    description: "Manages software-related internships and staff.",
  })

  const [userCredentials, setUserCredentials] = useState({
    username: "dept_head_1",
    password: "",
    confirmPassword: "",
  })

  const handleDepartmentUpdate = () => {
    alert("Department info updated:\n" + JSON.stringify(departmentInfo, null, 2))
  }

  const handleAccountUpdate = () => {
    if (userCredentials.password !== userCredentials.confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    alert("Account updated:\n" + JSON.stringify({ username: userCredentials.username }, null, 2))
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="h-screen sticky top-0 bg-white shadow-md z-10">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6 bg-white dark:bg-black min-h-screen w-full">
        <h1 className="text-2xl font-bold text-green-700 dark:text-green-300">Settings</h1>

        {/* Notification Preference */}
        <div className="flex items-center justify-between max-w-md mb-6">
          <div>
            <Label htmlFor="notifyComplaints" className="text-black dark:text-white font-medium">
              Notify on Complaints
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive an email when interns or staff submit a complaint
            </p>
          </div>
          <Switch
            id="notifyComplaints"
            checked={settings.notifyComplaints}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, notifyComplaints: checked })
            }
          />
        </div>

        {/* Cards side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Info */}
          <Card className="border-green-600 dark:border-green-400 shadow-md">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300">Department Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-black dark:text-white">Department Name</Label>
                <Input
                  value={departmentInfo.departmentName}
                  onChange={(e) =>
                    setDepartmentInfo({ ...departmentInfo, departmentName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black dark:text-white">Number of Staff</Label>
                <Input
                  type="number"
                  value={departmentInfo.staffCount}
                  onChange={(e) =>
                    setDepartmentInfo({ ...departmentInfo, staffCount: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label className="text-black dark:text-white">Number of Interns</Label>
                <Input
                  type="number"
                  value={departmentInfo.internCount}
                  onChange={(e) =>
                    setDepartmentInfo({ ...departmentInfo, internCount: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label className="text-black dark:text-white">Description</Label>
                <Textarea
                  value={departmentInfo.description}
                  onChange={(e) =>
                    setDepartmentInfo({ ...departmentInfo, description: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <Button
                onClick={handleDepartmentUpdate}
                className="mt-2 bg-green-700 hover:bg-green-800 text-white"
              >
                Update Department Info
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-red-600 dark:border-red-400 shadow-md">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-black dark:text-white">Username</Label>
                <Input
                  value={userCredentials.username}
                  onChange={(e) =>
                    setUserCredentials({ ...userCredentials, username: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black dark:text-white">New Password</Label>
                <Input
                  type="password"
                  value={userCredentials.password}
                  onChange={(e) =>
                    setUserCredentials({ ...userCredentials, password: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-black dark:text-white">Confirm Password</Label>
                <Input
                  type="password"
                  value={userCredentials.confirmPassword}
                  onChange={(e) =>
                    setUserCredentials({ ...userCredentials, confirmPassword: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleAccountUpdate}
                className="mt-2 bg-red-700 hover:bg-red-800 text-white"
              >
                Update Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
