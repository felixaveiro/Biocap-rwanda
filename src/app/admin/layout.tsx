'use client';

import Sidebar from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, allowed } = useSession("blog:view");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F5]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3F6B4F] border-t-transparent" />
      </div>
    );
  }

  if (!allowed) {
    return null; // Hook automatically redirects unauthorized users
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E2620]">
      <Sidebar />
      <div className="lg:pl-64 min-h-screen transition-all">
        {children}
      </div>
    </div>
  );
}