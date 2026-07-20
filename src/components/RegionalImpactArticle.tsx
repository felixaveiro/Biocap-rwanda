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
  Globe2,
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

type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string; source?: string }
  | { type: 'emphasis'; text: string }
  | { type: 'image'; src: string; caption: string };

const ARTICLE_TITLE =
  'Regional Impact: Building an African Model for Responsible Crop Biotechnology';

const INITIAL_BLOCKS: Block[] = [
  {
    type: 'quote',
    text: 'Africa\u2019s food security challenge is not simply a shortage of agricultural land \u2014 it is a productivity challenge.',
  },
  {
    type: 'p',
    text: "Africa's food security challenge is not simply a shortage of agricultural land. It is also a productivity challenge: many farmers harvest far less from each hectare than is biologically possible because of crop diseases, climate stress, limited access to quality planting material, and weak research-to-farmer delivery systems.",
  },
  {
    type: 'p',
    text: "The **Rwanda BioCap Project** is responding by building a nationally led biotechnology model that can be tested in Rwanda, strengthened through evidence, and adapted by other African countries. Through the **Center of Excellence in Crop Biotechnology at RAB Rubona**, Rwanda is creating an integrated pathway from advanced research and precision breeding to biosafety assessment, variety registration, seed multiplication, and responsible delivery to farmers.",
  },
  { type: 'h2', text: 'Rwanda as a Proving Ground for Scalable Innovation' },
  {
    type: 'p',
    text: "Rwanda's relatively compact geography, coordinated public institutions, diverse agro-ecological zones, and strong culture of performance-based implementation provide an important environment for testing how agricultural biotechnology can move responsibly from the laboratory to farmers' fields.",
  },
  {
    type: 'p',
    text: 'The Rwanda BioCap model brings together modern research infrastructure, advanced training for African scientists, farmer-preferred crop improvement, science-based biosafety regulation, field data collection and analysis, farmer and public engagement, and systems for variety registration and planting-material delivery.',
  },
  {
    type: 'p',
    text: "The objective is not to create a single technology for export to every country. It is to demonstrate a **replicable process** through which each country can develop locally appropriate biotechnology solutions for its own crops, farmers, markets, environments, and value chains.",
  },
  {
    type: 'image',
    src: '/image/IMG_126.jpg',
    caption: 'Scientists and partners collaborating at the RAB Center of Excellence in Crop Biotechnology to develop scalable, science-driven innovations for Rwanda and Africa.',
  },
  { type: 'h2', text: 'The Productivity Opportunity' },
  {
    type: 'p',
    text: 'For example, cassava demonstrates why locally tailored innovation matters.',
  },
  {
    type: 'p',
    text: 'Recent FAOSTAT yield data show substantial differences in cassava productivity among Rwanda, Burundi, Kenya, Nigeria, and Mozambique among many African countries where the crop is produced for food and feed. Rwanda generally performs within the stronger part of this comparison, while several major cassava-producing countries continue to obtain relatively modest yields per hectare. Nigeria, for example, is Africa\u2019s largest cassava producer primarily because of the enormous area cultivated, not because it records the continent\u2019s highest farm-level productivity.',
  },
  {
    type: 'p',
    text: 'Across these countries, national averages remain far below the yields that improved varieties can achieve under suitable agronomic and disease-management conditions. This gap represents lost food, farmer income, industrial raw material, and economic opportunity.',
  },
  {
    type: 'p',
    text: 'However, comparisons must be interpreted carefully. Yield differences are influenced by rainfall, soils, farming practices, access to clean planting materials, fertilizer use, market incentives, data-collection methods, and the prevalence of diseases. Biotechnology is a complement \u2014 not a replacement \u2014 for strong seed systems built by all countries, delivering efficient breeding technology that strengthens locally preferred variety traits, soil health, extension services, irrigation, storage, and market development.',
  },
  { type: 'h2', text: 'Improving the Crops Africa Depends On' },
  {
    type: 'p',
    text: 'BioCap focuses on **cassava, potato, and banana**, crops that are essential to household food security, nutrition, rural incomes, and local processing industries.',
  },
  {
    type: 'p',
    text: 'Disease can sharply reduce the productivity of all three: cassava is threatened by cassava mosaic disease and cassava brown streak disease; potato production is constrained by late blight and other seed- and field-borne diseases; and banana is vulnerable to bacterial wilt, Fusarium wilt, and other pests and pathogens.',
  },
  {
    type: 'p',
    text: 'Through molecular breeding, genomics, RNA interference, and precision genome editing, scientists can identify and modify specific biological pathways associated with disease susceptibility or resistance.',
  },
  {
    type: 'p',
    text: 'The aim is to preserve the characteristics farmers and consumers already value \u2014 such as taste, cooking quality, texture, maturity period, market demand, and local adaptation \u2014 while introducing stronger protection against production threats.',
  },
  {
    type: 'p',
    text: 'For Rwanda, this means improving familiar varieties such as **Kinigi and Cyerekezo potato**, **Kamara and Injagi banana**, and farmer-preferred cassava materials rather than expecting communities to abandon crops with established cultural and commercial value.',
  },
  {
    type: 'image',
    src: '/image/lounch.jpg',
    caption: "Regional collaboration driving the development of farmer-preferred crop varieties through responsible biotechnology, scientific excellence, and innovation for Africa's food security.",
  },
  { type: 'h2', text: 'Precision Breeding for Local Solutions' },
  {
    type: 'p',
    text: "Gene editing is especially promising because it can make targeted changes within a plant's genome without reshuffling thousands of genes through repeated conventional crosses.",
  },
  {
    type: 'p',
    text: 'This precision could help scientists strengthen an established local variety while retaining most of its existing genetic identity and preferred characteristics. Nevertheless, every improved line must still undergo careful laboratory characterization, greenhouse and field evaluation, food and environmental safety assessment where required, and national variety-registration procedures.',
  },
  {
    type: 'p',
    text: "BioCap's regional value therefore lies not only in access to CRISPR and other modern tools, but also in demonstrating how these tools can be governed and applied responsibly within African public research systems.",
  },
  { type: 'h2', text: 'From National Capacity to Regional Public Good' },
  {
    type: 'p',
    text: "The Center of Excellence in Crop Biotechnology is expected to reduce Rwanda's dependence on expensive laboratory services performed outside the country and expand access to capabilities such as DNA sequencing, plant transformation, genome editing, bioinformatics, molecular diagnostics, and biosafety research.",
  },
  {
    type: 'p',
    text: 'As this capacity matures, it can support regional scientific collaboration through postgraduate and technical training, shared research protocols, exchange of plant-health and genomic information, collaborative improvement of regionally important crops, harmonized scientific dialogue on biosafety, and evidence generated across comparable agro-ecological environments.',
  },
  {
    type: 'p',
    text: 'BioCap has been explicitly presented as a platform for positioning Rwanda as a regional hub for locally led and responsible agricultural biotechnology. Project partners have also identified the Center of Excellence as a potential model for similar national programmes elsewhere in Africa, especially where countries seek to strengthen local food systems without losing farmer-preferred traits, consumer choices, and value-chain opportunities.',
  },
  {
    type: 'image',
    src: '/image/resource-information.jpg',
    caption: 'Regional leaders, researchers, and development partners convene to strengthen collaboration, share scientific knowledge, and advance responsible agricultural biotechnology for sustainable food systems across Africa',
  },
  { type: 'h2', text: 'Leadership Through Safety and Environmental Stewardship' },
  {
    type: 'p',
    text: "Rwanda's scientific leadership will ultimately be measured not only by how quickly it develops new technologies, but also by how responsibly it evaluates and manages them.",
  },
  {
    type: 'p',
    text: 'The BioCap approach integrates innovation with biosafety, environmental stewardship, transparent regulation, and stakeholder participation. Decisions must remain grounded in evidence, assessed case by case, and informed by the characteristics of the crop, the introduced trait, the receiving environment, and the intended farming system.',
  },
  {
    type: 'p',
    text: 'This creates a model in which regulatory oversight is not treated as an obstacle to research, but as an essential foundation for public confidence and sustainable deployment.',
  },
  { type: 'h2', text: 'A Replicable Vision for African Food Security' },
  {
    type: 'p',
    text: 'Rwanda cannot solve Africa\u2019s crop-productivity challenges alone. It can, however, demonstrate what becomes possible when scientific infrastructure, skilled researchers, responsible regulation, farmer participation, and technology-delivery systems are built together.',
  },
  {
    type: 'p',
    text: 'By using Rwanda as a proving ground, the BioCap Project can generate practical lessons for East Africa and the wider continent. These lessons show how biotechnology can reduce losses caused by crop diseases, improve yield stability, protect farmer-preferred varieties, strengthen clean seed and planting-material systems, increase domestic food production, support processing and value addition, and reduce avoidable dependence on food imports.',
  },
  {
    type: 'p',
    text: 'The regional promise of Rwanda BioCap is therefore larger than any individual laboratory or improved variety. Its most important contribution is the creation of an African-led innovation model through which countries can safely develop, evaluate, and deliver tailor-made crop solutions. By investing in laboratory infrastructure and human resources at the same time, Rwanda is showing how precision breeding can strengthen local food systems while preserving farmer-preferred traits, consumer choice, and value-chain development.',
  },
  {
    type: 'quote',
    text: 'This is a replicable pathway for African nations seeking to improve productivity, competitiveness, environmental stewardship, and food self-reliance across the continent.',
    source: 'Rwanda BioCap Project  Regional Impact',
  },
];

