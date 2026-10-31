"use server";

import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";

export async function submitApplication(jobId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "You must be signed in to submit an application." };
  }

  // 1. Extract Form Data
  const phone = (formData.get("phone") as string) || "";
  const location = (formData.get("location") as string) || "Not Specified";
  const department = (formData.get("department") as string) || "General";
  const professionalTitle =
    (formData.get("professionalTitle") as string) || "Applicant";

  const yearsOfExperience = parseInt(
    (formData.get("yearsOfExperience") as string) || "0",
    10,
  );

  const bioSummary = (formData.get("bioSummary") as string) || "";

  // 2. Parse extracted skills JSON array safely
  const skillsRaw = formData.get("extractedSkills") as string;
  let extractedSkills: string[] = [];

  if (skillsRaw) {
    try {
      const parsed = JSON.parse(skillsRaw);

      if (Array.isArray(parsed)) {
        extractedSkills = parsed.filter(
          (skill): skill is string => typeof skill === "string",
        );
      }
    } catch {
      extractedSkills = skillsRaw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }
  }

  // 3. Handle Binary File Upload
  const file = formData.get("documentsFile") as File | null;

  if (!file || file.size === 0) {
    return {
      error: "Please upload your merged PDF document (Resume + Certificates).",
    };
  }

  try {
    // 4. Fetch Job Posting
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: {
        minYearsExp: true,
        title: true,
      },
    });

    if (!job) {
      return { error: "The targeted job posting could not be found." };
    }

    // 5. Server-side Experience Guard
    const requiredYears = job.minYearsExp ?? 0;

    if (yearsOfExperience < requiredYears) {
      return {
        error: `Application rejected: This position requires at least ${requiredYears} year${
          requiredYears === 1 ? "" : "s"
        } of experience.`,
      };
    }

    // 6. Find the actual database user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
      },
    });

    if (!user) {
      return {
        error: "Your user account could not be found. Please sign in again.",
      };
    }

    // 7. Fetch or create Candidate profile using userId
    let candidate = await prisma.candidate.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!candidate) {
      // Check whether a Candidate already exists with this email
      candidate = await prisma.candidate.findUnique({
        where: {
          email: session.user.email,
        },
      });

      if (candidate) {
        // Connect the existing Candidate to this User
        candidate = await prisma.candidate.update({
          where: {
            id: candidate.id,
          },
          data: {
            userId: user.id,
            phone,
            location,
            department,
            professionalTitle,
            yearsOfExperience,
            bioSummary,
          },
        });
      } else {
        // Create a new Candidate profile
        candidate = await prisma.candidate.create({
          data: {
            userId: user.id,
            fullName: user.name || session.user.name || "Applicant",
            email: session.user.email,
            phone,
            location,
            department,
            professionalTitle,
            yearsOfExperience,
            bioSummary,
          },
        });
      }
    } else {
      // Update the existing Candidate profile
      candidate = await prisma.candidate.update({
        where: {
          id: candidate.id,
        },
        data: {
          email: session.user.email,
          phone: phone || candidate.phone,
          location: location || candidate.location,
          department: department || candidate.department,
          professionalTitle: professionalTitle || candidate.professionalTitle,
          yearsOfExperience,
          bioSummary: bioSummary || candidate.bioSummary,
        },
      });
    }

    // 8. Check whether this candidate already applied for this job
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        candidateId: candidate.id,
      },
      select: {
        id: true,
      },
    });

    if (existingApplication) {
      return {
        error: "You have already applied for this job posting.",
      };
    }

    // 9. Write file to public/uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "_",
    )}`;

    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const documentsUrl = `/uploads/${fileName}`;

    // 10. Create Application record
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

    // 11. Revalidate applications page
    revalidatePath("/applications");

    return { success: true };
  } catch (error: unknown) {
    console.error("Application submission error:", error);

    // Handle Prisma unique constraint errors separately.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        console.error("Unique constraint details:", error.meta);

        return {
          error:
            "A database record already exists with one of the required unique values. Please check the server terminal for details.",
        };
      }
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again.",
    };
  }
}
