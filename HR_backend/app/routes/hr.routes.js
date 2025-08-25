const express = require("express");
const router = express.Router();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const hrController = require("../controllers/hr.controller");

// router.get(
//   "/complaints",
//   hrController.getAllComplaints
// );

// router.patch(
//   "/complaints/:id",
//   hrController.respondToComplaint
// );

// GET /api/hr/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      totalDepartments,
      totalStaff,
      totalIntern,
      totalOnLeave,
      totalAbsentToday,
      totalWorkingDays,
      pendingLeaveApproval,
      todaysPresent,
      totalOpenComplaints,
      recentComplaints,
      presentPerDepartment,
    ] = await Promise.all([
      // 1. Total employees (non-HR, non-intern)
      prisma.employee.count({
        where: {
          user: {
            roles: {
              some: {
                role: {
                  name: { notIn: ["HR", "Intern"] },
                },
              },
            },
          },
        },
      }),

      // 2. Total departments
      prisma.department.count(),

      // 3. Total staff (non-HR, non-intern)
      prisma.employee.count({
        where: {
          user: {
            roles: {
              some: {
                role: {
                  name: "Staff",
                },
              },
            },
          },
        },
      }),

      // 4. Total interns
      prisma.employee.count({
        where: {
          user: {
            roles: {
              some: {
                role: {
                  name: "Intern",
                },
              },
            },
          },
        },
      }),

      // 5. Total on leave today (status approved, date range includes today)
      prisma.leave.count({
        where: {
          status: "approved",
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),

      // 6. Total absent today (attendanceSummary status = 'absent')
      prisma.attendanceSummary.count({
        where: {
          date: today,
          status: "absent",
        },
      }),

      // 7. Total working days (exclude Sundays, count from attendance logs)
      prisma.attendanceSummary
        .groupBy({
          by: ["date"],
          where: {
            date: {
              gte: new Date(today.getFullYear(), 0, 1), // from start of year
            },
          },
        })
        .then((days) => days.filter((d) => d.date.getDay() !== 0).length),

      // 8. Pending leave approvals
      prisma.leave.count({
        where: {
          status: "pending",
        },
      }),

      // 9. Today's Present
      prisma.attendanceSummary.count({
        where: {
          date: today,
          status: "present",
        },
      }),

      // 10. Total open complaints (status = open)
      prisma.complaint.count({
        where: { status: "open" },
      }),

      // 11. Recent complaints (day sent + description only)
      prisma.complaint.findMany({
        where: { status: "in_review" },
        select: {
          createdAt: true,
          description: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // 12. Chart: Present per department
      prisma.attendanceSummary.groupBy({
        by: ["departmentId"],
        where: {
          date: today,
          status: "present",
        },
        _count: { _all: true },
      }),
    ]);

    const presentPerDepartmentWithNames = await Promise.all(
      presentPerDepartment.map(async (item) => {
        const dept = await prisma.department.findUnique({
          where: { id: item.departmentId },
          select: { name: true },
        });
        return {
          departmentId: item.departmentId,
          departmentName: dept?.name || "Unknown",
          presentCount: item._count._all,
        };
      })
    );

    res.status(200).json({
      totalEmployees,
      totalDepartments,
      totalStaff,
      totalIntern,
      totalOnLeave,
      totalAbsentToday,
      totalWorkingDays,
      pendingLeaveApproval,
      todaysPresent,
      totalOpenComplaints,
      recentComplaints,
      presentPerDepartment: presentPerDepartmentWithNames,
    });
  } catch (error) {
    console.error("Error fetching HR dashboard data:", error);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});
// In your HR routes file where the /dashboard route is
// In your backend hr.routes.js file

// GET /api/hr/meetings - Fetch all meetings
router.get("/meetings",  async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { date: "asc" },
    });
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
});

// POST /api/hr/meetings - Add a new meeting

