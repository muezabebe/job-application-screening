
"use client";

interface ApplicationRowProps {
  app: any;
  isPending: boolean;
  getStatusBadgeStyle: (status: string) => string;
  handleStatusChange: (id: string, status: string) => void;
  handleDeleteApplication: (id: string) => void;
}

export function ApplicationRow({
  app,
  isPending,
  getStatusBadgeStyle,
  handleStatusChange,
  handleDeleteApplication,
}: ApplicationRowProps) {
  const experience =
    app.yearsOfExperience ??
    app.candidate?.yearsOfExperience ??
    0;

  const tech = app.scoreResult?.technicalScore;
  const behav = app.scoreResult?.behavioralScore;

  const overall =
    tech != null && behav != null
      ? Math.round((tech + behav) / 2)
      : null;

  return (
    <tr className="transition-colors hover:bg-zinc-50/50">
      <td className="p-3.5">
        <div className="font-semibold text-zinc-900">
          {app.candidate?.fullName ?? "Unknown candidate"}
        </div>
        <div className="text-[11px] text-zinc-500">
          {app.candidate?.email ?? "No email"}
        </div>
      </td>

      <td className="p-3.5 font-medium text-zinc-800">
        {app.job?.title ?? "Unknown position"}
      </td>

      <td className="p-3.5">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
          {experience} {experience === 1 ? "yr" : "yrs"}
        </span>
      </td>

      <td className="p-3.5 text-center">
        {overall !== null ? (
          <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-mono font-bold text-indigo-700">
            {overall}/100
          </span>
        ) : (
          <span className="text-zinc-400">Not assessed</span>
        )}
      </td>

      <td className="p-3.5">
        <select
          aria-label={`Application status for ${app.candidate?.fullName ?? "candidate"}`}
          disabled={isPending}
          value={app.status}
          onChange={(event) =>
            handleStatusChange(app.id, event.target.value)
          }
          className={`cursor-pointer rounded-lg border p-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${getStatusBadgeStyle(app.status)}`}
        >
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="SCREENED">SCREENED</option>
          <option value="SHORTLISTED">SHORTLISTED</option>
          <option value="INTERVIEWING">CALL FOR INTERVIEW</option>
          <option value="HIRED">HIRED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="RESERVE_1">RESERVE 1</option>
          <option value="RESERVE_2">RESERVE 2</option>
          <option value="RESERVE_3">RESERVE 3</option>
        </select>
      </td>

      <td className="p-3.5 text-zinc-500">
        {app.createdAt
          ? new Date(app.createdAt).toLocaleDateString()
          : "N/A"}
      </td>

      <td className="p-3.5 text-right">
        <button
          type="button"
          onClick={() => handleDeleteApplication(app.id)}
          disabled={isPending}
          className="text-xs font-medium text-rose-600 hover:text-rose-800 disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
