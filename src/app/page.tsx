'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Variants } from 'framer-motion';
import Footer from '@/components/Footer';

// ── Lucide icons ──────────────────────────────────────────
import {
  Dna,
  Leaf,
  Scale,
  Handshake,
  BarChart2,
  Globe,
  TrendingUp,
  Users,
  Building2,
  MapPin,
} from 'lucide-react';

/* ── CONSTANTS ── */
const COLORS = {
  pink:      '#e8185e',
  navy:      '#1a3a5c',
  purple:    '#7b3fa0',
  teal:      '#2d7a8a',
  pinkLight: '#ff4d8b',
  navyLight: '#254a72',
  tealLight: '#3d9aad',
  gray:      '#6b7a93',
};

const SW = 1.5; // global strokeWidth for all icons

/* ── DATA ── */
const HERO_SLIDES = [
  '/image/image-02.jpg',
  '/image/image-07.jpg',
  '/image/image-08.jpg',
];

const FEATURES = [
  {
    Icon: Dna,
    title: 'Precision Biotechnology',
    body: "CRISPR-based crop improvements engineered for Rwanda's highland agro-ecological zones, from lab research to registered field varieties.",
    color: COLORS.purple,
    href: '/Biotech',
    img: '/image/image-07.jpg',
  },
  {
    Icon: Leaf,
    title: 'Environmental Stewardship',
    body: 'Regenerative agriculture integrated with modern biosystems science — protecting biodiversity while dramatically boosting smallholder yield.',
    color: COLORS.teal,
    href: '/Environment',
    img: '/image/image-08.jpg',
  },
  {
    Icon: Scale,
    title: 'Regulatory Advocacy',
    body: "Evidence-driven policy reform enabling Rwanda's farmers and scientists to access the world's safest and most effective crop technologies.",
    color: COLORS.pink,
    href: '/About',
    img: '/image/image-09.jpg',
  },
  {
    Icon: Handshake,
    title: 'Farmer Partnerships',
    body: "Direct collaboration with cooperatives across Rwanda's 30 districts, ensuring innovation reaches those who need it most — on the ground.",
    color: COLORS.navy,
    href: '/About',
    img: '/image/image-10.jpg',
  },
  {
    Icon: BarChart2,
    title: 'Data-Driven Research',
    body: 'Real-time field data collection and analysis across multiple crop varieties, enabling rapid iteration and evidence-based recommendations.',
    color: COLORS.purple,
    href: '/Biotech',
    img: '/image/image-03.jpg',
  },
  {
    Icon: Globe,
    title: 'Regional Impact',
    body: 'Building a replicable model for East Africa, with Rwanda as the proving ground for scalable agricultural biotech deployment.',
    color: COLORS.teal,
    href: '/About',
    img: '/image/image-04.jpg',
  },
];

const STATS = [
  { Icon: TrendingUp, val: '34%',  label: 'Average Yield Increase' },
  { Icon: Users,      val: '40K+', label: 'Farmers Targeted'        },
  { Icon: Building2,  val: '12+',  label: 'Research Partners'       },
  { Icon: MapPin,     val: '3',    label: 'Active Districts'         },
];

