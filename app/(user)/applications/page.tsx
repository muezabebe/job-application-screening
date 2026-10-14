import Link from "next/link";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function getStatusBadgeStyle(status: string) {
  switch (status.toUpperCase()) {
    case "SUBMITTED":
      return "bg-slate-100 text-slate-800 border-slate-300";
    case "UNDER_REVIEW":
      return "bg-indigo-50 text-indigo-800 border-indigo-200";
    case "SCREENED":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "SHORTLISTED":
      return "bg-cyan-100 text-cyan-800 border-cyan-300";
    case "CALL_FOR_INTERVIEW":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "INTERVIEWING":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "RESERVE_1":
      return "bg-amber-100 text-amber-900 border-amber-300";
    case "RESERVE_2":
      return "bg-orange-100 text-orange-900 border-orange-300";
    case "RESERVE_3":
      return "bg-zinc-200 text-zinc-800 border-zinc-300";
    case "ACCEPTED":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "HIRED":
      return "bg-emerald-500 text-white border-emerald-600";
    case "REJECTED":
      return "bg-rose-100 text-rose-800 border-rose-300";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-300";
  }
}

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const candidate = await prisma.candidate.findFirst({
    where: { email: session.user.email! },
    include: {
      applications: {
        include: { 
          job: true,
          scoreResult: true,
        },
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
          Explore Open Positions →
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
                Browse open Positions
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {candidate.applications.map((app) => (
            <div
              key={app.id}
              className="p-5 border border-zinc-200 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white hover:border-zinc-300 transition-all shadow-sm"
            >
              {/* Left Column: Job Details */}
              <div className="space-y-1 flex-1">
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

              {/* Right Column: Badges & Evaluated Scores */}
              <div className="flex flex-wrap items-center gap-4 shrink-0 sm:justify-start lg:justify-end">
                {/* Application Status Badge */}
                <span
                  className={`px-3 py-1 text-xs font-semibold border rounded-full uppercase tracking-wider ${getStatusBadgeStyle(
                    app.status
                  )}`}
                >
                  {app.status.replace("_", " ")}
                </span>

                {/* Score Micro-Dashboard */}
                <div className="flex items-center bg-zinc-50/50 border border-zinc-200/60 rounded-lg p-1.5 shrink-0 shadow-sm backdrop-blur-sm">
                  {/* Technical Score */}
                  <div className="flex flex-col px-3 py-0.5 border-r border-zinc-200/80 last:border-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Technical</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-mono text-sm font-bold text-zinc-800">
                        {app.scoreResult?.technicalScore ?? "—"}
                      </span>
                      {app.scoreResult?.technicalScore !== null && (
                        <span className="text-[10px] text-zinc-400">/100</span>
                      )}
                    </div>
                  </div>

                  {/* Behavioral Score */}
                  <div className="flex flex-col px-3 py-0.5 border-r border-zinc-200/80 last:border-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Behavioral</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-mono text-sm font-bold text-zinc-800">
                        {app.scoreResult?.behavioralScore ?? "—"}
                      </span>
                      {app.scoreResult?.behavioralScore !== null && (
                        <span className="text-[10px] text-zinc-400">/100</span>
                      )}
                    </div>
                  </div>

                  {/* Overall Automated AI Score */}
                  <div className="flex flex-col bg-indigo-50/70 border border-indigo-100 rounded-md px-3 py-0.5 shadow-sm">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Final Score</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-mono text-sm font-extrabold text-indigo-700">
                        {app.scoreResult && app.scoreResult.technicalScore !== null && app.scoreResult.behavioralScore !== null
                          ? Math.round((app.scoreResult.technicalScore + app.scoreResult.behavioralScore) / 2)
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
