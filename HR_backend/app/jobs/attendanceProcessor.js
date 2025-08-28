// HR_backend/app/jobs/attendanceProcessor.js

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();




async function processAttendanceForDate(targetDate, employeeIds) {
  if (!employeeIds || employeeIds.length === 0) {
    console.log(`No employee IDs provided for processing on ${targetDate.toISOString()}`);
    return []; // Return an empty array if there is no work to do
  }
  
  console.log(`Processing summary for ${employeeIds.length} employees on ${targetDate.toISOString().slice(0, 10)}`);

  // --- Pre-fetch global data for efficiency ---
  const holiday = await prisma.holiday.findUnique({ where: { date: targetDate } });
  const isWeekend = targetDate.getUTCDay() === 0; // 0 = Sunday

  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, departmentId: true, subDepartmentId: true },
  });

  const operations = [];

  for (const employee of employees) {
    let finalStatus = null;
    let remarks = '';

    // --- RULE PRIORITY 1: Approved Leave ---
    // This is the highest priority. If an employee is on leave, nothing else matters.
    const onLeave = await prisma.leave.findFirst({
      where: {
        employeeId: employee.id,
        status: 'approved',
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    if (onLeave) {
      finalStatus = 'on_leave';
      remarks = 'On approved leave.';
    }
    // --- RULE PRIORITY 2: Holiday ---
    // If not on leave, check if the day is a public holiday.
    else if (holiday) {
      finalStatus = 'holiday';
      remarks = `Public Holiday: ${holiday.name}`;
    }
    // --- RULE PRIORITY 3: Weekend ---
    // If not on leave or holiday, check if it's a weekend.
    else if (isWeekend) {
      finalStatus = 'weekend';
      remarks = 'Weekend';
    }
    // --- RULE PRIORITY 4: Process Logs (only if it's a working day) ---
    else {
      const logs = await prisma.attendanceLog.findMany({
        where: { employeeId: employee.id, date: targetDate },
      });

      if (logs.length === 0) {
        // --- RULE 7 (Sub-rule): Absent (No logs) ---
        finalStatus = 'absent';
        remarks = 'No attendance logs found for a working day.';
      } else {
        // Count the occurrences of each relevant status
        const presentCount = logs.filter(log => log.status === 'present' || log.status === 'late').length;
        const permissionCount = logs.filter(log => log.status === 'permission').length;

        // Apply the log-based rules in their own sub-priority
        if (presentCount >= 2) {
          // --- RULE 4: Present (Full Day) ---
          finalStatus = 'present';
          remarks = `Full day attendance (${presentCount}/3 sessions).`;
        } else if (presentCount === 1) {
          // --- RULE 5: Half Day ---
          finalStatus = 'half_day';
          remarks = `Half day attendance (${presentCount}/3 sessions).`;
        } else if (permissionCount > 0) {
          // --- RULE 6: Permission (only checked if not present) ---
          finalStatus = 'permission';
          remarks = `Present with permission (${permissionCount}/3 sessions).`;
        } else {
          // --- RULE 7 (Sub-rule): Absent (Logs exist but none are present/permission) ---
          finalStatus = 'absent';
          remarks = 'Marked as absent for all sessions.';
        }
      }
    }

    // Prepare the database operation to create or update the summary for this employee
    operations.push(prisma.attendanceSummary.upsert({
      where: { employeeId_date: { employeeId: employee.id, date: targetDate } },
      update: { status: finalStatus, remarks: remarks },
      create: {
        employeeId: employee.id,
        date: targetDate,
        status: finalStatus,
        remarks: remarks,
        departmentId: employee.subDepartmentId || employee.departmentId,
      },
    }));
  }
  
  // Return the array of database operations to be executed in a transaction
  return operations;
}

module.exports = { processAttendanceForDate };