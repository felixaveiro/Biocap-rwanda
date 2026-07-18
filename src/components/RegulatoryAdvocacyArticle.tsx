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
  | { type: 'image'; src: string; caption: string };

const ARTICLE_TITLE =
  "Regulatory Advocacy: Evidence-Driven Policies Powering Rwanda's Biotechnology Future";

const INITIAL_BLOCKS: Block[] = [
  {
    type: 'p',
    text: 'Scientific discoveries improve lives only when they are supported by sound public policy. As crop biotechnology continues to evolve, countries need regulatory systems that protect public health and the environment while enabling farmers and researchers to benefit from proven scientific innovations.',
  },
  {
    type: 'p',
    text: 'The **Rwanda BioCap Project** recognizes that responsible innovation begins with **evidence-driven regulatory advocacy**: policies that are transparent, science-based, and responsive to the needs of farmers, consumers, researchers, and the nation.',
  },
  { type: 'h2', text: 'Science at the Heart of Decision-Making' },
  {
    type: 'p',
    text: "Rwanda has earned international recognition for adopting a pragmatic, evidence-based approach to agricultural innovation. Rather than making decisions based on speculation or misinformation, the country relies on scientific risk assessment, regulatory transparency, and internationally accepted biosafety principles to evaluate emerging technologies.",
  },
  {
    type: 'p',
    text: "This commitment has enabled Rwanda to establish one of Africa's most progressive biotechnology governance systems, supported by the **Biosafety Law**, implementing regulations, and strong collaboration among institutions including the **Rwanda Agriculture Board (RAB)**, the **Rwanda Inspectorate, Competition and Consumer Protection Authority (RICA)**, the **Rwanda Environment Management Authority (REMA)**, and the **Ministry of Agriculture and Animal Resources (MINAGRI)**.",
  },
  {
    type: 'p',
    text: 'Through the Rwanda BioCap Project, this regulatory ecosystem is being further strengthened to support the safe development, evaluation, and eventual deployment of precision biotechnology, including **CRISPR-based genome editing**, while maintaining the highest standards of biosafety, environmental stewardship, and public accountability.',
  },
  {
    type: 'p',
    text: 'This vision was reinforced at the Rwanda BioCap launch, where Dr. Solange Uwituze, Minister of State for Agriculture, stated:',
  },
  {
    type: 'quote',
    text: "Today's launch is for the people of Rwanda. It is about ensuring that our farmers have access to better, safer, and more resilient crops, and that our families can rely on food that is sufficient, nutritious, and affordable. By strengthening national capacity in agricultural biotechnology, this initiative places science in the service of the public good — supporting livelihoods, protecting the environment, and building a more food-secure future for Rwanda.",
    source: 'Dr. Solange Uwituze, Minister of State for Agriculture — Rwanda BioCap Launch',
  },
  {
    type: 'image',
    src: '/image/IMG_150.jpg',
    caption: "Communication and Research Development Partners of RAB posing for a group photo at the Rwanda BioCap Project Launch Event.",
  },
  { type: 'h2', text: 'Investing in World-Class Agricultural Technologies' },
  {
    type: 'p',
    text: "Agriculture remains the backbone of Rwanda's economy and a cornerstone of national development. Investing in modern agricultural science is therefore an investment in food security, economic resilience, and future prosperity.",
  },
  {
    type: 'p',
    text: "Rwanda is deliberately positioning its farmers and scientists to benefit from some of the world's most advanced crop improvement technologies. From molecular breeding and genomics to bioinformatics and genome editing, the BioCap Project is building national capacity to ensure that these technologies are developed locally and applied responsibly to Rwanda's priority food security crops.",
  },
  {
    type: 'p',
    text: "This forward-looking approach reflects Rwanda's broader national development philosophy: embracing innovation that has been rigorously tested, scientifically validated, and shown to deliver tangible benefits for society.",
  },
  { type: 'h2', text: 'A Young Nation Ready to Innovate' },
  {
    type: 'p',
    text: "Rwanda's greatest resource is its people.",
  },
  {
    type: 'p',
    text: 'According to the **National Institute of Statistics of Rwanda (NISR)**, people aged **16–30 years account for approximately 27% of the population**, while the broader **14–35-year age group represents about 39%** of the national population under the previous national youth definition.',
  },
  {
    type: 'p',
    text: 'This youthful demographic presents a tremendous opportunity to build the next generation of African scientists, innovators, entrepreneurs, and technology-driven farmers.',
  },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project contributes directly to this vision by investing in advanced scientific training, postgraduate research, biotechnology infrastructure, and innovation leadership, ensuring that young Rwandans are equipped to drive the country\'s future agricultural transformation.',
  },
  { type: 'h2', text: 'Smarter Regulation Through Data Transportability' },
  {
    type: 'p',
    text: "One of Rwanda's most progressive regulatory approaches is the use of **data transportability**.",
  },
  {
    type: 'p',
    text: 'This internationally recognized regulatory principle allows scientifically relevant data generated from rigorous field evaluations and risk assessments conducted in comparable environments to inform national regulatory decisions, where appropriate. Rather than duplicating studies that have already demonstrated robust scientific evidence, regulators can evaluate existing high-quality data alongside local environmental and agronomic considerations.',
  },
  {
    type: 'p',
    text: 'This approach helps regulators focus resources on country-specific assessments while avoiding unnecessary repetition of scientifically validated work.',
  },
  {
    type: 'p',
    text: 'For biotechnology products that have already undergone extensive safety evaluations in neighboring or regional countries with comparable agro-ecological conditions, data transportability enables Rwanda to make timely, science-based regulatory decisions without compromising safety, transparency, or regulatory independence.',
  },
  {
    type: 'emphasis',
    text: 'Not reinventing the wheel when credible scientific evidence already exists.',
  },
  {
    type: 'image',
    src: '/image/reguratory-body.jpg',
    caption: "CIP, IITA, and RAB Partners during a Lab Touring Activity.",
  },
  {
    type: 'p',
    text: 'It is a practical example of smart regulation, one that maintains rigorous national oversight consistent with international biosafety standards.',
  },
  { type: 'h2', text: 'Responsible Regulation Builds Innovation' },
  {
    type: 'p',
    text: 'Effective regulation should never be viewed as a barrier to innovation. Instead, it creates the confidence needed for innovation to flourish.',
  },
  {
    type: 'p',
    text: 'By providing clear regulatory pathways, predictable decision-making, and transparent biosafety assessment procedures, Rwanda gives researchers the certainty to innovate, investors the confidence to support scientific development, and farmers the opportunity to access technologies capable of improving productivity, resilience, and livelihoods.',
  },
  {
    type: 'p',
    text: 'For innovations such as genome-edited banana, cassava, and potato varieties developed under the Rwanda BioCap Project, this regulatory clarity will be essential in translating laboratory discoveries into practical agricultural solutions.',
  },
  { type: 'h2', text: 'A Model for Africa' },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project demonstrates that scientific excellence and responsible governance go hand in hand.',
  },
  {
    type: 'p',
    text: 'By combining evidence-based policymaking, strong biosafety institutions, regional collaboration, and investment in world-class biotechnology research, Rwanda is building a regulatory system that protects people and the environment while accelerating access to safe, effective, and farmer-centered agricultural innovations.',
  },
  {
    type: 'p',
    text: "As climate change, emerging crop diseases, and growing food demand continue to challenge African agriculture, Rwanda's approach offers a replicable model for the continent: one where policy is guided by science, innovation is supported by trust, and farmers gain access to the best technologies the world has to offer.",
  },
  {
    type: 'quote',
    text: 'Through regulatory advocacy, Rwanda is not simply regulating biotechnology; it is creating an enabling environment where scientific innovation can responsibly deliver better harvests, stronger rural livelihoods, and lasting food security for future generations.',
  },
];

