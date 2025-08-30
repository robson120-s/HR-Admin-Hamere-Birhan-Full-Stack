// In your backend file: routes/depHead.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma'); // or your generated path
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { processAttendanceForDate } = require('../jobs/attendanceProcessor');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ==============================================================================
// GET /api/dep-head/dashboard 
// This is the complete, secure, and correctly scoped endpoint.
// ==============================================================================
// in your backend routes file (e.g., depHead.routes.js)

// in HR_backend/app/routes/depHead.routes.js

// in HR_backend/app/routes/depHead.routes.js

router.get('/dashboard', authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const departmentId = req.user.employee.departmentId;
    if (!departmentId) {
      return res.status(403).json({ error: "Access denied. User profile is not assigned to a department." });
    }

    const subDepartments = await prisma.department.findMany({
      where: { parentId: departmentId },
      select: { id: true }
    });
    const managedDeptIds = [departmentId, ...subDepartments.map(d => d.id)];

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    const [
      staffInDept,
      internsInDept,
      presentToday,
      absentToday,
      meetings,
      allReviews,
      actionedLeaves,
      actionedOvertimes,
      recentActivityLogs
    ] = await Promise.all([
      // --- Basic Counts ---
      prisma.employee.count({ where: { OR: [{departmentId: { in: managedDeptIds }}, {subDepartmentId: { in: managedDeptIds }}], user: { roles: { some: { role: { name: 'Staff' } } } } } }),
      prisma.employee.count({ where: { OR: [{departmentId: { in: managedDeptIds }}, {subDepartmentId: { in: managedDeptIds }}], user: { roles: { some: { role: { name: 'Intern' } } } } } }),
      prisma.attendanceSummary.count({ where: { date: today, status: 'present', employee: { departmentId: { in: managedDeptIds } } } }),
      prisma.attendanceSummary.count({ where: { date: today, status: 'absent', employee: { departmentId: { in: managedDeptIds } } } }),
      
      // --- Data for Components ---
      prisma.meeting.findMany({ orderBy: { date: 'asc' } }),
      
      prisma.performanceReview.findMany({
          where: { employee: { OR: [{departmentId: { in: managedDeptIds }}, {subDepartmentId: { in: managedDeptIds }}] } },
          include: { employee: { select: { user: { select: { roles: { select: { role: { select: { name: true } } } } } } } } }
      }),
      
      prisma.leave.findMany({
          where: { 
              status: { in: ['approved', 'rejected'] }, 
              updatedAt: { gte: thirtyDaysAgo }, 
              employee: { OR: [{departmentId: { in: managedDeptIds }}, {subDepartmentId: { in: managedDeptIds }}] } 
          },
          orderBy: { updatedAt: 'desc' }, 
          take: 3,
          include: { employee: { select: { firstName: true, lastName: true } } }
      }),
      
      prisma.overtimeLog.findMany({
          where: { 
              approvalStatus: { in: ['approved', 'rejected'] }, 
              employee: { OR: [{departmentId: { in: managedDeptIds }}, {subDepartmentId: { in: managedDeptIds }}] } 
          },
          orderBy: { updatedAt: 'desc' }, 
          take: 3,
          include: { employee: { select: { firstName: true, lastName: true } } }
      }),
      
      prisma.activityLog.findMany({
          where: { departmentId: departmentId },
          orderBy: { createdAt: 'desc' },
          take: 7,
          include: {
              actor: { select: { firstName: true, lastName: true } },
              target: { select: { firstName: true, lastName: true } }
          }
      })
    ]);
    
    // --- Performance Score Processing ---
    let totalScore = 0, staffScore = 0, internScore = 0;
    let staffReviewCount = 0, internReviewCount = 0;
    allReviews.forEach(r => {
        const role = r.employee.user?.roles[0]?.role.name;
        totalScore += r.score;
        if (role === 'Staff' || role === 'Department Head') {
            staffScore += r.score;
            staffReviewCount++;
        } else if (role === 'Intern') {
            internScore += r.score;
            internReviewCount++;
        }
    });

    // --- Process Actioned Requests for its own card ---
    const formattedLeaves = actionedLeaves.map(l => ({ id: `l-${l.id}`, type: `Leave ${l.status}`, message: `${l.employee.firstName}'s leave request was ${l.status}.`, date: l.updatedAt }));
    const formattedOvertimes = actionedOvertimes.map(o => ({ id: `o-${o.id}`, type: `Overtime ${o.approvalStatus}`, message: `${o.employee.firstName}'s overtime was ${o.approvalStatus}.`, date: o.updatedAt }));
    const actionedRequests = [...formattedLeaves, ...formattedOvertimes]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 5); // Ensure a max of 5 for this list

    // --- Format the new true Activity Log ---
    const recentActivity = recentActivityLogs.map(log => {
        let message = `An action was performed by ${log.actor.firstName}.`; // Default message
        switch(log.type) {
            case 'ATTENDANCE_MARKED':
                message = `${log.actor.firstName} ${log.actor.lastName} marked attendance for ${new Date(log.createdAt).toLocaleDateString()}.`;
                break;
            case 'REVIEW_SUBMITTED':
                message = `${log.actor.firstName} submitted a performance review for ${log.target.firstName}.`;
                break;
            case 'OVERTIME_REQUESTED':
                message = `${log.actor.firstName} requested overtime for ${log.target.firstName}.`;
                break;
            case 'LEAVE_REQUESTED':
                message = `${log.target.firstName} submitted a leave request.`;
                break;
            case 'COMPLAINT_SUBMITTED':
                message = `${log.actor.firstName} submitted a new complaint.`;
                break;
        }
        return {
            id: log.id,
            type: log.type,
            message: message,
            date: log.createdAt,
        }
    });

    // --- Final Response Payload ---
    const responseData = {
        present: presentToday,
        absent: absentToday,
        totalStaff: staffInDept,
        totalInterns: internsInDept,
        totalSubDepartment: subDepartments.length,
        meetings: meetings,
        actionedRequests: actionedRequests,
        recentActivity: recentActivity,
        avgPerformance: allReviews.length > 0 ? (totalScore / allReviews.length) : 0, 
        staffAvg: staffReviewCount > 0 ? (staffScore / staffReviewCount) : 0,
        internAvg: internReviewCount > 0 ? (internScore / internReviewCount) : 0,
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
// in HR_backend/app/routes/dep-head.routes.js

// This is an example name, use the one in your file
router.get("/performance-data", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const departmentId = req.user.employee.departmentId;

        if (!departmentId) {
            return res.status(403).json({ error: "User is not assigned to a department." });
        }

        const department = await prisma.department.findUnique({
            where: { id: departmentId },
            select: { name: true }
        });

        // Fetch all employees in the department
        const allEmployees = await prisma.employee.findMany({
            where: {
                departmentId: departmentId,
                jobStatus: { status: 'Active' }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                    select: { roles: { select: { role: { select: { name: true } } } } }
                }
            }
        });

        // ✅ NEW: Categorize employees into staff and interns
        const staff = [];
        const interns = [];
        allEmployees.forEach(emp => {
            const role = emp.user?.roles[0]?.role.name;
            const employeeData = {
                id: emp.id,
                firstName: emp.firstName,
                lastName: emp.lastName,
                role: role, // Keep the role for display
            };

            if (role === 'Staff') {
                staff.push(employeeData);
            } else if (role === 'Intern') {
                interns.push(employeeData);
            }
        });

        // Fetch performance reviews for all employees in this department
        const employeeIds = allEmployees.map(e => e.id);
        const performanceReviews = await prisma.performanceReview.findMany({
            where: {
                employeeId: { in: employeeIds }
            },
            orderBy: { reviewDate: 'desc' }
        });

        res.status(200).json({
            department,
            staff, // Send categorized list
            interns, // Send categorized list
            performanceReviews,
        });

    } catch (error) {
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
        const reviewedEmployee = await prisma.employee.findUnique({ where: { id: newReview.employeeId }, select: { firstName: true } });
await prisma.activityLog.create({
    data: {
        type: 'REVIEW_SUBMITTED',
        message: `You submitted a review for ${reviewedEmployee.firstName}.`,
        actorId: req.user.employee.id,
        targetId: newReview.employeeId,
        departmentId: req.user.employee.departmentId,
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
        const departmentId = req.user.employee.departmentId;

        if (!departmentId) {
            return res.status(403).json({ error: "User is not assigned to a department." });
        }

        // Step 1: Fetch all sub-departments
        const subDepts = await prisma.department.findMany({
            where: { parentId: departmentId },
            select: { id: true, name: true, description: true },
            orderBy: { name: 'asc' }
        });

        // Step 2: For each sub-department, fetch its members and categorize them
        const subDeptsWithMembers = await Promise.all(
            subDepts.map(async (sub) => {
                const employees = await prisma.employee.findMany({
                    where: { subDepartmentId: sub.id },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        photo: true,
                        user: {
                            select: { roles: { select: { role: { select: { name: true } } } } }
                        }
                    }
                });

                const staff = [];
                const interns = [];
                employees.forEach(emp => {
                    const memberData = {
                        id: emp.id,
                        name: `${emp.firstName} ${emp.lastName}`,
                        photo: emp.photo,
                    };
                    const role = emp.user?.roles[0]?.role.name;
                    if (role === 'Staff') {
                        staff.push(memberData);
                    } else if (role === 'Intern') {
                        interns.push(memberData);
                    }
                });

                return {
                    ...sub,
                    staff,
                    interns,
                    totalMembers: employees.length, // Add a total count for display
                };
            })
        );

        res.status(200).json(subDeptsWithMembers);

    } catch (error) {
        console.error("Error fetching sub-departments with members:", error);
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





// GET /api/dep-head/attendance-overview - Fetch monthly attendance for the Dep Head's team
// in HR_backend/app/routes/depHead.routes.js

router.post("/attendance", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { date, attendance } = req.body;
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const logOperations = [];
    const employeeIdsToProcess = new Set();

    for (const employeeId in attendance) {
      employeeIdsToProcess.add(parseInt(employeeId));
      for (const session in attendance[employeeId]) {
        const sessionId = { morning: 1, afternoon: 2, evening: 3 }[session];
        const status = attendance[employeeId][session];
        
        if (sessionId && status) {
            logOperations.push(
                prisma.attendanceLog.upsert({
                    where: { employeeId_date_sessionId: { employeeId: parseInt(employeeId), date: targetDate, sessionId } },
                    update: { status: status },
                    create: { employeeId: parseInt(employeeId), date: targetDate, sessionId, status }
                })
            );
        }
      }
    }

    const summaryOperations = await processAttendanceForDate(targetDate, Array.from(employeeIdsToProcess));
    
    await prisma.$transaction([...logOperations, ...summaryOperations]);

    await prisma.activityLog.create({
    data: {
        type: 'ATTENDANCE_MARKED',
        message: `You marked attendance for ${targetDate.toLocaleDateString()}.`,
        actorId: req.user.employee.id,
        departmentId: req.user.employee.departmentId,
    }
});

    res.status(200).json({ message: "Attendance saved and daily summary updated successfully." });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Failed to save attendance." });
  }
});

// ✅ FINAL VERSION: The Intelligent Attendance Overview
router.get("/attendance-overview", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { year, month } = req.query;
    const departmentId = req.user.employee.departmentId;

    if (!year || !month || !departmentId) {
      return res.status(400).json({ error: "Year, month, and department context are required." });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const daysInMonth = endDate.getUTCDate();

    // Step 1: Fetch ALL active employees in the department
    const employees = await prisma.employee.findMany({
      where: { departmentId: departmentId, jobStatus: { status: 'Active' } },
      select: { id: true, firstName: true, lastName: true, photo: true },
      orderBy: { firstName: 'asc' }
    });
    if (employees.length === 0) {
      return res.status(200).json({ employees: [], attendanceMap: {} });
    }
    const employeeIds = employees.map(e => e.id);

    // Step 2: Fetch all necessary data for the month in parallel
    const [summaries, holidays] = await Promise.all([
        prisma.attendanceSummary.findMany({
            where: { employeeId: { in: employeeIds }, date: { gte: startDate, lte: endDate } },
            select: { employeeId: true, date: true, status: true },
        }),
        prisma.holiday.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            select: { date: true }
        })
    ]);

    const holidayDates = new Set(holidays.map(h => new Date(h.date).getUTCDate()));
    const summaryMap = new Map();
    summaries.forEach(rec => {
        const key = `${rec.employeeId}-${new Date(rec.date).getUTCDate()}`;
        summaryMap.set(key, rec.status);
    });

    // Step 3: Build the complete attendance map for EVERY day for EVERY employee
    const finalAttendanceMap = {};
    for (const emp of employees) {
        finalAttendanceMap[emp.id] = {};
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(Date.UTC(year, month - 1, day));
            const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday
            const key = `${emp.id}-${day}`;
            
            // Apply logic in order of priority: Summary > Holiday > Weekend > Default
            if (summaryMap.has(key)) {
                finalAttendanceMap[emp.id][day] = summaryMap.get(key);
            } else if (holidayDates.has(day)) {
                finalAttendanceMap[emp.id][day] = 'holiday';
            } else if (dayOfWeek === 0) {
                finalAttendanceMap[emp.id][day] = 'weekend';
            } else {
                finalAttendanceMap[emp.id][day] = null; // A normal, unmarked working day
            }
        }
    }

    res.status(200).json({ employees, attendanceMap: finalAttendanceMap });
  } catch (error) {
    console.error("Error fetching department attendance overview:", error);
    res.status(500).json({ error: "Failed to fetch attendance data." });
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

// GET route for fetching attendance roster
// router.get("/attendance-roster", authenticate, authorize("Department Head"), async (req, res) => {
//   try {
//     const { date } = req.query; // Note: using req.query for GET requests
//     if (!date) return res.status(400).json({ error: "A date parameter is required." });
    
//     // Your existing attendance roster logic here...
//     // (the code you had before for fetching the roster)
    
//   } catch (error) {
//     console.error("Error fetching attendance roster:", error);
//     res.status(500).json({ error: "Failed to fetch attendance roster." });
//   }
// });

// POST route for saving attendance
// GET route for fetching attendance roster
router.get("/attendance-roster", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { date } = req.query; // Note: using req.query for GET requests
    if (!date) return res.status(400).json({ error: "A date parameter is required." });
    
    // Your existing attendance roster logic here...
    // (the code you had before for fetching the roster)
    
  } catch (error) {
    console.error("Error fetching attendance roster:", error);
    res.status(500).json({ error: "Failed to fetch attendance roster." });
  }
});

