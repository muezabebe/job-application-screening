
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import CreateQuestionForm from "./_components/CreateQuestionForm";
import DeleteQuestionButton from "./_components/DeleteQuestionButton";

interface TestDetailsPageProps {
  params: Promise<{
    testid: string;
  }>;
}

export default async function TestDetailsPage({
  params,
}: TestDetailsPageProps) {
  const { testid } = await params;

  if (!testid?.trim()) {
    notFound();
  }

  const test = await prisma.competencyTest.findUnique({
    where: {
      id: testid.trim(),
    },
    include: {
      questions: {
        orderBy: {
          order: "asc",
        },
        include: {
          options: true,
        },
      },
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });

  if (!test) {
    notFound();
  }

  const hasAssignments = test._count.assignments > 0;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Navigation */}
      <Link
        href="/admin/competency-test"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        ← Back to Competency Tests
      </Link>

      {/* Test Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {test.title}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {test.description || "No description provided."}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            test.status === "PUBLISHED"
              ? "bg-green-100 text-green-700"
              : test.status === "ARCHIVED"
              ? "bg-zinc-100 text-zinc-600"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {test.status}
        </span>
      </div>

      {/* Test Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Duration</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">
            {test.duration} minutes
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Questions</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">
            {test.questions.length}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Assignments</p>
          <p className="mt-1 text-xl font-semibold text-zinc-900">
            {test._count.assignments}
          </p>
        </div>
      </div>

      {/* Questions */}
      <section className="rounded-lg border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900">
            Questions
          </h2>

          <span className="text-sm text-zinc-500">
            {test.questions.length} total
          </span>
        </div>

        {test.questions.length === 0 ? (
          <p className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">
            No questions have been added yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {test.questions.map((question) => (
              <div
                key={question.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-200 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">
                    {question.order}. {question.question}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {question.type.replace("_", " ")} ·{" "}
                    {question.points} points
                  </p>

                  {question.options.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {question.options.map((option) => (
                        <li
                          key={option.id}
                          className="text-sm text-zinc-600"
                        >
                          • {option.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {!hasAssignments && (
                  <DeleteQuestionButton questionId={question.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Question */}
      {!hasAssignments ? (
        <CreateQuestionForm testId={test.id} />
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Questions are locked because applicants have already been
            assigned to this test.
          </p>
        </div>
      )}
    </main>
  );
}
