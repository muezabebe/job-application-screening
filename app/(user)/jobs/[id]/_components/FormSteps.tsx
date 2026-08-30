// app/(user)/jobs/[id]/_components/FormSteps.tsx

import { ChangeEvent } from "react"

interface StepOneProps {
  formData: {
    phone: string
    location: string
    department: string
    customDepartment?: string
    professionalTitle: string
    yearsOfExperience: string
  }
  allowedDepartments: string[]
  minYearsExp: number
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function StepOneContact({
  formData,
  allowedDepartments = [],
  minYearsExp = 0,
  onChange,
}: StepOneProps) {
  const currentExp = Number(formData.yearsOfExperience) || 0
  const isExperienceValid = formData.yearsOfExperience === "" || currentExp >= minYearsExp

  return (
    <div className="space-y-3.5">
      <h2 className="text-sm font-bold text-zinc-800 border-b border-zinc-100 pb-2">
        Step 1: Contact & Profile Information
      </h2>

      {/* Phone & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="+251 91 123 4567"
            required
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Current Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onChange}
            placeholder="e.g. Addis Ababa, Ethiopia"
            required
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Field of Study & Professional Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Field of Study *
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={onChange}
            required
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">-- Select Field of Study --</option>
            {allowedDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Professional Title *
          </label>
          <input
            type="text"
            name="professionalTitle"
            value={formData.professionalTitle}
            onChange={onChange}
            placeholder="e.g. IT Support Specialist"
            required
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Custom Department (If 'Other' selected) */}
      {formData.department === "Other" && (
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Specify Field of Study *
          </label>
          <input
            type="text"
            name="customDepartment"
            value={formData.customDepartment || ""}
            onChange={onChange}
            placeholder="Enter your field of study"
            required
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      )}

      {/* Total Years of Experience */}
      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1">
          Years of Experience *
          {minYearsExp > 0 && (
            <span className="text-zinc-500 font-normal ml-1">
              (Minimum required: {minYearsExp} year{minYearsExp > 1 ? "s" : ""})
            </span>
          )}
        </label>
        <input
          type="number"
          name="yearsOfExperience"
          min={minYearsExp}
          value={formData.yearsOfExperience}
          onChange={onChange}
          placeholder={`e.g. ${minYearsExp}`}
          required
          className={`w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${
            !isExperienceValid
              ? "border-red-400 bg-red-50/30 focus:ring-red-500/20 focus:border-red-500"
              : "border-zinc-200 focus:ring-blue-500/20 focus:border-blue-500"
          }`}
        />
        {!isExperienceValid && (
          <p className="text-[11px] text-red-600 mt-1 font-medium">
            This position requires at least {minYearsExp} year{minYearsExp > 1 ? "s" : ""} of experience.
          </p>
        )}
      </div>
    </div>
  )
}

interface StepTwoProps {
  formData: {
    expectedSalary: string
    noticePeriodDays: string
    workPreference: string
    visaRequired: boolean
  }
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export function StepTwoExpectations({ formData, onChange }: StepTwoProps) {
  return (
    <div className="space-y-3.5">
      <h2 className="text-sm font-bold text-zinc-800 border-b border-zinc-100 pb-2">
        Step 2: Expectations & Availability
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Expected Salary */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Expected Monthly Salary (USD or ETB) *
          </label>
          <input
            type="number"
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={onChange}
            placeholder="e.g. 2500"
            required
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Notice Period */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Notice Period (Days) *
          </label>
          <input
            type="number"
            name="noticePeriodDays"
            value={formData.noticePeriodDays}
            onChange={onChange}
            placeholder="e.g. 30"
            required
            className="w-full p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Work Preference */}
      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1">
          Work Preference *
        </label>
        <select
          name="workPreference"
          value={formData.workPreference}
          onChange={onChange}
          required
          className="w-full p-2 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="Remote">Remote</option>
          <option value="On-Site">On-Site</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      {/* Visa Sponsorship */}
      <div className="pt-2">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="visaRequired"
            checked={formData.visaRequired}
            onChange={onChange}
            className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
          />
          <span className="text-xs font-medium text-zinc-700">
            I require visa sponsorship for work authorization
          </span>
        </label>
      </div>
    </div>
  )
}