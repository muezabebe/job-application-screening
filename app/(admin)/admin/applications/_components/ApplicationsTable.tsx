"use client"

import { useState, useMemo, useTransition } from "react"
import { adminUpdateApplicationStatus, adminDeleteApplication, updateApplicationScore } from "@/app/actions/adminActions"
import { ApplicationStatus } from "@prisma/client"
import { AdminSearchComponent } from "./Search"
import { getStatusBadgeStyle } from "../utils/StatusBadge"
import { getStaticDocumentUrl } from "../utils/path_file"
import { ApplicationRow } from "./ApplicationRow"

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
  scoreResult?: {
    technicalScore?: number | null
    behavioralScore?: number | null
  } | null  
}

interface ApplicationsTableProps {
  applications: ApplicationWithDetails[]
}

export function ApplicationsTable({ applications: initialApplications }: ApplicationsTableProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [searchCandidate, setSearchCandidate] = useState("")
  const [selectedJobTitle, setSelectedJobTitle] = useState("ALL")
  const [minExperience, setMinExperience] = useState<number>(0)
  const [isPending, startTransition] = useTransition()

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

  const handleScoreChange = async (
    applicationId: string,
    fieldName: "technicalScore" | "behavioralScore",
    value: number | null
  ) => {
    if (value !== null && (value < 0 || value > 100)) {
      alert("Evaluation parameters must consist of numbers tracking from 0 up to 100.")
      return
    }

    startTransition(async () => {
      const result = await updateApplicationScore(applicationId, fieldName, value)
      
      if (result.success) {
        setApplications((prev) =>
          prev.map((app) => {
            if (app.id === applicationId) {
              const baseResult = app.scoreResult ?? { technicalScore: null, behavioralScore: null }
              return {
                ...app,
                scoreResult: {
                  ...baseResult,
                  [fieldName]: value,
                },
              }
            }
            return app
          })
        )
      } else if (result.error) {
        alert(`Database write rejected: ${result.error}`)
      }
    })
  }

  const availableJobTitles = useMemo(() => {
    const titles = new Set<string>()
    applications.forEach((app) => {
      if (app.job?.title) {
        titles.add(app.job.title)
      }
    })
    return Array.from(titles)
  }, [applications])

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
        return expB - expA
      })
  }, [applications, searchCandidate, selectedJobTitle, minExperience])

  return (
    <div className="space-y-4">
      {/* Search component attached clean on top */}
      <AdminSearchComponent />

      {/* Applications Table Card Container with unified border lines */}
      <div className="overflow-hidden border border-zinc-200 rounded-xl shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1150px]">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold text-zinc-400 uppercase tracking-wider select-none">
                <th className="p-4 font-semibold">Candidate</th>
                <th className="p-4 font-semibold">Job Position</th>
                <th className="p-4 font-semibold">Experience</th>
                <th className="p-4 font-semibold">Field of study</th>
                <th className="p-4 w-24 font-semibold text-center">Tech (/100)</th>
                <th className="p-4 w-24 font-semibold text-center">Behav (/100)</th>
                <th className="p-4 w-24 font-semibold text-center">Overall</th>
                <th className="p-4 font-semibold">Scanned Document</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-600">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-zinc-400 bg-zinc-50/20 font-medium italic">
                    No applications matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <ApplicationRow
                    key={app.id}
                    app={app}
                    isPending={isPending}
                    getStatusBadgeStyle={getStatusBadgeStyle}
                    getStaticDocumentUrl={getStaticDocumentUrl}
                    handleStatusChange={handleStatusChange}
                    handleScoreChange={handleScoreChange}
                    handleDeleteApplication={handleDeleteApplication}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
