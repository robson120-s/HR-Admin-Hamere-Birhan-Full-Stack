const express = require("express");
const router = express.Router();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const hrController = require("../controllers/hr.controller");
const { processDailyAttendance } = require("../jobs/attendanceProcessor");

const { processAttendanceForDate } = require('../utils/attendanceProcessor');

// router.get(
//   "/complaints",
//   hrController.getAllComplaints
// );

// router.patch(
//   "/complaints/:id",
//   hrController.respondToComplaint
// );



// in your backend HR routes file
// in your backend HR routes file

// in your backend HR routes file
// in your backend HR routes file

router.get("/dashboard", authenticate, authorize("HR"), async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

const [
  totalEmployees,
  totalMainDepartments,
  totalSubDepartments,
  totalStaff,
  totalIntern,
  totalOnLeaveToday,
  pendingLeaves,
  pendingOvertimes,
  pendingComplaints,
  departmentHeads,
  meetings,
  holidays
] = await Promise.all([
  prisma.employee.count({
    where: { user: { userrole: { some: { role: { name: { notIn: ["HR"] } } } } } }
  }),
  prisma.department.count({ where: { parentId: null } }),
  prisma.department.count({ where: { parentId: { not: null } } }),
  prisma.employee.count({
    where: { user: { userrole: { some: { role: { name: { in: ["Staff", "Department Head"] } } } } } }
  }),
  prisma.employee.count({
    where: { user: { userrole: { some: { role: { name: "Intern" } } } } }
  }),
  prisma.leave.count({ where: { status: "approved", startDate: { lte: today }, endDate: { gte: today } } }),
  prisma.leave.count({ where: { status: "pending" } }),
  prisma.overtimelog.count({ where: { approvalStatus: "pending" } }),
  prisma.complaint.count({ where: { status: { in: ["open", "in_review"] } } }),
prisma.employee.findMany({
  where: {
    user: {
      userrole: {
        some: {
          role: {
            name: "Department Head"
          }
        }
      }
    }
  },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    phone: true,
    photo: true,
    department_employee_departmentIdTodepartment: {  // Correct field name
      select: {
        name: true
      }
    }
  },
  orderBy: {
    firstName: "asc"
  }
}),
  prisma.meeting.findMany({
    orderBy: { date: 'asc' },
    include: { employee: { select: { firstName: true, lastName: true } } }
  }),
  prisma.holiday.findMany({ orderBy: { date: 'asc' } })
]);
    

