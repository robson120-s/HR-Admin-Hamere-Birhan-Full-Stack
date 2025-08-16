"use client"

import { BadgeDollarSign, Users, LineChart, UserCheck, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card"
import { Button } from "/components/ui/button"

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-black p-6 space-y-8">
      <div className="flex flex-wrap justify-between items-center">
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">Super Admin Dashboard</h1>
        <div className="space-x-3">
          <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white">
            Manage Departments
          </Button>
          <Button variant="outline" className="border-green-600 text-green-600 dark:text-green-300 dark:border-green-300">
            View Reports
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border border-green-600 shadow-md dark:bg-black dark:border-green-400">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-700 dark:text-green-300">Total Users</CardTitle>
            <Users className="w-6 h-6 text-green-700 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-black dark:text-white">2,450</p>
          </CardContent>
        </Card>

        <Card className="border border-green-600 shadow-md dark:bg-black dark:border-green-400">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-700 dark:text-green-300">Interviews</CardTitle>
            <UserCheck className="w-6 h-6 text-green-700 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-black dark:text-white">325</p>
          </CardContent>
        </Card>

        <Card className="border border-green-600 shadow-md dark:bg-black dark:border-green-400">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-700 dark:text-green-300">Performance Reports</CardTitle>
            <LineChart className="w-6 h-6 text-green-700 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-black dark:text-white">1,200</p>
          </CardContent>
        </Card>

        <Card className="border border-red-600 shadow-md dark:bg-black dark:border-red-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-red-700 dark:text-red-400">Pending Salaries</CardTitle>
            <BadgeDollarSign className="w-6 h-6 text-red-700 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-black dark:text-white">15</p>
            <Button variant="default" className="mt-3 bg-red-600 hover:bg-red-700 text-white">
              Approve Salaries
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-green-600 shadow-md dark:bg-black dark:border-green-400">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-green-700 dark:text-green-300">Department Control</CardTitle>
            <Settings className="w-6 h-6 text-green-700 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <p className="text-lg text-black dark:text-white">Access to all departments</p>
            <Button variant="outline" className="mt-3 border-green-600 text-green-700 dark:text-green-300 dark:border-green-300">
              Control Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}