"use client"

import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card"
import { Button } from "/components/ui/button"
import { Textarea } from "/components/ui/textarea"
import { MessageCircle, Reply } from "lucide-react"

const dummyComplaints = [
  {
    id: 1,
    name: "Sarah Mekonnen",
    subject: "Workload Issue",
    description: "Too much work assigned beyond working hours.",
    status: "open",
  },
]

export default function ComplaintsPage() {
  return (
    <div className="p-6 space-y-6 bg-white dark:bg-black min-h-screen">
      <h1 className="text-2xl font-bold text-red-700 dark:text-red-400">Complaints & Responses</h1>

      {dummyComplaints.map((comp) => (
        <Card key={comp.id} className="border-red-600 dark:border-red-400 shadow-md">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {comp.subject}
            </CardTitle>
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-sm rounded">{comp.status}</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-black dark:text-white">{comp.description}</p>
            <Textarea placeholder="Write your response..." />
            <Button className="bg-red-700 hover:bg-red-800 text-white flex gap-2 items-center">
              <Reply className="w-4 h-4" /> Send Response
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
