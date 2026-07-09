'use client';

import Header from "@/components/Header";
import { ROLE_LABELS } from "@/types";
import { useSession } from "@/hooks/useSession";

export default function SettingsPage() {
  const { user, loading, allowed } = useSession();

  if (loading || !allowed || !user) {
    return (
      <div>
        <Header title="Loading…" subtitle="Fetching your account" />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Settings" subtitle="Your account" />
      <div className="p-8">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium text-slate-900">{ROLE_LABELS[user.role]}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-400">
            To change your role or personal details, contact an Admin
            {user.role === "SOCIAL_MEDIA_INFLUENCER" ? " or Communication Officer" : ""}.
          </p>
        </div>
      </div>
    </div>
  );
}