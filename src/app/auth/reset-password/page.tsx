// src/app/auth/reset-password/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Dna,
  ShieldAlert
} from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please check your email link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          temp_password: tempPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Reset failed. Token may have expired.');
      } else {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 2500);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#133248] via-[#235D74] to-[#632B70] overflow-hidden px-4 py-12 selection:bg-[#E52B67] selection:text-white">
      
      {/* ── BIOCAP DNA HELIX & MOLECULAR BACKGROUND GRAPHICS ── */}
      
      {/* Left Double DNA Helix Strand */}
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

      {/* Right DNA Helix Strand */}
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

      {/* Top Right Molecular Node Structure */}
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

      {/* Bottom Left Ambient Glow Blob */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#E52B67]/20 rounded-full blur-3xl pointer-events-none" />


      {/* ── MAIN BIOCAP GLASS CARD ── */}
      <div className="relative z-10 w-full max-w-md bg-white/25 backdrop-blur-md border border-white/40 rounded-[38px] p-7 sm:p-10 shadow-2xl shadow-[#133248]/50 my-6">
        
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
          <span className="text-[#E52B67]">Bio</span>
          <span className="text-[#133248]">Cap</span>{" "}
          <span className="text-[#133248] font-medium">Reset Password</span>
        </h1>
        <p className="text-center text-xs sm:text-sm text-[#133248]/80 font-medium mb-5">
          Enter your temporary password from email, then choose a new password.
        </p>

        {/* Expiration Warning Box */}
        <div className="mb-5 rounded-2xl bg-amber-500/20 border border-amber-500/40 p-3.5 flex items-start gap-2.5 text-[#133248] text-xs font-semibold leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
          <span>
            Your temporary password expires in <strong className="text-amber-950 font-bold">30 minutes</strong> from when the email was sent.
          </span>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 rounded-2xl bg-rose-500/20 border border-rose-500/40 p-3.5 flex items-center gap-2.5 text-white text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="mb-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-3.5 flex items-center gap-2.5 text-emerald-100 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Temporary Password */}
          <div className="relative">
            <input
              type={showTempPassword ? 'text' : 'password'}
              placeholder="Temporary Password (from email)"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              required
              disabled={loading || !token}
              className="w-full pl-6 pr-12 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm sm:text-base rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] transition-all border border-white disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowTempPassword(!showTempPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-[#E52B67] transition-colors"
            >
              {showTempPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password (min. 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading || !token}
              className="w-full pl-6 pr-12 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm sm:text-base rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] transition-all border border-white disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-[#E52B67] transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || !token}
              className="w-full pl-6 pr-12 py-3.5 bg-white/95 text-[#133248] placeholder:text-slate-400 font-medium text-sm sm:text-base rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#E52B67] transition-all border border-white disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-[#E52B67] transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3.5 px-6 rounded-full bg-[#133248] hover:bg-[#0e273a] active:scale-[0.98] text-white font-semibold text-base sm:text-lg transition-all duration-200 shadow-xl shadow-[#133248]/40 border border-[#E52B67]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#E52B67]" />
                <span>Resetting...</span>
              </>
            ) : (
              <span>Reset Password →</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-7 text-center border-t border-[#133248]/15 pt-4">
          <p className="text-xs sm:text-sm text-[#133248] font-medium">
            Already have your password?{' '}
            <Link
              href="/auth/login"
              className="font-bold text-[#E52B67] hover:underline"
            >
              Go to Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#133248] text-white">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#E52B67]" />
            <span className="text-sm font-medium">Loading password reset...</span>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}