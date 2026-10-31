
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/app/auth";
import { revalidatePath } from "next/cache";
import {
  ApplicationStatus,
  CompetencyTestStatus,
  MatchRating,
  Prisma,
  QuestionType,
} from "@prisma/client";


/* ============================================================================
   TYPES
   ============================================================================ */

export type FormState = {
  success?: boolean;
  error?: string | null;
} | null;

export type CandidateSearchFilters = {
  search?: string;
  minExperience?: number;
  jobTitle?: string;
};

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* ============================================================================
   AUTHORIZATION & HELPERS
   ============================================================================ */

// ENSURE THE CURRENT SESSION BELONGS TO AN ADMINISTRATOR.

// CONVERT DATABASE / RUNTIME ERRORS INTO USER-FACING MESSAGES.
function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return "The requested record was not found.";
    }

    if (error.code === "P2002") {
      return "A record with these unique values already exists.";
    }

    if (error.code === "P2003") {
      return "This operation conflicts with related records.";
    }
  }

  return error instanceof Error ? error.message : fallback;
}

// READ AND VALIDATE A REQUIRED STRING FROM FORM DATA.
function requiredText(
  formData: FormData,
  field: string
): string {
  const value = formData.get(field);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

// VALIDATE A NON-NEGATIVE WHOLE NUMBER.
function nonNegativeInteger(
  value: unknown,
  field: string
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;

  if (
    !Number.isInteger(parsed) ||
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    throw new Error(`${field} must be a non-negative integer.`);
  }

  return parsed;
}

// VALIDATE AND PARSE A YYYY-MM-DD DEADLINE.
function parseDeadline(
  value: string | null
): Date | null {
  if (value === null || value.trim() === "") {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Deadline must use YYYY-MM-DD format.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error("Invalid deadline date.");
  }

  return date;
}

// EXTRACT AND VALIDATE ALL JOB POSTING FORM FIELDS.
function parseJobForm(formData: FormData) {
  const title = requiredText(formData, "title");
  const description = requiredText(formData, "description");

  const departments = [
    ...new Set(
      formData
        .getAll("departments")
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0
        )
        .map((value) => value.trim())
    ),
  ];

  if (departments.length === 0) {
    throw new Error("Please select at least one department.");
  }

  const minYearsExp = nonNegativeInteger(
    formData.get("minYearsExp") ?? "0",
    "Minimum years of experience"
  );

  const skillsValue = formData.get("requiredSkills");

  if (
    skillsValue !== null &&
    typeof skillsValue !== "string"
  ) {
    throw new Error("Invalid required skills.");
  }

  const deadlineValue = formData.get("deadline");

  if (
    deadlineValue !== null &&
    typeof deadlineValue !== "string"
  ) {
    throw new Error("Invalid deadline.");
  }

  const requiredSkills = [
    ...new Set(
      (skillsValue ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    ),
  ];

  return {
    title,
    description,
    departments,
    minYearsExp,
    requiredSkills,
    deadline: parseDeadline(deadlineValue),
  };
}

// REVALIDATE PAGES THAT DISPLAY JOB POSTINGS.
function refreshJobPages() {
  revalidatePath("/admin");
  revalidatePath("/jobs");
  revalidatePath("/admin/applications");
}

/* ============================================================================
   1. JOB POSTING CRUD
   ============================================================================ */

// CREATE
export async function adminCreateJobPosting(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin();

    await prisma.jobPosting.create({
      data: parseJobForm(formData),
    });

    refreshJobPages();

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to create job posting:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to publish job."),
    };
  }
}

// READ ONE
export async function adminGetJobPostingById(jobId: string) {
  try {
    await requireAdmin();

    if (!jobId?.trim()) return null;

    return await prisma.jobPosting.findUnique({
      where: { id: jobId },
    });
  } catch (error) {
    console.error("Failed to fetch job posting:", error);
    return null;
  }
}

// UPDATE
export async function adminUpdateJobPosting(
  jobId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin();

    if (!jobId?.trim()) {
      throw new Error("A valid job ID is required.");
    }

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: parseJobForm(formData),
    });

    refreshJobPages();

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update job posting:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to update job."),
    };
  }
}

