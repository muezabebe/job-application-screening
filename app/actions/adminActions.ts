// app/actions/adminActions.ts
"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/app/auth"
import { revalidatePath } from "next/cache"
import { ApplicationStatus } from "@prisma/client"
// Define and export the FormState type
export type FormState = {
  success?: boolean
  error?: string | null
} | null

// Helper guard to enforce Admin authorization
async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.")
  }
}

/* ============================================================================
   JOB POSTING CRUD OPERATIONS
   ============================================================================ */

// 1. CREATE Job Posting
export async function adminCreateJobPosting(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin()

    const title = formData.get("title") as string
    const departments = formData.getAll("departments") as string[]
    const minYearsExp = Number(formData.get("minYearsExp") || 0)
    const description = formData.get("description") as string
    const rawSkills = formData.get("requiredSkills") as string
    const deadlineString = formData.get("deadline") as string | null

    const requiredSkills = rawSkills
      ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : []

    if (!departments.length) {
      return { success: false, error: "Please select at least one department." }
    }

    await prisma.jobPosting.create({
      data: {
        title,
        departments,
        minYearsExp,
        description,
        requiredSkills,
        deadline: deadlineString ? new Date(deadlineString) : null,
      },
    })

    revalidatePath("/admin")
    revalidatePath("/jobs")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to create job posting:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish job.",
    }
  }
}

// 2. READ Single Job Posting
export async function adminGetJobPostingById(jobId: string) {
  try {
    await requireAdmin()
    return await prisma.jobPosting.findUnique({
      where: { id: jobId },
    })
  } catch (error) {
    console.error("Failed to fetch job posting:", error)
    return null
  }
}

// 3. UPDATE Job Posting
export async function adminUpdateJobPosting(
  jobId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin()

    const title = formData.get("title") as string
    const departments = formData.getAll("departments") as string[]
    const minYearsExp = Number(formData.get("minYearsExp") || 0)
    const description = formData.get("description") as string
    const rawSkills = formData.get("requiredSkills") as string
    const deadlineString = formData.get("deadline") as string | null

    const requiredSkills = rawSkills
      ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : []

    if (!departments.length) {
      return { success: false, error: "Please select at least one department." }
    }

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        title,
        departments,
        minYearsExp,
        description,
        requiredSkills,
        deadline: deadlineString ? new Date(deadlineString) : null,
      },
    })

    revalidatePath("/admin")
    revalidatePath("/jobs")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to update job posting:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update job.",
    }
  }
}

// 4. DELETE Job Posting
export async function adminDeleteJobPosting(jobId: string): Promise<FormState> {
  try {
    await requireAdmin()

    await prisma.jobPosting.delete({
      where: { id: jobId },
    })

    revalidatePath("/admin")
    revalidatePath("/jobs")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to delete job posting:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete job.",
    }
  }
}

// 5. TOGGLE Job Visibility (Hide / Unhide)
export async function adminToggleJobVisibility(
  jobId: string,
  isHidden: boolean
): Promise<FormState> {
  try {
    await requireAdmin()

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: { isHidden },
    })

    revalidatePath("/admin")
    revalidatePath("/jobs")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to toggle job visibility:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change visibility.",
    }
  }
}

// 6. SET Deadline by specific Date string (e.g., "2026-09-15" or null to clear)
export async function adminSetJobDeadlineDate(
  jobId: string,
  dateString: string | null
): Promise<FormState> {
  try {
    await requireAdmin()

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        deadline: dateString ? new Date(dateString) : null,
      },
    })

    revalidatePath("/admin")
    revalidatePath("/jobs")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to set job deadline date:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set deadline.",
    }
  }
}

// 7. SET Deadline by Days from Today (e.g., set to expire in 7 days)
export async function adminSetJobDeadlineDays(
  jobId: string,
  days: number
): Promise<FormState> {
  try {
    await requireAdmin()

    let newDeadline: Date | null = null
    if (days > 0) {
      newDeadline = new Date()
      newDeadline.setDate(newDeadline.getDate() + days)
    }

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: { deadline: newDeadline },
    })

    revalidatePath("/admin")
    revalidatePath("/jobs")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to set job deadline days:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to set deadline.",
    }
  }
}

// 8. BULK ARCHIVE Expired Jobs (Hide all postings past their deadline)
export async function adminArchiveExpiredJobs(): Promise<FormState> {
  try {
    await requireAdmin()

    await prisma.jobPosting.updateMany({
      where: {
        deadline: { lt: new Date() },
        isHidden: false,
      },
      data: { isHidden: true },
    })

    revalidatePath("/admin")
    revalidatePath("/jobs")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to archive expired jobs:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive expired jobs.",
    }
  }
}

/* ============================================================================
   APPLICATION STATUS & MANAGEMENT CRUD OPERATIONS
   ============================================================================ */

// 9. UPDATE Candidate Application Status
export async function adminUpdateApplicationStatus(
  applicationId: string,
  status: string | ApplicationStatus
): Promise<FormState> {
  try {
    await requireAdmin()

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status as ApplicationStatus,
      },
    })

    revalidatePath("/admin")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to update application status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status.",
    }
  }
}

// 10. DELETE Candidate Application
export async function adminDeleteApplication(applicationId: string): Promise<FormState> {
  try {
    await requireAdmin()

    await prisma.application.delete({
      where: { id: applicationId },
    })

    revalidatePath("/admin")
    return { success: true, error: null }
  } catch (error) {
    console.error("Failed to delete application:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete application.",
    }
  }
}
 
//score Result update function for admin to update technical and behavioral scores

export async function updateApplicationScore(
  applicationId: string,
  fieldName: "technicalScore" | "behavioralScore",
  value: number | null
) {
  try {
    // Upsert directly into PostgreSQL matching your specific schema parameters
    await prisma.scoreResult.upsert({
      where: { applicationId },
      update: {
        [fieldName]: value
      },
      create: {
        applicationId,
        [fieldName]: value,
        matchRating: "MEDIUM", // Ensure this fallback string matches your explicit MatchRating enum definition
        skillsMatched: [],
        missingSkills: [],
        summary: "Manual profile metrics initialized by reviewer."
      }
    })

    // Bust the layout route cache cache layer to synchronize mutations across panels
    revalidatePath("/admin/applications")
    return { success: true }
  } catch (error: any) {
    console.error("Score entry synchronization crashed:", error)
    return { success: false, error: error.message }
  }
}
