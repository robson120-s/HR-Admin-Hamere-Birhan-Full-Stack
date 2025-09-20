// In your backend file: routes/depHead.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client"); // or your generated path
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { processAttendanceForDate } = require('../jobs/attendanceProcessor');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// ==============================================================================
// GET /api/dep-head/dashboard 
// This is the complete, secure, and correctly scoped endpoint.
// ==============================================================================

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
      recentActivityLogs,
      holidays
    ] = await Promise.all([
      // --- Basic Counts ---
      prisma.employee.count({ 
        where: { 
          OR: [
            {departmentId: { in: managedDeptIds }}, 
            {subDepartmentId: { in: managedDeptIds }}
          ], 
          user: { 
            userrole: { // Corrected from roles to userrole
              some: { 
                role: { name: 'Staff' } 
              } 
            } 
          } 
        } 
      }),
      prisma.employee.count({ 
        where: { 
          OR: [
            {departmentId: { in: managedDeptIds }}, 
            {subDepartmentId: { in: managedDeptIds }}
          ], 
          user: { 
            userrole: { // Corrected from roles to userrole
              some: { 
                role: { name: 'Intern' } 
              } 
            } 
          } 
        } 
      }),
      prisma.attendancesummary.count({ // Changed from attendanceSummary to attendancesummary
        where: { 
          date: today, 
          status: 'present', 
          employee: { 
            OR: [ // Added OR clause for both departmentId and subDepartmentId
              { departmentId: { in: managedDeptIds } },
              { subDepartmentId: { in: managedDeptIds } }
            ]
          } 
        } 
      }),
      prisma.attendancesummary.count({ // Changed from attendanceSummary to attendancesummary
        where: { 
          date: today, 
          status: 'absent', 
          employee: { 
            OR: [ // Added OR clause for both departmentId and subDepartmentId
              { departmentId: { in: managedDeptIds } },
              { subDepartmentId: { in: managedDeptIds } }
            ]
          } 
        } 
      }),
      
      // --- Data for Components ---
      prisma.meeting.findMany({ 
        orderBy: { date: 'asc' },
        include: {
          employee: { // Changed from creator to employee
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      
      prisma.performancereview.findMany({ // Changed from performanceReview to performancereview
        where: { 
          employee: { 
            OR: [
              {departmentId: { in: managedDeptIds }}, 
              {subDepartmentId: { in: managedDeptIds }}
            ] 
          } 
        },
        include: { 
          employee: { 
            select: { 
              user: { 
                select: { 
                  userrole: { // Corrected from roles to userrole
                    select: { 
                      role: { 
                        select: { 
                          name: true 
                        } 
                      } 
                    } 
                  } 
                } 
              } 
            } 
          } 
        }
      }),
      
      prisma.leave.findMany({
        where: { 
          status: { in: ['approved', 'rejected'] }, 
          updatedAt: { gte: thirtyDaysAgo }, 
          employee: { 
            OR: [
              {departmentId: { in: managedDeptIds }}, 
              {subDepartmentId: { in: managedDeptIds }}
            ] 
          } 
        },
        orderBy: { updatedAt: 'desc' }, 
        take: 3,
        include: { employee: { select: { firstName: true, lastName: true } } }
      }),
      
      prisma.overtimelog.findMany({ // Changed from overtimeLog to overtimelog
        where: { 
          approvalStatus: { in: ['approved', 'rejected'] }, 
          employee: { 
            OR: [
              {departmentId: { in: managedDeptIds }}, 
              {subDepartmentId: { in: managedDeptIds }}
            ] 
          } 
        },
        orderBy: { updatedAt: 'desc' }, 
        take: 3,
        include: { employee: { select: { firstName: true, lastName: true } } }
      }),
      
      prisma.activitylog.findMany({ // Changed from activityLog to activitylog
        where: { departmentId: departmentId },
        orderBy: { createdAt: 'desc' },
        take: 7,
        include: {
          employee_activitylog_actorIdToemployee: { // Correct relation name
            select: { firstName: true, lastName: true } 
          },
          employee_activitylog_targetIdToemployee: { // Correct relation name
            select: { firstName: true, lastName: true } 
          }
        }
      }),
      prisma.holiday.findMany({ orderBy: { date: 'asc' } })
    ]);

    // --- Performance Score Processing ---
    let totalScore = 0, staffScore = 0, internScore = 0;
    let staffReviewCount = 0, internReviewCount = 0;
    allReviews.forEach(r => {
      const role = r.employee.user?.userrole[0]?.role.name; // Corrected path
      if (r.score) {
        totalScore += r.score;
        if (role === 'Staff' || role === 'Department Head') {
          staffScore += r.score;
          staffReviewCount++;
        } else if (role === 'Intern') {
          internScore += r.score;
          internReviewCount++;
        }
      }
    });

    // --- Process Actioned Requests for its own card ---
    const formattedLeaves = actionedLeaves.map(l => ({ 
      id: `l-${l.id}`, 
      type: `Leave ${l.status}`, 
      message: `${l.employee.firstName}'s leave request was ${l.status}.`, 
      date: l.updatedAt 
    }));
    const formattedOvertimes = actionedOvertimes.map(o => ({ 
      id: `o-${o.id}`, 
      type: `Overtime ${o.approvalStatus}`, 
      message: `${o.employee.firstName}'s overtime was ${o.approvalStatus}.`, 
      date: o.updatedAt 
    }));
    const actionedRequests = [...formattedLeaves, ...formattedOvertimes]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // --- Format the new true Activity Log ---
    const recentActivity = recentActivityLogs.map(log => {
      const actorName = log.employee_activitylog_actorIdToemployee ? 
        `${log.employee_activitylog_actorIdToemployee.firstName} ${log.employee_activitylog_actorIdToemployee.lastName}` : 
        'Unknown';
      
      const targetName = log.employee_activitylog_targetIdToemployee ? 
        `${log.employee_activitylog_targetIdToemployee.firstName} ${log.employee_activitylog_targetIdToemployee.lastName}` : 
        'Unknown';

      let message = `An action was performed by ${actorName}.`;
      switch(log.type) {
        case 'ATTENDANCE_MARKED':
          message = `${actorName} marked attendance for ${new Date(log.createdAt).toLocaleDateString()}.`;
          break;
        case 'REVIEW_SUBMITTED':
          message = `${actorName} submitted a performance review for ${targetName}.`;
          break;
        case 'OVERTIME_REQUESTED':
          message = `${actorName} requested overtime for ${targetName}.`;
          break;
        case 'LEAVE_REQUESTED':
          message = `${targetName} submitted a leave request.`;
          break;
        case 'COMPLAINT_SUBMITTED':
          message = `${actorName} submitted a new complaint.`;
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
      holiday: holidays,
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
                jobstatus: { status: 'Active' } // Changed from jobStatus to jobstatus
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                    select: { 
                        userrole: { // Changed from roles to userrole
                            select: { 
                                role: { 
                                    select: { 
                                        name: true 
                                    } 
                                } 
                            } 
                        } 
                    }
                }
            }
        });

        // ✅ NEW: Categorize employees into staff and interns
        const staff = [];
        const interns = [];
        allEmployees.forEach(emp => {
            const role = emp.user?.userrole[0]?.role.name; // Updated path
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
        const performanceReviews = await prisma.performancereview.findMany({ // Changed from performanceReview to performancereview
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

        const newReview = await prisma.performancereview.create({
            data: {
                employeeId: parseInt(employeeId),
                reviewDate: new Date(),
                reviewerName: reviewerName,
                score: parseInt(score),
                comments: comments,
                updatedAt: new Date(), // Added this line
            }
        });
        
        const reviewedEmployee = await prisma.employee.findUnique({ 
            where: { id: newReview.employeeId }, 
            select: { firstName: true } 
        });
        
        await prisma.activitylog.create({
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
                            select: { 
                                userrole: { // Changed from roles to userrole
                                    select: { 
                                        role: { 
                                            select: { 
                                                name: true 
                                            } 
                                        } 
                                    } 
                                } 
                            }
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
                    const role = emp.user?.userrole[0]?.role.name; // Updated path
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
                    totalMembers: employees.length,
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
        const departmentId = req.user.employee.departmentId;
        if (!departmentId) { 
            return res.status(403).json({ error: "Cannot add sub-department. User is not assigned to a department." }); 
        }
        
        const { name, description } = req.body;
        if (!name) { return res.status(400).json({ error: "Sub-department name is required." }); }

        const newSubDept = await prisma.department.create({
            data: { 
                name, 
                description, 
                parentId: departmentId,
                updatedAt: new Date() // Add updatedAt field
            }
        });
        res.status(201).json(newSubDept);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "A department with this name already exists." });
        }
        console.error("Error creating sub-department:", error);
        res.status(500).json({ error: "Failed to create sub-department." });
    }
});

// PATCH /api/dep-head/sub-departments/:id - Update a sub-department
router.patch("/sub-departments/:id", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        // Security check: ensure the sub-department belongs to the user's department
        const subDept = await prisma.department.findUnique({
            where: { id: parseInt(id) },
            select: { parentId: true }
        });
        
        if (!subDept || subDept.parentId !== req.user.employee.departmentId) {
            return res.status(403).json({ error: "You can only update sub-departments in your own department." });
        }
        
        const updatedSubDept = await prisma.department.update({
            where: { id: parseInt(id) },
            data: { 
                name, 
                description,
                updatedAt: new Date() // Add updatedAt field
            }
        });
        res.status(200).json(updatedSubDept);
    } catch (error) {
        console.error("Error updating sub-department:", error);
        res.status(500).json({ error: "Failed to update sub-department." });
    }
});

// DELETE /api/dep-head/sub-departments/:id - Delete a sub-department
router.delete("/sub-departments/:id", authenticate, authorize("Department Head"), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Security check: ensure the sub-department belongs to the user's department
        const subDept = await prisma.department.findUnique({
            where: { id: parseInt(id) },
            select: { parentId: true }
        });
        
        if (!subDept || subDept.parentId !== req.user.employee.departmentId) {
            return res.status(403).json({ error: "You can only delete sub-departments in your own department." });
        }
        
        await prisma.department.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting sub-department:", error);
        res.status(500).json({ error: "Failed to delete sub-department. Make sure it has no employees assigned." });
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
                prisma.attendancelog.upsert({ // Changed from attendanceLog to attendancelog
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

    await prisma.activitylog.create({ // Changed from activityLog to activitylog
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

//  The Intelligent Attendance Overview
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
      where: { 
        departmentId: departmentId, 
        jobstatus: { // Changed from jobStatus to jobstatus
          status: 'Active' 
        } 
      },
      select: { id: true, firstName: true, lastName: true, photo: true },
      orderBy: { firstName: 'asc' }
    });
    if (employees.length === 0) {
      return res.status(200).json({ employees: [], attendanceMap: {} });
    }
    const employeeIds = employees.map(e => e.id);

    // Step 2: Fetch all necessary data for the month in parallel
    const [summaries, holidays] = await Promise.all([
        prisma.attendancesummary.findMany({ // Changed from attendanceSummary to attendancesummary
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

router.get("/profile", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const userId = req.user.id;

    const employeeProfile = await prisma.employee.findUnique({
      where: { userId: userId },
      // ✅ CORRECTED: Use the right relation field names
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
        department_employee_departmentIdTodepartment: { select: { name: true } }, // Corrected
        position: { select: { name: true } },
        maritalstatus: { select: { status: true } }, // Corrected (lowercase)
        employmenttype: { select: { type: true } }, // Corrected (lowercase)
        jobstatus: { select: { status: true } }, // Corrected (lowercase)
        agreementstatus: { select: { status: true } }, // Corrected (lowercase)
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
router.post("/complaints/submit", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { subject, description } = req.body;
    
    // --- 1. Get Employee ID securely from the authenticated user ---
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
        employeeId: loggedInEmployeeId,
        subject: subject,
        description: description,
        updatedAt: new Date(), // Add updatedAt field
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
        const departmentId = req.user.employee.departmentId; // Use directly from user object
        if (!departmentId) {
            return res.status(403).json({ error: "You are not assigned to a department." });
        }
        
        const employee = await prisma.employee.findUnique({ 
            where: { id: parseInt(employeeId) },
            select: { departmentId: true } // Only select what we need
        });
        
        if (!employee || employee.departmentId !== departmentId) {
            return res.status(403).json({ error: "You can only submit requests for employees in your department." });
        }
        
        const newLeaveRequest = await prisma.leave.create({
            data: {
                employeeId: parseInt(employeeId),
                leaveType: leaveType.toLowerCase(),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason: reason,
                status: 'pending',
                updatedAt: new Date() // Add updatedAt field
            }
        });
        
        // Include employee name in response for easy UI update
        const finalResponse = await prisma.leave.findUnique({
            where: { id: newLeaveRequest.id },
            include: { 
                employee: { 
                    select: { 
                        firstName: true, 
                        lastName: true 
                    } 
                } 
            }
        });
        
        res.status(201).json(finalResponse);
    } catch (error) {
        console.error("Error creating leave request:", error);
        res.status(500).json({ error: "Failed to create leave request." });
    }
});


//////Mark Attendance 


router.get("/attendance-roster", authenticate, authorize("Department Head"), async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "A date parameter is required." });
    
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const loggedInEmployee = req.user.employee;
    if (!loggedInEmployee || !loggedInEmployee.departmentId) {
      return res.status(403).json({ error: "Access denied: Your user account is not linked to a department." });
    }
    const departmentId = loggedInEmployee.departmentId;

    // Step 1: Find all sub-departments managed by this head
    const subDepartmentsFromDb = await prisma.department.findMany({
        where: { parentId: departmentId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    });

    // Step 2: Get a list of all relevant department IDs (the main one + all sub-departments)
    const allManagedDeptIds = [departmentId, ...subDepartmentsFromDb.map(sd => sd.id)];

    // Step 3: Fetch ALL employees (including the head) from all managed departments
    const allEmployees = await prisma.employee.findMany({
        where: {
            OR: [
                { departmentId: { in: allManagedDeptIds } },
                { subDepartmentId: { in: allManagedDeptIds } }
            ],
            jobstatus: { // Changed from jobStatus to jobstatus
                status: 'Active'
            }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            subDepartmentId: true,
            user: { 
                select: { 
                    userrole: { // Changed from roles to userrole
                        select: { 
                            role: { 
                                select: { 
                                    name: true 
                                } 
                            } 
                        } 
                    } 
                } 
            }
        }
    });

    // Step 4: Categorize all employees into their respective groups
    const departmentRoster = {
        id: departmentId,
        name: "General / Unassigned", // A group for employees directly in the main department
        staff: [],
        interns: []
    };
    const subDepartmentRosters = subDepartmentsFromDb.map(sd => ({
        ...sd,
        staff: [],
        interns: []
    }));

    // Create a map for easy lookup
    const rosterMap = new Map();
    rosterMap.set(departmentId, departmentRoster);
    subDepartmentRosters.forEach(sdr => rosterMap.set(sdr.id, sdr));
    
    allEmployees.forEach(emp => {
        const targetRoster = rosterMap.get(emp.subDepartmentId) || rosterMap.get(departmentId);
        if (targetRoster) {
            const role = emp.user?.userrole[0]?.role.name; // Updated path
            const employeeData = { id: emp.id, name: `${emp.firstName} ${emp.lastName}` };
            if (role === 'Intern') {
                targetRoster.interns.push(employeeData);
            } else {
                // Anyone not an intern (Staff, Dep Head) goes into the staff list
                targetRoster.staff.push(employeeData);
            }
        }
    });
    
    // Final combined roster, filtering out the empty "General" group if no one is in it
    const finalRoster = [departmentRoster, ...subDepartmentRosters].filter(group => group.staff.length > 0 || group.interns.length > 0);
    
    // Step 5: The rest of the logic remains the same (fetching leaves and attendance)
    const allEmployeeIds = allEmployees.map(e => e.id);
    if (allEmployeeIds.length === 0) {
        return res.status(200).json({ subDepartments: [], attendanceRecords: {}, onLeaveIds: [] });
    }

    const [leaves, attendanceLogs] = await Promise.all([
        prisma.leave.findMany({
            where: { employeeId: { in: allEmployeeIds }, status: 'approved', startDate: { lte: targetDate }, endDate: { gte: targetDate } },
            select: { employeeId: true }
        }),
        prisma.attendancelog.findMany({ // Changed from attendanceLog to attendancelog
            where: { date: targetDate, employeeId: { in: allEmployeeIds } },
            select: { employeeId: true, sessionId: true, status: true }
        })
    ]);
    
    const onLeaveEmployeeIds = new Set(leaves.map(l => l.employeeId));
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
      subDepartments: finalRoster,
      attendanceRecords: attendanceMap,
      onLeaveIds: Array.from(onLeaveEmployeeIds)
    });
  } catch (error) {
    console.error("Error fetching attendance roster:", error);
    res.status(500).json({ error: "Failed to fetch attendance roster." });
  }
});

// POST /api/dep-head/attendance - Save attendance for the day// in depHead.routes.js



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

        const requests = await prisma.overtimelog.findMany({ // Changed from overtimeLog to overtimelog
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
                overtimeType: true,
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

        const newRequest = await prisma.overtimelog.create({ // Changed from overtimeLog to overtimelog
            data: {
                employeeId: parseInt(employeeId),
                date: new Date(date),
                startTime: startDateTime,
                endTime: endDateTime,
                hours: calculatedHours,
                reason: reason,
                overtimeType: overtimeType,
                compensationMethod: compensationMethod || 'cash',
                approvalStatus: 'pending',
                updatedAt: new Date() // Add updatedAt field
            }
        });
        await prisma.activitylog.create({ // Changed from activityLog to activitylog
            data: {
                type: 'OVERTIME_REQUESTED',
                message: `${req.user.employee.firstName} requested overtime.`,
                actorId: req.user.employee.id,
                targetId: newRequest.employeeId,
                departmentId: req.user.employee.departmentId,
            }
        });
        res.status(201).json(newRequest);
    } catch (error) {
        console.error("Error creating overtime request:", error);
        res.status(500).json({ error: "Failed to create overtime request." });
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
                jobstatus: { // Changed from jobStatus to jobstatus
                    status: "Active"
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true
            },
            orderBy: {
                firstName: "asc"
            }
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
                jobstatus: { status: 'Active' }, // Changed from jobStatus to jobstatus
                user: {
                    userrole: { // Changed from roles to userrole
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

    } catch (error) {
        console.error("Error fetching payment status for department:", error);
        res.status(500).json({ error: "Failed to fetch payment status." });
    }
});


module.exports = router;