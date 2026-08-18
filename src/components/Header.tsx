"use client";

import { useRouter } from "next/navigation";
import { authCookies } from "@/lib/auth/cookies";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

// ── Same editorial system as the rest of the console: canvas #FAF9F5 ·
// ink #1E2620 · moss #3F6B4F · gold #A9812F · hairline #E2DDCF.
// The header reads as a masthead, not a toolbar — a dateline in place of
// a logo, a rule instead of a shadow, a quiet text link instead of a button.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-mono",
});

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();

  const dateline = new Date()
    .toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    .toUpperCase();

  const signOut = () => {
    // 1. Clear JWT & role cookies directly
    authCookies.clearAll();

    // 2. Redirect to login page and refresh router state
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} bg-[#FAF9F5]`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-8 pt-6 pb-4">
        <div className="min-w-0">
          <p
            className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A9812F]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {dateline}
          </p>
          <h1
            className="truncate text-[26px] italic leading-none text-[#1E2620]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-[13px] leading-snug text-[#7A8079]">{subtitle}</p>
          )}
        </div>

        <button
          type="button"
          onClick={signOut}
          className="group inline-flex shrink-0 items-center gap-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A6259] transition-colors hover:text-[#8B4136] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9812F]/40"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <LogOut size={13} className="transition-transform group-hover:-translate-x-0.5" />
          <span className="relative">
            Sign out
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#8B4136] transition-all duration-200 group-hover:w-full" />
          </span>
        </button>
      </div>

      {/* Masthead rule — thick over thin, a real print convention rather than a shadow */}
      <div className="mx-auto max-w-7xl px-8">
        <div className="h-[3px] bg-[#1E2620]" />
        <div className="mt-[3px] h-px bg-[#D9D4C6]" />
      </div>
    </header>
  );
}