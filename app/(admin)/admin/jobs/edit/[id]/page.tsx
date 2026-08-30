// app/admin/jobs/edit/[id]/page.tsx
"use client"

import { useState, useRef, useEffect, useActionState, use } from "react"
import { notFound, redirect } from "next/navigation"
import { adminGetJobPostingById, adminUpdateJobPosting, type FormState } from "@/app/actions/adminActions"
import Link from "next/link"

const AVAILABLE_DEPARTMENTS = [
  "Accounting", "Administration", "Auditing", "Branding", "Compliance", 
  "Consulting", "Customer Service", "Data Science", "Design", "Digital Marketing", 
  "Distribution", "E-commerce", "Editorial", "Education", "Engineering", 
  "Environment", "Facilities", "Finance", "Fundraising", "Health and Safety", 
  "Help Desk", "HR", "Information Technology", "Innovation", "Internal Audit", 
  "Legal", "Logistics", "Maintenance", "Manufacturing", "Marketing", 
  "Media Relations", "Operations", "Packaging", "Payroll", "Planning", 
  "Procurement", "Product", "Public Relations", "Purchasing", "Quality Assurance", 
  "R&D", "Real Estate", "Recruiting", "Risk Management", "Sales", 
  "Security", "Shipping", "Strategy", "Support", "Training"
]

interface EditJobPageProps {
  params: Promise<{ id: string }>
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const { id } = use(params)

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [selectedDepts, setSelectedDepts] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customDept, setCustomDept] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch job details on load
  useEffect(() => {
    async function fetchJob() {
      try {
        const fetchedJob = await adminGetJobPostingById(id)
        if (!fetchedJob) {
          notFound()
          return
        }
        setJob(fetchedJob)
        setSelectedDepts(fetchedJob.departments || [])
      } catch (err) {
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id])

  // Server action integration with bound job id
  const updateJobWithId = adminUpdateJobPosting.bind(null, id)
  const initialState: FormState = null
  const [state, formAction, isPending] = useActionState(updateJobWithId, initialState)

  // Toggle department selection
  const toggleDepartment = (dept: string) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    )
  }

  // Add custom department
  const handleAddCustomDept = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const trimmed = customDept.trim()
    if (trimmed && !selectedDepts.includes(trimmed)) {
      setSelectedDepts((prev) => [...prev, trimmed])
      setCustomDept("")
      setShowCustomInput(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCustomInput(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center text-sm text-zinc-500">
        Loading job posting details...
      </div>
    )
  }

  if (!job) return null

  // Format deadline for <input type="date">
  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toISOString().split("T")[0]
    : ""

  // Filter existing departments by search query
  const filteredDepartments = AVAILABLE_DEPARTMENTS.filter((dept) =>
    dept.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Edit Job Posting</h1>
          <p className="text-sm text-zinc-500">Update posting details and target fields</p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-zinc-600 hover:text-zinc-900 border px-3 py-1.5 rounded-lg"
        >
          Cancel
        </Link>
      </div>

      <form action={formAction} className="flex flex-col gap-4 bg-white p-6 border rounded-xl shadow-sm">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <input
            type="text"
            name="title"
            defaultValue={job.title}
            required
            className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="e.g. IT Support Specialist"
          />
        </div>

        {/* Custom Multi-Select Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium mb-1">Field of Study *</label>

          {/* Trigger Input */}
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-full border p-2.5 rounded text-sm bg-white cursor-pointer flex justify-between items-center min-h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selectedDepts.length === 0 ? (
                <span className="text-zinc-400">Select fields of study...</span>
              ) : (
                selectedDepts.map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                  >
                    {dept}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleDepartment(dept)
                      }}
                      className="hover:text-blue-900 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
            <span className="text-zinc-400 text-xs ml-2">▼</span>
          </div>

          {/* Hidden Form Inputs for Server Action payload */}
          {selectedDepts.map((dept) => (
            <input key={dept} type="hidden" name="departments" value={dept} />
          ))}

          {/* Options Menu */}
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden flex flex-col max-h-72">
              {/* Search filter input */}
              <div className="p-2 border-b border-zinc-100 bg-zinc-50">
                <input
                  type="text"
                  placeholder="Search department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-xs p-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="overflow-y-auto py-1 flex-1">
                {filteredDepartments.map((dept) => {
                  const isSelected = selectedDepts.includes(dept)
                  return (
                    <div
                      key={dept}
                      onClick={() => toggleDepartment(dept)}
                      className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-zinc-50 ${
                        isSelected ? "bg-blue-50/50 font-medium text-blue-900" : "text-zinc-700"
                      }`}
                    >
                      <span>{dept}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                      />
                    </div>
                  )
                })}
              </div>

              {/* Add Custom Department Section */}
              <div className="border-t border-zinc-100 bg-zinc-50 p-2">
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCustomInput(true)
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <span>+</span> Add Custom Field of Study
                  </button>
                ) : (
                  <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Type custom field..."
                      value={customDept}
                      onChange={(e) => setCustomDept(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomDept(e)
                        }
                      }}
                      className="flex-1 text-xs border rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDept}
                      className="bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded font-medium hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="text-zinc-400 hover:text-zinc-600 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Min Years Experience */}
        <div>
          <label className="block text-sm font-medium mb-1">Min Years Experience</label>
          <input
            type="number"
            name="minYearsExp"
            defaultValue={job.minYearsExp}
            min="0"
            required
            className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Application Deadline */}
        <div>
          <label className="block text-sm font-medium mb-1">Application Deadline</label>
          <input
            type="date"
            name="deadline"
            defaultValue={formattedDeadline}
            className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Required Skills (Comma separated)
          </label>
          <input
            type="text"
            name="requiredSkills"
            defaultValue={job.requiredSkills ? job.requiredSkills.join(", ") : ""}
            placeholder="React, Next.js, TypeScript"
            className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Job Description</label>
          <textarea
            name="description"
            defaultValue={job.description}
            required
            rows={5}
            className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Describe the role..."
          />
        </div>

        {state?.success && (
          <p className="text-sm font-medium text-green-600">Job updated successfully!</p>
        )}
        {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t mt-2">
          <Link
            href="/admin"
            className="px-4 py-2 border rounded text-sm text-zinc-600 hover:bg-zinc-50 font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending || selectedDepts.length === 0}
            className="bg-zinc-900 text-white px-4 py-2 rounded font-medium text-sm hover:bg-zinc-800 transition-colors disabled:bg-zinc-400"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}