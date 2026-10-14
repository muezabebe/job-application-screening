/*
  Warnings:

  - You are about to drop the column `overallScore` on the `ScoreResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScoreResult" DROP COLUMN "overallScore",
ADD COLUMN     "behavioralScore" DOUBLE PRECISION,
ADD COLUMN     "technicalScore" DOUBLE PRECISION;
