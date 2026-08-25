"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Trash2, CheckCircle2, AlertCircle, Save, User as UserIcon, Lock } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { updateProfile } from "@/lib/api/auth";
import Header from "@/components/Header";
import { Role, ORGANIZATIONS, ROLE_LABELS, getRolesForOrganization } from "@/types";

type SocialPlatform = "X (Twitter)" | "LinkedIn" | "Facebook" | "Instagram";

interface SocialHandleEntry {
  platform: SocialPlatform;
  value: string;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "X (Twitter)",
  "LinkedIn",
  "Facebook",
  "Instagram",
];

export default function ProfilePage() {
  const { user, loading } = useSession();

  // Basic Account Credentials
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Professional Credentials
  const [organization, setOrganization] = useState(ORGANIZATIONS[0] as string);
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState<Role>("principal_investigator");
  const [organizationLink, setOrganizationLink] = useState("");

  // Dynamic Social Handles
  const [socialEntries, setSocialEntries] = useState<SocialHandleEntry[]>([
    { platform: "X (Twitter)", value: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isAfSRwanda = organization === "Alliance for Science Rwanda (AfS-Rwanda)";
  const isMediaCorrespondent = role === "media_correspondent";

  const availableRoles = useMemo(() => {
    return getRolesForOrganization(organization);
  }, [organization]);

  // Populate profile fields from logged-in user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      
      if (user.dateOfBirth) {
        // Format ISO date string to YYYY-MM-DD for date input
        const formattedDob = user.dateOfBirth.split("T")[0];
        setDateOfBirth(formattedDob);
      }

      if (user.organization) {
        setOrganization(user.organization);
      }
      setJobTitle(user.jobTitle || "");
      if (user.role) {
        setRole(user.role);
      }
      setOrganizationLink(user.organizationLink || "");

      // Parse socialHandle into platform rows
      if (user.socialHandle) {
        const parts = user.socialHandle.split(" | ");
        const parsedEntries: SocialHandleEntry[] = parts.map((part) => {
          const [plat, ...valParts] = part.split(": ");
          const val = valParts.join(": ");
          const validPlatform = SOCIAL_PLATFORMS.includes(plat as SocialPlatform)
            ? (plat as SocialPlatform)
            : "X (Twitter)";
          return { platform: validPlatform, value: val || part };
        });

        if (parsedEntries.length > 0) {
          setSocialEntries(parsedEntries);
        }
      }
    }
  }, [user]);

  const handleSocialEntryChange = (index: number, field: "platform" | "value", val: string) => {
    setSocialEntries((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const addSocialEntry = () => {
    setSocialEntries((prev) => [...prev, { platform: "LinkedIn", value: "" }]);
  };

  const removeSocialEntry = (index: number) => {
    if (socialEntries.length === 1) return; // Retain at least 1 row
    setSocialEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMessage("");

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("First name and last name are required.");
      return;
    }

    if (!isAfSRwanda && !jobTitle.trim()) {
      setErrorMsg("Job title is required for your partner institution.");
      return;
    }

    if (isMediaCorrespondent && !organizationLink.trim()) {
      setErrorMsg("An organization link is required for Media Correspondent accounts.");
      return;
    }

    // Ensure at least 1 valid social handle entry exists
    const validSocialEntries = socialEntries.filter((item) => item.value.trim().length > 0);
    if (validSocialEntries.length === 0) {
      setErrorMsg("At least one social media handle is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const activeJobTitle = jobTitle.trim() || (isAfSRwanda ? "AfS Representative" : "Contributor");

      // Serialize social entries into standard string format
      const formattedSocialHandle = validSocialEntries
        .map((e) => `${e.platform}: ${e.value.trim()}`)
        .join(" | ");

      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        jobTitle: activeJobTitle,
        organizationLink: organizationLink.trim(),
        socialHandle: formattedSocialHandle,
      });

      setSuccessMessage("Profile updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F3F2ED] pb-16">
        <Header title="User Profile" subtitle="Loading profile details..." />
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="h-80 animate-pulse border border-[#E2DDCF] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2ED] pb-16 text-[#1E2620]">
      <Header title="Edit Profile" subtitle="Manage your account credentials, partner institution details, and social handles" />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="border border-[#E2DDCF] bg-white p-6 sm:p-8 space-y-6 shadow-xs">

          {/* Header Info Banner */}
          <div className="flex items-center gap-3 border-b border-[#EDEAE0] pb-5">
            <div className="flex h-10 w-10 items-center justify-center border border-[#1E2620] bg-[#1E2620] text-white font-bold text-sm">
              <UserIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E2620]">
                {firstName ? `${firstName} ${lastName}` : username}
              </h2>
              <p className="text-xs text-[#5A6259]">
                {organization} &bull; <span className="font-semibold text-[#3F6B4F]">{ROLE_LABELS[role] || role}</span>
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-sm border-l-2 border-[#B65C4B] bg-[#FBEEEC] p-3.5 text-xs font-semibold text-[#7A362A]">
              <AlertCircle size={16} className="shrink-0 text-[#B65C4B]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 rounded-sm border-l-2 border-[#3F6B4F] bg-[#F1F5F1] p-3.5 text-xs font-semibold text-[#274836]">
              <CheckCircle2 size={16} className="shrink-0 text-[#3F6B4F]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SECTION 1: Personal Account Info */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9812F]">
                Personal Identity &amp; Credentials
              </p>

              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6259]">
                    First Name <span className="text-[#B65C4B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-[#D9D4C6] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6259]">
                    Last Name <span className="text-[#B65C4B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-[#D9D4C6] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Username & Email (System Account Identifiers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase text-[#5A6259]">
                    <span>Username</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#8B9188]"><Lock size={10} /> Account ID</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full border border-[#EDEAE0] bg-[#FAF9F5] px-3.5 py-2 text-xs font-medium text-[#7A8079] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase text-[#5A6259]">
                    <span>Email Address</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#8B9188]"><Lock size={10} /> Verified</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full border border-[#EDEAE0] bg-[#FAF9F5] px-3.5 py-2 text-xs font-medium text-[#7A8079] cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6259]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full border border-[#D9D4C6] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                />
              </div>
            </div>

            {/* SECTION 2: Professional Details & Role */}
            <div className="border-t border-[#EDEAE0] pt-5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A9812F]">
                Institutional Affiliation &amp; Byline
              </p>

              {/* Partner Institution & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase text-[#5A6259]">
                    <span>Partner Institution</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#8B9188]"><Lock size={10} /> System Assigned</span>
                  </label>
                  <input
                    type="text"
                    value={organization}
                    disabled
                    className="w-full border border-[#EDEAE0] bg-[#FAF9F5] px-3.5 py-2 text-xs font-medium text-[#7A8079] cursor-not-allowed truncate"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6259]">
                    Job Title (Author Byline) {!isAfSRwanda && <span className="text-[#B65C4B]">*</span>}
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Project Manager"
                    className="w-full border border-[#D9D4C6] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Account Role & Organization Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 flex items-center justify-between text-xs font-semibold uppercase text-[#5A6259]">
                    <span>Account Role</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#8B9188]"><Lock size={10} /> Access Level</span>
                  </label>
                  <input
                    type="text"
                    value={ROLE_LABELS[role] || role}
                    disabled
                    className="w-full border border-[#EDEAE0] bg-[#FAF9F5] px-3.5 py-2 text-xs font-medium text-[#7A8079] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-[#5A6259]">
                    Organization Link {isMediaCorrespondent && <span className="text-[#B65C4B]">*</span>}
                  </label>
                  <input
                    type="url"
                    value={organizationLink}
                    onChange={(e) => setOrganizationLink(e.target.value)}
                    placeholder="https://organization.org"
                    className="w-full border border-[#D9D4C6] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Dynamic Social Media Handles */}
            <div className="border-t border-[#EDEAE0] pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase text-[#5A6259]">
                  Social Media Handles <span className="text-[#B65C4B]">* (At least 1 required)</span>
                </label>
                <button
                  type="button"
                  onClick={addSocialEntry}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#3F6B4F] hover:underline cursor-pointer"
                >
                  <Plus size={13} /> Add Platform
                </button>
              </div>

              {socialEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={entry.platform}
                    onChange={(e) => handleSocialEntryChange(idx, "platform", e.target.value as SocialPlatform)}
                    disabled={isSubmitting}
                    className="w-2/5 border border-[#D9D4C6] bg-white px-2.5 py-2 text-xs font-semibold text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none cursor-pointer"
                  >
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder={
                      entry.platform === "X (Twitter)"
                        ? "@username or profile link *"
                        : entry.platform === "LinkedIn"
                        ? "linkedin.com/in/username *"
                        : `${entry.platform} handle/link *`
                    }
                    value={entry.value}
                    onChange={(e) => handleSocialEntryChange(idx, "value", e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1 border border-[#D9D4C6] bg-white px-3.5 py-2 text-xs font-medium text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
                  />

                  {socialEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialEntry(idx)}
                      disabled={isSubmitting}
                      className="p-1.5 text-[#B65C4B] hover:opacity-75 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Save Profile Button */}
            <div className="border-t border-[#EDEAE0] pt-5 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#F3F2ED] transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}