// POST route for saving attendance
router.post("/attendance", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { date, attendance } = req.body;
    
    if (!date || !attendance) {
      return res.status(400).json({ error: "Date and attendance data are required." });
    }
    
    // Convert date to UTC midnight
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    
    console.log("Saving attendance for date:", targetDate.toISOString());
    console.log("Attendance data:", JSON.stringify(attendance));

    const logOperations = [];
    const employeeIdsToProcess = new Set();

    for (const employeeId in attendance) {
      employeeIdsToProcess.add(parseInt(employeeId));
      
      for (const sessionId in attendance[employeeId]) {
        const status = attendance[employeeId][sessionId];
        
        if (status) {
          logOperations.push(
            prisma.attendanceLog.upsert({
              where: { 
                employeeId_date_sessionId: { 
                  employeeId: parseInt(employeeId), 
                  date: targetDate, 
                  sessionId: parseInt(sessionId) 
                } 
              },
              update: { status: status },
              create: { 
                employeeId: parseInt(employeeId), 
                date: targetDate, 
                sessionId: parseInt(sessionId), 
                status: status 
              }
            })
          );
        }
      }
    }

    await prisma.$transaction(logOperations);
    
    // Immediately process the attendance to update summaries
    try {
      const processOperations = await processAttendanceForDate(targetDate, Array.from(employeeIdsToProcess));
      if (processOperations.length > 0) {
        await prisma.$transaction(processOperations);
        console.log(`Processed ${processOperations.length} attendance summaries`);
      }
    } catch (processError) {
      console.error("Error processing attendance:", processError);
      // Don't fail the request if processing fails
    }

    res.status(200).json({ message: "Attendance saved and processed successfully." });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Failed to save attendance." });
  }
});


