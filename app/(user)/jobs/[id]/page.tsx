// app/jobs/[id]/page.tsx

import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import CandidateApplyForm from "./CandidateApplyForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailsPage({ params }: PageProps) {
  const { id } = await params
  
  const job = await prisma.jobPosting.findUnique({
    where: { id }
  })

  if (!job) notFound()

  const allowedDepartments: string[] = job.departments

  return (
    <div className="p-8 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold mt-1 mb-4">{job.title}</h1>
        <p className="text-zinc-700 whitespace-pre-line mb-6">{job.description}</p>
        
        <h3 className="font-semibold mb-2">Required Skills:</h3>
        <div className="flex flex-wrap gap-2">
          {job.requiredSkills.map((skill) => (
            <span key={skill} className="bg-zinc-100 px-2.5 py-1 text-xs font-medium rounded border">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-zinc-50 p-6 rounded-xl border">
        <h2 className="text-xl font-bold mb-4">Submit Application</h2>
        <CandidateApplyForm jobId={job.id} allowedDepartments={allowedDepartments} />
      </div>
    </div>
  )
}