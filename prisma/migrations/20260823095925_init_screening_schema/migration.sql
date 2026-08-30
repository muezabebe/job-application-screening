-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'PARSING', 'SCREENED', 'SHORTLISTED', 'REJECTED', 'INTERVIEWING');

-- CreateEnum
CREATE TYPE "MatchRating" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNQUALIFIED');

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minYearsExp" INTEGER NOT NULL DEFAULT 0,
    "requiredSkills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "resumeUrl" TEXT NOT NULL,
    "parsedText" TEXT,
    "extractedSkills" TEXT[],
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreResult" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "matchRating" "MatchRating" NOT NULL,
    "yearsExpFound" INTEGER NOT NULL,
    "skillsMatched" TEXT[],
    "missingSkills" TEXT[],
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Application_jobId_status_idx" ON "Application"("jobId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreResult_applicationId_key" ON "ScoreResult"("applicationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreResult" ADD CONSTRAINT "ScoreResult_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
