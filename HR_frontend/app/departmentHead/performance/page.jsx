"use client";

import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, MessageSquare, Star, Users, GraduationCap } from "lucide-react";
import Sidebar from "../Sidebar";
import { getPerformanceData, submitPerformanceReview } from "../../../lib/api"; // Adjust path
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

function PerformanceBar({ score }) {
  const scoreValue = Number(score) || 0;
  const color = scoreValue >= 7 ? "bg-emerald-500" : scoreValue >= 4 ? "bg-yellow-500" : "bg-rose-500";
  const progress = Math.min(scoreValue * 10, 100);

  return (
    <div className="w-full">
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ✅ NEW: Reusable component to render a grid of employee cards
const EmployeeGrid = ({ title, employees, performanceReviews, formData, handleInputChange, submitReview, submitting, icon }) => {
    if (!employees || employees.length === 0) return null;

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3 border-b pb-2 dark:border-slate-700">
                {icon} {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {employees.map((emp) => {
                    const review = performanceReviews[emp.id];
                    const score = review?.score ?? 0;

                    return (
                        <div key={emp.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-transparent hover:border-indigo-500 transition-colors">
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{emp.firstName} {emp.lastName}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{emp.role}</p>

                                <div className="my-4 space-y-2">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-slate-600 dark:text-slate-300">Latest Score:</span>
                                        <span className={`font-bold text-lg ${score >= 7 ? 'text-emerald-500' : score >= 4 ? 'text-yellow-500' : 'text-rose-500'}`}>{score || "N/A"} / 10</span>
                                    </div>
                                    <PerformanceBar score={score} />
                                </div>
                                
                                {review ? (
                                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <p className="font-semibold mb-1 flex items-center gap-2"><MessageSquare size={14}/> Latest Feedback:</p> 
                                    <p className="italic">"{review.comments}"</p>
                                    </div>
                                ) : (
                                    <div className="text-sm text-center italic text-slate-400 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                        No feedback has been submitted yet.
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 p-5 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                                <h4 className="font-semibold text-slate-700 dark:text-slate-200">Submit New Review</h4>
                                <div>
                                    <Label htmlFor={`score-${emp.id}`}>Score (1–10)</Label>
                                    <Input id={`score-${emp.id}`} type="number" min="1" max="10" value={formData[emp.id]?.score || ""} onChange={(e) => handleInputChange(emp.id, "score", e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`comments-${emp.id}`}>Feedback / Comments</Label>
                                    <Textarea id={`comments-${emp.id}`} rows={3} value={formData[emp.id]?.comments || ""} onChange={(e) => handleInputChange(emp.id, "comments", e.target.value)} placeholder="Provide constructive feedback..." />
                                </div>
                                <Button onClick={() => submitReview(emp.id)} disabled={submitting[emp.id]} className="w-full">
                                    {submitting[emp.id] ? "Submitting..." : "Submit Review"}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

// ==============================================================================
// MAIN PAGE COMPONENT
// ==============================================================================
export default function PerformancePage() {
  const [department, setDepartment] = useState(null);
  const [staff, setStaff] = useState([]); // ✅ State for staff
  const [interns, setInterns] = useState([]); // ✅ State for interns
  const [performanceReviews, setPerformanceReviews] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPageData = useCallback(async () => {
    try {
      const data = await getPerformanceData();
      if (data) {
        setDepartment(data.department);
        setStaff(data.staff || []); // Set staff list
        setInterns(data.interns || []); // Set intern list
        const reviewsMap = (data.performanceReviews || []).reduce((acc, review) => {
          acc[review.employeeId] = review;
          return acc;
        }, {});
        setPerformanceReviews(reviewsMap);
      } else {
        toast.error("Could not load all page data.");
        setStaff([]);
        setInterns([]);
        setPerformanceReviews({});
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPageData();
  }, [fetchPageData]);

  const handleInputChange = (employeeId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [field]: value },
    }));
  };

  const submitReview = async (employeeId) => {
    const data = formData[employeeId];
    if (!data?.score || !data?.comments) {
      return toast.error("Please enter both a score and feedback.");
    }
    setSubmitting((prev) => ({ ...prev, [employeeId]: true }));
    try {
      const payload = { employeeId, score: parseInt(data.score), comments: data.comments };
      const newReview = await submitPerformanceReview(payload);
      setPerformanceReviews((prev) => ({ ...prev, [employeeId]: newReview }));
      setFormData((prev) => ({ ...prev, [employeeId]: { score: "", comments: "" } }));
      toast.success("Review submitted successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting((prev) => ({ ...prev, [employeeId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoaderCircle className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-8">
        <header>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Performance Review</h1>
            {department && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Reviewing members of the <span className="font-semibold text-indigo-600 dark:text-indigo-400">{department.name}</span>.
                </p>
            )}
        </header>
        
        <EmployeeGrid
            title="Interns"
            icon={<GraduationCap className="w-6 h-6 text-emerald-500" />}
            employees={interns}
            performanceReviews={performanceReviews}
            formData={formData}
            handleInputChange={handleInputChange}
            submitReview={submitReview}
            submitting={submitting}
        />
        {/* ✅ Render the classified grids */}
        <EmployeeGrid
            title="Staff Members"
            icon={<Users className="w-6 h-6 text-blue-500" />}
            employees={staff}
            performanceReviews={performanceReviews}
            formData={formData}
            handleInputChange={handleInputChange}
            submitReview={submitReview}
            submitting={submitting}
        />


        
        {!loading && staff.length === 0 && interns.length === 0 && (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                <p>No staff or interns found in your department.</p>
            </div>
        )}
      </main>
    </div>
  );
}