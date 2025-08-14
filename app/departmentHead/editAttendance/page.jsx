"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "/components/ui/tabs";
import { Card } from "/components/ui/card";
import { Input } from "/components/ui/input";
import { Button } from "/components/ui/button";
import {
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Save,
} from "lucide-react";
import Sidebar from "../Sidebar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Dummy data with three attendance fields
const dummyInterns = [
  { id: 1, name: "John Doe", morning: true, afternoon: false, evening: false },
  { id: 2, name: "Jane Smith", morning: false, afternoon: false, evening: false },
  { id: 3, name: "Daniel G.", morning: true, afternoon: true, evening: false },
];

const dummyStaff = [
  { id: 1, name: "Dr. Alex", morning: true, afternoon: true, evening: false },
  { id: 2, name: "Prof. Helen", morning: false, afternoon: true, evening: true },
  { id: 3, name: "Mr. Mark", morning: true, afternoon: false, evening: false },
];

// AttendanceList component
const AttendanceList = ({ data, setData, type }) => {
  const [search, setSearch] = useState("");

  const togglePresence = (id, session) => {
    const updated = data.map((person) =>
      person.id === id
        ? { ...person, [session]: !person[session] }
        : person
    );
    setData(updated);
  };

  const markAll = (present, session) => {
    const updated = data.map((person) => ({
      ...person,
      [session]: present,
    }));
    setData(updated);
  };

  const filtered = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 mb-2 flex-wrap">
        <Input
          placeholder={`Search ${type} by name...`}
          className="w-full sm:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Mark all buttons for each session */}
      <div className="flex gap-4 flex-wrap mb-4">
        {["morning", "afternoon", "evening"].map((session) => (
          <div key={session} className="flex gap-2 items-center">
            <span className="capitalize font-medium">{session}:</span>
            <Button
              size="sm"
              onClick={() => markAll(true, session)}
              className="bg-green-600 hover:bg-green-700 text-white px-3"
            >
              All Present
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => markAll(false, session)}
              className="px-3"
            >
              All Absent
            </Button>
          </div>
        ))}
      </div>

      {filtered.map((person) => (
        <Card
          key={person.id}
          className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border shadow-sm gap-3"
        >
          <div className="flex items-center gap-3">
            <User className="text-muted-foreground" />
            <p className="text-md font-medium">{person.name}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["morning", "afternoon", "evening"].map((session) => (
              <Button
                key={session}
                onClick={() => togglePresence(person.id, session)}
                size="sm"
                className={`text-white text-sm px-3 capitalize ${
                  person[session]
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {session}
                {person[session] ? (
                  <CheckCircle className="ml-1 h-4 w-4" />
                ) : (
                  <XCircle className="ml-1 h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

// Main Page Component
export default function EditAttendancePage() {
  const [interns, setInterns] = useState(dummyInterns);
  const [staff, setStaff] = useState(dummyStaff);
  const [date, setDate] = useState("");
  const [tab, setTab] = useState("interns");

  // Export both interns and staff to Excel
  const handleSave = () => {
    if (!date) {
      alert("Please select a date before saving attendance.");
      return;
    }

    const formatData = (records, department) =>
      records.map((record) => ({
        Name: record.name,
        Department: department,
        Morning: record.morning ? "✔ Present" : "✖ Absent",
        Afternoon: record.afternoon ? "✔ Present" : "✖ Absent",
        Evening: record.evening ? "✔ Present" : "✖ Absent",
      }));

    const internData = formatData(interns, "Interns");
    const staffData = formatData(staff, "Staff");

    const workbook = XLSX.utils.book_new();

    const internSheet = XLSX.utils.json_to_sheet(internData);
    XLSX.utils.book_append_sheet(workbook, internSheet, "Interns");

    const staffSheet = XLSX.utils.json_to_sheet(staffData);
    XLSX.utils.book_append_sheet(workbook, staffSheet, "Staff");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    const fileName = `attendance-${date}.xlsx`;
    saveAs(blob, fileName);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="h-screen sticky top-0 bg-white shadow-md z-10">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto bg-muted/20">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Select Date:
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-52"
            />
          </div>

          <Button
            onClick={handleSave}
            className="flex bg-primary text-white text-sm px-4"
          >
            <Save className="mr-2 h-4 w-4" />
            Export Attendance
          </Button>
        </div>

        <Tabs
          defaultValue="interns"
          value={tab}
          onValueChange={setTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="interns">Interns</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="interns">
            <AttendanceList
              data={interns}
              setData={setInterns}
              type="interns"
            />
          </TabsContent>
          <TabsContent value="staff">
            <AttendanceList
              data={staff}
              setData={setStaff}
              type="staff"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
