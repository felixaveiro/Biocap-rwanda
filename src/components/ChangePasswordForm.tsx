'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { changePassword } from '@/lib/api/auth'; // 1. Import real API function

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Call the actual backend endpoint via changePassword from auth.ts
      const res = await changePassword({
        currentPassword,
        newPassword,
      });

      setStatus({
        type: 'success',
        message: res.message || 'Password updated successfully! Please log in with your new password.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      console.error('Password Change Error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update password. Please check your current password.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-[#1E2620]">Change Password</h3>
        <p className="text-xs text-[#6B7268] mt-1">
          Ensure your account uses a strong, unique password to maintain editorial security.
        </p>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2.5 p-3.5 text-xs font-medium border ${
            status.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-[#B65C4B]/40 bg-[#FBEEEC] text-[#7A362A]'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-[#B65C4B] shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Current Password */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5A6259] mb-1.5">
          Current Password <span className="text-[#B65C4B]">*</span>
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-3 text-[#8B9188]" />
          <input
            type={showCurrent ? 'text' : 'password'}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full border border-[#D9D4C6] bg-white py-2.5 pl-9 pr-10 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-3 text-[#8B9188] hover:text-[#1E2620] cursor-pointer"
          >
            {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5A6259] mb-1.5">
          New Password <span className="text-[#B65C4B]">*</span>
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-3 text-[#8B9188]" />
          <input
            type={showNew ? 'text' : 'password'}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full border border-[#D9D4C6] bg-white py-2.5 pl-9 pr-10 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-3 text-[#8B9188] hover:text-[#1E2620] cursor-pointer"
          >
            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#5A6259] mb-1.5">
          Confirm New Password <span className="text-[#B65C4B]">*</span>
        </label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-3 text-[#8B9188]" />
          <input
            type={showConfirm ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full border border-[#D9D4C6] bg-white py-2.5 pl-9 pr-10 text-xs text-[#1E2620] focus:border-[#3F6B4F] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-3 text-[#8B9188] hover:text-[#1E2620] cursor-pointer"
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2 border-t border-[#EDEAE0] flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
          className="inline-flex items-center gap-2 border border-[#1E2620] bg-[#1E2620] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#3F6B4F] hover:border-[#3F6B4F] disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}