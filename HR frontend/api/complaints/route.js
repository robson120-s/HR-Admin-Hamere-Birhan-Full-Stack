// app/api/complaints/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: replace with your real auth (NextAuth/JWT) and derive employeeId from session
function getUserFromRequest(req) {
  // Return mocked user for demo (you can map to Employee table by your own logic)
  return { employeeId: 1, role: "intern" }; 
}

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const subject = (body?.subject || "").trim();
    const description = (body?.description || "").trim();

    // If you want to trust the body’s employeeId, uncomment next line:
    // const employeeId = Number(body?.employeeId);

    const employeeId = Number(user.employeeId); // prefer session source

    if (!employeeId || !subject || !description) {
      return NextResponse.json(
        { error: "employeeId, subject and description are required" },
        { status: 400 }
      );
    }

    const created = await prisma.complaint.create({
      data: {
        employeeId,
        subject,
        description,
        // status defaults to 'open' from your Prisma schema
      },
      select: { id: true, status: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, complaint: created }, { status: 201 });
  } catch (err) {
    console.error("Create complaint error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
