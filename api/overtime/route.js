import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch overtime data from the database
    // This is a mock implementation - adjust based on your actual database schema
    const overtimeData = await prisma.overtime.findMany({
      include: {
        employee: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If no overtime table exists, return mock data for demonstration
    if (!overtimeData || overtimeData.length === 0) {
      const mockData = [
        {
          id: 1,
          username: "john.doe",
          employeeName: "John Doe",
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
          username: "jane.smith",
          employeeName: "Jane Smith",
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
          username: "mike.johnson",
          employeeName: "Mike Johnson",
          overtimeType: "Weekend",
          overtimeHours: 6,
          salaryMultiplier: "1.5",
          totalOvertimesWorked: 15,
          approved: false,
          status: "Pending",
          createdAt: new Date(),
        },
      ];
      
      return Response.json(mockData);
    }

    // Transform the data to match the expected format
    const transformedData = overtimeData.map(item => ({
      id: item.id,
      username: item.employee?.username || item.username,
      employeeName: item.employee?.name || item.employeeName,
      overtimeType: item.overtimeType || "Regular",
      overtimeHours: item.overtimeHours || 0,
      salaryMultiplier: item.salaryMultiplier || "1.75",
      totalOvertimesWorked: item.totalOvertimesWorked || 0,
      approved: item.approved || false,
      status: item.status || "Pending",
      createdAt: item.createdAt,
    }));

    return Response.json(transformedData);
  } catch (error) {
    console.error("Error fetching overtime data:", error);
    return Response.json(
      { error: "Failed to fetch overtime data" },
      { status: 500 }
    );
  }
}
