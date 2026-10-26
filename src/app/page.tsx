'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import React, { useRef, useState, useEffect } from 'react';
import { Variants } from 'framer-motion';
import useSWR from 'swr';
import Footer from '@/components/Footer';
import { blogsApi } from '@/lib/api/blogs';
import { BlogPost } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils/file';

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
  Wheat,
  Star,
  ExternalLink,
} from 'lucide-react';

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

const SW = 1.5; 

const RABP_CMP_URL = 'https://rabp.aatf-africa.org/index.php';
const RABP_CMP_MISSION_URL = 'https://rabp.aatf-africa.org/objectives.php';

interface HeroButton {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
}

interface HeroSlide {
  key: 'biocap' | 'cmp';
  image: string;
  overlay: string;
  badge: string;
  title: React.ReactNode;
  body: string;
  buttons: HeroButton[];
}

// Two hero slides: the BioCap project and the RABP-CMP project
const HERO_SLIDES: HeroSlide[] = [
  {
    key: 'biocap',
    image: '/image/IMG_150.jpg',
    overlay: 'linear-gradient(to right, #1B3A5C 0%, rgba(27,58,92,0.85) 55%, transparent 100%)',
    badge: 'Rwanda Agricultural Biotech Initiative',
    title: (
      <>
        The Science of <span className="text-[#E8185A]">Rwandan</span> Growth.
      </>
    ),
    body: 'We are unlocking the genetic potential of Rwandan farmer-preferred crops to ensure food security and economic prosperity for every farmer across our diversified agro-ecological zones.',
    buttons: [
      { label: 'Explore Our Events', href: '/Resource', primary: true },
      { label: 'Our Mission', href: '/About#mission' },
    ],
  },
  {
    key: 'cmp',
    image: '/image/IMG_36.jpg',
    overlay: 'linear-gradient(to right, rgba(10,112,82,0.97) 0%, rgba(28,120,72,0.90) 55%, rgba(58,125,63,0.35) 100%)',
    badge: 'First Biotech Crop Approvals in Rwanda — September 2025',
    title: <>Transforming Agriculture Through Agricultural Biotechnology</>,
    body: 'RABP-CMP leverages modern biotechnology to develop resilient cassava, maize, and potato varieties for Rwanda. Through innovation, research, and partnerships, the programme supports sustainable agriculture, improved yields, and enhanced food security for more than 500,000 smallholder farmers.',
    buttons: [
      { label: 'Explore More', href: RABP_CMP_URL, external: true, primary: true },
      { label: 'Our Mission', href: RABP_CMP_MISSION_URL, external: true },
    ],
  },
];

const HERO_INTERVAL_MS = 8000;

// Which part of the photo stays visible when the screen shape differs from the photo.
// 'center top' keeps heads/faces in view. Try 'center' or 'center 30%' to show more of the bottom.
const HERO_IMAGE_POSITION = 'center top';

const FEATURES = [
  {
    Icon: Dna,
    title: 'Precision Biotechnology',
    body: "For centuries, crop improvement has relied on selecting plants with desirable traits and crossing them over many generations. While conventional breeding has transformed global agriculture, it often transfers both desirable ..",
    color: COLORS.purple,
    href: '/Stewardship-News?project=precision-biotechnology',
    img: '/image/Precision-decision.jpg',
  },
  {
    Icon: Leaf,
    title: 'Communication & Social Engagement',
    body: 'Through Rwanda BioCap Project, communication is viewed as a continuous process of engagement that connects researchers, regulators, farmers, journalists, educators, policymakers, and the public throughout the innovation journey.',
    color: COLORS.teal,
    href: '/Stewardship-News?project=communication-social-engagement',
    img: '/image/IMG_155.jpg',
  },
  {
    Icon: Scale,
    title: 'Regulatory Advocacy',
    body: "Scientific discoveries improve lives only when they are supported by sound public policy. As crop biotechnology continues to evolve, countries need regulatory systems that protect public health and the environment while ..",
    color: COLORS.pink,
    href: '/Stewardship-News?project=regulatory-advocacy',
    img: '/image/advocacy-image.jpg',
  },
  {
    Icon: Handshake,
    title: 'Farmer Participation',
    body: "For the first time, the project introduces genome editing as a precise crop improvement tool. Its purpose is not to reinvent new varieties, but to strengthen existing crop value chains by enhancing the varieties farmers already grow, trust, sell, and consume.",
    color: COLORS.navy,
    href: '/Stewardship-News?project=farmer-participation',
    img: '/image/IMG_126.jpg',
  },
  {
    Icon: BarChart2,
    title: 'Condunsive Research Infrastracture',
    body: 'Scientific innovation flourishes where ideas, expertise, and world-class infrastructure come together. For Rwanda, investing in modern research facilities is more than constructing laboratories — it is creating the foundation for a future where agricultural solutions are discovered ..',
    color: COLORS.purple,
    href: '/Stewardship-News?project=conducive-research-infrastructure',
    img: '/image/LABDY3_41.jpg',
  },
  {
    Icon: Globe,
    title: 'Regional Impact',
    body: 'Building a replicable model for East Africa, with Rwanda as the proving ground for scalable agricultural biotech deployment.',
    color: COLORS.teal,
    href: '/Stewardship-News?project=regional-impact',
    img: '/image/LABDY3_30.jpg',
  },
];

