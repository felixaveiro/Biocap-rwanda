'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import UserTable from "@/components/UserTable";
import { usersApi } from "@/lib/api/users";
import { useSession } from "@/hooks/useSession";
import { User, Role, ROLES, ROLE_LABELS, PaginatedResponse } from "@/types";
import {
  UserPlus,
  Users as UsersIcon,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// ── Same editorial system as Header / Overview / BlogTable / Trash:
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

export default function AdminTeamPage() {
  const {
    user: currentAdminUser,
    loading: sessionLoading,
    allowed: isPermissionAllowed,
  } = useSession("user:view");

  const [teamMembersList, setTeamMembersList] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  // Wrapped in useCallback for clean React Hook dependency tracking
  const fetchTeamMembers = useCallback(async () => {
    if (!currentAdminUser || !isPermissionAllowed) return;

    setIsDataLoading(true);
    setFetchErrorMessage(null);

    try {
      const adminRole = currentAdminUser.role as Role;
      const apiResponse: (PaginatedResponse<User> & { users?: User[] }) | User[] =
        await usersApi.listUsers(adminRole);

      // Normalize backend response regardless of payload structure
      let extractedUsersList: User[] = [];
      if (Array.isArray(apiResponse)) {
        extractedUsersList = apiResponse;
      } else if (Array.isArray(apiResponse?.data)) {
        extractedUsersList = apiResponse.data;
      } else if (Array.isArray(apiResponse?.users)) {
        extractedUsersList = apiResponse.users;
      } else if (Array.isArray(apiResponse?.docs)) {
        extractedUsersList = apiResponse.docs;
      }

      setTeamMembersList(extractedUsersList);
    } catch (error: unknown) {
      console.error("Failed to fetch team members:", error);
      const detailedMessage =
        error instanceof Error ? error.message : "Failed to load team directory from server.";
      setFetchErrorMessage(detailedMessage);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentAdminUser, isPermissionAllowed]);

  useEffect(() => {
    if (currentAdminUser && isPermissionAllowed) {
      fetchTeamMembers();
    }
  }, [currentAdminUser, isPermissionAllowed, fetchTeamMembers]);

  // Compute key summary metrics
  const directoryMetrics = useMemo(() => {
    const totalCount = teamMembersList.length;

    const activeCount = teamMembersList.filter((member) => {
      const extraDetails = member as unknown as { isActive?: boolean; isApproved?: boolean };
      return extraDetails.isActive !== false && extraDetails.isApproved !== false;
    }).length;

    const adminsAndOfficersCount = teamMembersList.filter(
      (member) => member.role === "admin" || member.role === "communication_officer"
    ).length;

    return { totalCount, activeCount, adminsAndOfficersCount };
  }, [teamMembersList]);

  // Filter team members by search string and selected role
  const filteredTeamMembers = useMemo(() => {
    return teamMembersList.filter((member) => {
      const fullName = `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.username?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRoleFilter === "ALL" || member.role === selectedRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [teamMembersList, searchQuery, selectedRoleFilter]);

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  // Ledger strip entries — same three-color language the Overview page
  // uses (ink for neutral counts, moss for the healthy/active signal,
  // gold for the privileged/watch signal).
  const ledgerEntries = [
    {
      label: "Total Team Members",
      value: directoryMetrics.totalCount,
      icon: UsersIcon,
      color: "#1E2620",
      border: "border-r border-[#E2DDCF]",
    },
    {
      label: "Active Accounts",
      value: directoryMetrics.activeCount,
      icon: UserCheck,
      color: "#3F6B4F",
      border: "border-r border-[#E2DDCF]",
    },
    {
      label: "Admins & Officers",
      value: directoryMetrics.adminsAndOfficersCount,
      icon: ShieldCheck,
      color: "#A9812F",
      border: "",
    },
  ];

  if (sessionLoading || !isPermissionAllowed || !currentAdminUser) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-16`} style={{ fontFamily: "var(--font-body)" }}>
        <Header title="Team Directory" subtitle="Authenticating session credentials…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 border border-[#E2DDCF] bg-white sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border-[#E2DDCF] p-5 sm:border-r last:border-r-0">
                  <div className="h-3 w-24 bg-[#EDEAE0]" />
                  <div className="mt-4 h-8 w-10 bg-[#EDEAE0]" />
                </div>
              ))}
            </div>
            <div className="h-11 w-full bg-[#EDEAE0]" />
            <div className="h-96 w-full border border-[#E2DDCF] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-16`} style={{ fontFamily: "var(--font-body)" }}>
      <Header
        title="Team Directory"
        subtitle="Manage active accounts, assigned roles, and platform access control"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ─── Ledger strip ─────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 border border-[#E2DDCF] bg-white sm:grid-cols-3">
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
                className="mt-2 text-4xl italic leading-none"
                style={{ ...displayFont, color: entry.color }}
              >
                {entry.value}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Toolbar & Filters ────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative max-w-md flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8B9188]">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or username…"
                className="w-full border border-[#D9D4C6] bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-[#1E2620] placeholder:text-[#B3AF9F] transition focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10"
              />
            </div>

            {/* Role Filter Selector */}
            <div className="relative min-w-[180px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8B9188]">
                <Filter size={14} />
              </div>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="w-full appearance-none border border-[#D9D4C6] bg-white pl-9 pr-8 py-2.5 text-sm font-medium text-[#3A4239] transition cursor-pointer focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10"
              >
                <option value="ALL">All Roles</option>
                {ROLES.map((roleKey) => (
                  <option key={roleKey} value={roleKey}>
                    {ROLE_LABELS[roleKey] || roleKey}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Create User Button */}
          <Link
            href="/admin/team/new"
            className="inline-flex items-center justify-center gap-2 border border-[#3F6B4F]/40 bg-[#3F6B4F] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#2C4B38] hover:border-[#2C4B38]"
          >
            <UserPlus size={14} />
            Create Member
          </Link>
        </div>

        {/* ─── Connection Error Banner ──────────────────────────────────── */}
        {fetchErrorMessage && (
          <div className="mb-6 flex items-center justify-between border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-4 text-[#8B4136]">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{fetchErrorMessage}</p>
            </div>
            <button
              onClick={fetchTeamMembers}
              className="inline-flex items-center gap-1.5 border border-[#B65C4B]/40 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8B4136] transition hover:bg-[#B65C4B] hover:text-white"
            >
              <RefreshCw size={13} />
              Retry Sync
            </button>
          </div>
        )}

        {/* ─── User Data Table ──────────────────────────────────────────── */}
        {isDataLoading ? (
          <div className="h-64 w-full animate-pulse border border-[#E2DDCF] bg-white" />
        ) : (
          <UserTable
            users={filteredTeamMembers}
            currentUser={currentAdminUser}
            onUserUpdated={fetchTeamMembers}
          />
        )}
      </main>
    </div>
  );
}