interface ExtendedProject extends Project {
  author?: string;
  fullDate?: string;
}

export default function RegulatoryAdvocacyArticle({
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
        .reg-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .reg-serif { font-family: 'DM Serif Display', Georgia, serif; }
        .reg-share-btn {
          width: 40px; height: 40px;
          border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .reg-share-btn:hover {
          background: #E8185A;
          color: #ffffff;
          transform: translateY(-2px);
        }
        .reg-side-card {
          background: #ffffff;
          border: 1px solid #e2e8f3;
          border-radius: 16px;
          padding: 1.5rem;
        }
        .reg-side-label {
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
        .reg-story-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid #eef1f6;
          text-align: left;
          width: 100%;
        }
        .reg-story-row:last-child { border-bottom: none; padding-bottom: 0; }
        .reg-story-row:first-child { padding-top: 0; }
        .reg-story-thumb {
          width: 56px; height: 56px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f1f5f9;
        }
        .reg-story-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .reg-story-row:hover .reg-story-thumb img { transform: scale(1.08); }
        .reg-story-title {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
          color: #1B3A5C;
          transition: color 0.2s;
        }
        .reg-story-row:hover .reg-story-title { color: #E8185A; }
      `}</style>

      <div className="reg-page">
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

            <h1 className="reg-serif text-3xl lg:text-5xl text-white leading-tight italic mb-6">
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
                      <h2 key={i} className="reg-serif text-2xl lg:text-3xl text-[#1B3A5C] mt-12 mb-5">
                        {block.text}
                      </h2>
                    );
                  case 'quote':
                    return (
                      <blockquote key={i} className="my-10 pl-6 border-l-[3px] border-[#E8185A]">
                        <p className="reg-serif italic text-2xl lg:text-3xl text-[#1B3A5C] leading-snug">
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
                        className="reg-serif italic text-xl lg:text-2xl text-[#E8185A] text-left my-10"
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
                ← Back to Stewardship News
              </button>

              <div className="flex items-center gap-3 mt-10 pt-8 border-t border-slate-100">
                <span className="text-xs uppercase tracking-widest text-slate-400 mr-2">Share</span>
                {shareIcons.map(({ Icon, label }, i) => (
                  <button key={i} aria-label={label} className="reg-share-btn">
                    <Icon size={16} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-6 flex flex-col gap-5">
              {(displayDate || project.modal?.organizer || project.modal?.partners) && (
                <div className="reg-side-card">
                  <div className="reg-side-label">
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
                <div className="reg-side-card">
                  <div className="reg-side-label">
                    <ArrowUpRight size={14} /> More Stories
                  </div>
                  <div>
                    {relatedStories.map((story, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectProject?.(story)}
                        className="reg-story-row"
                      >
                        <div className="reg-story-thumb">
                          <img src={story.img} alt={story.title} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#E8185A] mb-1">
                            {story.tag}
                          </p>
                          <p className="reg-story-title">{story.title}</p>
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