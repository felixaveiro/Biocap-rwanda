'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import UserTable from "@/components/UserTable";
import { usersApi } from "@/lib/api/users";
import { useSession } from "@/hooks/useSession";
import { User, Role, ROLES, ROLE_LABELS } from "@/types";
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

export default function UsersPage() {
  const { user, loading, allowed } = useSession("user:view");
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");

  const fetchUsers = async () => {
    if (!user || !allowed) return;
    setDataLoading(true);
    setFetchError(null);

    try {
      const response = await usersApi.listUsers(user.role as Role);
      const userList: User[] = Array.isArray(response)
        ? response
        : (response as { docs?: User[] })?.docs || [];

      setUsers(userList);
    } catch (err: unknown) {
      console.error("Failed to fetch users:", err);
      const msg = err instanceof Error ? err.message : "Failed to load team members.";
      setFetchError(msg);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user, allowed]);

  // Derived Statistics based strictly on your project's Role definitions
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => {
      const ext = u as unknown as { isActive?: boolean; isApproved?: boolean };
      return ext.isActive !== false && ext.isApproved !== false;
    }).length;

    // ✅ Typed correctly using your project's admin roles
    const admins = users.filter(
      (u) => u.role === "admin" || u.role === "communication_officer"
    ).length;

    return { total, active, admins };
  }, [users]);

  // Filtered User List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === "ALL" || u.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

  // ─── SKELETON LOADING STATE ────────────────────────────────────────────────
  if (loading || !allowed || !user) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Team Members" subtitle="Checking permissions…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="h-24 rounded-2xl bg-slate-200/80" />
              <div className="h-24 rounded-2xl bg-slate-200/80" />
            </div>
            <div className="h-12 w-full rounded-2xl bg-slate-200/80" />
            <div className="h-96 w-full rounded-2xl bg-slate-200/80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Team Members"
        subtitle="Manage active accounts, assigned roles, and platform permissions"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Metric Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UsersIcon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Accounts
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admins & Officers
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.admins}</p>
            </div>
          </div>
        </div>

        {/* Action Bar (Search, Role Filter, Create Button) */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or username..."
                className="w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Role Filter Selector */}
            <div className="relative min-w-[180px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Filter size={14} />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200/80 bg-white pl-9 pr-8 py-2 text-sm font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="ALL">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r] || r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add User Button */}
          <Link
            href="/dashboard/users/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:bg-indigo-800"
          >
            <UserPlus size={16} />
            Create User
          </Link>
        </div>

        {/* Error Alert Container */}
        {fetchError && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{fetchError}</p>
            </div>
            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* User Table Component */}
        {dataLoading ? (
          <div className="h-64 w-full animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-xs" />
        ) : (
          <UserTable users={filteredUsers} currentUser={user} />
        )}
      </main>
    </div>
  );
}