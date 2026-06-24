"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authCookies } from "@/lib/auth/cookies";

const navItems = [
  { label: "Overview", href: "/dashboard/dashboard" },
  { label: "Blog", href: "/dashboard/dashboard/blog" },
  { label: "New Post", href: "/dashboard/dashboard/blog/new" },
];

interface SessionUser {
  username: string;
  role: string;
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

  if (!user) return null; // redirecting…

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold text-indigo-600">MyApp</span>
        </div>

        {/* Nav links */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition
                  ${active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
                `}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <p className="text-xs text-gray-500 truncate">
            {user.username} {user.role && <span className="text-gray-400">({user.role})</span>}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded-lg bg-red-50 py-1.5 text-sm text-red-600 hover:bg-red-100 transition"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <span className="text-sm text-gray-500">
            Hi, <strong>{user.username}</strong>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}