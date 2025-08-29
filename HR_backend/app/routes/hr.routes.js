const express = require("express");
const router = express.Router();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const hrController = require("../controllers/hr.controller");
const { processDailyAttendance } = require("../jobs/attendanceProcessor");

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
      meetings, // This will now get all meetings
      holidays
    ] = await Promise.all([
      prisma.employee.count({ where: { user: { roles: { some: { role: { name: { notIn: ["HR"] } } } } } } }),
      prisma.department.count({ where: { parentId: null } }),
      prisma.department.count({ where: { parentId: { not: null } } }),
      prisma.employee.count({ where: { user: { roles: { some: { role: { name: { in: ["Staff", "Department Head"] } } } } } } }),
      prisma.employee.count({ where: { user: { roles: { some: { role: { name: "Intern" } } } } } }),
      prisma.leave.count({ where: { status: "approved", startDate: { lte: today }, endDate: { gte: today } } }),
      prisma.leave.count({ where: { status: "pending" } }),
      prisma.overtimeLog.count({ where: { approvalStatus: "pending" } }),
      prisma.complaint.count({ where: { status: { in: ["open", "in_review"] } } }),
      prisma.employee.findMany({
        where: { user: { roles: { some: { role: { name: "Department Head" } } } } },
        select: { id: true, firstName: true, lastName: true, phone: true, photo: true, department: { select: { name: true } } },
        orderBy: { firstName: 'asc' }
      }),
      
      // ✅ REMOVED: The date filter to get all meetings
      
      prisma.meeting.findMany({
        orderBy: { date: 'asc' },
        include: { creator: { select: { firstName: true, lastName: true } } }
      }),
      prisma.holiday.findMany({ orderBy: { date: 'asc' } })
    ]);
        console.log(`Found ${meetings.length} meetings in database`);
    if (meetings.length > 0) {
      console.log("Sample meeting:", meetings[0]);
    }

    const presentSummaries = await prisma.attendanceSummary.findMany({
        where: { date: today, status: { in: ['present', 'absent'] }, departmentId: { not: null } },
        include: { department: { select: { name: true } } }
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


// GET /api/hr/meetings - Fetch all meetings
// in your HR backend routes file

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
            department: { // Include the main department relation
              select: {
                name: true
              }
            },
            subDepartmentId: true, // Also get the sub-department ID
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
          departmentName: complaint.employee.department?.name || 'N/A',
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
router.post("/employees", async (req, res) => { // NOTE: Add 'authenticate, authorize("HR")' middleware back later
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
        sex: employeeData.sex, // 'male', 'female', 'other'
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
        photo: employeeData.photo, // This is the Base64 string from the frontend

        // Correctly formatted Date and Decimal fields
        dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth) : null,
        employmentDate: employeeData.employmentDate ? new Date(employeeData.employmentDate) : null,
        salary: employeeData.salary ? parseFloat(employeeData.salary) : 0.00,
        bonusSalary: employeeData.bonusSalary ? parseFloat(employeeData.bonusSalary) : 0.00,
      };

      // --- 3. Conditionally connect relationships using Prisma's 'connect' syntax ---
      if (employeeData.departmentId) {
        employeeCreateData.department = { connect: { id: parseInt(employeeData.departmentId) } };
      }
      if (employeeData.subDepartmentId) {
        // This is a direct field, not a relation on the Employee model itself.
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
      
      // e. Create the Employee record with the fully prepared data
      const newEmployee = await tx.employee.create({
        data: employeeCreateData,
      });
      
      // f. Fetch the full new employee with relations to return to the frontend for the UI update
      const fullNewEmployee = await tx.employee.findUnique({
          where: { id: newEmployee.id },
          include: { 
            department: { select: { name: true } }, 
            position: { select: { name: true } } 
          }
      });
      
      return fullNewEmployee;
    });

    // --- 4. Send Success Response ---
    res.status(201).json(result);

  } catch (error) {
    // --- 5. Handle Errors Gracefully ---
    console.error("Error creating employee:", error);

    // Specific error for duplicate username/email
    if (error.code === 'P2002') {
         const fields = Array.isArray(error.meta.target) 
        ? error.meta.target.join(', ') 
        : error.meta.target;

      return res.status(409).json({ error: `An account with this ${fields} already exists. Please choose another.` });
    }

    // Generic server error
    res.status(500).json({ error: "An internal server error occurred while creating the employee." });
  }
});


