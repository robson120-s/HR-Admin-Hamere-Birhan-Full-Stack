// HR_backend/app/jobs/attendanceProcessor.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function processAttendanceForDate(targetDate, employeeIds) {
  if (!employeeIds || employeeIds.length === 0) {
    console.log(`No employee IDs provided for processing on ${targetDate.toISOString()}`);
    return [];
  }
  
  // Normalize date to UTC midnight for consistent database queries
  const normalizedDate = new Date(targetDate);
  normalizedDate.setUTCHours(0, 0, 0, 0);
  
  console.log(`Processing summary for ${employeeIds.length} employees on ${normalizedDate.toISOString().slice(0, 10)}`);

  // Pre-fetch global data for efficiency
  const holiday = await prisma.holiday.findUnique({ 
    where: { date: normalizedDate } 
  });
  
  const dayOfWeek = normalizedDate.getUTCDay();
  const isWeekend = dayOfWeek === 0; // Sunday is weekend

  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { 
      id: true, 
      departmentId: true, 
      subDepartmentId: true,
      firstName: true,
      lastName: true
    },
  });

  const operations = [];

  for (const employee of employees) {
    let finalStatus = null;
    let remarks = '';

    // Check for approved leave
    const onLeave = await prisma.leave.findFirst({
      where: {
        employeeId: employee.id,
        status: 'approved',
        startDate: { lte: normalizedDate },
        endDate: { gte: normalizedDate },
      },
    });

    if (onLeave) {
      finalStatus = 'on_leave';
      remarks = 'On approved leave.';
      console.log(`Employee ${employee.firstName} ${employee.lastName} is on leave`);
    }
    // Check if it's a holiday
    else if (holiday) {
      finalStatus = 'holiday';
      remarks = `Public Holiday: ${holiday.name}`;
      console.log(`Employee ${employee.firstName} ${employee.lastName} - Holiday`);
    }
    // Check if it's a weekend
    else if (isWeekend) {
      finalStatus = 'weekend';
      remarks = `Weekend (Sunday)`;
      console.log(`Employee ${employee.firstName} ${employee.lastName} - Weekend`);
    }
    // Process attendance logs for working days
    else {
      // Query logs for this employee and date
      const logs = await prisma.attendanceLog.findMany({
        where: { 
          employeeId: employee.id, 
          date: normalizedDate 
        },
      });

      console.log(`Employee ${employee.firstName} ${employee.lastName} has ${logs.length} logs:`, logs);

      if (logs.length === 0) {
        // No logs found for a working day
        finalStatus = 'absent';
        remarks = 'No attendance logs found for a working day.';
        console.log(`Employee ${employee.firstName} ${employee.lastName} marked as absent - no logs`);
      } else {
        // Count statuses from logs
        const statusCounts = {
          present: 0,
          late: 0,
          absent: 0,
          permission: 0
        };

        logs.forEach(log => {
          if (statusCounts.hasOwnProperty(log.status)) {
            statusCounts[log.status]++;
          }
        });

        const presentCount = statusCounts.present + statusCounts.late;
        const permissionCount = statusCounts.permission;

        console.log(`Employee ${employee.firstName} ${employee.lastName} - Present: ${presentCount}, Permission: ${permissionCount}`);

        // Determine final status based on logs
        if (presentCount >= 2) {
          finalStatus = 'present';
          remarks = `Full day attendance (${presentCount}/3 sessions).`;
        } else if (presentCount === 1) {
          finalStatus = 'half_day';
          remarks = `Half day attendance (${presentCount}/3 sessions).`;
        } else if (permissionCount >= 1) {
          finalStatus = 'permission';
          remarks = `Present with permission (${permissionCount}/3 sessions).`;
        } else {
          finalStatus = 'absent';
          remarks = 'Marked as absent for all sessions.';
        }
        
        console.log(`Employee ${employee.firstName} ${employee.lastName} marked as ${finalStatus}`);
      }
    }

    // Prepare the database operation
    operations.push(
      prisma.attendanceSummary.upsert({
        where: { 
          employeeId_date: { 
            employeeId: employee.id, 
            date: normalizedDate 
          } 
        },
        update: { 
          status: finalStatus, 
          remarks: remarks,
          departmentId: employee.subDepartmentId || employee.departmentId,
        },
        create: {
          employeeId: employee.id,
          date: normalizedDate,
          status: finalStatus,
          remarks: remarks,
          departmentId: employee.subDepartmentId || employee.departmentId,
        },
      })
    );
  }
  
  return operations;
}

module.exports = { processAttendanceForDate };