router.post("/meetings", async (req, res) => {
  try {
    const { title, date, time } = req.body;
    if (!title || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

 

    const newMeeting = await prisma.meeting.create({
      data: {
        title: title,
        date: date, // Your schema expects a String
        time: time, // Providing the required field
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

// In your backend file: routes/hr.routes.js

// ... your existing router setup ...

// GET /api/hr/complaints - Fetch all complaints, ordered by newest first
// In your backend file: routes/hr.routes.js

// GET /api/hr/complaints - Fetch all complaints, ordered by newest first
router.get("/complaints", async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        employee: {
          // STEP 1: Select the correct fields from the database
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // STEP 2: Transform the data to create a 'name' field for the frontend
    const formattedComplaints = complaints.map(complaint => {
      return {
        ...complaint, // Copy all existing complaint properties (id, subject, etc.)
        employee: {
          // Overwrite the employee object with a new one that has the combined name
          name: `${complaint.employee.firstName} ${complaint.employee.lastName}`
        }
      };
    });

    // STEP 3: Send the newly formatted data to the frontend
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

// In a backend routes file, e.g., routes/hr.routes.js


// ... your existing router setup ...

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

// GET /api/hr/employees - Fetch ACTIVE employees for the list page
router.get("/employees", async (req, res) => {
  try {
    const terminatedEmployeeIds = await prisma.termination.findMany({
      select: { employeeId: true },
    });
    const idsToExclude = terminatedEmployeeIds.map(t => t.employeeId);

    const employees = await prisma.employee.findMany({
      where: {
        id: {
          notIn: idsToExclude, // ✅ EXCLUDE TERMINATED EMPLOYEES
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        department: { select: { name: true } },
        position: { select: { name: true } },
      },
    });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employee list." });
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

router.get("/employees/:id", async (req, res) => { // Add auth middleware later
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: { // Include all related data for a rich profile view
        user: { select: { username: true, email: true, isActive: true } },
        department: { select: { name: true } },
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

// PATCH /api/hr/employees/:id - Update an employee's details
// In your backend file: routes/hr.routes.js

// PATCH /api/hr/employees/:id - Update an employee's full details
router.patch("/employees/:id", async (req, res) => { // Add auth middleware back later
  try {
    const { id } = req.params;
    const data = req.body;

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
    };

    // Conditionally connect relationships if the ID is provided
    if (data.departmentId) {
      updatePayload.department = { connect: { id: parseInt(data.departmentId) } };
    }
    if (data.positionId) {
      updatePayload.position = { connect: { id: parseInt(data.positionId) } };
    }
    // ... add more for maritalStatusId, employmentTypeId, etc.

    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: updatePayload,
      // Re-fetch all data to send the updated profile back to the frontend
      include: {
        user: { select: { username: true, email: true, isActive: true } },
        department: { select: { name: true } },
        position: { select: { name: true } },
        maritalStatus: { select: { status: true } },
        employmentType: { select: { type: true } },
        jobStatus: { select: { status: true } },
        agreementStatus: { select: { status: true } },
      },
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
// In your backend file: routes/hr.routes.js

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
// In backend routes/hr.routes.js

// In your backend file: routes/hr.routes.js

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

// ... your existing GET, PATCH, DELETE routes for terminations ...

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

// GET /api/hr/departments - FINAL, ROBUST VERSION
router.get("/departments", async (req, res) => {
  try {
    // Step 1: Fetch the department structure (top-level and their direct children)
    const departments = await prisma.department.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        subDepartments: {
          orderBy: { name: 'asc' },
        },
      },
    });

    // Step 2: Iterate through each department and calculate the counts with separate, targeted queries
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        // Get a list of all relevant department IDs (the parent + all its children)
        const allDeptIds = [dept.id, ...dept.subDepartments.map(sub => sub.id)];

        // Count staff in this department family
        const staffCount = await prisma.employee.count({
          where: {
            OR: [
              { departmentId: { in: allDeptIds } },
              { subDepartmentId: { in: allDeptIds } },
            ],
            user: {
              roles: { some: { role: { name: 'Staff' } } },
            },
          },
        });

        // Count interns in this department family
        const internCount = await prisma.employee.count({
          where: {
            OR: [
              { departmentId: { in: allDeptIds } },
              { subDepartmentId: { in: allDeptIds } },
            ],
            user: {
              roles: { some: { role: { name: 'Intern' } } },
            },
          },
        });
        
        // Construct the final object for the frontend
        return {
          ...dept,
          staffCount,
          internCount,
          totalMembers: staffCount + internCount,
        };
      })
    );

    res.status(200).json(departmentsWithCounts);

  } catch (error) {
    // This will now catch any errors from the count queries as well
    console.error("Error fetching department counts:", error);
    res.status(500).json({ error: "Failed to fetch departments." });
  }
});

// GET /api/hr/departments/:id - Fetch a single department
// In your backend file: routes/hr.routes.js

// GET /api/hr/departments/:id - FINAL, ROBUST VERSION
router.get("/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Fetch the department and its sub-department structure (lean query)
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

    // A helper function to get categorized members for a list of department IDs
    const getMembersForDepts = async (deptIds) => {
      if (!deptIds || deptIds.length === 0) {
          return { staff: [], interns: [] };
      }
      
      // Lean query: only select the fields we absolutely need. This avoids bad date errors.
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

      const staff = [];
      const interns = [];
      employees.forEach(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`;
        const role = emp.user?.roles[0]?.role.name;
        const memberData = { id: emp.id, name: fullName, photo: emp.photo };

        if (role === 'Staff') staff.push(memberData);
        else if (role === 'Intern') interns.push(memberData);
      });
      return { staff, interns };
    };

    // Step 2: Get members for the main department
    const mainDeptMembers = await getMembersForDepts([department.id]);

    // Step 3: Get members for each sub-department individually
    const subDepartmentsWithMembers = await Promise.all(
      (department.subDepartments || []).map(async (sub) => {
        const subDeptMembers = await getMembersForDepts([sub.id]);
        return {
          id: sub.id,
          name: sub.name,
          description: sub.description,
          staff: subDeptMembers.staff,
          interns: subDeptMembers.interns,
        };
      })
    );

    const finalResponse = {
      id: department.id,
      name: department.name,
      description: department.description,
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
    const leaveRequests = await prisma.leave.findMany({
      orderBy: { requestedAt: 'desc' }, // Show the newest requests first
      include: {
        employee: {
          select: { // Include employee info needed for display
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    res.status(200).json(leaveRequests);
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

// GET /api/hr/overtime - Fetch all overtime requests
// GET /api/hr/overtime - Fetch all overtime requests
router.get("/overtime", async (req, res) => { // Add auth middleware back later
  try {
    const overtimeRequests = await prisma.overtimeLog.findMany({
      orderBy: { date: 'desc' },
      // ✅ Use a 'select' statement for a lean and specific payload
      select: {
        id: true,
        date: true,
        startTime: true, // Select the start time
        endTime: true,   // Select the end time
        hours: true,     // Also select the pre-calculated hours
        reason: true,
        approvalStatus: true,
        compensationMethod: true,
        employee: { select: { id: true, firstName: true, lastName: true } },
        approver: { select: { id: true, username: true } }
      }
    });
    res.status(200).json(overtimeRequests);
  } catch (error) {
    console.error("Error fetching overtime requests:", error);
    res.status(500).json({ error: "Failed to fetch overtime requests." });
  }
});

// PATCH /api/hr/overtime/:id - Approve or reject an overtime request
// In your backend file: routes/hr.routes.js

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
