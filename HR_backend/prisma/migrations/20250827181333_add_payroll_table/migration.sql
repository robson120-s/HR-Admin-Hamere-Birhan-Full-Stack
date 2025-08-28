-- AlterTable
ALTER TABLE `department` ADD COLUMN `payrollPolicyId` INTEGER NULL;

-- CreateTable
CREATE TABLE `PayrollPolicy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `otMultiplierWeekday1` DECIMAL(65, 30) NOT NULL DEFAULT 1.5,
    `otMultiplierWeekday2` DECIMAL(65, 30) NOT NULL DEFAULT 1.75,
    `otMultiplierSunday` DECIMAL(65, 30) NOT NULL DEFAULT 2.0,
    `otMultiplierHoliday` DECIMAL(65, 30) NOT NULL DEFAULT 2.5,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PayrollPolicy_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_payrollPolicyId_fkey` FOREIGN KEY (`payrollPolicyId`) REFERENCES `PayrollPolicy`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
