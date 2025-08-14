import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Return mock data for demonstration
    // When you have a database, replace this with actual Prisma queries
    const mockData = [
      {
        id: 1,
        username: "sosina.worku",
        employeeName: "Sosina Worku",
        overtimeType: "Regular",
        overtimeHours: 8,
        salaryMultiplier: "1.75",
        totalOvertimesWorked: 12,
        approved: false,
        status: "Pending",
        createdAt: new Date(),
      },
      {
        id: 2,
        username: "mereteab.tesfaye",
        employeeName: "Mereteab Tesfaye",
        overtimeType: "Holiday",
        overtimeHours: 12,
        salaryMultiplier: "2.0",
        totalOvertimesWorked: 8,
        approved: true,
        status: "Approved",
        createdAt: new Date(),
      },
      {
        id: 3,
        username: "john.doe",
        employeeName: "John Doe",
        overtimeType: "Weekend",
        overtimeHours: 6,
        salaryMultiplier: "1.5",
        totalOvertimesWorked: 15,
        approved: false,
        status: "Pending",
        createdAt: new Date(),
      },
      {
        id: 4,
        username: "sosina.worku",
        employeeName: "Sosina Worku",
        overtimeType: "Weekend",
        overtimeHours: 10,
        salaryMultiplier: "1.5",
        totalOvertimesWorked: 18,
        approved: false,
        status: "Pending",
        createdAt: new Date(),
      },
      {
        id: 5,
        username: "mereteab.tesfaye",
        employeeName: "Mereteab Tesfaye",
        overtimeType: "Regular",
        overtimeHours: 4,
        salaryMultiplier: "1.75",
        totalOvertimesWorked: 22,
        approved: false,
        status: "Pending",
        createdAt: new Date(),
      },
    ];
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error fetching overtime data:", error);
    return NextResponse.json(
      { error: "Failed to fetch overtime data" },
      { status: 500 }
    );
  }
}


