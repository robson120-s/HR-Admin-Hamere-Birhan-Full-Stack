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
//////SECOND PAGE //////
// GET /api/employee/history
router.get('/attendance-history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Step 1: Find employee linked to the logged-in user
    const employee = await prisma.employee.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }

    // Step 2: Fetch attendance summaries for the employee
    const history = await prisma.attendanceSummary.findMany({
      where: { employeeId: employee.id },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        status: true
      }
    });

    // Step 3: Format dates to "YYYY-MM-DD" and return
    const formatted = history.map(entry => ({
      date: new Date(entry.date).toISOString().split('T')[0],
      status: entry.status
    }));

    res.status(200).json(formatted);

  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ error: "Failed to load attendance history." });
  }
});

// GET /api/employee/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        roles: {
          include: {
            role: true,
          },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            employmentDate: true,
            salary: true,
            address: true,
            subCity: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.employees.length === 0) {
      return res.status(404).json({ error: "Employee profile not found." });
    }

    const emp = user.employees[0];

    const profile = {
      employeeId: emp.id,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: user.email,
      phone: emp.phone,
      department: emp.department?.name,
      roles: user.roles.map(r => r.role.name),
      joinedDate: emp.employmentDate,
      salary: emp.salary,
      location: emp.address || emp.subCity || "N/A",
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to load profile." });
  }
});


// PATCH /api/employee/change-password
router.patch('/change-password', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: "New passwords do not match." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Failed to update password." });
  }
});


module.exports = router;
