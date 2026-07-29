'use client';

import Header from "@/components/Header";
import UserForm from "@/components/UserForm";
import { useSession } from "@/hooks/useSession";
import { can } from "@/lib/permissions";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NewUserPage() {
  const { user, loading, allowed } = useSession("user:create");

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Add user" subtitle="Checking permissions..." />
        <div className="p-8 text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  // 2. Access Denied State (handles cases where user is logged in but lacks `user:create` permission)
  if (!allowed || !user) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Access Denied" subtitle="Insufficient permissions" />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
            <p className="mt-2 text-sm text-slate-500">
              You do not have administrative privileges to register new users.
            </p>
            <Link
              href="/dashboard/users"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <ArrowLeft size={16} />
              Back to Users
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 3. Dynamically determine if the current user can assign or edit roles
  const canEditRole = can(user.role, "user:edit:role");

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header title="Add user" subtitle="Create an account and assign a role" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard/users"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={14} className="text-slate-400" />
            Back to users
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-8">
          <UserForm mode="create" canEditRole={canEditRole} />
        </div>
      </main>
    </div>
  );
}