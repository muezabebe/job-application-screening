
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface CandidateDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CandidateDetailsPage({
  params,
}: CandidateDetailsPageProps) {
  const { id } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: {
      id,
    },
    include: {
      applications: {
        include: {
          job: {
            select: {
              id: true,
              title: true,
              deadline: true,
            },
          },
          scoreResult: true,
          testAssignments: {
            include: {
              test: {
                select: {
                  id: true,
                  title: true,
                  duration: true,
                  status: true,
                },
              },
            },
            orderBy: {
              assignedAt: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!candidate) {
    notFound();
  }

  const totalApplications = candidate.applications.length;

  const shortlistedApplications = candidate.applications.filter(
    (application) => application.status === "SHORTLISTED"
  ).length;

  const hiredApplications = candidate.applications.filter(
    (application) => application.status === "HIRED"
  ).length;

  const totalTests = candidate.applications.reduce(
    (total, application) =>
      total + application.testAssignments.length,
    0
  );

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "HIRED":
        return "bg-green-50 text-green-700";

      case "SHORTLISTED":
        return "bg-blue-50 text-blue-700";

      case "REJECTED":
        return "bg-red-50 text-red-700";

      case "UNDER_REVIEW":
      case "SCREENED":
      case "INTERVIEWING":
        return "bg-yellow-50 text-yellow-700";

      default:
        return "bg-zinc-100 text-zinc-700";
    }
  }

  return (
    <div className="space-y-6">

      {/* Back Navigation */}
      <Link
        href="/admin/candidates"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        ← Back to Candidates
      </Link>

      {/* Candidate Header */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {candidate.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900">
              {candidate.fullName}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              {candidate.professionalTitle}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              {candidate.email}
            </p>
          </div>

          <div>
            <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-medium text-green-700">
              Registered Candidate
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">
            Total Applications
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {totalApplications}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">
            Shortlisted
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {shortlistedApplications}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">
            Hired
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {hiredApplications}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">
            Assigned Tests
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {totalTests}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-zinc-900">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Full Name" value={candidate.fullName} />
          <InfoItem label="Email Address" value={candidate.email} />
          <InfoItem label="Phone Number" value={candidate.phone} />
          <InfoItem label="Location" value={candidate.location} />
          <InfoItem label="Department" value={candidate.department} />
          <InfoItem
            label="Professional Title"
            value={candidate.professionalTitle}
          />
          <InfoItem
            label="Years of Experience"
            value={`${candidate.yearsOfExperience} years`}
          />
          <InfoItem
            label="Registered On"
            value={formatDate(candidate.createdAt)}
          />
        </div>

        <div className="mt-6 border-t border-zinc-100 pt-5">
          <h3 className="mb-2 text-sm font-semibold text-zinc-700">
            Professional Summary
          </h3>

          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-600">
            {candidate.bioSummary || "No professional summary provided."}
          </p>
        </div>
      </section>

      {/* Applications */}
      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-zinc-900">
            Application History
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            All jobs this candidate has applied for.
          </p>
        </div>

        {candidate.applications.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-500">
            This candidate has not submitted any applications.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {candidate.applications.map((application) => (
              <div key={application.id} className="space-y-4 p-6">

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-semibold text-zinc-900">
                      {application.job.title}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                      Applied on {formatDate(application.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      application.status
                    )}`}
                  >
                    {application.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoItem
                    label="Experience"
                    value={`${application.yearsOfExperience} years`}
                  />

                  <InfoItem
                    label="Matched Skills"
                    value={`${application.extractedSkills.length} skills extracted`}
                  />

                  <InfoItem
                    label="Match Rating"
                    value={
                      application.scoreResult?.matchRating || "Not scored"
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-4">
                  <Link
                    href={`/admin/applications/${application.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Application →
                  </Link>

                  <a
                    href={application.documentsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                  >
                    View Documents ↗
                  </a>
                </div>

                {/* Competency Tests */}
                {application.testAssignments.length > 0 && (
                  <div className="rounded-lg bg-zinc-50 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-zinc-800">
                      Competency Test History
                    </h4>

                    <div className="space-y-3">
                      {application.testAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="text-sm font-medium text-zinc-800">
                              {assignment.test.title}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {assignment.test.duration} minutes
                              {" · "}
                              Assigned {formatDate(assignment.assignedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {assignment.score !== null && (
                              <span className="text-sm font-semibold text-zinc-700">
                                Score: {assignment.score}
                              </span>
                            )}

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                              {assignment.status.replaceAll("_", " ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Reusable information display
function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-zinc-800">
        {value}
      </p>
    </div>
  );
}
