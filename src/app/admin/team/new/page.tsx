'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import { usersApi, CreateUserPayload } from "@/lib/api/users";
import { useSession } from "@/hooks/useSession";
import {
  ROLE_LABELS,
  Role,
  ORGANIZATIONS,
  getRolesForOrganization,
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
  AlertCircle,
  IdCard,
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
    };

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

  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  // Shared field chrome — sharp corners, hairline borders, moss focus ring.
  // Kept as class strings (not components) so native form semantics/refs
  // stay untouched.
  const fieldWrap = "relative";
  const fieldIcon =
    "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#8B9188]";
  const fieldInput =
    "w-full border border-[#D9D4C6] bg-[#FAF9F5]/40 pl-10 pr-4 py-2.5 text-sm font-medium text-[#1E2620] placeholder:text-[#B3AF9F] transition focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10";
  const fieldInputPlain =
    "w-full border border-[#D9D4C6] bg-[#FAF9F5]/40 px-3.5 py-2.5 text-sm font-medium text-[#1E2620] placeholder:text-[#B3AF9F] transition focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10";
  const fieldLabel = "mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]";

  if (sessionLoading || !isPermissionAllowed || !currentAdminUser) {
    return (
      <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-16`} style={{ fontFamily: "var(--font-body)" }}>
        <Header title="Add Team Member" subtitle="Authenticating session credentials…" />
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse border border-[#E2DDCF] bg-white p-8">
            <div className="h-3 w-24 bg-[#EDEAE0]" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="h-10 bg-[#EDEAE0]" />
              <div className="h-10 bg-[#EDEAE0]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fontVars} min-h-screen bg-[#FAF9F5] pb-16`} style={{ fontFamily: "var(--font-body)" }}>
      <Header
        title="Add New Team Member"
        subtitle="Provision a new user account and assign system privileges"
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin/team"
          className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#7A8079] transition hover:text-[#1E2620]"
        >
          <ArrowLeft size={14} /> Back to Team Directory
        </Link>

        {submissionErrorMessage && (
          <div className="mb-6 flex items-center gap-3 border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-4 text-[#8B4136]">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm font-medium">{submissionErrorMessage}</p>
          </div>
        )}

        <form onSubmit={handleCreateMemberSubmit} className="space-y-6">
          {/* ─── Identity ─────────────────────────────────────────────── */}
          <div className="border border-[#E2DDCF] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#1E2620]">
              <IdCard size={15} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={monoFont}>
                Identity
              </p>
            </div>
            <h3 className="mt-2 text-xl italic text-[#1E2620]" style={displayFont}>
              Who they are
            </h3>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>First Name *</label>
                <div className={fieldWrap}>
                  <div className={fieldIcon}>
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={memberFirstName}
                    onChange={(e) => setMemberFirstName(e.target.value)}
                    placeholder="e.g. Jean"
                    className={fieldInput}
                  />
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Last Name *</label>
                <div className={fieldWrap}>
                  <div className={fieldIcon}>
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={memberLastName}
                    onChange={(e) => setMemberLastName(e.target.value)}
                    placeholder="e.g. Mugabo"
                    className={fieldInput}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className={fieldLabel}>Date of Birth</label>
              <div className={`${fieldWrap} sm:max-w-[calc(50%-0.75rem)]`}>
                <div className={fieldIcon}>
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={fieldInput}
                />
              </div>
            </div>
          </div>

          {/* ─── Credentials ──────────────────────────────────────────── */}
          <div className="border border-[#E2DDCF] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#3F6B4F]">
              <Lock size={15} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={monoFont}>
                Credentials
              </p>
            </div>
            <h3 className="mt-2 text-xl italic text-[#1E2620]" style={displayFont}>
              How they sign in
            </h3>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Username *</label>
                <input
                  type="text"
                  required
                  value={memberUsername}
                  onChange={(e) => setMemberUsername(e.target.value)}
                  placeholder="e.g. jmugabo"
                  className={fieldInputPlain}
                />
              </div>

              <div>
                <label className={fieldLabel}>Email Address *</label>
                <div className={fieldWrap}>
                  <div className={fieldIcon}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="name@biocap.org"
                    className={fieldInput}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className={fieldLabel}>Temporary Password *</label>
              <div className={`${fieldWrap} sm:max-w-[calc(50%-0.75rem)]`}>
                <div className={fieldIcon}>
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={memberPassword}
                  onChange={(e) => setMemberPassword(e.target.value)}
                  placeholder="••••••••"
                  className={fieldInput}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#8B9188]">
                They&apos;ll be asked to change this on first sign-in.
              </p>
            </div>
          </div>

          {/* ─── Affiliation & Access ─────────────────────────────────── */}
          <div className="border border-[#E2DDCF] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[#A9812F]">
              <ShieldCheck size={15} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={monoFont}>
                Affiliation &amp; Access
              </p>
            </div>
            <h3 className="mt-2 text-xl italic text-[#1E2620]" style={displayFont}>
              Where they work, what they can touch
            </h3>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Partner Institution *</label>
                <div className={fieldWrap}>
                  <div className={fieldIcon}>
                    <Building2 size={16} />
                  </div>
                  <select
                    value={organization}
                    onChange={(e) => handleOrganizationChange(e.target.value)}
                    className={`${fieldInput} appearance-none truncate pr-8 cursor-pointer`}
                  >
                    {ORGANIZATIONS.map((orgOption) => (
                      <option key={orgOption} value={orgOption}>
                        {orgOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Assigned Role *</label>
                <div className={fieldWrap}>
                  <div className={fieldIcon}>
                    <ShieldCheck size={16} />
                  </div>
                  <select
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value as Role)}
                    className={`${fieldInput} appearance-none pr-8 cursor-pointer`}
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

            {!isAfSRwanda && (
              <div className="mt-6">
                <label className={fieldLabel}>Job Title (Author Byline) *</label>
                <div className={fieldWrap}>
                  <div className={fieldIcon}>
                    <Briefcase size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Research Fellow"
                    className={fieldInput}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>
                  Organization Link {assignedRole === "media_correspondent" ? "*" : ""}
                </label>
                <div className={fieldWrap}>
                  <div className={fieldIcon}>
                    <Globe size={16} />
                  </div>
                  <input
                    type="url"
                    required={assignedRole === "media_correspondent"}
                    value={organizationLink}
                    onChange={(e) => setOrganizationLink(e.target.value)}
                    placeholder="https://biocap.org"
                    className={fieldInput}
                  />
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Social Handle</label>
                <div className={fieldWrap}>
                  <div className={fieldIcon}>
                    <AtSign size={16} />
                  </div>
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    placeholder="@jmugabo"
                    className={fieldInput}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Submit Action ────────────────────────────────────────── */}
          <div className="flex items-center justify-between border border-[#E2DDCF] bg-white px-6 py-5 sm:px-8">
            <p className="hidden text-[11px] text-[#8B9188] sm:block">
              Fields marked * are required before the account can be provisioned.
            </p>
            <button
              type="submit"
              disabled={isFormSubmitting}
              className="ml-auto inline-flex items-center justify-center gap-2 border border-[#3F6B4F]/40 bg-[#3F6B4F] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#2C4B38] hover:border-[#2C4B38] disabled:cursor-not-allowed disabled:opacity-60"
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