
import prisma from "@/lib/prisma";
import Link from "next/link";

interface CandidatesPageProps {
  searchParams: Promise<{
    q?: string;
    department?: string;
  }>;
}

export default async function CandidatesPage({
  searchParams,
}: CandidatesPageProps) {
  const params = await searchParams;

  const search = params.q?.trim() || "";
  const department = params.department || "";

  const [candidates, departments, totalCandidates] = await Promise.all([
    prisma.candidate.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  {
                    fullName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {},
          department ? { department } : {},
        ],
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),

    prisma.candidate.findMany({
      select: {
        department: true,
      },
      distinct: ["department"],
      orderBy: {
        department: "asc",
      },
    }),

    prisma.candidate.count(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Candidates
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage registered candidates and review their application history.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Total Candidates</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">
            {totalCandidates}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Filtered Results</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {candidates.length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <form
          method="GET"
          className="flex flex-col gap-3 md:flex-row"
        >
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by candidate name or email..."
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            name="department"
            defaultValue={department}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Departments</option>

            {departments.map((item) => (
              <option key={item.department} value={item.department}>
                {item.department}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>

          <Link
            href="/admin/candidates"
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Reset
          </Link>
        </form>
      </div>

      {/* Candidates Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold text-zinc-900">
            Candidate Records
          </h2>

          <span className="text-sm text-zinc-500">
            {candidates.length} candidate(s)
          </span>
        </div>

        {candidates.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <h3 className="font-semibold text-zinc-800">
              No candidates found
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Try changing your search or department filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Candidate</th>
                  <th className="px-5 py-4 font-semibold">Department</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                  <th className="px-5 py-4 font-semibold">Experience</th>
                  <th className="px-5 py-4 font-semibold">Applications</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {candidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="transition hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">
                        {candidate.fullName}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {candidate.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-zinc-700">
                      {candidate.department}
                    </td>

                    <td className="px-5 py-4 text-zinc-700">
                      {candidate.location}
                    </td>

                    <td className="px-5 py-4 text-zinc-700">
                      {candidate.yearsOfExperience}{" "}
                      {candidate.yearsOfExperience === 1
                        ? "year"
                        : "years"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {candidate._count.applications}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/candidates/${candidate.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
