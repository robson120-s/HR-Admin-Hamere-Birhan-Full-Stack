const express =require('express')
const app =express()
const cors = require('cors')
const path = require('path');
const hrRoutes = require('./app/routes/hr.routes');
const depHeadRoutes = require('./app/routes/depHead.routes');

const corsOptions = {
  origin: ['http://localhost:3000', 'https://hamere-birhanhr-administrator.vercel.app'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
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


//Uploading
const uploadRoutes = require('./app/routes/upload.routes');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/upload", uploadRoutes);


const internRoutes = require('./app/routes/intern.routes');
//salary routes
const salaryRoutes= require('./app/routes/salary.routes');
app.use("/api/salary", salaryRoutes);
//policy routes
const policyRoutes= require('./app/routes/policy.routes');
app.use("/api/policies", policyRoutes);
//Department head routes
app.use("/api/dep-head", depHeadRoutes);
//staff routes
app.use("/api/staff", staffRoutes);
//intern routes
app.use("/api/intern", internRoutes);


module.exports = app;