const presentSummaries = await prisma.attendancesummary.findMany({
  where: { 
    date: today, 
    status: { in: ['present', 'absent'] }, 
    departmentId: { not: null } 
  },
  include: { 
    department: { 
      select: { name: true } 
    } 
  }
});
    const departmentStatsMap = new Map();
    presentSummaries.forEach(summary => {
        const deptName = summary.department?.name || 'Unknown Department';
        if (!departmentStatsMap.has(deptName)) { departmentStatsMap.set(deptName, { present: 0, absent: 0 }); }
        const stats = departmentStatsMap.get(deptName);
        if (summary.status === 'present') { stats.present++; } else if (summary.status === 'absent') { stats.absent++; }
    });
    const presentPerDepartmentChartData = Array.from(departmentStatsMap, ([name, counts]) => ({
        department: name,
        present: counts.present,
        absent: counts.absent,
    }));

    res.status(200).json({
      totalEmployees,
      totalMainDepartments,
      totalSubDepartments,
      totalStaff,
      totalIntern,
      totalOnLeave: totalOnLeaveToday,
      pendingLeaves,
      pendingOvertimes,
      pendingComplaints,
      departmentHeads,
      meetings, // This will now include all meetings
      holidays,
      presentPerDepartment: presentPerDepartmentChartData,
    });
  } catch (error) {
    console.error("Error fetching HR dashboard data:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

// GET /api/hr/meetings - Fetch all RELEVANT meetings
router.get("/meetings", authenticate, authorize("HR"), async (req, res) => {
  try {
    // We are removing the date filter to fetch ALL meetings.
    const meetings = await prisma.meeting.findMany({
      orderBy: { date: "asc" },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
});


// POST /api/hr/meetings - Add a new meeting
router.post("/meetings", authenticate, authorize("HR"), async (req, res) => {
  try {
    // ✅ ADDITION: Destructure the new 'description' field
    const { title, date, time, description } = req.body;
    if (!title || !date || !time) {
      return res.status(400).json({ error: "Title, date, and time are required." });
    }

    const meetingDate = new Date(date);
    meetingDate.setUTCHours(0, 0, 0, 0);
 
    const newMeeting = await prisma.meeting.create({
      data: {
        title: title,
        description: description, // ✅ ADDITION: Save the description
        date: meetingDate,
        time: time,
        creatorId: req.user.employee.id,
      },
    });
    res.status(201).json(newMeeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

// DELETE /api/hr/meetings/:id - Delete a meeting
router.delete("/meetings/:id",  async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.meeting.delete({
      where: { id: parseInt(id) }, // Use parseInt since the ID in the URL is a string
    });
    res.status(204).send(); // 204 No Content is the correct response for a successful delete
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ error: "Failed to delete meeting" });
  }
});

router.post("/process-attendance", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) {
            return res.status(400).json({ error: "A 'date' string (e.g., '2025-08-26') is required in the request body." });
        }

        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0); // Normalize the date

        // Call the core logic function
        await processDailyAttendance(targetDate);

        res.status(200).json({ message: `Successfully processed attendance summaries for ${date}.` });
    } catch (error) {
        console.error("Manual attendance processing failed:", error);
        res.status(500).json({ error: "Failed to process attendance." });
    }
});




router.get("/attendance-for-approval", authenticate, authorize("HR"), async (req, res) => {
  try {
    const { date, page = 1, limit = 20, departmentId, search } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required." });
    
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause for filtering
    let whereClause = {
      date: targetDate
    };
    
    // Add department filter if provided
    if (departmentId) {
      whereClause.employee = {
        departmentId: parseInt(departmentId)
      };
    }
    
    // Add search filter if provided
    if (search) {
      whereClause.employee = {
        ...whereClause.employee,
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } }
        ]
      };
    }
    
    // Get attendance logs with pagination
    const [attendanceLogs, totalLogs] = await Promise.all([
      prisma.attendancelog.findMany({ // Changed from attendanceLog to attendancelog
        where: whereClause,
        include: {
          employee: {
            include: {
              department_employee_departmentIdTodepartment: { // Correct relation name
                select: { name: true }
              },
              department_employee_subDepartmentIdTodepartment: { // Correct relation name
                select: { name: true }
              }
            }
          },
          sessiondefinition: { // Changed from session to sessiondefinition
            select: {
              expectedClockIn: true,
              expectedClockOut: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          employee: {
            firstName: 'asc'
          }
        }
      }),
      prisma.attendancelog.count({ // Changed from attendanceLog to attendancelog
        where: whereClause
      })
    ]);
    
    // Get approved summaries
    const approvedSummaries = await prisma.attendancesummary.findMany({ // Changed from attendanceSummary to attendancesummary
      where: { date: targetDate },
      select: { employeeId: true }
    });
    
    const approvedEmployeeIds = approvedSummaries.map(s => s.employeeId);
    
    // Get departments for filter
    const departments = await prisma.department.findMany({
      include: {
        other_department: { // Correct relation name for sub-departments
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.status(200).json({
      attendanceLogs,
      approvedEmployeeIds,
      departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalLogs,
        pages: Math.ceil(totalLogs / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching attendance for approval:", error);
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

// POST /api/hr/approve-attendance
router.post("/approve-attendance", authenticate, authorize("HR"), async (req, res) => {
  try {
    const { date, employeeIds } = req.body;
    if (!date || !employeeIds || !Array.isArray(employeeIds)) {
      return res.status(400).json({ error: "Date and a list of employee IDs are required." });
    }
    
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    
    // Process each employee
    const results = [];
    for (const employeeId of employeeIds) {
      try {
        // Get all logs for this employee on this date
        const logs = await prisma.attendancelog.findMany({ // Changed from attendanceLog to attendancelog
          where: {
            employeeId: parseInt(employeeId),
            date: targetDate
          },
          include: {
            sessiondefinition: { // Changed from session to sessiondefinition
              select: {
                expectedClockIn: true,
                expectedClockOut: true
              }
            },
            employee: {
              select: {
                departmentId: true
              }
            }
          }
        });
        
        if (logs.length === 0) {
          results.push({ employeeId, status: 'skipped', reason: 'No attendance records' });
          continue;
        }
        
        // Calculate summary data
        let status = 'absent';
        let lateArrival = false;
        let earlyDeparture = false;
        let unplannedAbsence = false;
        let totalWorkHours = 0;
        
        // Process each session
        for (const log of logs) {
          if (log.status === 'present' || log.status === 'late') {
            if (log.status === 'late') lateArrival = true;
            
            // Calculate work hours if clock in/out times exist
            if (log.actualClockIn && log.actualClockOut) {
              const hours = (new Date(log.actualClockOut) - new Date(log.actualClockIn)) / (1000 * 60 * 60);
              totalWorkHours += hours;
            }
          } else if (log.status === 'absent') {
            unplannedAbsence = true;
          }
        }
        
        // Determine overall status
        if (logs.some(log => log.status === 'present' || log.status === 'late')) {
          status = 'present';
        } else if (logs.some(log => log.status === 'permission')) {
          status = 'permission';
        }
        
        // Check for early departure
        const lastLog = logs[logs.length - 1];
        if (lastLog.actualClockOut && lastLog.sessiondefinition.expectedClockOut) {
          const actualOut = new Date(lastLog.actualClockOut);
          const expectedOut = new Date(lastLog.sessiondefinition.expectedClockOut);
          if (actualOut < expectedOut) {
            earlyDeparture = true;
          }
        }
        
        // Create or update summary
        await prisma.attendancesummary.upsert({ // Changed from attendanceSummary to attendancesummary
          where: {
            employeeId_date: {
              employeeId: parseInt(employeeId),
              date: targetDate
            }
          },
          update: {
            status,
            lateArrival,
            earlyDeparture,
            unplannedAbsence,
            totalWorkHours: totalWorkHours > 0 ? totalWorkHours : null,
            updatedAt: new Date() // Add updatedAt field
          },
          create: {
            employeeId: parseInt(employeeId),
            date: targetDate,
            status,
            lateArrival,
            earlyDeparture,
            unplannedAbsence,
            totalWorkHours: totalWorkHours > 0 ? totalWorkHours : null,
            departmentId: logs[0].employee.departmentId,
            createdAt: new Date(), // Add createdAt field
            updatedAt: new Date() // Add updatedAt field
          }
        });
        
        results.push({ employeeId, status: 'approved' });
      } catch (error) {
        results.push({ employeeId, status: 'error', error: error.message });
      }
    }
    
    res.status(200).json({ 
      message: `Processed ${employeeIds.length} employees.`,
      results 
    });
  } catch (error) {
    console.error("Error approving attendance:", error);
    res.status(500).json({ error: "Failed to approve attendance." });
  }
});

// POST /api/hr/attendance
router.post("/attendance", authenticate, authorize("HR"), async (req, res) => {
  try {
    const { date, attendance } = req.body;
    if (!date || !attendance) {
      return res.status(400).json({ error: "Date and attendance data are required." });
    }
    
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    
    const logOperations = [];
    
    for (const employeeId in attendance) {
      for (const session in attendance[employeeId]) {
        const sessionId = { Morning: 1, Afternoon: 2, Evening: 3 }[session];
        const status = attendance[employeeId][session];
        
        if (sessionId && status) {
          logOperations.push(
            prisma.attendanceLog.upsert({
              where: { 
                employeeId_date_sessionId: { 
                  employeeId: parseInt(employeeId), 
                  date: targetDate, 
                  sessionId 
                } 
              },
              update: { status },
              create: { 
                employeeId: parseInt(employeeId), 
                date: targetDate, 
                sessionId, 
                status 
              }
            })
          );
        }
      }
    }
    
    await prisma.$transaction(logOperations);
    res.status(200).json({ message: "Attendance saved successfully." });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ error: "Failed to save attendance." });
  }
});

// GET /api/hr/export-attendance
router.get("/export-attendance", authenticate, authorize("HR"), async (req, res) => {
  try {
    const { date, departmentId } = req.query;
    if (!date) return res.status(400).json({ error: "Date is required." });
    
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);
    
    // Build where clause
    let whereClause = {
      date: targetDate
    };
    
    if (departmentId) {
      whereClause.employee = {
        departmentId: parseInt(departmentId)
      };
    }
    
    // Get attendance data
    const attendanceLogs = await prisma.attendanceLog.findMany({
      where: whereClause,
      include: {
        employee: {
          include: {
            department: true,
            subDepartment: true
          }
        },
        session: true
      },
      orderBy: [
        { employee: { departmentId: 'asc' } },
        { employee: { firstName: 'asc' } }
      ]
    });
    
    // Get approved summaries
    const approvedSummaries = await prisma.attendanceSummary.findMany({
      where: { date: targetDate },
      select: { employeeId: true }
    });
    
    const approvedEmployeeIds = new Set(approvedSummaries.map(s => s.employeeId));
    
    // Format data for CSV
    const csvData = [];
    csvData.push(['Employee', 'Department', 'Date', 'Session', 'Status', 'Approval Status']);
    
    for (const log of attendanceLogs) {
      const approvalStatus = approvedEmployeeIds.has(log.employeeId) ? 'Approved' : 'Pending';
      const sessionName = { 1: 'Morning', 2: 'Afternoon', 3: 'Evening' }[log.sessionId];
      
      csvData.push([
        `${log.employee.firstName} ${log.employee.lastName}`,
        log.employee.department.name,
        log.date.toISOString().split('T')[0],
        sessionName,
        log.status,
        approvalStatus
      ]);
    }
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${date}.csv`);
    
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting attendance:", error);
    res.status(500).json({ error: "Failed to export attendance data." });
  }
});




// GET /api/hr/complaints - Fetch all complaints, ordered by newest first
router.get("/complaints", async (req, res) => {
  try {
    // Step 1: Fetch all departments into a Map for efficient lookups (ID -> Name)
    const allDepartments = await prisma.department.findMany({ select: { id: true, name: true } });
    const departmentMap = new Map(allDepartments.map(dept => [dept.id, dept.name]));

    // Step 2: Fetch complaints with rich employee data
    const complaints = await prisma.complaint.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department_employee_departmentIdTodepartment: { // Correct relation name
              select: {
                name: true
              }
            },
            subDepartmentId: true,
          },
        },
      },
    });

    // Step 3: Transform and enrich the data for the frontend
    const formattedComplaints = complaints.map(complaint => {
      // Use the map to find the sub-department name from its ID
      const subDepartmentName = departmentMap.get(complaint.employee?.subDepartmentId) || null;
      
      return {
        ...complaint, // Copy all existing complaint properties
        employee: {
          // Overwrite the employee object with a new one that has all the needed info
          name: `${complaint.employee.firstName} ${complaint.employee.lastName}`,
          departmentName: complaint.employee.department_employee_departmentIdTodepartment?.name || 'N/A', // Updated path
          subDepartmentName: subDepartmentName || 'N/A'
        }
      };
    });

    res.status(200).json(formattedComplaints);

  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ error: "Failed to fetch complaints." });
  }
});

// PATCH /api/hr/complaints/:id - Update a complaint's status and add a response
router.patch("/complaints/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    // Basic validation
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    const updatedComplaint = await prisma.complaint.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: status, // e.g., 'in_review', 'resolved'
        response: response, // Can be null or a string
        updatedAt: new Date(), // Add updatedAt field
      },
    });

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error("Error updating complaint:", error);
    if (error.code === 'P2025') { // Prisma code for "Record not found"
        return res.status(404).json({ error: "Complaint not found." });
    }
    res.status(500).json({ error: "Failed to update complaint." });
  }
});

// POST /api/hr/employees - Create a new user and employee profile
router.post("/employees", async (req, res) => {
  const { employeeData, userData, roleId } = req.body;

  // --- 1. Basic Validation ---
  if (!employeeData || !userData || !roleId) {
    return res.status(400).json({ error: "Employee data, user data, and a role ID are required." });
  }
  if (!userData.username || !userData.email || !userData.password) {
    return res.status(400).json({ error: "Username, email, and password are required for the user account." });
  }
  if (!employeeData.firstName || !employeeData.lastName) {
    return res.status(400).json({ error: "First name and last name are required for the employee profile." });
  }

  try {
    const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      { username: userData.username },
      { email: userData.email }
    ]
  }
});

if (existingUser) {
  if (existingUser.username === userData.username) {
    return res.status(409).json({ error: "Username already exists. Please choose a different username." });
  }
  if (existingUser.email === userData.email) {
    return res.status(409).json({ error: "Email address already exists. Please use a different email." });
  }
}

    // --- 2. Prisma Transaction: All operations succeed or none do ---
    const result = await prisma.$transaction(async (tx) => {
      // a. Hash the user's password for security
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // b. Create the User record
      const newUser = await tx.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          updatedAt: new Date(), // Added this line
        },
      });

      // c. Link the new User to their specified Role
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: parseInt(roleId),
        },
      });

      // d. Prepare the data for the Employee record
      const employeeCreateData = {
        // Link to the user we just created
        user: {
          connect: { id: newUser.id }
        },

        // Direct string/enum fields
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        sex: employeeData.sex,
        baptismalName: employeeData.baptismalName || null,
        nationality: employeeData.nationality || null,
        phone: employeeData.phone || null,
        address: employeeData.address || null,
        subCity: employeeData.subCity || null,
        emergencyContactName: employeeData.emergencyContactName || null,
        emergencyContactPhone: employeeData.emergencyContactPhone || null,
        repentanceFatherName: employeeData.repentanceFatherName || null,
        repentanceFatherChurch: employeeData.repentanceFatherChurch || null,
        repentanceFatherPhone: employeeData.repentanceFatherPhone || null,
        academicQualification: employeeData.academicQualification || null,
        educationalInstitution: employeeData.educationalInstitution || null,
        accountNumber: employeeData.accountNumber || null,
        photo: employeeData.photo,

        // Correctly formatted Date and Decimal fields
        dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth) : null,
        employmentDate: employeeData.employmentDate ? new Date(employeeData.employmentDate) : null,
        salary: employeeData.salary ? parseFloat(employeeData.salary) : 0.00,
        bonusSalary: employeeData.bonusSalary ? parseFloat(employeeData.bonusSalary) : 0.00,
      };

      // --- 3. Conditionally connect relationships ---
      if (employeeData.departmentId) {
        employeeCreateData.department = { connect: { id: parseInt(employeeData.departmentId) } };
      }
      if (employeeData.subDepartmentId) {
        employeeCreateData.subDepartmentId = parseInt(employeeData.subDepartmentId);
      }
      if (employeeData.positionId) {
        employeeCreateData.position = { connect: { id: parseInt(employeeData.positionId) } };
      }
      if (employeeData.maritalStatusId) {
        employeeCreateData.maritalStatus = { connect: { id: parseInt(employeeData.maritalStatusId) } };
      }
      if (employeeData.employmentTypeId) {
        employeeCreateData.employmentType = { connect: { id: parseInt(employeeData.employmentTypeId) } };
      }
      if (employeeData.jobStatusId) {
        employeeCreateData.jobStatus = { connect: { id: parseInt(employeeData.jobStatusId) } };
      }
      if (employeeData.agreementStatusId) {
        employeeCreateData.agreementStatus = { connect: { id: parseInt(employeeData.agreementStatusId) } };
      }
      
      // e. Create the Employee record
      const newEmployee = await tx.employee.create({
        data: employeeCreateData,
      });
      
      // f. Fetch the full new employee with relations
      const fullNewEmployee = await tx.employee.findUnique({
          where: { id: newEmployee.id },
          include: { 
            department_employee_departmentIdTodepartment: { select: { name: true } }, 
            position: { select: { name: true } } 
          }
      });
      
      return fullNewEmployee;
    });

    // --- 4. Send Success Response ---
    res.status(201).json(result);

  } catch (error) {
  console.error("Error creating employee:", error);

  // Specific error for duplicate username/email
  if (error.code === 'P2002') {
    let errorMessage = "An error occurred with the provided data.";
    
    // Check which field caused the unique constraint violation
    if (error.meta.target.includes('username')) {
      errorMessage = "Username already exists. Please choose a different username.";
    } else if (error.meta.target.includes('email')) {
      errorMessage = "Email address already exists. Please use a different email.";
    } else {
      // Generic message for other unique constraints
      errorMessage = `A record with this ${error.meta.target.join(', ')} already exists.`;
    }
    
    return res.status(409).json({ error: errorMessage });
  }

  // Generic server error
  res.status(500).json({ error: "An internal server error occurred while creating the employee." });
}
});

// GET /api/hr/employees - Fetches a list of all employees
router.get("/employees",  async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        deletedAt: null, // Optional: if you use soft deletes
      },
      orderBy: {
        firstName: 'asc',
      },
      // ✅ --- THIS IS THE FIX ---
      // We now 'include' the related data needed for the card view.
      include: {
        user: {
          select: {
            email: true,
          }
        },
        department_employee_departmentIdTodepartment: { // <-- THIS IS THE FIX
          select: {
            name: true,
          }
        },
        position: {
          select: {
            name: true,
          }
        }
      }
    });

const formattedEmployees = employees.map(employee => ({
  ...employee,
  department: employee.department_employee_departmentIdTodepartment
}));

res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees." });
  }
});


// GET /api/hr/employees/search?q=... - Search for employees by name
router.get("/employees/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } }, // Added case-insensitive search
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
        deletedAt: null, // Added to exclude soft-deleted employees
      },
      select: { id: true, firstName: true, lastName: true, photo: true },
      take: 10,
    });
    res.json(employees);
  } catch (error) {
    console.error("Error searching employees:", error);
    res.status(500).json({ error: "Failed to search employees." });
  }
});

router.get("/employee-form-lookups", async (req, res) => {
  try {
    const [
      departments,
      positions,
      maritalStatuses,
      employmentTypes,
      jobStatuses,
      agreementStatuses
    ] = await Promise.all([
      // Use correct model names (all lowercase)
      prisma.department.findMany({ 
        select: { id: true, name: true, parentId: true }, 
        orderBy: { name: 'asc' } 
      }),
      prisma.position.findMany({ 
        select: { id: true, name: true }, 
        orderBy: { name: 'asc' } 
      }),
      prisma.maritalstatus.findMany({ // Changed from maritalStatus to maritalstatus
        select: { id: true, status: true },
        orderBy: { status: 'asc' } // Added orderBy for consistency
      }),
      prisma.employmenttype.findMany({ // Changed from employmentType to employmenttype
        select: { id: true, type: true },
        orderBy: { type: 'asc' } // Added orderBy for consistency
      }),
      prisma.jobstatus.findMany({ // Changed from jobStatus to jobstatus
        select: { id: true, status: true },
        orderBy: { status: 'asc' } // Added orderBy for consistency
      }),
      prisma.agreementstatus.findMany({ // Changed from agreementStatus to agreementstatus
        select: { id: true, status: true },
        orderBy: { status: 'asc' } // Added orderBy for consistency
      })
    ]);

    res.status(200).json({
      departments,
      positions,
      maritalStatuses: maritalStatuses.map(s => ({ id: s.id, name: s.status })),
      employmentTypes: employmentTypes.map(t => ({ id: t.id, name: t.type })),
      jobStatuses: jobStatuses.map(s => ({ id: s.id, name: s.status })),
      agreementStatuses: agreementStatuses.map(s => ({ id: s.id, name: s.status })),
    });
  } catch (error) {
    console.error("Error fetching employee form lookups:", error);
    res.status(500).json({ error: "Failed to load form options." });
  }
});


// PATCH /api/hr/employees/:id - Update an employee's full details
router.get("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      // Include all related data for a rich, complete profile view
      include: {
        user: { select: { username: true, email: true, isActive: true } },
        department_employee_departmentIdTodepartment: { select: { name: true } },
        department_employee_subDepartmentIdTodepartment: { select: { name: true } },
        position: { select: { name: true } },
        maritalstatus: { select: { status: true } }, // Changed to lowercase
        employmenttype: { select: { type: true } }, // Changed to lowercase
        jobstatus: { select: { status: true } }, // Changed to lowercase
        agreementstatus: { select: { status: true } }, // Changed to lowercase
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found." });
    }
    res.status(200).json(employee);
  } catch (error) {
    console.error(`Error fetching employee with ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch employee details." });
  }
});


router.patch("/employees/:id", authenticate, authorize("HR"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // --- Prepare a clean payload for Prisma ---
    const updatePayload = {
      // Direct string/enum/date/decimal fields that can be updated
      firstName: data.firstName,
      lastName: data.lastName,
      baptismalName: data.baptismalName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      sex: data.sex,
      nationality: data.nationality,
      phone: data.phone,
      address: data.address,
      subCity: data.subCity,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      repentanceFatherName: data.repentanceFatherName,
      repentanceFatherChurch: data.repentanceFatherChurch,
      repentanceFatherPhone: data.repentanceFatherPhone,
      academicQualification: data.academicQualification,
      educationalInstitution: data.educationalInstitution,
      salary: data.salary ? parseFloat(data.salary) : undefined,
      bonusSalary: data.bonusSalary ? parseFloat(data.bonusSalary) : undefined,
      accountNumber: data.accountNumber,
      employmentDate: data.employmentDate ? new Date(data.employmentDate) : null,
      photo: data.photo,
      updatedAt: new Date(),
    };

    // --- Use correct relation field names (lowercase) ---
    if (data.departmentId) {
      updatePayload.department_employee_departmentIdTodepartment = { 
        connect: { id: parseInt(data.departmentId) } 
      };
    }
    if (data.subDepartmentId) {
      updatePayload.department_employee_subDepartmentIdTodepartment = { // Fixed typo
        connect: { id: parseInt(data.subDepartmentId) } 
      };
    } else {
      // If the user unsets the sub-department, we need to disconnect it.
      updatePayload.department_employee_subDepartmentIdTodepartment = { disconnect: true }; // Fixed typo
    }
    if (data.positionId) {
      updatePayload.position = { connect: { id: parseInt(data.positionId) } };
    }
    if (data.maritalStatusId) {
      updatePayload.maritalstatus = { connect: { id: parseInt(data.maritalStatusId) } };
    }
    if (data.employmentTypeId) {
      updatePayload.employmenttype = { connect: { id: parseInt(data.employmentTypeId) } };
    }
    if (data.jobStatusId) {
      updatePayload.jobstatus = { connect: { id: parseInt(data.jobStatusId) } };
    }
    if (data.agreementStatusId) {
      updatePayload.agreementstatus = { connect: { id: parseInt(data.agreementStatusId) } };
    }

    // --- Perform the update ---
    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: updatePayload,
    });

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(`Error updating employee with ID ${req.params.id}:`, error);
    if (error.code === 'P2025') {
        return res.status(404).json({ error: "Employee to update not found." });
    }
    res.status(500).json({ error: "Failed to update employee." });
  }
});

router.get("/lookup/roles", async (req, res) => {
  try {
    const data = await prisma.role.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    res.json(data);
  } catch (error) { res.status(500).json({ error: "Failed to fetch roles." }); }
});

router.get("/lookup/departments", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: { name: 'asc' }
    });
    
    // Optionally separate main departments from sub-departments
    const mainDepartments = departments.filter(dept => dept.parentId === null);
    const subDepartments = departments.filter(dept => dept.parentId !== null);
    
    res.status(200).json({
      all: departments,
      main: mainDepartments,
      sub: subDepartments
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch departments." });
  }
});

router.get("/lookup/positions", async (req, res) => {
  try {
    const data = await prisma.position.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    res.json(data);
  } catch (error) { res.status(500).json({ error: "Failed to fetch positions." }); }
});

router.get("/lookup/roles", async (req, res) => {
  try {
    const data = await prisma.role.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    res.json(data);
  } catch (error) { res.status(500).json({ error: "Failed to fetch roles." }); }
});

router.get("/lookup/departments", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json(departments ); // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json([]); // Return empty array on error
  }
});

