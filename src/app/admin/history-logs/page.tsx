'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "@/lib/fonts";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  RefreshCw,
  Search,
  Users as UsersIcon,
} from "lucide-react";
import Header from "@/components/Header";
import { useSession } from "@/hooks/useSession";
import {
  AuditLog,
  AuditLogFilters,
  AuditLogPagination,
  getAdminAuditLogs,
  getAdminAuditLogsByUser,
} from "@/lib/api/audit";
import { ApiError } from "@/lib/api/client";
import { usersApi } from "@/lib/api/users";
import { PaginatedResponse, ROLE_LABELS, User } from "@/types";

// ── Same editorial system as Header / Overview / BlogTable / Trash / Team:
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

const ACTION_LABELS: Record<string, string> = {
  "user.create": "User created",
  "user.update": "User profile updated",
  "user.role_change": "User role changed",
  "user.deactivate": "Account deactivated",
  "user.reactivate": "Account reactivated",
  "user.delete": "User deleted",
  "user.review": "User profile reviewed",
  "user.login": "Signed in",
  "user.logout": "Signed out",
  "user.password_change": "Password changed",
  "user.password_reset": "Password reset",
  "user.password_reset_requested": "Password reset requested",
  "blog.create": "Blog created",
  "blog.update": "Blog updated",
  "blog.delete": "Blog moved to trash",
  "blog.hard_delete": "Blog permanently deleted",
  "blog.restore": "Blog restored",
  "blog.submit": "Blog submitted for review",
  "blog.review": "Blog reviewed",
  "blog.publish": "Blog published",
  "blog.unpublish": "Blog unpublished",
  "blog.editor_proposal": "Editor proposed changes",
  "blog.editor_proposal_notification": "Writer notified about proposal",
  "blog.editor_changes_accepted": "Editor proposal accepted",
  "blog.editor_changes_rejected": "Editor proposal rejected",
  "blog.editor_proposal_withdrawn": "Editor proposal withdrawn",
  "blog.mark_change_implemented": "Requested changes marked implemented",
  "blog.accept_editor_changes": "Editor changes accepted",
  "blog.comment_add": "Comment or review note added",
  "blog.comment_hide": "Comment hidden",
  "blog.comment_unhide": "Comment made visible",
  "blog.comment_delete": "Comment deleted",
  "gallery.create": "Gallery item created",
  "gallery.update": "Gallery item updated",
  "gallery.publish": "Gallery item published",
  "gallery.unpublish": "Gallery item unpublished",
  "gallery.delete": "Gallery item deleted",
};

const EMPTY_PAGINATION: AuditLogPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

type FilterForm = {
  action: string;
  actor: string;
  actorRole: string;
  targetModel: "" | "User" | "Blog" | "Gallery";
  targetId: string;
  fromDate: string;
  toDate: string;
};

const EMPTY_FILTERS: FilterForm = {
  action: "",
  actor: "",
  actorRole: "",
  targetModel: "",
  targetId: "",
  fromDate: "",
  toDate: "",
};

// ── Shared class strings (kept identical to the Team page controls) ─────────
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]";
const INPUT_CLS =
  "mt-1.5 w-full border border-[#D9D4C6] bg-white px-3 py-2.5 text-sm font-medium text-[#1E2620] placeholder:text-[#B3AF9F] transition focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10";
const TH_CLS = "px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]";
const PAGER_BTN_CLS =
  "inline-flex items-center gap-1 border border-[#D9D4C6] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#3A4239] transition hover:bg-[#FAF9F5] disabled:cursor-not-allowed disabled:opacity-40";

function getActorName(log: AuditLog): string {
  if (typeof log.actor === "string") return log.actor;
  const fullName = [log.actor?.firstName, log.actor?.lastName].filter(Boolean).join(" ");
  return fullName || log.actor?.username || log.actorLabel || log.actorRole || "Unknown actor";
}

function formatTimestamp(value: string): string {
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? value : timestamp.toLocaleString();
}

