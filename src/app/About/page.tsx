'use client';

import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import {
  CheckCircle2,
  Sprout,
  ShieldCheck,
  Users,
  Microscope,
  BookOpen,
  Radio,
  Globe,
  Wheat,
  Newspaper,
  Smartphone,
  Landmark,
  Handshake,
  GraduationCap,
  Leaf,
  FlaskConical,
  Quote,
  Scale,
  Telescope,
  Target,
} from 'lucide-react';

interface Partner {
  name: string;
  fullName: string;
  role: string;
  description: string;
  url: string;
  initials: string;
  accent: string;
  logo?: string;
}

const objectives = [
  {
    Icon: Sprout,
    title: 'Crop Innovation',
    description:
      'Advance the development of climate-smart and disease-resistant crop varieties through modern biotechnology, including genetic engineering and gene-editing technologies. BioCap supports research on farmer-preferred banana, cassava, potato, and other strategic food security crops to improve productivity, resilience, and sustainability while addressing major challenges caused by pests, diseases, and climate change.',
  },
  {
    Icon: GraduationCap,
    title: 'Capacity Building',
    description:
      "Strengthen Rwanda's scientific and technical capacity in crop biotechnology by training researchers, scientists, regulators, and technical personnel at PhD, Master's, and specialized technical levels. Through partnerships with leading international universities and research institutions, BioCap is building a new generation of African scientists capable of driving innovation and supporting the future growth of Rwanda's food systems.",
  },
  {
    Icon: Globe,
    title: 'Food Security',
    description:
      'Enhance food security and climate resilience by supporting the development and adoption of biotechnology solutions that reduce crop losses, improve yields, lower production costs, and decrease dependence on chemical pesticides. These innovations help farmers adapt to changing climatic conditions while improving livelihoods and ensuring sustainable agricultural production.',
  },
  {
    Icon: FlaskConical,
    title: 'Centre of Excellence in Crop Biotechnology',
    description:
      "Develop a world-class Centre of Excellence in Crop Biotechnology at RAB that serves as Rwanda's hub for biotechnology research, scientific training, biosafety communication, and innovation partnerships. Guided by the vision of African crops, developed by African scientists, for African farmers, the Centre will support current and future biotechnology solutions that enhance food security, competitiveness, and agricultural resilience across Africa.",
  },
  {
    Icon: Scale,
    title: 'Regulatory Advancement',
    description:
      "Support science-based biosafety systems and strengthen Rwanda's regulatory capacity for the safe development, testing, evaluation, and deployment of biotechnology innovations. BioCap promotes transparent, evidence-based decision-making and contributes to efficient regulatory pathways that meet national, regional, and international biosafety standards.",
  },
  {
    Icon: Handshake,
    title: 'Strategic Partnerships',
    description:
      'Foster strong partnerships among national institutions, international research organizations, universities, development partners, regulators, and private sector actors to accelerate biotechnology innovation in Africa. Through collaboration, BioCap supports the development, stewardship, and deployment of climate-smart crop technologies while strengthening the role of local scientists, seed companies, and the Centre of Excellence in Crop Biotechnology as drivers of agricultural transformation.',
  },
];

