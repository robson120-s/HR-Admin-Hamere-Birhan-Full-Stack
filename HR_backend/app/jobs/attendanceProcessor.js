// HR_backend/app/jobs/attendanceProcessor.js

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

/**
 * This function processes attendance logs for a given date and generates daily summaries.
 * It's the core logic for summarizing attendance.
 */
async function processDailyAttendance(targetDate) {
  console.log(`Starting attendance processing for date: ${targetDate.toISOString().slice(0, 10)}`);

  // 1. Get all employees who should have an attendance summary.
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      departmentId: true, // We need this for the summary!
      subDepartmentId: true,
    }
  });

  let summariesCreated = 0;

  // 2. Loop through each employee to determine their summary status.
  for (const employee of employees) {
    const employeeId = employee.id;

    // RULE 1: Check if the employee was on approved leave. This is the highest priority.
    const onLeave = await prisma.leave.findFirst({
      where: {
        employeeId: employeeId,
        status: 'approved',
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });

    if (onLeave) {
      await createOrUpdateSummary(employee, targetDate, 'on_leave', 'Employee on approved leave.');
      summariesCreated++;
      continue; // Move to the next employee
    }

    // RULE 2: If not on leave, check their attendance logs for the day.
    const logs = await prisma.attendanceLog.findMany({
      where: {
        employeeId: employeeId,
        date: targetDate,
      },
    });

    let finalStatus = 'absent'; // Default to absent if no logs are found

    if (logs.length > 0) {
      // If there is at least one 'present' or 'late' log, consider them present for the day.
      // You can make this logic more complex later (e.g., for half-days).
      const isPresentOrLate = logs.some(log => log.status === 'present' || log.status === 'late');
      if (isPresentOrLate) {
        finalStatus = 'present';
      }
    }

    await createOrUpdateSummary(employee, targetDate, finalStatus, `Processed from ${logs.length} logs.`);
    summariesCreated++;
  }

  console.log(`Finished attendance processing. Created/updated ${summariesCreated} summaries.`);
}


/**
 * Helper function to create or update a summary record in the database.
 */
async function createOrUpdateSummary(employee, date, status, remarks) {
  await prisma.attendanceSummary.upsert({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date: date,
      },
    },
    update: {
      status: status,
      remarks: remarks,
    },
    create: {
      employeeId: employee.id,
      date: date,
      status: status,
      remarks: remarks,
      // IMPORTANT: We must link the department here for the chart to work!
      departmentId: employee.subDepartmentId || employee.departmentId, 
    },
  });
}

// Export the function so other parts of the app can use it.
module.exports = { processDailyAttendance };