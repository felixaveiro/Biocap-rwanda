import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Sprout,
  GraduationCap,
  Globe,
  FlaskConical,
  Scale,
  Handshake,
  Telescope,
  Target,
} from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Objectives | BioCap',
  description:
    "Programme Vision & Goals — Transforming Rwanda's agriculture through safe, strategic deployment of biotechnology.",
};

const objectives = [
  {
    Icon: Sprout,
    title: 'Crop Innovation',
    description:
      'Develop drought-resistant and nutrient-enhanced crop varieties using advanced biotechnology techniques including genetic modification and marker-assisted breeding.',
  },
  {
    Icon: GraduationCap,
    title: 'Capacity Building',
    description:
      'Train local farmers, researchers, and extension workers in modern agricultural biotechnology practices and sustainable farming methods.',
  },
  {
    Icon: Globe,
    title: 'Food Security',
    description:
      'Increase agricultural productivity and food security through the adoption of climate-smart biotechnology solutions across Rwanda.',
  },
  {
    Icon: FlaskConical,
    title: 'Research Excellence',
    description:
      'Establish state-of-the-art research facilities and promote innovation in agricultural biotechnology across East Africa.',
  },
  {
    Icon: Scale,
    title: 'Regulatory Advancement',
    description:
      'Accelerate science-based biosafety regulations and streamline approval pathways for biotech crops that meet international safety standards.',
  },
  {
    Icon: Handshake,
    title: 'Strategic Partnerships',
    description:
      'Forge partnerships with international research institutions, governments, and private sector actors to co-develop and deploy innovations.',
  },
];