// POST /api/dep-head/attendance - Save attendance for the day// in depHead.routes.js

// POST /api/dep-head/attendance - CORRECTED to use subDepartmentId



router.get("/export-attendance", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // Expecting 'YYYY-MM-DD'
        const departmentId = req.user.employee.departmentId;

        if (!startDate || !endDate || !departmentId) {
            return res.status(400).json({ error: "Start date, end date, and department context are required." });
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);

        // --- Step 1: Get all employees, just like the overview page ---
        const employees = await prisma.employee.findMany({
            where: {
                departmentId: departmentId,
                jobStatus: { status: 'Active' }
            },
            select: { id: true, firstName: true, lastName: true },
            orderBy: { firstName: 'asc' }
        });
        const employeeIds = employees.map(e => e.id);

        // --- Step 2: Get all summaries and holidays in the range, just like the overview page ---
        const [summaries, holidays, logs] = await Promise.all([
            prisma.attendanceSummary.findMany({
                where: { employeeId: { in: employeeIds }, date: { gte: start, lte: end } },
                select: { employeeId: true, date: true, status: true },
            }),
            prisma.holiday.findMany({
                where: { date: { gte: start, lte: end } },
                select: { date: true }
            }),
            // Also fetch raw logs to get session-specific data for the export
            prisma.attendanceLog.findMany({
                where: { employeeId: { in: employeeIds }, date: { gte: start, lte: end } },
                select: { employeeId: true, date: true, sessionId: true, status: true }
            })
        ]);

        const holidayDates = new Set(holidays.map(h => new Date(h.date).toISOString().slice(0, 10)));
        const summaryMap = new Map();
        summaries.forEach(rec => {
            const dateStr = new Date(rec.date).toISOString().slice(0, 10);
            const key = `${rec.employeeId}-${dateStr}`;
            summaryMap.set(key, rec.status);
        });

        const logMap = new Map();
        logs.forEach(log => {
            const dateStr = new Date(log.date).toISOString().slice(0, 10);
            const key = `${log.employeeId}-${dateStr}`;
            if (!logMap.has(key)) logMap.set(key, {});
            const sessionMap = { 1: 'morning', 2: 'afternoon', 3: 'evening' };
            logMap.get(key)[sessionMap[log.sessionId]] = log.status;
        });

        // --- Step 3: Build the complete attendance map for the export ---
        const finalAttendanceMap = {};
        for (const emp of employees) {
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().slice(0, 10);
                const dayOfWeek = d.getUTCDay();
                const key = `${emp.id}-${dateStr}`;

                if (!finalAttendanceMap[key]) finalAttendanceMap[key] = {};

                const summaryStatus = summaryMap.get(key);
                const logData = logMap.get(key) || {};

                if (summaryStatus === 'on_leave' || summaryStatus === 'holiday' || summaryStatus === 'weekend') {
                    // For special days, mark all sessions with that status
                    finalAttendanceMap[key] = {
                        morning: summaryStatus,
                        afternoon: summaryStatus,
                        evening: summaryStatus
                    };
                } else {
                    // For working days, use the specific log data
                    finalAttendanceMap[key] = {
                        morning: logData.morning || null,
                        afternoon: logData.afternoon || null,
                        evening: logData.evening || null,
                    };
                }
            }
        }

        res.status(200).json({ employees, attendanceMap: finalAttendanceMap });

    } catch (error) {
        console.error("Error exporting attendance data:", error);
        res.status(500).json({ error: "Failed to export attendance data." });
    }
});

