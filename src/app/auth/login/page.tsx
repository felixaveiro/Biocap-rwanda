'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, Eye, EyeOff, Clock } from "lucide-react";
import { loginUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Role } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🟢 Detect if session expired redirect parameter is present in URL
  const isExpired = searchParams?.get("expired") === "true";

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await loginUser({
        email: form.identifier.trim(),
        password: form.password,
      });

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
    <div className="relative z-10 w-full max-w-sm bg-white/25 backdrop-blur-md border border-white/40 rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-[#133248]/50">
      
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
      <h1 className="text-xl font-bold text-center mb-4 tracking-tight">
        <span className="text-[#E52B67]">Bio</span>
        <span className="text-[#133248]">Cap</span>{" "}
        <span className="text-[#133248] font-medium">Login</span>
      </h1>

      {/* 🟢 Session Expired Alert Banner */}
      {isExpired && (
        <div className="mb-4 rounded-xl bg-amber-500/20 border border-amber-500/40 p-2.5 flex items-center gap-2 text-amber-100 text-xs font-semibold">
          <Clock className="w-4 h-4 text-amber-300 shrink-0" />
          <span>Your session has expired. Please log in again to continue.</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 p-2.5 flex items-center gap-2 text-white text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Username/Email */}
        <div className="relative">
          <input
            type="text"
            placeholder="Username or Email"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            disabled={isSubmitting}
            className="w-full px-5 py-2.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] transition-all border border-white disabled:opacity-60"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={isSubmitting}
            className="w-full pl-5 pr-10 py-2.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] transition-all border border-white disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#8b4136] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right pt-0.5 pb-0.5">
          <Link
            href="/auth/forgot-password"
            className="text-xs font-semibold text-[#133248] hover:text-[#8b4136] transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-5 rounded-full bg-[#133248] hover:bg-[#0e273a] active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#133248]/30 border border-[#E52B67]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#8b4136]" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-5 text-center border-t border-[#133248]/15 pt-3">
        <p className="text-xs text-[#133248] font-medium">
          No account?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-[#8b4136] hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#133248] via-[#235D74] to-[#632B70] overflow-hidden px-4 selection:bg-[#E52B67] selection:text-white">
      
      {/* ── BIOCAP DNA HELIX & BACKGROUND GRAPHICS ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[280px] h-[600px] text-[#8b4136]/15 pointer-events-none -rotate-12 blur-[1px]">
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

      <div className="absolute bottom-[-15%] right-[-5%] w-[320px] h-[650px] text-white/10 pointer-events-none rotate-45 blur-[1px]">
        <svg viewBox="0 0 100 400" className="w-full h-full fill-none stroke-current stroke-2">
          <path d="M 30,0 Q 80,50 30,100 T 30,200 T 30,300 T 30,400" strokeWidth="3" />
          <path d="M 70,0 Q 20,50 70,100 T 70,200 T 70,300 T 70,400" strokeWidth="3" />
          <line x1="32" y1="25" x2="68" y2="25" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="75" x2="68" y2="75" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="125" x2="68" y2="125" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#8b4136]/20 rounded-full blur-3xl pointer-events-none" />

      {/* 🟢 Suspense Boundary Wrapper for Next.js Search Parameters */}
      <Suspense fallback={<div className="text-xs text-white">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}