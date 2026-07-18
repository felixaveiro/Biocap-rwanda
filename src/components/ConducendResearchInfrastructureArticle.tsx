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
  User
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

// ── Article content types ───────────────────────────────────────────
type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string; source?: string }
  | { type: 'emphasis'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; caption: string };

const ARTICLE_TITLE =
  "Conducive Research Infrastructure: Building Rwanda's Center of Excellence in Crop Biotechnology";

const INITIAL_BLOCKS: Block[] = [
  {
    type: 'p',
    text: 'Scientific innovation flourishes where ideas, expertise, and world-class infrastructure come together. For Rwanda, investing in modern research facilities is more than constructing laboratories — it is creating the foundation for a future where agricultural solutions are discovered, developed, and delivered by Rwandan scientists for Rwanda and the African continent.',
  },
  {
    type: 'p',
    text: "At the heart of the **Rwanda BioCap Project** is the establishment of the **Center of Excellence in Crop Biotechnology** at the **Rwanda Agriculture Board (RAB)**. This landmark investment is transforming Rwanda into an emerging regional hub for modern crop biotechnology, equipped to accelerate research, strengthen scientific capacity, and deliver climate-resilient, farmer-preferred crop varieties that address Africa's food security challenges.",
  },
  { type: 'h2', text: 'Bringing World-Class Biotechnology Home' },
  {
    type: 'p',
    text: 'For many years, advanced biotechnology research required African scientists to rely on laboratories outside their own countries for specialized analyses such as DNA sequencing, molecular characterization, genome editing, and bioinformatics. While these collaborations have been invaluable, they often involve significant costs, longer turnaround times, and limited opportunities for continuous local research.',
  },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project is changing this landscape.',
  },
  {
    type: 'p',
    text: 'By establishing state-of-the-art biotechnology laboratories and research facilities within Rwanda, the Center of Excellence will enable scientists to conduct advanced research that previously depended on overseas institutions. From molecular biology and genomics to **CRISPR-based genome editing** and bioinformatics, critical scientific work can increasingly be undertaken locally, reducing costs, improving efficiency, and strengthening national scientific independence.',
  },
  {
    type: 'p',
    text: 'This investment will help Rwanda retain expertise, speed up innovation, and build sustainable research capacity for future generations.',
  },
  { type: 'h2', text: 'A Platform for African Scientific Leadership' },
  {
    type: 'p',
    text: 'The Center of Excellence is more than a national facility — it is a strategic investment in regional scientific leadership.',
  },
  {
    type: 'p',
    text: 'Designed to support cutting-edge research, advanced laboratory training, and collaborative innovation, the Centre positions Rwanda among the pioneering African countries investing in next-generation crop biotechnology infrastructure.',
  },
  {
    type: 'p',
    text: 'As national capabilities continue to expand, the Centre is expected to foster stronger collaboration with universities, research institutions, regulatory agencies, and international partners, creating opportunities for knowledge exchange, postgraduate training, and multidisciplinary research across Eastern and Central Africa.',
  },
  {
    type: 'image',
    src: '/image/LABDY3_18.jpg',
    caption: 'Representatives from RAB and collaborative partners stand together at the site of the Center of Excellence, which will serve as a regional hub for next-generation crop biotechnology.',
  },
  {
    type: 'p',
    text: "By investing in people alongside infrastructure, Rwanda is nurturing a new generation of African scientists equipped to lead the continent's biotechnology agenda.",
  },
  { type: 'h2', text: 'Empowering Scientists to Improve Local Crops' },
  {
    type: 'p',
    text: 'The greatest strength of the Rwanda BioCap Project lies in its commitment to improving the crops that matter most to Rwandan farmers and consumers.',
  },
  {
    type: 'p',
    text: 'Researchers are receiving advanced academic and technical training in molecular breeding, genomics, bioinformatics, biosafety, DNA sequencing, and genome editing. Combined with access to modern laboratory facilities, this expertise enables scientists to improve farmer-preferred local varieties while preserving the qualities that have made them successful.',
  },
  {
    type: 'emphasis',
    text: 'Rather than replacing familiar crop traits, precision biotechnology allows researchers to enhance them.',
  },
  {
    type: 'p',
    text: 'For priority crops such as **banana, cassava, and potato**, scientists can work toward strengthening resistance to major pests and diseases while maintaining the taste, cooking quality, texture, yield characteristics, market acceptance, and local adaptation that farmers and consumers value.',
  },
  {
    type: 'p',
    text: "This approach protects Rwanda's agricultural heritage while expanding opportunities for stronger value chains, increased productivity, reduced production losses, and greater resilience to climate change.",
  },
  {
    type: 'p',
    text: "The new laboratory infrastructure will also strengthen Rwanda's seed system. Through **tissue culture, diagnostics, and quality testing**, RAB's Center of Excellence can support local seed companies to multiply and distribute clean planting materials for key food security crops such as banana, cassava, and potato. This will help reduce dependence on imported materials, improve access to healthy seed, and ensure that improved varieties reach farmers faster.",
  },
  { type: 'h2', text: "Connecting Laboratory Science with Farmers' Fields" },
  {
    type: 'p',
    text: 'Modern agricultural research does not end inside the laboratory.',
  },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project is building an integrated system that links laboratory discoveries with greenhouse studies, confined field trials, farmer evaluations, and national variety development programmes.',
  },
  {
    type: 'p',
    text: 'A key part of this system is **real-time field data collection and digital analysis** across crop varieties and agro-ecological zones. By combining molecular research with field performance data, scientists can evaluate promising materials, monitor traits, analyse environmental responses, and generate evidence for better decisions.',
  },
  {
    type: 'image',
    src: '/image/LABDY3_30.jpg',
    caption: "Partners and researchers lay the symbolic foundation stone (Ibuye ry'Ifatizo) for the landmark Center of Excellence in Crop Biotechnology at (RAB) Rubona Station.",
  },
  {
    type: 'p',
    text: 'This data-driven pipeline supports faster learning, continuous improvement, and stronger regulatory decision-making.',
  },
  { type: 'h2', text: 'Accelerating Innovation Through Integrated Research' },
  {
    type: 'p',
    text: 'The Center of Excellence brings together every stage of modern crop improvement within one coordinated research ecosystem:',
  },
  {
    type: 'list',
    items: [
      'Advanced molecular biology laboratories',
      'Genomics and DNA sequencing',
      'Bioinformatics and computational biology',
      'CRISPR genome editing',
      'Tissue culture and plant transformation',
      'Greenhouse and controlled-environment research',
      'Confined field trials',
      'Digital field data collection and analytics',
      'Biosafety assessment',
      'Variety evaluation and registration',
    ],
  },
  {
    type: 'p',
    text: 'By integrating these capabilities, Rwanda can shorten the path from scientific discovery to practical agricultural use while ensuring that each innovation is backed by strong evidence.',
  },
  { type: 'h2', text: "Investing in Rwanda's Agricultural Future" },
  {
    type: 'p',
    text: 'Infrastructure is one of the most enduring investments a nation can make.',
  },
  {
    type: 'p',
    text: "The Rwanda BioCap Project's Center of Excellence in Crop Biotechnology represents a long-term commitment to scientific excellence, national self-reliance, and agricultural transformation. It provides the facilities, technologies, and expertise needed to respond to emerging crop challenges and strengthen Rwanda's role as a regional leader in crop biotechnology.",
  },
  {
    type: 'p',
    text: "As the Centre grows, it will support Rwanda's priority crops and serve as a platform for regional collaboration, scientific training, and technology development that benefits farmers across Africa.",
  },
  {
    type: 'quote',
    text: "By bringing world-class biotechnology closer to the communities it serves, the Rwanda BioCap Project is making innovation faster, more locally driven, and better focused on resilient crops that support food security, rural prosperity, and sustainable agricultural development.",
  },
];

