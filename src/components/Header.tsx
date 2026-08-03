"use client";

import { useRouter } from "next/navigation";
import { authCookies } from "@/lib/auth/cookies";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();

  const signOut = () => {
    // 1. Clear JWT & role cookies directly
    authCookies.clearAll();
    
    // 2. Redirect to login page and refresh router state
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200/80 bg-white px-8 py-5 shadow-2xs">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={signOut}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 active:scale-95"
      >
        <LogOut size={14} />
        <span>Sign out</span>
      </button>
    </header>
  );
}