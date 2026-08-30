// app/admin/jobs/JobManagementTable.tsx
"use client"

import { useState, useTransition } from "react"
import {
  adminDeleteJobPosting,
  adminToggleJobVisibility,
  adminArchiveExpiredJobs,
  adminSetJobDeadlineDate,
  adminSetJobDeadlineDays,
} from "@/app/actions/adminActions"
import Link from "next/link"

interface JobPosting {
  id: string
  title: string
  departments: string[]
  minYearsExp: number
  deadline?: string | Date | null
  isHidden?: boolean
  createdAt: string | Date
}

export default function JobManagementTable({ initialJobs }: { initialJobs: JobPosting[] }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [isPending, startTransition] = useTransition()

  // Manual Delete Action
  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return

    startTransition(async () => {
      const res = await adminDeleteJobPosting(id)
      if (res?.success) {
        setJobs((prev) => prev.filter((j) => j.id !== id))
      }
    })
  }

  // Toggle Manual Visibility
  const handleToggleHide = (id: string, currentHidden: boolean) => {
    startTransition(async () => {
      const res = await adminToggleJobVisibility(id, !currentHidden)
      if (res?.success) {
        setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, isHidden: !currentHidden } : j)))
      }
    })
  }

  // Set Deadline by Calendar Date
  const handleDateChange = (id: string, dateStr: string) => {
    startTransition(async () => {
      const res = await adminSetJobDeadlineDate(id, dateStr || null)
      if (res?.success) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === id ? { ...j, deadline: dateStr ? new Date(dateStr) : null } : j
          )
        )
      }
    })
  }

  // Set Deadline by Days from Today
  const handleAddDays = (id: string, days: number) => {
    startTransition(async () => {
      const res = await adminSetJobDeadlineDays(id, days)
      if (res?.success) {
        let updatedDate: Date | null = null
        if (days > 0) {
          updatedDate = new Date()
          updatedDate.setDate(updatedDate.getDate() + days)
        }
        setJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, deadline: updatedDate } : j))
        )
      }
    })
  }

  // Bulk Archive Expired Jobs
  const handleArchiveExpired = () => {
    startTransition(async () => {
      const res = await adminArchiveExpiredJobs()
      if (res?.success) {
        setJobs((prev) =>
          prev.map((j) => {
            if (j.deadline && new Date(j.deadline) < new Date()) {
              return { ...j, isHidden: true }
            }
            return j
          })
        )
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 border border-zinc-200 rounded-xl shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Job Postings Control</h2>
          <p className="text-xs text-zinc-500">Manage active openings and deadline expirations</p>
        </div>
        <button
          onClick={handleArchiveExpired}
          disabled={isPending}
          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          ⌛ Hide All Expired Jobs
        </button>
      </div>

      <div className="overflow-x-auto border border-zinc-200 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
              <th className="p-4">Title & Department</th>
              <th className="p-4">Min Exp</th>
              <th className="p-4">Deadline Settings</th>
              <th className="p-4">Visibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {jobs.map((job) => {
              const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false
              const formattedInputValue = job.deadline
                ? new Date(job.deadline).toISOString().split("T")[0]
                : ""

              return (
                <tr key={job.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-zinc-900">{job.title}</div>
                    <div className="text-[11px] text-zinc-500">{job.departments.join(", ")}</div>
                  </td>
                  <td className="p-4 font-medium">{job.minYearsExp} yrs</td>
                  <td className="p-4 space-y-2">
                    {/* Inline Calendar Date Picker */}
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={formattedInputValue}
                        onChange={(e) => handleDateChange(job.id, e.target.value)}
                        disabled={isPending}
                        className="px-2 py-1 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                      />
                      {job.deadline && (
                        <button
                          onClick={() => handleDateChange(job.id, "")}
                          disabled={isPending}
                          title="Clear Deadline"
                          className="text-zinc-400 hover:text-rose-600 font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Quick Add Days Shortcuts */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-zinc-400">Quick set:</span>
                      <button
                        onClick={() => handleAddDays(job.id, 7)}
                        disabled={isPending}
                        className="px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-300"
                      >
                        +7d
                      </button>
                      <button
                        onClick={() => handleAddDays(job.id, 14)}
                        disabled={isPending}
                        className="px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-300"
                      >
                        +14d
                      </button>
                      <button
                        onClick={() => handleAddDays(job.id, 30)}
                        disabled={isPending}
                        className="px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-300"
                      >
                        +30d
                      </button>
                    </div>

                    {/* Expiration Status Label */}
                    {isExpired && (
                      <span className="text-rose-600 font-semibold block text-[10px]">
                        ⚠️ Post expired
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {job.isHidden || isExpired ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {isExpired ? "Expired" : "Hidden"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Live
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleHide(job.id, !!job.isHidden)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                          job.isHidden
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                        } disabled:opacity-50`}
                      >
                        {job.isHidden ? "👁️ Unhide" : "🙈 Hide"}
                      </button>
                      <Link
                        href={`/admin/jobs/edit/${job.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}