router.get("/lookup/positions", async (req, res) => {
  try {
    const data = await prisma.position.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    res.json(data);
  } catch (error) { res.status(500).json({ error: "Failed to fetch positions." }); }
});

router.get("/lookup/marital-statuses", async (req, res) => {
  try {
    const data = await prisma.maritalstatus.findMany({ // Changed from maritalStatus to maritalstatus
      select: { id: true, status: true }, 
      orderBy: { status: 'asc' } 
    });
    res.json(data.map(item => ({ id: item.id, name: item.status })));
  } catch (error) { 
    console.error("Error fetching marital statuses:", error);
    res.status(500).json({ error: "Failed to fetch marital statuses." }); 
  }
});

router.get("/lookup/employment-types", async (req, res) => {
  try {
    const data = await prisma.employmenttype.findMany({ // Changed from employmentType to employmenttype
      select: { id: true, type: true }, 
      orderBy: { type: 'asc' } 
    });
    res.json(data.map(item => ({ id: item.id, name: item.type })));
  } catch (error) { 
    console.error("Error fetching employment types:", error);
    res.status(500).json({ error: "Failed to fetch employment types." }); 
  }
});

router.get("/lookup/job-statuses", async (req, res) => {
  try {
    const data = await prisma.jobstatus.findMany({ // Changed from jobStatus to jobstatus
      select: { id: true, status: true }, 
      orderBy: { status: 'asc' } 
    });
    res.json(data.map(item => ({ id: item.id, name: item.status })));
  } catch (error) { 
    console.error("Error fetching job statuses:", error);
    res.status(500).json({ error: "Failed to fetch job statuses." }); 
  }
});