interface ExtendedProject extends Project {
  author?: string;
  fullDate?: string;
}

export default function ConducendResearchInfrastructureArticle({
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
        .cri-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .cri-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .cri-share-btn {
          width: 40px; height: 40px;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .cri-share-btn:hover {
          background: #E8185A;
          color: #ffffff;
          transform: translateY(-2px);
        }
        .cri-side-card {
          background: #ffffff;
          border: 1px solid #e2e8f3;
          border-radius: 16px;
          padding: 1.5rem;
        }
        .cri-side-label {
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
        .cri-story-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #eef1f6;
          text-align: left;
          width: 100%;
        }
        .cri-story-row:last-child { border-bottom: none; padding-bottom: 0; }
        .cri-story-row:first-child { padding-top: 0; }
        .cri-story-thumb {
          width: 56px; height: 56px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f1f5f9;
        }
        .cri-story-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .cri-story-row:hover .cri-story-thumb img { transform: scale(1.08); }
        .cri-story-title {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
          color: #1B3A5C;
          transition: color 0.2s;
        }
        .cri-story-row:hover .cri-story-title { color: #E8185A; }
        .cri-list li::marker { color: #E8185A; }
      `}</style>

      <div className="cri-page">
        {/* ── HERO ── */}
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
                {project.tag}
              </span>
            </div>

            <h1 className="cri-serif text-3xl lg:text-5xl text-white leading-tight italic mb-6">
              {ARTICLE_TITLE}
            </h1>

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
                      <h2 key={i} className="cri-serif text-2xl lg:text-3xl text-[#1B3A5C] mt-12 mb-5">
                        {block.text}
                      </h2>
                    );
                  case 'quote':
                    return (
                      <blockquote key={i} className="my-10 pl-6 border-l-[3px] border-[#E8185A]">
                        <p className="cri-serif italic text-2xl lg:text-3xl text-[#1B3A5C] leading-snug">
                          “{block.text}”
                        </p>
                        {block.source && (
                          <cite className="not-italic text-xs uppercase tracking-widest text-slate-400 block mt-4">
                            — {block.source}
                          </cite>
                        )}
                      </blockquote>
                    );
                  case 'emphasis':
                    return (
                      <p
                        key={i}
                        className="cri-serif italic text-xl lg:text-2xl text-[#E8185A] text-left my-10"
                      >
                        {block.text}
                      </p>
                    );
                  case 'list':
                    return (
                      <ul key={i} className="cri-list list-disc pl-6 mb-8 space-y-2 text-slate-600">
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
                  <button key={i} aria-label={label} className="cri-share-btn">
                    <Icon size={16} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-6 flex flex-col gap-5">
              {(displayDate || project.modal?.organizer || project.modal?.partners) && (
                <div className="cri-side-card">
                  <div className="cri-side-label">
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
                <div className="cri-side-card">
                  <div className="cri-side-label">
                    <ArrowUpRight size={14} /> More Stories
                  </div>
                  <div>
                    {relatedStories.map((story, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectProject?.(story)}
                        className="cri-story-row"
                      >
                        <div className="cri-story-thumb">
                          <img src={story.img} alt={story.title} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#E8185A] mb-1">
                            {story.tag}
                          </p>
                          <p className="cri-story-title">{story.title}</p>
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