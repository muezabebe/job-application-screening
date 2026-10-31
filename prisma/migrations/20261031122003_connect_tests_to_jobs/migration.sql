-- CreateTable
CREATE TABLE "_CompetencyTestToJobPosting" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompetencyTestToJobPosting_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CompetencyTestToJobPosting_B_index" ON "_CompetencyTestToJobPosting"("B");

-- AddForeignKey
ALTER TABLE "_CompetencyTestToJobPosting" ADD CONSTRAINT "_CompetencyTestToJobPosting_A_fkey" FOREIGN KEY ("A") REFERENCES "CompetencyTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetencyTestToJobPosting" ADD CONSTRAINT "_CompetencyTestToJobPosting_B_fkey" FOREIGN KEY ("B") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
