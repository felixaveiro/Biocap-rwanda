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

type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string; source?: string }
  | { type: 'emphasis'; text: string }
  | { type: 'image'; src: string; caption: string };

const ARTICLE_TITLE =
  'Communication & Social Engagement: Building Public Trust in Biotechnology Through Science, Stories, and Community Voices';

const INITIAL_BLOCKS: Block[] = [
  {
    type: 'quote',
    text: 'Scientific breakthroughs alone do not transform agriculture — people do.',
  },
  {
    type: 'p',
    text: "No matter how innovative a new crop variety may be, its impact depends on whether farmers understand it, consumers trust it, policymakers support it, and communities feel included in the conversation. In today's digital world, where information travels faster than ever, misinformation can spread just as quickly as scientific evidence. This makes communication an essential pillar of agricultural innovation.",
  },
  {
    type: 'p',
    text: "Recognizing this reality, the **Rwanda BioCap Project** places **Communication & Social Engagement** at the heart of its mission to advance responsible crop biotechnology. Alongside research, biosafety, and farmer-centered innovation, BioCap is investing in strategic science communication to ensure that biotechnology is understood through facts, transparency, and meaningful public dialogue.",
  },
  { type: 'h2', text: 'From One-Way Communication to Public Engagement' },
  {
    type: 'p',
    text: 'Modern science communication is no longer about simply telling people what scientists know. It is about creating opportunities for dialogue, listening to community concerns, addressing questions with evidence, and building lasting public trust.',
  },
  {
    type: 'p',
    text: 'Biotechnology often raises genuine questions from farmers and consumers about food safety, environmental protection, and the future of agriculture. These questions deserve clear, accurate, and accessible answers grounded in science rather than speculation.',
  },
  {
    type: 'p',
    text: 'Through BioCap, communication is viewed as a continuous process of engagement that connects researchers, regulators, farmers, journalists, educators, policymakers, and the public throughout the innovation journey—from laboratory research to field evaluation and eventual deployment.',
  },
  {
    type: 'image',
    src: '/image/communication-image.jpg',
    caption: 'Dr. Eric Magembe presenting during the Rwanda BioCap Project Launch',
  },
  { type: 'h2', text: 'Combating Misinformation in the Digital Age' },
  {
    type: 'p',
    text: 'Social media has transformed how people access information. Platforms such as Facebook, X, Instagram, TikTok, WhatsApp, and YouTube have become powerful channels for sharing agricultural knowledge. However, they have also become major sources of misinformation, where myths and unverified claims about biotechnology can spread widely within hours.',
  },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project recognizes that responding to misinformation requires more than correcting false claims. It requires consistently providing credible, engaging, and fact-checked information that people can easily understand and confidently share.',
  },
  {
    type: 'p',
    text: "Working through the **Alliance for Science Rwanda (AfS-Rwanda)** and in collaboration with partners including the **Rwanda Agriculture Board (RAB)**, the **Open Forum on Agricultural Biotechnology (OFAB)**, the **Rwanda Media Commission (RMC)**, and regional organizations, BioCap is strengthening science communication capacity among journalists, digital communicators, researchers, and agricultural professionals.",
  },
  {
    type: 'p',
    text: 'This approach helps ensure that conversations about biotechnology are driven by evidence, transparency, and public interest.',
  },
  { type: 'h2', text: 'Empowering Digital Voices for Science' },
  {
    type: 'p',
    text: "Today's audiences increasingly receive information from trusted online personalities rather than traditional institutions. Recognizing this shift, the Rwanda BioCap Project is embracing a new generation of science communicators.",
  },
  {
    type: 'image',
    src: '/image/afs-communication-image.jpg',
    caption: 'Rwanda BioCap Project engaging social media influencers on communicating biotechnology to the public',
  },
  {
    type: 'p',
    text: 'Social media influencers, agripreneurs, youth innovators, farmers, educators, and digital content creators are becoming powerful ambassadors for agricultural innovation. When equipped with accurate scientific knowledge, these trusted voices can translate complex biotechnology concepts into relatable stories that resonate with diverse audiences.',
  },
  {
    type: 'p',
    text: 'Through capacity building, content development, and partnerships, BioCap is supporting these communicators in sharing compelling stories that inspire informed conversations and promote responsible technology adoption.',
  },
  { type: 'h2', text: 'Leaving No Farmer Behind' },
  {
    type: 'p',
    text: 'While digital communication continues to expand, many farming communities in Rwanda still rely on traditional media as their primary source of information.',
  },
  {
    type: 'p',
    text: "Across rural Rwanda, **radio remains the most trusted and accessible communication platform**, reaching households where internet connectivity and smartphone access remain limited.",
  },
  {
    type: 'p',
    text: 'To ensure inclusive communication, BioCap combines digital innovation with traditional media outreach, using community radio, interactive talk shows, expert interviews, and local-language programming to reach farmers wherever they are.',
  },
  { 
    type: 'quote',
    text: 'This integrated communication strategy ensures that no community is excluded from the biotechnology conversation.',
    source: 'AFS-RWANDA Communication Team', 
  },
  {
    type: 'image',
    src: '/image/IMG_149.jpg',
    caption: 'The Rwanda BioCap Project officially launches, bringing together researchers, regulators, and partners',
  },
  { type: 'h2', text: 'Learning Through Entertainment' },
  {
    type: 'p',
    text: "One of the most innovative approaches emerging from the Rwanda BioCap Project is the use of **edutainment**—combining education with entertainment to encourage behavioral change.",
  },
  {
    type: 'p',
    text: "Working through **AfS-Rwanda**, the project is exploring the development of **radio and drama series** that weave biotechnology into engaging stories reflecting everyday farming realities.",
  },
  {
    type: 'p',
    text: 'Instead of relying solely on technical lectures, these dramas follow relatable characters as they face common agricultural challenges such as crop diseases, climate change, declining yields, and food insecurity. Through storytelling, listeners experience how scientific innovation, informed decision-making, and trusted agricultural advice can improve livelihoods.',
  },
  {
    type: 'p',
    text: 'This approach recognizes that people often remember stories more than facts alone. Entertainment therefore becomes a powerful vehicle for learning, discussion, and confidence in new technologies.',
  },
  { type: 'h2', text: 'Communication that Builds Confidence' },
  {
    type: 'p',
    text: 'The Rwanda BioCap Project views communication not as a promotional activity, but as an integral component of responsible innovation.',
  },
  {
    type: 'p',
    text: 'By combining scientific evidence with trusted media, digital engagement, social influencers, farmer champions, community radio, and culturally relevant storytelling, BioCap is fostering an informed public capable of making evidence-based decisions about agricultural biotechnology.',
  },
  {
    type: 'p',
    text: 'This people-centered approach strengthens transparency, encourages dialogue, counters misinformation, and supports the responsible adoption of innovations that improve food security, farmer livelihoods, and climate resilience.',
  },
  {
    type: 'quote',
    text: 'The future of biotechnology will be shaped not only by scientific discoveries but also by how effectively science is communicated, understood and embraced by society.',
    source: 'Rwanda BioCap Project — Communication & Social Engagement',
  },
];

interface ExtendedProject extends Project {
  author?: string;
  fullDate?: string;
}

export default function CommunicationSocialEngagementArticle({
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
              <MessageCircle size={22} className="text-white" strokeWidth={1.75} />
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
                ← Back to Stewardship News
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