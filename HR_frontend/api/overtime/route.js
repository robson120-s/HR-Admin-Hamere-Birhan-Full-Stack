import { NextResponse } from 'next/server';

// Mock database - in real app, this would be your Prisma database
let overtimeRequests = [
  { 
    id: 1, 
    employee: { name: "Eleanor Vance", id: "EMP001" }, 
    date: "2025-09-15T18:00:00Z", 
    hours: 2.5, 
    reason: "Critical server maintenance.", 
    approvalStatus: "pending", 
    compensationMethod: "cash",
    approver: null,
    approvedAt: null,
    notes: ""
  },
  { 
    id: 2, 
    employee: { name: "Marcus Thorne", id: "EMP002" }, 
    date: "2025-09-14T20:30:00Z", 
    hours: 3.0, 
    reason: "Finalizing Q3 financial report.", 
    approvalStatus: "approved", 
    compensationMethod: "time_off",
    approver: "HR Manager",
    approvedAt: "2025-09-14T21:00:00Z",
    notes: "Approved for time off compensation"
  },
  { 
    id: 3, 
    employee: { name: "Isla Chen", id: "EMP003" }, 
    date: "2025-09-12T17:00:00Z", 
    hours: 1.0, 
    reason: "Extended client call.", 
    approvalStatus: "rejected", 
    compensationMethod: "cash",
    approver: "HR Manager",
    approvedAt: "2025-09-12T18:00:00Z",
    notes: "Reason not sufficient for overtime"
  },
  { 
    id: 4, 
    employee: { name: "Liam Gallagher", id: "EMP004" }, 
    date: "2025-09-18T19:00:00Z", 
    hours: 4.0, 
    reason: "Covering a colleague's shift.", 
    approvalStatus: "pending", 
    compensationMethod: "time_off",
    approver: null,
    approvedAt: null,
    notes: ""
  },
  { 
    id: 5, 
    employee: { name: "Sophia Rossi", id: "EMP005" }, 
    date: "2025-09-20T18:30:00Z", 
    hours: 1.5, 
    reason: "Urgent bug fix deployment.", 
    approvalStatus: "pending", 
    compensationMethod: "cash",
    approver: null,
    approvedAt: null,
    notes: ""
  },
];

// GET - Fetch all overtime requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters for filtering
    const status = searchParams.get('status');
    const employeeName = searchParams.get('employeeName');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    let filteredRequests = [...overtimeRequests];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.approvalStatus === status);
    }
    
    // Filter by employee name
    if (employeeName) {
      filteredRequests = filteredRequests.filter(req => 
        req.employee.name.toLowerCase().includes(employeeName.toLowerCase())
      );
    }
    
    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredRequests = filteredRequests.filter(req => new Date(req.date) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredRequests = filteredRequests.filter(req => new Date(req.date) <= toDate);
    }
    
    // Sort by date (newest first)
    filteredRequests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // In a real app, you would query the database here:
    // const overtimeRequests = await prisma.overtimeLog.findMany({
    //   where: {
    //     ...(status && status !== 'all' && { approvalStatus: status }),
    //     ...(employeeName && {
    //       employee: {
    //         name: {
    //           contains: employeeName,
    //           mode: 'insensitive'
    //         }
    //       }
    //     }),
    //     ...(dateFrom && { date: { gte: new Date(dateFrom) } }),
    //     ...(dateTo && { date: { lte: new Date(dateTo) } })
    //   },
    //   include: {
    //     employee: {
    //       select: {
    //         name: true,
    //         id: true
    //       }
    //     }
    //   },
    //   orderBy: {
    //     date: 'desc'
    //   }
    // });
    
    return NextResponse.json(filteredRequests);
  } catch (error) {
    console.error('Error fetching overtime requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new overtime request
export async function POST(request) {
  try {
    const requestData = await request.json();
    
    // Validate required fields
    if (!requestData.employeeId || !requestData.date || !requestData.hours || !requestData.reason) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, date, hours, reason' },
        { status: 400 }
      );
    }
    
    // Create new request
    const newRequest = {
      id: overtimeRequests.length + 1,
      employee: {
        id: requestData.employeeId,
        name: requestData.employeeName || "Unknown Employee"
      },
      date: requestData.date,
      hours: parseFloat(requestData.hours),
      reason: requestData.reason,
      approvalStatus: "pending",
      compensationMethod: requestData.compensationMethod || "cash",
      approver: null,
      approvedAt: null,
      notes: requestData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock database
    overtimeRequests.push(newRequest);
    
    // In a real app, you would create in the database here:
    // const newOvertimeRequest = await prisma.overtimeLog.create({
    //   data: {
    //     employeeId: requestData.employeeId,
    //     date: new Date(requestData.date),
    //     hours: parseFloat(requestData.hours),
    //     reason: requestData.reason,
    //     approvalStatus: "pending",
    //     compensationMethod: requestData.compensationMethod || "cash",
    //     notes: requestData.notes || ""
    //   },
    //   include: {
    //     employee: {
    //       select: {
    //         name: true,
    //         id: true
    //       }
    //     }
    //   }
    // });
    
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating overtime request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


