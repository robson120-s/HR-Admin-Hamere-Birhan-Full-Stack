const express =require('express')
const app =express()
const cors = require('cors')
const hrRoutes = require('./app/routes/hr.routes');
const depHeadRoutes = require('./app/routes/depHead.routes');




const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests only from your Next.js app
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true, // This is required for cookies
  allowedHeaders: ['Content-Type', 'Authorization'], 
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

// Also increase the limit for URL-encoded payloads, which is good practice.
app.use(express.urlencoded({ limit: '50mb', extended: true }));


//Attendance log routes (for the Department Head)
const attendanceLogRoutes = require('./app/routes/attendance.routes')
// Attendance summary routes(For the HR admin)
const attendanceSummaryRoutes = require('./app/routes/attendanceSummary.routes');
//

// Authentication routes (login)
const authRoutes = require('./app/routes/auth.routes');
app.use("/api/auth", authRoutes);
// Staff routes (for employee dashboard)
const staffRoutes = require('./app/routes/staff.routes');


app.use("/api/attendance-logs", attendanceLogRoutes);
app.use("/api/attendance-summaries", attendanceSummaryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hr", hrRoutes);
//salary routes
const salaryRoutes= require('./app/routes/salary.routes');
app.use("/api/salary", salaryRoutes);
//policy routes
const policyRoutes= require('./app/routes/policy.routes');
app.use("/api/policies", policyRoutes);
//Department head routes
app.use("/api/dep-head", depHeadRoutes);
app.use("/api/staff", staffRoutes);


module.exports = app;