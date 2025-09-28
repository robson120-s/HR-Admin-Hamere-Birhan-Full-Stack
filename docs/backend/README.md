# 🛠️ Backend Overview

<div align="center">

*Robust Node.js backend with Express.js and MySQL for HR management*

</div>

## 🏗️ Architecture Overview

The backend follows a **Model-View-Controller (MVC)** pattern with Prisma ORM for database operations.

## 📁 Project Structure
└── 📁HR_backend
        └── 📁app
            └── 📁controllers
                ├── attendanceSummary.controller.js
                ├── auth.controller.js
                ├── hr.controller.js
                ├── user.controller.js
            └── 📁jobs
                ├── attendanceProcessor.js
            └── 📁middlewares
                ├── authMiddleware.js
                ├── role.middlewares.js
            └── 📁routes
                ├── attendance.routes.js
                ├── attendanceSummary.routes.js
                ├── auth.routes.js
                ├── depHead.routes.js
                ├── hr.routes.js
                ├── intern.routes.js
                ├── login.routes.js
                ├── policy.routes.js
                ├── salary.routes.js
                ├── staff.routes.js
                ├── upload.routes.js
                ├── user.routes.js
            └── 📁utils
                ├── attendanceProcessor.js
        └── 📁prisma
            └── 📁migrations
                └── 📁20250916181013_baseline_db_init
                    ├── migration.sql
                ├── 20250916180844_baseline_db_init.sql
            ├── schema.prisma
        ├── .gitignore
        ├── app.js
        ├── backup.sql
        ├── holiday.sql
        ├── hrms_mysql_schema.sql
        ├── package-lock.json
        ├── package.json
        ├── README.md
        ├── seed.js
        ├── server.js
        ├── test.http


## 🔌 Core Features

### **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (RBAC)
- User permission management

### **Database Operations**
- Prisma ORM for type-safe queries
- MySQL database with relations
- Efficient query optimization

### **API Structure**
```javascript
// Example route structure
router.get('/employees', authMiddleware, employeeController.getAll);
router.post('/employees', authMiddleware, employeeController.create);
router.put('/employees/:id', authMiddleware, employeeController.update);
🛡️ Security Features
Password Hashing with bcrypt

JWT Token authentication

Input Validation with express-validator

CORS configuration

SQL Injection Protection via Prisma

📊 Key Modules
Employee Management - Complete employee lifecycle

Attendance System - Session-based tracking

Payroll Processing - Salary and overtime calculations

Leave Management - Approval workflows

Department Management - Organizational structure

Reporting - Analytics and insights

<div align="center">
Explore the API Endpoints and Database Schema

</div> ```