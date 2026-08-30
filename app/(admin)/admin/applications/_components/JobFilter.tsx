"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface Job {
  id: string
  title: string
}

export default function JobFilter({ jobs }: { jobs: Job[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentJobId = searchParams.get("jobId") || ""

  const handleFilterChange = (jobId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (jobId) {
      params.set("jobId", jobId)
    } else {
      params.delete("jobId")
    }
    router.push(`/admin/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentJobId}
        onChange={(e) => handleFilterChange(e.target.value)}
        aria-label="Filter applications by job title"
        className="bg-white border border-zinc-300 text-zinc-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
      >
        <option value="">All Job Titles</option>
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title}
          </option>
        ))}
      </select>
      
      {currentJobId && (
        <button
          onClick={() => handleFilterChange("")}
          className="px-3 py-2.5 text-xs text-zinc-500 hover:text-zinc-800 font-medium transition-colors"
        >
          Reset Filter
        </button>
      )}
    </div>
  )
}