export default function AboutPage() {
  const pillars = [
    {
      id: '01',
      title: 'Accelerated Research & Innovation',
      desc: "Rwanda BioCap Project strengthens Rwanda's scientific capacity to develop climate-resilient, farmer-preferred crop varieties through modern biotechnology. The project trains RAB scientists in molecular breeding, genomics, bioinformatics, DNA sequencing, RNA interference, genome editing, and biosafety research. It is building Rwanda's first in-country biotechnology innovation pipeline to support food security, farmer livelihoods, and agricultural competitiveness.",
      bgImage: '/image/LABDY3_1.jpg',
      border: 'bg-[#E8185A]',
    },
    {
      id: '02',
      title: 'Biosafety, Regulation & Responsible Innovation',
      desc: "Rwanda BioCap Project advances responsible biotechnology by strengthening biosafety governance, regulatory capacity, and transparent stakeholder engagement. In collaboration with RICA, REMA, MINAGRI, and regional and international partners, the project supports an efficient, science-based regulatory pathway. This pathway ensures that biotechnology innovations are developed, assessed, and deployed safely, ethically, and transparently.",
      bgImage: '/image/DSC06556(1).jpg',
      border: 'bg-[#2D6A7F]',
    },
    {
      id: '03',
      title: 'Delivering Innovation to Farmers',
      desc: "Rwanda BioCap Project is turning scientific innovation into practical solutions for Rwanda's smallholder farmers. It advances improved farmer-preferred cassava, potato, banana cooking, and sweet banana varieties with stronger resistance to major pests and diseases. It also preserves the traits farmers and consumers value. Through research partnerships, seed systems, extension services, and farmer engagement, the project supports higher productivity, reduced crop losses, lower pesticide use, stronger climate resilience, and more stable harvests.",
      bgImage: '/image/DSC_6510.jpg',
      border: 'bg-[#7B2D8B]',
    },
  ];

  const focusCrops = [
    {
      icon: Wheat,
      image: '/image/potato.png',
      name: 'Potato',
      trait: '3R gene stack · Late blight resistance',
      stat:
        'Late blight can cause up to 80% yield loss, forcing farmers to apply fungicides 8–15 times per growing season, increasing production costs and environmental impact. BioCap, in collaboration with CIP, is expanding this technology to farmer-preferred potato varieties.',
      varieties: 'Kinigi & Cyerekezo',
      color: '#E8185A',
      bg: '#fde8ef',
    },
    {
      icon: Leaf,
      image: '/image/cassava.png',
      name: 'Cassava',
      trait: 'Molecular breeding · CBSD & CMD resistance',
      stat:
        'Cassava Brown Streak Disease (CBSD) and Cassava Mosaic Disease (CMD) are among the most devastating cassava diseases in Africa, causing severe yield losses and threatening food security. BioCap is developing disease-resistant cassava varieties using advanced molecular breeding technologies.',
      varieties: 'RNAi-resistant cassava lines',
      color: '#2A7F8C',
      bg: '#e6f4f6',
    },
    {
      icon: Sprout,
      image: '/image/banana.png',
      name: 'Banana',
      trait:
        'CRISPR gene editing · Resistance to Banana Xanthomonas Wilt (BXW) and Fusarium wilt',
      stat:
        "BXW and Fusarium wilt continue to threaten one of Rwanda's most important staple and cash crops. BioCap is establishing Rwanda's first in-country gene-editing capacity in collaboration with IITA to develop disease-resistant banana varieties.",
      varieties: 'Injagi & Sukali Ndiizi',
      color: '#7B3FA0',
      bg: '#f3e8f9',
    },
  ];

  const quotes = [
    {
      text: 'The aim of this project is to strengthen our research capacity by enhancing the knowledge and skills of our scientists and increasing their numbers. This will contribute to higher agricultural productivity, reduce the use of chemical inputs, and mitigate losses caused by extreme weather conditions such as excessive heat.',
      name: 'Dr. Solange Uwituze',
      role: 'Minister of State, Ministry of Agriculture and Animal Resources',
    },
    {
      text: 'We don’t have time,” she said. “We need faster and more effective delivery of solutions to our farmers, and we must establish strong partnership models. This is also the time to communicate science effectively to build trust.”',
      name: 'Dr. Joyce Maru',
      role: 'Regional Director at CIP',
    },
    {
      text: 'The BioCap project is designed to strengthen Rwanda’s biotechnology capacity by building skills, improving research infrastructure, and fostering strong national and international partnerships. The initiative focuses on enabling researchers to safely and efficiently develop and test improved crop varieties that respond to national agricultural priorities.',
      name: ' Dr. Eric Magembe',
      role: 'BioCap Project Lead',
    },
     {
      text: 'On behalf of the Government of Rwanda, at and RAB we are committed to doing our best to achieve our goals. And I believe that together we will succeed. The Rwanda BioCap Project is here presenting to us an opportunity to leverage on.',
      name: ' Dr. Florence Uwamahoro',
      role: 'Acting DG, RAB',
    },
  ];

  const partners: Partner[] = [
    {
      name: 'RAB',
      fullName: 'Rwanda Agriculture Board',
      role: 'National Lead & Host Institution',
      description: "Rwanda's principal government body overseeing agricultural research, development, and the regulation of seeds and plant varieties to drive national food security.",
      url: 'https://www.rab.gov.rw',
      initials: 'RAB',
      accent: '#1E4D6B',
      logo: '/image/rab-logo.png',
    },
    {
      name: 'IITA',
      fullName: 'Intl. Institute of Tropical Agriculture',
      role: 'Banana Gene-Editing Lead',
      description: 'A world-class research-for-development organisation supporting RAB\u2019s deployment of CRISPR tools to knock out key susceptibility genes in banana varieties.',
      url: 'https://www.iita.org',
      initials: 'IITA',
      accent: '#2A7F8C',
      logo: '/image/IITA-TAA-logo.png',
    },
     {
      name: 'CIP',
      fullName: 'International Potato Center',
      role: 'Lead Implementing Partner',
      description: 'A CGIAR research centre dedicated to reducing poverty and hunger through scientific innovation in potato and sweetpotato systems across the developing world.',
      url: 'https://cipotato.org',
      initials: 'CIP',
      accent: '#E8185A',
      logo: '/image/cip-logo.webp',
    },
    {
      name: 'DDPSC',
      fullName: 'Donald Danforth Plant Science Center',
      role: 'Cassava Molecular Analysis',
      description: 'An independent, not-for-profit research institute advancing molecular markers, bioinformatics, and sequencing capacity for disease-resistant cassava lines.',
      url: 'https://www.danforthcenter.org',
      initials: 'DDPSC',
      accent: '#7B3FA0',
      logo: '/image/DDPSC-logo.jpg',
    },
    {
      name: 'MSU',
      fullName: 'Michigan State University',
      role: 'Regulatory Science & Biosafety',
      description: 'A leading land-grant research university providing rigorous biosafety training, regulatory science expertise, and capacity building for African scientists and policymakers.',
      url: 'https://msu.edu',
      initials: 'MSU',
      accent: '#18453B',
      logo: '/image/MSU Combo.png',
    },
    {
      name: 'Alliance for Science',
      fullName: 'Alliance for Science Rwanda',
      role: 'Communication & Outreach',
      description: 'A science communication network amplifying evidence-based voices on biotechnology, engaging farmers, media, and policymakers to build public trust in agricultural innovation.',
      url: 'https://www.afs-rwanda.org/',
      initials: 'AfS-rwanda',
      accent: '#2E9E5B',
      logo: '/image/A4S RWANDA_COLOR-04.png',
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[420px] flex items-center px-6 lg:px-12">
        <div className="absolute inset-0 z-0">
          <div
            className="about-hero-bg w-full h-full"
            style={{
              backgroundImage: "url('/image/IMG_79.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent" />
        </div>

        <style>{`
          @media (max-width: 768px) {
            .about-hero-bg { background-attachment: scroll !important; }
          }
        `}</style>

        <div className="relative z-20 max-w-4xl py-10">
          <p className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-3 drop-shadow-md">
            Rwanda Biotech Capacity Building Project
          </p>
          <h1 className="text-5xl lg:text-6xl font-serif text-white leading-tight mb-4 italic drop-shadow-lg">
            About Rwanda <span className="text-[#E8185A]">BioCap Project</span>
          </h1>
          <p className="text-white/90 text-lg max-w-xl leading-relaxed font-medium drop-shadow-md">
            The Rwanda BioCap Project is here to build Rwanda's biotechnology capacity to develop improved potato, cassava, and banana varieties. It strengthens food security through innovative, disease-resistant, and climate-resilient crops.
          </p>
        </div>

        <div className="absolute bottom-[-1px] left-0 w-full z-30 leading-[0]">
          <svg className="relative block w-full h-[40px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="py-10 border-b border-gray-100 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-gray-400 mb-1">
              Convened at launch with MINAGRI &amp; REMA, implemented by
            </p>
            <p className="text-xs text-slate-400">Click any partner to visit their website</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {partners.map((p) => (
              <PartnerCard key={p.name} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ── */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-3">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Our Focus
          </div>
          <h2 className="text-3xl lg:text-4xl font-serif text-[#1B3A5C] leading-tight">
            Three Objectives Driving <br />
            <span className="text-[#E8185A]">Rwanda&apos;s</span> BioCap Project Crop Innovation
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {pillars.map((p) => (
            <div
              key={p.id}
              className="relative rounded-3xl overflow-hidden group flex flex-col transition-all duration-500 hover:-translate-y-2 shadow-xl border border-slate-100"
            >
              <img
                src={p.bgImage}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#1B3A5C]/80 group-hover:bg-[#1B3A5C]/70 transition-colors duration-300" />

              <div className="relative z-10 flex flex-col flex-1 p-6 pb-6">
                <span className="text-white/20 font-serif text-5xl font-black leading-none h-[48px] flex items-center">
                  {p.id}
                </span>
                <h3 className="text-lg font-bold text-white mb-2 mt-1 leading-tight">{p.title}</h3>
                <p className="text-white/85 text-sm leading-relaxed text-justify flex-1">
                  {p.desc}
                </p>
                <div className={`h-[4px] w-16 rounded-full ${p.border} mt-4`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOCUS CROPS ── */}
      <section className="py-10 bg-[#f7f6f4] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-3">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Focus Crops
          </div>
          <h2 className="text-2xl font-serif text-[#1B3A5C] mb-2">
            Three Food-Security Crops. Five Major Disease Challenges.
          </h2>
          <p className="text-slate-500 text-sm mb-6 w-full text-justify">
            Rwanda BioCap Project is helping Rwanda's farmers increase productivity, improve profitability, 
            and strengthen climate resilience through responsible biotechnology innovation. 
            By developing disease-resistant, farmer-preferred crop varieties, the project reduces crop losses,
             lowers pesticide use, and supports more sustainable farming systems.
          </p>
          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {focusCrops.map((c) => (
              <div
                key={c.name}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-2"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{ background: c.bg }}
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-9 h-9 object-contain"
                    />
                  ) : (
                    <c.icon className="w-7 h-7" style={{ color: c.color }} />
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#1B3A5C]">{c.name}</h3>
                <span
                  className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ color: c.color, background: c.bg }}
                >
                  {c.trait}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed pt-1 text-justify flex-1">{c.stat}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100 w-full mt-1">
                  Target: {c.varieties}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-12 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <div className="bg-[#1B3A5C] aspect-[4/3] rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
              <img src="/image/lounch.jpg" className="w-full h-full object-cover opacity-70" />
            </div>
            <div className="absolute bottom-[-16px] right-[-16px] bg-white p-4 rounded-2xl shadow-xl z-20">
              <div className="font-serif text-2xl font-black text-[#E8185A]">15 Dec 2025</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Launched in Kigali
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-3">
              <div className="w-6 h-[2px] bg-[#E8185A]" /> Our Mission
            </div>
            <p className="text-slate-600 mb-3 leading-relaxed text-justify">
              To empower Rwanda's scientists to develop responsible biotechnology innovations
               that enable farmers to grow more profitably, strengthen food security, 
               and build climate-resilient agricultural systems for future generations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white px-6 lg:px-12 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-3">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> From The Launch
          </div>
          <h2 className="text-2xl font-serif text-[#1B3A5C] mb-6">
            Voices from 15 December 2025
          </h2>
          <div className="grid md:grid-cols-2 gap-5 items-stretch">
            {quotes.map((q) => (
              <div
                key={q.name}
                className="bg-[#f7f6f4] rounded-2xl p-6 border border-slate-100 relative flex flex-col"
              >
                <Quote className="w-7 h-7 text-[#E8185A]/30 mb-3" />
                <p className="text-lg font-serif text-[#1B3A5C] leading-snug mb-4 text-justify flex-1">
                  &ldquo;{q.text}&rdquo;
                </p>
                <div className="text-sm font-bold text-[#1B3A5C]">{q.name}</div>
                <div className="text-xs text-slate-500">{q.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECONOMIC OPPORTUNITY / WHY BIOCAP ── */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-3">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Why BioCap
          </div>
          <h2 className="text-3xl font-serif text-[#1B3A5C] leading-tight mb-4">
            A strategic investment in <br />
            <span className="text-[#E8185A]">farmers and food systems</span>
          </h2>
          <p className="text-slate-600 mb-5 leading-relaxed text-justify">
            Rwanda BioCap Project is not only about science it is a strategic investment in Rwanda&apos;s economy,
            built on partnership with MINAGRI, REMA, and Rwanda&apos;s growing ecosystem of research
            institutions and homegrown scientists.
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'Higher national yields and reduced pesticide-related expenses for farmers',
              'Stronger regional market competitiveness for potato, cassava, and banana value chains',
              'Cleaner soils and waterways, lower emissions, and greater biodiversity from reduced chemical use',
              'Biosafety and regulatory foundations led by REMA and MINAGRI, built for EAC harmonization',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 rounded-full bg-[#fce4ed] flex-shrink-0 flex items-center justify-center text-[#E8185A] font-bold mt-0.5">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="#objectives"
            className="bg-[#E8185A] text-white px-7 py-3 rounded-xl font-bold hover:bg-[#1B3A5C] transition-all inline-block shadow-lg"
          >
            Discover More →
          </Link>
        </div>

        <div className="relative h-[380px] rounded-3xl overflow-hidden shadow-2xl group">
          <img
            src="/image/IMG_37.jpg"
            alt="Nature Research"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C] via-transparent to-transparent opacity-70" />
          <div className="absolute bottom-7 left-7 text-white z-10">
            <div className="text-6xl font-serif font-black mb-1">3</div>
            <p className="text-xs uppercase tracking-[4px] font-bold text-[#E8185A]">
              Staple Crops, One National Pipeline
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* ===================  PROGRAMME VISION & OBJECTIVES  ============== */}
      {/* ================================================================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .obj-page {
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          color: #334155;
          background: #ffffff;
        }

        /* ── Hero ── */
        .obj-hero {
          background: linear-gradient(135deg, #0f2240 0%, #254a7a 55%, #1e4976 100%);
          position: relative;
          overflow: hidden;
          padding: 3rem 2rem 2.75rem;
          text-align: center;
        }
        .obj-hero::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(233,30,99,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .obj-hero::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .obj-hero-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .obj-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 auto;
        }
        .obj-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(233,30,99,0.15);
          border: 1px solid rgba(233,30,99,0.35);
          border-radius: 99px;
          padding: 0.3rem 0.9rem;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ff6ba3;
          margin-bottom: 1rem;
        }
        .obj-hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ff4d8b;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.5); opacity: 0.6; }
        }
        .obj-hero h2 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.9rem, 4.5vw, 2.9rem);
          font-weight: 400;
          color: #ffffff;
          line-height: 1.12;
          letter-spacing: -0.03em;
          margin-bottom: 0.85rem;
        }
        .obj-hero h2 em { font-style: normal; color: #ff4d8b; }
        .obj-hero-sub {
          font-size: 1rem;
          font-weight: 400;
          color: rgba(255,255,255,0.72);
          line-height: 1.6;
          max-width: 540px;
          margin: 0 auto;
          text-align: justify;
        }

        /* ── Vision / Goal cards ── */
        .obj-vg-section {
          background: #f7f9fc;
          padding: 2.75rem 2rem;
        }
        .obj-vg-inner {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 760px) { .obj-vg-inner { grid-template-columns: 1fr; } }

        .obj-vg-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 1.6rem 1.5rem;
          border: 1.5px solid #e2e8f3;
          box-shadow: 0 2px 20px rgba(26,54,93,0.06);
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s;
        }
        .obj-vg-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 36px rgba(26,54,93,0.12);
        }
       .obj-vg-card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  text-align: center;
}
        .obj-vg-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: #f0f4fa;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .obj-vg-card.vision .obj-vg-icon { background: #e8f0fb; color: #1a365d; }
        .obj-vg-card.goal   .obj-vg-icon { background: #fff0f5; color: #e91e63; }

        .obj-vg-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1a365d;
          letter-spacing: -0.01em;
        }
        .obj-vg-card p {
          font-size: 0.94rem;
          line-height: 1.65;
          color: #64748b;
          text-align: justify;
        }
        .obj-vg-card ul {
          list-style: none;
          padding: 0;
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .obj-vg-card ul li {
          font-size: 0.91rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          line-height: 1.5;
        }
        .obj-vg-card ul li::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #e91e63;
          flex-shrink: 0;
        }

        /* ── Objectives grid ── */
        .obj-grid-section {
          padding: 3rem 2rem 3.5rem;
          background: #ffffff;
        }
        .obj-grid-inner {
          max-width: 1160px;
          margin: 0 auto;
        }
        .obj-section-header {
          text-align: center;
          margin-bottom: 2.25rem;
        }
        .obj-section-label {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #e91e63;
          margin-bottom: 0.6rem;
        }
        .obj-section-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.7rem, 3.6vw, 2.3rem);
          font-weight: 400;
          color: #1a365d;
          letter-spacing: -0.035em;
          line-height: 1.15;
          margin-bottom: 0.7rem;
        }
        .obj-section-underline {
          width: 52px; height: 4px;
          border-radius: 99px;
          background: linear-gradient(90deg, #e91e63, #ff4d8b);
          margin: 0 auto;
        }

        .obj-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.1rem;
        }
        @media (max-width: 960px) { .obj-cards { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .obj-cards { grid-template-columns: 1fr; } }

        .obj-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f3;
          border-radius: 16px;
          padding: 1.5rem 1.4rem;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s, border-color 0.28s;
        }
        .obj-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 3px;
          background: linear-gradient(90deg, #1a365d, #e91e63);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .obj-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(26,54,93,0.11);
          border-color: transparent;
        }
        .obj-card:hover::before { transform: scaleX(1); }

        .obj-card-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #f0f4fa;
          display: flex; align-items: center; justify-content: center;
          color: #1a365d;
          margin-bottom: 0.85rem;
          flex-shrink: 0;
          transition: background 0.25s, transform 0.25s, color 0.25s;
        }
        .obj-card:hover .obj-card-icon {
          background: #fff0f5;
          color: #e91e63;
          transform: scale(1.08) rotate(-4deg);
        }

        .obj-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a365d;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }
        .obj-card-desc {
          font-size: 0.9rem;
          line-height: 1.65;
          color: #64748b;
          flex: 1;
          text-align: justify;
        }

        /* ── CTA strip ── */
        .obj-cta-strip {
          background: linear-gradient(135deg, #0f2240 0%, #254a7a 100%);
          padding: 2.75rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .obj-cta-strip::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .obj-cta-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .obj-cta-strip h2 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(1.5rem, 3.2vw, 2rem);
          font-weight: 400;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin-bottom: 0.6rem;
        }
        .obj-cta-strip p {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.68);
          line-height: 1.6;
          margin-bottom: 1.4rem;
        }
        .obj-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: #e91e63;
          color: #ffffff;
          padding: 0.75rem 1.8rem;
          border-radius: 99px;
          transition: background 0.25s, box-shadow 0.25s, transform 0.25s;
          box-shadow: 0 4px 20px rgba(233,30,99,0.35);
        }
        .obj-cta-btn:hover {
          background: #ff4d8b;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(233,30,99,0.50);
        }
      `}</style>

      <div className="obj-page">

        {/* ── Vision / Goal Hero ── */}
        <section className="obj-hero" id="objectives">
          <div className="obj-hero-dots" />
          <div className="obj-hero-inner">
            <div className="obj-hero-badge">
              <span className="obj-hero-badge-dot" />
              Programme Direction
            </div>
            <h2>
              Programme <em>Vision</em> &amp; Goals
            </h2>
            <p className="obj-hero-sub">
              Transforming Rwanda&apos;s agriculture through safe, strategic deployment
              of biotechnology  building capacity, increasing yields, and securing
              food for future generations.
            </p>
          </div>
        </section>

        {/* ── Vision / Goal ── */}
        <section className="obj-vg-section">
          <div className="obj-vg-inner">

            <div className="obj-vg-card vision">
              <div className="obj-vg-card-header">
                <div className="obj-vg-icon">
                  <Telescope size={20} />
                </div>
                <span className="obj-vg-card-title">Our Vision</span>
              </div>
              <p>
                A Rwanda where a nationally recognized Centre of Excellence in Crop Biotechnology
                 drives responsible scientific innovation, 
                delivering climate-resilient, farmer-preferred crop varieties that improve food security,
                 farmer prosperity, and environmental sustainability across Africa.
              </p>
            </div>

            <div className="obj-vg-card goal">
              <div className="obj-vg-card-header">
                <div className="obj-vg-icon">
                  <Target size={20} />
                </div>
                <span className="obj-vg-card-title">Our Goal</span>
              </div>
             <p style={{ marginBottom: '0.5rem' }}>
  By 2029, Rwanda BioCap Project will have established Rwanda's Centre of Excellence in Crop
  Biotechnology as a regional hub for research, biosafety, and innovation,
  with the scientific, regulatory, and institutional capacity to develop,
  evaluate, and advance the deployment of biotechnology-enhanced potato,
  cassava, and banana varieties that address Rwanda's most pressing
  agricultural challenges.
</p>
            </div>

          </div>
        </section>

        {/* ── Programme Objectives ── */}
        <section className="obj-grid-section">
          <div className="obj-grid-inner">
            <div className="obj-section-header">
              <span className="obj-section-label">What We&apos;re Building</span>
              <h2 className="obj-section-title">Projects Deriverable</h2>
              <div className="obj-section-underline" />
            </div>

            <div className="obj-cards">
              {objectives.map(({ Icon, title, description }) => (
                <div key={title} className="obj-card">
                  <div className="obj-card-icon">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <h3 className="obj-card-title">{title}</h3>
                  <p className="obj-card-desc">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Strip ── */}
        <section className="obj-cta-strip">
          <div className="obj-cta-inner">
            <h2>Ready to Learn More?</h2>
            <p>
              Explore our biotechnology initiatives, field research, and the science
              driving Rwanda&apos;s agricultural transformation.
            </p>
            <Link href="/Biotech" className="obj-cta-btn">
              Explore Biotechnology
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

/* ── Reusable Partner Card ── */
function PartnerCard({ p }: { p: Partner }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-white hover:shadow-xl transition-all duration-300 text-center no-underline w-full relative overflow-hidden"
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}80)` }}
      />

      {/* Logo circle */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
        style={{ background: `${p.accent}12`, border: `1.5px solid ${p.accent}25` }}
      >
        {p.logo ? (
          <img
            src={p.logo}
            alt={p.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <span
            className="font-black text-sm tracking-tight leading-none"
            style={{ color: p.accent }}
          >
            {p.initials}
          </span>
        )}
      </div>

      {/* Name, role & description */}
      <div className="space-y-1.5 w-full">
        <p className="text-sm font-bold text-[#1B3A5C] leading-snug text-center">{p.fullName}</p>
        <p
          className="text-xs font-semibold uppercase tracking-wider text-center"
          style={{ color: p.accent }}
        >
          {p.role}
        </p>
        <p className="text-xs text-slate-500 leading-relaxed pt-1 text-justify">
          {p.description}
        </p>
      </div>

      {/* Visit link */}
      <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1 mt-auto">
        {p.url.replace('https://', '')}
        <svg className="w-2.5 h-2.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
      </span>
    </a>
  );
}