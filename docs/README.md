<!-- docs/README.md -->

# 🏢 HR Admin Panel - Complete Overview

<div align="center">

*A comprehensive Human Resources administration panel designed specifically for Ethiopian Hamere Birhan organizational needs*

</div>

## ✨ Key Features

| Feature | Description | Status |
|---------|-------------|---------|
| 👥 **Employee Management** | Complete employee records with Ethiopian context | ✅ **Implemented** |
| 📊 **Attendance Tracking** | Session-based attendance with clock in/out | ✅ **Implemented** |
| 💰 **Payroll Management** | Salary processing with overtime calculations | ✅ **Implemented** |
| 📅 **Leave Management** | Multiple leave types with approval workflow | ✅ **Implemented** |
| 🏢 **Department Hierarchy** | Multi-level department structure | ✅ **Implemented** |
| ⏰ **Shift Management** | Flexible shift scheduling | ✅ **Implemented** |
| 📝 **Performance Reviews** | Employee performance tracking | ✅ **Implemented** |

## 🛠️ Technology Stack

### **Frontend Technologies**
- **Framework**: React 18 with TypeScript
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Styling**: PostCSS

### **Backend Technologies**
- **Runtime**: Node.js with Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT-based
- **Validation**: Express validators

## 📊 Database Architecture

```mermaid
erDiagram
    User {
        int id PK
        string username
        string email
    }
    Employee {
        int id PK
        string firstName
        string lastName
    }
    Department {
        int id PK
        string name
    }
    Position {
        int id PK
        string name
    }
    AttendanceLog {
        int id PK
        int employeeId FK
    }

    User ||--o| Employee : "has profile"
    Employee ||--o{ AttendanceLog : "records"
    Employee ||--o{ Leave : "requests"
    Employee ||--o{ OvertimeLog : "records"
    Employee ||--o{ Salary : "records"
    Department ||--o{ Employee : "contains"
    Position ||--o{ Employee : "defines"
    Shift ||--o{ EmployeeShift : "assigned"

🎯 Core Modules
Employee Management: Complete employee lifecycle management

Attendance System: Session-based tracking with summaries

Payroll Processing: Automated salary calculations

Leave Management: Multi-type leave with approvals

Complaint System: Employee grievance handling

Performance Tracking: Regular performance reviews

Termination Workflow: Structured offboarding process

🚀 Quick Start
bash
# Clone the repository
git clone https://github.com/robson120-s/HR-Admin-Hamere-Birhan-Full-Stack.git

# Navigate to project directory
cd HR-Admin-Hamere-Birhan-Full-Stack

# Follow the detailed setup guide
<div align="center">
📞 Need Help?
Check out our Getting Started Guide for setup instructions.

⭐ Star us on GitHub if you find this project helpful!

</div> 