'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Dna,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { forgotPassword } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      // Calls your export: forgotPassword({ email })
      const response = await forgotPassword({ email: email.trim() });
      setSuccess(
        response.message || 
        'If an account exists with this email, a password reset link has been sent.'
      );
    } catch (err: unknown) {
      console.error('Password reset request error:', err);
      const message =
        err instanceof ApiError 
          ? err.message 
          : err instanceof Error 
          ? err.message 
          : 'Failed to request password reset. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#133248] via-[#235D74] to-[#632B70] overflow-hidden px-4 py-12 selection:bg-[#E52B67] selection:text-white">
      
      {/* ── BIOCAP DNA HELIX GRAPHICS ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[380px] h-[800px] text-[#E52B67]/20 pointer-events-none -rotate-12 blur-[1px]">
        <svg viewBox="0 0 100 400" className="w-full h-full fill-none stroke-current stroke-2">
          <path d="M 30,0 Q 80,50 30,100 T 30,200 T 30,300 T 30,400" strokeWidth="3" />
          <path d="M 70,0 Q 20,50 70,100 T 70,200 T 70,300 T 70,400" strokeWidth="3" />
          <line x1="32" y1="25" x2="68" y2="25" strokeWidth="1.5" opacity="0.6" />
          <line x1="50" y1="50" x2="50" y2="50" strokeWidth="1.5" opacity="0.6" />
          <line x1="32" y1="75" x2="68" y2="75" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>

      {/* ── MAIN GLASS CARD ── */}
      <div className="relative z-10 w-full max-w-md bg-white/25 backdrop-blur-md border border-white/40 rounded-[38px] p-8 sm:p-10 shadow-2xl shadow-[#133248]/50 my-6">
        
        {/* Header Badge */}
        <div className="flex justify-center mb-3">
          <div className="relative w-16 h-16 rounded-full bg-[#133248] text-white flex items-center justify-center shadow-lg border border-[#E52B67]/40">
            <KeyRound className="w-9 h-9 stroke-[2]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#E52B67] text-white flex items-center justify-center shadow-sm">
              <Dna className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 tracking-tight">
          <span className="text-[#E52B67]">Forgot</span>{" "}
          <span className="text-[#133248]">Password?</span>
        </h1>
        <p className="text-center text-xs sm:text-sm text-[#133248]/80 font-medium mb-6">
          Enter your registered email address and we'll send you a password reset link.
        </p>

        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-2xl bg-rose-500/20 border border-rose-500/40 p-3.5 flex items-center gap-2.5 text-white text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-3.5 flex items-center gap-2.5 text-emerald-100 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-6 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-base rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] transition-all border border-white disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-[#133248] hover:bg-[#0e273a] active:scale-[0.98] text-white font-semibold text-lg transition-all shadow-xl shadow-[#133248]/40 border border-[#E52B67]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#E52B67]" />
                <span>Sending link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center border-t border-[#133248]/15 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#133248] hover:text-[#E52B67] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}