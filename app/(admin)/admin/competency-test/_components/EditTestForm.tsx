
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CompetencyTestStatus } from "@prisma/client";
import { Settings, Pencil, X, Save } from "lucide-react";
import { updateCompetencyTest } from "@/app/actions/adminActions";

interface JobOption {
  id: string;
  title: string;
  departments: string[];
}

interface EditTestFormProps {
  test: {
    id: string;
    title: string;
    description: string | null;
    duration: number;
    status: CompetencyTestStatus;
    jobs: {
      id: string;
    }[];
  };
  jobs: JobOption[];
}

export function EditTestForm({ test, jobs }: EditTestFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: test.title,
    description: test.description ?? "",
    duration: String(test.duration),
    status: test.status,
  });

  const [selectedJobIds, setSelectedJobIds] = useState<string[]>(
    test.jobs.map((job) => job.id)
  );

  function handleJobSelection(jobId: string) {
    setSelectedJobIds((previous) =>
      previous.includes(jobId)
        ? previous.filter((id) => id !== jobId)
        : [...previous, jobId]
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (selectedJobIds.length === 0) {
      setError("Please select at least one job posting.");
      return;
    }

    startTransition(async () => {
      const result = await updateCompetencyTest({
        id: test.id,
        title: formData.title,
        description: formData.description,
        duration: Number(formData.duration),
        status: formData.status,
        jobIds: selectedJobIds,
      });

      if (!result.success) {
        setError(result.error || "Failed to update test.");
        return;
      }

      setSuccess("Test updated successfully.");
      router.refresh();
      setIsOpen(false);
    });
  }

  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm">
      {/* Compact Settings Header */}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-zinc-100 p-2.5 text-zinc-700">
            <Settings size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-zinc-900">
              Test Settings
            </h2>

            <p className="text-sm text-zinc-500">
              Manage test information, job assignments and publication settings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setError("");
            setSuccess("");
          }}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            isOpen
              ? "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isOpen ? <X size={16} /> : <Pencil size={16} />}
          {isOpen ? "Close Settings" : "Edit Settings"}
        </button>
      </div>

      {/* Expandable Settings Form */}
      {isOpen && (
        <div className="border-t border-zinc-200 bg-zinc-50/70 p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Test Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                Test Title
              </label>

              <input
                id="title"
                required
                maxLength={150}
                value={formData.title}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    title: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    description: event.target.value,
                  })
                }
                className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Duration and Status */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="duration"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Duration (minutes)
                </label>

                <input
                  id="duration"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={formData.duration}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      duration: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-zinc-700"
                >
                  Publication Status
                </label>

                <select
                  id="status"
                  value={formData.status}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      status: event.target.value as CompetencyTestStatus,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Job Postings */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-700">
                  Assigned Job Postings
                </label>

                <span className="text-xs text-zinc-500">
                  {selectedJobIds.length} selected
                </span>
              </div>

              {jobs.length === 0 ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  No job postings are available.
                </p>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3">
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

              <p className="mt-2 text-xs text-zinc-500">
                Applicants who apply for these jobs will receive this test.
              </p>
            </div>

            {/* Error and Success */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-zinc-200 pt-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending || jobs.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
