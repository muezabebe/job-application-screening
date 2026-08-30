/*
  Warnings:

  - You are about to drop the `Candidate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- DropTable
DROP TABLE "Candidate";

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "professionalTitle" TEXT,
    "bioSummary" TEXT,
    "expectedSalary" INTEGER,
    "workPreference" TEXT,
    "noticePeriodDays" INTEGER,
    "visaRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