router.get("/lookup/agreement-statuses", async (req, res) => {
  try {
    const data = await prisma.agreementstatus.findMany({ // Changed from agreementStatus to agreementstatus
      select: { id: true, status: true }, 
      orderBy: { status: 'asc' } 
    });
    res.json(data.map(item => ({ id: item.id, name: item.status })));
  } catch (error) { 
    console.error("Error fetching agreement statuses:", error);
    res.status(500).json({ error: "Failed to fetch agreement statuses." }); 
  }
});

router.get("/terminations", async (req, res) => {
  try {
    const terminations = await prisma.termination.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        terminationDate: true,
        reason: true,
        status: true,
        workflowStatus: true, 
        remarks: true,
        createdAt: true,
        employee: { 
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photo: true,
          },
        },
      },
    });
    res.status(200).json(terminations);
  } catch (error) {
    console.error("Error fetching terminations:", error);
    res.status(500).json({ error: "Failed to fetch terminations." });
  }
});

// POST /api/hr/terminations - Create a new termination record
router.post("/terminations", async (req, res) => {
  try {
    const { employeeId, terminationDate, reason, terminationType, remarks } = req.body;

    if (!employeeId || !terminationDate || !terminationType) {
      return res.status(400).json({ error: "Employee ID, termination date, and type are required." });
    }
    
    // ✅ THIS IS THE CRITICAL MAPPING LOGIC
    const statusMap = {
        'Voluntary': 'voluntary',
        'Involuntary': 'involuntary',
        'Retirement': 'retired'
    };
    const terminationStatusEnum = statusMap[terminationType]; // e.g., 'Involuntary' -> 'involuntary'

    if (!terminationStatusEnum) {
        return res.status(400).json({ error: "Invalid termination type provided." });
    }

    const newTermination = await prisma.termination.create({
      data: {
        employeeId: parseInt(employeeId),
        terminationDate: new Date(terminationDate),
        reason: reason || null,
        status: terminationStatusEnum, // ✅ We are using the corrected, lowercase value here
        remarks: remarks || null,
      },
      include: { // Include employee for the response
          employee: { select: { firstName: true, lastName: true, photo: true } }
      }
    });

    res.status(201).json(newTermination);
  } catch (error) {
    console.error("Error creating termination:", error);
    res.status(500).json({ error: "Failed to create termination." });
  }
});

