'use client';

import React from 'react';
import Footer from '@/components/Footer';

export default function DNAWeekPage() {
  const newsItems = [
    {
      id: 1,
      date: "08 May",
      author: "BioCap_Admin",
      title: "Science: The Instruction of Life",
      excerpt: "DNA tells a plant how to grow, resist stress, and how much it can produce...",
      image: "https://images.unsplash.com/photo-1530836361253-efad5cb2f620?q=80&w=800",
    },
    {
      id: 2,
      date: "07 May",
      author: "BioCap_Admin",
      title: "Biotechnology for Better Crops",
      excerpt: "Through biotechnology, crops can be developed to resist pests and diseases...",
      image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800",
    },
    {
      id: 3,
      date: "06 May",
      author: "BioCap_Admin",
      title: "Protecting Our Environment",
      excerpt: "Stronger crops reduce the need for chemicals, supporting sustainable agriculture...",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
    },
    {
      id: 4,
      date: "05 May",
      author: "BioCap_Admin",
      title: "Predictable Productivity",
      excerpt: "Instead of struggling every season, farming becomes more predictable...",
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800",
    },
    {
      id: 5,
      date: "04 May",
      author: "BioCap_Admin",
      title: "Building Rwandan Capacity",
      excerpt: "Accelerating development and deployment of agricultural innovation in Rwanda...",
      image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800",
    },
    {
      id: 6,
      date: "03 May",
      author: "BioCap_Admin",
      title: "The Future of Farming",
      excerpt: "Science is not far from us; it is already working in our fields and seeds...",
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800",
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* HEADER SECTION WITH LOCAL BACKGROUND IMAGE */}
<section className="relative h-[500px] flex items-center justify-center text-center overflow-hidden">
  <div className="absolute inset-0 z-0">
    {/* Local Path referencing your public/image folder */}
    <img 
      src="/image/image-01.jpg" 
      alt="DNA Week Celebration" 
      className="w-full h-full object-cover"
    />
    {/* BioCap Navy Overlay for text readability */}
    <div className="absolute inset-0 bg-[#1B3A5C]/65"></div>
  </div>

  <div className="relative z-10 text-white px-6">
    <p className="text-xs font-bold tracking-[6px] uppercase mb-4 opacity-90 drop-shadow-md">
      Rwanda Agricultural Biotech
    </p>
    <h1 className="text-5xl md:text-8xl font-serif font-bold italic leading-tight drop-shadow-2xl">
      DNA Week News
    </h1>
  </div>

  {/* Bottom Jagged Divider */}
  <div className="absolute bottom-[-1px] left-0 w-full z-20 leading-[0]">
    <svg className="relative block w-full h-[70px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path 
        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z" 
        fill="#ffffff"
      ></path>
    </svg>
  </div>
</section>

      {/* NEWS GRID */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {newsItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Date Badge (BioCap Pink) */}
                <div className="absolute bottom-4 right-4 bg-[#E8185A] text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-[10px] font-bold leading-none uppercase">{item.date.split(' ')[1]}</span>
                  <span className="text-lg font-black leading-none">{item.date.split(' ')[0]}</span>
                </div>
              </div>

              <div className="p-8 flex-grow">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E8185A] mb-4 uppercase tracking-tighter">
                  <span className="bg-[#E8185A]/10 p-1 rounded-full text-[8px]">👤</span> {item.author}
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#1B3A5C] mb-4 group-hover:text-[#E8185A] transition-colors leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {item.excerpt}
                </p>
              </div>
              <div className="px-8 pb-8">
                <button className="bg-[#fce4ed] text-[#E8185A] px-6 py-2 rounded-lg font-bold text-xs hover:bg-[#E8185A] hover:text-white transition-all uppercase tracking-widest">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-2 mt-16 pb-10">
          <button className="w-10 h-10 rounded-lg bg-[#1B3A5C] text-white font-bold flex items-center justify-center">1</button>
          <button className="w-10 h-10 rounded-lg bg-gray-100 text-[#1B3A5C] font-bold flex items-center justify-center hover:bg-[#E8185A] hover:text-white transition-all">2</button>
          <button className="w-10 h-10 rounded-lg bg-gray-100 text-[#1B3A5C] font-bold flex items-center justify-center hover:bg-[#E8185A] hover:text-white transition-all">→</button>
        </div>
      </section>

      <Footer />
    </div>
  );
}