'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const pillars = [
    { 
      id: "01", 
      title: "Accelerated Development", 
      desc: "Speeding up the research and creation of resilient crop varieties using modern biotechnology and precision breeding techniques tailored to Rwanda's unique agro-climatic zones.",
      bgImage: "/image/image-03.jpg", // Integrated nature background
      border: "bg-[#E8185A]"
    },
    { 
      id: "02", 
      title: "Deregulation", 
      desc: "Navigating and shaping regulatory frameworks to ensure the safe, transparent, and legally compliant pathway for biotech crop approvals within Rwanda and the East African region.",
      bgImage: "/image/image-04.jpg", // Integrated nature background
      border: "bg-[#2D6A7F]"
    },
    { 
      id: "03", 
      title: "Deployment", 
      desc: "Getting enhanced seeds and agricultural innovations directly into the hands of Rwandan smallholder farmers through robust extension systems and farmer training programs.",
      bgImage: "/image/image-05.jpg", // Integrated nature background
      border: "bg-[#7B2D8B]"
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* HERO SECTION WITH IMAGE-02 */}
      <section className="relative overflow-hidden min-h-[550px] flex items-center px-6 lg:px-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="/image/image-02.jpg" 
            alt="BioCap Rwanda Nature" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent"></div>
        </div>
        
        <div className="relative z-20 max-w-4xl">
          <p className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-4 drop-shadow-md">
            ABOUT OUR INITIATIVE
          </p>
          <h1 className="text-6xl lg:text-8xl font-serif text-white leading-tight mb-6 italic drop-shadow-lg">
            About <span className="text-[#E8185A]">BioCap</span>
          </h1>
          <p className="text-white/90 text-xl max-w-xl leading-relaxed font-medium drop-shadow-md">
            Building Rwandan capacity for accelerated development, deregulation, and deployment of enhanced crops for food security and agricultural resilience.
          </p>
        </div>

        {/* Smooth Bottom Jagged Divider */}
        <div className="absolute bottom-[-1px] left-0 w-full z-30 leading-[0]">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z" 
              fill="#ffffff"
            ></path>
          </svg>
        </div>
      </section>

      {/* PARTNERS STRIP */}
      <section className="py-16 border-b border-gray-100 px-6 lg:px-12 bg-white">
        <p className="text-center text-[10px] font-bold uppercase tracking-[3px] text-gray-400 mb-8">Trusted & supported by</p>
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
          {["RAB Rwanda", "USAID", "CGIAR", "MINAGRI", "Cornell University"].map(partner => (
            <span key={partner} className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-slate-500">{partner}</span>
          ))}
        </div>
      </section>

      {/* THREE PILLARS WITH IMAGES 03, 04, 05 */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]"></div> Our Focus
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif text-[#1B3A5C] leading-tight">
            Three pillars driving <br /><span className="text-[#E8185A]">Rwanda&apos;s</span> crop innovation
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div key={p.id} className="relative rounded-3xl p-8 overflow-hidden group h-[400px] flex flex-col justify-end transition-all duration-500 hover:-translate-y-2 shadow-xl border border-slate-100">
              {/* Background Nature Image */}
              <img 
                src={p.bgImage} 
                alt={p.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              {/* Dark Overlay for text legibility */}
              <div className="absolute inset-0 bg-[#1B3A5C]/75 group-hover:bg-[#1B3A5C]/65 transition-colors duration-300"></div>
              
              <div className="relative z-10">
                <span className="text-white/20 font-serif text-6xl font-black block mb-2">{p.id}</span>
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{p.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  {p.desc}
                </p>
                <div className={`h-[4px] w-16 rounded-full ${p.border}`}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION SECTION (Retaining all text) */}
      <section className="py-24 px-6 lg:px-12 bg-[#f7f6f4]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <div className="bg-[#1B3A5C] aspect-[4/3] rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Visual using Image 01 as a texture */}
                <img src="/image/image-01.jpg" className="w-full h-full object-cover opacity-30" />
                <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.2" className="absolute">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
             </div>
             <div className="absolute bottom-[-20px] right-[-20px] bg-white p-6 rounded-2xl shadow-xl z-20">
                <div className="font-serif text-3xl font-black text-[#E8185A]">2026</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Program Launch</div>
             </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
              <div className="w-6 h-[2px] bg-[#E8185A]"></div> Our Mission
            </div>
            <h2 className="text-4xl font-serif text-[#1B3A5C] leading-tight mb-6">Empowering Rwandan scientists and farmers</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              BioCap is a flagship initiative dedicated to transforming Rwanda&apos;s agricultural landscape through science-based innovation. We work at the intersection of biotechnology, policy, and farmer empowerment.
            </p>
            <p className="text-slate-600 mb-10 leading-relaxed">
              By building local scientific expertise and strengthening regulatory institutions, BioCap ensures that Rwanda is not just a consumer of global agricultural innovations — but a creator and leader in its own right.
            </p>
            <div className="flex items-center gap-4 pt-8 border-t border-slate-200">
               <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7B2D8B] to-[#E8185A] flex items-center justify-center text-white font-bold">PM</div>
               <div>
                  <div className="font-bold text-[#1B3A5C]">Dr. Pascal Mutabazi</div>
                  <div className="text-xs text-slate-500 font-medium">Program Director, BioCap Initiative</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION WITH IMAGE-06 */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]"></div> Why BioCap
          </div>
          <h2 className="text-4xl font-serif text-[#1B3A5C] leading-tight mb-6">A decade of agricultural <br /><span className="text-[#E8185A]">science in Rwanda</span></h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            BioCap draws on Rwanda&apos;s growing ecosystem of research institutions, progressive policy frameworks, and a new generation of homegrown scientists committed to food sovereignty.
          </p>
          <ul className="space-y-4 mb-10">
            {["Partnership with Rwanda Agriculture and Animal Resources Development Board (RAB)", 
              "Integration with East African Community biosafety harmonization agenda",
              "Locally adapted crop development rooted in smallholder farmer needs"].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-[#fce4ed] flex-shrink-0 flex items-center justify-center text-[#E8185A] font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link href="#" className="bg-[#E8185A] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1B3A5C] transition-all inline-block shadow-lg">
            Discover More →
          </Link>
        </div>
        
        {/* Visual focal point using Image 06 */}
        <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
            <img 
              src="/image/image-06.jpg" 
              alt="Nature Research" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C] via-transparent to-transparent opacity-70"></div>
            <div className="absolute bottom-10 left-10 text-white z-10">
              <div className="text-8xl font-serif font-black mb-2">10+</div>
              <p className="text-xs uppercase tracking-[4px] font-bold text-[#E8185A]">Years of Local Expertise</p>
            </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}