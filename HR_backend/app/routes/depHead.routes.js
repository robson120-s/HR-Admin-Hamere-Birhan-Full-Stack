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


// GET /api/dep-head/performance-data - Fetch employees and their reviews for the department
// In your backend file: routes/depHead.routes.js

// GET /api/dep-head/performance-data - FINAL, ROBUST VERSION
router.get("/performance-data", authenticate,async (req, res) => { // Auth middleware temporarily removed
  try {
    const loggedInUserId = req.user.id;

    const loggedInEmployee = await prisma.employee.findUnique({
      where: { userId: loggedInUserId },
      select: { departmentId: true }
    });

    if (!loggedInEmployee || !loggedInEmployee.departmentId) {
      return res.status(403).json({ error: "Test user is not assigned to a department." });
    }
    const departmentId = loggedInEmployee.departmentId;

    // Fetch the department info separately
    const department = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { id: true, name: true, description: true }
    });

    // Fetch all Staff and Interns in that department
    const employeesInDept = await prisma.employee.findMany({
      where: {
        departmentId: departmentId,
        user: {
          roles: { some: { role: { name: { in: ['Staff', 'Intern'] } } } }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: { select: { roles: { select: { role: { select: { name: true } } } } } }
      },
      orderBy: { firstName: 'asc' }
    });

    if (employeesInDept.length === 0) {
        // If no employees, return early with empty data
        return res.status(200).json({
            department,
            employees: [],
            performanceReviews: []
        });
    }

    const employeeIds = employeesInDept.map(e => e.id);

    // ✅ SIMPLIFIED REVIEW QUERY
    // Use a more standard groupBy query to get the latest review for each employee.
    // This is often more reliable than 'distinct'.
    const latestReviews = await prisma.performanceReview.groupBy({
        by: ['employeeId'],
        where: { employeeId: { in: employeeIds } },
        _max: {
            reviewDate: true, // Find the latest date for each employee
        }
    });
    
    // Now fetch the full review data for only those latest reviews
    const reviews = await prisma.performanceReview.findMany({
        where: {
            OR: latestReviews.map(r => ({
                employeeId: r.employeeId,
                reviewDate: r._max.reviewDate
            }))
        }
    });

    // Final payload
    const responseData = {
        department,
        employees: employeesInDept.map(emp => ({
            id: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            role: emp.user?.roles[0]?.role.name || 'N/A'
        })),
        performanceReviews: reviews
    };
    
    res.status(200).json(responseData);
  } catch (error) {
    // This will now catch any errors from the new queries
    console.error("Error fetching performance data:", error);
    res.status(500).json({ error: "Failed to fetch performance data." });
  }
});


// POST /api/dep-head/performance-review - Submit a new review
router.post("/performance-review", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const { employeeId, score, comments } = req.body;
        
        // ✅ 1. Get the LOGGED-IN user's Employee profile to find their name.
        const reviewerEmployee = await prisma.employee.findUnique({
            where: { userId: req.user.id },
            select: { firstName: true, lastName: true, departmentId: true }
        });
        const reviewerName = `${reviewerEmployee.firstName} ${reviewerEmployee.lastName}`;

        if (!employeeId || score === undefined || !comments) {
            return res.status(400).json({ error: "Employee ID, score, and comments are required." });
        }
        
        // ✅ 2. SECURITY CHECK: Ensure the employee being reviewed is in the reviewer's department.
        const employeeToReview = await prisma.employee.findUnique({ where: { id: parseInt(employeeId) } });
        if (!employeeToReview || employeeToReview.departmentId !== reviewerEmployee.departmentId) {
            return res.status(403).json({ error: "You can only review employees in your own department." });
        }

        const newReview = await prisma.performanceReview.create({
            data: {
                employeeId: parseInt(employeeId),
                reviewDate: new Date(),
                reviewerName: reviewerName, // Use the real reviewer's name
                score: parseInt(score),
                comments: comments
            }
        });

        res.status(201).json(newReview);
    } catch (error) {
        console.error("Error submitting performance review:", error);
        res.status(500).json({ error: "Failed to submit review." });
    }
});


module.exports = router;