// DELETE
export async function adminDeleteJobPosting(
  jobId: string
): Promise<FormState> {
  try {
    await requireAdmin();

    if (!jobId?.trim()) {
      throw new Error("A valid job ID is required.");
    }

    await prisma.jobPosting.delete({
      where: { id: jobId },
    });

    refreshJobPages();

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to delete job posting:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to delete job."),
    };
  }
}

// HIDE / UNHIDE
export async function adminToggleJobVisibility(
  jobId: string,
  isHidden: boolean
): Promise<FormState> {
  try {
    await requireAdmin();

    if (!jobId?.trim()) {
      throw new Error("A valid job ID is required.");
    }

    if (typeof isHidden !== "boolean") {
      throw new Error("Invalid visibility value.");
    }

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: { isHidden },
    });

    refreshJobPages();

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to change job visibility:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "Failed to change visibility."
      ),
    };
  }
}

/* ============================================================================
   2. JOB DEADLINE MANAGEMENT
   ============================================================================ */

// SET DEADLINE BY DATE; null clears the deadline.
export async function adminSetJobDeadlineDate(
  jobId: string,
  dateString: string | null
): Promise<FormState> {
  try {
    await requireAdmin();

    if (!jobId?.trim()) {
      throw new Error("A valid job ID is required.");
    }

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        deadline: parseDeadline(dateString),
      },
    });

    refreshJobPages();

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to set job deadline:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to set deadline."),
    };
  }
}

// SET DEADLINE BY DAYS; zero clears the deadline.
export async function adminSetJobDeadlineDays(
  jobId: string,
  days: number
): Promise<FormState> {
  try {
    await requireAdmin();

    if (!jobId?.trim()) {
      throw new Error("A valid job ID is required.");
    }

    const validDays = nonNegativeInteger(days, "Days");

    let deadline: Date | null = null;

    if (validDays > 0) {
      deadline = new Date();
      deadline.setDate(deadline.getDate() + validDays);
    }

    await prisma.jobPosting.update({
      where: { id: jobId },
      data: { deadline },
    });

    refreshJobPages();

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to set job deadline by days:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to set deadline."),
    };
  }
}

// ARCHIVE EXPIRED JOBS
export async function adminArchiveExpiredJobs(): Promise<FormState> {
  try {
    await requireAdmin();

    await prisma.jobPosting.updateMany({
      where: {
        deadline: { lt: new Date() },
        isHidden: false,
      },
      data: { isHidden: true },
    });

    refreshJobPages();

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to archive expired jobs:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "Failed to archive expired jobs."
      ),
    };
  }
}

/* ============================================================================
   3. APPLICATION MANAGEMENT
   ============================================================================ */

// UPDATE APPLICATION STATUS
export async function adminUpdateApplicationStatus(
  applicationId: string,
  status: string | ApplicationStatus
): Promise<FormState> {
  try {
    await requireAdmin();

    if (!applicationId?.trim()) {
      throw new Error("A valid application ID is required.");
    }

    if (
      typeof status !== "string" ||
      !Object.values(ApplicationStatus).includes(
        status as ApplicationStatus
      )
    ) {
      throw new Error("Invalid application status.");
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status as ApplicationStatus,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/applications");

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update application status:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "Failed to update application status."
      ),
    };
  }
}

// DELETE APPLICATION
export async function adminDeleteApplication(
  applicationId: string
): Promise<FormState> {
  try {
    await requireAdmin();

    if (!applicationId?.trim()) {
      throw new Error("A valid application ID is required.");
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/applications");

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to delete application:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "Failed to delete application."
      ),
    };
  }
}

/* ============================================================================
   4. DYNAMIC CANDIDATE SEARCH
   ============================================================================ */

// GET JOB TITLES FROM DATABASE
export async function adminGetJobTitles(): Promise<
  ActionResult<string[]>
> {
  try {
    await requireAdmin();

    const jobs = await prisma.jobPosting.findMany({
      select: { title: true },
      distinct: ["title"],
      orderBy: { title: "asc" },
    });

    return {
      success: true,
      data: jobs.map((job) => job.title),
    };
  } catch (error) {
    console.error("Failed to fetch job titles:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to fetch job titles."),
    };
  }
}

