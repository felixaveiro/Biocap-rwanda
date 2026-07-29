"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import {
  User as UserIcon,
  Mail,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  KeyRound,
} from "lucide-react";
import { ROLES, ROLE_LABELS, Role, User } from "@/types";
import { usersApi } from "@/lib/api/users";

interface Props {
  mode: "create" | "edit";
  canEditRole: boolean;
  currentUserRole?: Role;
  initial?: User & {
    id?: string;
    active?: boolean;
    isActive?: boolean;
  };
}

export default function UserForm({
  mode,
  canEditRole,
  currentUserRole,
  initial,
}: Props) {
  const router = useRouter();

  const userId = initial?._id || initial?.id || "";
  const initialActive = initial?.isActive ?? initial?.active ?? true;

  // Form State
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(
    initial?.role ?? ("SOCIAL_MEDIA_CONTENT_CREATOR" as Role)
  );
  const [organization, setOrganization] = useState(initial?.organization ?? "");
  const [organizationLink, setOrganizationLink] = useState(initial?.organizationLink ?? "");
  const [active, setActive] = useState(initialActive);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e?: FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    if (mode === "create" && (!username.trim() || !password)) {
      setError("Username and Password are required for new accounts.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "create") {
        // ─── CREATE USER ────────────────────────────────────────────────
        await usersApi.createUser({
          username: username.trim(),
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role,
          organization: organization.trim() || undefined,
          organizationLink: organizationLink.trim() || undefined,
        });
      } else {
        // ─── EDIT USER ──────────────────────────────────────────────────
        // 1. Update Profile Information
        await usersApi.updateUser(userId, {
          username: username.trim() || undefined,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          organization: organization.trim() || undefined,
          organizationLink: organizationLink.trim() || undefined,
        });

        // 2. Update Role (If Changed & Permitted)
        if (canEditRole && role !== initial?.role) {
          await usersApi.changeUserRole(
            userId,
            role,
            organizationLink.trim() || undefined
          );
        }

        // 3. Toggle Activation State (If Changed)
        if (active !== initialActive) {
          if (active) {
            await usersApi.reactivateUser(userId);
          } else {
            await usersApi.deactivateUser(userId);
          }
        }
      }

      router.push("/dashboard/users");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save user";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {mode === "create" ? "Create New Account" : "Edit User Profile"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "create"
              ? "Provision a new system user account."
              : "Update user information, access roles, and account status."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      {/* Main Form Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
        {error && (
          <div className="flex items-center gap-3 border-b border-rose-100 bg-rose-50/80 px-6 py-4 text-sm font-medium text-rose-800">
            <AlertCircle size={18} className="flex-shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={save} className="divide-y divide-slate-100">
          <div className="space-y-6 p-6 md:p-8">
            {/* First & Last Name Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Felix"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Rugangazi"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Username & Email Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="felix.rugangazi"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="b.felix@afs-rwanda.org"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Password Field (Create Mode Only) */}
            {mode === "create" && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Access Level / Role
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Shield size={16} />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  disabled={!canEditRole}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r] || r}
                    </option>
                  ))}
                </select>
              </div>
              {!canEditRole && (
                <p className="mt-2 text-xs text-slate-400">
                  🔒 You require elevated administrator permissions to modify system roles.
                </p>
              )}
            </div>

            {/* Organization & Link Optional Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="AFS-RWANDA"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Organization Link
                </label>
                <input
                  type="url"
                  value={organizationLink}
                  onChange={(e) => setOrganizationLink(e.target.value)}
                  placeholder="https://afs-rwanda.org"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Active Toggle Switch (Edit Mode Only) */}
            {mode === "edit" && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Account Status
                  </div>
                  <div className="text-xs text-slate-500">
                    {active
                      ? "User account is active and able to log in."
                      : "Account is suspended/deactivated."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className="text-indigo-600 transition hover:text-indigo-700"
                >
                  {active ? (
                    <ToggleRight size={32} className="text-indigo-600" />
                  ) : (
                    <ToggleLeft size={32} className="text-slate-300" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Form Action Footer */}
          <div className="flex items-center justify-end gap-3 bg-slate-50/70 px-6 py-4 md:px-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !firstName.trim() || !lastName.trim() || !email.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  {mode === "create" ? "Create Account" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}