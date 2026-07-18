'use client';

import React from 'react';
import Footer from '@/components/Footer';
import { type Project } from '@/components/ProjectDetailPage';
import { ArrowLeft, Share2, Send, Link2, MessageCircle, CalendarDays, Users, ArrowUpRight, User } from 'lucide-react';

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

// ── Article content ──────────────────────────────────────────────────
type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string; source?: string }
  | { type: 'emphasis'; text: string }
  | { type: 'image'; src: string; caption: string };

const ARTICLE_TITLE =
  "Farmer Participation: Putting Farmers at the Centre of Rwanda's Biotechnology Innovation";

const blocks: Block[] = [
  {
    type: 'p',
    text: 'Agricultural innovation has the greatest impact when it responds to farmers’ real needs. For Rwanda’s smallholder farmers, a better crop variety must deliver more than yield: it should resist major diseases, tolerate climate stress, reduce production losses, meet market demand, preserve preferred food qualities, and lower the cost and risk of farming.',
  },
  {
    type: 'p',
    text: 'This is why the **Rwanda BioCap Project** places **Farmer Participation** at the centre of its innovation strategy. The project builds on existing **Rwanda Agriculture and Animal Resources Development Board (RAB)** engagement approaches, including **Farmer Field Schools**, to understand farmers’ experiences, expectations, and priorities for improved crops.',
  },
  { type: 'h2', text: 'Listening Before Innovating' },
  {
    type: 'p',
    text: 'Farmers know which crop traits matter most in their fields and markets. They can identify the diseases that cause the greatest losses, the varieties that perform well under local conditions, the food qualities consumers prefer, and the improvements needed to make farming more productive and profitable.',
  },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project treats this knowledge as an essential guide for research and product development.',
  },
  {
    type: 'p',
    text: 'Through RAB’s established farmer engagement systems, especially **Farmer Field Schools** and cooperative platforms, researchers can listen directly to farmers before setting crop improvement priorities. This helps ensure that biotechnology targets the traits farmers value most, including disease resistance, climate resilience, productivity, quality, marketability, and reliable seed access.',
  },
  {
    type: 'quote',
    text: 'Innovation therefore begins with farmer experience and ends with practical solutions that strengthen livelihoods.',
  },
  {
    type: 'image',
    src: '/image/IMG_150.jpg',
    caption: "RAB facilitators and cooperative leaders mapping out key agronomic needs during a BioCap Farmer Field School assessment.",
  },
  { type: 'h2', text: 'Developing Varieties Farmers Already Want' },
  {
    type: 'p',
    text: 'A core principle of the Rwanda BioCap Project is to improve familiar varieties rather than replace them.',
  },
  {
    type: 'p',
    text: 'For the first time, the project introduces genome editing as a precise crop improvement tool. Its purpose is not to reinvent new varieties, but to strengthen existing crop value chains by enhancing the varieties farmers already grow, trust, sell, and consume.',
  },
  {
    type: 'p',
    text: 'Among the project\'s priority varieties are: **Potato** (Kinigi and Cyerekezo), **Banana** (Kamaramasenge/Kamara and Injagi), and **Cassava** (farmer-preferred varieties identified through national research and stakeholder engagement).',
  },
  {
    type: 'p',
    text: 'Using genome editing and other modern biotechnology tools, researchers aim to improve resistance to major pests and diseases, increase tolerance to climate stress, raise productivity, and protect the qualities farmers and consumers value, including taste, cooking quality, market demand, local adaptation, and cultural significance.',
  },
  {
    type: 'p',
    text: 'This approach allows science to add value to Rwanda’s agricultural heritage while reinforcing existing production, seed, processing, and market systems.',
  },
  { type: 'h2', text: 'Farmers as Partners Throughout the Innovation Journey' },
  {
    type: 'p',
    text: 'Farmer participation is needed throughout the innovation process, from defining priorities to testing and validating improved varieties.',
  },
  {
    type: 'p',
    text: 'Through Farmer Field Schools, cooperative meetings, field demonstrations, participatory evaluations, and technology validation activities, farmers share practical feedback on crop performance, production challenges, consumer acceptance, and market opportunities. Their input helps researchers confirm whether improved varieties meet real farming conditions and value-chain needs.',
  },
  {
    type: 'p',
    text: 'This feedback loop strengthens research quality, builds farmer confidence, and ensures that genome-edited crops are developed with clear benefits for users and markets.',
  },
  {
    type: 'p',
    text: 'By working alongside researchers, extension officers, RAB teams, and policymakers, farmers become co-creators of crop solutions rather than passive recipients of new technologies.',
  },
  { type: 'h2', text: 'Working Through Cooperatives Across Rwanda' },
  {
    type: 'p',
    text: 'Farmer organizations are essential partners in delivering sustainable agricultural transformation.',
  },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project will work through farmer cooperatives, producer organizations, Farmer Field Schools, and agricultural networks across all **30 districts of Rwanda**. These existing structures provide trusted channels for two-way communication between scientists, extension services, and farming communities.',
  },
  {
    type: 'p',
    text: 'These partnerships enable the project to: **understand local production challenges** and priorities, **reach diverse farming systems** across Rwanda’s agro-ecological zones, **facilitate farmer education** on biotechnology, and **strengthen future seed dissemination** and technology adoption.',
  },
  {
    type: 'image',
    src: '/image/potato-field (2).jpg',
    caption: "Local farmers and research partners collaborating during a technology demonstration field day.",
  },
  {
    type: 'p',
    text: 'By using existing RAB and farmer organization platforms, BioCap can align genome editing research with farmer priorities and ensure that innovations reach the people who need them most—on the farm and across the value chain.',
  },
  { type: 'h2', text: 'Building Trust Through Participation' },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project promotes open dialogue throughout the research process so farmers can engage with scientists, ask questions, share experiences, and discuss biotechnology, genome editing, biosafety, and crop improvement.',
  },
  {
    type: 'p',
    text: 'This transparent approach builds trust and ensures that scientific progress reflects farmer expectations, public confidence, and national agricultural priorities.',
  },
  { type: 'h2', text: 'Innovation That Begins and Ends with Farmers' },
  {
    type: 'p',
    text: 'The ultimate goal of the Rwanda BioCap Project is not simply to develop improved crop variety solutions—it is to improve lives.',
  },
  {
    type: 'p',
    text: 'By combining genome editing with meaningful farmer participation, the project ensures that crop improvement remains practical, relevant, and inclusive. Each improved variety should be guided by the voices of the people who will plant it, harvest it, market it, process it, and feed their families with it.',
  },
  {
    type: 'p',
    text: 'Whether improving Kinigi and Cyerekezo potatoes, strengthening Kamaramasenge (Kamara) and Injagi bananas, or enhancing Rwanda’s farmer-preferred cassava varieties, BioCap shows that genome editing can support existing varieties, strengthen value chains, and deliver innovations built with farmers, for farmers.',
  },
  {
    type: 'emphasis',
    text: 'When farmers help shape innovation, crop improvement delivers lasting value.',
  },
];

