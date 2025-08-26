// In your backend file: routes/depHead.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma'); // or your generated path
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

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

////////////Designation Routes
const getManagedDepartmentId = async (userId) => {
    const employee = await prisma.employee.findUnique({
        where: { userId: userId },
        select: { departmentId: true }
    });
    return employee?.departmentId;
};

// GET /api/dep-head/sub-departments - Fetch sub-departments for the logged-in head
// In your backend file: routes/depHead.routes.js

// GET /api/dep-head/sub-departments - Fetch sub-departments with DETAILED member counts
// In your backend file: routes/depHead.routes.js

// GET /api/dep-head/sub-departments - FINAL, EFFICIENT VERSION
router.get("/sub-departments", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const departmentId = await getManagedDepartmentId(req.user.id);
    if (!departmentId) {
      return res.status(403).json({ error: "User is not assigned to a department." });
    }
    
    // Step 1: Fetch the basic list of sub-departments for the logged-in head.
    const subDepartments = await prisma.department.findMany({
      where: { parentId: departmentId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true } // Select only what we need
    });

    // Step 2: For each sub-department, run separate, targeted count queries.
    // We use Promise.all to run all these database calls in parallel for maximum speed.
    const subDepartmentsWithCounts = await Promise.all(
      subDepartments.map(async (subDept) => {
        
        // Count staff specifically in this sub-department
        const staffCount = await prisma.employee.count({
          where: {
            // Check both departmentId and subDepartmentId fields
            OR: [
                { departmentId: subDept.id },
                { subDepartmentId: subDept.id }
            ],
            user: {
              roles: { some: { role: { name: 'Staff' } } },
            },
          },
        });

        // Count interns specifically in this sub-department
        const internCount = await prisma.employee.count({
          where: {
            OR: [
                { departmentId: subDept.id },
                { subDepartmentId: subDept.id }
            ],
            user: {
              roles: { some: { role: { name: 'Intern' } } },
            },
          },
        });
        
        // Construct the final object for this sub-department
        return {
          ...subDept,
          staffCount: staffCount,
          internCount: internCount,
          totalMembers: staffCount + internCount,
        };
      })
    );

    res.status(200).json(subDepartmentsWithCounts);

  } catch (error) {
    console.error("Error fetching sub-departments:", error);
    res.status(500).json({ error: "Failed to fetch sub-departments." });
  }
});

// POST /api/dep-head/sub-departments - Create a new sub-department under the user's dept
router.post("/sub-departments", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const departmentId = await getManagedDepartmentId(req.user.id);
        if (!departmentId) { return res.status(403).json({ error: "Cannot add sub-department." }); }
        
        const { name, description } = req.body;
        if (!name) { return res.status(400).json({ error: "Sub-department name is required." }); }

        const newSubDept = await prisma.department.create({
            data: { name, description, parentId: departmentId } // Automatically assign the correct parent
        });
        res.status(201).json(newSubDept);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "A department with this name already exists." });
        }
        res.status(500).json({ error: "Failed to create sub-department." });
    }
});

// PATCH /api/dep-head/sub-departments/:id - Update a sub-department
router.patch("/sub-departments/:id", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        // Security check could be added here to ensure the sub-dept belongs to the user's dept
        const updatedSubDept = await prisma.department.update({
            where: { id: parseInt(id) },
            data: { name, description }
        });
        res.status(200).json(updatedSubDept);
    } catch (error) {
        res.status(500).json({ error: "Failed to update sub-department." });
    }
});

// DELETE /api/dep-head/sub-departments/:id - Delete a sub-department
router.delete("/sub-departments/:id", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const { id } = req.params;
        // Security check could be added here
        await prisma.department.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete sub-department." });
    }
});











///////PROFILE
// In your backend file: routes/depHead.routes.js

// ... your existing router setup and other routes ...