// GET /api/hr/terminations/:id - Fetch a single termination record
router.get("/terminations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const termination = await prisma.termination.findUnique({
      where: { id: parseInt(id) },
      include: { employee: { select: { firstName: true, lastName: true } } }
    });
    if (!termination) {
      return res.status(404).json({ error: "Termination record not found." });
    }
    res.status(200).json(termination);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch termination record." });
  }
});

// PATCH /api/hr/terminations/:id - Update a termination record
router.patch("/terminations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Get all potential fields from the request body
    const { status, reason, remarks, terminationDate, workflowStatus } = req.body;

    // ✅ CREATE AN EMPTY OBJECT TO HOLD ONLY THE DATA WE WANT TO UPDATE
    const dataToUpdate = {};

    // --- Conditionally build the update payload ---

    // 1. Handle Termination Type (e.g., 'Voluntary')
    if (status) {
      // Map the user-friendly type from the frontend to the backend enum
      const statusMap = {
        'Voluntary': 'voluntary',
        'Involuntary': 'involuntary',
        'Retirement': 'retired'
      };
      // Only update if the provided status is valid
      if (statusMap[status]) {
        dataToUpdate.status = statusMap[status];
      }
    }

    // 2. ✅ HANDLE WORKFLOW STATUS (e.g., 'Processing')
    if (workflowStatus) {
      // Map the user-friendly status from the frontend to the backend enum
      const workflowStatusMap = {
        'Pending Approval': 'pending_approval',
        'Processing': 'processing',
        'Finalized': 'finalized'
      };
      // Only update if the provided status is valid
      if (workflowStatusMap[workflowStatus]) {
        dataToUpdate.workflowStatus = workflowStatusMap[workflowStatus];
      }
    }
    
    // 3. Handle other optional fields
    // The '!== undefined' check allows you to save empty strings (e.g., clearing a reason)
    if (reason !== undefined) {
      dataToUpdate.reason = reason;
    }
    if (remarks !== undefined) {
      dataToUpdate.remarks = remarks;
    }
    if (terminationDate) {
      dataToUpdate.terminationDate = new Date(terminationDate);
    }

    // Check if there is anything to update
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update." });
    }

    // --- Perform the update with the constructed data object ---
    const updatedTermination = await prisma.termination.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      // Include the same data shape that the GET /terminations route sends
      select: {
          id: true,
          terminationDate: true,
          reason: true,
          status: true,
          workflowStatus: true,
          remarks: true,
          createdAt: true,
          employee: {
              select: { id: true, firstName: true, lastName: true, photo: true }
          }
      }
    });

    res.status(200).json(updatedTermination);
  } catch (error) {
    console.error(`Error updating termination with ID ${req.params.id}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Termination record not found." });
    }
    res.status(500).json({ error: "Failed to update termination." });
  }
});

// DELETE /api/hr/terminations/:id - Delete a termination record
router.delete("/terminations/:id",  async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.termination.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).send(); // Success, no content
    } catch (error) {
        console.error("Error deleting termination:", error);
        res.status(500).json({ error: "Failed to delete termination." });
    }
});

// POST /api/hr/terminations - Create a new termination record
router.post("/terminations", async (req, res) => { // Add auth middleware back later
  try {
    const { employeeId, terminationDate, reason, terminationType, remarks } = req.body;

    // --- Validation ---
    if (!employeeId || !terminationDate || !terminationType) {
      return res.status(400).json({ error: "Employee ID, termination date, and type are required." });
    }
    
    // Map the frontend's 'terminationType' (e.g., "Voluntary") to the Prisma enum ('voluntary')
    const statusMap = {
        'Voluntary': 'voluntary',
        'Involuntary': 'involuntary',
        'Retirement': 'retired'
    };
    const terminationStatus = statusMap[terminationType];

    if (!terminationStatus) {
        return res.status(400).json({ error: "Invalid termination type provided." });
    }

    const newTermination = await prisma.termination.create({
      data: {
        employeeId: parseInt(employeeId),
        terminationDate: new Date(terminationDate),
        reason: reason || null,
        status: terminationStatusEnum, // Use the mapped enum value
        remarks: remarks || null,
      },
      // Include the employee data in the response so the frontend can display it
      include: {
          employee: {
              select: { firstName: true, lastName: true, photo: true }
          }
      }
    });

    res.status(201).json(newTermination);
  } catch (error) {
    console.error("Error creating termination:", error);
    // Handle cases where the employeeId doesn't exist
    if (error.code === 'P2003') {
        return res.status(400).json({ error: `Employee with ID ${req.body.employeeId} does not exist.` });
    }
    res.status(500).json({ error: "Failed to create termination." });
  }
});

const processDepartmentData = (department) => {
    // Helper to categorize a list of employees
    const processMembers = (employees) => {
        const staff = [];
        const interns = [];
        // Safety check: ensure employees is an array before looping
        (employees || []).forEach(emp => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            // Find the role name, assuming the first role is primary
            const role = emp.user?.roles[0]?.role.name;
            const memberData = { id: emp.id, name: fullName, photo: emp.photo };

            if (role === 'Staff') {
                staff.push(memberData);
            } else if (role === 'Intern') {
                interns.push(memberData);
            }
        });
        return { staff, interns };
    };

    // Process members for the main department itself
    const mainDeptMembers = processMembers(department.employees);
    
    // Process members for each sub-department
    const subDepartmentsWithMembers = (department.subDepartments || []).map(sub => {
        const subDeptMembers = processMembers(sub.employees);
        return {
            id: sub.id,
            name: sub.name,
            description: sub.description,
            staff: subDeptMembers.staff,
            interns: subDeptMembers.interns,
        };
    });
    
    // Calculate the grand total counts
    const totalStaffCount = mainDeptMembers.staff.length + subDepartmentsWithMembers.reduce((sum, sub) => sum + sub.staff.length, 0);
    const totalInternCount = mainDeptMembers.interns.length + subDepartmentsWithMembers.reduce((sum, sub) => sum + sub.interns.length, 0);

    // Construct the final, clean payload that the frontend expects
    return {
        id: department.id,
        name: department.name,
        description: department.description,
        staff: mainDeptMembers.staff,
        interns: mainDeptMembers.interns,
        subDepartments: subDepartmentsWithMembers,
        // Add the counts for the card view
        totalMembers: totalStaffCount + totalInternCount,
        staffCount: totalStaffCount,
        internCount: totalInternCount,
    };
};


// GET /departments - CORRECTED to include heads in counts
router.get("/departments", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        other_department: { // Changed from subDepartments to other_department
          orderBy: { name: 'asc' },
        },
      },
    });

    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        // Get all department IDs (main + sub-departments)
        const allDeptIds = [dept.id, ...dept.other_department.map(sub => sub.id)];
        
        const allMembersCount = await prisma.employee.count({ 
          where: { 
            OR: [
              { departmentId: { in: allDeptIds } }, 
              { subDepartmentId: { in: allDeptIds } }
            ] 
          } 
        });
        
        const staffCount = await prisma.employee.count({ 
          where: { 
            OR: [
              { departmentId: { in: allDeptIds } }, 
              { subDepartmentId: { in: allDeptIds } }
            ],
            user: { 
              userrole: { 
                some: { role: { name: 'Staff' } } 
              } 
            } 
          } 
        });
        
        const internCount = await prisma.employee.count({ 
          where: { 
            OR: [
              { departmentId: { in: allDeptIds } }, 
              { subDepartmentId: { in: allDeptIds } }
            ],
            user: { 
              userrole: { 
                some: { role: { name: 'Intern' } } 
              } 
            } 
          } 
        });
        
        return {
          ...dept,
          subDepartments: dept.other_department, // Rename for frontend compatibility
          staffCount,
          internCount,
          totalMembers: allMembersCount,
          payrollPolicyId: dept.payrollPolicyId,
        };
      })
    );
    
    res.status(200).json(departmentsWithCounts);
  } catch (error) {
    console.error("Error fetching department counts:", error);
    res.status(500).json({ error: "Failed to fetch departments." });
  }
});

// GET /departments/:id - CORRECTED to separate heads from staff/interns
router.get("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        other_department: { // Changed from subDepartments to other_department
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found." });
    }

    // Helper function to get members
    const getMembersForDepts = async (deptIds) => {
      if (!deptIds || deptIds.length === 0) {
        return { heads: [], staff: [], interns: [] };
      }
      
      const employees = await prisma.employee.findMany({
        where: {
          OR: [
            { departmentId: { in: deptIds } },
            { subDepartmentId: { in: deptIds } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          photo: true,
          user: {
            select: {
              userrole: { // Fixed from 'roles' to 'userrole'
                select: { 
                  role: { 
                    select: { name: true } 
                  } 
                },
              },
            },
          },
        },
      });

      const heads = [];
      const staff = [];
      const interns = [];
      
      employees.forEach(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`;
        const role = emp.user?.userrole[0]?.role.name; // Fixed path
        const memberData = { id: emp.id, name: fullName, photo: emp.photo };

        if (role === 'Department Head') heads.push(memberData);
        else if (role === 'Staff') staff.push(memberData);
        else if (role === 'Intern') interns.push(memberData);
      });
      
      return { heads, staff, interns };
    };

    const mainDeptMembers = await getMembersForDepts([department.id]);
    const subDepartmentsWithMembers = await Promise.all(
      (department.other_department || []).map(async (sub) => {
        const subDeptMembers = await getMembersForDepts([sub.id]);
        return {
          id: sub.id,
          name: sub.name,
          description: sub.description,
          heads: subDeptMembers.heads,
          staff: subDeptMembers.staff,
          interns: subDeptMembers.interns,
        };
      })
    );

    const finalResponse = {
      id: department.id,
      name: department.name,
      description: department.description,
      heads: mainDeptMembers.heads,
      staff: mainDeptMembers.staff,
      interns: mainDeptMembers.interns,
      subDepartments: subDepartmentsWithMembers, // Use consistent naming
    };

    res.status(200).json(finalResponse);
  } catch (error) {
    console.error(`Error fetching department details for ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch department details." });
  }
});
// POST /api/hr/departments - Create a new department or sub-department
router.post("/departments", async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Department name is required." });
    }
    
    const newDepartment = await prisma.department.create({
      data: {
        name,
        description,
        parentId: parentId ? parseInt(parentId) : null,
        updatedAt: new Date(), // Add this line
      },
    });
    
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error("Error creating department:", error);

    if (error.code === 'P2002') {
      const fields = error.meta.target.join(', ');
      return res.status(409).json({ error: `A department with this ${fields} already exists.` });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({ error: "The specified parent department does not exist." });
    }

    res.status(500).json({ error: "Failed to create department." });
  }
});

// PATCH /api/hr/departments/:id - Update a department's details
router.patch("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const updated = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        description,
        updatedAt: new Date(), // Add this line
      },
    });
    
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Failed to update department." });
  }
});

// DELETE /api/hr/departments/:id - Delete a department (must have no employees or sub-depts)
router.delete("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Safety check: a more robust implementation would check for employees
    await prisma.department.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete department. Make sure it has no employees or sub-departments." });
  }
});


// GET /api/hr/leaves - Fetch all leave requests
router.get("/leaves",  async (req, res) => {
  try {
    // Step 1: Fetch all departments into a Map for efficient lookups (ID -> Name)
    const allDepartments = await prisma.department.findMany({ select: { id: true, name: true } });
    const departmentMap = new Map(allDepartments.map(dept => [dept.id, dept.name]));

    // Step 2: Fetch leave requests with rich employee data
    const leaveRequests = await prisma.leave.findMany({
      orderBy: { requestedAt: 'desc' }, // Show the newest requests first
      include: {
        employee: {
          select: { // Include employee info needed for display
            firstName: true,
            lastName: true,
            department_employee_departmentIdTodepartment: { // Include the main department relation
              select: {
                name: true
              }
            },
            subDepartmentId: true, // Also get the sub-department ID
          }
        }
      }
    });
    
    // Step 3: Enrich the data with the sub-department name before sending
    const enrichedLeaveRequests = leaveRequests.map(leave => {
      // Use the map to find the sub-department name from its ID
      const subDepartmentName = departmentMap.get(leave.employee?.subDepartmentId) || null;
      return {
        ...leave,
        employee: {
          ...leave.employee,
          subDepartmentName: subDepartmentName,
        }
      };
    });

    res.status(200).json(enrichedLeaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Failed to fetch leave requests." });
  }
});


// PATCH /api/hr/leaves/:id/status - Update the status of a leave request
router.patch("/leaves/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'approved', 'pending', or 'rejected'

    // Validation
    if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "A valid status (approved, pending, rejected) is required." });
    }

    // Get the ID of the logged-in HR user to mark as the approver
    const approverId = req.user?.id|| 1; 

    const updatedLeave = await prisma.leave.update({
      where: { id: parseInt(id) },
      data: {
        status: status,
        approvedBy: approverId, // Log who approved/rejected the request
      },
      include: { // Return the full object for UI consistency
        employee: { select: { firstName: true, lastName: true } }
      }
    });
    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error(`Error updating leave request ${req.params.id}:`, error);
    if (error.code === 'P2025') {
        return res.status(404).json({ error: "Leave request not found." });
    }
    res.status(500).json({ error: "Failed to update leave request." });
  }
});


// GET /api/hr/overtime - CORRECTED to include department info
router.get("/overtime", async (req, res) => {
  try {
    // Step 1: Fetch all departments into a Map for efficient lookups (ID -> Name)
    const allDepartments = await prisma.department.findMany({ select: { id: true, name: true } });
    const departmentMap = new Map(allDepartments.map(dept => [dept.id, dept.name]));

    // Step 2: Fetch overtime requests with rich employee data
    const overtimeRequests = await prisma.overtimelog.findMany({
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department_employee_departmentIdTodepartment: {
              select: { name: true }
            },
            subDepartmentId: true,
          }
        },
        user: { // Changed from approver to user
          select: { 
            id: true, 
            username: true 
          }
        }
      }
    });

    // Step 3: Enrich the data with the sub-department name before sending
    const enrichedRequests = overtimeRequests.map(request => {
      // Use the map to find the sub-department name from its ID
      const subDepartmentName = departmentMap.get(request.employee?.subDepartmentId) || null;
      return {
        ...request,
        employee: {
          ...request.employee,
          departmentName: request.employee.department_employee_departmentIdTodepartment?.name || 'N/A',
          subDepartmentName: subDepartmentName || 'N/A'
        },
        // Add approver field for frontend compatibility
        approver: request.user // Map user to approver for frontend
      };
    });

    res.status(200).json(enrichedRequests);
  } catch (error) {
    console.error("Error fetching overtime requests:", error);
    res.status(500).json({ error: "Failed to fetch overtime requests." });
  }
});

// PATCH /api/hr/overtime/:id - Approve or reject an overtime request
router.patch("/overtime/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { approvalStatus } = req.body;

    // Validation
    if (!approvalStatus || !['approved', 'rejected', 'pending'].includes(approvalStatus)) {
      return res.status(400).json({ error: "A valid approvalStatus ('approved', 'pending', or 'rejected') is required." });
    }

    // Fallback for approverId since auth might be disabled for testing
    const approverId = req.user?.id || 1; // Make sure a User with ID 1 exists

    const updatedOvertime = await prisma.overtimelog.update({
      where: { 
        id: parseInt(id)
      },
      data: {
        approvalStatus: approvalStatus,
        approvedBy: approverId,
      },
      // Include the data needed by the frontend to avoid an extra fetch
      include: {
        employee: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true 
          } 
        },
        user: { // Changed from approver to user
          select: { 
            id: true, 
            username: true 
          }
        }
      }
    });

    // Add approver field for frontend compatibility
    const responseWithApprover = {
      ...updatedOvertime,
      approver: updatedOvertime.user // Map user to approver for frontend
    };

    res.status(200).json(responseWithApprover);
  } catch (error) {
    console.error(`Error updating overtime request ${id}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Overtime request not found." });
    }
    res.status(500).json({ error: "Failed to update overtime request." });
  }
});



