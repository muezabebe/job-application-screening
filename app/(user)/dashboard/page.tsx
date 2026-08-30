// app/(user)/dashboard/page.tsx
import Link from "next/link";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function getStatusBadgeStyle(status: string) {
  switch (status.toUpperCase()) {
    case "ACCEPTED":
    case "HIRED":
    case "SHORTLISTED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "REVIEWING":
    case "UNDER_REVIEW":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "SUBMITTED":
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch candidate profile and linked applications
  const candidate = await prisma.candidate.findFirst({
    where: { email: session.user.email! },
    include: {
      applications: {
        include: { job: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Candidate Dashboard</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Track and monitor your submitted job applications in real time.
          </p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          Explore Open Roles →
        </Link>
      </div>

      {/* Profile Overview Banner */}
      {candidate && (
        <div className="mb-8 p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-wrap gap-4 justify-between items-center text-xs text-zinc-600">
          <div>
            <span className="font-semibold text-zinc-900">{candidate.fullName}</span>
          </div>
          <div className="flex gap-4">
            <span>Title: <strong className="text-zinc-800">{candidate.professionalTitle}</strong></span>
            <span>Experience: <strong className="text-zinc-800">{candidate.yearsOfExperience} yrs</strong></span>
          </div>
        </div>
      )}

      {/* Applications List */}
      {!candidate?.applications.length ? (
        <div className="p-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <span className="text-3xl">📄</span>
            <h3 className="text-base font-semibold text-zinc-900">No applications submitted yet</h3>
            <p className="text-xs text-zinc-500">
              You haven't submitted any job applications. Browse through available career opportunities to apply.
            </p>
            <div className="pt-2">
              <Link
                href="/jobs"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4"
              >
                Browse open roles
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {candidate.applications.map((app) => (
            <div
              key={app.id}
              className="p-5 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:border-zinc-300 transition-all shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/jobs/${app.jobId}`}
                    className="font-bold text-base text-zinc-900 hover:text-blue-600 transition-colors"
                  >
                    {app.job.title}
                  </Link>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span>Applied on {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span>•</span>
                  <span>Submitted Exp: {app.yearsOfExperience} yrs</span>
                  {app.documentsUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={app.documentsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume/Docs
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-3 py-1 text-xs font-semibold border rounded-full uppercase tracking-wider ${getStatusBadgeStyle(
                    app.status
                  )}`}
                >
                  {app.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}