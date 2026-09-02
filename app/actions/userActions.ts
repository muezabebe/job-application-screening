// app/actions/userActions.ts
"use server";

import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function submitApplication(jobId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "You must be signed in to submit an application." };
  }

  // Extract Form Data
  const phone = (formData.get("phone") as string) || "";
  const location = (formData.get("location") as string) || "Not Specified";
  const department = (formData.get("department") as string) || "General";
  const professionalTitle = (formData.get("professionalTitle") as string) || "Applicant";
  const yearsOfExperience = parseInt((formData.get("yearsOfExperience") as string) || "0", 10);
  const bioSummary = (formData.get("bioSummary") as string) || "";

  // Parse extracted skills JSON array safely
  const skillsRaw = formData.get("extractedSkills") as string;
  let extractedSkills: string[] = [];
  if (skillsRaw) {
    try {
      extractedSkills = JSON.parse(skillsRaw);
    } catch {
      extractedSkills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  // Handle Binary File Upload
  const file = formData.get("documentsFile") as File | null;
  if (!file || file.size === 0) {
    return { error: "Please upload your merged PDF document (Resume + Certificates)." };
  }

  try {
    // 1. Fetch Job Posting using the correct field name: minYearsExp
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { minYearsExp: true, title: true },
    });

    if (!job) {
      return { error: "The targeted job posting could not be found." };
    }

    // Server-side Experience Guard
    const requiredYears = job.minYearsExp ?? 0;
    if (yearsOfExperience < requiredYears) {
      return {
        error: `Application rejected: This position requires at least ${requiredYears} year${
          requiredYears === 1 ? "" : "s"
        } of experience`,
      };
    }

    // 2. Write file to local public/uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const documentsUrl = `/uploads/${fileName}`;

    // 3. Fetch or create Candidate profile
    let candidate = await prisma.candidate.findFirst({
      where: { email: session.user.email },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          userId: session.user.id,
          fullName: session.user.name || "Applicant",
          email: session.user.email,
          phone,
          location,
          department,
          professionalTitle,
          yearsOfExperience,
          bioSummary,
        },
      });
    } else {
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          phone: phone || candidate.phone,
          location: location || candidate.location,
          department: department || candidate.department,
          professionalTitle: professionalTitle || candidate.professionalTitle,
          yearsOfExperience,
          bioSummary: bioSummary || candidate.bioSummary,
        },
      });
    }

    // 4. Create Application record
    await prisma.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        documentsUrl,
        yearsOfExperience,
        extractedSkills,
        status: "SUBMITTED",
      },
    });

    revalidatePath("/applications");
    return { success: true };
  } catch (error: any) {
    console.error("Submission error:", error);
    if (error?.code === "P2002") {
      return { error: "You have already applied for this job posting." };
    }
    return { error: error?.message || "Failed to submit application. Please try again." };
  }
}