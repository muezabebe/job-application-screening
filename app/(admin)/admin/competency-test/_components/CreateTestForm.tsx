
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCompetencyTest } from "@/app/actions/adminActions";

export function CreateTestForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createCompetencyTest({
        title,
        description,
        duration: Number(duration),
      });

      if (!result.success) {
        setError(result.error || "Unable to create test.");
        return;
      }

      setTitle("");
      setDescription("");
      setDuration("60");

      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Test"}
      </button>
    </form>
  );
}
