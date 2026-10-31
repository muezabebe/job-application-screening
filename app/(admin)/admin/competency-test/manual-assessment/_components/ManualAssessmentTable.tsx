
"use client";

import { useState, useTransition } from "react";
import { updateApplicationScore } from "@/app/actions/adminActions";

interface ManualAssessmentTableProps {
  applications: any[];
}

export function ManualAssessmentTable({
  applications,
}: ManualAssessmentTableProps) {
  const [rows, setRows] = useState(applications);
  const [isPending, startTransition] = useTransition();

  const handleScoreChange = (
    applicationId: string,
    field: "technicalScore" | "behavioralScore",
    value: number | null
  ) => {
    if (
      value !== null &&
      (!Number.isFinite(value) || value < 0 || value > 100)
    ) {
      return;
    }

    startTransition(async () => {
      const result = await updateApplicationScore(
        applicationId,
        field,
        value
      );

      if (!result.success) {
        alert(result.error);
        return;
      }

      setRows((currentRows) =>
        currentRows.map((app) => {
          if (app.id !== applicationId) return app;

          return {
            ...app,
            scoreResult: {
              ...(app.scoreResult ?? {}),
              [field]: value,
            },
          };
        })
      );
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3">Candidate</th>
            <th className="px-4 py-3">Job Position</th>
            <th className="px-4 py-3">Technical</th>
            <th className="px-4 py-3">Behavioral</th>
            <th className="px-4 py-3">Overall</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100">
          {rows.map((app) => {
            const technical = app.scoreResult?.technicalScore ?? null;
            const behavioral = app.scoreResult?.behavioralScore ?? null;

            const overall =
              technical !== null && behavioral !== null
                ? Math.round((technical + behavioral) / 2)
                : null;

            return (
              <tr key={app.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">
                    {app.candidate.fullName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {app.candidate.email}
                  </p>
                </td>

                <td className="px-4 py-3 text-zinc-600">
                  {app.job.title}
                </td>

                <td className="px-4 py-3">
                  <ScoreInput
                    value={technical}
                    disabled={isPending}
                    onSave={(value) =>
                      handleScoreChange(app.id, "technicalScore", value)
                    }
                  />
                </td>

                <td className="px-4 py-3">
                  <ScoreInput
                    value={behavioral}
                    disabled={isPending}
                    onSave={(value) =>
                      handleScoreChange(app.id, "behavioralScore", value)
                    }
                  />
                </td>

                <td className="px-4 py-3 font-semibold text-zinc-900">
                  {overall !== null ? `${overall}/100` : "—"}
                </td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                No applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ScoreInput({
  value,
  disabled,
  onSave,
}: {
  value: number | null;
  disabled: boolean;
  onSave: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState(value?.toString() ?? "");

  return (
    <input
      type="number"
      min="0"
      max="100"
      value={draft}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft.trim() === "") {
          onSave(null);
          return;
        }

        const parsed = Number(draft);

        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
          onSave(parsed);
        } else {
          setDraft(value?.toString() ?? "");
        }
      }}
      className="w-20 rounded-md border border-zinc-300 px-2 py-1 outline-none focus:border-blue-500"
      placeholder="0–100"
    />
  );
}
