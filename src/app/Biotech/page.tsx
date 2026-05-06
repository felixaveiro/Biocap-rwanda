'use client';

import React from 'react';
import Image from 'next/image';

export default function BiotechPage() {
  const projects = [
    { id: 1, title: "Pest Resistance", image: "/image/image-03.jpg" },
    { id: 2, title: "Drought Resilience", image: "/image/image-04.jpg" },
    { id: 3, title: "High Yield Varieties", image: "/image/image-05.jpg" },
    { id: 4, title: "Sustainable Soil", image: "/image/image-07.jpg" },
    { id: 5, title: "Crop Biofortification", image: "/image/image-09.jpg" },
    { id: 6, title: "Precision Breeding", image: "/image/image-10.jpg" },
  ];

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[450px] flex items-center justify-center text-center overflow-hidden">
        {/* Background Image using local image-02 for a professional nature look */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/image/image-02.jpg" 
            alt="Agriculture background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1B3A5C]/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white px-6">
          <p className="text-xs font-bold tracking-[4px] uppercase mb-4 drop-shadow-md">HOME / PROJECTS</p>
          <h1 className="text-6xl font-serif font-bold italic tracking-tight drop-shadow-lg">Projects</h1>
        </div>

        {/* Bottom Jagged Edge Divider */}
        <div className="absolute bottom-[-1px] left-0 w-full z-20 overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z" fill="#ffffff"></path>
          </svg>
        </div>
      </section>

      {/* PROJECT GALLERY */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl aspect-[4/5] shadow-md transition-all duration-500 group-hover:shadow-2xl border border-slate-100">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Hover Overlay using BioCap Pink */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#E8185A]/90 via-[#1B3A5C]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-serif italic font-bold mb-2">{project.title}</h3>
                    <span className="text-xs font-bold tracking-widest uppercase border-b-2 border-white pb-1">Read More</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER - INTEGRATED DESIGN */}
      <footer className="bg-[#1a365d] relative pt-24 pb-12 overflow-hidden">
        {/* Top Jagged Edge for Footer */}
        <div className="absolute top-[-1px] left-0 w-full z-20 overflow-hidden leading-[0] rotate-180">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z" fill="#ffffff"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-30">
          {/* Brand Col */}
          <div className="space-y-6">
            <div className="text-3xl font-bold flex items-center gap-2">
              <span className="text-[#E8185A]">Bio</span><span className="text-white">Cap</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              There are many variations of agricultural development through BioCap science for Rwandan growth.
            </p>
            <div className="flex gap-4">
               <input type="email" placeholder="Email Address" className="bg-white/10 border-none rounded-lg px-4 py-2 text-white w-full text-sm outline-none focus:ring-1 focus:ring-[#E8185A]" />
               <button className="bg-[#E8185A] text-white p-2 rounded-lg"> → </button>
            </div>
          </div>

          {/* Links Col */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-10 after:h-[2px] after:bg-[#E8185A]">Links</h4>
            <ul className="space-y-4 text-white/60 text-sm font-medium">
              <li className="hover:text-[#E8185A] cursor-pointer">→ Our Projects</li>
              <li className="hover:text-[#E8185A] cursor-pointer">→ About Us</li>
              <li className="hover:text-[#E8185A] cursor-pointer">→ Our Services</li>
              <li className="hover:text-[#E8185A] cursor-pointer">→ Upcoming Events</li>
            </ul>
          </div>

          {/* News Col */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-10 after:h-[2px] after:bg-[#E8185A]">News</h4>
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-lg bg-white/10 shrink-0 overflow-hidden">
                   <img src="/image/image-08.jpg" alt="news" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[#E8185A] text-[10px] font-bold">DEC 31, 2024</p>
                  <p className="text-white text-xs font-bold leading-snug hover:text-[#E8185A] cursor-pointer">BioCap enhances crop resilience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-10 after:h-[2px] after:bg-[#E8185A]">Contact</h4>
            <ul className="space-y-6 text-white/60 text-sm">
              <li className="flex gap-3">
                <span className="text-[#E8185A]">📞</span> 92 666 888 0000
              </li>
              <li className="flex gap-3">
                <span className="text-[#E8185A]">✉️</span> help@biocap.rw
              </li>
              <li className="flex gap-3">
                <span className="text-[#E8185A]">📍</span> Kigali, Rwanda
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-white/5 text-center text-white/30 text-xs tracking-widest uppercase">
          © Copyright 2024 by BioCap
        </div>
      </footer>
    </div>
  );
}