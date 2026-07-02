'use client';

import React, { useState } from 'react';
import Footer from '@/components/Footer';
import {
  FileText,
  Download,
  Link2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Quote,
  Calendar,
  MapPin,
  Users,
  Share2,
  Clock,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────

interface Resource {
  name: string;
  type: 'PDF' | 'DOCX' | 'Slides';
  size: string;
  url?: string;
}

interface ExternalLink {
  label: string;
  url: string;
}

interface NewsItem {
  id: number;
  day: string;
  month: string;
  year: string;
  category: string;
  author: string;
  location: string;
  title: string;
  excerpt: string;
  image: string;
  accent: string;
  accentBg: string;
  intro: string;
  body: string;
  highlights: string[];
  resources: Resource[];
  links: ExternalLink[];
  quote?: { text: string; name: string; role: string };
}

// ─── Content ────────────────────────────────────────────────────────
// Note: article body copy, resources, and links below are placeholder
// content structured to show the design — swap in your real write-ups,
// files, and URLs before publishing.

const newsItems: NewsItem[] = [
  {
  id: 1,
  day: '06',
  month: 'May',
  year: '2026',
  category: 'Science',
  author: 'UR-CST Biology Dept',
  location: 'UR College of Science and Technology, Nyarugenge Campus',
  title: 'DNA Week 2026: Opening Session and Welcome Remarks',
  excerpt:
    'The third annual DNA Week opened with remarks describing DNA as the foundation of life itself, and a call for students to connect classroom science to real national challenges.',
  image: '/image/dna-week-2026.jpg',
  accent: '#1B3A5C',
  accentBg: '#e2edf4',
  intro:
    'DNA Week 2026 opened with remarks delivered on behalf of the Principal of the College of Science and Technology, welcoming participants, guest speakers, students, and partners to the third DNA Week celebration at UR-CST.',
  body:
    'DNA was described as one of the most remarkable discoveries in science and the foundation of life itself, important not only for understanding biology but also for innovation, medicine, agriculture, conservation, and research. The remarks highlighted the connection between mathematics, genetics, bioinformatics, and biotechnology, citing statistical modelling, population genetics, and graph theory as tools that support DNA analysis. Students were encouraged to stay curious and engage actively, and were reminded that biotechnology should not remain confined to laboratories and classrooms but should contribute directly to solving national challenges.',
  highlights: [
    'Framed DNA as the foundation of biology, medicine, agriculture, conservation, and research',
    'Connected mathematics — statistical modelling, population genetics, graph theory — to modern DNA analysis',
    "Encouraged active student participation throughout the week's sessions",
    'Set the tone that biotechnology must contribute directly to national challenges, not stay confined to labs',
  ],
  resources: [
    { 
       name: 'DNA Week 2026 Event Report',
        type: 'PDF',
        size: '2.1 MB',
        url: 'documents/DNA-DAY-2026-EVENT-REPORT.pdf',
      },
  ],
  links: [
    { label: 'UR College of Science and Technology', url: 'https://cst.ur.ac.rw' },
  ],
  quote: {
    text: 'Science becomes meaningful when knowledge is connected to solving real-life problems.',
    name: 'Opening Remarks',
    role: 'On behalf of the Principal, UR-CST',
  },
},
{
    id: 2,
    day: '5-6',
    month: 'Mar',
    year: '2026',
    category: 'Communication & Advocacy',
    author: 'AfS-Rwanda',
    location: 'Hotel des Mille Collines, Kigali',
    title: 'BioCap Communication Induction & Stakeholder Consultation Workshop',
    excerpt:
      'A two-day workshop brought RAB, CIP, and international BioCap partners together to align on the 2026 work plan and co-develop Rwanda\'s Crop Biotechnology Communication Strategy.',
    image: '/image/Communication-Induction.jpg',
    accent: '#E8185A',
    accentBg: '#fde8ef',
    intro:
      'On 5–6 March 2026, AfS-Rwanda convened a Communication Induction and Stakeholder Consultation Workshop at Hotel des Mille Collines, Kigali, bringing together RAB, CIP, and international BioCap partners — alongside third-party collaborators Radio La Benevolencija and the Rwanda Media Commission — to shape the year\'s communication agenda for potato, cassava, and banana biotechnology.',
    body:
      'Day one focused on internal alignment: CIP\'s Dr. Eric Magembe presented the BioCap Project\'s concept, work plan, and how communication activities feed into Results 2.4 and 2.5, followed by sessions on social media strategy and the proposed 2025–2029 Communication Strategy framework. Day two shifted to stakeholder consultation, opening with case studies on behaviour-change communication — including Radio La Benevolencija\'s Musekeweya drama series and a Rwanda Media Commission session on fact-based science journalism — before international partners MSU and IITA joined virtually to shape messaging direction. The workshop closed with breakout sessions drafting a crop-specific communication action plan and profiling four RAB scientists preparing for the Michigan State University program.',
    highlights: [
      'Aligned RAB, CIP, and international BioCap partners on 2026 communication priorities, deliverables, and milestones',
      'Defined crop-specific communication objectives for potato, cassava, and banana, including priority audiences and messaging pillars',
      'Reviewed behaviour-change case studies: the Musekeweya radio drama series and fact-based journalism training with the Rwanda Media Commission',
      'Profiled four RAB scientists — Venuste Ndagijimana, Dr. Constantin Dushimimana, Dr. Bancy Waweru, and Anastasie Musabyemungu — ahead of the Michigan State University program',
      'Drafted the foundations of the 2026 Crop Biotechnology Communication Strategy and Action Plan',
    ],
    resources: [
      {
        name: 'BioCap Comms Induction & Stakeholder Workshop Report',
        type: 'PDF',
        size: '1.4 MB',
        url: 'documents/2nd-Day-BioCap-project-Comms-Induction-Workshop-Report.pdf',
      },
    ],
    links: [
      { label: 'Alliance for Science Rwanda', url: 'https://www.afs-rwanda.org/' },
    ],
    quote: {
      text: 'African crops, improved by African scientists, for Africans and smallholder farmers.',
      name: 'International Partner Session',
      role: 'BioCap Communication Induction Workshop, 6 March 2026',
    },
  },
  {
  id: 3,
  day: '16-17',
  month: 'Jun',
  year: '2026',
  category: 'Risk & Regulatory Communication',
  author: 'RAB & AATF',
  location: 'Park Inn, Kigali',
  title: 'The Role of Risk in the Approval Framework and Communication of Biotech Crops',
  excerpt:
    'A two-day Rwanda AgriBiotech Programme workshop brought regulators, scientists, and communicators together to align risk assessment, product stewardship, and public communication ahead of cassava, potato, and maize registration.',
  image: '/image/Risk-ssessment.jpg',
  accent: '#1B3A5C',
  accentBg: '#e2edf4',
  intro:
    'On 16–17 June 2026, the Rwanda AgriBiotech Programme convened a hybrid workshop in Kigali on the role of risk in the approval framework and communication of biotech crops. Dr Florence Uwamahoro, Acting Director General of RAB, opened the workshop noting that cassava, potato, and maize products are approaching important registration and deployment milestones, making it necessary to prepare both regulatory and communication systems in parallel.',
  body:
    'Day one built a shared technical foundation: Rob introduced risk analysis as a three-part process of assessment, management, and communication, stressing that safety should be communicated comparatively rather than as an absolute claim. Athanase presented Rwanda\'s biotech pipeline for cassava, potato, and maize, followed by Rob\'s session on the data package — molecular characterization, protein safety, and confined field trials — that REMA reviewed in finding no new or increased risk from these products. Francis and Immaculate then covered stewardship, framing regulatory approval as "getting a driver\'s licence" and stewardship as "responsible driving" afterward, before Athanase closed the day with variety registration requirements. An afternoon breakout had participants work through an actual biosafety application form to understand what evidence supports each section. Day two shifted to communication: Nancy Muchiri reframed biotech communication as building trust and relevance rather than just delivering facts, a communication protocol session established RAB as the lead voice on regulatory milestones, and George and Pacifique walked through FAQ booklets, core messages, and a social-media and radio strategy for reaching farmers and rural audiences. The day closed with active-listening and role-play exercises where participants practiced explaining biotech products to non-technical audiences.',
  highlights: [
    'Risk analysis framed as assessment, management, and communication — safety judged comparatively, not as an absolute claim',
    'REMA reviewed molecular, protein-safety, and field-trial data and found no new or increased risk for cassava, potato, and maize products',
    'Stewardship plans covered seed traceability, refuge requirements for maize, and post-release monitoring through case-specific and general surveillance',
    'Communication protocol established RAB as the lead voice on regulatory milestones, with partners supporting coordinated messaging',
    'Practical toolkit shared: FAQ booklets in English and Kinyarwanda, core messages, and a social media/radio strategy for rural audiences',
    'Active listening and role-play exercises trained participants to translate technical evidence into plain-language conversations',
  ],
  resources: [
    {
      name: 'Risk in the Approval Framework & Communication of Biotech Crops — Workshop Report',
      type: 'PDF',
      size: '1.4 MB',
      url: '/documents/Biotech-Crops-Communication-Workshop-Report-01.pdf',
    },
  ],
  links: [
    { label: 'AATF — African Agricultural Technology Foundation', url: 'https://www.aatf-africa.org' },
  ],
  quote: {
    text: 'Regulatory approval confirms that basic safety requirements have been met, while stewardship ensures responsible and sustainable use throughout the product\'s life cycle.',
    name: 'Francis',
    role: 'Risk Management & Stewardship Session, Day 1',
  },
},
];

// ─── Shared type/style block ────────────────────────────────────────

function SharedStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      .nw-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
      .nw-serif { font-family: 'DM Serif Display', Georgia, serif; }
      .nw-card {
        transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s, border-color 0.28s;
        position: relative;
        overflow: hidden;
      }
      .nw-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 3px;
        background: linear-gradient(90deg, #1B3A5C, #E8185A);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        z-index: 10;
      }
      .nw-card:hover { transform: translateY(-6px); box-shadow: 0 16px 44px rgba(27,58,92,0.14); border-color: transparent; }
      .nw-card:hover::before { transform: scaleX(1); }
    `}</style>
  );
}

// ─── List Card ──────────────────────────────────────────────────────

function NewsCard({ item, onOpen }: { item: NewsItem; onOpen: () => void }) {
  return (
    <div
      className="nw-card bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div
          className="absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase"
          style={{ background: 'rgba(255,255,255,0.9)', color: item.accent }}
        >
          {item.category}
        </div>
        <div
          className="absolute bottom-4 right-4 text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white"
          style={{ background: item.accent }}
        >
          <span className="text-[10px] font-bold leading-none uppercase">{item.month}</span>
          <span className="text-lg font-black leading-none">{item.day}</span>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: item.accent }}>
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px]" style={{ background: item.accentBg }}>
            <Users size={11} />
          </span>
          {item.author}
        </div>
        <h3 className="nw-serif text-xl text-[#1B3A5C] mb-3 leading-tight">{item.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-5 text-justify flex-1">{item.excerpt}</p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <FileText size={13} /> {item.resources.length} resource{item.resources.length !== 1 ? 's' : ''}
          </span>
          <button
            className="font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 hover:gap-2.5 transition-all"
            style={{ color: item.accent }}
          >
            Read More <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail View ────────────────────────────────────────────────────

function NewsDetail({
  item,
  related,
  onBack,
  onOpen,
}: {
  item: NewsItem;
  related: NewsItem[];
  onBack: () => void;
  onOpen: (id: number) => void;
}) {
  return (
    <div className="bg-white min-h-screen font-sans">
      <SharedStyles />
      <div className="nw-page">
        {/* ── Detail hero ── */}
        <section className="relative overflow-hidden min-h-[420px] flex items-end px-6 lg:px-12">
          <div className="absolute inset-0 z-0">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A5C] via-[#1B3A5C]/80 to-[#1B3A5C]/30" />
          </div>

          <div className="relative z-20 max-w-4xl pb-12 pt-24 w-full">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Resource Information
            </button>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="text-[10px] font-black uppercase px-3 py-1 rounded-full"
                style={{ background: item.accent, color: '#fff' }}
              >
                {item.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/70 text-xs">
                <Calendar size={13} /> {item.day} {item.month} {item.year}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/70 text-xs">
                <MapPin size={13} /> {item.location}
              </span>
            </div>
            <h1 className="nw-serif text-4xl lg:text-6xl text-white leading-tight italic drop-shadow-lg max-w-3xl">
              {item.title}
            </h1>
          </div>

          <div className="absolute bottom-[-1px] left-0 w-full z-30 leading-[0]">
            <svg className="relative block w-full h-[40px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z"
                fill="#f7f6f4"
              />
            </svg>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="bg-[#f7f6f4] px-6 lg:px-12 py-14">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_340px] gap-10 items-start">
            {/* Main column */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 lg:p-10">
                <p className="text-lg text-slate-600 leading-relaxed text-justify mb-5 font-medium">
                  {item.intro}
                </p>
                <p className="text-slate-500 leading-relaxed text-justify">
                  {item.body}
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 lg:p-10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-5" style={{ color: item.accent }}>
                  <div className="w-6 h-[2px]" style={{ background: item.accent }} /> Key Highlights
                </div>
                <ul className="space-y-3">
                  {item.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                      <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: item.accent }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {item.quote && (
                <div className="rounded-3xl p-8 lg:p-10 relative" style={{ background: '#1B3A5C' }}>
                  <Quote className="w-8 h-8 mb-4" style={{ color: item.accent, opacity: 0.6 }} />
                  <p className="nw-serif italic text-white text-xl lg:text-2xl leading-relaxed mb-6 text-justify">
                    &ldquo;{item.quote.text}&rdquo;
                  </p>
                  <div className="text-sm font-bold text-white">{item.quote.name}</div>
                  <div className="text-xs text-white/60">{item.quote.role}</div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-6">
              {/* Resources */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#1B3A5C] mb-4 flex items-center gap-2">
                  <FileText size={14} /> Resources
                </p>
                <div className="space-y-3">
                  {item.resources.map((r) => (
                    <div
                      key={r.name}
                      className="flex items-center justify-between gap-3 bg-[#f7f6f4] rounded-xl px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[0.8rem] font-semibold text-[#1B3A5C] truncate">{r.name}</p>
                        <p className="text-[0.68rem] text-slate-400">{r.type} · {r.size}</p>
                      </div>
                      {r.url ? (
                        <a
                          href={r.url}
                          download
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white transition-transform hover:-translate-y-0.5"
                          style={{ background: item.accent }}
                          aria-label={`Download ${r.name}`}
                        >
                          <Download size={14} />
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white opacity-40 cursor-not-allowed"
                          style={{ background: item.accent }}
                          aria-label={`${r.name} unavailable`}
                          title="File not yet attached"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {item.resources.length === 0 && (
                    <p className="text-xs text-slate-400">No documents attached to this article.</p>
                  )}
                </div>
              </div>

              {/* Links */}
              {item.links.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1B3A5C] mb-4 flex items-center gap-2">
                    <Link2 size={14} /> Related Links
                  </p>
                  <div className="space-y-2">
                    {item.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 text-sm font-semibold text-[#1B3A5C] hover:text-[#E8185A] transition-colors group"
                      >
                        <span className="truncate">{l.label}</span>
                        <ArrowRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#1B3A5C] mb-4">Details</p>
                <div className="space-y-3 text-sm text-slate-500">
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} className="text-slate-400" /> {item.day} {item.month} {item.year}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-slate-400" /> {item.location}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users size={14} className="text-slate-400" /> {item.author}
                  </div>
                </div>
                <button className="w-full mt-5 flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-xs font-bold text-[#1B3A5C] hover:border-[#1B3A5C] transition-colors">
                  <Share2 size={13} /> Share Article
                </button>
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="max-w-6xl mx-auto mt-14">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 text-[#E8185A]">
                <div className="w-6 h-[2px] bg-[#E8185A]" /> More From  Resource Information
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((r) => (
                  <NewsCard key={r.id} item={r} onOpen={() => onOpen(r.id)} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function DNAWeekPage() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const activeItem = newsItems.find((n) => n.id === openId) || null;

  if (activeItem) {
    const related = newsItems.filter((n) => n.id !== activeItem.id).slice(0, 3);
    return (
      <NewsDetail
        item={activeItem}
        related={related}
        onBack={() => setOpenId(null)}
        onOpen={(id) => {
          setOpenId(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(newsItems.length / perPage));
  const pageItems = newsItems.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white min-h-screen font-sans">
      <SharedStyles />
      <div className="nw-page">
        {/* ── HEADER ── */}
        <section className="relative min-h-[420px] flex items-center px-6 lg:px-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="/image/resource-information.jpg" alt="DNA Week Celebration" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent" />
          </div>

          <div className="relative z-20 max-w-4xl py-10">
            <p className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-3 drop-shadow-md">
              Rwanda Agricultural Biotech
            </p>
            <h1 className="nw-serif text-5xl lg:text-7xl text-white leading-tight mb-4 italic drop-shadow-lg">
              Resource Report  <span className="text-[#E8185A]">Information</span>
            </h1>
            <p className="text-white/90 text-lg max-w-xl leading-relaxed font-medium drop-shadow-md">
              Sessions, speakers, and resources from Rwanda's 
              click any article for the full write-up and downloadable materials.
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

        {/* ── NEWS GRID ── */}
        <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageItems.map((item) => (
              <NewsCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-16">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-all ${
                    page === p ? 'bg-[#1B3A5C] text-white' : 'bg-gray-100 text-[#1B3A5C] hover:bg-[#E8185A] hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}