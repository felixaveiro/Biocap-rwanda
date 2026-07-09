"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { can } from "@/lib/permissions";
import { ROLE_LABELS, SessionUser, User } from "@/types";

export default function UserTable({
  users,
  currentUser,
}: {
  users: User[];
  currentUser: SessionUser;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canDelete = can(currentUser.role, "user:delete");
  const canEdit = can(currentUser.role, "user:edit:info");

  async function handleDelete(id: string) {
    if (!confirm("Remove this user? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to remove user");
      return;
    }
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50/60">
              <td className="px-5 py-3 font-medium text-slate-900">{u.name}</td>
              <td className="px-5 py-3 text-slate-600">{u.email}</td>
              <td className="px-5 py-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {ROLE_LABELS[u.role]}
                </span>
              </td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    u.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {u.active ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <div className="flex justify-end gap-3">
                  {canEdit && (
                    <Link href={`/dashboard/users/${u.id}`} className="text-brand-600 hover:underline">
                      Edit
                    </Link>
                  )}
                  {canDelete && u.id !== currentUser.id && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={busyId === u.id}
                      className="text-rose-600 hover:underline disabled:opacity-50"
                    >
                      {busyId === u.id ? "Removing..." : "Remove"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}