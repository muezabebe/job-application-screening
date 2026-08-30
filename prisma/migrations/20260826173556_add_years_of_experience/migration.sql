/*
  Warnings:

  - You are about to drop the `candidates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "yearsOfExperience" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "candidates";

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "professionalTitle" TEXT NOT NULL,
    "yearsOfExperience" INTEGER NOT NULL DEFAULT 0,
    "bioSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
