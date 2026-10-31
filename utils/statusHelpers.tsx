// (Your existing exports...)
import { ApplicationStatus, MatchRating } from "@prisma/client"

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SCREENED: "Screened",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  HIRED: "Hired",
  REJECTED: "Rejected",
  RESERVE_1: "Reserve 1",
  RESERVE_2: "Reserve 2",
  RESERVE_3: "Reserve 3",
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
  SCREENED: "bg-purple-100 text-purple-800 border-purple-200",
  SHORTLISTED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  INTERVIEWING: "bg-orange-100 text-orange-800 border-orange-200",
  HIRED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
  RESERVE_1: "bg-slate-100 text-slate-800 border-slate-200",
  RESERVE_2: "bg-slate-100 text-slate-800 border-slate-200",
  RESERVE_3: "bg-slate-100 text-slate-800 border-slate-200",
}

export const RATING_COLORS: Record<MatchRating, string> = {
  HIGH: "bg-emerald-100 text-emerald-800 border-emerald-200",
  MEDIUM: "bg-teal-100 text-teal-800 border-teal-200",
  LOW: "bg-orange-100 text-orange-800 border-orange-200",
  UNQUALIFIED: "bg-red-100 text-red-800 border-red-200",
}

// Add and export this helper function so ApplicationsTable can import it:
export function getStatusBadgeStyle(status: ApplicationStatus | string): string {
  return STATUS_COLORS[status as ApplicationStatus] || "bg-zinc-100 text-zinc-800 border-zinc-200"
}