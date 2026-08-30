import prisma from "@/lib/prisma"
import { ApplicationsTable } from "./_components/ApplicationsTable"

export default async function AdminApplicationsPage() {
  const applications = await prisma.application.findMany({
    include: {
      job: true,
      candidate: true,
      scoreResult: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Candidate Applications</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            View submitted applications, candidate details, and scanned documents.
          </p>
        </div>
      </div>

      <ApplicationsTable applications={applications} />
    </div>
  )
}