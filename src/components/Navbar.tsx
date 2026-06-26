'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const navLinks = [
  { href: '/',            label: 'Home'          },
  {
    href: '/About',
    label: 'About',
    dropdown: [
      { href: '/About',      label: 'About'  },
      { href: '/Objectives', label: 'Objectives'    },
    ],
  },
  { href: '/Biotech',     label: 'Biotechnology' },
  // { href: '/Milestones',  label: 'Milestones'    },
  { href: '/Stewardship-News', label: 'Stewardship News'   },
  { href: '/Gallery',     label: 'Gallery'       },
  { href: '/Dna-week',    label: 'Resource'      },
];

export default function Navbar() {
  const pathname   = usePathname();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [dropOpen, setDropOpen]       = useState(false);
  const [mobAboutOpen, setMobAboutOpen] = useState(false);
  const dropRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); setMobAboutOpen(false); }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAboutActive = pathname === '/About' || pathname === '/Objectives';

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
          border: 1.5px solid rgba(238,242,248,0.6);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
        }
        .bc-logo:hover .bc-logo-img-wrap {
          transform: rotate(-6deg) scale(1.08);
          box-shadow: 0 4px 16px rgba(233,30,99,0.20);
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

        .bc-link-item a,
        .bc-drop-trigger {
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
          gap: 0.3rem;
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
        }

        /* shared underline for both regular links and the trigger */
        .bc-link-item a::after,
        .bc-drop-trigger::after {
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
        .bc-link-item a:hover,
        .bc-drop-trigger:hover         { color: var(--navy); }
        .bc-link-item a:hover::after,
        .bc-link-item a.active::after,
        .bc-drop-trigger:hover::after,
        .bc-drop-trigger.active::after { transform: translateX(-50%) scaleX(1); }
        .bc-link-item a.active,
        .bc-drop-trigger.active        { color: var(--navy); }

        /* chevron icon inside trigger */
        .bc-chevron {
          width: 10px;
          height: 10px;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .bc-chevron.open { transform: rotate(180deg); }

        /* ── Dropdown panel ─────────────────────────────── */
        .bc-drop-wrap {
          position: relative;
        }
        .bc-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(-6px);
          min-width: 180px;
          background: #ffffff;
          border: 1.5px solid rgba(26,54,93,0.08);
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(26,54,93,0.13);
          padding: 0.4rem;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4,0,0.2,1);
          z-index: 100;
        }
        .bc-dropdown.open {
          opacity: 1;
          pointer-events: all;
          transform: translateX(-50%) translateY(0);
        }
        /* small arrow tip */
        .bc-dropdown::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-left: 1.5px solid rgba(26,54,93,0.08);
          border-top: 1.5px solid rgba(26,54,93,0.08);
          border-radius: 2px 0 0 0;
        }
        .bc-dropdown a {
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          border-radius: 9px;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .bc-dropdown a:hover  { color: var(--navy); background: var(--gray-light); }
        .bc-dropdown a.active { color: var(--pink);  background: #fde8ef; }
        .bc-drop-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
          opacity: 0.5;
        }
        .bc-dropdown a.active .bc-drop-dot { opacity: 1; }

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
        .bc-ham.open .bc-bar-mid         { opacity: 0; transform: scaleX(0); }
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
        .bc-mob-links li a,
        .bc-mob-trigger {
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
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
        }
        .bc-mob-links li a:hover,
        .bc-mob-links li a.active,
        .bc-mob-trigger:hover,
        .bc-mob-trigger.active { color: var(--navy); background: var(--gray-light); }
        .bc-mob-links li a.active,
        .bc-mob-trigger.active  { color: var(--pink); }
        .bc-mob-arrow { opacity: 0; transform: translateX(-6px); transition: all 0.2s; font-size: 0.8rem; }
        .bc-mob-links li a:hover .bc-mob-arrow,
        .bc-mob-links li a.active .bc-mob-arrow { opacity: 1; transform: translateX(0); }

        /* mobile sub-items */
        .bc-mob-sub {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .bc-mob-sub.open { max-height: 200px; }
        .bc-mob-sub-inner {
          padding: 0.25rem 0 0.25rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .bc-mob-sub-inner a {
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          border-left: 2px solid rgba(26,54,93,0.08);
          transition: all 0.2s;
        }
        .bc-mob-sub-inner a:hover  { color: var(--navy); background: var(--gray-light); border-left-color: var(--navy); }
        .bc-mob-sub-inner a.active { color: var(--pink); background: #fde8ef; border-left-color: var(--pink); }
        .bc-mob-chevron {
          width: 12px;
          height: 12px;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          flex-shrink: 0;
        }
        .bc-mob-chevron.open { transform: rotate(180deg); }

        @media (max-width: 768px) {
          .bc-links { display: none; }
          .bc-ham   { display: flex; }
          .bc-nav-inner { padding: 0 1.25rem; }
        }
      `}</style>

      <nav className={`bc-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="bc-nav-inner">

          {/* Logo */}
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

          {/* Desktop nav */}
          <ul className="bc-links">
            {navLinks.map(({ href, label, dropdown }) =>
              dropdown ? (
                /* ── About with dropdown ── */
                <li key={href} className="bc-link-item bc-drop-wrap" ref={dropRef}>
                  <button
                    className={`bc-drop-trigger${isAboutActive ? ' active' : ''}`}
                    onClick={() => setDropOpen(o => !o)}
                    aria-haspopup="true"
                    aria-expanded={dropOpen}
                  >
                    {label}
                    <svg className={`bc-chevron${dropOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div className={`bc-dropdown${dropOpen ? ' open' : ''}`}>
                    {dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? 'active' : ''}
                      >
                        <span className="bc-drop-dot" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </li>
              ) : (
                /* ── Regular link ── */
                <li key={href} className="bc-link-item">
                  <Link href={href} className={pathname === href ? 'active' : ''}>
                    {label}
                  </Link>
                </li>
              )
            )}
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

      {/* Mobile drawer */}
      <div className={`bc-drawer${menuOpen ? ' open' : ''}`}>
        <ul className="bc-mob-links">
          {navLinks.map(({ href, label, dropdown }) =>
            dropdown ? (
              /* ── About accordion ── */
              <li key={href}>
                <button
                  className={`bc-mob-trigger${isAboutActive ? ' active' : ''}`}
                  onClick={() => setMobAboutOpen(o => !o)}
                >
                  <span>{label}</span>
                  <svg className={`bc-mob-chevron${mobAboutOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`bc-mob-sub${mobAboutOpen ? ' open' : ''}`}>
                  <div className="bc-mob-sub-inner">
                    {dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? 'active' : ''}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ) : (
              /* ── Regular mobile link ── */
              <li key={href}>
                <Link href={href} className={pathname === href ? 'active' : ''}>
                  {label}
                  <span className="bc-mob-arrow">→</span>
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </>
  );
}