// GET /api/dep-head/profile - Fetch the profile of the currently logged-in user
router.get("/profile", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const userId = req.user.id;

    const employeeProfile = await prisma.employee.findUnique({
      where: { userId: userId },
      // ✅ SELECT all fields from the Employee model
      select: {
        id: true,
        firstName: true,
        lastName: true,
        baptismalName: true,
        dateOfBirth: true,
        sex: true,
        nationality: true,
        phone: true,
        address: true,
        subCity: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        repentanceFatherName: true,
        repentanceFatherChurch: true,
        repentanceFatherPhone: true,
        academicQualification: true,
        educationalInstitution: true,
        salary: true,
        bonusSalary: true,
        accountNumber: true,
        photo: true,
        employmentDate: true,
        // Include all related data for a rich profile view
        user: { select: { email: true } },
        department: { select: { name: true } },
        position: { select: { name: true } },
        maritalStatus: { select: { status: true } },
        employmentType: { select: { type: true } },
        jobStatus: { select: { status: true } },
        agreementStatus: { select: { status: true } },
      },
    });

    if (!employeeProfile) {
      return res.status(404).json({ error: "Employee profile not found for the logged-in user." });
    }

    // No need to format on the backend; we can send the raw data.
    // The frontend will handle formatting.
    res.status(200).json(employeeProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile data." });
  }
});

router.patch("/settings/change-password", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    // 1. Get the user ID from the 'authenticate' middleware. This is secure.
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // 2. Server-side validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }

    // 3. Fetch the user's current record from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 4. Verify the provided 'currentPassword' against the hashed password in the DB
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password. Please try again." });
    }

    // 5. Hash the new password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 6. Update the user's record with the new hashed password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

////////////////Complain request
// POST /api/dep-head/complaints/submit - Submit a complaint for the LOGGED-IN user
router.post("/complaints/submit", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { subject, description } = req.body;
    
    // --- 1. Get Employee ID securely from the authenticated user ---
    // The 'authenticate' middleware adds 'req.user' which includes the employee profile
    const loggedInEmployeeId = req.user.employee?.id;

    // --- 2. Validation ---
    if (!loggedInEmployeeId) {
        return res.status(403).json({ error: "Your user account is not linked to an employee profile." });
    }
    if (!subject || !description) {
      return res.status(400).json({ error: "Subject and description are required." });
    }

    // --- 3. Create the Complaint ---
    const newComplaint = await prisma.complaint.create({
      data: {
        employeeId: loggedInEmployeeId, // Use the secure, server-side ID
        subject: subject,
        description: description,
      },
    });

    res.status(201).json(newComplaint);
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ error: "Failed to submit complaint." });
  }
});

// GET /api/dep-head/complaints - Fetch all complaints submitted BY the logged-in user
router.get("/complaints", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    // 1. Get the logged-in user's Employee ID securely from the middleware
    const loggedInEmployeeId = req.user.employee?.id;

    if (!loggedInEmployeeId) {
      return res.status(403).json({ error: "Your user account is not linked to an employee profile." });
    }

    // 2. Fetch only the complaints where the employeeId matches the logged-in user
    const myComplaints = await prisma.complaint.findMany({
      where: {
        employeeId: loggedInEmployeeId,
      },
      orderBy: {
        createdAt: 'desc', // Show the most recent complaints first
      },
      select: {
          id: true,
          subject: true,
          description: true,
          status: true,
          response: true,
          createdAt: true,
          updatedAt: true,
      }
    });

    res.status(200).json(myComplaints);
  } catch (error) {
    console.error("Error fetching user's complaints:", error);
    res.status(500).json({ error: "Failed to fetch complaints." });
  }
});


////////////Leave Request
router.get("/employees-for-leave", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const departmentId = await getManagedDepartmentId(req.user.id);
        if (!departmentId) { return res.status(403).json({ error: "User not assigned to a department." }); }

        const subDepts = await prisma.department.findMany({ where: { parentId: departmentId }, select: { id: true }});
        const managedDeptIds = [departmentId, ...subDepts.map(d => d.id)];

        const employees = await prisma.employee.findMany({
            where: { departmentId: { in: managedDeptIds } },
            select: { id: true, firstName: true, lastName: true }
        });
        
        const formatted = employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }));
        res.json(formatted);
    } catch(error) {
        res.status(500).json({ error: "Failed to fetch employees." });
    }
});

// GET /api/dep-head/leaves - Fetch leave requests for the user's department
router.get("/leaves", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const departmentId = await getManagedDepartmentId(req.user.id);
    if (!departmentId) { return res.status(403).json({ error: "User not assigned to a department." }); }

    const subDepts = await prisma.department.findMany({ where: { parentId: departmentId }, select: { id: true }});
    const managedDeptIds = [departmentId, ...subDepts.map(d => d.id)];
    
    const leaveRequests = await prisma.leave.findMany({
      where: { employee: { departmentId: { in: managedDeptIds } } },
      orderBy: { requestedAt: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true } } }
    });
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave requests." });
  }
});

