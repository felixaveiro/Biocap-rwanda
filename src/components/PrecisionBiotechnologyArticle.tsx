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
  'Precision Biotechnology: Advancing the Next Generation of Climate-Resilient Crops for Rwanda';

const INITIAL_BLOCKS: Block[] = [
  {
    type: 'p',
    text: 'For centuries, crop improvement has relied on selecting plants with desirable traits and crossing them over many generations. While conventional breeding has transformed global agriculture, it often transfers both desirable and undesirable genes together, requiring many years of repeated breeding before improved varieties are ready for farmers.',
  },
  {
    type: 'p',
    text: 'Today, Rwanda is embracing a new era of agricultural innovation through precision biotechnology, a science-based approach that enables researchers to improve crops with remarkable precision while preserving the qualities that farmers cultivate and consumers prefer.',
  },
  {
    type: 'p',
    text: "Through the **Rwanda BioCap Project**, Rwanda is establishing one of Africa's emerging hubs for **gene editing and modern crop biotechnology** at **RAB's** Centre of Excellence in Crop Biotechnology, positioning the country among the first on the continent to build national capacity in precision breeding for Africa's food security crops. By investing in advanced laboratories, scientific expertise and responsible regulatory systems, BioCap is creating an innovation ecosystem where African scientists develop African solutions for African agriculture.",
  },
  { type: 'h2', text: 'What is Precision Biotechnology?' },
  {
    type: 'p',
    text: "Precision Biotechnology combines modern genomic tools that allow scientists to make highly targeted improvements within a plant's own DNA. Unlike conventional breeding, which reshuffles thousands of genes simultaneously, precision breeding modifies only the specific gene associated with an important agricultural trait while leaving the rest of the plant's genetic makeup unchanged.",
  },
  {
    type: 'p',
    text: 'The most transformative of these technologies is **CRISPR genome editing**, first demonstrated as a programmable gene-editing tool in **2012** by **Dr. Emmanuelle Charpentier** and **Dr. Jennifer A. Doudna**, who received the **2020 Nobel Prize in Chemistry** for their pioneering work. Their discovery revolutionized biological sciences by providing researchers with an accurate, efficient and versatile method for editing DNA.',
  },
  {
    type: 'quote',
    text: 'The ability to rewrite the code of life has immense potential for improving human health, agriculture and the environment.',
    source: 'Jennifer Doudna, 2020 Nobel Prize-winning biochemist',
  },
  {
    type: 'p',
    text: 'Often described as **molecular genetic scissors**, CRISPR enables scientists to precisely edit naturally occurring genes responsible for important traits such as disease resistance, climate resilience, improved nutrition and yield potential—changes that could also occur naturally or through conventional breeding, but with far greater precision and speed.',
  },
  {
    type: 'p',
    text: 'This precision makes genome editing one of the most promising technologies for climate-smart agriculture. Rather than replacing successful varieties, precision biotechnology improves them by preserving the traits farmers and consumers already value, including preferred taste and cooking quality, yield potential, fruit texture and appearance, market acceptance, local adaptation, and cultural and culinary value.',
  },
  {
    type: 'image',
    src: '/image/DSC06556(1).jpg',
    caption: "Prof. Karim of MSU, and Dr. Eric of CIP posing for group picture with RAB Plant Pathology Team.",
  },
  { type: 'h2', text: 'Why Banana Matters to Rwanda ?' },
  {
    type: 'p',
    text: 'Banana is far more than a crop in Rwanda; it is a pillar of food security, nutrition, rural livelihoods and cultural heritage.',
  },
  {
    type: 'p',
    text: "According to the **National Institute of Statistics of Rwanda (NISR)**, banana occupies approximately **258,500 hectares**, making it one of the country's largest perennial cropping systems, with annual production exceeding **1.14 million metric tonnes**. It remains one of Rwanda's most widely cultivated staple and cash crops, supporting millions of people through food, household income and value-added industries including juice, wine, beer and processed products.",
  },
  {
    type: 'p',
    text: "Yet banana production in Rwanda is already under severe pressure from devastating diseases, particularly **Banana Xanthomonas Wilt (BXW)** and **Fusarium Wilt Tropical Race 4 (TR4)**, alongside climate change and other production constraints. These diseases are not distant or theoretical risks; they have already reduced the production potential of important local banana varieties, weakened farmer incomes and affected cooperative revenues over many years. For dessert bananas such as **Kamaramasenge (Kamara)**, also known as **Sukari Ndizi**, disease pressure has undermined a variety that farmers rely on for income and consumers value for its sweetness, aroma and market appeal. This makes Rwanda's investment in gene editing a response to an existing and urgent agricultural challenge, not simply preparation for a future threat.",
  },
  {
    type: 'p',
    text: 'Because bananas are propagated vegetatively rather than through seeds, conventional breeding is exceptionally slow and technically challenging. This makes investment in precision biotechnology an important pathway for reviving local crop varieties while preserving their distinctive traits and market value.',
  },
  { type: 'h2', text: 'Preserving What Farmers Prefer While Solving What They Do Not' },
  {
    type: 'p',
    text: 'One of the greatest advantages of genome editing is its ability to improve a single characteristic without altering the identity of a farmer-preferred variety.',
  },
  {
    type: 'p',
    text: "Good examples include **Ijangi**, a consumer-loved and farmer-preferred green cooking banana used in Rwandan cuisine for dishes such as roasted banana, matoke, boiled or pounded banana dishes and chips, and **Kamaramasenge (Kamara)**, known regionally as **Sukari Ndizi**, one of Rwanda's most popular dessert bananas because of its distinctive sweetness, aroma, texture and consumer appeal.",
  },
  {
    type: 'p',
    text: "For highland cooking bananas such as **Ijangi**, **BXW** is one of the most urgent disease threats because it can rapidly destroy mats and spread through contaminated tools, infected planting material and insect-mediated transmission. For sweet bananas such as **Kamaramasenge (Kamara/Sukari Ndizi)**, disease pressure has already translated into lost production potential, reduced fruit availability, lower farmer earnings and weaker cooperative income. This is why RAB's work through the **Rwanda BioCap Project** on banana is best understood as a practical response to a problem farmers are already living with. Although conventional breeding has produced bananas with improved disease resistance, these varieties often inherit additional genes from different parental lines, leading to changes in fruit taste, texture, colour, bunch architecture or appearance that reduce consumer acceptance.",
  },
  { type: 'emphasis', text: 'Genome editing changes this paradigm.' },
  {
    type: 'image',
    src: '/image/visit-biotech-laboratory.jpg',
    caption: "Dr. Eric of CIP and Dr. Nigel of DDPSC discussing as the BioCap Project partners reviewed RAB's Laboratory Equipment Capacity",
  },
  {
    type: 'p',
    text: "Instead of asking farmers and consumers to abandon Kamaramasenge for a genetically different substitute, Rwanda BioCap's precision breeding approach aims to restore and protect the existing variety itself by introducing resistance to major diseases while preserving the qualities that made it valuable in the first place: its sweetness, flavour, texture, appearance, market preference and adaptation to Rwanda's highland agro-ecological zones. In this sense, gene editing is not an abstract scientific ambition; it is a targeted national tool for recovering lost productivity, protecting cooperative income and keeping Rwanda's preferred banana varieties in farmers' fields and consumers' markets.",
  },
  {
    type: 'quote',
    text: 'In other words, the variety remains Kamaramasenge — only stronger, more resilient and better protected against disease.',
  },
  {
    type: 'p',
    text: "In conclusion, the **Rwanda BioCap Project** is placing genome editing firmly within Rwanda's precision agriculture toolkit by building both the human capacity and infrastructure needed to move innovations from laboratories to farmers' fields. Through advanced laboratories, genomics, bioinformatics, CRISPR genome editing, greenhouse evaluation, biosafety assessment, variety registration and farmer deployment, the project is creating a complete national pathway for developing improved crops that respond to real production challenges. These capabilities will be anchored at **RAB Rubona's Centre of Excellence in Crop Biotechnology**, where Rwandan scientists will generate practical solutions for banana, cassava, potato and other priority crops while preserving the varieties, markets and food traditions that farmers and consumers already value.",
  },
];

interface ExtendedProject extends Project {
  author?: string;
  fullDate?: string;
}

export default function PrecisionBiotechnologyArticle({
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

            <h1 className="pba-serif text-3xl lg:text-5xl text-white leading-tight italic mb-6">
              {ARTICLE_TITLE}
            </h1>

            {/* ── BYLINE METADATA ROW WITH FULL DD/MM/YYYY FORMAT ── */}
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