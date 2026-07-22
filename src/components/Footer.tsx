'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, X } from 'lucide-react';

const COLORS = {
  pink: '#e8185e',
  navy: '#1a3a5c',
};

const QUICK_LINKS = [
  { label: 'Home',            href: '/'            },
  { label: 'About Us',        href: '/About'       },
  { label: 'Biotechnology',   href: '/Biotech'     },
  { label: 'Stewardship News', href: '/Stewardship-News' },
  { label: 'Gallery',        href: '/Gallery'      },
  { label: 'Resource',       href: '/Resource'     },
  { 
    label: 'Dashboard', 
    href: '/auth/login',
    target: '_blank',
    rel: 'noopener noreferrer'
  }
];

const RECENT_NEWS_FOOTER = [
  { date: 'June 16-17, 2026', title: 'Risk Assessment & Stewardship', href: '/Stewardship-News?project=risk-assessment-stewardship' },
  { date: 'June 16-17, 2026',  title: 'Communication & Advocacy',        href: '/Stewardship-News?project=communication-advocacy' },
  { date: 'May 06, 2026', title: 'DNA Week',        href: '/Stewardship-News?project=dna-week' },
];

const CONTACT_ITEMS = [
  { icon: Phone,   text: '+250 733 389 450' },
  { icon: Mail,    text: 'bellancile.uzayisenga@rab.gov.rw' },
  { icon: MapPin, text: 'GQ9C+JX8, Ruhashya' },
];

// Inline SVG for LinkedIn since lucide-react v1.16.0 doesn't include it
function LinkedInIcon({ size = 15, strokeWidth = 1.75 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: X,            href: 'https://x.com/RwandaBioCap' },
  { icon: LinkedInIcon,  href: 'https://www.linkedin.com/company/rwanda-biocap-progam/' },
];

export default function Footer() {
  const [footerEmail, setFooterEmail] = useState('');

  return (
    <>
      <style>{`
        .bc-footer {
          background: #1a3a5c;
          color: #fff;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .bc-footer-wave {
          line-height: 0;
          overflow: hidden;
        }
        .bc-footer-grid {
          max-width: 1240px;
          margin: 0 auto;
          padding: 4rem 2.5rem 3rem;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3rem;
        }
        .bc-footer-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e8185e;
          display: inline-block;
        }
        .bc-footer-link {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: color 0.2s;
        }
        .bc-footer-link:hover { color: #e8185e; }
        .bc-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 1.25rem 2.5rem;
          text-align: center;
          color: rgba(255,255,255,0.3);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .bc-footer-social {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .bc-footer-social:hover { background: #e8185e; color: #fff; }
        .bc-footer-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: #fff;
          font-size: 0.85rem;
          outline: none;
          font-family: 'DM Sans', sans-serif;
        }
        .bc-footer-input::placeholder { color: rgba(255,255,255,0.4); }
        @media (max-width: 1024px) {
          .bc-footer-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .bc-footer-grid { grid-template-columns: 1fr; gap: 2rem; padding: 3rem 1.5rem 2rem; }
        }
      `}</style>

      <footer className="bc-footer">

        {/* Wave */}
        <div className="bc-footer-wave">
          <svg
            viewBox="0 0 1200 70"
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: '70px' }}
          >
            <path
              d="M0,0V28c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,8,1113,28,1200,34V0Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* 4-Column Grid */}
        <div className="bc-footer-grid">

          {/* Col 1: Brand + Newsletter */}
          <div>
            <div style={{
              fontFamily: 'sans-serif',
              fontSize: '1.1rem',
              fontWeight: 800,
              marginBottom: '1rem',
              letterSpacing: '0.5px',
            }}>
              <span style={{ color: '#fff' }}>Rwanda </span>
              <span style={{ color: COLORS.pink }}>BioCap Project</span>
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.88rem',
              lineHeight: 1.75,
              marginBottom: '1.8rem',
              maxWidth: '240px',
            }}>
              Building Rwandan capacity for crop development, deregulation, and deployment of enhanced crops for food security.
            </p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="email"
                placeholder="Email address"
                className="bc-footer-input"
                value={footerEmail}
                onChange={e => setFooterEmail(e.target.value)}
                suppressHydrationWarning
              />
              <button
                style={{
                  background: COLORS.pink,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 1rem',
                  cursor: 'pointer',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  flexShrink: 0,
                  transition: 'filter 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
                suppressHydrationWarning
              >
                →
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <div className="bc-footer-heading">Quick Links</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {QUICK_LINKS.map(l => (
                <li key={l.href}>
                  {/* UPDATED: Added target and rel props dynamically to Next.js <Link> so items with target='_blank' open in a new tab */}
                  <Link 
                    href={l.href} 
                    target={l.target} 
                    rel={l.rel} 
                    className="bc-footer-link"
                  >
                    <span style={{ color: COLORS.pink, fontSize: '0.7rem' }}>→</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Recent News */}
          <div>
            <div className="bc-footer-heading">Recent News</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {RECENT_NEWS_FOOTER.map((n, i) => (
                <div key={i}>
                  <span style={{
                    color: COLORS.pink,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '0.3rem',
                  }}>
                    {n.date}
                  </span>
                  <Link
                    href={n.href}
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      lineHeight: 1.55,
                      display: 'block',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  >
                    {n.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Col 4: Contact Us */}
          <div>
            <div className="bc-footer-heading">Contact Us</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {CONTACT_ITEMS.map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    style={{ color: COLORS.pink, marginTop: '2px', flexShrink: 0 }}
                  />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} target="_blank"
      rel="noopener noreferrer" className="bc-footer-social">
                  <Icon size={15} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bc-footer-bottom">
          © 2026 BioCap Rwanda &nbsp;•&nbsp; All Rights Reserved
        </div>
      </footer>
    </>
  );
}