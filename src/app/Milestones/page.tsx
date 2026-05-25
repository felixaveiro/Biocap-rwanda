'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Trophy, Wheat, Sprout, Leaf, ArrowRight, Calendar } from 'lucide-react';

/* ─── Data ──────────────────────────────────────────────────────── */

const PHASES = [
  {
    id: 1,
    title: 'Phase 1: Foundation',
    description:
      'Established partnerships, secured funding, and set up research infrastructure. Completed baseline studies and stakeholder mapping across all five target districts.',
    date: '2024-12-31',
    status: 'completed' as const,
    progress: 100,
    highlights: ['15 partnerships formed', '5 districts mapped', 'Lab infrastructure ready'],
  },
  {
    id: 2,
    title: 'Phase 2: Development',
    description:
      'Initiated crop breeding programs, established field trials, and began farmer training programs. Advanced varietal testing under controlled and open-field conditions.',
    date: '2025-12-31',
    status: 'in-progress' as const,
    progress: 65,
    highlights: ['120 farmers trained', '3 field trial sites active', '8 varieties under review'],
  },
  {
    id: 3,
    title: 'Phase 3: Implementation',
    description:
      "Scale up successful varieties, expand training programs, and establish seed production systems to ensure wide adoption across Rwanda's agricultural zones.",
    date: '2026-12-31',
    status: 'planned' as const,
    progress: 0,
    highlights: ['National seed distribution', 'Extension worker network', 'Commercial partnerships'],
  },
  {
    id: 4,
    title: 'Phase 4: Sustainability',
    description:
      'Transfer technology to local institutions, establish long-term monitoring systems, and ensure full project sustainability beyond the programme lifecycle.',
    date: '2027-12-31',
    status: 'planned' as const,
    progress: 0,
    highlights: ['Local ownership transfer', 'Impact measurement framework', 'Policy integration'],
  },
];

const STATS = [
  { value: 15, suffix: '+', label: 'Research Partners' },
  { value: 120, suffix: '+', label: 'Farmers Trained' },
  { value: 3,  suffix: '',   label: 'Crops Approved' },
  { value: 65, suffix: '%',  label: 'Phase 2 Complete' },
];

const CROPS = [
  { Icon: Wheat,  name: 'Maize'   },
  { Icon: Sprout, name: 'Potato'  },
  { Icon: Leaf,   name: 'Cassava' },
];

type Status = 'completed' | 'in-progress' | 'planned';

