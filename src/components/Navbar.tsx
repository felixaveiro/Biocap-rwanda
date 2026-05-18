'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/',            label: 'Home'          },
  { href: '/About',       label: 'About'         },
  { href: '/Objectives',  label: 'Objectives'    },
  { href: '/Biotech',     label: 'Biotechnology' },
  { href: '/Milestones', label: 'Milestones'   },
  { href: '/Environment', label: 'Environment'   },
  { href: '/Gallery',     label: 'Gallery'       },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --navy:       #1a365d;
          --navy-dark:  #0f2240;
          --pink:       #e91e63;
          --pink-light: #ff4d8b;
          --white:      #ffffff;
          --gray-light: #f4f6fa;
        }

        /* ── Nav shell ─────────────────────────────────── */
        .bc-nav {
          font-family: 'Syne', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255,255,255,0.97);
          border-bottom: 1.5px solid rgba(26,54,93,0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: box-shadow 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .bc-nav.scrolled {
          box-shadow: 0 4px 32px rgba(26,54,93,0.10);
        }

        .bc-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5rem;
          height: 70px;
        }

        /* ── Logo ──────────────────────────────────────── */
        .bc-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bc-logo-img-wrap {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f0f4fa;
          border: 1.5px solid rgba(238, 242, 248, 0.6);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
        }
        .bc-logo:hover .bc-logo-img-wrap {
          transform: rotate(-6deg) scale(1.08);
          box-shadow: 0 4px 16px rgba(233,30,99,0.20);
        }

        .bc-logo-text {
          display: flex;
          align-items: center;
          line-height: 1;
        }
        .bc-bio {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--navy);
          letter-spacing: -0.04em;
          transition: color 0.2s;
        }
        .bc-cap {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--pink);
          letter-spacing: -0.04em;
        }
        .bc-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--pink);
          margin-left: 3px;
          margin-bottom: 14px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.2s;
        }
        .bc-logo:hover .bc-dot {
          transform: scale(1.6) translateY(-2px);
          background: var(--navy);
        }

        /* ── Desktop links ─────────────────────────────── */
        .bc-links {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .bc-link-item a {
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          padding: 0.5rem 0.9rem;
          border-radius: 8px;
          position: relative;
          display: inline-flex;
          align-items: center;
          transition: color 0.2s;
        }
        .bc-link-item a::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: calc(100% - 1.6rem);
          height: 2px;
          background: var(--pink);
          border-radius: 99px;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          transform-origin: center;
        }
        .bc-link-item a:hover        { color: var(--navy); }
        .bc-link-item a:hover::after,
        .bc-link-item a.active::after { transform: translateX(-50%) scaleX(1); }
        .bc-link-item a.active        { color: var(--navy); }

        /* ── CTA button ────────────────────────────────── */
        .bc-cta {
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--white) !important;
          background: var(--navy);
          padding: 0.6rem 1.3rem;
          border-radius: 99px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.28s, box-shadow 0.28s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 0.5rem;
          border: 2px solid transparent;
          white-space: nowrap;
        }
        .bc-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--pink);
          transform: translateX(-102%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          border-radius: inherit;
        }
        .bc-cta:hover::before { transform: translateX(0); }
        .bc-cta:hover {
          border-color: var(--pink);
          box-shadow: 0 4px 18px rgba(233,30,99,0.28);
        }
        .bc-cta span, .bc-cta svg { position: relative; z-index: 1; }
        .bc-cta::after { display: none; }

        /* ── Hamburger ─────────────────────────────────── */
        .bc-ham {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 8px;
          color: var(--navy);
          transition: background 0.2s;
          flex-direction: column;
          gap: 5px;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }
        .bc-ham:hover { background: var(--gray-light); }
        .bc-bar {
          display: block;
          width: 22px;
          height: 2px;
          border-radius: 2px;
          background: var(--navy);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s, width 0.3s;
          transform-origin: center;
        }
        .bc-bar-mid { width: 16px; }
        .bc-ham.open .bc-bar:first-child { transform: translateY(7px) rotate(45deg); width: 22px; }
        .bc-ham.open .bc-bar-mid { opacity: 0; transform: scaleX(0); }
        .bc-ham.open .bc-bar:last-child  { transform: translateY(-7px) rotate(-45deg); width: 22px; }

        /* ── Mobile drawer ─────────────────────────────── */
        .bc-drawer {
          position: fixed;
          top: 70px;
          left: 0; right: 0;
          background: rgba(255,255,255,0.99);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 1.25rem 2rem 1.75rem;
          border-bottom: 1.5px solid rgba(26,54,93,0.08);
          box-shadow: 0 16px 40px rgba(26,54,93,0.10);
          transform: translateY(-110%);
          opacity: 0;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s;
          pointer-events: none;
          z-index: 999;
        }
        .bc-drawer.open { transform: translateY(0); opacity: 1; pointer-events: all; }

        .bc-mob-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
        .bc-mob-links li a {
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .bc-mob-links li a:hover,
        .bc-mob-links li a.active { color: var(--navy); background: var(--gray-light); }
        .bc-mob-links li a.active  { color: var(--pink); }
        .bc-mob-arrow { opacity: 0; transform: translateX(-6px); transition: all 0.2s; font-size: 0.8rem; }
        .bc-mob-links li a:hover .bc-mob-arrow,
        .bc-mob-links li a.active .bc-mob-arrow { opacity: 1; transform: translateX(0); }
        .bc-divider { height: 1px; background: rgba(26,54,93,0.07); margin: 0.75rem 0; }
        .bc-mob-cta {
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--white);
          background: linear-gradient(135deg, var(--navy), var(--navy-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem;
          border-radius: 12px;
          transition: all 0.25s;
          box-shadow: 0 2px 12px rgba(26,54,93,0.20);
        }
        .bc-mob-cta:hover {
          background: linear-gradient(135deg, var(--pink), var(--pink-light));
          box-shadow: 0 4px 18px rgba(233,30,99,0.30);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .bc-links { display: none; }
          .bc-ham   { display: flex; }
          .bc-nav-inner { padding: 0 1.25rem; }
        }
      `}</style>

      
      <nav className={`bc-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="bc-nav-inner">

          
          <Link href="/" className="bc-logo">
            <div className="bc-logo-img-wrap">
              <Image
                src="/image/biocap-logo.png"
                alt="BioCap Logo"
                fill
                style={{ objectFit: 'contain' }}
                sizes="35px"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className="bc-links">
            {navLinks.map(({ href, label }) => (
              <li key={href} className="bc-link-item">
                <Link href={href} className={pathname === href ? 'active' : ''}>
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/Dna-week" className="bc-cta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M4 4c4 2 8 2 12 0" />
                  <path d="M4 20c4-2 8-2 12 0" />
                  <path d="M4 4c0 8 16 8 16 16" />
                  <path d="M20 4C20 12 4 12 4 20" />
                </svg>
                <span>Resource</span>
              </Link>
            </li>
          </ul>

          {/* Hamburger */}
          <button
            className={`bc-ham${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className="bc-bar" />
            <span className="bc-bar bc-bar-mid" />
            <span className="bc-bar" />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      <div className={`bc-drawer${menuOpen ? ' open' : ''}`}>
        <ul className="bc-mob-links">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={pathname === href ? 'active' : ''}>
                {label}
                <span className="bc-mob-arrow">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="bc-divider" />
        <Link href="/Dna-week" className="bc-mob-cta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 4c4 2 8 2 12 0" />
            <path d="M4 20c4-2 8-2 12 0" />
            <path d="M4 4c0 8 16 8 16 16" />
            <path d="M20 4C20 12 4 12 4 20" />
          </svg>
          DNA Week
        </Link>
      </div>
    </>
  );
}