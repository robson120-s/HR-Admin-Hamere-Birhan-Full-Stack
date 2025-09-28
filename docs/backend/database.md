# 🗃️ Database Schema Documentation

<div align="center">

*Complete MySQL database structure with Prisma ORM*

</div>

## 📊 Database Overview

- **Database System**: MySQL 8.0+
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate
- **Relations**: Foreign keys and indexes

## 🏗️ Complete Entity Relationship Diagram

```mermaid
erDiagram
    user ||--o| employee : "has profile"
    employee ||--o{ attendancelog : "attendance records"
    employee ||--o{ leave : "leave requests"
    employee ||--o{ overtimelog : "overtime records"
    employee ||--o{ salary : "salary records"
    employee ||--o{ performancereview : "reviews"
    employee ||--o{ complaint : "complaints"
    employee ||--o{ termination : "termination records"
    department ||--o{ employee : "employs"
    position ||--o{ employee : "positions"
    shift ||--o{ employeeshift : "shift assignments"
    role ||--o{ userrole : "role assignments"
    📋 Core Models Documentation
Employee Model
Central model storing all employee information with Ethiopian context.

prisma
model employee {
  id                      Int      @id @default(autoincrement())
  // Personal Information
  firstName               String
  lastName                String
  baptismalName           String?   // Ethiopian context
  dateOfBirth             DateTime?
  sex                     employee_sex
  nationality             String?
  
  // Employment Details
  departmentId            Int?
  positionId              Int?
  employmentTypeId        Int?
  employmentDate          DateTime?
  jobStatusId             Int?
  
  // Contact Information
  phone                   String?
  address                 String?
  subCity                 String?   // Ethiopian address
  
  // Emergency Contact
  emergencyContactName    String?
  emergencyContactPhone   String?
  
  // Spiritual Information (Ethiopian context)
  repentanceFatherName    String?
  repentanceFatherChurch  String?
  repentanceFatherPhone   String?
  
  // Education
  academicQualification   String?
  educationalInstitution  String?
  
  // Financial
  salary                  Decimal   @default(0.0)
  bonusSalary             Decimal   @default(0.0)
  accountNumber           String?
  
  // Relations
  department              department? @relation("employee_departmentIdTodepartment")
  position                position?
  user                    user?
  attendancelog           attendancelog[]
  leave                   leave[]
  // ... other relations
}
Department Model
Organizational structure with hierarchy support.

prisma
model department {
  id               Int         @id @default(autoincrement())
  name             String      @unique
  description      String?
  parentId         Int?        // Hierarchical structure
  payrollPolicyId  Int?
  
  // Relations
  parent           department? @relation("departmentTodepartment")
  children         department[] @relation("departmentTodepartment")
  employees        employee[]
  payrollpolicy    payrollpolicy?
}
Attendance System Models
Attendance Log
Session-based attendance tracking.

prisma
model attendancelog {
  id              Int              @id @default(autoincrement())
  employeeId      Int
  date            DateTime
  sessionId       Int
  actualClockIn   DateTime?
  actualClockOut  DateTime?
  status          attendancelog_status
  
  // Relations
  employee        employee
  sessiondefinition sessiondefinition
}
Session Definition
Defines attendance sessions.

prisma
model sessiondefinition {
  id               Int    @id @default(autoincrement())
  sessionNumber    Int    @unique
  expectedClockIn  DateTime
  expectedClockOut DateTime
  attendancelog    attendancelog[]
}
Payroll System
Salary Records
prisma
model salary {
  id            Int           @id @default(autoincrement())
  employeeId    Int
  salaryMonth   DateTime
  amount        Decimal
  status        salary_status @default(pending)
  overtimeHours Decimal       @default(0)
  overtimePay   Decimal       @default(0)
  baseSalary    Decimal       @default(0)
  deductions    Decimal       @default(0)
  
  @@unique([employeeId, salaryMonth])
}
Payroll Policy
Overtime calculation rules.

prisma
model payrollpolicy {
  id                    Int      @id @default(autoincrement())
  name                  String   @unique
  isDefault             Boolean  @default(false)
  otMultiplierWeekday1  Decimal  @default(1.5)
  otMultiplierWeekday2  Decimal  @default(1.75)
  otMultiplierSunday    Decimal  @default(2.0)
  otMultiplierHoliday   Decimal  @default(2.5)
  otMultiplierSleepover Decimal  @default(2.2)
}
Leave Management
prisma
model leave {
  id          Int             @id @default(autoincrement())
  employeeId  Int
  leaveType   leave_leaveType // annual, sick, unpaid, maternity, other
  startDate   DateTime
  endDate     DateTime
  status      leave_status    @default(pending)
  reason      String?
  approvedBy  Int?
  
  employee    employee
  user        user?           // approver
}
User & Role Management
prisma
model user {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  isActive  Boolean  @default(true)
  
  employee  employee?
  userrole  userrole[]
}

model role {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  userrole    userrole[]
}

model userrole {
  userId Int
  roleId Int
  user   user @relation(fields: [userId], references: [id])
  role   role @relation(fields: [roleId], references: [id])
  
  @@id([userId, roleId])
}
🔑 Key Enumerations
Employee Status & Types
prisma
enum employee_sex { male female }

enum leave_leaveType { annual sick unpaid maternity other }

enum leave_status { pending approved rejected }

enum attendancelog_status { present late absent permission }

enum salary_status { paid unpaid pending }
Attendance & Overtime
prisma
enum attendancesummary_status {
  present absent half_day on_leave permission holiday weekend
}

enum overtimelog_approvalStatus { pending approved rejected }

enum overtimelog_compensationMethod { cash time_off }

enum overtimelog_overtimeType { WEEKDAY SUNDAY HOLIDAY }
📈 Database Indexes
The schema includes optimized indexes for performance:

Foreign key indexes on all relation fields

Composite indexes for frequent queries

Unique constraints where appropriate

🛠️ Migration Commands
bash
# Create new migration
npx prisma migrate dev --name add_feature

# Reset database (development)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# View data in Prisma Studio
npx prisma studio
🌱 Sample Data Structure
Employee Creation
javascript
{
  firstName: "ስም",
  lastName: "የተለቀ ስም", 
  baptismalName: "የሳዊ ስም",
  sex: "male",
  departmentId: 1,
  positionId: 1,
  employmentDate: "2024-01-15",
  salary: 15000.00
}
<div align="center">
💡 Use Prisma Studio for visual database management during development!

</div> ```