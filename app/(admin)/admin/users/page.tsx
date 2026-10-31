
import prisma from "@/lib/prisma";
import { auth } from "@/app/auth";
import Link from "next/link";
import UserManagementActions from "./_component/UserManagementActions";
import { UserRole, UserStatus } from "@prisma/client";

interface UsersPageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
  }>;
}

export default async function UsersPage({
  searchParams,
}: UsersPageProps) {
  const params = await searchParams;
  const session = await auth();

  const search = params.q?.trim() || "";

  const role: UserRole | undefined =
    params.role === "ADMIN" || params.role === "APPLICANT"
      ? params.role
      : undefined;

  const status: UserStatus | undefined =
    params.status === "ACTIVE" || params.status === "INACTIVE"
      ? params.status
      : undefined;

  const [users, totalUsers, adminCount, applicantCount, activeCount, inactiveCount] =
    await Promise.all([
      prisma.user.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    {
                      name: {
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
            ...(role ? [{ role }] : []),
            ...(status ? [{ status }] : []),
          ],
        },
        include: {
          candidate: {
            select: {
              id: true,
              fullName: true,
              department: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.user.count({ where: { role: UserRole.APPLICANT } }),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
    ]);

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage registered accounts, roles, and account access.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Total Users", value: totalUsers, color: "text-zinc-900" },
          { label: "Administrators", value: adminCount, color: "text-purple-600" },
          { label: "Applicants", value: applicantCount, color: "text-blue-600" },
          { label: "Active", value: activeCount, color: "text-green-600" },
          { label: "Inactive", value: inactiveCount, color: "text-red-600" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-zinc-200 bg-white p-5"
          >
            <p className="text-sm text-zinc-500">{item.label}</p>
            <p className={`mt-2 text-3xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <form method="GET" className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by name or email..."
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <select
            name="role"
            defaultValue={role || ""}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="APPLICANT">Applicant</option>
          </select>

          <select
            name="status"
            defaultValue={status || ""}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Filter
          </button>

          <Link
            href="/admin/users"
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Reset
          </Link>
        </form>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold text-zinc-900">Registered Users</h2>
          <span className="text-sm text-zinc-500">
            {users.length} user(s)
          </span>
        </div>

        {users.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <h3 className="font-semibold text-zinc-800">No users found</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Account Status</th>
                  <th className="px-5 py-4 font-semibold">Candidate Profile</th>
                  <th className="px-5 py-4 font-semibold">Registered</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Management
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-zinc-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">
                        {user.name || "Unnamed User"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {user.email || "No email"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.status === UserStatus.ACTIVE
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {user.candidate ? (
                        <div>
                          <p className="font-medium text-zinc-800">
                            {user.candidate.fullName}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {user.candidate.department}
                          </p>
                          <Link
                            href={`/admin/candidates/${user.candidate.id}`}
                            className="mt-1 inline-block text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            View Profile
                          </Link>
                        </div>
                      ) : (
                        <span className="text-zinc-400">
                          No candidate profile
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <UserManagementActions
                        userId={user.id}
                        currentRole={user.role}
                        currentStatus={user.status}
                        isCurrentUser={session?.user?.id === user.id}
                      />
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
