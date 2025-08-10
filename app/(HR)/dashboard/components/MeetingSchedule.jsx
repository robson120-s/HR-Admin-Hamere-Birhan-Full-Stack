"use client";

import { useState } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";

// This self-contained component manages the entire meeting schedule section.
export default function MeetingSchedule({ initialMeetings }) {
  const [meetings, setMeetings] = useState(initialMeetings || []);
  const [showForm, setShowForm] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
  });

  // Handle form input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add meeting from form data
  const addMeeting = (e) => {
    e.preventDefault();
    const { title, date, time } = formData;

    if (!title.trim() || !date || !time.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setMeetings([...meetings, { title, date, time }]);
    setFormData({ title: "", date: "", time: "" });
    setShowForm(false);
  };

  // Delete meeting at index i
  const deleteMeeting = (i) => {
    if (window.confirm("Delete this meeting?")) {
      setMeetings(meetings.filter((_, idx) => idx !== i));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          Meeting Schedule
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
        >
          <FaPlus className="mr-2" /> Add
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={addMeeting}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner relative"
        >
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            aria-label="Close form"
          >
            <FaTimes />
          </button>

          <div className="mb-3">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Meeting Title
            </label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Date
            </label>
            <input
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              type="date"
              required
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Time
            </label>
            <input
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="E.g. 14:00 - 15:00"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Save Meeting
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Title</th>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Date</th>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Time</th>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No meetings scheduled.
                </td>
              </tr>
            )}
            {meetings.map(({ title, date, time }, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <td className="p-2 text-gray-700 dark:text-gray-300">{title}</td>
                <td className="p-2 text-gray-700 dark:text-gray-300">{date}</td>
                <td className="p-2 text-gray-700 dark:text-gray-300">{time}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteMeeting(i)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Meeting"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}