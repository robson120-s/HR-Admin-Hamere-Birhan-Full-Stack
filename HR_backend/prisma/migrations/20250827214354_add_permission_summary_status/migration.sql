-- AlterTable
ALTER TABLE `attendancesummary` MODIFY `status` ENUM('present', 'absent', 'half_day', 'on_leave', 'permission', 'holiday', 'weekend') NOT NULL;