function toIsoDate(value: string, endOfDay = false): string | undefined {
  if (!value) return undefined;
  const timestamp = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(timestamp.getTime()) ? undefined : timestamp.toISOString();
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function stringifyDetail(detail: unknown): string | null {
  if (detail === undefined || detail === null) return null;
  try {
    return typeof detail === "string" ? detail : JSON.stringify(detail, null, 2);
  } catch {
    return String(detail);
  }
}

function getUserCreateDetail(log: AuditLog): Record<string, unknown> | null {
  if (log.action !== "user.create" || !log.detail || typeof log.detail !== "object") {
    return null;
  }
  return log.detail as Record<string, unknown>;
}

function getCreationSource(
  user: User,
  creationLog: AuditLog | undefined,
  lookupFailed: boolean
): string {
  const detail = creationLog ? getUserCreateDetail(creationLog) : null;

  if (detail?.selfRegistration === true) return "Self-registered on website";
  if (detail?.createdByStaff === true) {
    return `Added by ${creationLog ? getActorName(creationLog) : "staff"}`;
  }
  if (user.createdBy) {
    if (typeof user.createdBy === "string") return `Added by staff (${user.createdBy})`;
    const name = [user.createdBy.firstName, user.createdBy.lastName].filter(Boolean).join(" ");
    return `Added by ${name || user.createdBy.username || "staff"}`;
  }
  return lookupFailed ? "Creation source unavailable" : "Creation source not recorded";
}

export default function AdminHistoryLogsPage() {
  const { user, loading: sessionLoading, allowed } = useSession("admin:audit:read");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accounts, setAccounts] = useState<User[]>([]);
  const [accountsPage, setAccountsPage] = useState(1);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsTotalPages, setAccountsTotalPages] = useState(1);
  const [accountsHasNextPage, setAccountsHasNextPage] = useState(false);
  const [accountsHasPrevPage, setAccountsHasPrevPage] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [accountsReloadKey, setAccountsReloadKey] = useState(0);
  const [accountCreationEvents, setAccountCreationEvents] = useState<
    Record<string, AuditLog | null>
  >({});
  const [accountSourceLookupFailures, setAccountSourceLookupFailures] = useState<
    Record<string, boolean>
  >({});

  const fetchLogs = useCallback(async () => {
    if (!allowed || user?.role !== "admin") return;
    setIsLoading(true);
    setErrorMessage(null);
    setAccessDenied(false);

    try {
      const response = await getAdminAuditLogs(filters, page, limit);
      if (!Array.isArray(response.data) || !response.pagination) {
        throw new Error("The audit history service returned an unexpected response.");
      }
      setLogs(response.data);
      setPagination(response.pagination);
    } catch (error: unknown) {
      console.error("Failed to load admin audit history:", error);
      if (error instanceof ApiError && error.status === 403) {
        setAccessDenied(true);
        setErrorMessage("You do not have permission to view audit history.");
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load audit history.");
      }
      setLogs([]);
      setPagination(EMPTY_PAGINATION);
    } finally {
      setIsLoading(false);
    }
  }, [allowed, filters, limit, page, user?.role]);

  useEffect(() => {
    if (!sessionLoading && allowed && user?.role === "admin") {
      void fetchLogs();
    }
  }, [fetchLogs, reloadKey, sessionLoading, allowed, user?.role]);

  useEffect(() => {
    if (sessionLoading || !allowed || user?.role !== "admin") return;
    let active = true;

    async function fetchAccounts() {
      setAccountsLoading(true);
      setAccountsError(null);
      try {
        const response = await usersApi.listUsers("admin", {
          page: accountsPage,
          limit: 20,
        });
        if (!active) return;

        const paginatedResponse = response as PaginatedResponse<User> & { users?: User[] };
        const rows = Array.isArray(paginatedResponse)
          ? paginatedResponse
          : Array.isArray(paginatedResponse?.data)
          ? paginatedResponse.data
          : Array.isArray(paginatedResponse?.users)
          ? paginatedResponse.users
          : Array.isArray(paginatedResponse?.docs)
          ? paginatedResponse.docs
          : null;

        if (!rows) {
          throw new Error("The accounts service returned an unexpected response.");
        }

        const metadata = paginatedResponse?.pagination;
        const totalPages =
          metadata?.totalPages ??
          metadata?.pages ??
          paginatedResponse?.totalPages ??
          (metadata?.total ? Math.ceil(metadata.total / (metadata.limit || 20)) : 1);
        setAccounts(rows);
        setAccountsTotal(metadata?.total ?? paginatedResponse?.totalDocs ?? rows.length);
        setAccountsTotalPages(Math.max(totalPages, 1));
        setAccountsHasPrevPage(metadata?.hasPrevPage ?? accountsPage > 1);
        setAccountsHasNextPage(
          metadata?.hasNextPage ?? accountsPage < Math.max(totalPages, 1)
        );

        const accountsNeedingSourceLookup = rows.filter((account) => !account.createdBy);
        const sourceLookups = await Promise.all(
          accountsNeedingSourceLookup.map(async (account) => {
            try {
              const history = await getAdminAuditLogsByUser(account._id);
              const creationEvent = history.actionsOnThisUser.find(
                (log) =>
                  log.action === "user.create" &&
                  log.targetModel === "User" &&
                  log.targetId === account._id
              );
              return { accountId: account._id, creationEvent: creationEvent ?? null };
            } catch (error: unknown) {
              console.error(`Failed to load creation history for account ${account._id}:`, error);
              return { accountId: account._id, creationEvent: null, failed: true };
            }
          })
        );
        if (!active) return;
        setAccountCreationEvents(
          Object.fromEntries(
            sourceLookups.map(({ accountId, creationEvent }) => [accountId, creationEvent])
          )
        );
        setAccountSourceLookupFailures(
          Object.fromEntries(
            sourceLookups.map(({ accountId, failed }) => [accountId, failed === true])
          )
        );
      } catch (error: unknown) {
        if (!active) return;
        console.error("Failed to load system accounts:", error);
        setAccounts([]);
        setAccountsError(
          error instanceof ApiError && error.status === 403
            ? "You do not have permission to view system accounts."
            : error instanceof Error
            ? error.message
            : "Failed to load system accounts."
        );
      } finally {
        if (active) setAccountsLoading(false);
      }
    }

    void fetchAccounts();
    return () => {
      active = false;
    };
  }, [accountsPage, accountsReloadKey, allowed, sessionLoading, user?.role]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFilters: AuditLogFilters = {
      action: draftFilters.action.trim() || undefined,
      actor: draftFilters.actor.trim() || undefined,
      actorRole: draftFilters.actorRole.trim() || undefined,
      targetModel: draftFilters.targetModel || undefined,
      targetId: draftFilters.targetId.trim() || undefined,
      from: toIsoDate(draftFilters.fromDate),
      to: toIsoDate(draftFilters.toDate, true),
    };
    setFilters(nextFilters);
    setPage(1);
  }

  function resetFilters() {
    setDraftFilters(EMPTY_FILTERS);
    setFilters({});
    setPage(1);
  }

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value !== undefined && value !== "").length,
    [filters]
  );

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  // Ledger strip entries — same three-color language as Overview / Team
  // (ink for neutral counts, moss for the healthy/active signal,
  // gold for the watch signal).
  const ledgerEntries = [
    {
      label: "System Accounts",
      value: accountsTotal,
      icon: UsersIcon,
      color: "#1E2620",
      border: "border-b border-[#E2DDCF] sm:border-b-0 sm:border-r",
    },
    {
      label: "Audit Events",
      value: pagination.total,
      icon: History,
      color: "#3F6B4F",
      border: "border-b border-[#E2DDCF] sm:border-b-0 sm:border-r",
    },
    {
      label: "Active Filters",
      value: activeFilterCount,
      icon: Filter,
      color: "#A9812F",
      border: "",
    },
  ];

  if (sessionLoading) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-16`} style={{ fontFamily: "var(--font-body)" }}>
        <Header title="History Logs" subtitle="Authenticating session credentials…" />
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

  if (!allowed || user?.role !== "admin") return null;

  return (
    <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-16`} style={{ fontFamily: "var(--font-body)" }}>
      <Header title="History Logs" subtitle="Admin-only audit history of platform activity" />

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

        {/* ─── Connection Error Banner ──────────────────────────────────── */}
        {errorMessage && (
          <div
            role="alert"
            className={`mb-6 flex items-center justify-between gap-4 border p-4 ${
              accessDenied
                ? "border-[#A9812F]/40 bg-[#A9812F]/10 text-[#7A5C1F]"
                : "border-[#B65C4B]/40 bg-[#B65C4B]/10 text-[#8B4136]"
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            {!accessDenied && (
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="inline-flex shrink-0 items-center gap-1.5 border border-[#B65C4B]/40 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8B4136] transition hover:bg-[#B65C4B] hover:text-white"
              >
                <RefreshCw size={13} />
                Retry Sync
              </button>
            )}
          </div>
        )}

        {/* ─── System accounts ──────────────────────────────────────────── */}
        <section className="mb-8 overflow-hidden border border-[#E2DDCF] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DDCF] px-5 py-4">
            <div>
              <h2 className="text-xl font-medium text-[#1E2620]" style={displayFont}>
                System accounts
              </h2>
              <p className="mt-1 text-xs text-[#8B9188]">
                {accountsTotal} accounts · creation time, role, organization, and recorded source
              </p>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]" style={monoFont}>
              Page {accountsPage} of {accountsTotalPages}
            </p>
          </div>

          {accountsError && (
            <div
              role="alert"
              className="m-5 flex items-center justify-between gap-4 border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-4 text-sm font-medium text-[#8B4136]"
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <p>{accountsError}</p>
              </div>
              <button
                type="button"
                onClick={() => setAccountsReloadKey((key) => key + 1)}
                className="inline-flex shrink-0 items-center gap-1.5 border border-[#B65C4B]/40 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8B4136] transition hover:bg-[#B65C4B] hover:text-white"
              >
                <RefreshCw size={13} />
                Retry Sync
              </button>
            </div>
          )}

          {accountsLoading ? (
            <div className="animate-pulse space-y-3 p-5" aria-label="Loading system accounts">
              <div className="h-10 bg-[#EDEAE0]" />
              <div className="h-16 bg-[#EDEAE0]" />
            </div>
          ) : !accountsError && accounts.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#8B9188]">No accounts found.</div>
          ) : accounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm text-[#3A4239]">
                <thead className="border-b border-[#E2DDCF] bg-[#FAF9F5]" style={monoFont}>
                  <tr>
                    <th scope="col" className={TH_CLS}>Account</th>
                    <th scope="col" className={TH_CLS}>Role</th>
                    <th scope="col" className={TH_CLS}>Organization</th>
                    <th scope="col" className={TH_CLS}>Created</th>
                    <th scope="col" className={TH_CLS}>Creation source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDCF]">
                  {accounts.map((account) => (
                    <tr key={account._id} className="align-top transition hover:bg-[#FAF9F5]">
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#1E2620]">
                          {[account.firstName, account.lastName].filter(Boolean).join(" ") || account.username}
                        </div>
                        <div className="mt-1 text-xs text-[#8B9188]">{account.email}</div>
                        {account.username && (
                          <div className="mt-1 text-[11px] text-[#B3AF9F]" style={monoFont}>
                            @{account.username}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {ROLE_LABELS[account.role] || account.role.replace(/_/g, " ")}
                      </td>
                      <td className="px-5 py-4">{account.organization || "Not provided"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-[#8B9188]">
                        {account.createdAt ? formatTimestamp(account.createdAt) : "Not recorded"}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {getCreationSource(
                          account,
                          accountCreationEvents[account._id] ?? undefined,
                          accountSourceLookupFailures[account._id] === true
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-[#E2DDCF] px-5 py-4">
            <button
              type="button"
              onClick={() => setAccountsPage((current) => Math.max(1, current - 1))}
              disabled={!accountsHasPrevPage || accountsLoading}
              className={PAGER_BTN_CLS}
            >
              <ChevronLeft size={14} />
              Previous accounts
            </button>
            <button
              type="button"
              onClick={() => setAccountsPage((current) => current + 1)}
              disabled={!accountsHasNextPage || accountsLoading}
              className={PAGER_BTN_CLS}
            >
              Next accounts
              <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* ─── Toolbar & Filters ────────────────────────────────────────── */}
        <form
          onSubmit={applyFilters}
          className="mb-6 grid gap-4 border border-[#E2DDCF] bg-white p-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className={LABEL_CLS} style={monoFont}>
            Action
            <input
              value={draftFilters.action}
              onChange={(event) => setDraftFilters({ ...draftFilters, action: event.target.value })}
              placeholder="e.g. blog.publish"
              className={INPUT_CLS}
              style={{ fontFamily: "var(--font-body)" }}
            />
          </label>
          <label className={LABEL_CLS} style={monoFont}>
            Actor ID
            <input
              value={draftFilters.actor}
              onChange={(event) => setDraftFilters({ ...draftFilters, actor: event.target.value })}
              placeholder="MongoDB user ID"
              className={INPUT_CLS}
              style={{ fontFamily: "var(--font-body)" }}
            />
          </label>
          <label className={LABEL_CLS} style={monoFont}>
            Actor role
            <input
              value={draftFilters.actorRole}
              onChange={(event) => setDraftFilters({ ...draftFilters, actorRole: event.target.value })}
              placeholder="e.g. admin"
              className={INPUT_CLS}
              style={{ fontFamily: "var(--font-body)" }}
            />
          </label>
          <label className={LABEL_CLS} style={monoFont}>
            Target type
            <select
              value={draftFilters.targetModel}
              onChange={(event) =>
                setDraftFilters({
                  ...draftFilters,
                  targetModel: event.target.value as FilterForm["targetModel"],
                })
              }
              className={`${INPUT_CLS} cursor-pointer appearance-none`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              <option value="">All types</option>
              <option value="User">User</option>
              <option value="Blog">Blog</option>
              <option value="Gallery">Gallery</option>
            </select>
          </label>
          <label className={LABEL_CLS} style={monoFont}>
            Target ID
            <input
              value={draftFilters.targetId}
              onChange={(event) => setDraftFilters({ ...draftFilters, targetId: event.target.value })}
              placeholder="MongoDB target ID"
              className={INPUT_CLS}
              style={{ fontFamily: "var(--font-body)" }}
            />
          </label>
          <label className={LABEL_CLS} style={monoFont}>
            From date
            <input
              type="date"
              value={draftFilters.fromDate}
              onChange={(event) => setDraftFilters({ ...draftFilters, fromDate: event.target.value })}
              className={INPUT_CLS}
              style={{ fontFamily: "var(--font-body)" }}
            />
          </label>
          <label className={LABEL_CLS} style={monoFont}>
            To date
            <input
              type="date"
              value={draftFilters.toDate}
              onChange={(event) => setDraftFilters({ ...draftFilters, toDate: event.target.value })}
              className={INPUT_CLS}
              style={{ fontFamily: "var(--font-body)" }}
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 border border-[#3F6B4F]/40 bg-[#3F6B4F] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-[#2C4B38] hover:bg-[#2C4B38]"
            >
              <Search size={14} />
              Apply Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="border border-[#D9D4C6] bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#3A4239] transition hover:bg-[#FAF9F5]"
            >
              Reset
            </button>
          </div>
        </form>

        {/* ─── Audit events ─────────────────────────────────────────────── */}
        <section className="overflow-hidden border border-[#E2DDCF] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DDCF] px-5 py-4">
            <div>
              <h2 className="text-xl font-medium text-[#1E2620]" style={displayFont}>
                Audit events
              </h2>
              <p className="mt-1 text-xs text-[#8B9188]">
                {pagination.total} {pagination.total === 1 ? "event" : "events"} recorded
              </p>
            </div>
            <label
              className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]"
              style={monoFont}
            >
              Rows per page
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="cursor-pointer border border-[#D9D4C6] bg-white px-2 py-1.5 text-sm font-medium normal-case tracking-normal text-[#3A4239] transition focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3 p-5" aria-label="Loading audit history">
              <div className="h-10 bg-[#EDEAE0]" />
              <div className="h-16 bg-[#EDEAE0]" />
              <div className="h-16 bg-[#EDEAE0]" />
            </div>
          ) : !errorMessage && logs.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#8B9188]">
              No audit events match these filters.
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm text-[#3A4239]">
                <thead className="border-b border-[#E2DDCF] bg-[#FAF9F5]" style={monoFont}>
                  <tr>
                    <th scope="col" className={TH_CLS}>Time</th>
                    <th scope="col" className={TH_CLS}>Actor</th>
                    <th scope="col" className={TH_CLS}>Action</th>
                    <th scope="col" className={TH_CLS}>Target</th>
                    <th scope="col" className={TH_CLS}>More</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDCF]">
                  {logs.map((log) => {
                    const detail = stringifyDetail(log.detail);
                    return (
                      <tr key={log._id} className="align-top transition hover:bg-[#FAF9F5]">
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-[#8B9188]" title={log.timestamp}>
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-[#1E2620]">{getActorName(log)}</div>
                          <div className="mt-1 text-xs text-[#8B9188]">{log.actorRole || "Role unavailable"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex border border-[#3F6B4F]/30 bg-[#3F6B4F]/10 px-2.5 py-1 text-[11px] font-semibold text-[#3F6B4F]">
                            {getActionLabel(log.action)}
                          </span>
                          <div className="mt-1 text-[11px] text-[#B3AF9F]" style={monoFont}>
                            {log.action}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-[#1E2620]">{log.targetLabel || "Target"}</div>
                          <div className="mt-1 text-xs text-[#8B9188]">
                            {log.targetModel}
                            {log.targetId ? ` · ${log.targetId}` : ""}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {detail || log.requestMethod || log.requestPath || log.ip || log.userAgent ? (
                            <details className="max-w-sm">
                              <summary className="cursor-pointer text-xs font-semibold text-[#3F6B4F] hover:text-[#2C4B38]">
                                View details
                              </summary>
                              <div className="mt-2 space-y-2 border border-[#E2DDCF] bg-[#FAF9F5] p-3 text-xs">
                                {(() => {
                                  const creationDetail = getUserCreateDetail(log);
                                  if (!creationDetail) return null;
                                  const createdByStaff = creationDetail.createdByStaff === true;
                                  const selfRegistration = creationDetail.selfRegistration === true;
                                  return (
                                    <p className="font-semibold text-[#1E2620]">
                                      Account creation:{" "}
                                      {selfRegistration
                                        ? "Self-registered using the website form"
                                        : createdByStaff
                                        ? `Added by ${getActorName(log)}`
                                        : "Creation source not recorded"}
                                    </p>
                                  );
                                })()}
                                {detail && (
                                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-[#3A4239]" style={{ fontFamily: "var(--font-body)" }}>
                                    {detail}
                                  </pre>
                                )}
                                {(log.requestMethod || log.requestPath) && (
                                  <p className="break-all text-[#8B9188]">
                                    Request: {log.requestMethod || ""} {log.requestPath || ""}
                                  </p>
                                )}
                                {log.ip && <p className="break-all text-[#8B9188]">IP: {log.ip}</p>}
                                {log.userAgent && (
                                  <p className="break-all text-[#8B9188]">User agent: {log.userAgent}</p>
                                )}
                              </div>
                            </details>
                          ) : (
                            <span className="text-xs text-[#B3AF9F]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-[#E2DDCF] px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]" style={monoFont}>
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!pagination.hasPrevPage || isLoading}
                className={PAGER_BTN_CLS}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!pagination.hasNextPage || isLoading}
                className={PAGER_BTN_CLS}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}