-- AddForeignKey
ALTER TABLE `AttendanceSummary` ADD CONSTRAINT `AttendanceSummary_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
