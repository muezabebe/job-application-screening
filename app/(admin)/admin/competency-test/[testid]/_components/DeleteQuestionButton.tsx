"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTestQuestion } from "@/app/actions/adminActions";

interface DeleteQuestionButtonProps {
  questionId: string;
}

export default function DeleteQuestionButton({
  questionId,
}: DeleteQuestionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?",
    );

    if (!confirmed) return;

    setError("");

    startTransition(async () => {
      const result = await deleteTestQuestion(questionId);

      if (!result.success) {
        setError(result.error || "Failed to delete question.");
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
        className="inline-flex items-center justify-center rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 hover:border-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
