/*
  Warnings:

  - You are about to drop the column `overallScore` on the `ScoreResult` table. All the data in the column will be lost.
  - You are about to drop the column `yearsExpFound` on the `ScoreResult` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY');

-- CreateEnum
CREATE TYPE "CompetencyTestStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TestAssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'RESERVE_1';
ALTER TYPE "ApplicationStatus" ADD VALUE 'RESERVE_2';
ALTER TYPE "ApplicationStatus" ADD VALUE 'RESERVE_3';

-- AlterTable
ALTER TABLE "ScoreResult" DROP COLUMN "overallScore",
DROP COLUMN "yearsExpFound",
ADD COLUMN     "behavioralScore" DOUBLE PRECISION,
ADD COLUMN     "technicalScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CompetencyTest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "status" "CompetencyTestStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestQuestion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAssignment" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "TestAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAnswer" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "responseText" TEXT,
    "pointsAwarded" DOUBLE PRECISION,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestQuestion_testId_order_key" ON "TestQuestion"("testId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TestAssignment_testId_applicationId_key" ON "TestAssignment"("testId", "applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "TestAnswer_assignmentId_questionId_key" ON "TestAnswer"("assignmentId", "questionId");

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "CompetencyTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestOption" ADD CONSTRAINT "TestOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAssignment" ADD CONSTRAINT "TestAssignment_testId_fkey" FOREIGN KEY ("testId") REFERENCES "CompetencyTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAssignment" ADD CONSTRAINT "TestAssignment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAnswer" ADD CONSTRAINT "TestAnswer_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TestAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAnswer" ADD CONSTRAINT "TestAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAnswer" ADD CONSTRAINT "TestAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "TestOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
