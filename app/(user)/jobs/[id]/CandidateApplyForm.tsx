"use client"

import { useState } from "react"
import { submitApplication } from "@/app/actions/userActions"
import FormProgress from "./_components/FormProgress"
import { StepOneContact, StepTwoExpectations } from "./_components/FormSteps"
import StepSkillsBio from "./_components/StepSkillsBio"

interface ApplyFormProps {
  jobId: string
  allowedDepartments: string[]
  minYearsExp?: number
  userName?: string | null
  userEmail?: string | null
}

export default function CandidateApplyForm({
  jobId,
  allowedDepartments,
  minYearsExp = 0,
  userName,
  userEmail,
}: ApplyFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Merged PDF File State
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
    department: "",
    customDepartment: "",
    professionalTitle: "",
    yearsOfExperience: "",
    bioSummary: "",
    expectedSalary: "",
    workPreference: "Remote",
    noticePeriodDays: "",
    visaRequired: false,
    skillsInput: "",
  })

  const [skillsList, setSkillsList] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0])
    }
  }

  const handleAddSkill = () => {
    const trimmed = formData.skillsInput.trim()
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList((prev) => [...prev, trimmed])
      setFormData((prev) => ({ ...prev, skillsInput: "" }))
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkillsList((prev) => prev.filter((s) => s !== skill))
  }

  const validateStep = (): boolean => {
    setFormStatus(null)

    if (currentStep === 1) {
      if (
        !formData.phone.trim() ||
        !formData.location.trim() ||
        !formData.department.trim() ||
        (formData.department === "Other" && !formData.customDepartment?.trim()) ||
        !formData.professionalTitle.trim() ||
        formData.yearsOfExperience === ""
      ) {
        setFormStatus({ type: "error", message: "All contact fields are required." })
        return false
      }

      const expNum = Number(formData.yearsOfExperience)
      if (isNaN(expNum) || expNum < minYearsExp) {
        setFormStatus({
          type: "error",
          message: `This position requires at least ${minYearsExp} year${minYearsExp === 1 ? "" : "s"} of experience.`,
        })
        return false
      }
    }

    if (currentStep === 2) {
      if (!formData.expectedSalary || !formData.noticePeriodDays || !formData.workPreference) {
        setFormStatus({ type: "error", message: "All fields in Step 2 are required." })
        return false
      }
    }

    if (currentStep === 3) {
      if (!documentFile) {
        setFormStatus({ type: "error", message: "Please upload your merged PDF document (Resume + Certificates)." })
        return false
      }
      if (!formData.bioSummary.trim()) {
        setFormStatus({ type: "error", message: "Professional bio is required." })
        return false
      }
      if (skillsList.length === 0) {
        setFormStatus({ type: "error", message: "Please add at least one competency skill." })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    setFormStatus(null)

    const finalDepartment =
      formData.department === "Other" ? formData.customDepartment.trim() : formData.department.trim()

    const payload = new FormData()
    payload.append("jobId", jobId)
    payload.append("phone", formData.phone.trim())
    payload.append("location", formData.location.trim())
    payload.append("department", finalDepartment)
    payload.append("professionalTitle", formData.professionalTitle.trim())
    payload.append("yearsOfExperience", formData.yearsOfExperience)
    payload.append("expectedSalary", formData.expectedSalary)
    payload.append("noticePeriodDays", formData.noticePeriodDays)
    payload.append("workPreference", formData.workPreference)
    payload.append("visaRequired", String(formData.visaRequired))
    payload.append("bioSummary", formData.bioSummary.trim())
    payload.append("extractedSkills", JSON.stringify(skillsList))

    if (documentFile) {
      payload.append("documentsFile", documentFile)
    }

    // submitApplication expects jobId first, FormData second
    const res = await submitApplication(jobId, payload)
    setLoading(false)

    if (res.success) {
      setFormStatus({ type: "success", message: "Application submitted successfully!" })
      setFormData({
        phone: "",
        location: "",
        department: "",
        customDepartment: "",
        professionalTitle: "",
        yearsOfExperience: "",
        bioSummary: "",
        expectedSalary: "",
        workPreference: "Remote",
        noticePeriodDays: "",
        visaRequired: false,
        skillsInput: "",
      })
      setSkillsList([])
      setDocumentFile(null)
      setCurrentStep(1)
    } else {
      setFormStatus({ type: "error", message: res.error || "Failed to submit application." })
    }
  }

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
      {/* Session Account Banner */}
      {(userName || userEmail) && (
        <div className="mb-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 flex justify-between items-center">
          <span>
            Applying as: <strong className="text-zinc-900">{userName || "Applicant"}</strong> ({userEmail})
          </span>
          <span className="text-zinc-400">Account Auto-Linked</span>
        </div>
      )}

      <FormProgress currentStep={currentStep} />

      {formStatus && (
        <div
          className={`mb-6 p-4 rounded-lg border text-xs font-medium ${
            formStatus.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {formStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentStep === 1 && (
          <StepOneContact
            formData={formData}
            allowedDepartments={allowedDepartments}
            minYearsExp={minYearsExp}
            onChange={handleInputChange}
          />
        )}
        {currentStep === 2 && <StepTwoExpectations formData={formData} onChange={handleInputChange} />}
        {currentStep === 3 && (
          <StepSkillsBio
            bioSummary={formData.bioSummary}
            skillsInput={formData.skillsInput}
            skillsList={skillsList}
            documentFile={documentFile}
            onFileChange={handleFileChange}
            onChange={handleInputChange}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
        )}

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => {
                setFormStatus(null)
                setCurrentStep((prev) => Math.max(prev - 1, 1))
              }}
              disabled={loading}
              className="text-xs font-semibold text-zinc-600 border border-zinc-200 px-4 py-2 rounded-lg bg-white hover:bg-zinc-50 shadow-sm"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep()) setCurrentStep((prev) => Math.min(prev + 1, 3))
              }}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit Application ✓"}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}