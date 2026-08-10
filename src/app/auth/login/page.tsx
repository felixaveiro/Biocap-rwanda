"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Loader2, AlertCircle, Eye, EyeOff, Dna } from "lucide-react";
import { loginUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Role } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Helper function to map user roles to their respective dashboards
   */
  const getRedirectPathForRole = (role: Role | string): string => {
    switch (role) {
      case "admin":
        return "/admin";
      case "communication_officer":
        return "/officer";
      case "editor":
        return "/editor";
      case "social_media_content_creator":
      case "media_correspondent":
      case "principal_investigator":
        return "/creator/my-stories";
      default:
        return "/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.identifier.trim() || !form.password) {
      setError("Username or Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      // loginUser() automatically handles persisting session cookies via authCookies.setSession
      const response = await loginUser({
        email: form.identifier.trim(),
        password: form.password,
      });

      // Extract user role from response and route to their dashboard
      const userRole = response.role || response.user?.role || "";
      const redirectPath = getRedirectPathForRole(userRole);

      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Invalid credentials or server error. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#133248] via-[#235D74] to-[#632B70] overflow-hidden px-4 selection:bg-[#E52B67] selection:text-white">
      
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
          <line x1="32" y1="225" x2="68" y2="225" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="275" x2="68" y2="275" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="325" x2="68" y2="325" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      <div className="absolute bottom-[-15%] right-[-5%] w-[420px] h-[850px] text-white/15 pointer-events-none rotate-45 blur-[1px]">
        <svg viewBox="0 0 100 400" className="w-full h-full fill-none stroke-current stroke-2">
          <path d="M 30,0 Q 80,50 30,100 T 30,200 T 30,300 T 30,400" strokeWidth="3" />
          <path d="M 70,0 Q 20,50 70,100 T 70,200 T 70,300 T 70,400" strokeWidth="3" />
          <line x1="32" y1="25" x2="68" y2="25" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="75" x2="68" y2="75" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="125" x2="68" y2="125" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="175" x2="68" y2="175" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="225" x2="68" y2="225" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="275" x2="68" y2="275" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      <div className="absolute top-[8%] right-[8%] w-[220px] h-[220px] text-[#E52B67]/30 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current stroke-current">
          <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" className="fill-none stroke-2" />
          <circle cx="50" cy="15" r="4" />
          <circle cx="80" cy="32" r="4" />
          <circle cx="80" cy="68" r="4" />
          <circle cx="50" cy="85" r="4" />
          <circle cx="20" cy="68" r="4" />
          <circle cx="20" cy="32" r="4" />
          <line x1="80" y1="32" x2="95" y2="20" strokeWidth="2" />
          <circle cx="95" cy="20" r="3" />
        </svg>
      </div>

      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#E52B67]/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── MAIN BIOCAP GLASS CARD ── */}
      <div className="relative z-10 w-full max-w-md bg-white/25 backdrop-blur-md border border-white/40 rounded-[38px] p-8 sm:p-10 shadow-2xl shadow-[#133248]/50">
        
        {/* Avatar Header */}
        <div className="flex justify-center mb-3">
          <div className="relative w-16 h-16 rounded-full bg-[#133248] text-white flex items-center justify-center shadow-lg border border-[#E52B67]/40">
            <User className="w-9 h-9 stroke-[2.2]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E52B67] text-white flex items-center justify-center shadow-sm">
              <Dna className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-7 tracking-tight">
          <span className="text-[#E52B67]">Bio</span>
          <span className="text-[#133248]">Cap</span>{" "}
          <span className="text-[#133248] font-medium">Login</span>
        </h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 rounded-2xl bg-rose-500/20 border border-rose-500/40 p-3.5 flex items-center gap-2.5 text-white text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / Username Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username or Email"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-base rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] transition-all border border-white disabled:opacity-60"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={isSubmitting}
              className="w-full pl-6 pr-12 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-base rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] transition-all border border-white disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-[#E52B67] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center pt-2 pb-1">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-semibold text-[#133248] hover:text-[#E52B67] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Main Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-[#133248] hover:bg-[#0e273a] active:scale-[0.98] text-white font-semibold text-lg transition-all duration-200 shadow-xl shadow-[#133248]/40 border border-[#E52B67]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#E52B67]" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Footer Registration Link */}
        <div className="mt-8 text-center border-t border-[#133248]/15 pt-4">
          <p className="text-xs sm:text-sm text-[#133248] font-medium">
            No account?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-[#E52B67] hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}