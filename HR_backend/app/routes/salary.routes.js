// HR_backend/app/routes/salary.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require("@prisma/client"); // or your generated path
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// A helper function to get the start and end of the current month
function getCurrentMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { startOfMonth, endOfMonth };
}

router.get("/dashboard", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { startOfMonth, endOfMonth } = getCurrentMonthRange();

        const [
            totalEmployee,
            totalPaid,
            totalUnpaid,
            totalLeave,
        ] = await Promise.all([
            // 1. Total active employees
            prisma.employee.count({ where: { jobStatus: { status: 'Active' } } }),

            // 2. Total paid salaries for the current month
            prisma.salary.count({
                where: {
                    salaryMonth: startOfMonth,
                    status: 'paid'
                }
            }),

            // 3. Total unpaid salaries for the current month
            prisma.salary.count({
                where: {
                    salaryMonth: startOfMonth,
                    status: { in: ['pending', 'unpaid'] } // Or just 'pending' depending on your flow
                }
            }),

            // 4. Total employees on leave today
            prisma.leave.count({
                where: {
                    status: 'approved',
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                }
            })
        ]);

        res.status(200).json({
            totalEmployee,
            totalPaid,
            totalUnpaid,
            totalLeave,
        });

    } catch (error) {
        console.error("Error fetching salary dashboard data:", error);
        res.status(500).json({ error: "Failed to fetch salary dashboard data." });
    }
});
// ---------------------------------------------------------------------------------
// 1. GENERATE SALARIES FOR THE CURRENT MONTH
// POST /api/salary/generate
// ---------------------------------------------------------------------------------
router.post("/generate", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { startOfMonth, endOfMonth } = getCurrentMonthRange();

        // Step 1: Fetch the default payroll policy once to use as a fallback.
        const defaultPolicy = await prisma.payrollPolicy.findFirst({
            where: { isDefault: true }
        });

        if (!defaultPolicy) {
            return res.status(500).json({ error: "No default payroll policy found. Please ensure one is set in the database." });
        }

        // Step 2: Get all active, non-intern employees and include their department's custom policy.
        const employees = await prisma.employee.findMany({
            where: {
                jobStatus: { status: 'Active' },
                user: { roles: { some: { role: { name: { not: 'Intern' } } } } }
            },
            include: {
                department: {
                    include: {
                        payrollPolicy: true // This will be the custom policy if assigned, otherwise null.
                    }
                }
            }
        });

        let salariesGenerated = 0;
        const operations = [];

        for (const employee of employees) {
            // Step 3: Determine which policy to use for this specific employee.
            // If the employee's department has a custom policy, use it. Otherwise, use the default.
            const policyToUse = employee.department?.payrollPolicy || defaultPolicy;

            const baseSalary = parseFloat(employee.salary);
            const dailyValue = baseSalary / 30;

            // Calculate deductions (this logic remains the same)
            const absentCount = await prisma.attendanceSummary.count({
                where: { employeeId: employee.id, status: 'absent', date: { gte: startOfMonth, lte: endOfMonth } }
            });
            const deductions = absentCount * dailyValue;

            // Calculate overtime pay using the multipliers from the chosen policy
            const overtimes = await prisma.overtimeLog.findMany({
                where: { employeeId: employee.id, approvalStatus: 'approved', date: { gte: startOfMonth, lte: endOfMonth } }
            });

            let overtimePay = 0;
            for (const ot of overtimes) {
                const dayOfWeek = new Date(ot.date).getDay(); // 0 = Sunday
                const startTime = new Date(ot.startTime).getUTCHours();
                
                let multiplier = 1; 
                // We now use the dynamic multipliers from `policyToUse`
                if (dayOfWeek === 0) {
                    multiplier = parseFloat(policyToUse.otMultiplierSunday);
                } else {
                    if (startTime >= 11 && startTime < 16) {
                        multiplier = parseFloat(policyToUse.otMultiplierWeekday1);
                    } else if (startTime >= 16 || startTime < 2) { // Covers 16:00 to 02:00
                        multiplier = parseFloat(policyToUse.otMultiplierWeekday2);
                    }
                }
                // Note: Holiday and Sleepover logic can be added here in the future in the same way
                
                const hours = parseFloat(ot.hours) || 0;
                overtimePay += (hours / 8) * dailyValue * multiplier;
            }

            const totalSalary = (baseSalary - deductions) + overtimePay;

            // Step 4: Prepare the database operation with all the details
            operations.push(prisma.salary.upsert({
                where: { employeeId_salaryMonth: { employeeId: employee.id, salaryMonth: startOfMonth } },
                update: {
                    amount: totalSalary,
                    baseSalary: baseSalary,
                    overtimePay: overtimePay,
                    deductions: deductions,
                    status: 'pending'
                },
                create: {
                    employeeId: employee.id,
                    salaryMonth: startOfMonth,
                    amount: totalSalary,
                    baseSalary: baseSalary,
                    overtimeHours: overtimes.reduce((sum, ot) => sum + (parseFloat(ot.hours) || 0), 0),
                    overtimePay: overtimePay,
                    deductions: deductions,
                    status: 'pending'
                }
            }));
            salariesGenerated++;
        }

        // Execute all updates in a single, safe transaction
        await prisma.$transaction(operations);
        
        res.status(200).json({ message: `Successfully generated ${salariesGenerated} salary records using the new policy engine.` });

    } catch (error) {
        console.error("Error generating salaries:", error);
        res.status(500).json({ error: "Failed to generate salaries." });
    }
});

