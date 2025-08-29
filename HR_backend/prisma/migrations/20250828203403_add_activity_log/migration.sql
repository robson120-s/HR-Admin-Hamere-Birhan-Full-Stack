-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('ATTENDANCE_MARKED', 'REVIEW_SUBMITTED', 'OVERTIME_REQUESTED', 'LEAVE_REQUESTED', 'COMPLAINT_SUBMITTED', 'LEAVE_ACTIONED', 'OVERTIME_ACTIONED') NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `actorId` INTEGER NOT NULL,
    `targetId` INTEGER NULL,
    `departmentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_departmentId_createdAt_idx`(`departmentId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
