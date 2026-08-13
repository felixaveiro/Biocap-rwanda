'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { usersApi } from "@/lib/api/users";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { User, BlogPost, Role } from "@/types";
import {
  Users as UsersIcon,
  FileText,
  Clock,
  Globe,
  UserPlus,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AdminOverviewDashboardPage() {
  const { user: currentAdminUser, loading: sessionLoading, allowed: isPermissionAllowed } =
    useSession("user:view");

  const [teamMembersList, setTeamMembersList] = useState<User[]>([]);
  const [editorialStoriesList, setEditorialStoriesList] = useState<BlogPost[]>([]);
  
  const [isDataFetching, setIsDataFetching] = useState(true);
  const [dashboardFetchError, setDashboardFetchError] = useState<string | null>(null);

  // Wrapped in useCallback for clean React Hook dependency tracking
  const fetchDashboardData = useCallback(async () => {
    if (!currentAdminUser) return;
    setIsDataFetching(true);
    setDashboardFetchError(null);

    try {
      const adminRole = currentAdminUser.role as Role;

      // Fetch system users and platform stories in parallel
      const [usersResponse, blogsResponse]: [any, any] = await Promise.all([
        usersApi.listUsers(adminRole),
        blogsApi.getBlogs(adminRole),
      ]);

      // Normalize Users Response
      let extractedUsers: User[] = [];
      if (Array.isArray(usersResponse)) extractedUsers = usersResponse;
      else if (Array.isArray(usersResponse?.data)) extractedUsers = usersResponse.data;
      else if (Array.isArray(usersResponse?.users)) extractedUsers = usersResponse.users;

      // Normalize Blogs Response
      let extractedBlogs: BlogPost[] = [];
      if (Array.isArray(blogsResponse)) extractedBlogs = blogsResponse;
      else if (Array.isArray(blogsResponse?.data)) extractedBlogs = blogsResponse.data;
      else if (Array.isArray(blogsResponse?.docs)) extractedBlogs = blogsResponse.docs;

      setTeamMembersList(extractedUsers);
      setEditorialStoriesList(extractedBlogs);
    } catch (error: unknown) {
      console.error("Failed to load admin overview metrics:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Could not synchronize dashboard statistics.";
      setDashboardFetchError(errorMessage);
    } finally {
      setIsDataFetching(false);
    }
  }, [currentAdminUser]);

  useEffect(() => {
    if (currentAdminUser && isPermissionAllowed) {
      fetchDashboardData();
    }
  }, [currentAdminUser, isPermissionAllowed, fetchDashboardData]);

  // Compute key summary statistics
  const overviewMetrics = useMemo(() => {
    const totalTeamCount = teamMembersList.length;
    const totalStoriesCount = editorialStoriesList.length;
    
    const pendingReviewCount = editorialStoriesList.filter(
      (story) => (story.status as string) === "submitted" || (story.status as string) === "pending"
    ).length;

    const publishedLiveCount = editorialStoriesList.filter(
      (story) => (story.status as string) === "published"
    ).length;

    return {
      totalTeamCount,
      totalStoriesCount,
      pendingReviewCount,
      publishedLiveCount,
    };
  }, [teamMembersList, editorialStoriesList]);

  if (sessionLoading || !isPermissionAllowed || !currentAdminUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Admin Overview" subtitle="Authenticating session credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
              <div className="h-28 rounded-2xl bg-slate-200/80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Admin Control Center"
        subtitle={`Welcome back, ${currentAdminUser.firstName || "Administrator"}. Here is your platform summary.`}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Connection Error Banner */}
        {dashboardFetchError && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{dashboardFetchError}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry Sync
            </button>
          </div>
        )}

        {/* Executive Summary Metric Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UsersIcon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Team Members
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataFetching ? "…" : overviewMetrics.totalTeamCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Stories
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataFetching ? "…" : overviewMetrics.totalStoriesCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Approvals
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataFetching ? "…" : overviewMetrics.pendingReviewCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Globe size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Published Live
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {isDataFetching ? "…" : overviewMetrics.publishedLiveCount}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Operational Actions */}
        <div className="mb-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Team Management</h3>
                <p className="text-xs text-slate-500">
                  Provision new user accounts and manage permissions
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/admin/team"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                View Directory <ArrowRight size={14} />
              </Link>
              <Link
                href="/admin/audit"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                <Clock size={14} /> Audit Logs
              </Link>
              <Link
                href="/admin/team/new"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
              >
                <UserPlus size={14} /> Add Team Member
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Editorial Desk</h3>
                <p className="text-xs text-slate-500">
                  Review submitted stories, approve content, or draft new articles
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/admin/stories"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
              >
                All Stories <ArrowRight size={14} />
              </Link>
              <Link
                href="/creator/my-stories/new"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-purple-700"
              >
                <Plus size={14} /> Draft New Story
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}