router.get("/overtime-requests", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const departmentId = req.user.employee.departmentId;

        const requests = await prisma.overtimeLog.findMany({
            where: {
                employee: {
                    departmentId: departmentId
                }
            },
            orderBy: { date: 'desc' },
            select: {
                id: true,
                date: true,
                hours: true,
                reason: true,
                approvalStatus: true,
                overtimeType: true, // ✅ Correctly select the field from OvertimeLog
                employee: { 
                    select: { 
                        firstName: true, 
                        lastName: true 
                    } 
                }
            }
        });
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching overtime requests for department:", error);
        res.status(500).json({ error: "Failed to fetch overtime requests." });
    }
});

// ---------------------------------------------------------------------------------
// 2. GET /api/dep-head/team-members - Fetch employees the Dep Head can select
// ---------------------------------------------------------------------------------
router.get("/team-members", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const departmentId = req.user.employee.departmentId;
        const teamMembers = await prisma.employee.findMany({
            where: {
                departmentId: departmentId,
                jobStatus: { status: 'Active' } // Only show active employees
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
            orderBy: { firstName: 'asc' }
        });
        res.status(200).json(teamMembers);
    } catch (error) {
        console.error("Error fetching team members:", error);
        res.status(500).json({ error: "Failed to fetch team members." });
    }
});

