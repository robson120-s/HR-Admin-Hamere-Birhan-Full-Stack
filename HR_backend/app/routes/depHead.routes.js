// In your backend file: routes/depHead.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma'); // or your generated path
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ==============================================================================
// GET /api/dep-head/dashboard 
// This is the complete, secure, and correctly scoped endpoint.
// ==============================================================================
router.get('/dashboard', authenticate, authorize("Department Head"), async (req, res) => {
  try {
    // --- STEP 1: IDENTIFY THE LOGGED-IN USER'S DEPARTMENT ---
    // The 'authenticate' middleware has already verified the token and added 'req.user'.
    const loggedInEmployee = await prisma.employee.findUnique({
      where: { userId: req.user.id },
      select: { departmentId: true } // We only need their department ID
    });

    // Security check: ensure the user is a valid employee assigned to a department
    if (!loggedInEmployee || !loggedInEmployee.departmentId) {
      return res.status(403).json({ error: "Access denied. User profile is not assigned to a department." });
    }
    const departmentId = loggedInEmployee.departmentId;

    // --- STEP 2: GATHER ALL RELEVANT DEPARTMENT IDs (THE PARENT + ALL ITS CHILDREN) ---
    const subDepartments = await prisma.department.findMany({
      where: { parentId: departmentId },
      select: { id: true }
    });
    // This is the complete list of department IDs this user manages
    const managedDeptIds = [departmentId, ...subDepartments.map(d => d.id)];

    // --- STEP 3: PERFORM SCOPED PRISMA QUERIES IN PARALLEL ---
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [
      staffInDept,
      internsInDept,
      presentToday,
      absentToday,
      pendingComplaints,
      recentComplaints,
      recentReviews,
    ] = await Promise.all([
      // Count Staff ONLY in the managed departments
      prisma.employee.count({ where: { departmentId: { in: managedDeptIds }, user: { roles: { some: { role: { name: 'Staff' } } } } } }),
      // Count Interns ONLY in the managed departments
      prisma.employee.count({ where: { departmentId: { in: managedDeptIds }, user: { roles: { some: { role: { name: 'Intern' } } } } } }),
      // Count Present today ONLY in the managed departments
      prisma.attendanceSummary.count({ where: { date: today, status: 'present', employee: { departmentId: { in: managedDeptIds } } } }),
      // Count Absent today ONLY in the managed departments
      prisma.attendanceSummary.count({ where: { date: today, status: 'absent', employee: { departmentId: { in: managedDeptIds } } } }),
      // Count OPEN complaints from employees ONLY in the managed departments
      prisma.complaint.count({ where: { status: 'open', employee: { departmentId: { in: managedDeptIds } } } }),
      // Get the 3 most recent OPEN complaints for the activity feed
      prisma.complaint.findMany({
        where: { status: 'open', employee: { departmentId: { in: managedDeptIds } } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { employee: { select: { firstName: true, lastName: true } } }
      }),
      // Get the 2 most recent Performance Reviews for the activity feed
      prisma.performanceReview.findMany({
          where: { employee: { departmentId: { in: managedDeptIds } } },
          orderBy: { reviewDate: 'desc' },
          take: 2,
          include: { employee: { select: { firstName: true, lastName: true } } }
      }),
    ]);
    
    // --- STEP 4: PROCESS AND COMBINE RECENT ACTIVITY ---
    const formattedComplaints = recentComplaints.map(c => ({
        id: `c-${c.id}`,
        type: "Complaint",
        message: `${c.employee.firstName} ${c.employee.lastName} submitted a new complaint.`,
        date: c.createdAt
    }));

    const formattedReviews = recentReviews.map(r => ({
        id: `r-${r.id}`,
        type: "Performance",
        message: `${r.employee.firstName} ${r.employee.lastName} had a performance review.`,
        date: r.reviewDate
    }));

    // Combine, sort by date, and take the most recent 5 activities
    const recentActivity = [...formattedComplaints, ...formattedReviews]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 5);

    // --- STEP 5: CONSTRUCT THE FINAL RESPONSE PAYLOAD ---
    const responseData = {
        present: presentToday,
        absent: absentToday,
        totalStaff: staffInDept,
        totalInterns: internsInDept,
        totalSubDepartment: subDepartments.length,
        pendingComplaints: pendingComplaints,
        recentActivity: recentActivity,
        // These can be replaced with real calculations later
        avgPerformance: 8.4, 
        staffAvg: 7.8,
        internAvg: 6.5,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching Department Head dashboard:", error);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

module.exports = router;