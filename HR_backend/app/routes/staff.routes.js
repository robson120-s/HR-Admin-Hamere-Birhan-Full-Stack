// HR_backend/app/routes/staff.routes.js

const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const authenticate = require('../middlewares/authMiddleware').authenticate; // Using provided authMiddleware

router.use(authenticate); // Apply authentication middleware to all staff routes

// GET /api/employee/dashboard (rest of the helper functions remain the same)
const getMonthBounds = (date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  return { startOfMonth, endOfMonth };
};

const getWeekBounds = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(date);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
};

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
    return activityDate.toLocaleString('en-US', { month: 'long', day: 'numeric' });
  }
}

// --- API Endpoints ---

// FIX 1: Remove :employeeId from path. Access employee ID from req.user.employee.id.
// GET /api/staff/dashboard/summary
router.get('/dashboard/summary', async (req, res) => {
  // Access employee ID from req.user.employee.id as per authMiddleware structure
  const currentEmployeeId = req.user.employee ? req.user.employee.id : null;

  if (!currentEmployeeId) { // Check if employee ID is valid
    return res.status(401).json({ message: 'Authentication failed: Employee record not found for authenticated user.' });
  }

  try {
    const now = new Date();
    const { startOfMonth, endOfMonth } = getMonthBounds(now);
    const { startOfWeek, endOfWeek } = getWeekBounds(now);

    const employee = await prisma.employee.findUnique({
      where: { id: currentEmployeeId },
      select: { firstName: true, lastName: true, userId: true },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const userName = `${employee.firstName} ${employee.lastName}`;

    const totalPresent = await prisma.attendancesummary.count({
      where: {
        employeeId: currentEmployeeId,
        date: { gte: startOfMonth, lte: endOfMonth },
        status: 'present',
      },
    });

    const totalAbsent = await prisma.attendancesummary.count({
      where: {
        employeeId: currentEmployeeId,
        date: { gte: startOfMonth, lte: endOfMonth },
        OR: [{ status: 'absent' }, { unplannedAbsence: true }],
      },
    });

    const lastSeenLog = await prisma.attendancelog.findFirst({
      where: { employeeId: currentEmployeeId, actualClockIn: { not: null } },
      orderBy: { actualClockIn: 'desc' },
      select: { actualClockIn: true },
    });
    const lastSeen = lastSeenLog ? lastSeenLog.actualClockIn.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    const absencesThisWeek = await prisma.attendancesummary.count({
      where: {
        employeeId: currentEmployeeId,
        date: { gte: startOfWeek, lte: endOfWeek },
        OR: [{ status: 'absent' }, { unplannedAbsence: true }],
      },
    });

    let notificationsCount = 0;
    if (employee.userId) {
      notificationsCount = await prisma.leave.count({
        where: { employeeId: currentEmployeeId, status: 'pending' },
      });
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

// GET /api/staff/holidays (No change needed - not employee specific)
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

// FIX 2: Remove :employeeId from path. Access employee ID from req.user.employee.id.
// GET /api/staff/dashboard/activities
router.get('/dashboard/activities', async (req, res) => {
  const currentEmployeeId = req.user.employee ? req.user.employee.id : null;

  if (!currentEmployeeId) {
    return res.status(401).json({ message: 'Authentication failed: Employee record not found for authenticated user.' });
  }

  try {
    const activities = [];

    const attendanceLogs = await prisma.attendancelog.findMany({
      where: { employeeId: currentEmployeeId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        actualClockIn: true, actualClockOut: true, createdAt: true, status: true,
        sessiondefinition: { select: { expectedClockIn: true } }
      },
    });

    attendanceLogs.forEach(log => {
      if (log.actualClockIn) {
        const checkInTime = new Date(log.actualClockIn);
        // Assuming log.sessiondefinition.expectedClockIn is a valid Date
        const checkInStatus = log.status === 'late' ? 'Late' : 'On time';
        activities.push({
          id: `checkin-${log.createdAt.getTime()}`, action: 'Checked in',
          time: checkInTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
          date: log.createdAt, status: checkInStatus,
        });
      }
      if (log.actualClockOut) {
        const checkOutTime = new Date(log.actualClockOut);
        activities.push({
          id: `checkout-${log.createdAt.getTime()}`, action: 'Checked out',
          time: checkOutTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
          date: log.createdAt, status: 'On time',
        });
      }
    });

    const leaveRequests = await prisma.leave.findMany({
      where: { employeeId: currentEmployeeId },
      orderBy: { requestedAt: 'desc' },
      take: 5,
      select: { id: true, leaveType: true, status: true, requestedAt: true },
    });

    leaveRequests.forEach(leave => {
      activities.push({
        id: `leave-${leave.id}`, action: `Requested ${leave.leaveType} leave`,
        time: leave.requestedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
        date: leave.requestedAt, status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
      });
    });

    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
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

// FIX 3: Remove :employeeId from path. Access employee ID from req.user.employee.id.
// GET /api/staff/attendance-history
router.get('/attendance-history', async (req, res) => {
  const { month, year } = req.query;
  const currentEmployeeId = req.user.employee ? req.user.employee.id : null;

  if (!currentEmployeeId) {
    return res.status(401).json({ message: 'Authentication failed: Employee record not found for authenticated user.' });
  }

  try {
    let dateFilter = {};
    if (month && year) {
      const yearInt = parseInt(year, 10);
      const monthInt = parseInt(month, 10) - 1;
      if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 0 || monthInt > 11) {
        return res.status(400).json({ message: 'Invalid month or year provided' });
      }
      const startOfMonth = new Date(yearInt, monthInt, 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(yearInt, monthInt + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      dateFilter = { gte: startOfMonth, lte: endOfMonth };
    } else {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);
      dateFilter = { gte: twelveMonthsAgo, lte: new Date() };
    }

    const attendanceHistory = await prisma.attendancesummary.findMany({
      where: { employeeId: currentEmployeeId, date: dateFilter },
      orderBy: { date: 'desc' },
      select: {
        id: true, date: true, status: true, lateArrival: true,
        earlyDeparture: true, unplannedAbsence: true, totalWorkHours: true, remarks: true,
      },
    });
    res.json(attendanceHistory);
  } catch (error) {
    console.error("Error fetching staff attendance history:", error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
});

// FIX 4: Use req.user.employee.id for creating complaints. Remove employeeId from req.body.
// Staff member submits a new complaint
router.post('/complaints', async (req, res) => {
  const currentEmployeeId = req.user.employee ? req.user.employee.id : null; // Correctly gets ID from token
  const { subject, description } = req.body; // Correctly parses body (assuming express.json is used)

  if (!currentEmployeeId) { // Correct authentication/authorization check
    return res.status(401).json({ message: 'Authentication failed: Employee record not found for authenticated user.' });
  }
  if (!subject || !description) { // Correct input validation
    return res.status(400).json({ message: 'Subject and description are required.' });
  }

  try {
    const newComplaint = await prisma.complaint.create({
      data: {
        employeeId: currentEmployeeId, // Correctly uses the authenticated employee ID
        subject,
        description,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ message: 'Failed to submit complaint. Internal server error.', details: error.message });
  }
});

// FIX 5: Remove :employeeId from path. Access employee ID from req.user.employee.id.
// Staff member fetches their own complaint history
router.get('/complaints', async (req, res) => {
  const currentEmployeeId = req.user.employee ? req.user.employee.id : null;

  if (!currentEmployeeId) {
    return res.status(401).json({ message: 'Authentication failed: Employee record not found for authenticated user.' });
  }

  try {
    const complaints = await prisma.complaint.findMany({
      where: { employeeId: currentEmployeeId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching staff complaints:", error);
    res.status(500).json({ message: 'Failed to fetch complaints. Internal server error.', details: error.message });
  }
});


// FIX 6: Remove :employeeId from path. Access employee ID from req.user.employee.id.
// GET /api/staff/profile
router.get('/profile', async (req, res) => {
  const currentEmployeeId = req.user.employee ? req.user.employee.id : null;

  if (!currentEmployeeId) {
    return res.status(401).json({ message: 'Authentication failed: Employee record not found for authenticated user.' });
  }

  try {
    const employeeProfile = await prisma.employee.findUnique({
      where: { id: currentEmployeeId },
      include: {
        user: { select: { username: true, email: true, isActive: true } },
        department_employee_departmentIdTodepartment: { select: { name: true } },
        department_employee_subDepartmentIdTodepartment: { select: { name: true } },
        position: { select: { name: true } },
        employmenttype: { select: { type: true } },
        jobstatus: { select: { status: true } },
        maritalstatus: { select: { status: true } },
        agreementstatus: { select: { status: true } },
      },
    });

    if (!employeeProfile) {
      return res.status(404).json({ message: 'Employee profile not found.' });
    }
    res.json(employeeProfile);
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    res.status(500).json({ message: 'Failed to fetch employee profile. Internal server error.', details: error.message });
  }
});


// FIX 7: Remove :employeeId from path. Access employee ID from req.user.employee.id.
// PATCH /api/staff/settings/change-password
router.put('/settings/change-password', async (req, res) => {
  const currentEmployeeId = req.user.employee ? req.user.employee.id : null;
  const { currentPassword, newPassword } = req.body;

  if (!currentEmployeeId) {
    return res.status(401).json({ message: 'Authentication failed: Employee record not found for authenticated user.' });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    const employee = await prisma.employee.findUnique({ where: { id: currentEmployeeId }, select: { userId: true }, });
    if (!employee || !employee.userId) { return res.status(404).json({ message: 'User not found for this employee.' }); }
    const user = await prisma.user.findUnique({ where: { id: employee.userId }, });
    if (!user) { return res.status(404).json({ message: 'User account not found.' }); }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) { return res.status(401).json({ message: 'Incorrect current password.' }); }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, updatedAt: new Date() }, });
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: 'Failed to change password. Internal server error.', details: error.message });
  }
});

// FIX 8: Remove :employeeId from path. Access employee ID from req.user.employee.id.
// PATCH /api/staff/settings/notifications
router.patch('/settings/notifications', async (req, res) => {
  const currentEmployeeId = req.user.employee ? req.user.employee.id : null;
  const { notifyOnComplaint } = req.body;

  if (!currentEmployeeId) {
    return res.status(401).json({ message: 'Authentication failed: Employee record not found for authenticated user.' });
  }
  if (typeof notifyOnComplaint !== 'boolean') {
    return res.status(400).json({ message: 'Invalid value for notifyOnComplaint. Must be a boolean.' });
  }

  try {
    const employee = await prisma.employee.findUnique({ where: { id: currentEmployeeId }, select: { userId: true }, });
    if (!employee || !employee.userId) { return res.status(404).json({ message: 'User not found for this employee.' }); }
    await prisma.user.update({ where: { id: employee.userId }, data: { notifyOnComplaint, updatedAt: new Date() }, });
    res.json({ message: 'Notification preferences updated successfully.' });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: 'Failed to update notification preferences. Internal server error.', details: error.message });
  }
});

module.exports = router;