
import prisma from "@/lib/prisma";
import { ManualAssessmentTable } from "./_components/ManualAssessmentTable";

export default async function ManualAssessmentPage() {
  const applications = await prisma.application.findMany({
    include: {
      candidate: true,
      job: true,
      scoreResult: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold text-zinc-900">
          Manual Competency Assessment
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Evaluate candidates by entering their technical and behavioral scores.
        </p>
      </div>

      <ManualAssessmentTable applications={applications} />
    </div>
  );
}
