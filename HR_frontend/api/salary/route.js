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
        department: "IT",
        role: "Software Developer",
        absents: 2,
        presents: 18,
        overtime: 8,
        totalSalary: 45000,
        paid: false,
        status: "Unpaid",
        createdAt: new Date(),
      },
      {
        id: 2,
        username: "mereteab.tesfaye",
        employeeName: "Mereteab Tesfaye",
        department: "HR",
        role: "HR Manager",
        absents: 0,
        presents: 20,
        overtime: 12,
        totalSalary: 55000,
        paid: true,
        status: "Paid",
        createdAt: new Date(),
      },
      {
        id: 3,
        username: "john.doe",
        employeeName: "John Doe",
        department: "Marketing",
        role: "Marketing Specialist",
        absents: 1,
        presents: 19,
        overtime: 6,
        totalSalary: 38000,
        paid: false,
        status: "Unpaid",
        createdAt: new Date(),
      },
      {
        id: 4,
        username: "sosina.worku",
        employeeName: "Sosina Worku",
        department: "IT",
        role: "Software Developer",
        absents: 3,
        presents: 17,
        overtime: 10,
        totalSalary: 47000,
        paid: false,
        status: "Unpaid",
        createdAt: new Date(),
      },
      {
        id: 5,
        username: "mereteab.tesfaye",
        employeeName: "Mereteab Tesfaye",
        department: "HR",
        role: "HR Manager",
        absents: 1,
        presents: 19,
        overtime: 4,
        totalSalary: 52000,
        paid: false,
        status: "Unpaid",
        createdAt: new Date(),
      },
    ];
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error fetching salary data:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary data" },
      { status: 500 }
    );
  }
}