// GET /api/hr/employees - Fetches a list of all employees
router.get("/employees", authenticate, authorize("HR"), async (req, res) => {
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
        department: {
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

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees." });
  }
});


// GET /api/hr/employees/search?q=... - Search for employees by name
router.get("/employees/search", async (req, res) => {
  try {
    const { q } = req.query; // q is the search query
    if (!q) {
      return res.json([]);
    }
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, photo: true },
      take: 10, // Limit results
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: "Failed to search employees." });
  }
});

router.get("/employee-form-lookups", authenticate, authorize("HR"), async (req, res) => {
    try {
        const [
            departments,
            positions,
            maritalStatuses,
            employmentTypes,
            jobStatuses,
            agreementStatuses
        ] = await Promise.all([
            // This query fetches ALL departments, including sub-departments
            prisma.department.findMany({ select: { id: true, name: true, parentId: true }, orderBy: { name: 'asc' } }),
            prisma.position.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
            prisma.maritalStatus.findMany({ select: { id: true, status: true } }),
            prisma.employmentType.findMany({ select: { id: true, type: true } }),
            prisma.jobStatus.findMany({ select: { id: true, status: true } }),
            prisma.agreementStatus.findMany({ select: { id: true, status: true } })
        ]);

        // We format the data to have a consistent { id, name } structure for the frontend dropdowns
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
router.get("/employees/:id", authenticate, authorize("HR"), async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      // Include all related data for a rich, complete profile view
      include: {
        user: { select: { username: true, email: true, isActive: true } },
        department: { select: { name: true } },
        // ✅ ADDITION: Include the sub-department information
        subDepartment: { select: { name: true } }, 
        position: { select: { name: true } },
        maritalStatus: { select: { status: true } },
        employmentType: { select: { type: true } },
        jobStatus: { select: { status: true } },
        agreementStatus: { select: { status: true } },
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
      photo: data.photo, // For updating the photo URL
    };

    // --- ✅ THE FIX: Conditionally connect ALL relationships ---
    // This uses Prisma's 'connect' syntax, which is the correct way to update a relation.
    if (data.departmentId) {
      updatePayload.department = { connect: { id: parseInt(data.departmentId) } };
    }
    if (data.subDepartmentId) {
      updatePayload.subDepartment = { connect: { id: parseInt(data.subDepartmentId) } };
    } else {
      // If the user unsets the sub-department, we need to disconnect it.
      updatePayload.subDepartment = { disconnect: true };
    }
    if (data.positionId) {
      updatePayload.position = { connect: { id: parseInt(data.positionId) } };
    }
    if (data.maritalStatusId) {
      updatePayload.maritalStatus = { connect: { id: parseInt(data.maritalStatusId) } };
    }
    if (data.employmentTypeId) {
      updatePayload.employmentType = { connect: { id: parseInt(data.employmentTypeId) } };
    }
    if (data.jobStatusId) {
      updatePayload.jobStatus = { connect: { id: parseInt(data.jobStatusId) } };
    }
    if (data.agreementStatusId) {
      updatePayload.agreementStatus = { connect: { id: parseInt(data.agreementStatusId) } };
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
      // ✅ THIS IS THE FIX ✅
      // Select the parentId so the frontend can filter by it.
      select: { id: true, name: true, parentId: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json(departments);
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

router.get("/lookup/marital-statuses", async (req, res) => {
  try {
    const data = await prisma.maritalStatus.findMany({ select: { id: true, status: true }, orderBy: { status: 'asc' } });
    res.json(data.map(item => ({ id: item.id, name: item.status }))); // Normalize to { id, name }
  } catch (error) { res.status(500).json({ error: "Failed to fetch marital statuses." }); }
});

router.get("/lookup/employment-types", async (req, res) => {
  try {
    const data = await prisma.employmentType.findMany({ select: { id: true, type: true }, orderBy: { type: 'asc' } });
    res.json(data.map(item => ({ id: item.id, name: item.type }))); // Normalize
  } catch (error) { res.status(500).json({ error: "Failed to fetch employment types." }); }
});

router.get("/lookup/job-statuses", async (req, res) => {
  try {
    const data = await prisma.jobStatus.findMany({ select: { id: true, status: true }, orderBy: { status: 'asc' } });
    res.json(data.map(item => ({ id: item.id, name: item.status }))); // Normalize
  } catch (error) { res.status(500).json({ error: "Failed to fetch job statuses." }); }
});

router.get("/lookup/agreement-statuses", async (req, res) => {
  try {
    const data = await prisma.agreementStatus.findMany({ select: { id: true, status: true }, orderBy: { status: 'asc' } });
    res.json(data.map(item => ({ id: item.id, name: item.status }))); // Normalize
  } catch (error) { res.status(500).json({ error: "Failed to fetch agreement statuses." }); }
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

// In your backend file: routes/hr.routes.js

// GET /departments - CORRECTED to include heads in counts
router.get("/departments", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        subDepartments: {
          orderBy: { name: 'asc' },
        },
      },
    });

    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        // ... (all your existing counting logic is correct and stays here)
        const allDeptIds = [dept.id, ...dept.subDepartments.map(sub => sub.id)];
        const allMembersCount = await prisma.employee.count({ where: { OR: [{ departmentId: { in: allDeptIds } }, { subDepartmentId: { in: allDeptIds } }] } });
        const staffCount = await prisma.employee.count({ where: { OR: [{ departmentId: { in: allDeptIds } }, { subDepartmentId: { in: allDeptIds } }], user: { roles: { some: { role: { name: 'Staff' } } } } } });
        const internCount = await prisma.employee.count({ where: { OR: [{ departmentId: { in: allDeptIds } }, { subDepartmentId: { in: allDeptIds } }], user: { roles: { some: { role: { name: 'Intern' } } } } } });
        
        return {
          ...dept,
          staffCount,
          internCount,
          totalMembers: allMembersCount,
          // ✅ ADDITION: Include the assigned payroll policy ID
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
        subDepartments: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found." });
    }

    // ✅ FIX: This helper function now categorizes heads, staff, and interns.
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
              roles: { select: { role: { select: { name: true } } } },
            },
          },
        },
      });

      const heads = [];
      const staff = [];
      const interns = [];
      employees.forEach(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`;
        const role = emp.user?.roles[0]?.role.name;
        const memberData = { id: emp.id, name: fullName, photo: emp.photo };

        if (role === 'Department Head') heads.push(memberData);
        else if (role === 'Staff') staff.push(memberData);
        else if (role === 'Intern') interns.push(memberData);
      });
      return { heads, staff, interns };
    };

    const mainDeptMembers = await getMembersForDepts([department.id]);
    const subDepartmentsWithMembers = await Promise.all(
      (department.subDepartments || []).map(async (sub) => {
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
      subDepartments: subDepartmentsWithMembers,
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
    const { name, description, parentId } = req.body; // parentId will be null for top-level
    if (!name) {
      return res.status(400).json({ error: "Department name is required." });
    }
    const newDepartment = await prisma.department.create({
      data: {
        name,
        description,
        parentId: parentId ? parseInt(parentId) : null,
      },
    });
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error("Error creating department:", error); // Log the full error for debugging

    // P2002 is the Prisma code for a unique constraint violation
    if (error.code === 'P2002') {
      // The 'target' tells you which field caused the error
      const fields = error.meta.target.join(', ');
      return res.status(409).json({ error: `A department with this ${fields} already exists.` });
    }

    // P2003 is for a foreign key constraint failure (e.g., invalid parentId)
    if (error.code === 'P2003') {
        return res.status(400).json({ error: "The specified parent department does not exist." });
    }

    // A generic fallback error
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
      data: { name, description },
    });
    res.status(200).json(updated);
  } catch (error) {
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
            department: { // Include the main department relation
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
    const overtimeRequests = await prisma.overtimeLog.findMany({
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: {
              select: { name: true }
            },
            subDepartmentId: true,
          }
        },
        approver: { select: { id: true, username: true } }
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
          departmentName: request.employee.department?.name || 'N/A',
          subDepartmentName: subDepartmentName || 'N/A'
        }
      };
    });

    res.status(200).json(enrichedRequests);
  } catch (error) {
    console.error("Error fetching overtime requests:", error);
    res.status(500).json({ error: "Failed to fetch overtime requests." });
  }
});


// PATCH /api/hr/overtime/:id - Approve or reject an overtime request
router.patch("/overtime/:id", async (req, res) => { // Auth middleware can be added back later
  const { id } = req.params;
  try {
    const { approvalStatus } = req.body;

    // Validation
    if (!approvalStatus || !['approved', 'rejected', 'pending'].includes(approvalStatus)) {
      return res.status(400).json({ error: "A valid approvalStatus ('approved', 'pending', or 'rejected') is required." });
    }
    
    // Fallback for approverId since auth might be disabled for testing
    const approverId = req.user?.id || 1; // Make sure a User with ID 1 exists

    const updatedOvertime = await prisma.overtimeLog.update({
      where: { 
        id: parseInt(id) // Ensure the ID is parsed as an integer
      },
      data: {
        approvalStatus: approvalStatus, // This is the new status to save
        approvedBy: approverId,
      },
      // Include the data needed by the frontend to avoid an extra fetch
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        approver: { select: { id: true, username: true } }
      }
    });

    res.status(200).json(updatedOvertime);
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
    const { year, month } = req.query; // month is 1-12 from the frontend

    if (!year || !month) {
      return res.status(400).json({ error: "Year and month are required." });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    // 1. Fetch all active employees
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null }, // Assuming you have a soft-delete mechanism
      select: { id: true, firstName: true, lastName: true, photo: true },
      orderBy: { firstName: 'asc' }
    });

    // 2. Fetch all attendance summaries for the given month
    const attendanceRecords = await prisma.attendanceSummary.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        employeeId: true,
        date: true,
        status: true, // This is the SummaryStatus enum
      },
    });

    // 3. Transform the records into a more efficient map for the frontend
    // The structure will be: { employeeId: { day: status, ... }, ... }
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      const day = new Date(record.date).getUTCDate(); // Get day of the month (1-31)
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
      prisma.employee.count({ where: { user: { roles: { some: { role: { name: 'Staff' } } } } } }),
      prisma.employee.count({ where: { user: { roles: { some: { role: { name: 'Intern' } } } } } }),
      prisma.department.findMany({ include: { employees: { select: { id: true } } } }),
      prisma.attendanceSummary.findMany({
        where: { date: { gte: startDate } },
        include: { employee: { select: { departmentId: true } } }
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
        const allEmployeeIdsInDept = new Set(dept.employees.map(e => e.id));
        
        // This is a simplified approach. A more robust way would be to get sub-department employees too.
        attendanceSummaries.forEach(summary => {
            if (allEmployeeIdsInDept.has(summary.employee.id)) {
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
      // ✅ SELECT all fields from the Employee model to match the frontend
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





module.exports = router;