// ---------------------------------------------------------------------------------
// GET ALL SALARIES - MODIFIED TO GROUP BY DEPARTMENT AND ADD ABSENT COUNT
// ---------------------------------------------------------------------------------
router.get("/", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { startOfMonth, endOfMonth } = getCurrentMonthRange();
        const salaryData = await prisma.salary.findMany({
            where: { salaryMonth: startOfMonth },
            include: {
                employee: {
                    select: {
                        firstName: true, lastName: true,
                        salary: true, // ✅ ADDITION: Get the base salary from the employee model
                        department: { select: { id: true, name: true } },
                        user: { select: { username: true, roles: { select: { role: { select: { name: true } } } } } }
                    }
                }
            }
        });

        // Use a map to group salaries by department
        const departmentsMap = new Map();
        for (const s of salaryData) {
            const deptId = s.employee.department?.id || 0;
            const deptName = s.employee.department?.name || 'Uncategorized';

            if (!departmentsMap.has(deptId)) {
                departmentsMap.set(deptId, { id: deptId, name: deptName, salaries: [] });
            }

            const absentDays = await prisma.attendanceSummary.count({
                where: {
                    employeeId: s.employeeId,
                    status: 'absent',
                    date: { gte: startOfMonth, lte: endOfMonth }
                }
            });

            departmentsMap.get(deptId).salaries.push({
                id: s.id,
                username: s.employee.user.username,
                employeeName: `${s.employee.firstName} ${s.employee.lastName}`,
                role: s.employee.user.roles[0]?.role.name || 'N/A',
                baseSalary: s.employee.salary, // ✅ ADDITION: Pass the base salary to the frontend
                overtime: s.overtimeHours,
                absentDays: absentDays,
                totalSalary: s.amount,
                status: s.status,
                details: {
                    baseSalary: s.baseSalary,
                    overtimePay: s.overtimePay,
                    deductions: s.deductions
                }
            });
        }
        
        const groupedSalaries = Array.from(departmentsMap.values());
        res.status(200).json(groupedSalaries);
    } catch (error) {
        console.error("Error fetching salary data:", error);
        res.status(500).json({ error: "Failed to fetch salary data." });
    }
});

// ---------------------------------------------------------------------------------
// EDIT/UPDATE SALARY RECORD - MODIFIED TO HANDLE STATUS AND RECALCULATION
// ---------------------------------------------------------------------------------
router.patch("/:id", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, overtimeHours, absentDays } = req.body;

        const salaryRecord = await prisma.salary.findUnique({
            where: { id: parseInt(id) },
            include: { employee: true }
        });
        if (!salaryRecord) return res.status(404).json({ error: "Salary record not found." });

        const dataToUpdate = {};
        
        // Handle status update separately
        if (status && ['paid', 'unpaid', 'pending'].includes(status)) {
            dataToUpdate.status = status;
            if (status === 'paid') dataToUpdate.paidAt = new Date();
            else dataToUpdate.paidAt = null;
        }

        // Handle recalculation if overtime or absent days are provided
        if (overtimeHours !== undefined || absentDays !== undefined) {
            const employee = salaryRecord.employee;
            const baseSalary = parseFloat(employee.salary);
            const dailyValue = baseSalary / 30;

            const finalAbsentDays = absentDays !== undefined ? parseFloat(absentDays) : (salaryRecord.deductions / dailyValue);
            const finalOvertimeHours = overtimeHours !== undefined ? parseFloat(overtimeHours) : parseFloat(salaryRecord.overtimeHours);

            const deductions = finalAbsentDays * dailyValue;
            const averageOvertimeRate = parseFloat(salaryRecord.overtimePay) / (parseFloat(salaryRecord.overtimeHours) || 1);
            const newOvertimePay = finalOvertimeHours * averageOvertimeRate;
            const newTotalSalary = (baseSalary - deductions) + newOvertimePay;
            
            dataToUpdate.amount = newTotalSalary;
            dataToUpdate.overtimeHours = finalOvertimeHours;
            dataToUpdate.overtimePay = newOvertimePay;
            dataToUpdate.deductions = deductions;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ error: "No valid fields provided for update." });
        }

        const updatedSalary = await prisma.salary.update({
            where: { id: parseInt(id) },
            data: dataToUpdate
        });
        res.status(200).json({ message: "Salary record updated successfully.", salary: updatedSalary });
    } catch (error) {
        console.error(`Error updating salary ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to update salary record." });
    }
});


// ---------------------------------------------------------------------------------
// 4. MARK A SALARY AS PAID
// POST /api/salary/pay/:id
// ---------------------------------------------------------------------------------
router.post("/pay/:id", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.salary.update({
            where: { id: parseInt(id) },
            data: {
                status: 'paid',
                paidAt: new Date()
            }
        });
        res.status(200).json({ message: "Salary marked as paid." });
    } catch (error) {
        console.error(`Error paying salary ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to pay salary." });
    }
});

module.exports = router;