/*
  Warnings:

  - You are about to drop the `ActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgreementStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttendanceLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttendanceSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Complaint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeShift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmploymentType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Holiday` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Interview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Leave` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaritalStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OvertimeLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayrollPolicy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PerformanceReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Position` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Salary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SessionDefinition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Termination` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ActivityLog` DROP FOREIGN KEY `ActivityLog_actorId_fkey`;

-- DropForeignKey
ALTER TABLE `ActivityLog` DROP FOREIGN KEY `ActivityLog_targetId_fkey`;

-- DropForeignKey
ALTER TABLE `AttendanceLog` DROP FOREIGN KEY `AttendanceLog_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `AttendanceLog` DROP FOREIGN KEY `AttendanceLog_sessionId_fkey`;

-- DropForeignKey
ALTER TABLE `AttendanceSummary` DROP FOREIGN KEY `AttendanceSummary_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `AttendanceSummary` DROP FOREIGN KEY `AttendanceSummary_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Complaint` DROP FOREIGN KEY `Complaint_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Department` DROP FOREIGN KEY `Department_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `Department` DROP FOREIGN KEY `Department_payrollPolicyId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_agreementStatusId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_employmentTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_jobStatusId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_maritalStatusId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_positionId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_subDepartmentId_fkey`;

-- DropForeignKey
ALTER TABLE `Employee` DROP FOREIGN KEY `Employee_userId_fkey`;

-- DropForeignKey
ALTER TABLE `EmployeeShift` DROP FOREIGN KEY `EmployeeShift_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `EmployeeShift` DROP FOREIGN KEY `EmployeeShift_shiftId_fkey`;

-- DropForeignKey
ALTER TABLE `Leave` DROP FOREIGN KEY `Leave_approvedBy_fkey`;

-- DropForeignKey
ALTER TABLE `Leave` DROP FOREIGN KEY `Leave_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Meeting` DROP FOREIGN KEY `Meeting_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `OvertimeLog` DROP FOREIGN KEY `OvertimeLog_approvedBy_fkey`;

-- DropForeignKey
ALTER TABLE `OvertimeLog` DROP FOREIGN KEY `OvertimeLog_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `PerformanceReview` DROP FOREIGN KEY `PerformanceReview_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Salary` DROP FOREIGN KEY `Salary_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Termination` DROP FOREIGN KEY `Termination_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `UserRole` DROP FOREIGN KEY `UserRole_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `UserRole` DROP FOREIGN KEY `UserRole_userId_fkey`;

-- DropTable
DROP TABLE `ActivityLog`;

-- DropTable
DROP TABLE `AgreementStatus`;

-- DropTable
DROP TABLE `AttendanceLog`;

-- DropTable
DROP TABLE `AttendanceSummary`;

-- DropTable
DROP TABLE `Complaint`;

-- DropTable
DROP TABLE `Department`;

-- DropTable
DROP TABLE `Employee`;

-- DropTable
DROP TABLE `EmployeeShift`;

-- DropTable
DROP TABLE `EmploymentType`;

-- DropTable
DROP TABLE `Holiday`;

-- DropTable
DROP TABLE `Interview`;

-- DropTable
DROP TABLE `JobStatus`;

-- DropTable
DROP TABLE `Leave`;

-- DropTable
DROP TABLE `MaritalStatus`;

-- DropTable
DROP TABLE `Meeting`;

-- DropTable
DROP TABLE `OvertimeLog`;

-- DropTable
DROP TABLE `PayrollPolicy`;

-- DropTable
DROP TABLE `PerformanceReview`;

-- DropTable
DROP TABLE `Position`;

-- DropTable
DROP TABLE `Role`;

-- DropTable
DROP TABLE `Salary`;

-- DropTable
DROP TABLE `SessionDefinition`;

-- DropTable
DROP TABLE `Shift`;

-- DropTable
DROP TABLE `Termination`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `UserRole`;

-- CreateTable
CREATE TABLE `activitylog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ATTENDANCE_MARKED', 'REVIEW_SUBMITTED', 'OVERTIME_REQUESTED', 'LEAVE_REQUESTED', 'COMPLAINT_SUBMITTED', 'LEAVE_ACTIONED', 'OVERTIME_ACTIONED') NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `actorId` INTEGER NOT NULL,
    `targetId` INTEGER NULL,
    `departmentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_actorId_fkey`(`actorId`),
    INDEX `ActivityLog_departmentId_createdAt_idx`(`departmentId`, `createdAt`),
    INDEX `ActivityLog_targetId_fkey`(`targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agreementstatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AgreementStatus_status_key`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendancelog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `sessionId` INTEGER NOT NULL,
    `actualClockIn` DATETIME(3) NULL,
    `actualClockOut` DATETIME(3) NULL,
    `status` ENUM('present', 'late', 'absent', 'permission') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AttendanceLog_sessionId_fkey`(`sessionId`),
    UNIQUE INDEX `AttendanceLog_employeeId_date_sessionId_key`(`employeeId`, `date`, `sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendancesummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `status` ENUM('present', 'absent', 'half_day', 'on_leave', 'permission', 'holiday', 'weekend') NOT NULL,
    `lateArrival` BOOLEAN NOT NULL DEFAULT false,
    `earlyDeparture` BOOLEAN NOT NULL DEFAULT false,
    `unplannedAbsence` BOOLEAN NOT NULL DEFAULT false,
    `totalWorkHours` DECIMAL(65, 30) NULL,
    `remarks` VARCHAR(191) NULL,
    `departmentId` INTEGER NULL,

    INDEX `AttendanceSummary_departmentId_fkey`(`departmentId`),
    UNIQUE INDEX `AttendanceSummary_employeeId_date_key`(`employeeId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('open', 'in_review', 'resolved', 'rejected') NOT NULL DEFAULT 'open',
    `response` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Complaint_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `parentId` INTEGER NULL,
    `payrollPolicyId` INTEGER NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    INDEX `Department_parentId_fkey`(`parentId`),
    INDEX `Department_payrollPolicyId_fkey`(`payrollPolicyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `baptismalName` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `sex` ENUM('male', 'female') NOT NULL,
    `nationality` VARCHAR(191) NULL,
    `maritalStatusId` INTEGER NULL,
    `departmentId` INTEGER NULL,
    `positionId` INTEGER NULL,
    `employmentTypeId` INTEGER NULL,
    `employmentDate` DATETIME(3) NULL,
    `jobStatusId` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `subCity` VARCHAR(191) NULL,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactPhone` VARCHAR(191) NULL,
    `repentanceFatherName` VARCHAR(191) NULL,
    `repentanceFatherChurch` VARCHAR(191) NULL,
    `repentanceFatherPhone` VARCHAR(191) NULL,
    `academicQualification` VARCHAR(191) NULL,
    `educationalInstitution` VARCHAR(191) NULL,
    `salary` DECIMAL(65, 30) NOT NULL DEFAULT 0.0,
    `bonusSalary` DECIMAL(65, 30) NOT NULL DEFAULT 0.0,
    `accountNumber` VARCHAR(191) NULL,
    `agreementStatusId` INTEGER NULL,
    `photo` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `subDepartmentId` INTEGER NULL,

    UNIQUE INDEX `Employee_userId_key`(`userId`),
    INDEX `Employee_agreementStatusId_fkey`(`agreementStatusId`),
    INDEX `Employee_departmentId_fkey`(`departmentId`),
    INDEX `Employee_employmentTypeId_fkey`(`employmentTypeId`),
    INDEX `Employee_jobStatusId_fkey`(`jobStatusId`),
    INDEX `Employee_maritalStatusId_fkey`(`maritalStatusId`),
    INDEX `Employee_positionId_fkey`(`positionId`),
    INDEX `Employee_subDepartmentId_fkey`(`subDepartmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employeeshift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `shiftId` INTEGER NOT NULL,
    `effectiveFrom` DATETIME(3) NOT NULL,
    `effectiveTo` DATETIME(3) NULL,

    INDEX `EmployeeShift_employeeId_fkey`(`employeeId`),
    INDEX `EmployeeShift_shiftId_fkey`(`shiftId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employmenttype` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EmploymentType_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holiday` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `Holiday_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateName` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NULL,
    `interviewDate` DATETIME(3) NULL,
    `result` ENUM('pending', 'selected', 'rejected') NOT NULL DEFAULT 'pending',
    `comments` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobstatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `JobStatus_status_key`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `leaveType` ENUM('annual', 'sick', 'unpaid', 'maternity', 'other') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `reason` VARCHAR(191) NULL,
    `approvedBy` INTEGER NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Leave_approvedBy_fkey`(`approvedBy`),
    INDEX `Leave_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maritalstatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MaritalStatus_status_key`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Meeting_creatorId_fkey`(`creatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overtimelog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `hours` DECIMAL(65, 30) NULL,
    `reason` VARCHAR(191) NULL,
    `approvedBy` INTEGER NULL,
    `approvalStatus` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `compensationMethod` ENUM('cash', 'time_off') NOT NULL DEFAULT 'cash',
    `endTime` DATETIME(3) NULL,
    `startTime` DATETIME(3) NULL,
    `overtimeType` ENUM('WEEKDAY', 'SUNDAY', 'HOLIDAY') NOT NULL DEFAULT 'WEEKDAY',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OvertimeLog_approvedBy_fkey`(`approvedBy`),
    INDEX `OvertimeLog_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payrollpolicy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `otMultiplierWeekday1` DECIMAL(65, 30) NOT NULL DEFAULT 1.500000000000000000000000000000,
    `otMultiplierWeekday2` DECIMAL(65, 30) NOT NULL DEFAULT 1.750000000000000000000000000000,
    `otMultiplierSunday` DECIMAL(65, 30) NOT NULL DEFAULT 2.000000000000000000000000000000,
    `otMultiplierHoliday` DECIMAL(65, 30) NOT NULL DEFAULT 2.500000000000000000000000000000,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `otMultiplierSleepover` DECIMAL(65, 30) NOT NULL DEFAULT 2.200000000000000000000000000000,

    UNIQUE INDEX `PayrollPolicy_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `performancereview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `reviewDate` DATETIME(3) NOT NULL,
    `reviewerName` VARCHAR(191) NULL,
    `score` INTEGER NULL,
    `comments` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PerformanceReview_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Position_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `salaryMonth` DATETIME(3) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('paid', 'unpaid', 'pending') NOT NULL DEFAULT 'pending',
    `overtimeHours` DECIMAL(65, 30) NOT NULL DEFAULT 0.000000000000000000000000000000,
    `overtimePay` DECIMAL(65, 30) NOT NULL DEFAULT 0.000000000000000000000000000000,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `baseSalary` DECIMAL(65, 30) NOT NULL DEFAULT 0.000000000000000000000000000000,
    `deductions` DECIMAL(65, 30) NOT NULL DEFAULT 0.000000000000000000000000000000,

    UNIQUE INDEX `Salary_employeeId_salaryMonth_key`(`employeeId`, `salaryMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessiondefinition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionNumber` INTEGER NOT NULL,
    `expectedClockIn` DATETIME(3) NOT NULL,
    `expectedClockOut` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SessionDefinition_sessionNumber_key`(`sessionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `isFlexible` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `termination` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `terminationDate` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `status` ENUM('voluntary', 'involuntary', 'retired') NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workflowStatus` ENUM('pending_approval', 'processing', 'finalized') NOT NULL DEFAULT 'pending_approval',

    INDEX `Termination_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `notifyOnComplaint` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userrole` (
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,

    INDEX `UserRole_roleId_fkey`(`roleId`),
    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activitylog` ADD CONSTRAINT `ActivityLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `employee`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activitylog` ADD CONSTRAINT `ActivityLog_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendancelog` ADD CONSTRAINT `AttendanceLog_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendancelog` ADD CONSTRAINT `AttendanceLog_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `sessiondefinition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendancesummary` ADD CONSTRAINT `AttendanceSummary_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendancesummary` ADD CONSTRAINT `AttendanceSummary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaint` ADD CONSTRAINT `Complaint_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `department` ADD CONSTRAINT `Department_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `department` ADD CONSTRAINT `Department_payrollPolicyId_fkey` FOREIGN KEY (`payrollPolicyId`) REFERENCES `payrollpolicy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_agreementStatusId_fkey` FOREIGN KEY (`agreementStatusId`) REFERENCES `agreementstatus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_employmentTypeId_fkey` FOREIGN KEY (`employmentTypeId`) REFERENCES `employmenttype`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_jobStatusId_fkey` FOREIGN KEY (`jobStatusId`) REFERENCES `jobstatus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_maritalStatusId_fkey` FOREIGN KEY (`maritalStatusId`) REFERENCES `maritalstatus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_subDepartmentId_fkey` FOREIGN KEY (`subDepartmentId`) REFERENCES `department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `Employee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeeshift` ADD CONSTRAINT `EmployeeShift_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employeeshift` ADD CONSTRAINT `EmployeeShift_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `shift`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave` ADD CONSTRAINT `Leave_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave` ADD CONSTRAINT `Leave_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting` ADD CONSTRAINT `Meeting_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overtimelog` ADD CONSTRAINT `OvertimeLog_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overtimelog` ADD CONSTRAINT `OvertimeLog_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `performancereview` ADD CONSTRAINT `PerformanceReview_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salary` ADD CONSTRAINT `Salary_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `termination` ADD CONSTRAINT `Termination_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userrole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userrole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
