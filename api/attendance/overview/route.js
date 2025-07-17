import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const records = await prisma.attendance.findMany();
    const staffList = await prisma.staff.findMany();
    // Calculate totals
    const totalPresent = records.filter(r => r.status === "Present").length;
    const totalAbsent = records.filter(r => r.status === "Absent").length;
    const totalUsers = staffList.length;

    res.status(200).json({
      records,
      staffList,
      totalPresent,
      totalAbsent,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
}