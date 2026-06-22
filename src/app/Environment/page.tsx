'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function EnvironmentPage() {
  const ecoProjects = [
    { title: "Chemical Reduction", img: "/image/image-04.jpg", tag: "Sustainability" },
    { title: "Soil Regeneration", img: "/image/image-07.jpg", tag: "Nature" },
    { title: "Climate Resilience", img: "/image/image-09.jpg", tag: "Future" },
  ];

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* ── HERO SECTION ── */}
      <section className="relative h-[500px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/image/image-02.jpg" 
            alt="BioCap Environment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a3a5c]/65"></div>
        </div>

        <div className="relative z-10 text-white px-6">
          <p className="text-xs font-bold tracking-[5px] uppercase mb-4 opacity-80">Nature & Science</p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold italic leading-tight drop-shadow-lg">
            Protecting Our <br/> Environment
          </h1>
        </div>

        {/* Bottom Jagged Divider */}
        <div className="absolute bottom-[-1px] left-0 w-full z-20 leading-[0]">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z" fill="#ffffff"></path>
          </svg>
        </div>
      </section>

      {/* ── CORE CONTENT ── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl h-[450px]">
             <img src="/image/image-06.jpg" className="w-full h-full object-cover" alt="Sustainable Farming" />
          </div>
          {/* Decorative Badge */}
          <div className="absolute bottom-[-20px] right-[-20px] bg-[#e8185e] text-white p-8 rounded-2xl shadow-xl max-w-[280px]">
            <p className="font-bold italic text-lg leading-snug">"Changing how we grow food and take care of our environment."</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-[2px] bg-[#e8185e]"></div>
             <span className="text-[#e8185e] font-bold uppercase tracking-widest text-xs">Our Commitment & Stewardship Activities</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1a3a5c] font-bold leading-tight">
            Sustainable Agriculture for <span className="italic text-[#e8185e]">Rwanda.</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Stronger crops can reduce the need for too many chemicals, and better seeds can 
            grow well even in tough conditions. This supports sustainable agriculture and 
            helps us use our land more wisely.
          </p>
          {/* <div className="flex flex-wrap gap-3">
            <span className="bg-slate-100 text-[#1a3a5c] font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-tighter">#BetterCrops</span>
            <span className="bg-slate-100 text-[#1a3a5c] font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-tighter">#StrongerRwanda</span>
            <span className="bg-slate-100 text-[#1a3a5c] font-bold text-[10px] px-4 py-2 rounded-full uppercase tracking-tighter">#BioCapEcology</span>
          </div> */}
        </div>
      </section>

      {/* ── PROJECT GRID ── */}
      <section className="py-24 bg-slate-50 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif font-bold text-[#1a3a5c]">Ecological Initiatives</h2>
            <div className="w-20 h-1 bg-[#e8185e] mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {ecoProjects.map((p, i) => (
              <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="h-64 overflow-hidden relative">
                   <img src={p.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.title} />
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase text-[#e8185e]">{p.tag}</div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-[#1a3a5c] mb-4">{p.title}</h3>
                  <Link href="/Biotech" className="text-[#e8185e] font-bold text-xs uppercase tracking-widest hover:gap-3 flex items-center gap-2 transition-all">
                    Learn More <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-24 bg-[#1a3a5c] text-white text-center px-6 overflow-hidden relative">
        <div className="absolute opacity-5 right-[-50px] top-0">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="white"><path d="M12 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-4xl mb-8">“</div>
          <p className="text-2xl md:text-3xl font-serif italic leading-relaxed mb-10">
            Science is the best tool we have to protect our hills and valleys while ensuring no Rwandan goes hungry.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e8185e] flex items-center justify-center font-bold">BC</div>
            <div className="text-left">
              <p className="font-bold text-sm">BioCap Research Team</p>
              <p className="text-white/50 text-[10px] uppercase tracking-widest">Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </section>

     
      <Footer />
    </div>
  );
}