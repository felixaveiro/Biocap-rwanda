'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/About', label: 'About' },
  { href: '/Biotech', label: 'Biotechnology' },
  { href: '/Environment', label: 'Environment' },
  { href: '/Gallery', label: 'Gallery ' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --navy: #1a365d;
          --navy-dark: #0f2240;
          --pink: #e91e63;
          --pink-light: #ff4d8b;
          --white: #ffffff;
          --gray-light: #f4f6fa;
        }

        .biocap-nav {
          font-family: 'Syne', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.97);
          border-bottom: 1.5px solid rgba(26, 54, 93, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .biocap-nav.scrolled {
          box-shadow: 0 4px 32px rgba(26, 54, 93, 0.10);
          background: rgba(255, 255, 255, 0.99);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2.5rem;
          height: 70px;
        }

        /* Logo */
        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          position: relative;
        }

        .logo-bio {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--navy);
          letter-spacing: -0.04em;
          line-height: 1;
          transition: color 0.2s;
        }

        .logo-cap {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--pink);
          letter-spacing: -0.04em;
          line-height: 1;
          transition: color 0.2s;
        }

        .logo-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--pink);
          margin-left: 3px;
          margin-bottom: 14px;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s;
        }

        .logo-link:hover .logo-dot {
          transform: scale(1.5) translateY(-2px);
          background: var(--navy);
        }

        /* Desktop Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link-item a {
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          padding: 0.5rem 0.85rem;
          border-radius: 8px;
          position: relative;
          transition: color 0.2s ease;
          display: inline-flex;
          align-items: center;
        }

        .nav-link-item a::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: calc(100% - 1.4rem);
          height: 2px;
          background: var(--pink);
          border-radius: 99px;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }

        .nav-link-item a:hover {
          color: var(--navy);
        }

        .nav-link-item a:hover::after,
        .nav-link-item a.active::after {
          transform: translateX(-50%) scaleX(1);
        }

        .nav-link-item a.active {
          color: var(--navy);
        }

        /* CTA Button */
        .dna-btn {
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
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 0.5rem;
          border: 2px solid transparent;
          white-space: nowrap;
        }

        .dna-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--pink);
          transform: translateX(-102%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: inherit;
        }

        .dna-btn:hover::before {
          transform: translateX(0);
        }

        .dna-btn:hover {
          border-color: var(--pink);
          box-shadow: 0 4px 18px rgba(233, 30, 99, 0.28);
        }

        .dna-btn span, .dna-btn svg {
          position: relative;
          z-index: 1;
        }

        .dna-btn::after {
          display: none;
        }

        /* Helix icon */
        .helix-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        /* Hamburger */
        .hamburger-btn {
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

        .hamburger-btn:hover {
          background: var(--gray-light);
        }

        .bar {
          display: block;
          width: 22px;
          height: 2px;
          border-radius: 2px;
          background: var(--navy);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s, width 0.3s;
          transform-origin: center;
        }

        .bar-mid {
          width: 16px;
        }

        .hamburger-btn.open .bar:first-child {
          transform: translateY(7px) rotate(45deg);
          width: 22px;
        }

        .hamburger-btn.open .bar-mid {
          opacity: 0;
          transform: scaleX(0);
        }

        .hamburger-btn.open .bar:last-child {
          transform: translateY(-7px) rotate(-45deg);
          width: 22px;
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.99);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 1.25rem 2rem 1.75rem;
          border-bottom: 1.5px solid rgba(26, 54, 93, 0.08);
          box-shadow: 0 16px 40px rgba(26, 54, 93, 0.1);
          transform: translateY(-110%);
          opacity: 0;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
          pointer-events: none;
          z-index: 999;
        }

        .mobile-drawer.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: all;
        }

        .mobile-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mobile-link-item a {
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
          padding: 0.75rem 0.75rem;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .mobile-link-item a:hover,
        .mobile-link-item a.active {
          color: var(--navy);
          background: var(--gray-light);
        }

        .mobile-link-item a.active {
          color: var(--pink);
        }

        .mobile-arrow {
          opacity: 0;
          transform: translateX(-6px);
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .mobile-link-item a:hover .mobile-arrow,
        .mobile-link-item a.active .mobile-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .mobile-divider {
          height: 1px;
          background: rgba(26, 54, 93, 0.07);
          margin: 0.75rem 0;
        }

        .mobile-dna-btn {
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
          transition: all 0.25s ease;
          box-shadow: 0 2px 12px rgba(26, 54, 93, 0.2);
        }

        .mobile-dna-btn:hover {
          background: linear-gradient(135deg, var(--pink), var(--pink-light));
          box-shadow: 0 4px 18px rgba(233, 30, 99, 0.3);
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hamburger-btn { display: flex; }
          .nav-inner { padding: 0 1.25rem; }
        }
      `}</style>

      <nav className={`biocap-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          
          <Link href="/" className="logo-link">
            <span className="logo-bio">Bio</span>
            <span className="logo-cap">Cap</span>
            <span className="logo-dot" />
          </Link>

          
          <ul className="nav-links">
            {navLinks.map(({ href, label }) => (
              <li key={href} className="nav-link-item">
                <Link href={href} className={pathname === href ? 'active' : ''}>
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/Dna-week" className="dna-btn">
                <svg className="helix-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M4 4c4 2 8 2 12 0" />
                  <path d="M4 20c4-2 8-2 12 0" />
                  <path d="M4 4c0 8 16 8 16 16" />
                  <path d="M20 4C20 12 4 12 4 20" />
                </svg>
                <span>Resource</span>
              </Link>
            </li>
          </ul>

         
          <button
            className={`hamburger-btn${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="bar" />
            <span className="bar bar-mid" />
            <span className="bar" />
          </button>
        </div>
      </nav>

     
      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`}>
        <ul className="mobile-links">
          {navLinks.map(({ href, label }) => (
            <li key={href} className="mobile-link-item">
              <Link href={href} className={pathname === href ? 'active' : ''}>
                {label}
                <span className="mobile-arrow">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mobile-divider" />
        <Link href="/Dna-week" className="mobile-dna-btn">
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