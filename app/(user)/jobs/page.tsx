// app/jobs/page.tsx
import prisma from "@/lib/prisma"
import Link from "next/link"

export const revalidate = 0 // Disable static caching so status changes reflect immediately

export default async function UserJobsPage() {
  const now = new Date()

  // Filter out manually hidden jobs AND jobs past their deadline
  const jobs = await prisma.jobPosting.findMany({
    where: {
      isHidden: false,
      OR: [
        { deadline: null },
        { deadline: { gte: now } }
      ]
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Open Careers</h1>
      <div className="grid gap-4">
        {jobs.map((job) => {
          const formattedDeadline = job.deadline
            ? new Date(job.deadline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
              })
            : null

          return (
            <div key={job.id} className="border p-4 rounded-lg flex justify-between items-center shadow-sm hover:border-zinc-300 transition-colors">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-zinc-900">{job.title}</h2>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <span>Exp: {job.minYearsExp}+ years</span>
                  {formattedDeadline && (
                    <>
                      <span>•</span>
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium border border-amber-200">
                        Deadline: {formattedDeadline}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Link 
                href={`/jobs/${job.id}`} 
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-500 transition-colors shrink-0"
              >
                Apply Now
              </Link>
            </div>
          )
        })}
        {jobs.length === 0 && (
          <p className="text-zinc-500 text-center py-8">No open jobs available at this time.</p>
        )}
      </div>
    </div>
  )
}