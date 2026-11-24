'use client';

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import { usersApi } from "@/lib/api/users";
import { useSession } from "@/hooks/useSession";
import { ROLE_LABELS, User } from "@/types";
import {
  AlertCircle,
  Building2,
  Check,
  X,
  Clock3,
  Loader2,
  Mail,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";

export default function PendingAccountsPage() {
  const { user, loading: sessionLoading, allowed } = useSession("user:review");
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPendingUsers = useCallback(async () => {
    if (!user || user.role !== "admin" || !allowed) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await usersApi.getReviewQueue(user.role);
      if (!Array.isArray(response.users)) {
        throw new Error("The account review service returned an unexpected response.");
      }
      setPendingUsers(response.users);
      setQueueCount(response.count ?? response.users.length);
    } catch (error) {
      console.error("Could not load pending account reviews:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load pending accounts."
      );
    } finally {
      setIsLoading(false);
    }
  }, [allowed, user]);

  useEffect(() => {
    if (user?.role === "admin" && allowed) {
      void fetchPendingUsers();
    }
  }, [allowed, fetchPendingUsers, user?.role]);

  const acceptAccount = async (account: User) => {
    setLoadingUserId(account._id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await usersApi.reviewUser(
        account._id,
        { decision: "verified" },
        "admin"
      );
      setPendingUsers((current) => current.filter((item) => item._id !== account._id));
      setQueueCount((count) => Math.max(0, count - 1));
      setSuccessMessage(
        response.message || `${account.firstName} ${account.lastName} was verified.`
      );
    } catch (error) {
      console.error(`Could not approve account ${account._id}:`, error);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not approve this account."
      );
    } finally {
      setLoadingUserId(null);
    }
  };

  const rejectAccount = async (account: User) => {
    const fullName =
      `${account.firstName || ""} ${account.lastName || ""}`.trim() ||
      account.username ||
      "this account";
    if (
      !window.confirm(
        `Reject ${fullName}? The account will be marked for attention and deactivated.`
      )
    ) {
      return;
    }

    setLoadingUserId(account._id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const review = await usersApi.reviewUser(
        account._id,
        {
          decision: "needs_attention",
          note: "Registration rejected by an administrator.",
        },
        "admin"
      );
      setPendingUsers((current) => current.filter((item) => item._id !== account._id));
      setQueueCount((count) => Math.max(0, count - 1));

      try {
        await usersApi.deactivateUser(account._id);
        setSuccessMessage(review.message || `${fullName} was rejected and deactivated.`);
      } catch (deactivationError) {
        console.error(`Rejected account ${account._id} but could not deactivate it:`, deactivationError);
        setErrorMessage(
          `The registration was rejected, but deactivation failed: ${
            deactivationError instanceof Error
              ? deactivationError.message
              : "Unknown deactivation error."
          } The account may still be active; deactivate it from User Management.`
        );
      }
    } catch (error) {
      console.error(`Could not reject account ${account._id}:`, error);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not reject this account."
      );
    } finally {
      setLoadingUserId(null);
    }
  };

  if (sessionLoading || !allowed || !user) {
    return (
      <div className="min-h-screen bg-[#FAF9F5]">
        <Header title="Pending Accounts" subtitle="Checking administrator access…" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse border border-[#E2DDCF] bg-white" />
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FAF9F5]">
        <Header title="Pending Accounts" subtitle="Administrator access is required." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-16 text-[#1E2620]">
      <Header
        title="Pending Accounts"
        subtitle="Review new registrations and approve accounts for access."
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col justify-between gap-5 border border-[#E2DDCF] bg-white p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-[#A9812F]/30 bg-[#A9812F]/10 text-[#7A5D22]">
              <Users size={20} />
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9188]">
                Awaiting account review
              </p>
              <p className="mt-1 text-3xl italic leading-none text-[#1E2620]">
                {isLoading ? "—" : queueCount}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void fetchPendingUsers()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 border border-[#D9D4C6] bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#3A4239] transition hover:border-[#1E2620] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh queue
          </button>
        </section>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-4 text-sm text-[#8B4136]"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="flex items-start gap-3 border border-[#3F6B4F]/30 bg-[#3F6B4F]/10 p-4 text-sm text-[#2C4B38]"
          >
            <Check size={17} className="mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <section className="overflow-hidden border border-[#E2DDCF] bg-white">
          <div className="border-b border-[#EDEAE0] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#1E2620]">Registration requests</h2>
            <p className="mt-1 text-xs text-[#7A8079]">
              Verify a registration to approve the account.
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center text-[#8B9188]">
              <Loader2 size={22} className="animate-spin" />
              <span className="ml-2 text-sm">Loading pending accounts…</span>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
              <UserCheck size={28} strokeWidth={1.5} className="text-[#3F6B4F]" />
              <h3 className="mt-3 text-lg italic text-[#1E2620]">Queue is clear</h3>
              <p className="mt-1 max-w-md text-sm text-[#7A8079]">
                There are no pending registrations to review right now.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#EDEAE0]">
              {pendingUsers.map((account) => {
                const fullName =
                  `${account.firstName || ""} ${account.lastName || ""}`.trim() ||
                  account.username ||
                  "Unnamed account";
                const isProcessing = loadingUserId === account._id;

                return (
                  <li
                    key={account._id}
                    className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-[#1E2620]">{fullName}</h3>
                        <span className="inline-flex items-center gap-1 border border-[#A9812F]/30 bg-[#A9812F]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-[#7A5D22]">
                          <Clock3 size={10} /> Pending
                        </span>
                      </div>
                      <p className="text-xs text-[#7A8079]">@{account.username}</p>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#5A6259]">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail size={13} className="text-[#8B9188]" />
                          {account.email}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 size={13} className="text-[#8B9188]" />
                          {account.organization}
                        </span>
                        <span>
                          {ROLE_LABELS[account.role] || account.role}
                          {account.jobTitle ? ` · ${account.jobTitle}` : ""}
                        </span>
                        <span>
                          Registered{" "}
                          {new Date(account.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void acceptAccount(account)}
                        disabled={loadingUserId !== null}
                        className="inline-flex items-center justify-center gap-2 border border-[#3F6B4F] bg-[#3F6B4F] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-[#2C4B38] hover:bg-[#2C4B38] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        {isProcessing ? "Working…" : "Accept account"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void rejectAccount(account)}
                        disabled={loadingUserId !== null}
                        className="inline-flex items-center justify-center gap-2 border border-[#B65C4B]/40 bg-[#B65C4B]/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#8B4136] transition hover:border-[#B65C4B] hover:bg-[#B65C4B] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject &amp; deactivate
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