const CROPS = [
  { name: 'Cassava', pct: 78, tag: 'Vitamin-A Biofortified' },
  { name: 'Sorghum', pct: 65, tag: 'Drought Tolerant'       },
  { name: 'Maize',   pct: 52, tag: 'Disease Resistant'      },
  { name: 'Beans',   pct: 41, tag: 'Nitrogen-Fixing'        },
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

/* ── ANIMATION VARIANTS ── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── SECTION HELPER ── */
function Section({
  children,
  className = '',
  dark = false,
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section
      ref={ref}
      data-inview={inView}
      className={className}
      style={{ background: dark ? COLORS.navy : undefined, ...style }}
    >
      {children}
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const [email, setEmail] = useState('');

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bc-root">
      <style>{`
        :root {
          --pink:   ${COLORS.pink};
          --navy:   ${COLORS.navy};
          --purple: ${COLORS.purple};
          --teal:   ${COLORS.teal};
          --pink-l: ${COLORS.pinkLight};
          --white:  #ffffff;
          --off:    #f5f7fb;
          --border: rgba(26,58,92,0.09);
          --gray:   ${COLORS.gray};
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bc-root {
          background: var(--white);
          color: var(--navy);
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .bc-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--navy);
        }
        .bc-hero-inner {
          position: relative;
          z-index: 3;
          max-width: 860px;
          margin: 0 auto;
          padding: 7rem 2.5rem 9rem;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .bc-hero-h1 {
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 800;
          line-height: 1.05;
          color: var(--white);
        }
        .bc-hero-h1 em { font-style: normal; color: var(--pink); }

        /* ── TICKER ── */
        .bc-ticker {
          background: var(--navy);
          padding: 1.2rem 0;
          overflow: hidden;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .bc-ticker-track {
          display: inline-flex;
          animation: ticker 45s linear infinite;
          white-space: nowrap;
          color: rgba(255,255,255,0.4);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          gap: 3rem;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── STATS ── */
        .bc-stat-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: 0 4px 24px rgba(26,58,92,0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bc-stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(26,58,92,0.13);
        }
        .bc-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(232,24,94,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        /* ── FEATURE CARDS ── */
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
          cursor: pointer;
        }
        .bc-feature-img-bg {
          position: absolute;
          inset: 0;
          transition: transform 0.8s ease;
        }
        .bc-feature-card:hover .bc-feature-img-bg { transform: scale(1.08); }
        .bc-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, var(--navy) 35%, transparent);
          opacity: 0.9;
        }
        .bc-feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        /* ── CROP BARS ── */
        .bc-crop-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, var(--purple), var(--pink));
          transition: width 1.4s ease var(--d);
          width: 0;
        }
        [data-inview="true"] .bc-crop-fill { width: var(--w); }

        /* ── NEWS CARDS ── */
        .bc-news-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bc-news-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(26,58,92,0.12);
        }

        /* ── NEWSLETTER INPUT ── */
        .bc-input {
          flex: 1;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #ddd;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .bc-input:focus { border-color: var(--pink); }

        /* ── SLIDE DOTS ── */
        .bc-slide-dot {
          height: 8px;
          border-radius: 99px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: width 0.4s ease, background 0.4s ease;
        }

        @media (max-width: 768px) {
          .bc-hero-inner { padding: 5rem 1.5rem 7rem; }
        }
      `}</style>

      {/* ════════ HERO ════════ */}
      <section className="bc-hero" ref={heroRef}>

        {/* Sliding parallax backgrounds */}
        <motion.div style={{ y: heroY, position: 'absolute', inset: '-15%', zIndex: 1 }}>
          {HERO_SLIDES.map((src, i) => (
            <div
              key={src}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${src}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: i === slide ? 1 : 0,
                transition: 'opacity 1.4s ease',
              }}
            />
          ))}
        </motion.div>

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(26,58,92,0.72) 0%, rgba(26,58,92,0.50) 50%, rgba(26,58,92,0.80) 100%)',
          }}
        />

        {/* Copy */}
        <div className="bc-hero-inner">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <motion.span
              variants={fadeUp}
              style={{ color: COLORS.pink, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.75rem', display: 'block', marginBottom: '1.25rem' }}
            >
              Rwanda Agricultural Biotech Initiative
            </motion.span>

            <motion.h1 variants={fadeUp} className="bc-hero-h1">
              The Science<br />of <em>Rwandan</em> Growth.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ color: 'rgba(255,255,255,0.75)', marginTop: '1.75rem', marginBottom: '2.75rem', fontSize: '1.15rem', maxWidth: '580px', lineHeight: 1.75 }}
            >
              We unlock the genetic potential of crops to ensure food security and economic prosperity for every farmer across Rwanda's diverse agro-ecological zones.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/Dna-week"
                style={{ background: COLORS.pink, color: '#fff', padding: '1rem 2.2rem', borderRadius: '14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', transition: 'filter 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
              >
                Explore DNA Week
              </Link>
              <Link
                href="/About"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '1rem 2.2rem', borderRadius: '14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              >
                Our Mission
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className="bc-slide-dot"
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{ width: i === slide ? '32px' : '8px', background: i === slide ? COLORS.pink : 'rgba(255,255,255,0.4)' }}
            />
          ))}
        </div>
      </section>

      {/* ════════ TICKER ════════ */}
      <div className="bc-ticker">
        <div className="bc-ticker-track">
          {Array(10).fill(null).map((_, i) => (
            <span key={i}>
              Gene Editing &nbsp;•&nbsp; Sustainable Yields &nbsp;•&nbsp; Rwanda First &nbsp;•&nbsp; CRISPR &nbsp;•&nbsp; Biofortification &nbsp;•&nbsp; Soil Health &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ════════ STATS ════════ */}
      <section style={{ padding: '5rem 2.5rem', background: 'var(--off)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {STATS.map(({ Icon, val, label }, i) => (
            <motion.div
              key={i}
              className="bc-stat-card"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
            >
              <div className="bc-stat-icon">
                <Icon size={22} color={COLORS.pink} strokeWidth={SW} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: COLORS.pink, lineHeight: 1 }}>
                {val}
              </div>
              <div style={{ color: COLORS.gray, fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section style={{ padding: '6rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto 4rem' }}>
          <span style={{ color: COLORS.pink, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            What We Do
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginTop: '0.75rem' }}>
            Our Core Focus Areas
          </h2>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {FEATURES.map(({ Icon, title, body, href, img }, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className="bc-feature-card"
            >
              <div className="bc-feature-img-bg" style={{ background: `url(${img}) center/cover` }} />
              <div className="bc-overlay" />
              <div style={{ position: 'relative', zIndex: 10, color: '#fff' }}>
                {/* Lucide icon in a frosted pill */}
                <div className="bc-feature-icon">
                  <Icon size={20} color="#fff" strokeWidth={SW} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  {body}
                </p>
                <Link
                  href={href}
                  style={{ color: COLORS.pink, textDecoration: 'none', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Learn More →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ CROP PROGRESS ════════ */}
      <Section className="bc-crops" dark style={{ padding: '6rem 2.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>
              Mid-Season Data
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              Enhanced Varieties <br />
              <span style={{ color: COLORS.pink }}>Real Results.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: '1.5rem', lineHeight: 1.7, maxWidth: '380px' }}>
              Confirmed mid-season gains across active Rwandan districts — data collected from over 40,000 smallholder plots.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {CROPS.map((c, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                  <span>
                    <strong>{c.name}</strong>
                    <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>{c.tag}</span>
                  </span>
                  <span style={{ fontWeight: 800, color: COLORS.pink }}>{c.pct}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div className="bc-crop-fill" style={{ '--w': `${c.pct}%`, '--d': `${i * 0.15}s` } as React.CSSProperties} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════ NEWS ════════ */}
      <section style={{ padding: '6rem 2.5rem', background: 'var(--off)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ color: COLORS.pink, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Press & Research
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginTop: '0.5rem' }}>
              Latest Insights
            </h2>
          </div>
          <Link href="/Dna-week" style={{ color: COLORS.pink, fontWeight: 700, textDecoration: 'none', borderBottom: `2px solid ${COLORS.pink}`, paddingBottom: '2px', fontSize: '0.9rem' }}>
            View Archive
          </Link>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {NEWS.map((n, i) => (
            <motion.div key={i} className="bc-news-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}>
              <div style={{ height: '240px', overflow: 'hidden' }}>
                <img src={n.img} alt={n.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: COLORS.pink, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{n.tag}</span>
                  <span style={{ color: COLORS.gray, fontSize: '0.75rem' }}>{n.date}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.75rem' }}>{n.title}</h3>
                <p style={{ fontSize: '0.87rem', color: COLORS.gray, lineHeight: 1.65 }}>{n.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ NEWSLETTER ════════ */}
      <section style={{ padding: '6rem 2.5rem', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <span style={{ color: COLORS.pink, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Stay Updated
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginTop: '0.75rem', marginBottom: '1rem' }}>
            Stay in the Loop
          </h2>
          <p style={{ color: COLORS.gray, marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Research briefs and policy updates straight to your inbox.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="email"
              placeholder="your@email.com"
              className="bc-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              style={{ background: COLORS.navy, color: '#fff', border: 'none', padding: '0 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = COLORS.navyLight)}
              onMouseLeave={e => (e.currentTarget.style.background = COLORS.navy)}
            >
              Join
            </button>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <Footer />
    </div>
  );
}