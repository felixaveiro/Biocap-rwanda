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

export default function AboutPage() {
  const pillars = [
    {
      id: '01',
      title: 'Accelerated Research & Innovation',
      desc: "The Rwanda BioCap Project strengthens Rwanda\u2019s scientific capacity to develop climate-resilient, farmer-preferred crop varieties through modern biotechnology. The project trains RAB scientists in molecular breeding, genomics, bioinformatics, DNA sequencing, RNA interference, genome editing, and biosafety research. It is building Rwanda\u2019s first in-country biotechnology innovation pipeline to support food security, farmer livelihoods, and agricultural competitiveness.",
      bgImage: '/image/LABDY3_1.jpg',
      border: 'bg-[#E8185A]',
    },
    {
      id: '02',
      title: 'Biosafety, Regulation & Responsible Innovation',
      desc: "The BioCap Project advances responsible biotechnology by strengthening biosafety governance, regulatory capacity, and transparent stakeholder engagement. In collaboration with RICA, REMA, MINAGRI, and regional and international partners, the project supports an efficient, science-based regulatory pathway. This pathway ensures that biotechnology innovations are developed, assessed, and deployed safely, ethically, and transparently.",
      bgImage: '/image/DSC06556(1).jpg',
      border: 'bg-[#2D6A7F]',
    },
    {
      id: '03',
      title: 'Delivering Innovation to Farmers',
      desc: "BioCap turns scientific innovation into practical solutions for Rwanda\u2019s smallholder farmers. It advances improved farmer-preferred cassava, potato, banana cooking, and sweet banana varieties with stronger resistance to major pests and diseases. It also preserves the traits farmers and consumers value. Through research partnerships, seed systems, extension services, and farmer engagement, the project supports higher productivity, reduced crop losses, lower pesticide use, stronger climate resilience, and more stable harvests.",
      bgImage: '/image/DSC_6510.jpg',
      border: 'bg-[#7B2D8B]',
    },
  ];

  const focusCrops = [
    {
      icon: Wheat,
      name: 'Potato',
      trait: '3R gene stack \u00b7 late blight resistance',
      stat: 'Up to 80% yield loss from late blight; farmers spray fungicide 8+ times a season',
      varieties: 'Kinigi & Cyerekezo',
      color: '#E8185A',
      bg: '#fde8ef',
    },
    {
      icon: Leaf,
      name: 'Cassava',
      trait: 'Molecular breeding \u00b7 CBSD & CMD resistance',
      stat: 'All cassava varieties currently grown in Rwanda are susceptible to both viral diseases',
      varieties: 'RNAi-based resistant lines',
      color: '#2A7F8C',
      bg: '#e6f4f6',
    },
    {
      icon: Sprout,
      name: 'Banana',
      trait: 'CRISPR gene editing \u00b7 BXW & Fusarium wilt resistance',
      stat: 'Rwanda\u2019s first in-country gene-editing pipeline, built with IITA',
      varieties: 'Injagi & Sukali Ndiizi',
      color: '#7B3FA0',
      bg: '#f3e8f9',
    },
  ];

  const coreMessages = [
    { icon: ShieldCheck, text: 'Biotechnology is safe, regulated, and grounded in Rwanda\u2019s biosafety frameworks' },
    { icon: Sprout, text: 'Disease-resistant crops protect farmers from climate and pest losses' },
    { icon: CheckCircle2, text: 'Less fungicide and chemical use means cleaner soils, water, and healthier farmers' },
    { icon: Users, text: 'Rwandan scientists are leading the innovation, not just adopting it' },
  ];

  const audiences = [
    { icon: Wheat, label: 'Smallholder farmers and cooperatives' },
    { icon: Newspaper, label: 'Journalists and media houses' },
    { icon: Smartphone, label: 'Social media influencers and youth' },
    { icon: Landmark, label: 'Policymakers, Regulators and Religious Leaders' },
    { icon: Handshake, label: 'Civil society and faith-based organisations' },
    { icon: GraduationCap, label: 'Academia and students' },
  ];

  const commTools = [
    { icon: Microscope, label: 'Media training & specialist support' },
    { icon: Radio, label: 'Radio & community drama series' },
    { icon: BookOpen, label: 'Print & digital publications' },
    { icon: Globe, label: 'Podcasts & social media content' },
  ];

  const quotes = [
    {
      text: 'A new chapter for Rwanda\u2019s agricultural innovation ecosystem.',
      name: 'Dr. Patrick Karangwa',
      role: 'Director of Agriculture Modernization, MINAGRI',
    },
    {
      text: 'Cements Rwanda\u2019s position as a regional leader in science-driven agriculture.',
      name: 'Pacifique Nshimiyimana',
      role: 'Country Director, Alliance for Science Rwanda',
    },
  ];

  const partners: Partner[] = [
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
      logo: '/image/A4S RWANDA-04.jpg.jpeg',
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* \u2500\u2500 HERO \u2500\u2500 */}
      <section className="relative overflow-hidden min-h-[550px] flex items-center px-6 lg:px-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/image/IMG_79.jpg"
            alt="BioCap Rwanda Nature"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent" />
        </div>

        <div className="relative z-20 max-w-4xl">
          <p className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-4 drop-shadow-md">
            Rwanda Biotech Capacity Building Project
          </p>
          <h1 className="text-6xl lg:text-8xl font-serif text-white leading-tight mb-6 italic drop-shadow-lg">
            About <span className="text-[#E8185A]">BioCap</span>
          </h1>
          <p className="text-white/90 text-xl max-w-xl leading-relaxed font-medium drop-shadow-md">
            Building Rwandan capacity to develop genetically improved potato, cassava, and banana
            varieties \u2014 launched 15 December 2025 at the Park Inn by Radisson Kigali.
          </p>
        </div>

        <div className="absolute bottom-[-1px] left-0 w-full z-30 leading-[0]">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* \u2500\u2500 PARTNERS \u2500\u2500 */}
      <section className="py-20 border-b border-gray-100 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-gray-400 mb-2">
              Convened at launch with MINAGRI &amp; REMA, implemented by
            </p>
            <p className="text-xs text-slate-400">Click any partner to visit their website</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {partners.map((p) => (
              <PartnerCard key={p.name} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 THREE PILLARS \u2500\u2500 */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Our Focus
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif text-[#1B3A5C] leading-tight">
            Three Objectives Driving <br />
            <span className="text-[#E8185A]">Rwanda&apos;s</span> BioCap crop innovation
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
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

              <div className="relative z-10 flex flex-col flex-1 p-8 pb-8">
                <span className="text-white/20 font-serif text-6xl font-black leading-none h-[60px] flex items-center">
                  {p.id}
                </span>
                <h3 className="text-xl font-bold text-white mb-4 mt-2 leading-tight">{p.title}</h3>
                <p className="text-white/85 text-sm leading-relaxed text-justify flex-1">
                  {p.desc}
                </p>
                <div className={`h-[4px] w-16 rounded-full ${p.border} mt-6`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* \u2500\u2500 FOCUS CROPS \u2500\u2500 */}
      <section className="py-16 bg-[#f7f6f4] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Focus Crops
          </div>
          <h2 className="text-3xl font-serif text-[#1B3A5C] mb-2">
            Three crops, three urgent disease threats
          </h2>
          <p className="text-slate-500 text-sm mb-10 max-w-2xl">
            Late blight, CBSD/CMD, and BXW/Fusarium wilt each threaten yields by up to 80 percent.
            BioCap pairs proven genetics with the specific science needed to beat each one.
          </p>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {focusCrops.map((c) => (
              <div
                key={c.name}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: c.bg }}
                >
                  <c.icon className="w-8 h-8" style={{ color: c.color }} />
                </div>
                <h3 className="text-lg font-bold text-[#1B3A5C]">{c.name}</h3>
                <span
                  className="text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full"
                  style={{ color: c.color, background: c.bg }}
                >
                  {c.trait}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed pt-1 text-justify flex-1">{c.stat}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100 w-full mt-2">
                  Target varieties: {c.varieties}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 MISSION \u2500\u2500 */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="bg-[#1B3A5C] aspect-[4/3] rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
              <img src="/image/lounch.jpg" className="w-full h-full object-cover opacity-70" />
            </div>
            <div className="absolute bottom-[-20px] right-[-20px] bg-white p-6 rounded-2xl shadow-xl z-20">
              <div className="font-serif text-3xl font-black text-[#E8185A]">15 Dec 2025</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Launched in Kigali
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
              <div className="w-6 h-[2px] bg-[#E8185A]" /> Our Mission
            </div>
            <h2 className="text-4xl font-serif text-[#1B3A5C] leading-tight mb-6">
              Empowering Rwandan scientists and farmers
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed text-justify">
              The Rwanda Biotech Capacity Building (BioCap) Project is a landmark initiative to elevate
              Rwanda&apos;s scientific capacity to develop genetically improved potato, cassava, and
              banana varieties \u2014 strengthening national food security, crop protection, and climate
              resilience.
            </p>
            <p className="text-slate-600 mb-6 leading-relaxed text-justify">
              RAB scientists are being trained in molecular markers, bioinformatics, sequencing, RNAi,
              and CRISPR gene-editing, enabling them to independently build a pipeline of disease-resistant
              crops tailored to Rwanda&apos;s needs.
            </p>
            <p className="text-slate-600 mb-10 leading-relaxed text-justify">
              By pairing local scientific expertise with stronger regulatory institutions, BioCap
              positions Rwanda not just as a consumer of global agricultural innovation, but as a
              continental hub for safe, climate-smart biotechnology.
            </p>
            <div className="flex items-center gap-4 pt-8 border-t border-slate-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7B2D8B] to-[#E8185A] flex items-center justify-center text-white font-bold">
                CIP
              </div>
              <div>
                <div className="font-bold text-[#1B3A5C]">International Potato Center (CIP)</div>
                <div className="text-xs text-slate-500 font-medium">Lead Implementing Partner, BioCap Project</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 VOICES FROM THE LAUNCH \u2500\u2500 */}
      <section className="py-20 bg-white px-6 lg:px-12 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> From The Launch
          </div>
          <h2 className="text-3xl font-serif text-[#1B3A5C] mb-10">
            Voices from 15 December 2025
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {quotes.map((q) => (
              <div
                key={q.name}
                className="bg-[#f7f6f4] rounded-2xl p-8 border border-slate-100 relative flex flex-col"
              >
                <Quote className="w-8 h-8 text-[#E8185A]/30 mb-4" />
                <p className="text-lg font-serif text-[#1B3A5C] leading-snug mb-6 text-justify flex-1">
                  &ldquo;{q.text}&rdquo;
                </p>
                <div className="text-sm font-bold text-[#1B3A5C]">{q.name}</div>
                <div className="text-xs text-slate-500">{q.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 CORE MESSAGING \u2500\u2500 */}
      <section className="py-20 bg-[#1B3A5C] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Core Messages
          </div>
          <h2 className="text-3xl font-serif text-white mb-12">
            What BioCap stands for
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {coreMessages.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8185A]/15 border border-[#E8185A]/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#ff6ba3]" />
                </div>
                <p className="text-sm text-white/80 leading-relaxed text-justify">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 TARGET AUDIENCES \u2500\u2500 */}
      <section className="py-20 bg-[#f7f6f4] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Audiences */}
            <div>
              <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
                <div className="w-6 h-[2px] bg-[#E8185A]" /> Who We Reach
              </div>
              <h2 className="text-3xl font-serif text-[#1B3A5C] mb-8">Target audiences</h2>
              <div className="grid grid-cols-2 gap-4">
                {audiences.map((a) => (
                  <div
                    key={a.label}
                    className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#fde8ef] flex items-center justify-center flex-shrink-0">
                      <a.icon className="w-4 h-4 text-[#E8185A]" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-snug">{a.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication tools */}
            <div>
              <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
                <div className="w-6 h-[2px] bg-[#E8185A]" /> Communication
              </div>
              <h2 className="text-3xl font-serif text-[#1B3A5C] mb-8">Tools &amp; channels</h2>
              <div className="space-y-4 mb-8">
                {commTools.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#fde8ef] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#E8185A]" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
              {/* Community storytelling highlight */}
              <div className="bg-[#1B3A5C] rounded-2xl p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-[#E8185A] mb-3">
                  Community Engagement
                </p>
                <ul className="space-y-2 text-sm text-white/80">
                  {[
                    'Drama series (scripts & performances)',
                    'Radio and community theatre',
                    'Seeing is Believing & Farmer testimonies',
                    'Scientist-to-public storytelling',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E8185A] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 ECONOMIC OPPORTUNITY / WHY BIOCAP \u2500\u2500 */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Why BioCap
          </div>
          <h2 className="text-4xl font-serif text-[#1B3A5C] leading-tight mb-6">
            A strategic investment in <br />
            <span className="text-[#E8185A]">farmers and food systems</span>
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed text-justify">
            BioCap is not only about science \u2014 it is a strategic investment in Rwanda&apos;s economy,
            built on partnership with MINAGRI, REMA, and Rwanda&apos;s growing ecosystem of research
            institutions and homegrown scientists.
          </p>
          <ul className="space-y-4 mb-10">
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
            href="#"
            className="bg-[#E8185A] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1B3A5C] transition-all inline-block shadow-lg"
          >
            Discover More →
          </Link>
        </div>

        <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
          <img
            src="/image/IMG_37.jpg"
            alt="Nature Research"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C] via-transparent to-transparent opacity-70" />
          <div className="absolute bottom-10 left-10 text-white z-10">
            <div className="text-8xl font-serif font-black mb-2">3</div>
            <p className="text-xs uppercase tracking-[4px] font-bold text-[#E8185A]">
              Staple Crops, One National Pipeline
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* \u2500\u2500 Reusable Partner Card \u2500\u2500 */
function PartnerCard({ p }: { p: Partner }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-5 p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-xl transition-all duration-300 text-center no-underline w-full relative overflow-hidden"
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}80)` }}
      />

      {/* Logo circle */}
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 overflow-hidden"
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
      <div className="space-y-2 w-full">
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