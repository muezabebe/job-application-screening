import { ApplicationStatus, MatchRating } from "@prisma/client"

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SCREENED: "Screened",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  HIRED: "Hired",
  REJECTED: "Rejected",
}

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
  SCREENED: "bg-purple-100 text-purple-800 border-purple-200",
  SHORTLISTED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  INTERVIEWING: "bg-orange-100 text-orange-800 border-orange-200",
  HIRED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200",
}

export const RATING_COLORS: Record<MatchRating, string> = {
  HIGH: "bg-emerald-100 text-emerald-800 border-emerald-200",
  MEDIUM: "bg-teal-100 text-teal-800 border-teal-200",
  LOW: "bg-orange-100 text-orange-800 border-orange-200",
  UNQUALIFIED: "bg-red-100 text-red-800 border-red-200",
}
