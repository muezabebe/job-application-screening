/*
  Warnings:

  - You are about to drop the column `certificatesUrl` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the `Candidate` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `documentsUrl` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "certificatesUrl",
DROP COLUMN "resumeUrl",
ADD COLUMN     "documentsUrl" TEXT NOT NULL;

-- DropTable
DROP TABLE "Candidate";

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "department" TEXT,
    "professionalTitle" TEXT NOT NULL,
    "bioSummary" TEXT,
    "expectedSalary" INTEGER,
    "workPreference" TEXT,
    "noticePeriodDays" INTEGER,
    "visaRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
