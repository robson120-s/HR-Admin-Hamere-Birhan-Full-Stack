"use client";

import React, { useEffect, useState } from "react";
import { BadgeCheck, AlertTriangle } from "lucide-react";
import Sidebar from "../Sidebar";

export default function PerformancePage() {
  const [employees, setEmployees] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const department = {
    departmentId: "DPT-001",
    name: "Engineering Department",
    description: "Handles all technical and product development tasks.",
  };

  useEffect(() => {
    const dummyData = Array.from({ length: 10 }, (_, i) => ({
      id: `EMP-${i + 1}`,
      first_name: `Emp${i + 1}`,
      last_name: i < 5 ? "Staff" : "Intern",
      role: i < 5 ? "Staff" : "Intern",
    }));
    setEmployees(dummyData);
    setLoading(false);
  }, []);

  function handleInputChange(employeeId, field, value) {
    setFormData((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      },
    }));
  }

  async function submitReview(employeeId) {
    const data = formData[employeeId];
    if (!data?.score || !data?.feedback) {
      alert("Please enter both score and feedback.");
      return;
    }

    setSubmitting((prev) => ({ ...prev, [employeeId]: true }));

    try {
      await new Promise((res) => setTimeout(res, 800)); // simulate delay
      setPerformanceReviews((prev) => ({
        ...prev,
        [employeeId]: {
          employee_id: employeeId,
          score: parseInt(data.score, 10),
          comments: data.feedback,
        },
      }));
      setFormData((prev) => ({
        ...prev,
        [employeeId]: { score: "", feedback: "" },
      }));
    } catch (err) {
      alert("Error submitting review: " + err.message);
    } finally {
      setSubmitting((prev) => ({ ...prev, [employeeId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Loading Department Info...</h1>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="h-screen sticky top-0 bg-white shadow-md z-10">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6 flex-1 w-full">
        <h1 className="text-3xl font-bold">Department Head Performance Page</h1>

        {/* Department Info */}
        <div className="bg-white p-5 rounded-md shadow-md w-full md:w-1/2">
          <h2 className="text-xl font-semibold">{department.name}</h2>
          <p className="text-gray-600">
            <strong>ID:</strong> {department.departmentId}
          </p>
          <p className="text-gray-600">
            <strong>Description:</strong> {department.description}
          </p>
        </div>

        {/* Employees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => {
            const perf = performanceReviews[emp.id] || {};
            const score = perf.score ?? 0;

            return (
              <div
                key={emp.id}
                className="bg-white rounded-lg shadow-md p-5 border"
              >
                <h3 className="text-lg font-semibold">
                  {emp.first_name} {emp.last_name}
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Role:</strong> {emp.role}
                </p>

                {/* Progress Bar */}
                <div className="mt-2 mb-2">
                  <p className="text-sm text-gray-600">
                    <strong>Score:</strong> {score || "N/A"}
                  </p>
                  <PerformanceBar score={score} />
                </div>

                {/* Feedback */}
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Feedback:</strong>{" "}
                  {perf.comments || "No feedback yet."}
                </p>

                {/* Input Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium">
                      Score (1–10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData[emp.id]?.score || ""}
                      onChange={(e) =>
                        handleInputChange(emp.id, "score", e.target.value)
                      }
                      className="w-full border rounded-md px-2 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Feedback</label>
                    <textarea
                      rows={3}
                      value={formData[emp.id]?.feedback || ""}
                      onChange={(e) =>
                        handleInputChange(emp.id, "feedback", e.target.value)
                      }
                      className="w-full border rounded-md px-2 py-1"
                    />
                  </div>

                  <button
                    onClick={() => submitReview(emp.id)}
                    disabled={submitting[emp.id]}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                  >
                    {submitting[emp.id] ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === COMPONENTS ===

function PerformanceBar({ score }) {
  const color = score >= 7 ? "bg-green-500" : "bg-red-500";
  const progress = Math.min(score * 10, 100);

  return (
    <div className="w-full">
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs mt-1 text-gray-500">{progress}% performance</p>
    </div>
  );
}