// POST /api/dep-head/leaves - Submit a new leave request for an employee
router.post("/leaves", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;
        if (!employeeId || !leaveType || !startDate || !endDate) {
            return res.status(400).json({ error: "All fields are required." });
        }
        
        // Security Check: is the employee in the manager's department?
        const departmentId = await getManagedDepartmentId(req.user.id);
        const employee = await prisma.employee.findUnique({ where: { id: parseInt(employeeId) }});
        if (!employee || employee.departmentId !== departmentId) {
            return res.status(403).json({ error: "You can only submit requests for employees in your department." });
        }
        
        const newLeaveRequest = await prisma.leave.create({
            data: {
                employeeId: parseInt(employeeId),
                leaveType: leaveType.toLowerCase(), // Match enum 'annual', 'sick', etc.
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason: reason,
                status: 'pending' // Default status
            }
        });
        // Include employee name in response for easy UI update
        const finalResponse = await prisma.leave.findUnique({
            where: { id: newLeaveRequest.id },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });
        res.status(201).json(finalResponse);
    } catch (error) {
        res.status(500).json({ error: "Failed to create leave request." });
    }
});


//////Mark Attendance 
// In your backend file: routes/depHead.routes.js

// In your backend file: routes/depHead.routes.js

// GET /api/dep-head/attendance-roster?date=... - FINAL, ROBUST VERSION
// In your backend file: routes/depHead.routes.js

// GET /api/dep-head/attendance-roster?date=... - 

// in depHead.routes.js

router.get("/attendance-roster", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) { return res.status(400).json({ error: "A date parameter is required." }); }
    
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const loggedInUser = req.user;
    if (!loggedInUser.employee || !loggedInUser.employee.departmentId) {
      return res.status(403).json({ error: "Access denied: Your user account is not linked to a department." });
    }
    const departmentId = loggedInUser.employee.departmentId;

    // STEP 1: Get the IDs of all sub-departments managed by the department head.
    const subDepartments = await prisma.department.findMany({
        where: { parentId: departmentId },
        select: { id: true, name: true }
    });

    if (subDepartments.length === 0) {
        return res.status(200).json({ subDepartments: [], attendanceRecords: {}, onLeaveIds: [] });
    }
    const subDepartmentIds = subDepartments.map(sd => sd.id);

    // STEP 2: Find all employees who belong to ANY of those sub-departments.
    // ✅ THIS IS THE CRITICAL CHANGE ✅
    // We are now querying the `subDepartmentId` field.
    const employees = await prisma.employee.findMany({
        where: {
            subDepartmentId: { in: subDepartmentIds },
            user: { roles: { some: { role: { name: { in: ['Staff', 'Intern'] } } } } }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            subDepartmentId: true, // select the subDepartmentId to help with sorting
            user: { select: { roles: { select: { role: { select: { name: true } } } } } }
        }
    });

    // STEP 3: Process the roster by grouping employees into their sub-departments.
    const processedRoster = subDepartments.map(sd => {
        const staff = [];
        const interns = [];

        // Find employees from the list that belong to the current sub-department (sd)
        employees.forEach(emp => {
            if (emp.subDepartmentId === sd.id) {
                const role = emp.user?.roles[0]?.role.name;
                const employeeData = { id: emp.id, name: `${emp.firstName} ${emp.lastName}` };
                if (role === 'Staff') staff.push(employeeData);
                else if (role === 'Intern') interns.push(employeeData);
            }
        });
        return { id: sd.id, name: sd.name, staff, interns };
    });

    // The rest of the logic remains the same.
    const allEmployeeIds = employees.map(e => e.id);

    if (allEmployeeIds.length === 0) {
        return res.status(200).json({ subDepartments: processedRoster, attendanceRecords: {}, onLeaveIds: [] });
    }

    const leaves = await prisma.leave.findMany({
      where: { employeeId: { in: allEmployeeIds }, status: 'approved', startDate: { lte: targetDate }, endDate: { gte: targetDate } },
      select: { employeeId: true }
    });
    const onLeaveEmployeeIds = new Set(leaves.map(l => l.employeeId));

    const attendanceLogs = await prisma.attendanceLog.findMany({
      where: { date: targetDate, employeeId: { in: allEmployeeIds } },
      select: { employeeId: true, sessionId: true, status: true }
    });

    const attendanceMap = {};
    attendanceLogs.forEach(log => {
        const sessionMap = { 1: 'morning', 2: 'afternoon', 3: 'evening' };
        const session = sessionMap[log.sessionId];
        if (session) {
            if (!attendanceMap[log.employeeId]) attendanceMap[log.employeeId] = {};
            attendanceMap[log.employeeId][session] = log.status;
        }
    });
    
    res.status(200).json({
      subDepartments: processedRoster,
      attendanceRecords: attendanceMap,
      onLeaveIds: Array.from(onLeaveEmployeeIds)
    });
  } catch (error) {
    console.error("Error fetching attendance roster:", error);
    res.status(500).json({ error: "Failed to fetch attendance roster." });
  }
});


