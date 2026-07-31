'use client';

import Sidebar from "@/components/Sidebar";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="lg:pl-64 min-h-screen transition-all">
        {children}
      </div>
    </div>
  );
}