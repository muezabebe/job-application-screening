
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCompetencyTest } from "@/app/actions/adminActions";

interface DeleteTestButtonProps {
  testId: string;
}

export function DeleteTestButton({ testId }: DeleteTestButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this competency test? This action cannot be undone."
    );

    if (!confirmed) return;

    setError("");

    startTransition(async () => {
      const result = await deleteCompetencyTest(testId);

      if (!result.success) {
        setError(result.error || "Failed to delete test.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete Test"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
