'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authCookies } from "@/lib/auth/cookies";
import { useSession } from "@/hooks/useSession";
import {
  LayoutDashboard,
  FileText,
  Users,
  CheckSquare,
  Globe,
  PlusSquare,
  LogOut,
  Menu,
  X,
  Dna,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession("blog:view");
  const [isOpen, setIsOpen] = useState(false);
  
  // State to track client-side mounting
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const role = user?.role || (isMounted ? authCookies.getRole() : null);

  // Define Navigation items per Role
  let navItems: NavItem[] = [];

  if (role === "admin") {
    navItems = [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Team Directory", href: "/admin/team", icon: Users },
      { label: "All Stories", href: "/admin/stories", icon: FileText },
      { label: "Create Member", href: "/admin/team/new", icon: PlusSquare },
    ];
  } else if (role === "editor") {
    navItems = [
      { label: "Overview", href: "/editor", icon: LayoutDashboard },
      { label: "Review Queue", href: "/editor/review", icon: CheckSquare },
    ];
  } else if (role === "communication_officer") {
    navItems = [
      { label: "Overview", href: "/officer", icon: LayoutDashboard },
      { label: "Publishing Desk", href: "/officer/stories", icon: Globe },
    ];
  } else if (role === "broadcast_content_creator" || role === "social_media_content_creator") {
    navItems = [
      { label: "Overview", href: "/creator", icon: LayoutDashboard },
      { label: "My Stories", href: "/creator/my-stories", icon: FileText },
      { label: "New Draft", href: "/creator/my-stories/new", icon: PlusSquare },
    ];
  }

  const handleLogout = () => {
    authCookies.clearSession();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-[#133248] text-white lg:hidden shadow-lg hover:bg-[#1c4767] transition"
        aria-label="Toggle Navigation Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#133248] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E52B67] text-white shadow-md">
              <Dna size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-[#E52B67]">Bio</span>Cap
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Workspace Desk
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {isMounted &&
              navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#E52B67] text-white shadow-lg shadow-[#E52B67]/30"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {isMounted && user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                {user.firstName?.[0] || user.username?.[0] || "U"}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold truncate text-slate-100">
                  {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate capitalize">
                  {role?.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}