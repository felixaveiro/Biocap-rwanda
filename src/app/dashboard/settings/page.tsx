'use client';

import Header from "@/components/Header";
import { ROLE_LABELS, Role } from "@/types";
import { useSession } from "@/hooks/useSession";

export default function SettingsPage() {
  const { user, loading, allowed } = useSession();

  if (loading || !allowed || !user) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching your account details" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  // Derive user display name safely from MongoDB fields
  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    "User";

  const userRole = user.role as Role;
  const roleLabel = ROLE_LABELS[userRole] || user.role;

  return (
    <div>
      <Header title="Account Settings" subtitle="View your profile details and role permissions" />
      <div className="p-8">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#133248] text-base font-bold text-white">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                {roleLabel}
              </span>
            </div>
          </div>

          <dl className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <dt className="text-slate-500">Username</dt>
              <dd className="font-medium text-slate-900">{user.username || "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <dt className="text-slate-500">Email Address</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <dt className="text-slate-500">Assigned Role</dt>
              <dd className="font-medium text-slate-900">{roleLabel}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-3">
              <dt className="text-slate-500">Account ID</dt>
              <dd className="font-mono text-xs text-slate-400">{user._id}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Need to update your credentials?</p>
            To modify your assigned role or personal account details, please contact a System Administrator or Communication Officer.
          </div>
        </div>
      </div>
    </div>
  );
}