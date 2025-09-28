# 🔌 API Endpoints Documentation

<div align="center">

*Complete REST API reference for HR-Admin-Hamere-Birhan*

</div>

## 📋 Base Information

- **Base URL**: `http://localhost:8000/api`
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token

## 🔐 Authentication Endpoints

### **User Login**
```http
POST /api/auth/login
Request Body:

json
{
  "email": "admin@company.com",
  "password": "password123"
}
Response:

json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@company.com",
      "role": "admin"
    }
  }
}
👥 Employee Management
Get All Employees
http
GET /api/employees
Headers:

http
Authorization: Bearer <your_jwt_token>
Query Parameters:

Parameter	Type	Description
page	number	Page number
limit	number	Items per page
search	string	Search by name
department	number	Filter by department
Response:

json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": 1,
        "firstName": "የስም",
        "lastName": "የተለቀስም",
        "baptismalName": "የ በጌሳዊ ስም",
        "phone": "+251911234567",
        "department": { "name": "Engineering" },
        "position": { "name": "Developer" },
        "salary": 15000.00,
        "employmentDate": "2024-01-15"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
Create Employee
http
POST /api/employees
Request Body:

json
{
  "firstName": "የስም",
  "lastName": "የተለቀስም",
  "baptismalName": "የ በጌሳዊ ስም",
  "sex": "male",
  "dateOfBirth": "1990-01-01",
  "departmentId": 1,
  "positionId": 1,
  "employmentDate": "2024-01-15",
  "salary": 15000.00,
  "phone": "+251911234567",
  "address": "Addis Ababa, Ethiopia"
}
📊 Attendance Management
Clock In
http
POST /api/attendance/clock-in
Request Body:

json
{
  "employeeId": 1,
  "sessionId": 1,
  "actualClockIn": "2024-01-20T08:00:00.000Z"
}
Clock Out
http
POST /api/attendance/clock-out
Request Body:

json
{
  "employeeId": 1,
  "sessionId": 1, 
  "actualClockOut": "2024-01-20T17:00:00.000Z"
}
Get Attendance Summary
http
GET /api/attendance/summary?employeeId=1&month=1&year=2024
📅 Leave Management
Request Leave
http
POST /api/leaves
Request Body:

json
{
  "employeeId": 1,
  "leaveType": "annual",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "reason": "Annual vacation"
}
Approve/Reject Leave
http
PATCH /api/leaves/:id/status
Request Body:

json
{
  "status": "approved",
  "approvedBy": 1
}
💰 Payroll Endpoints
Generate Payroll
http
POST /api/payroll/generate
Request Body:

json
{
  "month": 1,
  "year": 2024,
  "departmentId": 1
}
Get Employee Salary History
http
GET /api/employees/:id/salaries
🏢 Department Management
Get All Departments
http
GET /api/departments
Response:

json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Engineering",
      "description": "Software development team",
      "parentId": null,
      "employeeCount": 15
    }
  ]
}
⏰ Shift Management
Assign Shift to Employee
http
POST /api/employee-shifts
Request Body:

json
{
  "employeeId": 1,
  "shiftId": 1,
  "effectiveFrom": "2024-01-20",
  "effectiveTo": "2024-12-31"
}
⚠️ Error Responses
400 Bad Request
json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
401 Unauthorized
json
{
  "success": false, 
  "error": "Authentication required"
}
404 Not Found
json
{
  "success": false,
  "error": "Employee not found"
}
500 Internal Server Error
json
{
  "success": false,
  "error": "Internal server error"
}
🔄 Webhook Endpoints
Attendance Webhook
http
POST /api/webhooks/attendance
For integrating with biometric devices.

<div align="center">
📖 Continue exploring: Database Schema

</div> ```