const STATS = [
  { Icon: TrendingUp, val: '34%',  label: 'Average Yield Increase' },
  { Icon: Users,      val: '40K+', label: 'Farmers Targeted'        },
  { Icon: Building2,  val: '6',    label: 'Partner Institutions'     },
  { Icon: Wheat,      val: '3',    label: 'Crops'                  },
];

const CROPS = [
  { name: 'Cassava', pct: 45, tag: 'Virus-Resistance' },
  { name: 'Potato',  pct: 37, tag: 'Late Bright Resistance'       },
  { name: 'Banana',  pct: 21, tag: 'BXW Resistance'        },
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

/* ── HERO BUTTON (internal link or external site) ── */
function HeroLink({ btn }: { btn: HeroButton }) {
  const base: React.CSSProperties = btn.primary
    ? { background: COLORS.pink, color: '#fff', padding: '1rem 2.2rem', borderRadius: '14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', transition: 'filter 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }
    : { background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '1rem 2.2rem', borderRadius: '14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', transition: 'background 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' };

  const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
    if (btn.primary) e.currentTarget.style.filter = 'brightness(1.1)';
    else e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
  };
  const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
    if (btn.primary) e.currentTarget.style.filter = 'brightness(1)';
    else e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
  };

  if (btn.external) {
    return (
      <a
        href={btn.href}
        target="_blank"
        rel="noopener noreferrer"
        style={base}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        {btn.label}
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={btn.href} style={base} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {btn.label}
    </Link>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function HomePage() {
  const heroRef = useRef(null);
  const [email, setEmail] = useState('');

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    // Restarts the timer whenever a dot is clicked, so a manual choice isn't skipped straight away
    const id = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), HERO_INTERVAL_MS);
    return () => clearInterval(id);
  }, [slide]);

  const current = HERO_SLIDES[slide];

  // 🟢 FETCH 3 MOST RECENT PUBLISHED STORIES FROM BACKEND
  const { data: rawStoriesData, isLoading: storiesLoading } = useSWR(
    'public-published-stories-home',
    () => blogsApi.getPublicBlogs({ page: 1, limit: 3 }),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const publishedStories: (BlogPost & { category?: string; summary?: string })[] = Array.isArray(rawStoriesData)
    ? rawStoriesData.slice(0, 3)
    : Array.isArray(rawStoriesData?.data)
    ? rawStoriesData.data.slice(0, 3)
    : Array.isArray(rawStoriesData?.docs)
    ? rawStoriesData.docs.slice(0, 3)
    : [];

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
          justify-content: flex-start;
          overflow: hidden;
          background: var(--navy);
          padding: 0 3rem 0 4rem;
        }
        .bc-hero-inner {
          position: relative;
          z-index: 4;
          max-width: 640px;
          margin: 0;
          padding: 7rem 0 9rem;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .bc-hero-h1 {
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 800;
          line-height: 1.05;
          color: var(--white);
        }
        .bc-hero-h1 em { font-style: normal; color: #fff; }

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
          height: 100%;
          display: flex;
          flex-direction: column;
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
          .bc-hero { padding: 0 1.5rem; }
          .bc-hero-inner { padding: 5rem 0 7rem; }
        }
      `}</style>

      {/* ════════ HERO (2 sliding slides: BioCap + RABP-CMP) ════════ */}
      <section className="bc-hero" ref={heroRef}>
        <div className="bc-hero-bg" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {HERO_SLIDES.map((s, i) => (
            <div
              key={s.key}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${s.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: HERO_IMAGE_POSITION,
                backgroundRepeat: 'no-repeat',
                opacity: i === slide ? 1 : 0,
                transition: 'opacity 1.4s ease',
              }}
            />
          ))}
        </div>

        {/* Colour overlay per slide: navy for BioCap, green for RABP-CMP */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.key}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              background: s.overlay,
              opacity: i === slide ? 1 : 0,
              transition: 'opacity 1.4s ease',
            }}
          />
        ))}

        <div className="bc-hero-inner">
          {/* key={current.key} remounts this block so the text animates in on every slide change */}
          <motion.div
            key={current.key}
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            {current.key === 'cmp' ? (
              <motion.p
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-[#FFD600]/40 bg-white/10 px-4 py-2 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase text-[#FFD600] mb-5 backdrop-blur-sm"
              >
                <Star size={14} fill="#FFD600" aria-hidden="true" />
                {current.badge}
              </motion.p>
            ) : (
              <motion.p
                variants={fadeUp}
                className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-3 drop-shadow-md"
              >
                {current.badge}
              </motion.p>
            )}

            <motion.h1
              variants={fadeUp}
              className={
                current.key === 'cmp'
                  ? 'text-4xl lg:text-5xl font-sans font-extrabold text-white leading-tight mb-5 drop-shadow-lg'
                  : 'text-5xl lg:text-6xl font-serif text-white leading-tight mb-4 italic drop-shadow-lg'
              }
            >
              {current.title}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-white/90 text-lg max-w-xl leading-relaxed font-medium drop-shadow-md"
            >
              {current.body}
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              {current.buttons.map((btn) => (
                <HeroLink key={btn.label} btn={btn} />
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.key}
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
              {publishedStories.length > 0
                ? publishedStories.map(s => s.title).join(' \u2022 ')
                : 'Rwanda BioCap Project \u2022 Agricultural Innovation \u2022 Crop Stewardship'} &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ════════ STATS ════════ */}
      <section style={{ padding: '3rem 2.5rem', background: 'var(--off)' }}>
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
      <section style={{ padding: '3.5rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto 2.5rem' }}>
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
                <div className="bc-feature-icon">
                  <Icon size={20} color="#fff" strokeWidth={SW} />
                </div>
                <h3 style={{ fontSize: '1.0rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, textAlign: 'justify', marginBottom: '1.5rem' }}>
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
      <Section className="bc-crops" dark style={{ padding: '3.5rem 2.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>
              Science Driving Food Security
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
              Enhanced Varieties <br />
              <span style={{ color: COLORS.pink }}>Real Results.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: '1.5rem', lineHeight: 1.7, maxWidth: '380px' }}>
              Empowering Rwandan scientists with advanced biotechnology to develop resilient crop varieties that 
              improve farmer livelihoods and agricultural sustainability.
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

      {/* ════════ DYNAMIC LATEST NEWS ════════ */}
      <section style={{ padding: '3.5rem 2.5rem', background: 'var(--off)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ color: COLORS.pink, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Press & Research
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, marginTop: '0.5rem' }}>
              Latest Insights
            </h2>
          </div>

          {/* 🟢 DIRECT LINK TO PUBLISHED NEWS SECTION */}
          <Link href="/Stewardship-News#published-news" style={{ color: COLORS.pink, fontWeight: 700, textDecoration: 'none', borderBottom: `2px solid ${COLORS.pink}`, paddingBottom: '2px', fontSize: '0.9rem' }}>
            View Archive
          </Link>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {storiesLoading && !rawStoriesData ? (
            <>
              <div style={{ height: '360px', borderRadius: '20px', background: '#e2e8f0' }} className="animate-pulse" />
              <div style={{ height: '360px', borderRadius: '20px', background: '#e2e8f0' }} className="animate-pulse" />
              <div style={{ height: '360px', borderRadius: '20px', background: '#e2e8f0' }} className="animate-pulse" />
            </>
          ) : publishedStories.length === 0 ? (
            <p style={{ color: COLORS.gray, fontSize: '0.9rem' }}>No published stories are available yet.</p>
          ) : (
            publishedStories.map((story, i) => {
              const cardCoverUrl = getOptimizedImageUrl(story.img, 800);
              const tagLabel = story.tag || story.category || 'General';
              const formattedDate = story.publishedAt
                ? new Date(story.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                : story.createdAt
                ? new Date(story.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                : '';

              return (
                <Link key={story._id} href={`/Stewardship-News/${story.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <motion.div
                    className="bc-news-card"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    custom={i}
                  >
                    <div style={{ height: '220px', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
                      {cardCoverUrl ? (
                        <img 
                          src={cardCoverUrl} 
                          alt={story.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#cbd5e1' }} />
                      )}

                      {/* Floating Overlay Category Badge */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                        <span style={{ 
                          display: 'inline-block', 
                          background: 'rgba(255,255,255,0.95)', 
                          backdropFilter: 'blur(8px)',
                          padding: '4px 10px', 
                          fontSize: '0.65rem', 
                          fontWeight: 800, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.1em',
                          color: '#2F8F5B',
                          borderRadius: '8px',
                          border: '1px solid rgba(226,232,240,0.8)'
                        }}>
                          {tagLabel}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {formattedDate && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ color: COLORS.gray, fontSize: '0.75rem' }}>{formattedDate}</span>
                        </div>
                      )}
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.75rem', color: COLORS.navy }}>
                        {story.title}
                      </h3>
                      {/* 🟢 ADDED JUSTIFIED TEXT ALIGNMENT */}
                      <p style={{ 
                        fontSize: '0.87rem', 
                        color: COLORS.gray, 
                        lineHeight: 1.6, 
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden' 
                      }}>
                        {story.excerpt || story.summary || 'No summary provided.'}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ════════ NEWSLETTER ════════ */}
      <section style={{ padding: '3.5rem 2.5rem 0', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', paddingBottom: '3.5rem' }}>
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
      <Footer />
    </div>
  );
}