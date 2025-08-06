"use client";
import { useState } from "react";

export default function ComplaintsPage() {
  // If you can fetch the logged-in employeeId from your session/client,
  // set it here (or remove this state and handle in the API).
  const [employeeId] = useState(null); // e.g., 1 or fetched value

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const payload = {
        subject,
        description,
        ...(employeeId ? { employeeId } : {}), // include only if you have it
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to submit complaint");
      }

      setSubject("");
      setDescription("");
      setStatus({ ok: true, msg: "Complaint submitted. HR will review it." });
    } catch (err) {
      setStatus({ ok: false, msg: err.message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Submit a Complaint</h1>
      <p className="text-sm text-gray-500 mb-4">
        Your submission is private. Only HR can access complaint details.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border bg-white shadow-sm p-4"
      >
        {/* If you must show employeeId (usually you shouldn't), uncomment this:
        <input type="hidden" value={employeeId ?? ""} />
        */}

        <div>
          <label className="block text-sm mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Brief title"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Describe the issue with dates, people involved, and any evidence."
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-xl border shadow-sm bg-black text-white disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>

          {status && (
            <span className={`text-sm ${status.ok ? "text-green-600" : "text-red-600"}`}>
              {status.msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