/* ─── Helpers ────────────────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCounter(target: number, active: boolean, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const raf = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [active, target, duration]);
  return count;
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function StatCard({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCounter(value, active);
  return (
    <div className="ms-stat-card">
      <span className="ms-stat-number">{count}{suffix}</span>
      <span className="ms-stat-label">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    completed:     { label: '✓ Completed',   cls: 'ms-badge--completed' },
    'in-progress': { label: '● In Progress', cls: 'ms-badge--progress'  },
    planned:       { label: '◆ Planned',     cls: 'ms-badge--planned'   },
  };
  const { label, cls } = map[status];
  return <span className={`ms-badge ${cls}`}>{label}</span>;
}

function PhaseCard({ phase, side, index }: { phase: typeof PHASES[0]; side: 'left' | 'right'; index: number }) {
  const { ref, inView } = useInView();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={`ms-phase-card ms-phase-card--${side} ${inView ? 'ms-phase-card--visible' : ''}`}
      style={{ animationDelay: `${index * 0.12}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent line */}
      <div className={`ms-card-accent ${hovered ? 'ms-card-accent--active' : ''}`} />

      {/* Header */}
      <div className="ms-card-header">
        <span className="ms-card-phase-num">Phase {phase.id}</span>
        <StatusBadge status={phase.status} />
      </div>

      <h3 className="ms-card-title">{phase.title.split(': ')[1]}</h3>
      <p className="ms-card-desc">{phase.description}</p>

      {/* Progress */}
      {phase.progress > 0 && (
        <div className="ms-progress-wrap">
          <div className="ms-progress-track">
            <div
              className="ms-progress-fill"
              style={{ width: inView ? `${phase.progress}%` : '0%' }}
            />
          </div>
          <span className="ms-progress-pct">{phase.progress}%</span>
        </div>
      )}

      {/* Highlights */}
      <ul className="ms-highlights">
        {phase.highlights.map(h => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      {/* Date */}
      <div className="ms-card-date">
        <Calendar size={12} aria-hidden="true" />
        Target: {phase.date}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function MilestonesPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const achievementRef = useRef<HTMLDivElement>(null);
  const [achievementVisible, setAchievementVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setAchievementVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (achievementRef.current) obs.observe(achievementRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        /* ── Tokens ── */
        :root {
          --navy:       #1a3a5c;
          --navy-dark:  #0f2240;
          --navy-mid:   #254a7a;
          --pink:       #e8185e;
          --pink-light: #ff4d8b;
          --pink-pale:  #fff0f5;
          --white:      #ffffff;
          --off-white:  #f7f9fc;
          --gray-light: #f0f4fa;
          --gray-mid:   #e2e8f3;
          --text-muted: #64748b;
          --text-body:  #334155;
          --green:      #10b981;
          --amber:      #f59e0b;
          --font-display: 'Syne', sans-serif;
          --font-body:    'DM Sans', sans-serif;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ms-page {
          font-family: var(--font-body);
          color: var(--text-body);
          background: var(--white);
          overflow-x: hidden;
        }

        /* ── Breadcrumb ── */
        .ms-breadcrumb {
          background: var(--off-white);
          border-bottom: 1px solid var(--gray-mid);
          padding: 0.65rem 2rem;
        }
        .ms-breadcrumb-inner {
          max-width: 1160px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .ms-breadcrumb a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
        .ms-breadcrumb a:hover { color: var(--navy); }
        .ms-breadcrumb-sep { color: var(--gray-mid); }
        .ms-breadcrumb-cur { color: var(--pink); }

        /* ── Hero ── */
        .ms-hero {
          background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-mid) 55%, #1e4976 100%);
          position: relative;
          overflow: hidden;
          padding: 5rem 2rem 4.5rem;
          text-align: center;
        }
        .ms-hero-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .ms-hero-glow1 {
          position: absolute;
          top: -80px; right: -80px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,24,94,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .ms-hero-glow2 {
          position: absolute;
          bottom: -60px; left: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .ms-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 auto;
          animation: ms-fade-up 0.7s ease both;
        }
        .ms-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(232,24,94,0.15);
          border: 1px solid rgba(232,24,94,0.35);
          border-radius: 99px;
          padding: 0.35rem 1rem;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ff6ba3;
          margin-bottom: 1.4rem;
        }
        .ms-hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--pink-light);
          animation: ms-pulse 2s ease-in-out infinite;
        }
        @keyframes ms-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.55; } }
        .ms-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(2.1rem, 5vw, 3.3rem);
          font-weight: 700;
          color: var(--white);
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.1rem;
        }
        .ms-hero h1 em { font-style: normal; color: var(--pink-light); }
        .ms-hero-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.72);
          line-height: 1.65;
          max-width: 520px;
          margin: 0 auto;
        }

        /* ── Stats bar ── */
        .ms-stats-section {
          background: var(--navy);
          padding: 2.5rem 2rem;
        }
        .ms-stats-grid {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
        }
        @media (max-width: 640px) { .ms-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .ms-stat-card {
          background: rgba(255,255,255,0.04);
          padding: 1.5rem 1.25rem;
          text-align: center;
          transition: background 0.25s;
        }
        .ms-stat-card:hover { background: rgba(232,24,94,0.12); }
        .ms-stat-number {
          display: block;
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--white);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 0.4rem;
        }
        .ms-stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }

        /* ── Achievement banner ── */
        .ms-achievement-section {
          background: var(--off-white);
          padding: 3rem 2rem;
        }
        .ms-achievement-wrap {
          max-width: 1000px;
          margin: 0 auto;
        }
        .ms-achievement-card {
          background: linear-gradient(135deg, #0f2240 0%, var(--navy) 60%, #1e4976 100%);
          border-radius: 20px;
          padding: 2rem 2.5rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 2rem;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .ms-achievement-card.ms-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .ms-achievement-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }
        .ms-achievement-icon {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: rgba(232,24,94,0.15);
          border: 2px solid rgba(232,24,94,0.4);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #ff6ba3;
          animation: ms-trophy-bounce 3s ease-in-out infinite;
        }
        @keyframes ms-trophy-bounce {
          0%,100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-6px) rotate(-3deg); }
          60% { transform: translateY(-3px) rotate(2deg); }
        }
        .ms-achievement-title {
          font-family: var(--font-display);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--pink-light);
          margin-bottom: 0.45rem;
        }
        .ms-achievement-text {
          font-size: 1rem;
          color: rgba(255,255,255,0.85);
          line-height: 1.6;
        }
        .ms-achievement-text strong { color: var(--white); }
        .ms-achievement-crops {
          display: flex;
          gap: 1.25rem;
          flex-shrink: 0;
        }
        .ms-crop-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 0.7rem 1rem;
          transition: background 0.25s, transform 0.25s;
          color: rgba(255,255,255,0.85);
        }
        .ms-crop-pill:hover { background: rgba(232,24,94,0.15); transform: translateY(-3px); }
        .ms-crop-pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pink-light);
        }
        .ms-crop-pill-name { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.7); }
        @media (max-width: 760px) {
          .ms-achievement-card { grid-template-columns: 1fr; text-align: center; }
          .ms-achievement-crops { justify-content: center; }
          .ms-achievement-icon { margin: 0 auto; }
        }

        /* ── Timeline ── */
        .ms-timeline-section {
          padding: 5rem 2rem 6rem;
          background: var(--white);
          position: relative;
        }
        .ms-timeline-section-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .ms-section-label {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--pink);
          margin-bottom: 0.8rem;
        }
        .ms-section-title {
          font-family: var(--font-display);
          font-size: clamp(1.85rem, 4vw, 2.6rem);
          font-weight: 700;
          color: var(--navy);
          letter-spacing: -0.03em;
          margin-bottom: 0.9rem;
        }
        .ms-section-underline {
          width: 52px; height: 4px;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--pink), var(--pink-light));
          margin: 0 auto;
        }

        /* ── Central spine ── */
        .ms-timeline {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }
        .ms-timeline-spine {
          position: absolute;
          left: 50%;
          top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, transparent, var(--gray-mid) 5%, var(--gray-mid) 95%, transparent);
          transform: translateX(-50%);
        }
        .ms-timeline-spine-fill {
          position: absolute;
          top: 0; left: 0; right: 0;
          background: linear-gradient(to bottom, var(--pink), var(--pink-light));
          height: 40%;
          border-radius: 99px;
        }

        /* ── Phase rows ── */
        .ms-phase-row {
          display: grid;
          grid-template-columns: 1fr 60px 1fr;
          align-items: start;
          margin-bottom: 3.5rem;
          gap: 0;
        }
        .ms-phase-row--right .ms-phase-card { grid-column: 3; }
        .ms-phase-row--left  .ms-phase-card { grid-column: 1; grid-row: 1; }

        /* Node */
        .ms-timeline-node {
          grid-column: 2;
          display: flex;
          justify-content: center;
          padding-top: 1.5rem;
          position: relative;
          z-index: 2;
        }
        .ms-node-dot {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 3px solid var(--white);
          box-shadow: 0 0 0 2px var(--gray-mid);
          transition: transform 0.3s, box-shadow 0.3s;
          flex-shrink: 0;
        }
        .ms-node-dot--completed   { background: var(--green); box-shadow: 0 0 0 2px var(--green); }
        .ms-node-dot--in-progress {
          background: var(--pink);
          box-shadow: 0 0 0 2px var(--pink);
          animation: ms-node-pulse 2s ease-in-out infinite;
        }
        .ms-node-dot--planned     { background: var(--gray-mid); box-shadow: 0 0 0 2px var(--gray-mid); }
        @keyframes ms-node-pulse {
          0%,100% { box-shadow: 0 0 0 2px var(--pink); }
          50%     { box-shadow: 0 0 0 8px rgba(232,24,94,0.2); }
        }

        /* Phase card */
        .ms-phase-card {
          background: var(--white);
          border: 1.5px solid var(--gray-mid);
          border-radius: 18px;
          padding: 1.75rem;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s, opacity 0s;
        }
        .ms-phase-card--left  { transform: translateX(-60px); }
        .ms-phase-card--right { transform: translateX(60px); }
        .ms-phase-card--visible {
          opacity: 1;
          transform: translateX(0) !important;
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s;
        }
        .ms-phase-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 14px 44px rgba(26,54,93,0.12);
          border-color: transparent;
        }

        /* Accent bar */
        .ms-card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--navy), var(--pink));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .ms-card-accent--active { transform: scaleX(1); }

        .ms-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.6rem;
        }
        .ms-card-phase-num {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* Badges */
        .ms-badge {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.25rem 0.7rem;
          border-radius: 99px;
        }
        .ms-badge--completed   { background: rgba(16,185,129,0.1);  color: #059669; border: 1px solid rgba(16,185,129,0.25); }
        .ms-badge--progress    { background: rgba(232,24,94,0.08);   color: var(--pink); border: 1px solid rgba(232,24,94,0.25); }
        .ms-badge--planned     { background: rgba(100,116,139,0.08); color: var(--text-muted); border: 1px solid rgba(100,116,139,0.2); }

        .ms-card-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 0.65rem;
          letter-spacing: -0.02em;
        }
        .ms-card-desc {
          font-size: 0.88rem;
          line-height: 1.7;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        /* Progress bar */
        .ms-progress-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .ms-progress-track {
          flex: 1;
          height: 6px;
          background: var(--gray-light);
          border-radius: 99px;
          overflow: hidden;
        }
        .ms-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--pink), var(--pink-light));
          border-radius: 99px;
          transition: width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s;
        }
        .ms-progress-pct {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--pink);
          min-width: 2.5rem;
          text-align: right;
        }

        /* Highlights */
        .ms-highlights {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1rem;
        }
        .ms-highlights li {
          font-size: 0.82rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ms-highlights li::before {
          content: '';
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--pink);
          flex-shrink: 0;
        }

        /* Card date */
        .ms-card-date {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid var(--gray-light);
        }
        .ms-card-date svg { color: var(--pink); }

        /* Spacer in grid */
        .ms-phase-spacer { /* empty cell */ }

        /* Responsive timeline */
        @media (max-width: 760px) {
          .ms-timeline-spine { left: 20px; }
          .ms-phase-row {
            grid-template-columns: 40px 1fr;
            grid-template-rows: auto;
          }
          .ms-timeline-node { grid-column: 1; padding-top: 1.6rem; }
          .ms-phase-card { grid-column: 2 !important; grid-row: 1; }
          .ms-phase-card--left  { transform: translateX(30px); }
          .ms-phase-card--right { transform: translateX(30px); }
          .ms-phase-spacer { display: none; }
        }

        /* ── Overall progress ── */
        .ms-overall-section {
          background: var(--off-white);
          padding: 3.5rem 2rem;
        }
        .ms-overall-inner {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        .ms-overall-track {
          width: 100%;
          height: 12px;
          background: var(--gray-mid);
          border-radius: 99px;
          overflow: visible;
          margin: 1.5rem 0;
          position: relative;
        }
        .ms-overall-fill {
          height: 100%;
          width: 41%;
          background: linear-gradient(90deg, var(--navy), var(--pink));
          border-radius: 99px;
          position: relative;
          transition: width 1.5s cubic-bezier(0.4,0,0.2,1);
        }
        .ms-overall-fill::after {
          content: '41%';
          position: absolute;
          right: -2px;
          top: -28px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--pink);
          background: var(--pink-pale);
          padding: 0.15rem 0.4rem;
          border-radius: 6px;
          white-space: nowrap;
        }
        .ms-overall-phases {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
        }
        .ms-overall-phase-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── CTA ── */
        .ms-cta-section {
          background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-mid) 100%);
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ms-cta-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .ms-cta-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .ms-cta-section h2 {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 700;
          color: var(--white);
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
        }
        .ms-cta-section p {
          font-size: 0.97rem;
          color: rgba(255,255,255,0.68);
          line-height: 1.65;
          margin-bottom: 2rem;
        }
        .ms-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: var(--pink);
          color: var(--white);
          padding: 0.85rem 2rem;
          border-radius: 99px;
          transition: background 0.25s, box-shadow 0.25s, transform 0.25s;
          box-shadow: 0 4px 20px rgba(232,24,94,0.35);
        }
        .ms-cta-btn:hover {
          background: var(--pink-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(232,24,94,0.5);
        }

        /* ── Shared ── */
        @keyframes ms-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="ms-page">
        {/* Hero */}
        <section className="ms-hero">
          <div className="ms-hero-dots" aria-hidden="true" />
          <div className="ms-hero-glow1" aria-hidden="true" />
          <div className="ms-hero-glow2" aria-hidden="true" />
          <div className="ms-hero-inner">
            <div className="ms-hero-badge">
              <span className="ms-hero-badge-dot" aria-hidden="true" />
              Programme Progress
            </div>
            <h1>Programme <em>Milestones</em> &amp; Achievements</h1>
            <p className="ms-hero-sub">
              Tracking our progress as we make history in Rwanda&apos;s agricultural biotechnology — phase by phase, crop by crop.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="ms-stats-section">
          <div className="ms-stats-grid" ref={statsRef}>
            {STATS.map(s => (
              <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} active={statsVisible} />
            ))}
          </div>
        </section>

        {/* Historic Achievement */}
        <section className="ms-achievement-section">
          <div className="ms-achievement-wrap">
            <div
              className={`ms-achievement-card ${achievementVisible ? 'ms-visible' : ''}`}
              ref={achievementRef}
            >
              <div className="ms-achievement-icon" aria-hidden="true">
                <Trophy size={28} strokeWidth={1.5} />
              </div>
              <div>
                <div className="ms-achievement-title">Historic Achievement — September 3, 2025</div>
                <p className="ms-achievement-text">
                  REMA granted <strong>environmental release approvals</strong> for three priority biotech crops —
                  the <strong>first-ever approval for biotech food crops</strong> in Rwanda.
                </p>
              </div>
              <div className="ms-achievement-crops">
                {CROPS.map(({ Icon, name }) => (
                  <div className="ms-crop-pill" key={name}>
                    <span className="ms-crop-pill-icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={1.5} />
                    </span>
                    <span className="ms-crop-pill-name">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="ms-timeline-section">
          <div className="ms-timeline-section-header">
            <span className="ms-section-label">Programme Roadmap</span>
            <h2 className="ms-section-title">Phase-by-Phase Progress</h2>
            <div className="ms-section-underline" />
          </div>

          <div className="ms-timeline" role="list">
            <div className="ms-timeline-spine" aria-hidden="true">
              <div className="ms-timeline-spine-fill" />
            </div>

            {PHASES.map((phase, i) => {
              const side = i % 2 === 0 ? 'left' : 'right';
              return (
                <div
                  key={phase.id}
                  className={`ms-phase-row ms-phase-row--${side}`}
                  role="listitem"
                >
                  {side === 'left' ? (
                    <>
                      <PhaseCard phase={phase} side="left" index={i} />
                      <div className="ms-timeline-node">
                        <div className={`ms-node-dot ms-node-dot--${phase.status}`} aria-label={`Phase ${phase.id} status: ${phase.status}`} />
                      </div>
                      <div className="ms-phase-spacer" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <div className="ms-phase-spacer" aria-hidden="true" />
                      <div className="ms-timeline-node">
                        <div className={`ms-node-dot ms-node-dot--${phase.status}`} aria-label={`Phase ${phase.id} status: ${phase.status}`} />
                      </div>
                      <PhaseCard phase={phase} side="right" index={i} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Overall progress */}
        <section className="ms-overall-section">
          <div className="ms-overall-inner">
            <span className="ms-section-label">Overall Programme</span>
            <h2 className="ms-section-title" style={{ fontSize: '1.6rem' }}>Programme Completion</h2>
            <div className="ms-overall-track">
              <div className="ms-overall-fill" />
            </div>
            <div className="ms-overall-phases">
              {PHASES.map(p => (
                <span key={p.id} className="ms-overall-phase-label">P{p.id}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="ms-cta-section">
          <div className="ms-cta-inner">
            <h2>See the Science Behind It</h2>
            <p>
              Explore the biotechnology innovations and field research driving each milestone in Rwanda&apos;s agricultural transformation.
            </p>
            <Link href="/Biotech" className="ms-cta-btn">
              Explore Biotechnology in modern universe
              <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
