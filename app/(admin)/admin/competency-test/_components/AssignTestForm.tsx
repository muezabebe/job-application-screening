"use client";

import { useEffect, useState } from "react";
import {
  assignCompetencyTest,
  getEligibleApplicants,
} from "@/app/actions/adminActions";

interface Applicant {
  id: string;
  candidate: {
    id: string;
    fullName: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
  };
}

interface AssignTestFormProps {
  testId: string;
}

export default function AssignTestForm({
  testId,
}: AssignTestFormProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load eligible applicants when the component mounts.
  useEffect(() => {
    let isMounted = true;

    async function loadApplicants() {
      setIsLoading(true);
      setMessage("");
      setMessageType("");

      try {
        const result = await getEligibleApplicants(testId);

        if (isMounted) {
          setApplicants(result);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Failed to load applicants."
          );
          setMessageType("error");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadApplicants();

    return () => {
      isMounted = false;
    };
  }, [testId]);

  // Select or deselect an applicant.
  function toggleApplicant(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  // Assign the test to selected applicants.
  async function handleAssign() {
    if (selectedIds.length === 0) return;

    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const result = await assignCompetencyTest({
        testId,
        applicationIds: selectedIds,
      });

      setMessage(result.message);
      setMessageType(result.success ? "success" : "error");

      if (result.success) {
        setSelectedIds([]);

        // Refresh the list because assigned applicants
        // should no longer appear as eligible.
        const updatedApplicants = await getEligibleApplicants(testId);
        setApplicants(updatedApplicants);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while assigning the test."
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          Assign Competency Test
        </h2>

        <p className="text-sm text-zinc-500">
          Select applicants from job postings connected to this test.
        </p>
      </div>

      {/* Feedback message */}
      {message && (
        <p
          className={`rounded-lg p-3 text-sm ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      {/* Loading state */}
      {isLoading ? (
        <p className="py-4 text-sm text-zinc-500">
          Loading eligible applicants...
        </p>
      ) : applicants.length === 0 ? (
        <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">
          No eligible applicants are currently available.
        </p>
      ) : (
        <>
          {/* Applicant count */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700">
              Eligible Applicants
            </p>

            <span className="text-sm text-zinc-500">
              {applicants.length} available
            </span>
          </div>

          {/* Applicant list */}
          <div className="max-h-80 divide-y divide-zinc-100 overflow-y-auto rounded-lg border border-zinc-100 px-3">
            {applicants.map((applicant) => (
              <label
                key={applicant.id}
                className="flex cursor-pointer items-start gap-3 py-3"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(applicant.id)}
                  onChange={() => toggleApplicant(applicant.id)}
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">
                    {applicant.candidate.fullName}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {applicant.candidate.email}
                  </p>

                  <p className="mt-1 text-xs font-medium text-blue-600">
                    {applicant.job.title}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </>
      )}

      {/* Assign button */}
      <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
        <p className="text-sm text-zinc-500">
          {selectedIds.length} applicant(s) selected
        </p>

        <button
          type="button"
          disabled={
            isLoading ||
            isSubmitting ||
            selectedIds.length === 0
          }
          onClick={handleAssign}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Assigning..."
            : `Assign Test (${selectedIds.length})`}
        </button>
      </div>
    </div>
  );
}