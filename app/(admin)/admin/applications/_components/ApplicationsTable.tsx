"use client"

import { useState, useMemo, useTransition } from "react"
import { adminUpdateApplicationStatus, adminDeleteApplication } from "@/app/actions/adminActions"
import { ApplicationStatus } from "@prisma/client"

interface ApplicationWithDetails {
  id: string
  documentsUrl?: string | null
  status: string
  yearsOfExperience?: number | null
  createdAt: string | Date
  candidate: {
    fullName: string
    email: string
    department?: string | null
    yearsOfExperience?: number | null
  }
  job: {
    title: string
    departments?: string[] | null
  }
}

interface ApplicationsTableProps {
  applications: ApplicationWithDetails[]
}

// Helper to ensure clean static path routing without requiring an API route
function getStaticDocumentUrl(rawUrl: string): string {
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl
  }

  // Convert Windows backslashes to forward slashes and strip leading slashes
  const normalizedPath = rawUrl.replace(/\\/g, "/").replace(/^\/+/, "")

  // Encode individual path segments to safely handle spaces (%20) without escaping the slashes
  const encodedPath = normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")

  // Ensure it points cleanly to root static path (e.g. /uploads/filename.pdf)
  return `/${encodedPath}`
}

export function ApplicationsTable({ applications: initialApplications }: ApplicationsTableProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [searchCandidate, setSearchCandidate] = useState("")
  const [selectedJobTitle, setSelectedJobTitle] = useState("ALL")
  const [minExperience, setMinExperience] = useState<number>(0)
  const [isPending, startTransition] = useTransition()

  // Handle Application Status Update
  const handleStatusChange = (applicationId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await adminUpdateApplicationStatus(applicationId, newStatus as ApplicationStatus)
      if (res?.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
        )
      } else if (res?.error) {
        alert(res.error)
      }
    })
  }

  // Handle Application Delete (CRUD Delete)
  const handleDeleteApplication = (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this candidate application?")) return

    startTransition(async () => {
      const res = await adminDeleteApplication(applicationId)
      if (res?.success) {
        setApplications((prev) => prev.filter((app) => app.id !== applicationId))
      } else if (res?.error) {
        alert(res.error)
      }
    })
  }

  // Extract unique Job Titles created by admin from applications
  const availableJobTitles = useMemo(() => {
    const titles = new Set<string>()
    applications.forEach((app) => {
      if (app.job?.title) {
        titles.add(app.job.title)
      }
    })
    return Array.from(titles)
  }, [applications])

  // Global Filtering Logic & Sorting by Experience (Descending)
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const query = searchCandidate.toLowerCase().trim()
        const matchesCandidateName = app.candidate.fullName.toLowerCase().includes(query)

        const matchesJobTitle = selectedJobTitle === "ALL" || app.job?.title === selectedJobTitle

        const exp = app.yearsOfExperience ?? app.candidate.yearsOfExperience ?? 0
        const matchesExperience = exp >= minExperience

        return matchesCandidateName && matchesJobTitle && matchesExperience
      })
      .sort((a, b) => {
        const expA = a.yearsOfExperience ?? a.candidate.yearsOfExperience ?? 0
        const expB = b.yearsOfExperience ?? b.candidate.yearsOfExperience ?? 0
        return expB - expA // Primary sort: Experience Descending
      })
  }, [applications, searchCandidate, selectedJobTitle, minExperience])

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "HIRED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "SHORTLISTED":
      case "INTERVIEWING":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "SCREENED":
      case "UNDER_REVIEW":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200"
      case "SUBMITTED":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 border border-zinc-200 rounded-lg shadow-sm">
        {/* Candidate Name Search */}
        <div className="flex-1">
          <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
            Search Candidate
          </label>
          <input
            type="text"
            value={searchCandidate}
            onChange={(e) => setSearchCandidate(e.target.value)}
            placeholder="Search by candidate name..."
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Minimum Years of Experience Filter */}
        <div className="w-full sm:w-56">
          <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
            Min Experience (Years)
          </label>
          <select
            value={minExperience}
            onChange={(e) => setMinExperience(Number(e.target.value))}
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={0}>All Experience Levels</option>
            <option value={1}>1+ Years</option>
            <option value={2}>2+ Years</option>
            <option value={3}>3+ Years</option>
            <option value={5}>5+ Years</option>
            <option value={6}>6+ Years</option>
            <option value={7}>7+ Years</option>
            <option value={8}>8+ Years</option>
            <option value={9}>9+ Years</option>
            <option value={10}>10+ Years</option>
          </select>
        </div>

        {/* Admin Created Job Title Filter Dropdown */}
        <div className="w-full sm:w-64">
          <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
            Filter by Job Title
          </label>
          <select
            value={selectedJobTitle}
            onChange={(e) => setSelectedJobTitle(e.target.value)}
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Job Titles</option>
            {availableJobTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto border border-zinc-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              <th className="p-3.5">Candidate</th>
              <th className="p-3.5">Job Position</th>
              <th className="p-3.5">Experience</th>
              <th className="p-3.5">Field of study</th>
              <th className="p-3.5">Scanned Document</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-zinc-400 italic">
                  No applications matched your filter criteria.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => {
                const experienceValue =
                  app.yearsOfExperience ?? app.candidate.yearsOfExperience ?? 0

                return (
                  <tr key={app.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-zinc-900">{app.candidate.fullName}</div>
                      <div className="text-[11px] text-zinc-500">{app.candidate.email}</div>
                    </td>
                    <td className="p-3.5 font-medium text-zinc-800">{app.job.title}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-700">
                        {experienceValue} {experienceValue === 1 ? "yr" : "yrs"} exp
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-600">
                        {app.candidate.department || app.job.departments?.join(", ") || "N/A"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {app.documentsUrl ? (
                        <a
                          href={getStaticDocumentUrl(app.documentsUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-blue-100 border border-blue-200"
                        >
                          📑 Open Document
                        </a>
                      ) : (
                        <span className="text-zinc-400 italic">No File</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <select
                        disabled={isPending}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="p-1.5 text-xs border border-zinc-200 rounded-lg bg-zinc-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer font-medium"
                      >
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                        <option value="SCREENED">SCREENED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="INTERVIEWING">CALL_FOR_INTERVIEW</option>
                        <option value="HIRED">HIRED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-zinc-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        disabled={isPending}
                        className="text-rose-600 hover:text-rose-800 font-medium text-xs disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}