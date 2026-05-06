'use client';

import Footer from '@/components/Footer';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Variants } from 'framer-motion';

/* ── CONSTANTS ── */
const COLORS = {
  pink:    '#e8185e',
  navy:    '#1a3a5c',
  purple:  '#7b3fa0',
  teal:    '#2d7a8a',
  pinkLight: '#ff4d8b',
  navyLight: '#254a72',
  tealLight: '#3d9aad',
};

/* ── DATA ─────────────────────────────── */

const FLOAT_CARDS = [
  { emoji: '🧬', label: 'Gene Editing', sub: 'CRISPR Technology', color: COLORS.purple, rotate: -8 },
  { emoji: '🌱', label: 'Resilient Crops', sub: 'Drought-Tolerant', color: COLORS.teal, rotate: 5 },
  { emoji: '🔬', label: 'Lab to Field', sub: 'Rapid Deployment', color: COLORS.pink, rotate: -4 },
  { emoji: '🇷🇼', label: 'Rwanda First', sub: 'Local Capacity', color: COLORS.navy, rotate: 7 },
];

const FEATURES = [
  {
    icon: '🧬',
    title: 'Precision Biotechnology',
    body: "CRISPR-based crop improvements engineered for Rwanda's highland agro-ecological zones, from lab research to registered field varieties.",
    color: COLORS.purple,
    href: '/Biotech',
    img: '/image/image-07.jpg',
  },
  {
    icon: '🌿',
    title: 'Environmental Stewardship',
    body: 'Regenerative agriculture integrated with modern biosystems science — protecting biodiversity while dramatically boosting smallholder yield.',
    color: COLORS.teal,
    href: '/Environment',
    img: '/image/image-08.jpg',
  },
  {
    icon: '⚖️',
    title: 'Regulatory Advocacy',
    body: "Evidence-driven policy reform enabling Rwanda's farmers and scientists to access the world's safest and most effective crop technologies.",
    color: COLORS.pink,
    href: '/About',
    img: '/image/image-09.jpg',
  },
  {
    icon: '🤝',
    title: 'Farmer Partnerships',
    body: "Direct collaboration with cooperatives across Rwanda's 30 districts, ensuring innovation reaches those who need it most — on the ground.",
    color: COLORS.navy,
    href: '/About',
    img: '/image/image-10.jpg',
  },
  {
    icon: '📊',
    title: 'Data-Driven Research',
    body: 'Real-time field data collection and analysis across multiple crop varieties, enabling rapid iteration and evidence-based recommendations.',
    color: COLORS.purple,
    href: '/Biotech',
    img: '/image/image-03.jpg',
  },
  {
    icon: '🌍',
    title: 'Regional Impact',
    body: 'Building a replicable model for East Africa, with Rwanda as the proving ground for scalable agricultural biotech deployment.',
    color: COLORS.teal,
    href: '/About',
    img: '/image/image-04.jpg',
  },
];

const STATS = [
  { val: '34%', label: 'Average Yield Increase', icon: '📈' },
  { val: '40K+', label: 'Farmers Targeted', icon: '👨‍🌾' },
  { val: '12+', label: 'Research Partners', icon: '🏛️' },
  { val: '3', label: 'Active Districts', icon: '📍' },
];

const CROPS = [
  { name: 'Cassava', pct: 78, tag: 'Vitamin-A Biofortified' },
  { name: 'Sorghum', pct: 65, tag: 'Drought Tolerant' },
  { name: 'Maize', pct: 52, tag: 'Disease Resistant' },
  { name: 'Beans', pct: 41, tag: 'Nitrogen-Fixing' },
];


