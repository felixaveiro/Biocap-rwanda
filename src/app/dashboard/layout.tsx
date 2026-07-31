'use client';

import Sidebar from "@/components/Sidebar";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Role-based Sidebar */}
      <Sidebar />
      
      {/* Content wrapper shifted right on desktop to accommodate the 64-width sidebar */}
      <div className="lg:pl-64 min-h-screen transition-all">
        {children}
      </div>
    </div>
  );
}