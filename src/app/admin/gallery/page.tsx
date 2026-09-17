// app/admin/gallery/page.tsx
import React from 'react';
import GalleryManager from '@/components/GalleryManager';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { ShieldAlert, ArrowRight, Server, Database } from 'lucide-react';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-mono',
});

export default function AdminGalleryPage() {
  const fontVars = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
  const bodyFont: React.CSSProperties = { fontFamily: 'var(--font-body)' };
  const displayFont: React.CSSProperties = { fontFamily: 'var(--font-display)' };
  const monoFont: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

  return (
    <div className={`${fontVars} space-y-8 p-6 lg:p-10 text-[#1E2620] bg-[#FDFCFA] min-h-screen`} style={bodyFont}>
      {/* Editorial System Portal Header */}
      <div className="border border-[#D9D4C6] bg-[#FAF9F5] p-6 lg:p-8 rounded-sm shadow-xs space-y-4">
        {/* Workspace Breadcrumbs & Role Guard Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DDCF] pb-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B9188]" style={monoFont}>
            <span>Admin Portal</span>
            <ArrowRight size={10} className="text-[#A9812F]" />
            <span className="text-[#1E2620]">System Media Control</span>
          </div>

          <div className="inline-flex items-center gap-1.5 border border-[#A9812F]/40 bg-[#A9812F]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#A9812F]" style={monoFont}>
            <ShieldAlert size={12} /> Root Administrative Privileges
          </div>
        </div>

        {/* Title & Context */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl italic font-bold text-[#1E2620] tracking-tight" style={displayFont}>
              Admin Gallery Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6259] max-w-2xl leading-relaxed">
              System administrator control panel for managing public videos, inspecting uploaded collections, and enforcing Cloudinary CDN purging policies.
            </p>
          </div>

          {/* Quick Infrastructure Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="border border-[#D9D4C6] bg-white px-3 py-2 rounded-sm text-center">
              <p className="text-[9px] uppercase tracking-wider text-[#8B9188]" style={monoFont}>Access Level</p>
              <p className="text-xs font-bold text-[#1E2620]">Super Admin</p>
            </div>
            <div className="border border-[#D9D4C6] bg-white px-3 py-2 rounded-sm text-center">
              <p className="text-[9px] uppercase tracking-wider text-[#8B9188]" style={monoFont}>Storage Engine</p>
              <p className="text-xs font-bold text-[#3F6B4F] flex items-center justify-center gap-1">
                <Database size={11} /> Cloudinary API
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Shared Gallery Manager Component */}
      <GalleryManager
        portalTitle="Global Media Collection"
        portalDescription="Perform full administrative audits, delete deprecated media assets, or upload official project collections."
      />
    </div>
  );
}