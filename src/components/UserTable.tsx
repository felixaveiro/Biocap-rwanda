"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, AlertCircle, Users as UsersIcon } from "lucide-react";
import { can } from "@/lib/permissions";
import { usersApi } from "@/lib/api/users";
import { ROLE_LABELS, User, Role } from "@/types";

// Deterministic accent per user derived from their ID
const AVATAR_PALETTE = [
  { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
  { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-100" },
  { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
];

function avatarStyle(id: string = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initials(name: string = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function UserTable({
  users,
  currentUser,
}: {
  users: User[];
  currentUser: User;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userRole = currentUser.role as Role;
  const canDelete = can(userRole, "user:delete");
  const canEdit = can(userRole, "user:edit:info");

  async function handleDelete(targetId: string) {
    if (!targetId || targetId.startsWith("user-")) {
      setError("Cannot delete user: Missing or invalid MongoDB ID (_id).");
      return;
    }

    if (!confirm("Remove this user? This cannot be undone.")) return;

    setBusyId(targetId);
    setError(null);

    try {
      await usersApi.deleteUser(targetId);
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove user";
      setError(errorMessage);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
      {error && (
        <div className="flex items-center gap-2 border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-700">
          <AlertCircle size={15} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <UsersIcon size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">No users found</p>
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Name
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Email
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Role
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u, index) => {
              // Extract original MongoDB string ID directly
              const mongoId = u._id || (u as unknown as { id?: string }).id || "";
              const keyId = mongoId || `user-${index}`;

              const fullName =
                `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                u.username ||
                "User";

              const currentMongoId =
                currentUser._id || (currentUser as unknown as { id?: string }).id;
              const isSelf = mongoId === currentMongoId;

              const avatar = avatarStyle(keyId);

              const userExt = u as unknown as {
                isApproved?: boolean;
                isActive?: boolean;
              };
              const isActive =
                userExt.isApproved !== false && userExt.isActive !== false;

              return (
                <tr
                  key={keyId}
                  className="group transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${avatar.bg} ${avatar.text} ${avatar.ring}`}
                      >
                        {initials(fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-slate-900">
                            {fullName}
                          </span>
                          {isSelf && (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                      {ROLE_LABELS[u.role as Role] || u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {isActive ? "Active" : "Pending / Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      {canEdit && mongoId && (
                        <Link
                          href={`/dashboard/users/${mongoId}`}
                          aria-label={`Edit ${fullName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Pencil size={15} />
                        </Link>
                      )}
                      {canDelete && !isSelf && mongoId && (
                        <button
                          onClick={() => handleDelete(mongoId)}
                          disabled={busyId === mongoId}
                          aria-label={`Remove ${fullName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}