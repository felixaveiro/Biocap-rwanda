'use client';

import Link from "next/link";
import Header from "@/components/Header";
import BlogForm from "@/components/BlogForm";
import { useSession } from "@/hooks/useSession";
import { Role, ROLE_LABELS } from "@/types";
import { ArrowLeft, PenSquare, ShieldCheck, User as UserIcon } from "lucide-react";

export default function NewBlogPage() {
  const { user, loading, allowed } = useSession("blog:create");

  // ─── ELEGANT SKELETON LOADING STATE ──────────────────────────────────────
  if (loading || !allowed || !user) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="New Post" subtitle="Checking permissions and initializing editor…" />
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            {/* Skeleton Top Bar */}
            <div className="flex items-center justify-between">
              <div className="h-9 w-32 rounded-xl bg-slate-200/80" />
              <div className="h-9 w-48 rounded-xl bg-slate-200/80" />
            </div>
            {/* Skeleton Form Card */}
            <div className="h-[520px] w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  // Derive full name cleanly from MongoDB user fields
  const creatorName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    "Creator";

  const userRole = user.role as Role;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Section Header */}
      <Header
        title="Create Post"
        subtitle="Draft and publish or submit your story for review"
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation & Author Meta Card */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard/my-submissions"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <ArrowLeft size={14} className="text-slate-400" />
            Back to Submissions
          </Link>

          {/* Author Badge Info */}
          <div className="flex items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-1.5 text-xs font-medium text-indigo-950 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <PenSquare size={13} />
            </div>
            <span>
              Author: <strong className="font-semibold text-slate-900">{creatorName}</strong>
            </span>
            <span className="text-indigo-300">•</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 font-semibold text-indigo-700 shadow-xs">
              <ShieldCheck size={12} className="text-indigo-600" />
              {ROLE_LABELS[userRole] || userRole}
            </span>
          </div>
        </div>

        {/* Main Form Wrapper Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs shadow-slate-200/50">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Editorial Studio
            </h3>
          </div>
          <div className="p-6 sm:p-8">
            <BlogForm
              mode="create"
              role={userRole}
              creatorName={creatorName}
              creatorRole={userRole}
            />
          </div>
        </div>
      </main>
    </div>
  );
}