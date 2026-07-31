'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authCookies } from "@/lib/auth/cookies";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Get token and role using existing authCookies methods
    const token = authCookies.getToken();
    const userRole = authCookies.getRole();

    if (!token || !userRole) {
      router.replace("/login");
      return;
    }

    // 2. Route user to their dedicated workspace
    switch (userRole) {
      case "admin":
        router.replace("/admin");
        break;

      case "editor":
        router.replace("/editor");
        break;

      case "communication_officer":
        router.replace("/officer");
        break;

      case "broadcast_content_creator":
      case "social_media_content_creator":
        router.replace("/creator");
        break;

      default:
        router.replace("/creator");
        break;
    }
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#133248] text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#E52B67]" />
        <p className="text-sm font-semibold tracking-wide text-slate-200">
          Redirecting to your workspace…
        </p>
      </div>
    </div>
  );
}