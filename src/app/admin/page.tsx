'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
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
  Loader2,
} from "lucide-react";

// ── Same editorial system as Header / BlogTable / Trash:
// canvas #FAF9F5 · ink #1E2620 · moss #3F6B4F · gold #A9812F · clay #B65C4B · line #E2DDCF
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

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

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  // Ledger strip — accent colors aren't decorative, they reuse the exact
  // status colors BlogTable uses (gold = awaiting, moss = live) so the
  // number itself tells you something true, not just a category badge.
  const ledgerEntries = [
    {
      label: "On Staff",
      value: overviewMetrics.totalTeamCount,
      icon: UsersIcon,
      color: "#1E2620",
      border: "border-r border-[#E2DDCF] border-b md:border-b-0",
    },
    {
      label: "Total Stories",
      value: overviewMetrics.totalStoriesCount,
      icon: FileText,
      color: "#1E2620",
      border: "border-b border-[#E2DDCF] md:border-b-0 md:border-r",
    },
    {
      label: "Awaiting Review",
      value: overviewMetrics.pendingReviewCount,
      icon: Clock,
      color: "#A9812F",
      border: "border-r border-[#E2DDCF]",
    },
    {
      label: "Published Live",
      value: overviewMetrics.publishedLiveCount,
      icon: Globe,
      color: "#3F6B4F",
      border: "",
    },
  ];

  const btnBase =
    "inline-flex items-center gap-1.5 border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors";
  const btnNeutral = `${btnBase} border-[#D9D4C6] bg-white text-[#3A4239] hover:border-[#1E2620] hover:text-[#1E2620]`;
  const btnMoss = `${btnBase} border-[#3F6B4F]/40 bg-[#3F6B4F]/10 text-[#2C4B38] hover:bg-[#3F6B4F] hover:text-white hover:border-[#3F6B4F]`;
  const btnGold = `${btnBase} border-[#A9812F]/40 bg-[#A9812F]/10 text-[#7A5D22] hover:bg-[#A9812F] hover:text-white hover:border-[#A9812F]`;

  if (sessionLoading || !isPermissionAllowed || !currentAdminUser) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-16`} style={{ fontFamily: "var(--font-body)" }}>
        <Header title="Admin Overview" subtitle="Authenticating session credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid animate-pulse grid-cols-2 border border-[#E2DDCF] bg-white md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 border-[#E2DDCF] p-5">
                <div className="h-3 w-16 bg-[#EDEAE0]" />
                <div className="mt-4 h-8 w-10 bg-[#EDEAE0]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-16`} style={{ fontFamily: "var(--font-body)" }}>
      <Header
        title="Admin Control Center"
        subtitle={`Welcome back, ${currentAdminUser.firstName || "Administrator"}. Here is your platform summary.`}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ─── Error banner ─────────────────────────────────────────────── */}
        {dashboardFetchError && (
          <div className="mb-6 flex items-center justify-between border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-4 text-[#8B4136]">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{dashboardFetchError}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1.5 border border-[#B65C4B]/40 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8B4136] transition hover:bg-[#B65C4B] hover:text-white"
            >
              <RefreshCw size={13} />
              Retry Sync
            </button>
          </div>
        )}

        {/* ─── Ledger strip — the one bold move on this page ──────────────── */}
        <div className="mb-10 grid grid-cols-2 border border-[#E2DDCF] bg-white md:grid-cols-4">
          {ledgerEntries.map((entry) => (
            <div key={entry.label} className={`p-5 ${entry.border}`}>
              <div className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <entry.icon size={13} strokeWidth={2} />
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]"
                  style={monoFont}
                >
                  {entry.label}
                </p>
              </div>
              <p
                className="mt-2 text-4xl italic leading-none md:text-[42px]"
                style={{ ...displayFont, color: entry.color }}
              >
                {isDataFetching ? (
                  <Loader2 size={26} className="animate-spin text-[#D9D4C6]" strokeWidth={2} />
                ) : (
                  entry.value
                )}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Desk panels ──────────────────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-[#E2DDCF] bg-white p-6">
            <div className="flex items-center gap-2 text-[#3F6B4F]">
              <ShieldCheck size={15} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={monoFont}>
                People
              </p>
            </div>
            <h3 className="mt-2 text-xl italic text-[#1E2620]" style={displayFont}>
              Team Management
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#7A8079]">
              Provision new user accounts and manage permissions.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[#EDEAE0] pt-5">
              <Link href="/admin/team" className={btnNeutral}>
                View Directory <ArrowRight size={13} />
              </Link>
              <Link href="/admin/audit" className={btnNeutral}>
                <Clock size={13} /> Audit Logs
              </Link>
              <Link href="/admin/team/new" className={btnMoss}>
                <UserPlus size={13} /> Add Team Member
              </Link>
            </div>
          </div>

          <div className="border border-[#E2DDCF] bg-white p-6">
            <div className="flex items-center gap-2 text-[#A9812F]">
              <FileText size={15} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={monoFont}>
                Copy
              </p>
            </div>
            <h3 className="mt-2 text-xl italic text-[#1E2620]" style={displayFont}>
              Editorial Desk
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#7A8079]">
              Review submitted stories, approve content, or draft new articles.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[#EDEAE0] pt-5">
              <Link href="/admin/stories" className={btnNeutral}>
                All Stories <ArrowRight size={13} />
              </Link>
              <Link href="/creator/my-stories/new" className={btnGold}>
                <Plus size={13} /> Draft New Story
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}