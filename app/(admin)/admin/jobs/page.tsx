// app/(admin)/admin/jobs/page.tsx
import prisma from "@/lib/prisma"
import Link from "next/link"
import JobManagementTable from "./JobManagementTable" // Make sure this path matches your Client Component location

export const revalidate = 0 // Disable static caching so updates show instantly

export default async function AdminJobsPage() {
  // Fetch ALL jobs for the admin so they can manage hidden/expired ones
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Job Postings Management
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Create, edit, delete, and control public visibility for active job listings.
          </p>
        </div>
        <Link
          href="/admin/jobs/create_job"
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <span>➕</span> Post New Job
        </Link>
      </div>

      {/* Main Table or Empty Fallback */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center space-y-4 shadow-sm">
          <div className="text-3xl">💼</div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900">No Job Postings Found</h3>
            <p className="text-xs text-zinc-500">
              You haven't posted any jobs yet. Get started by creating your first listing.
            </p>
          </div>
          <Link
            href="/admin/jobs/create_job"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Create Job Listing
          </Link>
        </div>
      ) : (
        <JobManagementTable initialJobs={jobs} />
      )}
    </div>
  )
}