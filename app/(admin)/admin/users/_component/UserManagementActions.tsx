
"use client";

import { useState, useTransition } from "react";
import {
  updateUserRole,
  updateUserStatus,
} from "@/app/actions/adminActions";

interface UserManagementActionsProps {
  userId: string;
  currentRole: "ADMIN" | "APPLICANT";
  currentStatus: "ACTIVE" | "INACTIVE";
  isCurrentUser: boolean;
}

export default function UserManagementActions({
  userId,
  currentRole,
  currentStatus,
  isCurrentUser,
}: UserManagementActionsProps) {
  const [role, setRole] = useState(currentRole);
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(nextRole: "ADMIN" | "APPLICANT") {
    setRole(nextRole);
    setMessage("");

    startTransition(async () => {
      const result = await updateUserRole(userId, nextRole);

      if (!result.success) {
        setRole(currentRole);
      }

      setMessage(result.message);
    });
  }

  function handleStatusChange() {
    const nextStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setMessage("");

    startTransition(async () => {
      const result = await updateUserStatus(userId, nextStatus);

      if (result.success) {
        setStatus(nextStatus);
      }

      setMessage(result.message);
    });
  }

  return (
    <div className="flex min-w-40 flex-col items-end gap-2">
      <select
        value={role}
        disabled={isPending || isCurrentUser}
        onChange={(event) =>
          handleRoleChange(event.target.value as "ADMIN" | "APPLICANT")
        }
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="APPLICANT">Applicant</option>
        <option value="ADMIN">Administrator</option>
      </select>

      <button
        type="button"
        disabled={isPending || isCurrentUser}
        onClick={handleStatusChange}
        className={`w-full rounded-lg px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
          status === "ACTIVE"
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {isPending
          ? "Updating..."
          : status === "ACTIVE"
            ? "Deactivate"
            : "Activate"}
      </button>

      {isCurrentUser && (
        <p className="text-xs text-zinc-400">Your account</p>
      )}

      {message && (
        <p className="max-w-48 text-right text-xs text-zinc-500">
          {message}
        </p>
      )}
    </div>
  );
}
