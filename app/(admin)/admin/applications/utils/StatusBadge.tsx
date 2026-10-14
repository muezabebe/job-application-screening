

export const getStatusBadgeStyle = (status: string) => {
 switch (status.toUpperCase()) {
  // 1. INITIAL PIPELINE INTAKE
  case "SUBMITTED":
    return "bg-slate-100 text-slate-800 border-slate-300"

  // 2. EVALUATION & SCREENING
  case "UNDER_REVIEW":
    return "bg-indigo-50 text-indigo-800 border-indigo-200"
  case "SCREENED":
    return "bg-purple-100 text-purple-800 border-purple-300"

  // 3. CANDIDATE ENGAGEMENT & INTERVIEWS
  case "SHORTLISTED":
    return "bg-cyan-100 text-cyan-800 border-cyan-300"
  case "CALL_FOR_INTERVIEW":
    return "bg-blue-100 text-blue-800 border-blue-300"
  case "INTERVIEWING":
    return "bg-blue-50 text-blue-800 border-blue-200"

  // 4. PERSISTENT TALENT POOLS / RESERVE TIERS (Graduated Amber to Warm Gray)
  case "RESERVE_1":
    return "bg-amber-100 text-amber-900 border-amber-300"
  case "RESERVE_2":
    return "bg-orange-100 text-orange-900 border-orange-300"
  case "RESERVE_3":
    return "bg-zinc-200 text-zinc-800 border-zinc-300"

  // 5. SUCCESSFUL FINAL OUTCOMES
  case "ACCEPTED":
    return "bg-emerald-100 text-emerald-800 border-emerald-300"
  case "HIRED":
    return "bg-emerald-500 text-white border-emerald-600" // Vibrant success highlight

  // 6. TERMINAL UNSELECTED OUTCOME
  case "REJECTED":
    return "bg-rose-100 text-rose-800 border-rose-300"

  // FALLBACK
  default:
    return "bg-zinc-100 text-zinc-700 border-zinc-300"
}


  }