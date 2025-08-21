-- AlterTable
ALTER TABLE `termination` ADD COLUMN `workflowStatus` ENUM('pending_approval', 'processing', 'finalized') NOT NULL DEFAULT 'pending_approval';
