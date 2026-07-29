"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authCookies } from "@/lib/auth/cookies";
import {
  LayoutDashboard,
  BookOpen,
  PenSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// Cleaned up route paths (removed duplicate /dashboard prefixing)
const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Stories", href: "/dashboard/dashboard/blog", icon: BookOpen },
  { label: "New Story", href: "/dashboard/dashboard/blog/new", icon: PenSquare },
  { label: "Team Members", href: "/dashboard/dashboard/users", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SessionUser {
  username: string;
  role: string;
}

function getInitials(name: string = "") {
  return name.slice(0, 2).toUpperCase() || "US";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authCookies.isLoggedIn()) {
      router.replace("/auth/login");
      return;
    }

    setUser({
      username: authCookies.getUsername() ?? "User",
      role: authCookies.getRole() ?? "",
    });
  }, [router]);

  const handleLogout = () => {
    authCookies.clearSession();
    router.push("/auth/login");
  };

  if (!user) return null; // Wait for session check

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/60 font-sans antialiased">
      {/* ── Sidebar Navigation ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold tracking-wider text-white shadow-md shadow-indigo-600/20">
              BC
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-indigo-600">
                BioCap
              </p>
              <p className="text-sm font-bold text-slate-900">Content Studio</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {navItems.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/dashboard/dashboard" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-50/80 font-semibold text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {/* Active Indicator Bar */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{label}</span>
                </div>

                {active && <ChevronRight size={14} className="text-indigo-600/70" />}
              </Link>
            );
          })}
        </nav>

        {/* User Account Footer Card */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-200/60">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
              {getInitials(user.username)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.username}</p>
              <p className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <ShieldCheck size={11} className="text-indigo-500" />
                <span className="capitalize">{user.role || "Member"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50/60 py-2.5 text-xs font-semibold text-rose-600 shadow-2xs transition hover:bg-rose-100/80 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Backdrop (Mobile Only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main View Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/80 px-6 shadow-2xs backdrop-blur-md">
          <button
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs hover:bg-slate-50 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              BioCap Content Operations
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Manage stories, review submissions, and support the publishing workflow
            </p>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">{children}</main>
      </div>
    </div>
  );
}