"use client";

import { useState } from "react";
import Link from "next/link";
import { CreateTestForm } from "./CreateTestForm";
import { DeleteTestButton } from "./DeleteTestButton";

interface CompetencyTestListProps {
  tests: {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    status: string;
    createdAt: Date;
    _count: {
      questions: number;
      assignments: number;
    };
  }[];
}

export function CompetencyTestList({ tests }: CompetencyTestListProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Available Tests
          </h2>
          <p className="text-sm text-zinc-500">
            {tests.length} test{tests.length !== 1 ? "s" : ""} created
          </p>
        </div>

        <button
          onClick={() => setShowForm((current) => !current)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {showForm ? "Close Form" : "+ Create New Test"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-zinc-900">
            Create Competency Test
          </h3>

          <CreateTestForm />
        </div>
      )}

      {/* Test List */}
      {tests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <div className="mb-3 text-3xl">📝</div>

          <h3 className="font-semibold text-zinc-900">
            No competency tests yet
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Create your first test to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-900">{test.title}</h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Created {new Date(test.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
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

              <p className="mb-5 line-clamp-2 min-h-10 text-sm text-zinc-500">
                {test.description || "No description provided."}
              </p>

              <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
                <div>
                  <p className="text-lg font-bold text-zinc-900">
                    {test.duration}
                  </p>
                  <p className="text-[11px] text-zinc-500">Minutes</p>
                </div>

                <div>
                  <p className="text-lg font-bold text-zinc-900">
                    {test._count.questions}
                  </p>
                  <p className="text-[11px] text-zinc-500">Questions</p>
                </div>

                <div>
                  <p className="text-lg font-bold text-zinc-900">
                    {test._count.assignments}
                  </p>
                  <p className="text-[11px] text-zinc-500">Assigned</p>
                </div>
              </div>

              {/* Manage Test */}

              {/* Test Actions */}
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
                <Link
                  href={`/admin/competency-test/${test.id}`}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Manage Test →
                </Link>

                <DeleteTestButton testId={test.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