interface ExtendedProject extends Project {
  author?: string;
  fullDate?: string;
}

export default function RegionalImpactArticle({
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
  const displayDate = project.fullDate || project.modal?.date || '15/12/2026';

  return (
    <div className="bg-white min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .pba-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .pba-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .pba-share-btn {
          width: 40px; height: 40px;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .pba-share-btn:hover {
          background: #E8185A;
          color: #ffffff;
          transform: translateY(-2px);
        }
        .pba-side-card {
          background: #ffffff;
          border: 1px solid #e2e8f3;
          border-radius: 16px;
          padding: 1.5rem;
        }
        .pba-side-label {
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
        .pba-story-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #eef1f6;
          text-align: left;
          width: 100%;
        }
        .pba-story-row:last-child { border-bottom: none; padding-bottom: 0; }
        .pba-story-row:first-child { padding-top: 0; }
        .pba-story-thumb {
          width: 56px; height: 56px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f1f5f9;
        }
        .pba-story-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .pba-story-row:hover .pba-story-thumb img { transform: scale(1.08); }
        .pba-story-title {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
          color: #1B3A5C;
          transition: color 0.2s;
        }
        .pba-story-row:hover .pba-story-title { color: #E8185A; }
      `}</style>

      <div className="pba-page">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden min-h-[600px] flex items-end px-6 lg:px-12 pb-6">
          <div className="absolute inset-0 z-0">
            <img src={project.img} alt={project.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2240] via-[#0f2240]/85 to-[#0f2240]/30" />
          </div>

          <div className="relative z-20 max-w-4xl">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest mb-5 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Stewardship News
            </button>

            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4">
              <Globe2 size={22} className="text-white" strokeWidth={1.75} />
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="bg-[#E8185A] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md">
                {project.tag}
              </span>
            </div>

            <h1 className="font-sans font-extrabold text-2xl lg:text-4xl text-white leading-tight mb-3">
              {ARTICLE_TITLE}
            </h1>

            {project.excerpt && (
              <p className="text-white/80 text-sm lg:text-base leading-relaxed max-w-2xl mb-5">
                {project.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-white/20 text-white/90 text-sm font-medium">
              <div className="inline-flex items-center gap-2">
                <User size={15} className="text-[#E8185A]" />
                <span>{project.author || 'By Nshimiyimana Pacifique'}</span>
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
            {/* Main article column */}
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
                      <h2 key={i} className="pba-serif text-2xl lg:text-3xl text-[#1B3A5C] mt-12 mb-5">
                        {block.text}
                      </h2>
                    );
                  case 'quote':
                    return (
                      <blockquote key={i} className="my-10 pl-6 border-l-[3px] border-[#E8185A]">
                        <p className="pba-serif italic text-2xl lg:text-3xl text-[#1B3A5C] leading-snug">
                          {block.text}
                        </p>
                        {block.source && (
                          <cite className="not-italic text-xs uppercase tracking-widest text-slate-400 block mt-4">
                            {block.source}
                          </cite>
                        )}
                      </blockquote>
                    );
                  case 'emphasis':
                    return (
                      <p
                        key={i}
                        className="pba-serif italic text-xl lg:text-2xl text-[#E8185A] text-left my-10"
                      >
                        {block.text}
                      </p>
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
                Back to Stewardship News
              </button>

              <div className="flex items-center gap-3 mt-10 pt-8 border-t border-slate-100">
                <span className="text-xs uppercase tracking-widest text-slate-400 mr-2">Share</span>
                {shareIcons.map(({ Icon, label }, i) => (
                  <button key={i} aria-label={label} className="pba-share-btn">
                    <Icon size={16} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-6 flex flex-col gap-5">
              {(displayDate || project.modal?.organizer || project.modal?.partners) && (
                <div className="pba-side-card">
                  <div className="pba-side-label">
                    <CalendarDays size={14} /> Details
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2 text-slate-600">
                      <CalendarDays size={15} className="text-[#E8185A] mt-0.5 flex-shrink-0" />
                      <span>{displayDate}</span>
                    </div>
                    {project.modal?.organizer && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <Users size={15} className="text-[#E8185A] mt-0.5 flex-shrink-0" />
                        <span>{project.modal.organizer}</span>
                      </div>
                    )}
                    {project.modal?.partners && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                          Partners
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed">{project.modal.partners}</p>
                      </div>
                    )}
                  </div>
                  <button className="w-full mt-5 border border-slate-200 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white transition-colors inline-flex items-center justify-center gap-2">
                    <Share2 size={13} /> Share Article
                  </button>
                </div>
              )}

              {relatedStories.length > 0 && (
                <div className="pba-side-card">
                  <div className="pba-side-label">
                    <ArrowUpRight size={14} /> More Stories
                  </div>
                  <div>
                    {relatedStories.map((story, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectProject?.(story)}
                        className="pba-story-row"
                      >
                        <div className="pba-story-thumb">
                          <img src={story.img} alt={story.title} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#E8185A] mb-1">
                            {story.tag}
                          </p>
                          <p className="pba-story-title">{story.title}</p>
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