// SEARCH CANDIDATES BY NAME, EXPERIENCE, AND JOB TITLE
export async function adminSearchCandidates(
  filters: CandidateSearchFilters
) {
  try {
    await requireAdmin();

    const search =
      typeof filters?.search === "string"
        ? filters.search.trim()
        : "";

    const minExperience = nonNegativeInteger(
      filters?.minExperience ?? 0,
      "Minimum experience"
    );

    const jobTitle =
      typeof filters?.jobTitle === "string" &&
      filters.jobTitle.trim()
        ? filters.jobTitle.trim()
        : "ALL";

    const candidates = await prisma.candidate.findMany({
      where: {
        ...(search && {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        }),

        ...(minExperience > 0 && {
          yearsOfExperience: {
            gte: minExperience,
          },
        }),

        ...(jobTitle !== "ALL" && {
          applications: {
            some: {
              job: {
                title: jobTitle,
              },
            },
          },
        }),
      },

      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                departments: true,
              },
            },
            scoreResult: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },

      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return {
      success: true as const,
      data: candidates,
    };
  } catch (error) {
    console.error("Failed to search candidates:", error);

    return {
      success: false as const,
      error: getErrorMessage(
        error,
        "Failed to retrieve candidates."
      ),
    };
  }
}
/* ============================================================================
   5. COMPETENCY TEST MANAGEMENT
   ============================================================================ */

