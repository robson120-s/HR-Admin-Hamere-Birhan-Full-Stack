'use client'
import React, { useState, useEffect } from 'react';

export default function AttendanceHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Simulate fetching attendance
    const tempData = [
      { date: '2025-07-30', status: 'Present' },
      { date: '2025-07-29', status: 'Absent' },
      { date: '2025-07-28', status: 'Present' },
    ];
    setHistory(tempData);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📅 Attendance History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{entry.date}</td>
                  <td className={`px-4 py-2 font-medium ${entry.status === 'Present' ? 'text-green-600' : 'text-red-500'}`}>
                    {entry.status}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="2" className="px-4 py-4 text-center text-gray-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}