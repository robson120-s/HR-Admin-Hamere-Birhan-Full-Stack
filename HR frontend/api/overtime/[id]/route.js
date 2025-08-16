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

// GET - Fetch a specific overtime request
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const requestId = parseInt(id);
    
    const overtimeRequest = overtimeRequests.find(req => req.id === requestId);
    
    if (!overtimeRequest) {
      return NextResponse.json(
        { error: 'Overtime request not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(overtimeRequest);
  } catch (error) {
    console.error('Error fetching overtime request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update an overtime request
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const requestId = parseInt(id);
    
    // Find the existing request
    const existingRequestIndex = overtimeRequests.findIndex(req => req.id === requestId);
    
    if (existingRequestIndex === -1) {
      return NextResponse.json(
        { error: 'Overtime request not found' },
        { status: 404 }
      );
    }
    
    // Get the update data from request body
    const updateData = await request.json();
    
    // Validate required fields
    if (!updateData.approvalStatus) {
      return NextResponse.json(
        { error: 'Approval status is required' },
        { status: 400 }
      );
    }
    
    // Validate status values
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(updateData.approvalStatus)) {
      return NextResponse.json(
        { error: 'Invalid approval status' },
        { status: 400 }
      );
    }
    
    // Update the request
    const updatedRequest = {
      ...overtimeRequests[existingRequestIndex],
      approvalStatus: updateData.approvalStatus,
      notes: updateData.notes || '',
      approver: updateData.approver || null,
      approvedAt: updateData.approvedAt || null,
      updatedAt: new Date().toISOString()
    };
    
    // Update in our mock database
    overtimeRequests[existingRequestIndex] = updatedRequest;
    
    // In a real app, you would update the database here:
    // await prisma.overtimeLog.update({
    //   where: { id: requestId },
    //   data: {
    //     approvalStatus: updateData.approvalStatus,
    //     notes: updateData.notes,
    //     approver: updateData.approver,
    //     approvedAt: updateData.approvedAt,
    //     updatedAt: new Date()
    //   }
    // });
    
    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating overtime request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an overtime request (optional)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const requestId = parseInt(id);
    
    const existingRequestIndex = overtimeRequests.findIndex(req => req.id === requestId);
    
    if (existingRequestIndex === -1) {
      return NextResponse.json(
        { error: 'Overtime request not found' },
        { status: 404 }
      );
    }
    
    // Remove from mock database
    const deletedRequest = overtimeRequests.splice(existingRequestIndex, 1)[0];
    
    // In a real app, you would delete from the database here:
    // await prisma.overtimeLog.delete({
    //   where: { id: requestId }
    // });
    
    return NextResponse.json({ message: 'Overtime request deleted successfully', deletedRequest });
  } catch (error) {
    console.error('Error deleting overtime request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
