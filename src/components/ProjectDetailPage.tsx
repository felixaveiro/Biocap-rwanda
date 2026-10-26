'use client';

import React from 'react';

// ── Types ───────────────────────────────────────────────────────────
type Session = {
  name: string;
  role: string;
  summary: string;
};

type ProjectModal = {
  date: string;
  organizer: string;
  partners: string;
  intro: string;
  objectives: string[];
  sessions: Session[];
  collaboration: string[];
  quote: string;
  quoteSource: string;
};

export type Project = {
  title: string;
  img: string;
  tag: string;
  excerpt: string;
  modal: ProjectModal;
};

// ── Project Detail Page ─────────────────────────────────────────────
export default function ProjectDetailPage({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const m = project.modal;

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ── HERO ── */}
      <section className="relative h-[420px] flex items-end overflow-hidden">
        <img
          src={project.img}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e2540]/90 via-[#1a3a5c]/55 to-transparent" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-full transition-all duration-200"
        >
          ← Back
        </button>

        {/* Tag */}
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase text-[#e8185e]">
          {project.tag}
        </div>

        {/* Title block */}
        <div className="relative z-10 px-8 pb-10 max-w-4xl">
          {m.date && (
            <p className="text-white/60 text-[10px] uppercase tracking-[4px] font-semibold mb-3">
              {m.date}
            </p>
          )}
          <h1 className="text-4xl md:text-6xl font-serif font-bold italic text-white leading-tight drop-shadow-lg">
            {project.title}
          </h1>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* Organizer / Partners */}
        {(m.organizer || m.partners) && (
          <div className="grid md:grid-cols-2 gap-6 bg-slate-50 rounded-3xl p-8 border border-slate-100">
            {m.organizer && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#e8185e] mb-2">
                  Organized by
                </p>
                <p className="text-[#1a3a5c] font-semibold">{m.organizer}</p>
              </div>
            )}
            {m.partners && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#e8185e] mb-2">
                  Partners
                </p>
                <p className="text-[#1a3a5c] font-semibold">{m.partners}</p>
              </div>
            )}
          </div>
        )}

        {/* Introduction */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-[2px] bg-[#e8185e]" />
            <span className="text-[#e8185e] font-bold uppercase tracking-widest text-[10px]">Overview</span>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">{m.intro}</p>
        </div>

        {/* Objectives */}
        {m.objectives.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-[#e8185e]" />
              <span className="text-[#e8185e] font-bold uppercase tracking-widest text-[10px]">Objectives</span>
            </div>
            <ul className="space-y-4">
              {m.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="mt-2 w-2 h-2 rounded-full bg-[#e8185e] flex-shrink-0" />
                  <p className="text-[#1a3a5c] font-medium leading-relaxed">{o}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sessions / Speakers */}
        {m.sessions.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-[#e8185e]" />
              <span className="text-[#e8185e] font-bold uppercase tracking-widest text-[10px]">Sessions & Speakers</span>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {m.sessions.map((s, i) => (
                <div
                  key={i}
                  className="group border border-slate-100 hover:border-[#e8185e]/20 hover:shadow-md rounded-2xl p-6 transition-all duration-300 bg-white"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#e8185e] mb-2">
                    {s.role}
                  </p>
                  <p className="text-[#1a3a5c] font-bold text-sm mb-3">{s.name}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collaboration */}
        {m.collaboration.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-[#e8185e]" />
              <span className="text-[#e8185e] font-bold uppercase tracking-widest text-[10px]">Collaboration Opportunities</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {m.collaboration.map((c, i) => (
                <span
                  key={i}
                  className="bg-[#1a3a5c] text-white text-xs font-semibold px-4 py-2 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quote */}
        {m.quote && (
          <div className="bg-[#1a3a5c] rounded-3xl p-10 text-center">
            <div className="text-[#e8185e] text-5xl font-serif mb-4">&quot;</div>
            <p className="text-white font-serif italic text-xl md:text-2xl leading-relaxed mb-6">
              {m.quote}
            </p>
            <div className="w-12 h-[1px] bg-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">
              {m.quoteSource}
            </p>
          </div>
        )}

        {/* Back to projects */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#e8185e] font-bold text-xs uppercase tracking-widest hover:gap-4 transition-all duration-200"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
}