interface ExtendedProject extends Project {
  author?: string;
  fullDate?: string;
}

export default function FarmerParticipationArticle({
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
        .farm-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .farm-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .farm-share-btn {
          width: 40px; height: 40px;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .farm-share-btn:hover {
          background: #E8185A;
          color: #ffffff;
          transform: translateY(-2px);
        }
        .farm-side-card {
          background: #ffffff;
          border: 1px solid #e2e8f3;
          border-radius: 16px;
          padding: 1.5rem;
        }
        .farm-side-label {
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
        .farm-story-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #eef1f6;
          text-align: left;
          width: 100%;
        }
        .farm-story-row:last-child { border-bottom: none; padding-bottom: 0; }
        .farm-story-row:first-child { padding-top: 0; }
        .farm-story-thumb {
          width: 56px; height: 56px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f1f5f9;
        }
        .farm-story-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .farm-story-row:hover .farm-story-thumb img { transform: scale(1.08); }
        .farm-story-title {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
          color: #1B3A5C;
          transition: color 0.2s;
        }
        .farm-story-row:hover .farm-story-title { color: #E8185A; }
      `}</style>

      <div className="farm-page">
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

            <h1 className="farm-serif text-3xl lg:text-5xl text-white leading-tight italic mb-6">
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
                      <h2 key={i} className="farm-serif text-2xl lg:text-3xl text-[#1B3A5C] mt-12 mb-5">
                        {block.text}
                      </h2>
                    );
                  case 'quote':
                    return (
                      <blockquote key={i} className="my-10 pl-6 border-l-[3px] border-[#E8185A]">
                        <p className="farm-serif italic text-2xl lg:text-3xl text-[#1B3A5C] leading-snug">
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
                        className="farm-serif italic text-xl lg:text-2xl text-[#E8185A] text-left my-10"
                      >
                        {block.text}
                      </p>
                    );
                  case 'image':
                    return (
                      <figure key={i} className="my-12">
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                          <img src={block.src} alt={block.caption} className="w-full h-[320px] object-cover object-top" />
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
                  <button key={i} aria-label={label} className="farm-share-btn">
                    <Icon size={16} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-6 flex flex-col gap-5">
              {(displayDate || project.modal?.organizer || project.modal?.partners) && (
                <div className="farm-side-card">
                  <div className="farm-side-label">
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
                <div className="farm-side-card">
                  <div className="farm-side-label">
                    <ArrowUpRight size={14} /> More Stories
                  </div>
                  <div>
                    {relatedStories.map((story, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectProject?.(story)}
                        className="farm-story-row"
                      >
                        <div className="farm-story-thumb">
                          <img src={story.img} alt={story.title} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#E8185A] mb-1">
                            {story.tag}
                          </p>
                          <p className="farm-story-title">{story.title}</p>
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