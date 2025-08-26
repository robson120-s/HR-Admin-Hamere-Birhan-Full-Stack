"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import {
  getMeetings,
  addMeeting,
  deleteMeeting as apiDeleteMeeting,
} from "../../../../lib/api";
import toast from "react-hot-toast";

export default function MeetingSchedule() {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", date: "", time: "" });

  const now = new Date();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await getMeetings();
        setMeetings(data);
      } catch (error) {
        toast.error("Could not fetch meetings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    try {
      const newMeeting = await addMeeting(formData);
      setMeetings([...meetings, newMeeting].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setFormData({ title: "", date: "", time: "" });
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to add meeting.");
    }
  };

  const handleDeleteMeeting = async (id) => {
    if (window.confirm("Delete this meeting?")) {
      try {
        await apiDeleteMeeting(id);
        setMeetings(meetings.filter((m) => m.id !== id));
      } catch (error) {
        toast.error("Failed to delete meeting.");
      }
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
          onSubmit={handleAddMeeting}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner relative"
        >
          {/* Form content remains the same */}
          <button type="button" onClick={() => setShowForm(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300" aria-label="Close form"><FaTimes /></button>
          <div className="mb-3"><label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Meeting Title</label><input id="title" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" type="text" placeholder="Enter meeting title" required /></div>
          <div className="mb-3"><label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date</label><input id="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" type="date" required /></div>
          <div className="mb-3"><label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Time</label><input id="time" name="time" value={formData.time} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" type="text" placeholder="E.g. 14:00 - 15:00" required /></div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Save Meeting</button>
        </form>
      )}

      <div className="overflow-x-auto">
        {/* --- CHANGE 1: Added 'table-fixed' to better control column widths --- */}
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-2 py-3 text-sm text-gray-600 dark:text-gray-300 w-2/5">Title</th>
              <th className="px-2 py-3 text-sm text-gray-600 dark:text-gray-300">Date</th>
              <th className="px-2 py-3 text-sm text-gray-600 dark:text-gray-300">Time</th>
              <th className="px-2 py-3 text-sm text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-2 py-3 text-sm text-gray-600 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && ( <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr> )}
            {!isLoading && meetings.length === 0 && ( <tr><td colSpan={5} className="p-4 text-center text-gray-500">No meetings scheduled.</td></tr> )}

            {meetings.map((meeting) => {
              const startTime = meeting.time.split('-')[0].trim();
              const meetingDateTime = new Date(`${meeting.date}T${startTime}`);
              const isPast = meetingDateTime < now;

              return (
                <tr
                  key={meeting.id}
                  className={`border-b border-gray-100 dark:border-gray-700 transition ${
                    isPast ? "opacity-60" : "" // Simplified the faded style
                  }`}
                >
                  {/* --- CHANGE 2: Truncate long titles and show full title on hover --- */}
                  <td className="p-2 text-gray-700 dark:text-gray-300 truncate" title={meeting.title}>
                    {meeting.title}
                  </td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">{new Date(meeting.date).toLocaleDateString()}</td>
                  <td className="p-2 text-gray-700 dark:text-gray-300">{meeting.time}</td>
                  <td className="p-2">
                    {/* --- CHANGE 3: Added the new "Upcoming" badge --- */}
                    {isPast ? (
                      <span className="text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded-full">
                        Past
                      </span>
                    ) : (
                      <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full">
                        Upcoming
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <button onClick={() => handleDeleteMeeting(meeting.id)} className="text-red-500 hover:text-red-700" title="Delete Meeting">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}