const NEWS = [
  {
    tag: 'Biotechnology',
    date: 'Apr 28, 2025',
    title: 'Rwanda Approves First Biofortified Cassava Variety',
    body: 'NAEB greenlit a new vitamin-A enriched cassava strain developed in partnership with regional research institutes — a landmark for food security.',
    img: '/image/image-05.jpg',
  },
  {
    tag: 'Policy',
    date: 'Mar 15, 2025',
    title: 'New Biosafety Guidelines Open Doors for Gene-Edited Crops',
    body: "REMA's updated guidelines represent a risk-proportionate shift toward modern oversight of agricultural biotech innovations.",
    img: '/image/image-06.jpg',
  },
  {
    tag: 'Field Trials',
    date: 'Feb 4, 2025',
    title: '34% Yield Gains Confirmed Under Drought Conditions',
    body: 'Mid-season data from three districts confirms enhanced sorghum varieties significantly outperform conventional seeds under water stress.',
    img: '/image/image-01.jpg',
  },
];

/* ── ANIMATION VARIANTS ─────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

/* ── HELPERS ────────────────────────── */

function Section({ children, className = '', dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section
      ref={ref}
      data-inview={inView}
      className={className}
      style={{ background: dark ? COLORS.navy : undefined }}
    >
      {children}
    </section>
  );
}

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const [email, setEmail] = useState('');

  return (
    <div className="bc-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        :root {
          --pink:      ${COLORS.pink};
          --navy:      ${COLORS.navy};
          --purple:    ${COLORS.purple};
          --teal:      ${COLORS.teal};
          --pink-l:    ${COLORS.pinkLight};
          --white:     #ffffff;
          --off:       #f5f7fb;
          --border:    rgba(26,58,92,0.09);
          --gray:      #6b7a93;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bc-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--white);
          color: var(--navy);
          overflow-x: hidden;
        }

        .bc-hero {
          position: relative;
          min-height: 95vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: var(--navy);
        }

        .bc-hero-parallax {
          position: absolute;
          inset: -10%;
          background: url('/image/image-02.jpg') center/cover no-repeat;
          opacity: 0.45;
          filter: saturate(1.2);
        }

        .bc-hero-inner {
          position: relative;
          z-index: 3;
          max-width: 1240px;
          margin: 0 auto;
          padding: 5rem 2.5rem;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .bc-hero-h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.4rem);
          font-weight: 800;
          line-height: 1.07;
          color: var(--white);
        }
        .bc-hero-h1 em { font-style: normal; color: var(--pink); }

        .bc-feature-card {
          position: relative;
          height: 400px;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2.5rem;
          border: 1px solid var(--border);
        }

        .bc-feature-img-bg {
          position: absolute;
          inset: 0;
          transition: transform 0.8s ease;
        }
        .bc-feature-card:hover .bc-feature-img-bg { transform: scale(1.1); }

        .bc-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, var(--navy) 35%, transparent);
          opacity: 0.9;
        }

        .bc-ticker { background: var(--navy); padding: 1.2rem 0; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .bc-ticker-track { display: inline-flex; animation: ticker 45s linear infinite; white-space: nowrap; color: rgba(255,255,255,0.4); font-family: 'Syne'; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; gap: 3rem; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .bc-crop-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--purple), var(--pink)); transition: width 1.4s ease var(--d); width: 0; }
        [data-inview="true"] .bc-crop-fill { width: var(--w); }

        @media (max-width: 768px) { .bc-hero-inner { grid-template-columns: 1fr; } .bc-hero-right { height: 320px; } }
      `}</style>

      {/* ── HERO ── */}
      <section className="bc-hero" ref={heroRef}>
        <motion.div className="bc-hero-parallax" style={{ y: heroY }} />
        <div className="bc-hero-inner">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
            <span className="text-pink-500 font-bold tracking-widest uppercase text-xs">Rwanda Agricultural Biotech Initiative</span>
            <motion.h1 variants={fadeUp} className="bc-hero-h1 mt-4">The Science<br />of <em>Rwandan</em><br />Growth.</motion.h1>
            <motion.p variants={fadeUp} className="text-white/70 mt-6 mb-10 text-lg max-w-lg leading-relaxed">
              We unlock the genetic potential of crops to ensure food security and economic prosperity for every farmer across Rwanda's diverse agro-ecological zones.
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-4">
              <Link href="/Dna-week" className="bg-[#e8185e] text-white px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all">Explore DNA Week</Link>
            </motion.div>
          </motion.div>

          {/* EXACT ORIGINAL DESIGN FOR FLOATING CARDS */}
          <div className="bc-hero-right" style={{ position: 'relative', height: '400px' }}>
            {FLOAT_CARDS.map((card, i) => (
              <motion.div key={i} drag dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1, y: [0, -15, 0], rotate: card.rotate }}
                transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 } }}
                className="bc-float-card" 
                style={{ 
                  position: 'absolute', 
                  top: i * 70, 
                  left: i * 30, 
                  background: 'rgba(255,255,255,0.1)', 
                  backdropFilter: 'blur(12px)', 
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)', 
                  padding: '1.2rem 1.8rem', 
                  borderRadius: '24px', 
                  cursor: 'grab',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>{card.emoji}</span>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{card.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="bc-ticker">
        <div className="bc-ticker-track">
          {Array(10).fill('Gene Editing • Sustainable Yields • Rwanda First • CRISPR • Biofortification • Soil Health • ').map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: '6rem 2.5rem', background: 'var(--off)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto 4rem' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '2.5rem', fontWeight: 800 }}>Our Core Focus Areas</h2>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} className="bc-feature-card group">
              <div className="bc-feature-img-bg" style={{ background: `url(${f.img}) center/cover` }} />
              <div className="bc-overlay" />
              <div style={{ position: 'relative', zIndex: 10, color: '#fff' }}>
                <span style={{ fontSize: '2rem' }}>{f.icon}</span>
                <h3 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{f.body}</p>
                <Link href={f.href} style={{ color: COLORS.pink, textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Learn More →</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CROP PROGRESS ── */}
      <Section className="bc-crops" dark style={{ padding: '6rem 2.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '3.5rem', fontWeight: 800, color: '#fff' }}>Enhanced Varieties <br/><span style={{ color: COLORS.pink }}>Real Results.</span></h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '1.5rem 0' }}>Confirmed mid-season gains across active Rwandan districts.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {CROPS.map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '0.5rem' }}>
                  <span>{c.name} • {c.tag}</span>
                  <span style={{ fontWeight: 800, color: COLORS.pink }}>{c.pct}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                  <div className="bc-crop-fill" style={{ '--w': `${c.pct}%`, '--d': `${i * 0.1}s` } as any} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── NEWS ── */}
      <section style={{ padding: '6rem 2.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '2.5rem', fontWeight: 800 }}>Latest Insights</h2>
          <Link href="/Dna-week" style={{ color: COLORS.pink, fontWeight: 700, textDecoration: 'none', borderBottom: '2px solid' }}>View Archive</Link>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {NEWS.map((n, i) => (
            <div key={i} className="bc-news-card">
              <div style={{ height: '240px', overflow: 'hidden' }}>
                <img src={n.img} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '2rem' }}>
                <span style={{ color: COLORS.pink, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{n.tag}</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '1rem 0', lineHeight: 1.3 }}>{n.title}</h3>
                <p style={{ fontSize: '0.9rem', color: COLORS.gray, lineHeight: 1.6 }}>{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding: '6rem 2.5rem', background: 'var(--off)', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '2.5rem', fontWeight: 800 }}>Stay in the Loop</h2>
          <p style={{ color: COLORS.gray, margin: '1rem 0 2.5rem' }}>Research briefs and policy updates straight to your inbox.</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="email" placeholder="your@email.com" style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #ddd' }} value={email} onChange={e => setEmail(e.target.value)} />
            <button style={{ background: COLORS.navy, color: '#fff', border: 'none', padding: '0 2rem', borderRadius: '12px', fontWeight: 700 }}>Join</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full z-20 leading-[0]">
          <svg className="relative block w-full h-[40px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z" fill="#f5f7fb" />
          </svg>
        </div>
        <Footer />
      </div>
    </div>
  );
}