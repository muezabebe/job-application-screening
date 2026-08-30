/*
  Warnings:

  - You are about to drop the column `resumeUrl` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the `candidates` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `resume` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "resumeUrl",
ADD COLUMN     "certificatesUrl" TEXT,
ADD COLUMN     "resume" TEXT NOT NULL;

-- DropTable
DROP TABLE "candidates";

-- CreateTable
CREATE TABLE "Candidate" (
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

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
