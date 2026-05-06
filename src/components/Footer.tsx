'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1B3A5C] relative pt-24 pb-12 overflow-hidden">
      {/* Top Jagged Edge Divider (Separates white page from navy footer) */}
      <div className="absolute top-[-1px] left-0 w-full z-20 rotate-180 leading-[0]">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z" 
            fill="#ffffff"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-30 text-white">
        
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="text-3xl font-bold">
            <span className="text-[#E8185A]">Bio</span><span>Cap</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Building Rwandan capacity for accelerated development, deregulation, and deployment of enhanced crops.
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="bg-white/10 border-none rounded-lg px-4 py-2 text-white w-full text-sm outline-none focus:ring-1 focus:ring-[#E8185A]" 
            />
            <button className="bg-[#E8185A] text-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#E8185A] transition-colors">
              →
            </button>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="font-bold text-lg mb-8 border-b-2 border-[#E8185A] inline-block pb-1 uppercase tracking-widest text-xs">
            Quick Links
          </h4>
          <ul className="space-y-4 text-white/50 text-sm font-medium uppercase tracking-wider">
            <li><Link href="/About" className="hover:text-[#E8185A] transition-colors">→ About Us</Link></li>
            <li><Link href="/Biotech" className="hover:text-[#E8185A] transition-colors">→ Biotechnology</Link></li>
            <li><Link href="/Environment" className="hover:text-[#E8185A] transition-colors">→ Environment</Link></li>
            <li><Link href="/Dna-week" className="hover:text-[#E8185A] transition-colors">→ DNA Week</Link></li>
          </ul>
        </div>

        {/* Recent News Column */}
        <div>
          <h4 className="font-bold text-lg mb-8 border-b-2 border-[#E8185A] inline-block pb-1 uppercase tracking-widest text-xs">
            Recent News
          </h4>
          <div className="space-y-6">
            <div className="flex gap-4 items-center group cursor-pointer">
              <div className="w-14 h-14 rounded-lg bg-white/10 shrink-0 overflow-hidden group-hover:bg-[#E8185A]/20 transition-colors"></div>
              <div>
                <p className="text-[#E8185A] text-[10px] font-bold">MAY 08, 2026</p>
                <p className="text-white text-xs font-bold leading-tight group-hover:text-[#E8185A]">Maize trials in Eastern Province</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Column */}
        <div>
          <h4 className="font-bold text-lg mb-8 border-b-2 border-[#E8185A] inline-block pb-1 uppercase tracking-widest text-xs">
            Contact Us
          </h4>
          <ul className="space-y-4 text-white/60 text-sm font-medium">
            <li className="flex items-center gap-3">
              <span className="text-[#E8185A]">📞</span> +250 788 000 000
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#E8185A]">✉️</span> info@biocap.rw
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#E8185A]">📍</span> KG 7 Ave, Kigali, Rwanda
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="mt-20 pt-8 border-t border-white/5 text-center text-white/20 text-[10px] tracking-[4px] uppercase">
        © 2026 BioCap Rwanda • All Rights Reserved
      </div>
    </footer>
  );
}