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
} from 'lucide-react';

export default function AboutPage() {
  const pillars = [
    {
      id: '01',
      title: 'Accelerated Development',
      desc: "Speeding up the research and creation of resilient crop varieties using modern biotechnology and precision breeding techniques tailored to Rwanda's unique agro-climatic zones.",
      bgImage: '/image/image-03.jpg',
      border: 'bg-[#E8185A]',
    },
    {
      id: '02',
      title: 'Deregulation',
      desc: 'Navigating and shaping regulatory frameworks to ensure the safe, transparent, and legally compliant pathway for biotech crop approvals within Rwanda and the East African region.',
      bgImage: '/image/image-04.jpg',
      border: 'bg-[#2D6A7F]',
    },
    {
      id: '03',
      title: 'Deployment',
      desc: 'Getting enhanced seeds and agricultural innovations directly into the hands of Rwandan smallholder farmers through robust extension systems and farmer training programs.',
      bgImage: '/image/image-05.jpg',
      border: 'bg-[#7B2D8B]',
    },
  ];

  const focusCrops = [
    { emoji: '🥔', name: 'Potato', trait: 'Late blight resistance' },
    { emoji: '🌿', name: 'Cassava', trait: 'CMD & CBSD resistance' },
    { emoji: '🍌', name: 'Banana', trait: 'BXW & Fusarium wilt resistance' },
  ];

  const coreMessages = [
    { icon: ShieldCheck, text: 'Biotechnology is safe, regulated, and science-driven' },
    { icon: Sprout, text: 'Improved crops protect farmers from climate and disease losses' },
    { icon: CheckCircle2, text: 'Reduced pesticide use benefits health and the environment' },
    { icon: Users, text: "Rwandan scientists are leading innovation for Rwanda's future" },
  ];

  const audiences = [
    { icon: '🌾', label: 'Smallholder farmers and cooperatives' },
    { icon: '📰', label: 'Journalists and media houses' },
    { icon: '📱', label: 'Social media influencers and youth' },
    { icon: '🏛️', label: 'Policymakers and regulators' },
    { icon: '🤝', label: 'Civil society and faith-based organisations' },
    { icon: '🎓', label: 'Academia and students' },
  ];

  const commTools = [
    { icon: Microscope, label: 'Media training & specialist support' },
    { icon: Radio, label: 'Radio & community drama series' },
    { icon: BookOpen, label: 'Print & digital publications' },
    { icon: Globe, label: 'Podcasts & social media content' },
  ];

  const partners = [
    {
      name: 'CIP',
      fullName: 'International Potato Center',
      role: 'Primary Grantee & Lead',
      url: 'https://cipotato.org',
      initials: 'CIP',
      accent: '#E8185A',
      logo: '/image/cip-logo.webp',
    },
    {
      name: 'RAB',
      fullName: 'Rwanda Agriculture Board',
      role: 'National Lead & Host Institution',
      url: 'https://www.rab.gov.rw',
      initials: 'RAB',
      accent: '#1E4D6B',
      logo: '/image/rab-logo.png',
    },
    {
      name: 'IITA',
      fullName: 'Intl. Institute of Tropical Agriculture',
      role: 'Banana Gene Editing Lead',
      url: 'https://www.iita.org',
      initials: 'IITA',
      accent: '#2A7F8C',
      logo: '/image/IITA-TAA-logo.png',
    },
    {
      name: 'DDPSC',
      fullName: 'Donald Danforth Plant Science Center',
      role: 'Cassava Molecular Analysis',
      url: 'https://www.danforthcenter.org',
      initials: 'DDPSC',
      accent: '#7B3FA0',
      logo: '/image/DDPSC-logo.jpg',
    },
    {
      name: 'MSU',
      fullName: 'Michigan State University',
      role: 'Regulatory Science & Biosafety',
      url: 'https://msu.edu',
      initials: 'MSU',
      accent: '#18453B',
      logo: '/image/oip1-logo.jpeg',
    },
    {
      name: 'CGIAR',
      fullName: 'CGIAR',
      role: 'Global Research Network',
      url: 'https://www.cgiar.org',
      initials: 'CGIAR',
      accent: '#0070C0',
      logo: '/image/cgiar-logo.svg',
    },
    {
      name: 'Alliance for Science',
      fullName: 'Alliance for Science Rwanda',
      role: 'Communication & Outreach',
      url: 'https://www.afs-rwanda.org/',
      initials: 'AfS-rwanda',
      accent: '#7adb94',
      logo: '/image/afs-logo.png',
    },
    {
      name: 'Republic of Rwanda',
      fullName: 'Republic of Rwanda — MINAGRI',
      role: 'Government & Policy',
      url: 'https://www.minagri.gov.rw',
      initials: 'RW',
      accent: '#20A8D8',
      logo: '/image/Coat_of_arms_of_Rwanda.svg',
    },
  ];

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[550px] flex items-center px-6 lg:px-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/image/image-02.jpg"
            alt="BioCap Rwanda Nature"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent" />
        </div>

        <div className="relative z-20 max-w-4xl">
          <p className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-4 drop-shadow-md">
            ABOUT OUR INITIATIVE
          </p>
          <h1 className="text-6xl lg:text-8xl font-serif text-white leading-tight mb-6 italic drop-shadow-lg">
            About <span className="text-[#E8185A]">BioCap</span>
          </h1>
          <p className="text-white/90 text-xl max-w-xl leading-relaxed font-medium drop-shadow-md">
            Building Rwandan Capacity for Accelerated Development, Deregulation, and Deployment of Enhanced Crops — launched December 15, 2025.
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

      {/* ── PARTNERS ── */}
      <section className="py-16 border-b border-gray-100 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-gray-400 mb-2">
              Trusted &amp; supported by
            </p>
            <p className="text-xs text-slate-400">Click any partner to visit their website</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {partners.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md transition-all duration-300 text-center no-underline"
              >
                {/* Logo circle with initials */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                  style={{ background: `${p.accent}15`, border: `1.5px solid ${p.accent}30` }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
  {p.logo ? (
    <img
      src={p.logo}
      alt={p.name}
      className="w-full h-full object-contain p-1"
    />
  ) : (
    <span
      className="font-black text-xs tracking-tight leading-none"
      style={{ color: p.accent }}
    >
      {p.initials}
    </span>
  )}
</div>
                </div>
                {/* Name & role */}
                <div>
                  <p className="text-xs font-bold text-[#1B3A5C] leading-snug mb-1">{p.fullName}</p>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: p.accent }}
                  >
                    {p.role}
                  </p>
                </div>
                {/* Visit link indicator */}
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1">
                  {p.url.replace('https://', '')}
                  <svg className="w-2.5 h-2.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Our Focus
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif text-[#1B3A5C] leading-tight">
            Three pillars driving <br />
            <span className="text-[#E8185A]">Rwanda&apos;s</span> crop innovation
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div
              key={p.id}
              className="relative rounded-3xl p-8 overflow-hidden group h-[400px] flex flex-col justify-end transition-all duration-500 hover:-translate-y-2 shadow-xl border border-slate-100"
            >
              <img
                src={p.bgImage}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#1B3A5C]/75 group-hover:bg-[#1B3A5C]/65 transition-colors duration-300" />
              <div className="relative z-10">
                <span className="text-white/20 font-serif text-6xl font-black block mb-2">{p.id}</span>
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{p.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">{p.desc}</p>
                <div className={`h-[4px] w-16 rounded-full ${p.border}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOCUS CROPS ── */}
      <section className="py-16 bg-[#f7f6f4] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Focus Crops
          </div>
          <h2 className="text-3xl font-serif text-[#1B3A5C] mb-10">
            Three crops, three critical challenges
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {focusCrops.map((c) => (
              <div
                key={c.name}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-4"
              >
                <span className="text-5xl">{c.emoji}</span>
                <h3 className="text-lg font-bold text-[#1B3A5C]">{c.name}</h3>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#E8185A] bg-[#fde8ef] px-4 py-1.5 rounded-full">
                  {c.trait}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-6 text-center">
            REMA granted environmental release approvals for Potato, Cassava &amp; Banana — Rwanda&apos;s first-ever approval of biotech food crops, September 3, 2025.
          </p>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="bg-[#1B3A5C] aspect-[4/3] rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
              <img src="/image/image-01.jpg" className="w-full h-full object-cover opacity-30" />
              <svg
                width="160"
                height="160"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeOpacity="0.2"
                className="absolute"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </div>
            <div className="absolute bottom-[-20px] right-[-20px] bg-white p-6 rounded-2xl shadow-xl z-20">
              <div className="font-serif text-3xl font-black text-[#E8185A]">2025</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Programme Launch
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
            <p className="text-slate-600 mb-6 leading-relaxed">
              BioCap is a flagship initiative dedicated to transforming Rwanda&apos;s agricultural landscape
              through science-based innovation. We work at the intersection of biotechnology, policy, and
              farmer empowerment.
            </p>
            <p className="text-slate-600 mb-6 leading-relaxed">
              A core objective is enabling Rwandan scientists to independently develop a pipeline of
              genetically enhanced crops tailored to national needs — anchored at the Centre of Excellence
              for Crop Biotechnology at RAB Rubona.
            </p>
            <p className="text-slate-600 mb-10 leading-relaxed">
              By building local scientific expertise and strengthening regulatory institutions, BioCap
              ensures Rwanda is not just a consumer of global agricultural innovations — but a creator
              and leader in its own right.
            </p>
            <div className="flex items-center gap-4 pt-8 border-t border-slate-200">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7B2D8B] to-[#E8185A] flex items-center justify-center text-white font-bold">
                PM
              </div>
              <div>
                <div className="font-bold text-[#1B3A5C]">Dr. Pascal Mutabazi</div>
                <div className="text-xs text-slate-500 font-medium">Program Director, BioCap Initiative</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE MESSAGING ── */}
      <section className="py-20 bg-[#1B3A5C] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Core Messages
          </div>
          <h2 className="text-3xl font-serif text-white mb-12">
            What BioCap stands for
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreMessages.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8185A]/15 border border-[#E8185A]/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#ff6ba3]" />
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARGET AUDIENCES ── */}
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
                    <span className="text-2xl flex-shrink-0">{a.icon}</span>
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

      {/* ── EXPERIENCE SECTION ── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-6 h-[2px] bg-[#E8185A]" /> Why BioCap
          </div>
          <h2 className="text-4xl font-serif text-[#1B3A5C] leading-tight mb-6">
            A decade of agricultural <br />
            <span className="text-[#E8185A]">science in Rwanda</span>
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            BioCap draws on Rwanda&apos;s growing ecosystem of research institutions, progressive policy
            frameworks, and a new generation of homegrown scientists committed to food sovereignty.
          </p>
          <ul className="space-y-4 mb-10">
            {[
              'Partnership with Rwanda Agriculture and Animal Resources Development Board (RAB)',
              'Integration with East African Community biosafety harmonization agenda',
              'Locally adapted crop development rooted in smallholder farmer needs',
              'Transparent stakeholder engagement at every programme stage',
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
            src="/image/image-06.jpg"
            alt="Nature Research"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C] via-transparent to-transparent opacity-70" />
          <div className="absolute bottom-10 left-10 text-white z-10">
            <div className="text-8xl font-serif font-black mb-2">10+</div>
            <p className="text-xs uppercase tracking-[4px] font-bold text-[#E8185A]">
              Years of Local Expertise
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}