const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const authenticate = require('../middlewares/authMiddleware').authenticate;


// GET /api/employee/dashboard
const getMonthBounds = (date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0); // Normalize to start of day
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999); // Set to end of day
  return { startOfMonth, endOfMonth };
};

const getWeekBounds = (date) => {
  const day = date.getDay(); // Sunday - Saturday : 0 - 6
  // Adjust to start on Monday (if your week starts on Monday)
  // For Sunday start: const diff = date.getDate() - day;
  // For Monday start: const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start of week logic

  const startOfWeek = new Date(date);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
};

// Helper to format time strings for recent activities
function formatRelativeTime(activityDate, exactTime) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());

  if (activityDay.getTime() === today.getTime()) {
    return `Today, ${exactTime}`;
  } else if (activityDay.getTime() === yesterday.getTime()) {
    return `Yesterday, ${exactTime}`;
  } else {
    // Format to "Month Day" for older entries
    return activityDate.toLocaleString('en-US', { month: 'long', day: 'numeric' });
  }
}

// --- API Endpoints ---

// GET /api/staff/dashboard/:employeeId/summary
router.get('/dashboard/:employeeId/summary', async (req, res) => {
  const { employeeId } = req.params;
  const currentEmployeeId = parseInt(employeeId, 10);

  if (isNaN(currentEmployeeId)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    const now = new Date();
    const { startOfMonth, endOfMonth } = getMonthBounds(now);
    const { startOfWeek, endOfWeek } = getWeekBounds(now);

    // Fetch employee details for userName
    const employee = await prisma.employee.findUnique({
      where: { id: currentEmployeeId },
      select: { firstName: true, lastName: true, userId: true },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const userName = `${employee.firstName} ${employee.lastName}`;

    // Total Present (this month)
    const totalPresent = await prisma.attendancesummary.count({
      where: {
        employeeId: currentEmployeeId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: 'present',
      },
    });

    // Total Absent (this month) - considers both 'absent' status and unplannedAbsence
    const totalAbsent = await prisma.attendancesummary.count({
      where: {
        employeeId: currentEmployeeId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        OR: [
          { status: 'absent' },
          { unplannedAbsence: true },
        ],
      },
    });

    // Last Seen (latest actualClockIn for the employee)
    const lastSeenLog = await prisma.attendancelog.findFirst({
      where: {
        employeeId: currentEmployeeId,
        actualClockIn: {
          not: null, // Ensure there's an actual clock-in time
        },
      },
      orderBy: {
        actualClockIn: 'desc', // Get the most recent one
      },
      select: {
        actualClockIn: true,
      },
    });
    const lastSeen = lastSeenLog ? lastSeenLog.actualClockIn.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';


    // Absences This Week
    const absencesThisWeek = await prisma.attendancesummary.count({
      where: {
        employeeId: currentEmployeeId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
        OR: [
          { status: 'absent' },
          { unplannedAbsence: true },
        ],
      },
    });

    // Notifications (example: count pending leave requests that this user might need to approve if they were a manager, or pending requests by this employee)
    // For a staff member, notifications could be related to their own leave requests being approved/rejected, or
    // if they have a role that requires action on other requests.
    let notificationsCount = 0;
    if (employee.userId) {
      // Example: count pending leave requests *made by this employee*
      notificationsCount = await prisma.leave.count({
        where: {
          employeeId: currentEmployeeId,
          status: 'pending',
        },
      });
      // You can add other notification types here, e.g., unread messages, new tasks.
    }


    res.json({
      userName,
      totalPresent,
      totalAbsent,
      lastSeen,
      absencesThisWeek,
      notifications: notificationsCount,
    });
  } catch (error) {
    console.error("Error fetching staff dashboard summary:", error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
});

// GET /api/staff/holidays
router.get('/holidays', async (req, res) => {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(holidays);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
});

// GET /api/staff/dashboard/:employeeId/activities
router.get('/dashboard/:employeeId/activities', async (req, res) => {
  const { employeeId } = req.params;
  const currentEmployeeId = parseInt(employeeId, 10);

  if (isNaN(currentEmployeeId)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    const activities = [];

    // Fetch recent attendance logs (check-ins/check-outs)
    const attendanceLogs = await prisma.attendancelog.findMany({
      where: { employeeId: currentEmployeeId },
      orderBy: { createdAt: 'desc' },
      take: 5, // Limit to recent 5 attendance logs
      select: {
        actualClockIn: true,
        actualClockOut: true,
        createdAt: true,
        status: true, // This status refers to attendancelog_status (present, late, absent, permission)
        sessiondefinition: { // To compare with expected times for 'late' status
          select: {
            expectedClockIn: true,
          }
        }
      },
    });

    attendanceLogs.forEach(log => {
      // Create activity for check-in
      if (log.actualClockIn) {
        const checkInTime = new Date(log.actualClockIn);
        const expectedClockIn = new Date(log.sessiondefinition.expectedClockIn); // Assuming expectedClockIn is a Date object
        const checkInStatus = log.status === 'late' ? 'Late' : 'On time'; // Use the log status directly
        activities.push({
          id: `checkin-${log.createdAt.getTime()}`,
          action: 'Checked in',
          time: checkInTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
          date: log.createdAt,
          status: checkInStatus,
        });
      }
      // Create activity for check-out
      if (log.actualClockOut) {
        const checkOutTime = new Date(log.actualClockOut);
        // For checkout, we don't have a direct 'late' status in attendancelog.
        // It's often inferred from 'actualClockOut' vs 'expectedClockOut' in a more complex calculation.
        // For simplicity, mark as 'On time' unless you have a specific backend logic for 'early departure' here.
        activities.push({
          id: `checkout-${log.createdAt.getTime()}`,
          action: 'Checked out',
          time: checkOutTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
          date: log.createdAt,
          status: 'On time', // Simplified, could be 'Early'/'Late' based on sessiondefinition.expectedClockOut
        });
      }
    });

    // Fetch recent leave requests
    const leaveRequests = await prisma.leave.findMany({
      where: { employeeId: currentEmployeeId },
      orderBy: { requestedAt: 'desc' },
      take: 5, // Limit to recent 5 leave requests
      select: {
        id: true,
        leaveType: true,
        status: true,
        requestedAt: true,
      },
    });

    leaveRequests.forEach(leave => {
      activities.push({
        id: `leave-${leave.id}`,
        action: `Requested ${leave.leaveType} leave`,
        time: leave.requestedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
        date: leave.requestedAt,
        status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1), // Capitalize first letter
      });
    });

    // Sort all combined activities by their actual date (createdAt or requestedAt) in descending order
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Take the top 5 activities overall and reformat time for display
    const top5Activities = activities.slice(0, 5).map(activity => ({
      ...activity,
      time: formatRelativeTime(activity.date, activity.time),
    }));

    res.json(top5Activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
});

module.exports = router;