// GET /api/hr/attendance/overview?year=2025&month=8 - Fetch monthly attendance data
router.get("/attendance/overview",  async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: "Year and month are required." });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    // 1. Fetch all active employees
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      select: { id: true, firstName: true, lastName: true, photo: true },
      orderBy: { firstName: 'asc' }
    });

    // 2. Fix: Use correct model name (attendancesummary instead of attendanceSummary)
    const attendanceRecords = await prisma.attendancesummary.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        employeeId: true,
        date: true,
        status: true,
      },
    });

    // 3. Transform the records
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      const day = new Date(record.date).getUTCDate();
      if (!attendanceMap[record.employeeId]) {
        attendanceMap[record.employeeId] = {};
      }
      attendanceMap[record.employeeId][day] = record.status;
    });

    res.status(200).json({ employees, attendanceMap });
  } catch (error) {
    console.error("Error fetching attendance overview:", error);
    res.status(500).json({ error: "Failed to fetch attendance data." });
  }
});

router.get("/reports/attendance",  async (req, res) => {
  try {
    const { timeframe } = req.query; // 'weekly' or 'monthly'
    
    // --- 1. Define the Date Range ---
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    let startDate;
    if (timeframe === 'weekly') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // Start of the current week (Sunday)
    } else { // monthly
      startDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
    }

    // --- 2. Fetch Core Data ---
    const [totalStaff, totalInterns, departments, attendanceSummaries] = await Promise.all([
      prisma.employee.count({ where: { user: { userrole: { some: { role: { name: 'Staff' } } } } } }),
      prisma.employee.count({ where: { user: { userrole: { some: { role: { name: 'Intern' } } } } } }),
      prisma.department.findMany({ 
        include: { 
          employee_employee_departmentIdTodepartment: { // Correct relation name
            select: { id: true } 
          } 
        } 
      }),
      prisma.attendancesummary.findMany({ // Changed from attendanceSummary to attendancesummary
        where: { date: { gte: startDate } },
        include: { 
          employee: { 
            select: { 
              departmentId: true 
            } 
          } 
        }
      })
    ]);

    // --- 3. Process the Data ---
    const topLevelDepartments = departments.filter(d => d.parentId === null);
    
    // a. Overall Attendance Summary (Pie Chart)
    const overallSummary = { present: 0, absent: 0, late: 0, on_leave: 0 };
    attendanceSummaries.forEach(summary => {
        if (overallSummary[summary.status] !== undefined) {
            if (summary.status === 'present' && summary.lateArrival) {
                overallSummary.late++;
            } else {
                overallSummary[summary.status]++;
            }
        }
    });

    // b. Department-wise Attendance (Bar Chart for top-level departments)
    const departmentWiseSummary = topLevelDepartments.map(dept => {
        const deptSummary = { name: dept.name, present: 0, absent: 0, late: 0, on_leave: 0 };
        const allEmployeeIdsInDept = new Set(
          dept.employee_employee_departmentIdTodepartment.map(e => e.id) // Correct relation name
        );
        
        // This is a simplified approach. A more robust way would be to get sub-department employees too.
        attendanceSummaries.forEach(summary => {
            if (allEmployeeIdsInDept.has(summary.employeeId)) {
                if (deptSummary[summary.status] !== undefined) {
                    if (summary.status === 'present' && summary.lateArrival) {
                        deptSummary.late++;
                    } else {
                        deptSummary[summary.status]++;
                    }
                }
            }
        });
        return deptSummary;
    });

    const finalResponse = {
      totalStaff,
      totalInterns,
      totalTopLevelDepartments: topLevelDepartments.length,
      overallAttendance: overallSummary,
      departmentAttendance: departmentWiseSummary,
      allDepartments: departments.map(d => ({id: d.id, name: d.name})) // For the monthly table
    };

    res.status(200).json(finalResponse);
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    res.status(500).json({ error: "Failed to fetch report data." });
  }
});

router.get("/profile", authenticate, authorize("HR"), async (req, res) => {
  try {
    // The 'authenticate' middleware provides req.user.id
    const userId = req.user.id;

    const employeeProfile = await prisma.employee.findUnique({
      where: {
        userId: userId,
      },
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
      },
    });

    if (!employeeProfile) {
      return res.status(404).json({ error: "Employee profile not found for the logged-in user." });
    }

    // The frontend will handle formatting, so we can send the raw data.
    res.status(200).json(employeeProfile);
  } catch (error) {
    console.error("Error fetching HR profile:", error);
    res.status(500).json({ error: "Failed to fetch profile data." });
  }
});




module.exports = router;
