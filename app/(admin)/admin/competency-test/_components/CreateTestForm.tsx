
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCompetencyTest } from "@/app/actions/adminActions";

interface JobOption {
  id: string;
  title: string;
  departments: string[];
}

interface CreateTestFormProps {
  jobs: JobOption[];
}

export function CreateTestForm({ jobs }: CreateTestFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleJobSelection(jobId: string) {
    setSelectedJobIds((previous) =>
      previous.includes(jobId)
        ? previous.filter((id) => id !== jobId)
        : [...previous, jobId]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selectedJobIds.length === 0) {
      setError("Please select at least one job posting.");
      return;
    }

    startTransition(async () => {
      const result = await createCompetencyTest({
        title,
        description,
        duration: Number(duration),
        jobIds: selectedJobIds,
      });

      if (!result.success) {
        setError(result.error || "Unable to create test.");
        return;
      }

      setTitle("");
      setDescription("");
      setDuration("60");
      setSelectedJobIds([]);

      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Test Title */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Test Title
        </label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Junior Backend Developer Assessment"
          required
          maxLength={150}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the purpose of this competency test..."
          rows={3}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Duration (minutes)
        </label>

        <input
          type="number"
          min="1"
          step="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Job Postings */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-700">
            Assign to Job Postings
          </label>

          <span className="text-xs text-zinc-500">
            {selectedJobIds.length} selected
          </span>
        </div>

        {jobs.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            No job postings are available. Create a job posting first.
          </p>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3">
            {jobs.map((job) => {
              const selected = selectedJobIds.includes(job.id);

              return (
                <label
                  key={job.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                    selected
                      ? "border-blue-300 bg-blue-50"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleJobSelection(job.id)}
                    className="mt-1 h-4 w-4 accent-blue-600"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800">
                      {job.title}
                    </p>

                    {job.departments.length > 0 && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {job.departments.join(", ")}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || jobs.length === 0}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Test"}
      </button>
    </form>
  );
}
