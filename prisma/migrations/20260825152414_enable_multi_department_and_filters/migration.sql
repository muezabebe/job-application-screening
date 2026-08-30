/*
  Warnings:

  - You are about to drop the column `department` on the `JobPosting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobPosting" DROP COLUMN "department",
ADD COLUMN     "departments" TEXT[];