// ---------------------------------------------------------------------------------
// 3. POST /api/dep-head/overtime-requests - Create a new overtime request
// ---------------------------------------------------------------------------------
// in depHead.routes.js

router.post("/overtime-requests", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const { employeeId, date, startTime, endTime, reason, compensationMethod, overtimeType, hours } = req.body;

        if (!employeeId || !date || !reason || !overtimeType) {
            return res.status(400).json({ error: "Employee, date, reason, and overtime type are required." });
        }

        let calculatedHours;
        let startDateTime = null;
        let endDateTime = null;
        
        // Logic depends on the type of overtime
        if (overtimeType === 'WEEKDAY') {
            if (!startTime || !endTime) {
                return res.status(400).json({ error: "Start time and end time are required for weekday overtime." });
            }
            startDateTime = new Date(`${date}T${startTime}`);
            endDateTime = new Date(`${date}T${endTime}`);
            if (endDateTime <= startDateTime) {
                return res.status(400).json({ error: "End time must be after start time." });
            }
            const durationMs = endDateTime - startDateTime;
            calculatedHours = durationMs / (1000 * 60 * 60);
        } else { // For SUNDAY or HOLIDAY
            if (!hours || isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
                return res.status(400).json({ error: "A valid number of hours is required for this overtime type." });
            }
            calculatedHours = parseFloat(hours);
        }

        const newRequest = await prisma.overtimeLog.create({
            data: {
                employeeId: parseInt(employeeId),
                date: new Date(date),
                startTime: startDateTime,
                endTime: endDateTime,
                hours: calculatedHours,
                reason: reason,
                overtimeType: overtimeType, // Save the new type
                compensationMethod: compensationMethod || 'cash',
                approvalStatus: 'pending'
            }
        });
        await prisma.activityLog.create({
    data: {
        type: 'OVERTIME_REQUESTED',
        message: `${req.user.employee.firstName} requested overtime.`,
        actorId: req.user.employee.id,
        targetId: newRequest.employeeId, // The person who the request is for
        departmentId: req.user.employee.departmentId,
    }
});
        res.status(201).json(newRequest);
    } catch (error) {
        console.error("Error creating overtime request:", error);
        res.status(500).json({ error: "Failed to create overtime request." });
    }
});

function getStartOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

// ---------------------------------------------------------------------------------
// GET /api/dep-head/payment-status - Fetch salary status for the Dep Head's team
// ---------------------------------------------------------------------------------
router.get("/payment-status", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const departmentId = req.user.employee.departmentId;
        const startOfMonth = getStartOfMonth();

        if (!departmentId) {
            return res.status(403).json({ error: "User is not assigned to a department." });
        }
        
        // Step 1: Find all employees in the department who are NOT interns
        const teamMembers = await prisma.employee.findMany({
            where: {
                departmentId: departmentId,
                jobStatus: { status: 'Active' },
                user: {
                    roles: {
                        some: {
                            role: { name: { not: 'Intern' } }
                        }
                    }
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            }
        });

        // Step 2: Get the IDs of these team members
        const teamMemberIds = teamMembers.map(tm => tm.id);

        // Step 3: Find all salary records for these employees for the current month
        const salaryRecords = await prisma.salary.findMany({
            where: {
                employeeId: { in: teamMemberIds },
                salaryMonth: startOfMonth,
            },
            select: {
                employeeId: true,
                status: true,
            }
        });

        // Use a Map for efficient lookups
        const salaryStatusMap = new Map(salaryRecords.map(s => [s.employeeId, s.status]));

        // Step 4: Combine the data. For each team member, find their salary status.
        // If a salary record doesn't exist for them, they are considered 'unpaid'.
        const paymentStatuses = teamMembers.map(member => ({
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            // If the map has their ID, use that status, otherwise default to 'unpaid'
            status: salaryStatusMap.get(member.id) || 'unpaid',
        }));
        
        res.status(200).json(paymentStatuses);

    } catch (error)
{
        console.error("Error fetching payment status for department:", error);
        res.status(500).json({ error: "Failed to fetch payment status." });
    }
});


module.exports = router;