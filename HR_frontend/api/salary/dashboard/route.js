import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Return mock summary data for demonstration
    // When you have a database, replace this with actual Prisma queries
    const mockSummary = {
      totalEmployee: 5,
      totalPaid: 1,
      totalUnpaid: 4,
      totalLeave: 7,
    };
    
    return NextResponse.json(mockSummary);
  } catch (error) {
    console.error("Error fetching salary dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary dashboard data" },
      { status: 500 }
    );
  }
}
