-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_subDepartmentId_fkey` FOREIGN KEY (`subDepartmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
