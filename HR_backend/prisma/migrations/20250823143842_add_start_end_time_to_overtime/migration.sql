/*
  Warnings:

  - The values [other] on the enum `Employee_sex` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `endTime` to the `OvertimeLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `OvertimeLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employee` MODIFY `sex` ENUM('male', 'female') NOT NULL;

-- AlterTable
ALTER TABLE `overtimelog` ADD COLUMN `endTime` DATETIME(3) NOT NULL,
    ADD COLUMN `startTime` DATETIME(3) NOT NULL,
    MODIFY `hours` DECIMAL(65, 30) NULL;
