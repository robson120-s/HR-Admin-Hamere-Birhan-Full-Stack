"use client";

// --- CHANGE 1: Import the 'Legend' component from the recharts library ---
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export default function AttendanceChart({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full transition-colors">
      {/* --- CHANGE 2: Updated the title to be more descriptive --- */}
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
        Daily Attendance Status per Department
      </h2>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="department" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                borderColor: "#334155", // A neutral dark gray color
                color: "#fff",
                borderRadius: "0.5rem", // Added for a softer look
              }}
            />
            
            {/* --- CHANGE 3: Added the Legend component to explain the colors --- */}
            <Legend />

            {/* This is the original green bar for 'present' employees */}
            <Bar dataKey="present" fill="#4ade80" radius={[5, 5, 0, 0]} />

            {/* --- CHANGE 4: Added a new red bar for 'absent' employees --- */}
            <Bar dataKey="absent" fill="#f43f5e" radius={[5, 5, 0, 0]} />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}