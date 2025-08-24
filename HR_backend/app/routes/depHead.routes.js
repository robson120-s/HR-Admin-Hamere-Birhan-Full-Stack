// In your backend file: routes/depHead.routes.js

// GET /api/dep-head/dashboard - A correctly scoped dashboard for the logged-in Department Head
router.get('/dashboard', authenticate, authorize("Department Head"), async (req, res) => {
  try {
    // --- STEP 1: IDENTIFY THE USER'S DEPARTMENT ---
    const loggedInEmployee = await prisma.employee.findUnique({
      where: { userId: req.user.id },
      select: { departmentId: true } // We only need their department ID
    });

    if (!loggedInEmployee || !loggedInEmployee.departmentId) {
      return res.status(403).json({ error: "Access denied. You are not assigned to a department." });
    }
    const departmentId = loggedInEmployee.departmentId;

    // --- STEP 2: GATHER ALL RELEVANT DEPARTMENT IDs (PARENT + CHILDREN) ---
    const subDepartments = await prisma.department.findMany({
      where: { parentId: departmentId },
      select: { id: true }
    });
    // This is the complete list of department IDs this user manages
    const managedDeptIds = [departmentId, ...subDepartments.map(d => d.id)];

    // --- STEP 3: PERFORM SCOPED PRISMA QUERIES ---
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [
      staffInDept,
      internsInDept,
      presentToday,
      absentToday,
      pendingComplaints,
      recentComplaints,
      // Add a query for recent performance reviews
      recentReviews,
    ] = await Promise.all([
      // Count Staff in the managed departments
      prisma.employee.count({ where: { departmentId: { in: managedDeptIds }, user: { roles: { some: { role: { name: 'Staff' } } } } } }),
      // Count Interns in the managed departments
      prisma.employee.count({ where: { departmentId: { in: managedDeptIds }, user: { roles: { some: { role: { name: 'Intern' } } } } } }),
      // Count Present today in the managed departments
      prisma.attendanceSummary.count({ where: { date: today, status: 'present', employee: { departmentId: { in: managedDeptIds } } } }),
      // Count Absent today in the managed departments
      prisma.attendanceSummary.count({ where: { date: today, status: 'absent', employee: { departmentId: { in: managedDeptIds } } } }),
      // Count OPEN complaints from employees in the managed departments
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
      // You could add queries for recent Leave requests, etc. here as well
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

    // Combine and sort all activities by date, and take the most recent 5
    const recentActivity = [...formattedComplaints, ...formattedReviews]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 5);


    // --- STEP 5: CONSTRUCT FINAL RESPONSE ---
    const responseData = {
        present: presentToday,
        absent: absentToday,
        totalStaff: staffInDept,
        totalInterns: internsInDept,
        totalSubDepartment: subDepartments.length,
        pendingComplaints: pendingComplaints,
        recentActivity: recentActivity,
        // Mocking these for now, as calculating them requires more complex logic
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