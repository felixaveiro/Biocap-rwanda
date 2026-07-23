'use client';

import React, { useState } from 'react';
import Footer from '@/components/Footer';
import { type Project } from '@/components/ProjectDetailPage';
import { 
  ArrowLeft, 
  Share2, 
  Send, 
  Link2, 
  MessageCircle, 
  CalendarDays, 
  Users, 
  ArrowUpRight, 
  User,
  CheckCircle2,
  Quote
} from 'lucide-react';

// ── Inline markdown-style bold helper ───────────────────────────────
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[#1B3A5C] font-bold">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ── Article content block types ─────────────────────────────────────
type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string; source?: string }
  | { type: 'emphasis'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; caption: string };

const ARTICLE_TITLE =
  "Showcasing Rwanda BioCap at the 3rd Rwanda National Seed Congress 2026: Advancing Biotechnology for Rwanda's Seed System";

const INITIAL_BLOCKS: Block[] = [
  {
    type: 'p',
    text: 'The **3rd Rwanda National Seed Congress 2026**, held under the theme *"Seeds as a Strategic Engine for National Transformation: Advancing a Competitive and Private-Sector-Led Seed System for Food Security, Jobs and Trade,"* brought together policymakers, researchers, seed companies, farmers, development partners, financial institutions, and international organizations to shape the future of Rwanda\'s seed sector.',
  },
  {
    type: 'p',
    text: 'Throughout the congress, speakers emphasized that quality seed is the foundation of agricultural productivity, climate resilience, food security, and economic transformation.',
  },
  {
    type: 'p',
    text: 'As part of this national platform, the **Rwanda BioCap Project**, led by the **International Potato Center (CIP)** with communication and stakeholder engagement support from **Alliance for Science Rwanda (AfS-Rwanda)**, hosted an interactive exhibition booth that demonstrated how modern crop biotechnology is contributing to Rwanda\'s next generation of climate-resilient, farmer-preferred crop varieties.',
  },
  { type: 'h2', text: "A Window into Rwanda's Biotechnology Future" },
  {
    type: 'p',
    text: 'Designed as an immersive learning space, the Rwanda BioCap booth introduced visitors to the project\'s vision of establishing the **Center of Excellence in Crop Biotechnology** at the **Rwanda Agriculture Board (RAB)**. The exhibition highlighted how Rwanda is investing in scientific capacity, advanced research infrastructure, biosafety, and precision breeding technologies to strengthen food security and agricultural competitiveness.',
  },
  {
    type: 'p',
    text: 'Visitors explored the project\'s three strategic pillars:',
  },
  {
    type: 'list',
    items: [
      '**Accelerated Research & Innovation**',
      '**Biosafety, Regulation & Responsible Innovation**',
      '**Delivering Innovation to Farmers**',
    ],
  },
  {
    type: 'p',
    text: 'Together, these pillars demonstrate how scientific discovery, responsible governance, and farmer participation work hand in hand to develop locally adapted crop innovations that respond to Rwanda\'s agricultural priorities.',
  },
  { type: 'h2', text: 'Showcasing Innovation from Laboratory to Seed System' },
  {
    type: 'p',
    text: 'A major attraction at the booth was the display of high-quality **potato mini-tubers** developed through modern seed production systems led by CIP and national partners. These clean planting materials illustrated the importance of quality seed as the foundation of productive, disease-free potato production and demonstrated how research translates into practical solutions for farmers.',
  },
  {
    type: 'image',
    src: '/image/RDI-CIP-Marriott-photographer-02.jpg',
    caption: 'High-quality potato mini-tubers and seed systems on display at the Rwanda BioCap Project exhibition booth.',
  },
  {
    type: 'p',
    text: 'Alongside the seed displays, visitors engaged with a comprehensive collection of BioCap communication materials, including educational brochures and flyers introducing the project\'s work on **banana, cassava, and potato biotechnology**.',
  },
  {
    type: 'p',
    text: 'The materials explained how precision breeding technologies are being used to strengthen resistance to major pests and diseases while preserving the characteristics farmers and consumers already value.',
  },
  {
    type: 'p',
    text: 'These resources enabled visitors from across the agricultural value chain—including farmers, researchers, regulators, students, development partners, and policymakers—to better understand the role of modern biotechnology in supporting sustainable agricultural transformation.',
  },
  { type: 'h2', text: 'Voices Connecting Seed, BioCap, and Agricultural Transformation' },
  {
    type: 'quote',
    text: 'Quality seed is the foundation of agricultural productivity, climate resilience, food security, and economic transformation. These clean planting materials illustrated the importance of quality seed as the foundation of productive, disease-free potato production and demonstrated how research translates into practical solutions for farmers.',
    source: 'FAO Rwanda Representative',
  },
  {
    type: 'quote',
    text: 'Investment in science, innovation, quality seed, and strategic partnerships is essential for agricultural transformation. Strong seed systems depend on collaboration among government, research institutions, the private sector, development partners, and farmers.',
    source: 'State Minister of Agriculture',
  },
  {
    type: 'quote',
    text: 'The National Seed Congress provided an ideal platform for direct engagement with seed companies, producer organizations, financial institutions, regulators, universities, policymakers, and development partners. The exhibition encouraged meaningful dialogue on how biotechnology complements conventional breeding, quality seed systems, and climate-smart agriculture in delivering resilient crop varieties that support food security and economic growth.',
    source: 'National Seed Association Representative',
  },
  {
    type: 'quote',
    text: 'By showcasing scientific excellence, modern biotechnology, quality seed innovations, and effective stakeholder engagement, the Rwanda BioCap Project demonstrated how Rwanda is building the knowledge, infrastructure, and partnerships needed to become a regional leader in crop biotechnology.',
    source: 'Private Sector Federation (PSF) Representative',
  },
  { type: 'h2', text: 'Engaging Stakeholders Across the Seed Value Chain' },
  {
    type: 'p',
    text: 'The National Seed Congress provided an ideal platform for direct engagement with seed companies, producer organizations, financial institutions, regulators, universities, policymakers, and development partners.',
  },
  {
    type: 'p',
    text: 'Throughout the event, the Rwanda BioCap team discussed the importance of integrating modern biotechnology into Rwanda\'s evolving seed system while reinforcing principles of **biosafety, evidence-based regulation, responsible innovation, and farmer-centred crop improvement**.',
  },
  {
    type: 'emphasis',
    text: 'Biotechnology complements conventional breeding and climate-smart agriculture to build resilient crop varieties.',
  },
  {
    type: 'p',
    text: 'The exhibition encouraged meaningful dialogue on how biotechnology complements conventional breeding, quality seed systems, and climate-smart agriculture in delivering resilient crop varieties that support food security and economic growth.',
  },
  { type: 'h2', text: "Building Momentum for Rwanda's Center of Excellence" },
  {
    type: 'p',
    text: 'The Rwanda BioCap exhibition reflected the broader vision highlighted throughout the National Seed Congress: that investment in science, innovation, quality seed, and strategic partnerships is essential for agricultural transformation.',
  },
  {
    type: 'p',
    text: 'Congress speakers emphasized that strong seed systems depend on collaboration among government, research institutions, the private sector, development partners, and farmers—a vision that closely aligns with the BioCap Project\'s integrated approach.',
  },
  {
    type: 'image',
    src: '/image/RDI-CIP-Marriott-photographer-01.jpg',
    caption: 'Stakeholders and congress delegates connecting science with society at the 3rd Rwanda National Seed Congress 2026.',
  },
  {
    type: 'p',
    text: 'By showcasing scientific excellence, modern biotechnology, quality seed innovations, and effective stakeholder engagement, the Rwanda BioCap Project demonstrated how Rwanda is building the knowledge, infrastructure, and partnerships needed to become a regional leader in crop biotechnology.',
  },
  {
    type: 'p',
    text: 'As Rwanda continues investing in its **Center of Excellence in Crop Biotechnology**, initiatives such as the National Seed Congress provide valuable opportunities to connect science with society, strengthen collaboration across the seed sector, and inspire confidence in the responsible use of biotechnology to deliver farmer-preferred, climate-resilient crop varieties for Rwanda and the wider African region.',
  },
];

