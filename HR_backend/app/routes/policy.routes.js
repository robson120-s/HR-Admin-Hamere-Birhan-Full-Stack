// HR_backend/app/routes/policy.routes.js

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma'); // or your generated path
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// GET /api/policies - Fetch all payroll policies
router.get("/", authenticate, authorize("HR"), async (req, res) => {
    try {
        const policies = await prisma.payrollPolicy.findMany({
            orderBy: { name: 'asc' }
        });
        res.status(200).json(policies);
    } catch (error) {
        console.error("Error fetching payroll policies:", error);
        res.status(500).json({ error: "Failed to fetch policies." });
    }
});

// POST /api/policies - Create a new payroll policy
router.post("/", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { name, ...multipliers } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Policy name is required." });
        }
        const newPolicy = await prisma.payrollPolicy.create({
            data: {
                name,
                isDefault: false, // New policies are never the default
                otMultiplierWeekday1: multipliers.otMultiplierWeekday1,
                otMultiplierWeekday2: multipliers.otMultiplierWeekday2,
                otMultiplierSleepover: multipliers.otMultiplierSleepover,
                otMultiplierSunday: multipliers.otMultiplierSunday,
                otMultiplierHoliday: multipliers.otMultiplierHoliday,
            }
        });
        res.status(201).json(newPolicy);
    } catch (error) {
        console.error("Error creating payroll policy:", error);
        res.status(500).json({ error: "Failed to create policy." });
    }
});

// PATCH /api/policies/:id - Update an existing payroll policy
router.patch("/:id", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, ...multipliers } = req.body;

        const updatedPolicy = await prisma.payrollPolicy.update({
            where: { id: parseInt(id) },
            data: {
                name,
                otMultiplierWeekday1: multipliers.otMultiplierWeekday1,
                otMultiplierWeekday2: multipliers.otMultiplierWeekday2,
                otMultiplierSleepover: multipliers.otMultiplierSleepover,
                otMultiplierSunday: multipliers.otMultiplierSunday,
                otMultiplierHoliday: multipliers.otMultiplierHoliday,
            }
        });
        res.status(200).json(updatedPolicy);
    } catch (error) {
        console.error("Error updating payroll policy:", error);
        res.status(500).json({ error: "Failed to update policy." });
    }
});


// We also need an endpoint to assign a policy to a department
// PATCH /api/departments/:id/assign-policy
router.patch("/departments/:id/assign-policy", authenticate, authorize("HR"), async (req, res) => {
    try {
        const { id } = req.params;
        const { policyId } = req.body; // Expecting { policyId: 5 } or { policyId: null }

        const updatedDepartment = await prisma.department.update({
            where: { id: parseInt(id) },
            data: {
                payrollPolicyId: policyId // Can be a number or null to reset to default
            }
        });
        res.status(200).json(updatedDepartment);
    } catch (error) {
        console.error("Error assigning policy to department:", error);
        res.status(500).json({ error: "Failed to assign policy." });
    }
});

module.exports = router;