"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Calendar, 
  Building2, 
  Briefcase, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Dna,
  UserCheck,
  Eye,
  EyeOff,
  Globe,
  AtSign
} from "lucide-react";
import { registerUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Role } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    organization: "",
    organizationLink: "",
    socialHandle: "",
    role: "social_media_content_creator" as Role,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.firstName ||
      !form.lastName ||
      !form.role
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.role === "broadcast_content_creator" && !form.organizationLink) {
      setError("An organization link is required for Broadcast Content Creator accounts.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth || undefined,
        organization: form.organization || undefined,
        organizationLink: form.organizationLink || undefined,
        socialHandle: form.socialHandle || undefined,
        role: form.role,
      });

      setSuccessMessage(response.message);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#133248] via-[#235D74] to-[#632B70] overflow-hidden px-4 py-10 selection:bg-[#E52B67] selection:text-white">
      
      {/* ── BIOCAP DNA HELIX & MOLECULAR BACKGROUND GRAPHICS ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[380px] h-[800px] text-[#E52B67]/20 pointer-events-none -rotate-12 blur-[1px]">
        <svg viewBox="0 0 100 400" className="w-full h-full fill-none stroke-current stroke-2">
          <path d="M 30,0 Q 80,50 30,100 T 30,200 T 30,300 T 30,400" strokeWidth="3" />
          <path d="M 70,0 Q 20,50 70,100 T 70,200 T 70,300 T 70,400" strokeWidth="3" />
          <line x1="32" y1="25" x2="68" y2="25" strokeWidth="1.5" opacity="0.6" />
          <line x1="50" y1="50" x2="50" y2="50" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="75" x2="68" y2="75" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="125" x2="68" y2="125" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="175" x2="68" y2="175" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      <div className="absolute bottom-[-15%] right-[-5%] w-[420px] h-[850px] text-white/15 pointer-events-none rotate-45 blur-[1px]">
        <svg viewBox="0 0 100 400" className="w-full h-full fill-none stroke-current stroke-2">
          <path d="M 30,0 Q 80,50 30,100 T 30,200 T 30,300 T 30,400" strokeWidth="3" />
          <path d="M 70,0 Q 20,50 70,100 T 70,200 T 70,300 T 70,400" strokeWidth="3" />
        </svg>
      </div>

      {/* ── MAIN BIOCAP GLASS CARD ── */}
      <div className="relative z-10 w-full max-w-2xl bg-white/25 backdrop-blur-md border border-white/40 rounded-[38px] p-7 sm:p-10 shadow-2xl shadow-[#133248]/50 my-6">
        
        {/* Avatar Header */}
        <div className="flex justify-center mb-3">
          <div className="relative w-16 h-16 rounded-full bg-[#133248] text-white flex items-center justify-center shadow-lg border border-[#E52B67]/40">
            <UserCheck className="w-9 h-9 stroke-[2]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E52B67] text-white flex items-center justify-center shadow-sm">
              <Dna className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1 tracking-tight">
          <span className="text-[#E52B67]">Bio</span>
          <span className="text-[#133248]">Cap</span>{" "}
          <span className="text-[#133248] font-medium">Registration</span>
        </h1>
        <p className="text-center text-xs sm:text-sm text-[#133248]/80 font-medium mb-6">
          Create an account to join the BioCap platform
        </p>

        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-2xl bg-rose-500/20 border border-rose-500/40 p-3.5 flex items-center gap-2.5 text-white text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-3.5 flex items-center gap-2.5 text-emerald-100 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{successMessage} Redirecting to login...</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
            <input
              type="text"
              placeholder="Last Name *"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Username *"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
            <input
              type="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* Password & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 characters) *"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isSubmitting}
                className="w-full pl-6 pr-12 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-[#E52B67]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* Organization & Account Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Organization"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60 cursor-pointer"
            >
              <option value="social_media_content_creator">Social Media Content Creator</option>
              <option value="broadcast_content_creator">Broadcast Content Creator</option>
              <option value="editor">Editor</option>
              <option value="communication_officer">Communication Officer</option>
            </select>
          </div>

          {/* Role Specific Inputs: Link & Social Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="url"
              placeholder={form.role === "broadcast_content_creator" ? "Organization Link (Required) *" : "Organization Link (Optional)"}
              value={form.organizationLink}
              onChange={(e) => setForm({ ...form, organizationLink: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
            <input
              type="text"
              placeholder="Social Handle (e.g. @biocap)"
              value={form.socialHandle}
              onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] border border-white disabled:opacity-60"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#133248] hover:bg-[#0e273a] active:scale-[0.98] text-white font-semibold text-lg transition-all shadow-xl shadow-[#133248]/40 border border-[#E52B67]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#E52B67]" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-7 text-center border-t border-[#133248]/15 pt-4">
          <p className="text-xs sm:text-sm text-[#133248] font-medium">
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