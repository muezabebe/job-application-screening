/*
  Warnings:

  - Made the column `certificatesUrl` on table `Application` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "certificatesUrl" SET NOT NULL;
