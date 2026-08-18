'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authCookies } from "@/lib/auth/cookies";
import { useSession } from "@/hooks/useSession";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
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

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

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
  } else if (role === "broadcast_content_creator" || role === "social_media_content_creator" || role === "media_correspondent" || role === "principal_investigator") {
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
    router.refresh();
  };

  const fontVars = `${fraunces.variable} ${plexMono.variable}`;
  const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
  const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center border border-[#1E2620] bg-[#FAF9F5] text-[#1E2620] shadow-md lg:hidden hover:bg-[#EFECE6] transition-colors"
        aria-label="Toggle Navigation Menu"
      >
        {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Backdrop Overlay for Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#1E2620]/30 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`${fontVars} fixed top-0 left-0 z-40 h-screen bg-[#FAF9F5] text-[#1E2620] flex flex-col justify-between border-r border-[#E2DDCF] shadow-xs transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="px-6 py-6 border-b border-[#E2DDCF] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#1E2620] bg-[#1E2620] text-[#FAF9F5]">
                <Dna size={18} className="text-[#A9812F]" />
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col whitespace-nowrap">
                  <span
                    className="text-lg italic leading-none text-[#1E2620]"
                    style={displayFont}
                  >
                    BioCap <span className="text-[#3F6B4F]">Desk</span>
                  </span>
                  <span
                    className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#A9812F]"
                    style={monoFont}
                  >
                    Console
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center h-7 w-7 border border-[#D9D4C6] bg-[#FAF9F5] text-[#7A8079] hover:border-[#1E2620] hover:text-[#1E2620] transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
            </button>
          </div>

          {/* Navigation Section Title */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-6 pt-6 pb-2">
              <p
                className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A9812F]"
                style={monoFont}
              >
                Navigation
              </p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 flex-1 mt-2">
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
                    className={`group relative flex items-center justify-between px-3.5 py-2.5 text-xs transition-colors border-l-2 ${
                      isActive
                        ? "border-[#3F6B4F] bg-[#3F6B4F]/10 text-[#1E2620] font-semibold"
                        : "border-transparent text-[#5A6259] hover:border-[#D9D4C6] hover:bg-[#EFECE6]/50 hover:text-[#1E2620]"
                    } ${isCollapsed && !isMobileOpen ? "justify-center px-0" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors ${
                          isActive ? "text-[#3F6B4F]" : "text-[#7A8079] group-hover:text-[#1E2620]"
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
                            className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 border border-[#A9812F]/40 bg-[#A9812F]/10 text-[#A9812F]"
                            style={monoFont}
                          >
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRight size={13} className="text-[#3F6B4F]" />
                        ) : null}
                      </>
                    )}
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-[#E2DDCF] space-y-3 shrink-0 bg-[#EFECE6]/30">
          {isMounted && user && (
            <div
              className={`flex items-center gap-3 p-2 border border-[#E2DDCF] bg-[#FAF9F5] ${
                isCollapsed && !isMobileOpen ? "justify-center px-0 border-none bg-transparent" : ""
              }`}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#1E2620] bg-[#1E2620] text-[#FAF9F5] text-[10px] font-semibold"
                style={monoFont}
              >
                {user.firstName?.[0] || user.username?.[0] || "U"}
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="overflow-hidden text-left flex-1">
                  <p className="text-xs font-semibold text-[#1E2620] truncate">
                    {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username}
                  </p>
                  <p
                    className="text-[9px] font-semibold uppercase tracking-wider text-[#A9812F] truncate flex items-center gap-1.5"
                    style={monoFont}
                  >
                    <span className="h-1.5 w-1.5 bg-[#3F6B4F] inline-block shrink-0" />
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
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#8B4136]/30 bg-[#8B4136]/5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B4136] hover:bg-[#8B4136] hover:text-[#FAF9F5] hover:border-[#8B4136] transition-colors ${
              isCollapsed && !isMobileOpen ? "px-0" : ""
            }`}
            style={monoFont}
          >
            <LogOut size={13} />
            {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}