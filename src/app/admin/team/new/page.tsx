'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { usersApi, CreateUserPayload } from "@/lib/api/users";
import { useSession } from "@/hooks/useSession";
import { 
  ROLE_LABELS, 
  Role, 
  ORGANIZATIONS, 
  getRolesForOrganization 
} from "@/types";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Globe,
  AtSign,
  Calendar,
  Briefcase,
} from "lucide-react";

export default function CreateTeamMemberPage() {
  const { user: currentAdminUser, loading: sessionLoading, allowed: isPermissionAllowed } =
    useSession("user:create");
  const navigationRouter = useRouter();

  // Form Field States matching exact CreateUserPayload schema
  const [memberFirstName, setMemberFirstName] = useState("");
  const [memberLastName, setMemberLastName] = useState("");
  const [memberUsername, setMemberUsername] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [organization, setOrganization] = useState<string>(ORGANIZATIONS[0]);
  const [jobTitle, setJobTitle] = useState("");
  const [assignedRole, setAssignedRole] = useState<Role>("media_correspondent");
  const [organizationLink, setOrganizationLink] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Status States
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<string | null>(null);

  // Check if AfS-Rwanda is selected
  const isAfSRwanda = organization === "Alliance for Science Rwanda (AfS-Rwanda)";

  // Dynamically calculate available roles whenever organization changes
  const availableRoles = useMemo(() => {
    return getRolesForOrganization(organization);
  }, [organization]);

  // Handle Organization Change & sync default valid role
  const handleOrganizationChange = (newOrg: string) => {
    const validRoles = getRolesForOrganization(newOrg);
    const selectedIsAfS = newOrg === "Alliance for Science Rwanda (AfS-Rwanda)";

    setOrganization(newOrg);
    setAssignedRole(validRoles[0]);
    if (selectedIsAfS) {
      setJobTitle("");
    }
  };

  const handleCreateMemberSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsFormSubmitting(true);
    setSubmissionErrorMessage(null);

    // Build payload explicitly typed as CreateUserPayload
    const payload: CreateUserPayload = {
      username: memberUsername.trim(),
      email: memberEmail.trim(),
      password: memberPassword,
      firstName: memberFirstName.trim(),
      lastName: memberLastName.trim(),
      role: assignedRole,
      organization: organization,
      jobTitle: isAfSRwanda ? undefined : jobTitle.trim(),
      organizationLink: organizationLink.trim() || undefined,
      socialHandle: socialHandle.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
    } as any;

    try {
      // Pass payload as required by usersApi.createUser
      await usersApi.createUser(payload);

      // Successfully provisioned user -> Navigate back to team list
      navigationRouter.push("/admin/team");
    } catch (error: unknown) {
      console.error("Failed to provision team member:", error);
      const detailedMessage =
        error instanceof Error ? error.message : "Failed to create team member.";
      setSubmissionErrorMessage(detailedMessage);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  if (sessionLoading || !isPermissionAllowed || !currentAdminUser) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <Header title="Add Team Member" subtitle="Verifying permissions…" />
        <div className="p-8 text-sm text-slate-400">Loading form…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header
        title="Add New Team Member"
        subtitle="Provision a new user account and assign system privileges"
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin/team"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={14} /> Back to Team Directory
        </Link>

        {submissionErrorMessage && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {submissionErrorMessage}
          </div>
        )}

        <form
          onSubmit={handleCreateMemberSubmit}
          className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs"
        >
          {/* First & Last Name */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                First Name *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={memberFirstName}
                  onChange={(e) => setMemberFirstName(e.target.value)}
                  placeholder="e.g. Jean"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={memberLastName}
                  onChange={(e) => setMemberLastName(e.target.value)}
                  placeholder="e.g. Mugabo"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Username *
              </label>
              <input
                type="text"
                required
                value={memberUsername}
                onChange={(e) => setMemberUsername(e.target.value)}
                placeholder="e.g. jmugabo"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="name@biocap.org"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          {/* Password & Organization */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Temporary Password *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={memberPassword}
                  onChange={(e) => setMemberPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Partner Institution *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Building2 size={16} />
                </div>
                <select
                  value={organization}
                  onChange={(e) => handleOrganizationChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 pl-10 pr-8 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer truncate"
                >
                  {ORGANIZATIONS.map((orgOption) => (
                    <option key={orgOption} value={orgOption}>
                      {orgOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Job Title & Dynamic Role selection */}
          <div className={`grid gap-6 ${isAfSRwanda ? "grid-cols-1" : "sm:grid-cols-2"}`}>
            {!isAfSRwanda && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Job Title (Author Byline) *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Briefcase size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Research Fellow"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Assigned Role *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <ShieldCheck size={16} />
                </div>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value as Role)}
                  className="w-full appearance-none rounded-xl border border-slate-200 pl-10 pr-8 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                >
                  {availableRoles.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {ROLE_LABELS[roleOption] || roleOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Organization Link & Social Handle */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Organization Link {assignedRole === "media_correspondent" ? "*" : ""}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Globe size={16} />
                </div>
                <input
                  type="url"
                  required={assignedRole === "media_correspondent"}
                  value={organizationLink}
                  onChange={(e) => setOrganizationLink(e.target.value)}
                  placeholder="https://biocap.org"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Social Handle
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <AtSign size={16} />
                </div>
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder="@jmugabo"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Calendar size={16} />
              </div>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isFormSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              {isFormSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              Create Account
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}