interface ExtendedProject extends Project {
  author?: string;
  fullDate?: string;
}

export default function SeedCongressArticle({
  project,
  onBack,
  allProjects = [],
  onSelectProject,
}: {
  project: ExtendedProject;
  onBack: () => void;
  allProjects?: Project[];
  onSelectProject?: (project: Project) => void;
}) {
  const [blocks] = useState<Block[]>(INITIAL_BLOCKS);

  const shareIcons = [
    { Icon: Share2, label: 'Share' },
    { Icon: Send, label: 'Send' },
    { Icon: MessageCircle, label: 'Discuss' },
    { Icon: Link2, label: 'Copy link' },
  ];

  const relatedStories = allProjects.filter((p) => p.title !== project.title);
  const displayDate = project.fullDate || project.modal?.date || '2026';

  return (
    <div className="bg-white min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .sc-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .sc-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .sc-share-btn {
          width: 40px; height: 40px;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .sc-share-btn:hover {
          background: #E8185A;
          color: #ffffff;
          transform: translateY(-2px);
        }
        .sc-side-card {
          background: #ffffff;
          border: 1px solid #e2e8f3;
          border-radius: 16px;
          padding: 1.5rem;
        }
        .sc-side-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1B3A5C;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1rem;
        }
        .sc-story-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #eef1f6;
          text-align: left;
          width: 100%;
        }
        .sc-story-row:last-child { border-bottom: none; padding-bottom: 0; }
        .sc-story-row:first-child { padding-top: 0; }
        .sc-story-thumb {
          width: 56px; height: 56px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f1f5f9;
        }
        .sc-story-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .sc-story-row:hover .sc-story-thumb img { transform: scale(1.08); }
        .sc-story-title {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
          color: #1B3A5C;
          transition: color 0.2s;
        }
        .sc-story-row:hover .sc-story-title { color: #E8185A; }
        .sc-list li::marker { color: #E8185A; }
      `}</style>

      <div className="sc-page">
        {/* ── HERO SECTION ── */}
        <section className="relative overflow-hidden min-h-[460px] flex items-end px-6 lg:px-12 pb-14">
          <div className="absolute inset-0 z-0">
            <img src={project.img} alt={project.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2240] via-[#0f2240]/85 to-[#0f2240]/30" />
          </div>

          <div className="relative z-20 max-w-4xl">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Stewardship News
            </button>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-[#E8185A] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md">
                {project.tag || 'Seed System & Innovation'}
              </span>
            </div>

            <h1 className="sc-serif text-3xl lg:text-5xl text-white leading-tight italic mb-6">
              {ARTICLE_TITLE}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-white/20 text-white/90 text-sm font-medium">
              <div className="inline-flex items-center gap-2">
                <User size={15} className="text-[#E8185A]" />
                <span>{project.author || 'By CIP & Alliance for Science Rwanda'}</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <CalendarDays size={15} className="text-[#E8185A]" />
                <span>{displayDate}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── ARTICLE BODY + SIDEBAR ── */}
        <section className="py-16 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_320px] gap-10 items-start">
            {/* Main article content column */}
            <article className="text-[17px] leading-relaxed min-w-0">
              {blocks.map((block, i) => {
                switch (block.type) {
                  case 'p':
                    return (
                      <p key={i} className="text-justify mb-6">
                        {renderInline(block.text)}
                      </p>
                    );
                  case 'h2':
                    return (
                      <h2 key={i} className="sc-serif text-2xl lg:text-3xl text-[#1B3A5C] mt-12 mb-5">
                        {block.text}
                      </h2>
                    );
                  case 'quote':
                    return (
                      <blockquote key={i} className="my-8 pl-6 border-l-[3px] border-[#E8185A]">
                        <p className="sc-serif italic text-xl lg:text-2xl text-[#1B3A5C] leading-snug">
                          “{block.text}”
                        </p>
                        {block.source && (
                          <cite className="not-italic text-xs font-bold uppercase tracking-widest text-[#E8185A] block mt-3">
                            — {block.source}
                          </cite>
                        )}
                      </blockquote>
                    );
                  case 'emphasis':
                    return (
                      <p
                        key={i}
                        className="sc-serif italic text-xl lg:text-2xl text-[#E8185A] text-left my-10"
                      >
                        {block.text}
                      </p>
                    );
                  case 'list':
                    return (
                      <ul key={i} className="sc-list list-disc pl-6 mb-8 space-y-2 text-slate-700">
                        {block.items.map((item, j) => (
                          <li key={j}>{renderInline(item)}</li>
                        ))}
                      </ul>
                    );
                  case 'image':
                    return (
                      <figure key={i} className="my-12 relative group">
                        <div className="rounded-2xl overflow-hidden shadow-xl relative">
                          <img 
                            src={block.src} 
                            alt={block.caption} 
                            className="w-full h-[320px] object-cover object-top transition-all duration-300 group-hover:brightness-90" 
                          />
                        </div>
                        <figcaption className="text-[13px] text-slate-400 mt-3 text-center capitalize tracking-widest">
                          {block.caption}
                        </figcaption>
                      </figure>
                    );
                  default:
                    return null;
                }
              })}

              <button
                onClick={onBack}
                className="border-2 border-[#1B3A5C] text-[#1B3A5C] text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-[#1B3A5C] hover:text-white transition-colors mt-4"
              >
                ← Back to Stewardship News
              </button>

              <div className="flex items-center gap-3 mt-10 pt-8 border-t border-slate-100">
                <span className="text-xs uppercase tracking-widest text-slate-400 mr-2">Share</span>
                {shareIcons.map(({ Icon, label }, i) => (
                  <button key={i} aria-label={label} className="sc-share-btn">
                    <Icon size={16} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-6 flex flex-col gap-5">
              <div className="sc-side-card">
                <div className="sc-side-label">
                  <CalendarDays size={14} /> Event Details
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 text-slate-600">
                    <CalendarDays size={15} className="text-[#E8185A] mt-0.5 flex-shrink-0" />
                    <span>3rd National Seed Congress (2026)</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <Users size={15} className="text-[#E8185A] mt-0.5 flex-shrink-0" />
                    <span>CIP & Alliance for Science Rwanda</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                      Key Partners
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      RAB · CIP · AfS-Rwanda · MINAGRI · National Seed Association · PSF
                    </p>
                  </div>
                </div>
                <button className="w-full mt-5 border border-slate-200 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white transition-colors inline-flex items-center justify-center gap-2">
                  <Share2 size={13} /> Share Article
                </button>
              </div>

              {relatedStories.length > 0 && (
                <div className="sc-side-card">
                  <div className="sc-side-label">
                    <ArrowUpRight size={14} /> More Stories
                  </div>
                  <div>
                    {relatedStories.map((story, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectProject?.(story)}
                        className="sc-story-row"
                      >
                        <div className="sc-story-thumb">
                          <img src={story.img} alt={story.title} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#E8185A] mb-1">
                            {story.tag}
                          </p>
                          <p className="sc-story-title">{story.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}