export default function ObjectivesPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root {
          --navy:       #1a365d;
          --navy-dark:  #0f2240;
          --navy-mid:   #254a7a;
          --pink:       #e91e63;
          --pink-light: #ff4d8b;
          --pink-pale:  #fff0f5;
          --white:      #ffffff;
          --off-white:  #f7f9fc;
          --gray-light: #f0f4fa;
          --gray-mid:   #e2e8f3;
          --text-muted: #64748b;
          --text-body:  #334155;
          --font-display: 'DM Serif Display', Georgia, serif;
          --font-body:    'Plus Jakarta Sans', 'Segoe UI', sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .obj-page {
          font-family: var(--font-body);
          color: var(--text-body);
          background: var(--white);
        }

        /* ── Breadcrumb ── */
        .obj-breadcrumb {
          background: var(--off-white);
          border-bottom: 1px solid var(--gray-mid);
          padding: 0.65rem 2rem;
        }
        .obj-breadcrumb-inner {
          max-width: 1160px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .obj-breadcrumb a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
        .obj-breadcrumb a:hover { color: var(--navy); }
        .obj-breadcrumb-sep { color: var(--gray-mid); font-size: 0.8rem; }
        .obj-breadcrumb-cur { color: var(--pink); }

        /* ── Hero ── */
        .obj-hero {
          background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-mid) 55%, #1e4976 100%);
          position: relative;
          overflow: hidden;
          padding: 5rem 2rem 4.5rem;
          text-align: center;
        }
        .obj-hero::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(233,30,99,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .obj-hero::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .obj-hero-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .obj-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 auto;
          animation: fade-up 0.7s ease both;
        }
        .obj-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(233,30,99,0.15);
          border: 1px solid rgba(233,30,99,0.35);
          border-radius: 99px;
          padding: 0.35rem 1rem;
          font-family: var(--font-body);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ff6ba3;
          margin-bottom: 1.4rem;
        }
        .obj-hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--pink-light);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.5); opacity: 0.6; }
        }
        .obj-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(2.1rem, 5vw, 3.2rem);
          font-weight: 400;
          color: var(--white);
          line-height: 1.12;
          letter-spacing: -0.03em;
          margin-bottom: 1.1rem;
        }
        .obj-hero h1 em { font-style: normal; color: var(--pink-light); }
        .obj-hero-sub {
          font-size: 1.05rem;
          font-weight: 400;
          color: rgba(255,255,255,0.72);
          line-height: 1.65;
          max-width: 540px;
          margin: 0 auto;
        }

        /* ── Vision / Goal cards ── */
        .obj-vg-section {
          background: var(--off-white);
          padding: 4.5rem 2rem;
        }
        .obj-vg-inner {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.75rem;
        }
        @media (max-width: 760px) { .obj-vg-inner { grid-template-columns: 1fr; } }

        .obj-vg-card {
          background: var(--white);
          border-radius: 18px;
          padding: 2.25rem 2rem;
          border: 1.5px solid var(--gray-mid);
          box-shadow: 0 2px 20px rgba(26,54,93,0.06);
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s;
        }
        .obj-vg-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 36px rgba(26,54,93,0.12);
        }
        .obj-vg-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .obj-vg-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--gray-light);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .obj-vg-card.vision .obj-vg-icon { background: #e8f0fb; color: var(--navy); }
        .obj-vg-card.goal   .obj-vg-icon { background: var(--pink-pale); color: var(--pink); }

        .obj-vg-card-title {
          font-family: var(--font-body);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--navy);
          letter-spacing: -0.01em;
        }
        .obj-vg-card p {
          font-size: 0.94rem;
          line-height: 1.7;
          color: var(--text-muted);
        }
        .obj-vg-card ul {
          list-style: none;
          padding: 0;
          margin-top: 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .obj-vg-card ul li {
          font-size: 0.91rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.55rem;
          line-height: 1.55;
        }
        .obj-vg-card ul li::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--pink);
          flex-shrink: 0;
        }

        /* ── Objectives grid ── */
        .obj-grid-section {
          padding: 5rem 2rem 5.5rem;
          background: var(--white);
        }
        .obj-grid-inner {
          max-width: 1160px;
          margin: 0 auto;
        }
        .obj-section-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }
        .obj-section-label {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--pink);
          margin-bottom: 0.8rem;
        }
        .obj-section-title {
          font-family: var(--font-display);
          font-size: clamp(1.85rem, 4vw, 2.6rem);
          font-weight: 400;
          color: var(--navy);
          letter-spacing: -0.035em;
          line-height: 1.15;
          margin-bottom: 0.9rem;
        }
        .obj-section-underline {
          width: 52px; height: 4px;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--pink), var(--pink-light));
          margin: 0 auto;
        }

        /* ── Cards grid — fill the row evenly ── */
        .obj-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 960px) { .obj-cards { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .obj-cards { grid-template-columns: 1fr; } }

        /* ── Staggered slide-in from left ── */
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-48px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .obj-card {
          background: var(--white);
          border: 1.5px solid var(--gray-mid);
          border-radius: 16px;
          padding: 1.9rem 1.75rem;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          /* fill full height so all cards in a row align */
          height: 100%;

          /* animation — default hidden, revealed by class */
          opacity: 0;
          animation: slide-in-left 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s, border-color 0.28s;
        }

        /* Stagger delays for each card position */
        .obj-card:nth-child(1) { animation-delay: 0.05s; }
        .obj-card:nth-child(2) { animation-delay: 0.15s; }
        .obj-card:nth-child(3) { animation-delay: 0.25s; }
        .obj-card:nth-child(4) { animation-delay: 0.35s; }
        .obj-card:nth-child(5) { animation-delay: 0.45s; }
        .obj-card:nth-child(6) { animation-delay: 0.55s; }

        .obj-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 3px;
          background: linear-gradient(90deg, var(--navy), var(--pink));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .obj-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(26,54,93,0.11);
          border-color: transparent;
        }
        .obj-card:hover::before { transform: scaleX(1); }

        .obj-card-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: var(--gray-light);
          display: flex; align-items: center; justify-content: center;
          color: var(--navy);
          margin-bottom: 1.1rem;
          flex-shrink: 0;
          transition: background 0.25s, transform 0.25s, color 0.25s;
        }
        .obj-card:hover .obj-card-icon {
          background: var(--pink-pale);
          color: var(--pink);
          transform: scale(1.08) rotate(-4deg);
        }

        .obj-card-title {
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 0.65rem;
          letter-spacing: -0.01em;
        }
        .obj-card-desc {
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--text-muted);
          flex: 1;
        }

        /* ── CTA strip ── */
        .obj-cta-strip {
          background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-mid) 100%);
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .obj-cta-strip::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .obj-cta-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }
        .obj-cta-strip h2 {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 400;
          color: var(--white);
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
        }
        .obj-cta-strip p {
          font-size: 0.97rem;
          color: rgba(255,255,255,0.68);
          line-height: 1.65;
          margin-bottom: 2rem;
        }
        .obj-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
          font-family: var(--font-body);
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          background: var(--pink);
          color: var(--white);
          padding: 0.85rem 2rem;
          border-radius: 99px;
          transition: background 0.25s, box-shadow 0.25s, transform 0.25s;
          box-shadow: 0 4px 20px rgba(233,30,99,0.35);
        }
        .obj-cta-btn:hover {
          background: var(--pink-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(233,30,99,0.50);
        }

        /* ── Shared fade-up ── */
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .obj-vg-card     { animation: fade-up 0.6s ease both; }
        .obj-vg-card:nth-child(2) { animation-delay: 0.1s; }
      `}</style>

      <div className="obj-page">

        {/* ── Breadcrumb ── */}
        <div className="obj-breadcrumb">
          <div className="obj-breadcrumb-inner">
            <Link href="/About">About</Link>
            <span className="obj-breadcrumb-sep">›</span>
            <span className="obj-breadcrumb-cur">Objectives</span>
          </div>
        </div>

        {/* ── Hero ── */}
        <section className="obj-hero">
          <div className="obj-hero-dots" />
          <div className="obj-hero-inner">
            <div className="obj-hero-badge">
              <span className="obj-hero-badge-dot" />
              Programme Direction
            </div>
            <h1>
              Programme <em>Vision</em> & Goals
            </h1>
            <p className="obj-hero-sub">
              Transforming Rwanda's agriculture through safe, strategic deployment
              of biotechnology — building capacity, increasing yields, and securing
              food for future generations.
            </p>
          </div>
        </section>

        {/* ── Vision / Goal ── */}
        <section className="obj-vg-section">
          <div className="obj-vg-inner">

            <div className="obj-vg-card vision">
              <div className="obj-vg-card-header">
                <div className="obj-vg-icon">
                  <Telescope size={20} />
                </div>
                <span className="obj-vg-card-title">Our Vision</span>
              </div>
              <p>
                To catalyze sustainable agricultural development in Rwanda through the
                safe and strategic deployment of biotech crops that meet local needs
                and global standards — positioning Rwanda as a leader in African
                agri-biotech innovation.
              </p>
            </div>

            <div className="obj-vg-card goal">
              <div className="obj-vg-card-header">
                <div className="obj-vg-icon">
                  <Target size={20} />
                </div>
                <span className="obj-vg-card-title">Our Goal</span>
              </div>
              <p style={{ marginBottom: '0.65rem' }}>
                By 2029, BioCap aims to achieve regulatory approval, release, initial
                commercialization, and improved awareness of:
              </p>
              <ul>
                <li>Cassava varieties resistant to brown streak virus</li>
                <li>Potato varieties resistant to late blight</li>
                <li>Maize varieties resistant to drought, stem borer, and fall armyworm</li>
              </ul>
            </div>

          </div>
        </section>

        {/* ── Programme Objectives ── */}
        <section className="obj-grid-section">
          <div className="obj-grid-inner">
            <div className="obj-section-header">
              <span className="obj-section-label">What We're Building</span>
              <h2 className="obj-section-title">Programme Objectives</h2>
              <div className="obj-section-underline" />
            </div>

            <div className="obj-cards">
              {objectives.map(({ Icon, title, description }) => (
                <div key={title} className="obj-card">
                  <div className="obj-card-icon">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <h3 className="obj-card-title">{title}</h3>
                  <p className="obj-card-desc">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Strip ── */}
        <section className="obj-cta-strip">
          <div className="obj-cta-inner">
            <h2>Ready to Learn More?</h2>
            <p>
              Explore our biotechnology initiatives, field research, and the science
              driving Rwanda's agricultural transformation.
            </p>
            <Link href="/Biotech" className="obj-cta-btn">
              Explore Biotechnology
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
        <Footer />

      </div>
    </>
  );
}