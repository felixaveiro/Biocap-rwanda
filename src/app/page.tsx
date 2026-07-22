'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Variants } from 'framer-motion';
import Footer from '@/components/Footer';

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

const HERO_SLIDES = [
  '/image/IMG_150.jpg',
  '/image/IMG_36.jpg',
  '/image/DSC06556(1).jpg',
];

const FEATURES = [
  {
    Icon: Dna,
    title: 'Precision Biotechnology',
    body: "For centuries, crop improvement has relied on selecting plants with desirable traits and crossing them over many generations. While conventional breeding has transformed global agriculture, it often transfers both desirable ..",
    color: COLORS.purple,
    // Points straight at the Precision Biotechnology article on the
    // Stewardship News page (same route the news cards there use).
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
  { Icon: Building2,  val: '6',  label: 'Partner Institutions'       },
  { Icon: Wheat,     val: '3',    label: 'Crops'         },
];

const CROPS = [
  { name: 'Cassava', pct: 45, tag: 'Virus-Resistance' },
  { name: 'Potato',  pct: 37, tag: 'Late Bright Resistance'       },
  { name: 'Banana',  pct: 21, tag: 'BXW Resistance'        },
];

// Mirrors the ecoProjects data from Stewardship-News.tsx, along with the
// slug map used there, so clicking a card opens that exact project story
// via /Stewardship-News?project=<slug>
const NEWS = [
  {
    tag: 'Sustainability',
    date: '6 May 2026',
    title: 'DNA Week',
    body: "UR-CST and partners marked the third DNA Week with a seminar on biotechnology in agriculture, medicine, and the environment — featuring experts from RBC, RAB, REMA, and BioCAP.",
    img: '/image/image-04.jpg',
    slug: 'dna-week',
  },
  {
    tag: 'Biosafety',
    date: '16–17 June 2026',
    title: 'Risk Assessment & Stewardship',
    body: "A two-day workshop in Kigali strengthened scientists' and regulators' understanding of how biotech crop risks are identified, evaluated, and managed.",
    img: '/image/Risk-ssessment.jpg',
    slug: 'risk-assessment-stewardship',
  },
  {
    tag: 'Public Engagement',
    date: '16–17 June 2026',
    title: 'Communication & Advocacy',
    body: 'Communicators, regulators, and scientists examined how to translate complex biotech science into clear, trustworthy public messaging.',
    img: '/image/dna-communication-advocacy.jpg',
    slug: 'communication-advocacy',
  },
  // {
  //   tag: 'Precision Breeding',
  //   date: '15 December 2026',
  //   title: 'Precision Biotechnology',
  //   body: "Through the Rwanda BioCap Project, Rwanda is building one of Africa's emerging hubs for CRISPR genome editing — protecting farmer-preferred banana varieties like Kamaramasenge and Ijangi from disease while preserving the traits farmers and consumers value most.",
  //   img: '/image/Precision-decision.jpg',
  //   slug: 'precision-biotechnology',
  // },
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
          .bc-hero-bg > div { background-attachment: scroll !important; }
        }
      `}</style>

      {/* ════════ HERO ════════ */}
      <section className="bc-hero" ref={heroRef}>

        {/* Background slideshow — position shifted so faces stay visible,
            image crops from the bottom instead of the top */}
        <div className="bc-hero-bg" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {HERO_SLIDES.map((src, i) => (
            <div
              key={src}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${src}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 15%',
                backgroundAttachment: 'fixed',
                opacity: i === slide ? 1 : 0,
                transition: 'opacity 1.4s ease',
              }}
            />
          ))}
        </div>

        {/* Overlay — matches About page exactly:
            bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: 'linear-gradient(to right, #1B3A5C 0%, rgba(27,58,92,0.85) 55%, transparent 100%)',
          }}
        />

        {/* Copy — same eyebrow / h1 / paragraph classes as About page */}
        <div className="bc-hero-inner">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <motion.p
              variants={fadeUp}
              className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-3 drop-shadow-md"
            >
              Rwanda Agricultural Biotech Initiative
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="text-5xl lg:text-6xl font-serif text-white leading-tight mb-4 italic drop-shadow-lg"
            >
              The Science of <span className="text-[#E8185A]">Rwandan</span> Growth.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-white/90 text-lg max-w-xl leading-relaxed font-medium drop-shadow-md"
            >
              We are unlocking the genetic potential of Rwandan farmer-preferred crops to ensure
              food security and economic prosperity for every farmer across our diversified
              agro-ecological zones.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <Link
                href="/Resource"
                style={{ background: COLORS.pink, color: '#fff', padding: '1rem 2.2rem', borderRadius: '14px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', transition: 'filter 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
              >
                Explore Our Events
              </Link>
              <Link
                href="/About#mission"
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
              {NEWS.map(n => n.title).join(' \u2022 ')} &nbsp;•&nbsp;
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

      {/* ════════ NEWS ════════ */}
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
          <Link href="/Stewardship-News" style={{ color: COLORS.pink, fontWeight: 700, textDecoration: 'none', borderBottom: `2px solid ${COLORS.pink}`, paddingBottom: '2px', fontSize: '0.9rem' }}>
            View Archive
          </Link>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {NEWS.map((n, i) => (
            <Link key={i} href={`/Stewardship-News?project=${n.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div
                className="bc-news-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
              >
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
            </Link>
          ))}
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