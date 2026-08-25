"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  MessageCircle
} from "lucide-react";
import { registerUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { 
  Role, 
  ORGANIZATIONS, 
  ROLE_LABELS, 
  getRolesForOrganization 
} from "@/types";

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

/**
 * Helper to render platform-specific SVG icons matching published articles
 */
const renderSocialPlatformIcon = (platformName: string) => {
  const p = platformName.toLowerCase();
  
  if (p.includes('x') || p.includes('twitter')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-slate-900 shrink-0">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-[#0A66C2] shrink-0">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-[#1877F2] shrink-0">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }
  if (p.includes('instagram')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-[#E4405F] shrink-0">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 2.156 4.919 5.406.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 5.255-4.919 5.404-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-2.199-4.919-5.404-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-5.255 4.919-5.406 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  return <MessageCircle size={16} className="text-[#E52B67] shrink-0" />;
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    organization: ORGANIZATIONS[0] as string,
    jobTitle: "",
    organizationLink: "",
    role: "principal_investigator" as Role,
  });

  const [socialEntries, setSocialEntries] = useState<SocialHandleEntry[]>([
    { platform: "X (Twitter)", value: "" },
  ]);

  // Track active dropdown menu index for platform selection
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAfSRwanda = form.organization === "Alliance for Science Rwanda (AfS-Rwanda)";

  const availableRoles = useMemo(() => {
    return getRolesForOrganization(form.organization);
  }, [form.organization]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOrganizationChange = (newOrg: string) => {
    const validRoles = getRolesForOrganization(newOrg);
    setForm((prev) => ({
      ...prev,
      organization: newOrg,
      role: validRoles[0],
    }));
  };

  const handleSocialEntryChange = (index: number, field: "platform" | "value", val: string) => {
    setSocialEntries((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
    if (field === "platform") {
      setOpenDropdownIdx(null);
    }
  };

  const addSocialEntry = () => {
    setSocialEntries((prev) => [...prev, { platform: "LinkedIn", value: "" }]);
  };

  const removeSocialEntry = (index: number) => {
    if (socialEntries.length === 1) return;
    setSocialEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.organization ||
      (!isAfSRwanda && !form.jobTitle.trim()) ||
      !form.role
    ) {
      setError(
        isAfSRwanda
          ? "Please fill out all required fields."
          : "Please fill out all required fields, including Organization and Job Title."
      );
      return;
    }

    const validSocialEntries = socialEntries.filter((item) => item.value.trim().length > 0);
    if (validSocialEntries.length === 0) {
      setError("At least one social media handle is required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.role === "media_correspondent" && !form.organizationLink.trim()) {
      setError("An organization link is required for Media Correspondent accounts.");
      return;
    }

    setIsSubmitting(true);

    try {
      const activeJobTitle = form.jobTitle.trim() || (isAfSRwanda ? "AfS Representative" : "Contributor");

      const formattedSocialHandle = validSocialEntries
        .map((e) => {
          let cleanValue = e.value.trim();

          if (cleanValue.startsWith('@')) {
            cleanValue = cleanValue.substring(1);
          }

          cleanValue = cleanValue.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i, '');
          cleanValue = cleanValue.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '');
          cleanValue = cleanValue.replace(/^https?:\/\/(www\.)?facebook\.com\//i, '');
          cleanValue = cleanValue.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');

          return `${e.platform}: ${cleanValue}`;
        })
        .join(" | ");

      const response = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        organization: form.organization,
        jobTitle: activeJobTitle,
        job_title: activeJobTitle,
        title: activeJobTitle,
        organizationLink: form.organizationLink.trim() || undefined,
        organization_link: form.organizationLink.trim() || undefined,
        socialHandle: formattedSocialHandle,
        social_handle: formattedSocialHandle,
        role: form.role,
      });

      setSuccessMessage(response.message || "Registration successful!");
      setTimeout(() => router.push("/auth/login"), 1800);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const message =
        err instanceof ApiError 
          ? err.message 
          : err instanceof Error 
          ? err.message 
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#133248] via-[#235D74] to-[#632B70] overflow-hidden px-4 py-6 selection:bg-[#E52B67] selection:text-white">
      
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[280px] h-[600px] text-[#E52B67]/15 pointer-events-none -rotate-12 blur-[1px]">
        <svg viewBox="0 0 100 400" className="w-full h-full fill-none stroke-current stroke-2">
          <path d="M 30,0 Q 80,50 30,100 T 30,200 T 30,300 T 30,400" strokeWidth="3" />
          <path d="M 70,0 Q 20,50 70,100 T 70,200 T 70,300 T 70,400" strokeWidth="3" />
        </svg>
      </div>

      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#E52B67]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-xl bg-white/25 backdrop-blur-md border border-white/40 rounded-[28px] p-5 sm:p-7 shadow-2xl shadow-[#133248]/50 my-auto">
        
        {/* Header */}
        <div className="flex justify-center mb-2">
          <div className="relative w-14 h-14 rounded-full bg-white border-2 border-[#E52B67] shadow-md flex items-center justify-center overflow-hidden p-1.5">
            <img 
              src="/image/biocap-logo.png" 
              alt="BioCap Logo" 
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                e.currentTarget.src = "/image/rab-logo.png";
              }}
            />
          </div>
        </div>

        <h1 className="text-xl font-bold text-center mb-0.5 tracking-tight">
          <span className="text-[#E52B67]">Bio</span>
          <span className="text-[#133248]">Cap</span>{" "}
          <span className="text-[#133248] font-medium">Registration</span>
        </h1>
        <p className="text-center text-xs text-[#133248]/80 font-medium mb-4">
          Create an account to join the Rwanda BioCap platform
        </p>

        {/* Alerts */}
        {error && (
          <div className="mb-3 rounded-xl bg-rose-500/20 border border-rose-500/40 p-2.5 flex items-center gap-2 text-white text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2.5 flex items-center gap-2 text-emerald-100 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{successMessage} Redirecting to login...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="First Name *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
            <input
              type="text"
              placeholder="Last Name *"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Username *"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
            <input
              type="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* Security & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 chars) *"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isSubmitting}
                className="w-full pl-4 pr-9 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#E52B67] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* Organization & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#133248] mb-0.5 ml-2">
                Partner Institution *
              </label>
              <select
                value={form.organization}
                onChange={(e) => handleOrganizationChange(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 bg-white/95 text-[#133248] font-medium text-xs rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white cursor-pointer truncate disabled:opacity-60"
              >
                {ORGANIZATIONS.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            {!isAfSRwanda ? (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#133248] mb-0.5 ml-2">
                  Job Title (Author Byline) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Project Manager"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#133248] mb-0.5 ml-2">
                  Account Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 bg-white/95 text-[#133248] font-medium text-xs rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white cursor-pointer disabled:opacity-60"
                >
                  {availableRoles.map((roleKey) => (
                    <option key={roleKey} value={roleKey}>
                      {ROLE_LABELS[roleKey]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!isAfSRwanda && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#133248] mb-0.5 ml-2">
                Account Role *
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 bg-white/95 text-[#133248] font-medium text-xs rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white cursor-pointer disabled:opacity-60"
              >
                {availableRoles.map((roleKey) => (
                  <option key={roleKey} value={roleKey}>
                    {ROLE_LABELS[roleKey]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Org Link */}
          <div>
            <input
              type="url"
              placeholder={form.role === "media_correspondent" ? "Organization Link (Required) *" : "Organization Link (Optional)"}
              value={form.organizationLink}
              onChange={(e) => setForm({ ...form, organizationLink: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* ── DYNAMIC SOCIAL MEDIA HANDLES (Interactive Styled Dropdown) ── */}
          <div className="space-y-2 pt-1 border-t border-white/20" ref={dropdownRef}>
            <div className="ml-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#133248]">
                Social Media Handles <span className="text-[#E52B67]">* (At least 1 required)</span>
              </label>
            </div>

            {socialEntries.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                
                {/* Custom Interactive Brand Icon Menu Button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1 px-3 py-2 bg-white/95 text-[#133248] rounded-full border border-white shadow-inner hover:bg-white transition-all cursor-pointer"
                  >
                    {renderSocialPlatformIcon(entry.platform)}
                    <ChevronDown size={12} className="text-slate-500" />
                  </button>

                  {/* High-Contrast Interactive Popup Menu */}
                  {openDropdownIdx === idx && (
                    <div className="absolute left-0 top-full mt-1 z-50 w-44 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-xl space-y-0.5">
                      {SOCIAL_PLATFORMS.map((plat) => (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => handleSocialEntryChange(idx, "platform", plat)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors cursor-pointer ${
                            entry.platform === plat
                              ? "bg-[#133248] text-white"
                              : "text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          {renderSocialPlatformIcon(plat)}
                          <span className={entry.platform === plat ? "text-white" : "text-slate-800"}>
                            {plat}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Username Input */}
                <input
                  type="text"
                  placeholder={
                    entry.platform === "X (Twitter)"
                      ? "x.com handle (e.g. careconnecxs) *"
                      : entry.platform === "LinkedIn"
                      ? "LinkedIn username (e.g. john-doe) *"
                      : `${entry.platform} handle *`
                  }
                  value={entry.value}
                  onChange={(e) => handleSocialEntryChange(idx, "value", e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
                />

                {socialEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSocialEntry(idx)}
                    disabled={isSubmitting}
                    className="p-1.5 text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}

            {/* Add Platform Button at Bottom */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={addSocialEntry}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E52B67] hover:underline cursor-pointer"
              >
                <Plus size={12} /> Add Platform
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-2.5 px-5 rounded-full bg-[#133248] hover:bg-[#0e273a] active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-[#133248]/30 border border-[#E52B67]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#E52B67]" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center border-t border-[#133248]/15 pt-2.5">
          <p className="text-xs text-[#133248] font-medium">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-[#E52B67] hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}