// CREATE A COMPETENCY TEST AND CONNECT IT TO SELECTED JOB POSTINGS.
// Tests start as DRAFT. Applicants are assigned manually by an admin
// after the test is published.
export async function createCompetencyTest(data: {
  title: string;
  description: string;
  duration: number;
  jobIds: string[];
}): Promise<ActionResult<undefined>> {
  try {
    await requireAdmin();

    const title = data.title?.trim();
    const description = data.description?.trim() ?? "";
    const duration = Number(data.duration);
    const jobIds = [
      ...new Set(
        (Array.isArray(data.jobIds) ? data.jobIds : [])
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ];

    if (!title) {
      throw new Error("Test title is required.");
    }

    if (!Number.isInteger(duration) || duration < 1) {
      throw new Error("Duration must be a positive whole number.");
    }

    if (jobIds.length === 0) {
      throw new Error("Connect this test to at least one job posting.");
    }

    const matchingJobs = await prisma.jobPosting.findMany({
      where: { id: { in: jobIds } },
      select: { id: true },
    });

    if (matchingJobs.length !== jobIds.length) {
      throw new Error("One or more selected job postings could not be found.");
    }

    await prisma.competencyTest.create({
      data: {
        title,
        description: description || null,
        duration,
        status: CompetencyTestStatus.DRAFT,
        jobs: {
          connect: jobIds.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/admin/competency-test");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to create competency test:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to create competency test."),
    };
  }
}


// UPDATE TEST DETAILS, STATUS, AND CONNECTED JOB POSTINGS.
// The `jobs` relation is replaced with the selected job IDs.
export async function updateCompetencyTest(data: {
  id: string;
  title: string;
  description: string;
  duration: number;
  status: CompetencyTestStatus;
  jobIds: string[];
}): Promise<ActionResult<undefined>> {
  try {
    await requireAdmin();

    const id = data.id?.trim();
    const title = data.title?.trim();
    const description = data.description?.trim() ?? "";
    const jobIds = [
      ...new Set(
        (Array.isArray(data.jobIds) ? data.jobIds : [])
          .filter((jobId): jobId is string => typeof jobId === "string")
          .map((jobId) => jobId.trim())
          .filter(Boolean)
      ),
    ];

    if (!id) {
      throw new Error("Test ID is required.");
    }

    if (!title) {
      throw new Error("Test title is required.");
    }

    if (!Number.isInteger(data.duration) || data.duration < 1) {
      throw new Error("Duration must be a positive whole number.");
    }

    if (!Object.values(CompetencyTestStatus).includes(data.status)) {
      throw new Error("Invalid test status.");
    }

    if (jobIds.length === 0) {
      throw new Error("Connect this test to at least one job posting.");
    }

    const existingTest = await prisma.competencyTest.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingTest) {
      throw new Error("Competency test not found.");
    }

    const matchingJobs = await prisma.jobPosting.findMany({
      where: { id: { in: jobIds } },
      select: { id: true },
    });

    if (matchingJobs.length !== jobIds.length) {
      throw new Error("One or more selected job postings could not be found.");
    }

    await prisma.competencyTest.update({
      where: { id },
      data: {
        title,
        description: description || null,
        duration: data.duration,
        status: data.status,
        jobs: {
          set: jobIds.map((jobId) => ({ id: jobId })),
        },
      },
    });

    revalidatePath("/admin/competency-test");
    revalidatePath(`/admin/competency-test/${id}`);
    revalidatePath("/jobs");

    return { success: true };
  } catch (error) {
    console.error("Failed to update competency test:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to update competency test."),
    };
  }
}

/* ============================================================================
   6. APPLICATION SCORING
   ============================================================================ */

// UPDATE OR CREATE THE MANUAL TECHNICAL / BEHAVIORAL SCORE.
export async function updateApplicationScore(
  applicationId: string,
  fieldName: "technicalScore" | "behavioralScore",
  value: number | null
): Promise<ActionResult<undefined>> {
  try {
    await requireAdmin();

    if (!applicationId?.trim()) {
      throw new Error("A valid application ID is required.");
    }

    if (
      fieldName !== "technicalScore" &&
      fieldName !== "behavioralScore"
    ) {
      throw new Error("Invalid score field.");
    }

    if (
      value !== null &&
      (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100
      )
    ) {
      throw new Error("Score must be between 0 and 100.");
    }

    const scoreField =
      fieldName === "technicalScore"
        ? { technicalScore: value }
        : { behavioralScore: value };

    await prisma.scoreResult.upsert({
      where: { applicationId },

      update: scoreField,

      create: {
        applicationId,
        ...scoreField,
        matchRating: MatchRating.MEDIUM,
        skillsMatched: [],
        missingSkills: [],
        summary:
          "Manual profile metrics initialized by reviewer.",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/applications");

    return { success: true };
  } catch (error) {
    console.error("Failed to update application score:", error);

    return {
      success: false,
      error: getErrorMessage(
        error,
        "Failed to update application score."
      ),
    };
  }
}


/* ============================================================================
   7. TEST QUESTION MANAGEMENT
   ============================================================================ */

// CREATE A QUESTION AND ITS ANSWER OPTIONS.
export async function createTestQuestion(data: {
  testId: string;
  question: string;
  type: QuestionType;
  points: number;
  options?: {
    text: string;
    isCorrect: boolean;
  }[];
}): Promise<ActionResult<undefined>> {
  try {
    await requireAdmin();

    const question = data.question.trim();

    if (!data.testId.trim()) {
      throw new Error("Test ID is required.");
    }

    if (!question) {
      throw new Error("Question text is required.");
    }

    if (!Object.values(QuestionType).includes(data.type)) {
      throw new Error("Invalid question type.");
    }

    if (!Number.isFinite(data.points) || data.points <= 0) {
      throw new Error("Points must be greater than zero.");
    }

    const options = data.options ?? [];

    if (
      data.type === QuestionType.MULTIPLE_CHOICE &&
      (options.length < 2 || options.filter(o => o.isCorrect).length !== 1)
    ) {
      throw new Error(
        "Multiple-choice questions need at least two options and exactly one correct answer."
      );
    }

    if (
      data.type === QuestionType.TRUE_FALSE &&
      (options.length !== 2 || options.filter(o => o.isCorrect).length !== 1)
    ) {
      throw new Error("True/False questions need exactly two options and one correct answer.");
    }

    if (
      data.type === QuestionType.SHORT_ANSWER ||
      data.type === QuestionType.ESSAY
    ) {
      if (options.length > 0) {
        throw new Error("Written questions cannot have answer options.");
      }
    }

    if (
      options.some(o => !o.text.trim()) ||
      options.some(o => typeof o.isCorrect !== "boolean")
    ) {
      throw new Error("All options must have valid text and a correct-answer value.");
    }

    const test = await prisma.competencyTest.findUnique({
      where: { id: data.testId },
      select: { id: true },
    });

    if (!test) {
      throw new Error("Competency test not found.");
    }

    const lastQuestion = await prisma.testQuestion.findFirst({
      where: { testId: data.testId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastQuestion?.order ?? 0) + 1;

    await prisma.testQuestion.create({
      data: {
        testId: data.testId,
        question,
        type: data.type,
        points: data.points,
        order: nextOrder,
        options: {
          create: options.map(option => ({
            text: option.text.trim(),
            isCorrect: option.isCorrect,
          })),
        },
      },
    });

    revalidatePath(`/admin/competency-test/${data.testId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to create test question:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to create question."),
    };
  }
}


// DELETE A QUESTION ONLY WHEN THE TEST HAS NO ASSIGNMENTS.
export async function deleteTestQuestion(
  questionId: string
): Promise<ActionResult<undefined>> {
  try {
    await requireAdmin();

    if (!questionId?.trim()) {
      throw new Error("A valid question ID is required.");
    }

    const question = await prisma.testQuestion.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        testId: true,
      },
    });

    if (!question) {
      throw new Error("Question not found.");
    }

    // Prevent modifying tests that already have assignments.
    const assignmentCount = await prisma.testAssignment.count({
      where: { testId: question.testId },
    });

    if (assignmentCount > 0) {
      throw new Error(
        "Questions cannot be deleted after applicants have been assigned to this test."
      );
    }

    await prisma.testQuestion.delete({
      where: { id: questionId },
    });

    revalidatePath(`/admin/competency-test/${question.testId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete question:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to delete question."),
    };
  }
}


// DELETE A TEST ONLY WHEN IT HAS NO APPLICANT ASSIGNMENTS.
export async function deleteCompetencyTest(
  testId: string
): Promise<ActionResult<undefined>> {
  try {
    await requireAdmin();

    if (!testId?.trim()) {
      throw new Error("A valid test ID is required.");
    }

    const test = await prisma.competencyTest.findUnique({
      where: { id: testId },
      select: { id: true },
    });

    if (!test) {
      throw new Error("Competency test not found.");
    }

    const assignmentCount = await prisma.testAssignment.count({
      where: { testId },
    });

    if (assignmentCount > 0) {
      throw new Error(
        "This test cannot be deleted because applicants have already been assigned to it. Archive it instead."
      );
    }

    await prisma.competencyTest.delete({
      where: { id: testId },
    });

    revalidatePath("/admin/competency-test");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete competency test:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Failed to delete competency test."),
    };
  }
}
/* ============================================================================
   8. MANUAL COMPETENCY TEST ASSIGNMENT
   ============================================================================ */

interface AssignTestInput {
  testId: string;
  applicationIds: string[];
}

// Return only applicants who applied for a job connected to this test.
// The test must already be published, and existing assignments are excluded.
export async function getEligibleApplicants(testId: string) {
  await requireAdmin();

  const validTestId =
    typeof testId === "string" ? testId.trim() : "";

  if (!validTestId) {
    throw new Error("A valid competency test ID is required.");
  }

  const test = await prisma.competencyTest.findUnique({
    where: { id: validTestId },
    select: {
      id: true,
      status: true,
      jobs: {
        select: { id: true },
      },
    },
  });

  if (!test) {
    throw new Error("Competency test not found.");
  }

  if (test.status !== CompetencyTestStatus.PUBLISHED) {
    throw new Error("Only published tests can be assigned.");
  }

  const jobIds = test.jobs.map((job) => job.id);

  if (jobIds.length === 0) {
    return [];
  }

  return prisma.application.findMany({
    where: {
      jobId: { in: jobIds },
      testAssignments: {
        none: {
          testId: validTestId,
        },
      },
    },
    select: {
      id: true,
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Assign a published test to selected applications.
// Eligibility is checked again inside the transaction so that a client
// cannot submit application IDs belonging to unrelated job postings.
export async function assignCompetencyTest(input: AssignTestInput) {
  try {
    await requireAdmin();

    const testId =
      typeof input?.testId === "string" ? input.testId.trim() : "";

    if (!testId) {
      throw new Error("A valid competency test ID is required.");
    }

    if (
      !Array.isArray(input?.applicationIds) ||
      input.applicationIds.length === 0
    ) {
      throw new Error("Select at least one applicant.");
    }

    const applicationIds = [
      ...new Set(
        input.applicationIds
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ];

    if (applicationIds.length === 0) {
      throw new Error("Select at least one valid applicant.");
    }

    if (applicationIds.length !== input.applicationIds.length) {
      throw new Error("The selected applicant list contains invalid entries.");
    }

    await prisma.$transaction(async (tx) => {
      const test = await tx.competencyTest.findUnique({
        where: { id: testId },
        select: {
          id: true,
          status: true,
          jobs: {
            select: { id: true },
          },
        },
      });

      if (!test) {
        throw new Error("Competency test not found.");
      }

      if (test.status !== CompetencyTestStatus.PUBLISHED) {
        throw new Error("Only published tests can be assigned.");
      }

      const jobIds = test.jobs.map((job) => job.id);

      if (jobIds.length === 0) {
        throw new Error("No job postings are connected to this test.");
      }

      const eligibleApplications = await tx.application.findMany({
        where: {
          id: { in: applicationIds },
          jobId: { in: jobIds },
          testAssignments: {
            none: { testId },
          },
        },
        select: { id: true },
      });

      if (eligibleApplications.length !== applicationIds.length) {
        throw new Error(
          "One or more selected applicants are not eligible or have already been assigned."
        );
      }

      const result = await tx.testAssignment.createMany({
        data: eligibleApplications.map((application) => ({
          testId,
          applicationId: application.id,
        })),
        skipDuplicates: true,
      });

      if (result.count !== eligibleApplications.length) {
        throw new Error(
          "Some assignments could not be created. Refresh the page and try again."
        );
      }
    });

    revalidatePath("/admin/competency-test");
    revalidatePath(`/admin/competency-test/${testId}`);
    revalidatePath("/admin/applications");

    return {
      success: true,
      message: "Competency test assigned successfully.",
    };
  } catch (error) {
    console.error("Failed to assign competency test:", error);

    return {
      success: false,
      message: getErrorMessage(
        error,
        "Failed to assign competency test."
      ),
    };
  }
}



/* User management*/


type UserRole = "ADMIN" | "APPLICANT";
type UserStatus = "ACTIVE" | "INACTIVE";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized. Administrator access required.");
  }

  return session.user;
}

export async function updateUserRole(
  userId: string,
  role: UserRole
) {
  try {
    const admin = await requireAdmin();

    if (!userId || !["ADMIN", "APPLICANT"].includes(role)) {
      return { success: false, message: "Invalid user or role." };
    }

    if (userId === admin.id) {
      return {
        success: false,
        message: "You cannot change your own administrator role.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, status: true },
      });

      if (!target) throw new Error("User not found.");

      if (
        target.role === "ADMIN" &&
        target.status === "ACTIVE" &&
        role !== "ADMIN"
      ) {
        const activeAdmins = await tx.user.count({
          where: { role: "ADMIN", status: "ACTIVE" },
        });

        if (activeAdmins <= 1) {
          throw new Error("You cannot demote the last active administrator.");
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: { role },
      });
    });

    revalidatePath("/admin/users");

    return { success: true, message: "User role updated successfully." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update user role.",
    };
  }
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus
) {
  try {
    const admin = await requireAdmin();

    if (!userId || !["ACTIVE", "INACTIVE"].includes(status)) {
      return { success: false, message: "Invalid user or status." };
    }

    if (userId === admin.id) {
      return {
        success: false,
        message: "You cannot deactivate your own account.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, status: true },
      });

      if (!target) throw new Error("User not found.");

      if (
        target.role === "ADMIN" &&
        target.status === "ACTIVE" &&
        status === "INACTIVE"
      ) {
        const activeAdmins = await tx.user.count({
          where: { role: "ADMIN", status: "ACTIVE" },
        });

        if (activeAdmins <= 1) {
          throw new Error("You cannot deactivate the last active administrator.");
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: { status },
      });
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message:
        status === "ACTIVE"
          ? "User account activated successfully."
          : "User account deactivated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update account status.",
    };
  }
}
