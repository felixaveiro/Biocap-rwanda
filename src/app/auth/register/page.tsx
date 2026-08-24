"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Eye,
  EyeOff
} from "lucide-react";
import { registerUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { 
  Role, 
  ORGANIZATIONS, 
  ROLE_LABELS, 
  getRolesForOrganization 
} from "@/types";

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
    socialHandle: "",
    role: "principal_investigator" as Role,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAfSRwanda = form.organization === "Alliance for Science Rwanda (AfS-Rwanda)";

  const availableRoles = useMemo(() => {
    return getRolesForOrganization(form.organization);
  }, [form.organization]);

  const handleOrganizationChange = (newOrg: string) => {
    const validRoles = getRolesForOrganization(newOrg);

    setForm((prev) => ({
      ...prev,
      organization: newOrg,
      role: validRoles[0],
    }));
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
        socialHandle: form.socialHandle.trim() || undefined,
        social_handle: form.socialHandle.trim() || undefined,
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
      
      {/* Background Graphic Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-[280px] h-[600px] text-[#E52B67]/15 pointer-events-none -rotate-12 blur-[1px]">
        <svg viewBox="0 0 100 400" className="w-full h-full fill-none stroke-current stroke-2">
          <path d="M 30,0 Q 80,50 30,100 T 30,200 T 30,300 T 30,400" strokeWidth="3" />
          <path d="M 70,0 Q 20,50 70,100 T 70,200 T 70,300 T 70,400" strokeWidth="3" />
        </svg>
      </div>

      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#E52B67]/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── MAIN COMPACT GLASS CARD ── */}
      <div className="relative z-10 w-full max-w-xl bg-white/25 backdrop-blur-md border border-white/40 rounded-[28px] p-5 sm:p-7 shadow-2xl shadow-[#133248]/50 my-auto">
        
        {/* Logo Header */}
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

        {/* Title */}
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          
          {/* First & Last Name */}
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

          {/* Username & Email */}
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

          {/* Password & DOB */}
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

          {/* Partner Institution & Job Title */}
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

          {/* Optional Links & Social Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="url"
              placeholder={form.role === "media_correspondent" ? "Organization Link (Required) *" : "Organization Link (Optional)"}
              value={form.organizationLink}
              onChange={(e) => setForm({ ...form, organizationLink: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
            <input
              type="text"
              placeholder="Social Handle (e.g. @biocap)"
              value={form.socialHandle}
              onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-xs sm:text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-5 rounded-full bg-[#133248] hover:bg-[#0e273a] active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-[#133248]/30 border border-[#E52B67]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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