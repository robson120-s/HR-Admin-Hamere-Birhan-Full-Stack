import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // <-- adjust this import if your prisma client is in another location

export async function POST(req) {
  try {
    const { department, data } = await req.json();
    console.log("✅ Received attendance data:", { department, data });

    // 🔥 Example logic to update attendance in DB
    // You can change the model and fields according to your schema later
    // For now, this is a placeholder example

    // Loop through staff
    for (const staff of data.staff) {
      await prisma.user.update({
        where: { id: staff.id },
        data: { attendanceStatus: staff.attendance },
      });
    }

    // Loop through interns
    for (const intern of data.interns) {
      await prisma.user.update({
        where: { id: intern.id },
        data: { attendanceStatus: intern.attendance },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error saving attendance:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
