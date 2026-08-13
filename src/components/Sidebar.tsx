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
  Trash2,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Bell, 
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession("blog:view");

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const role = user?.role || (isMounted ? authCookies.getRole() : null);

  let navItems: NavItem[] = [];

  if (role === "admin") {
    navItems = [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "All Stories", href: "/admin/stories", icon: FileText },
      { label: "User Management", href: "/admin/team", icon: Users },
      { label: "Add New User", href: "/admin/team/new", icon: PlusSquare },
      { label: "Trash History", href: "/admin/trash", icon: Trash2 },
    ];
  } else if (role === "editor") {
    navItems = [
      { label: "Overview", href: "/editor", icon: LayoutDashboard },
      { label: "Review Queue", href: "/editor/review", icon: CheckSquare, badge: "Review" },
      { label: "All Stories", href: "/editor/manage", icon: FileText },
      { label: "New Draft", href: "/creator/my-stories/new", icon: PlusSquare },
    ];
  } else if (role === "communication_officer") {
    navItems = [
      { label: "Overview", href: "/officer", icon: LayoutDashboard },
      { label: "All Stories", href: "/officer/stories", icon: Globe, badge: "Live" },
      { label: "Alerts & Activity", href: "/officer/activity", icon: Bell },
    ];
  } else if (role === "broadcast_content_creator" || role === "social_media_content_creator") {
    navItems = [
      { label: "Overview Studio", href: "/creator", icon: LayoutDashboard },
      { label: "My Stories", href: "/creator/my-stories", icon: FileText },
      { label: "New Draft", href: "/creator/my-stories/new", icon: PlusSquare },
      { label: "Live Feed", href: "/creator/published", icon: Globe },
    ];
  }

  const handleLogout = () => {
    authCookies.clearAll();
    router.push("/auth/login");
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#133248] text-white shadow-xl lg:hidden hover:bg-[#1c4767] active:scale-95 transition-all duration-200"
        aria-label="Toggle Navigation Menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop Overlay for Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-[#133248] text-white flex flex-col justify-between border-r border-white/5 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
          {/* Brand Header */}
          <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#E52B67] to-[#f45185] text-white shadow-lg shadow-[#E52B67]/30">
                <Dna size={22} className="animate-pulse" />
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                    <span className="text-[#E52B67]">Bio</span>Cap
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                    Workspace 
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center h-8 w-8 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {/* Navigation Category Label */}
          <div className="px-5 pt-6 pb-2 flex items-center justify-between">
            {(!isCollapsed || isMobileOpen) && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                Main Menu
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 flex-1">
            {isMounted &&
              navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#E52B67] text-white shadow-md shadow-[#E52B67]/25 font-bold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    } ${isCollapsed && !isMobileOpen ? "justify-center" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`shrink-0 transition-transform duration-200 ${
                          isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                      />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      )}
                    </div>

                    {(!isCollapsed || isMobileOpen) && (
                      <>
                        {item.badge ? (
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500/30"
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRight size={14} className="opacity-80" />
                        ) : null}
                      </>
                    )}

                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full" />
                    )}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-white/10 space-y-3 shrink-0 bg-slate-900/20">
          {isMounted && user && (
            <div
              className={`flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md ${
                isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs shadow-inner">
                {user.firstName?.[0] || user.username?.[0] || "U"}
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="overflow-hidden text-left flex-1">
                  <p className="text-xs font-bold text-slate-100 truncate">
                    {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 truncate capitalize flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block shrink-0 animate-ping" />
                    {role?.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-200 active:scale-[0.98] transition-all border border-rose-500/20 ${
              isCollapsed && !isMobileOpen ? "px-0" : ""
            }`}
          >
            <LogOut size={15} />
            {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}