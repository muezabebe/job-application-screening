
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QuestionType } from "@prisma/client";
import { createTestQuestion } from "@/app/actions/adminActions";

interface Props {
  testId: string;
}

interface Option {
  text: string;
  isCorrect: boolean;
}

export default function CreateQuestionForm({ testId }: Props) {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [type, setType] = useState<QuestionType>(
    QuestionType.MULTIPLE_CHOICE
  );
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState<Option[]>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ]);

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isObjective =
    type === QuestionType.MULTIPLE_CHOICE ||
    type === QuestionType.TRUE_FALSE;

  function changeType(value: QuestionType) {
    setType(value);

    if (value === QuestionType.TRUE_FALSE) {
      setOptions([
        { text: "True", isCorrect: true },
        { text: "False", isCorrect: false },
      ]);
    } else if (value === QuestionType.MULTIPLE_CHOICE) {
      setOptions([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ]);
    } else {
      setOptions([]);
    }
  }

  function addOption() {
    setOptions([...options, { text: "", isCorrect: false }]);
  }

  function updateOption(index: number, value: string) {
    setOptions(prev =>
      prev.map((option, i) =>
        i === index ? { ...option, text: value } : option
      )
    );
  }

  function setCorrectOption(index: number) {
    setOptions(prev =>
      prev.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      }))
    );
  }

  function submitQuestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createTestQuestion({
        testId,
        question,
        type,
        points,
        options,
      });

      if (!result.success) {
        setError(result.error || "Unable to save question.");
        return;
      }

      setQuestion("");
      setPoints(1);
      setOptions(
        type === QuestionType.MULTIPLE_CHOICE
          ? [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
            ]
          : type === QuestionType.TRUE_FALSE
            ? [
                { text: "True", isCorrect: true },
                { text: "False", isCorrect: false },
              ]
            : []
      );

      router.refresh();
    });
  }

  return (
    <form onSubmit={submitQuestion} className="space-y-5 rounded-xl border bg-white p-5">
      <h2 className="text-lg font-semibold">Add a Question</h2>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Question
        </label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your question..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Question Type
          </label>
          <select
            value={type}
            onChange={e => changeType(e.target.value as QuestionType)}
            className="w-full rounded-lg border p-3"
          >
            <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
            <option value={QuestionType.TRUE_FALSE}>True / False</option>
            <option value={QuestionType.SHORT_ANSWER}>Short Answer</option>
            <option value={QuestionType.ESSAY}>Essay</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Points
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      {isObjective && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Answer Options</h3>

            {type === QuestionType.MULTIPLE_CHOICE && (
              <button
                type="button"
                onClick={addOption}
                className="text-sm font-medium text-blue-600"
              >
                + Add Option
              </button>
            )}
          </div>

          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctOption"
                checked={option.isCorrect}
                onChange={() => setCorrectOption(index)}
                aria-label={`Mark option ${index + 1} as correct`}
              />

              <input
                value={option.text}
                onChange={e => updateOption(index, e.target.value)}
                readOnly={type === QuestionType.TRUE_FALSE}
                required
                placeholder={`Option ${index + 1}`}
                className="flex-1 rounded-lg border p-3"
              />
            </div>
          ))}

          <p className="text-xs text-zinc-500">
            Select the radio button beside the correct answer.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Question"}
      </button>
    </form>
  );
}
