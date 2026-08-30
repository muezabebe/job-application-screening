/*
  Warnings:

  - The values [PARSING] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SCREENED', 'SHORTLISTED', 'INTERVIEWING', 'HIRED', 'REJECTED');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "bioSummary" TEXT,
ADD COLUMN     "expectedSalary" INTEGER,
ADD COLUMN     "noticePeriodDays" INTEGER,
ADD COLUMN     "professionalTitle" TEXT,
ADD COLUMN     "visaRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workPreference" TEXT;
