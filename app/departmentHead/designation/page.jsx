"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "/components/ui/card"

export default function DepartmentHeadPage() {
  // Placeholder data
  const [departmentHeadInfo] = useState({
    name: "John Doe",
    designation: "Senior Department Head",
    department: "Engineering",
    subDepartment: "Software Development",
  })

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-6">
        Department Head Overview
      </h1>

      {/* Info Card */}
      <Card className="border-green-500 shadow-lg max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-black dark:text-white">
            Department Head Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium w-40 text-gray-700 dark:text-gray-300">
              Name:
            </span>
            <span className="text-green-600 font-semibold">
              {departmentHeadInfo.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-40 text-gray-700 dark:text-gray-300">
              Designation:
            </span>
            <span className="text-green-600 font-semibold">
              {departmentHeadInfo.designation}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-40 text-gray-700 dark:text-gray-300">
              Department:
            </span>
            <span className="text-green-600 font-semibold">
              {departmentHeadInfo.department}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-40 text-gray-700 dark:text-gray-300">
              Sub-Department:
            </span>
            <span className="text-green-600 font-semibold">
              {departmentHeadInfo.subDepartment}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