// POST /api/dep-head/attendance - Save attendance for the day// in depHead.routes.js

// POST /api/dep-head/attendance - CORRECTED to use subDepartmentId
router.post("/attendance", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { date, attendance } = req.body;
    const loggedInUser = req.user;

    // 1. INPUT VALIDATION
    if (!date || typeof attendance !== 'object' || attendance === null) {
      return res.status(400).json({ error: "Invalid request body. 'date' and 'attendance' object are required." });
    }
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }
    targetDate.setUTCHours(0, 0, 0, 0);

    // 2. SECURITY CHECK: Get a list of employees this manager is ALLOWED to edit.
    if (!loggedInUser.employee || !loggedInUser.employee.departmentId) {
      return res.status(403).json({ error: "Access denied: Your user account is not linked to a department." });
    }
    const parentDepartmentId = loggedInUser.employee.departmentId;

    // ✅ FIX: First, find the IDs of the sub-departments this manager oversees.
    const managedSubDepts = await prisma.department.findMany({
        where: { parentId: parentDepartmentId },
        select: { id: true }
    });
    const managedSubDeptIds = managedSubDepts.map(d => d.id);

    if (managedSubDeptIds.length === 0) {
        // This is a valid 404: the manager's department has no sub-departments.
        return res.status(404).json({ error: "You are not managing any sub-departments." });
    }

    // ✅ FIX: Now, find all employees who belong to those sub-departments.
    const managedEmployees = await prisma.employee.findMany({
        where: {
            subDepartmentId: { in: managedSubDeptIds }
        },
        select: { id: true }
    });
    const managedEmployeeIds = new Set(managedEmployees.map(emp => emp.id));


    // 3. BUILD DATABASE OPERATIONS (with validation)
    const operations = [];
    const validStatuses = ['present', 'late', 'absent', 'permission'];

    for (const employeeIdStr in attendance) {
      const employeeId = parseInt(employeeIdStr, 10);

      // SECURITY: Skip any employee ID that is not managed by this Department Head.
      if (!managedEmployeeIds.has(employeeId)) {
        console.warn(`SECURITY WARNING: User ${loggedInUser.id} attempted to save attendance for unmanaged employee ${employeeId}. Skipping.`);
        continue; // Silently ignore and move to the next employee
      }

      for (const session in attendance[employeeIdStr]) {
        const sessionId = { morning: 1, afternoon: 2, evening: 3 }[session];
        const status = attendance[employeeIdStr][session];
        
        if (sessionId && status && validStatuses.includes(status)) {
            operations.push(
                prisma.attendanceLog.upsert({
                    where: { employeeId_date_sessionId: { employeeId, date: targetDate, sessionId } },
                    update: { status: status },
                    create: { employeeId, date: targetDate, sessionId, status }
                })
            );
        }
      }
    }

    if (operations.length === 0) {
      return res.status(200).json({ message: "No valid attendance data was provided to save." });
    }
    
    // 4. EXECUTE TRANSACTION
    await prisma.$transaction(operations);
    res.status(200).json({ message: "Attendance saved successfully." });

  } catch (error) {
    console.error("Failed to save attendance:", error);
    res.status(500).json({ error: "An unexpected error occurred while saving attendance." });
  }
});


module.exports = router;