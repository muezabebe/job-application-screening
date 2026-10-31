
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  adminUpdateApplicationStatus,
  adminDeleteApplication,
} from "@/app/actions/adminActions";
import { ApplicationStatus } from "@prisma/client";
import { AdminSearchComponent } from "./Search";
import { getStatusBadgeStyle } from "../utils/StatusBadge";
import { ApplicationRow } from "./ApplicationRow";

interface ApplicationWithDetails {
  id: string;
  status: string;
  yearsOfExperience?: number | null;
  createdAt: string | Date;
  candidate: {
    fullName: string;
    email: string;
    yearsOfExperience?: number | null;
  };
  job: {
    title: string;
  };
  scoreResult?: {
    technicalScore?: number | null;
    behavioralScore?: number | null;
  } | null;
}

interface ApplicationsTableProps {
  applications: ApplicationWithDetails[];
}

export function ApplicationsTable({
  applications: initialApplications,
}: ApplicationsTableProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [searchCandidate, setSearchCandidate] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("ALL");
  const [minExperience, setMinExperience] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const handleStatusChange = (
    applicationId: string,
    newStatus: string
  ) => {
    if (
      !Object.values(ApplicationStatus).includes(
        newStatus as ApplicationStatus
      )
    ) {
      alert("Invalid application status.");
      return;
    }

    startTransition(async () => {
      const result = await adminUpdateApplicationStatus(
        applicationId,
        newStatus as ApplicationStatus
      );

      if (result?.success) {
        setApplications((previous) =>
          previous.map((app) =>
            app.id === applicationId
              ? { ...app, status: newStatus }
              : app
          )
        );
      } else {
        alert(result?.error ?? "Failed to update status.");
      }
    });
  };

  const handleDeleteApplication = (applicationId: string) => {
    if (
      !confirm("Are you sure you want to delete this application?")
    ) return;

    startTransition(async () => {
      const result = await adminDeleteApplication(applicationId);

      if (result?.success) {
        setApplications((previous) =>
          previous.filter((app) => app.id !== applicationId)
        );
      } else {
        alert(result?.error ?? "Failed to delete application.");
      }
    });
  };

  const availableJobTitles = useMemo(() => {
    return [
      ...new Set(
        applications
          .map((app) => app.job?.title)
          .filter((title): title is string => Boolean(title))
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = searchCandidate.trim().toLowerCase();

    return applications
      .filter((app) => {
        const name = app.candidate?.fullName?.toLowerCase() ?? "";
        const email = app.candidate?.email?.toLowerCase() ?? "";

        const experience =
          app.yearsOfExperience ??
          app.candidate?.yearsOfExperience ??
          0;

        const matchesSearch =
          !query || name.includes(query) || email.includes(query);

        const matchesJob =
          selectedJobTitle === "ALL" ||
          app.job?.title === selectedJobTitle;

        return (
          matchesSearch &&
          matchesJob &&
          experience >= minExperience
        );
      })
      .sort((a, b) => {
        const experienceA =
          a.yearsOfExperience ??
          a.candidate?.yearsOfExperience ??
          0;

        const experienceB =
          b.yearsOfExperience ??
          b.candidate?.yearsOfExperience ??
          0;

        return experienceB - experienceA;
      });
  }, [
    applications,
    searchCandidate,
    selectedJobTitle,
    minExperience,
  ]);

  return (
    <div className="space-y-4">
      <AdminSearchComponent
        searchCandidate={searchCandidate}
        setSearchCandidate={setSearchCandidate}
        minExperience={minExperience}
        setMinExperience={setMinExperience}
        selectedJobTitle={selectedJobTitle}
        setSelectedJobTitle={setSelectedJobTitle}
        availableJobTitles={availableJobTitles}
        resultCount={filteredApplications.length}
        totalCount={applications.length}
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="p-4">Candidate</th>
                <th className="p-4">Job Position</th>
                <th className="p-4">Experience</th>
                <th className="p-4 text-center">Overall Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-600">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center italic text-zinc-400"
                  >
                    No applications match your filters.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <ApplicationRow
                    key={app.id}
                    app={app}
                    isPending={isPending}
                    getStatusBadgeStyle={getStatusBadgeStyle}
                    handleStatusChange={handleStatusChange}
                    handleDeleteApplication={handleDeleteApplication}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-zinc-200 px-4 py-3 text-xs text-zinc-500">
          Showing {filteredApplications.length} of {applications.length} applications
          {isPending && " · Saving changes..."}
        </div>
      </div>
    </div>
  );
}
