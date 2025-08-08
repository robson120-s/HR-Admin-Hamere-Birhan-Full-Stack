"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card"
import { Button } from "/components/ui/button"
import { Textarea } from "/components/ui/textarea"
import { Input } from "/components/ui/input"
import { Star, Users, GraduationCap } from "lucide-react"
import Sidebar from "../Sidebar"

export default function EvaluationPage() {
  const [name, setName] = useState("")
  const [type, setType] = useState("staff") // staff or intern
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [evaluations, setEvaluations] = useState([])

  const staffCount = evaluations.filter((e) => e.type === "staff").length
  const internCount = evaluations.filter((e) => e.type === "intern").length

  const handleSubmit = () => {
    if (!name || rating === 0 || !comment) {
      alert("Please fill in all fields")
      return
    }

    const newEvaluation = { name, rating, comment, type }
    setEvaluations([newEvaluation, ...evaluations]) // add new on top

    // Reset
    setName("")
    setRating(0)
    setComment("")
    setType("staff")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="h-screen sticky top-0 bg-white shadow-md z-10">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6 bg-white min-h-screen w-full">
        <h1 className="text-2xl font-bold text-green-700">Staff & Intern Evaluation</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-600 shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-lg font-semibold text-black">Evaluated Staff</p>
                <p className="text-3xl font-bold text-green-700">{staffCount}</p>
              </div>
              <Users className="w-10 h-10 text-green-700" />
            </CardContent>
          </Card>
          <Card className="border-green-600 shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-lg font-semibold text-black">Evaluated Interns</p>
                <p className="text-3xl font-bold text-green-700">{internCount}</p>
              </div>
              <GraduationCap className="w-10 h-10 text-green-700" />
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Form */}
        <Card className="border-green-600 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Evaluate Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1 text-black">Employee Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1 text-black">Role</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border px-3 py-2 rounded-md text-black border-gray-300"
              >
                <option value="staff">Staff</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-black">Rating:</label>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 cursor-pointer ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}`}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1 text-black">Comments</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write comments here..."
              />
            </div>

            <Button onClick={handleSubmit} className="bg-green-700 text-white hover:bg-green-800">
              Submit Evaluation
            </Button>
          </CardContent>
        </Card>

        {/* Stored Evaluations */}
        <div className="space-y-4">
          {evaluations.map((evalItem, index) => (
            <Card key={index} className="border border-gray-300 shadow-sm">
              <CardHeader>
                <CardTitle className="text-green-700">{evalItem.name} ({evalItem.type})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex space-x-1">
                  {[...Array(evalItem.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-800">{evalItem.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
