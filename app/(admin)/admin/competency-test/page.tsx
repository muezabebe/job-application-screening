import prisma from "@/lib/prisma";
import { CompetencyTestList } from "./_components/CompetencyTestList";

export default async function CompetencyTestsPage() {
  // Fetch all competency tests
  const tests = await prisma.competencyTest.findMany({
    include: {
      _count: {
        select: {
          questions: true,
          assignments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch available job postings
  const jobs = await prisma.jobPosting.findMany({
    where: {
      isHidden: false,
    },
    select: {
      id: true,
      title: true,
      departments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-xl font-bold text-zinc-900">
          Competency Test Management
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Create and manage online competency tests for applicants.
        </p>
      </div>

      <CompetencyTestList tests={tests} jobs={jobs} />
    </div>
  );
}