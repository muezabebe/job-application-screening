import { ChangeEvent } from "react"

interface StepSkillsBioProps {
  bioSummary: string
  skillsInput: string
  skillsList: string[]
  documentFile: File | null // Updated: single combined PDF file prop
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onAddSkill: () => void
  onRemoveSkill: (skill: string) => void
}

export default function StepSkillsBio({
  bioSummary,
  skillsInput,
  skillsList,
  documentFile,
  onFileChange,
  onChange,
  onAddSkill,
  onRemoveSkill,
}: StepSkillsBioProps) {
  return (
    <div className="space-y-4">
      {/* File Upload Section */}
      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1">
          Upload Application Document (Merged Resume & Certificates PDF) *
        </label>
        <input
          type="file"
          name="documentsFile"
          accept=".pdf"
          onChange={onFileChange}
          className="w-full text-xs text-zinc-600 border border-zinc-200 rounded-lg p-2 bg-zinc-50 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {documentFile && (
          <p className="mt-1 text-[11px] font-medium text-emerald-600">
            Selected: {documentFile.name} ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Bio Summary */}
      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1">
          Professional Bio / Summary *
        </label>
        <textarea
          name="bioSummary"
          rows={3}
          value={bioSummary}
          onChange={onChange}
          placeholder="Brief overview of your background and key strengths..."
          className="w-full p-2.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Skills Input */}
      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1">
          Competency Skills *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="skillsInput"
            value={skillsInput}
            onChange={onChange}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddSkill())}
            placeholder="Add a skill (e.g. Next.js, PostgreSQL)"
            className="flex-1 p-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={onAddSkill}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        {/* Selected Skills Chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {skillsList.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-700 rounded-full border border-zinc-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                className="text-zinc-400 hover:text-rose-600 font-bold ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}