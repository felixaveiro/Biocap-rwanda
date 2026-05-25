'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ExternalLink,
  Search,
  Images,
  Microscope,
  Leaf,
  Users,
  FlaskConical,
  FolderOpen,
} from 'lucide-react';

type Category = 'all' | 'field' | 'lab' | 'community' | 'crops';

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  caption: string;
  category: Category;
  href: string;
  itemCount: number;
  date: string;
  tall?: boolean;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: '/image/DSC_6501.JPG',
    alt: 'Huye confined field trial',
    title: 'HUYE Confined Field Trial',
    caption: 'Confined field trial evaluations at Huye research station.',
    category: 'field',
    href: 'https://biotechnology.pixieset.com/huyeconfinedfildtrialsitecasavaandmaize/',
    itemCount: 342,
    date: 'Mar 17, 2026',
    tall: true,
  },
  {
    id: 2,
    src: '/image/ofab.jpeg',
    alt: 'Impact of OFAB',
    title: 'The Impact of OFAB',
    caption: 'Open Forum on Agricultural Biotechnology outcomes and highlights.',
    category: 'community',
    href: 'https://biotechnology.pixieset.com/theimpactofofabformediaandinfruencersday2/',
    itemCount: 17,
    date: 'May 20, 2026',
  },
  {
    id: 3,
    src: '/image/image-03.jpg',
    alt: 'Impact of OFAB media',
    title: 'OFAB Media Coverage',
    caption: 'Media and stakeholder engagement from the OFAB forum.',
    category: 'community',
    href: 'https://biotechnology.pixieset.com/theimpactofofabformediaandinfruencers/',
    itemCount: 112,
    date: 'May 19, 2026',
    tall: true,
  },
  {
    id: 4,
    src: '/image/image-04.jpg',
    alt: 'DNA Day',
    title: 'DNA Day',
    caption: 'Celebrating DNA Day with scientists, students and the public.',
    category: 'lab',
    href: 'https://biotechnology.pixieset.com/dnaday/',
    itemCount: 214,
    date: 'May 6, 2026',
  },
];

const CATEGORIES: { key: Category; label: string; Icon: React.ElementType }[] = [
  { key: 'all',       label: 'All Collections', Icon: Images       },
  { key: 'field',     label: 'Field Work',       Icon: Leaf         },
  { key: 'lab',       label: 'Laboratory',       Icon: Microscope   },
  { key: 'community', label: 'Community',        Icon: Users        },
  { key: 'crops',     label: 'Crops',            Icon: FlaskConical },
];

// ─── Collection Card ───────────────────────────────────────────────
function CollectionCard({ item }: { item: GalleryItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        cursor: 'pointer',
        gridRow: item.tall ? 'span 2' : 'span 1',
        background: '#ddd',
        display: 'block',
        textDecoration: 'none',
        boxShadow: hovered
          ? '0 16px 48px rgba(30,77,107,0.26)'
          : '0 2px 14px rgba(30,77,107,0.09)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease',
      }}
    >
      {/* Cover image */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: item.tall ? '420px' : '200px',
      }}>
        <Image
          src={item.src}
          alt={item.alt}
          fill
          style={{
            objectFit: 'cover',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Always-visible bottom gradient + info */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(10,20,38,0.92) 0%, rgba(10,20,38,0.35) 50%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '1.1rem',
      }}>
        <div style={{
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'transform 0.3s ease',
        }}>
          {/* Title */}
          <p style={{
            margin: '0 0 5px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.92rem',
            fontFamily: 'Syne, sans-serif',
            lineHeight: 1.3,
          }}>
            {item.title}
          </p>

          {/* Meta row: item count + date */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.72rem',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
            }}>
              <FolderOpen size={11} />
              {item.itemCount} items
            </span>
            <span style={{
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              flexShrink: 0,
            }} />
            <span style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.72rem',
              fontFamily: 'Syne, sans-serif',
            }}>
              {item.date}
            </span>
          </div>
        </div>
      </div>

      {/* Top-right: open external icon (shows on hover) */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        background: hovered ? '#E8185A' : 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '50%',
        width: 34,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'scale(1)' : 'scale(0.7)',
        transition: 'opacity 0.25s ease, transform 0.25s ease, background 0.2s ease',
      }}>
        <ExternalLink size={14} />
      </div>

      {/* Category pill */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        left: '0.75rem',
        background: 'rgba(232,24,90,0.85)',
        backdropFilter: 'blur(4px)',
        borderRadius: '999px',
        padding: '2px 10px',
        fontSize: '0.65rem',
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        fontFamily: 'Syne, sans-serif',
      }}>
        {item.category}
      </div>
    </a>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = GALLERY_ITEMS.filter((item) => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.caption.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .gallery-page { font-family: 'DM Sans', sans-serif; background: #F7F4FB; min-height: 100vh; }

        .gallery-hero {
          background: #1E4D6B;
          padding: 3.5rem 2rem 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .gallery-hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: rgba(232,24,90,0.08);
          pointer-events: none;
        }
        .gallery-hero::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -40px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(42,127,140,0.10);
          pointer-events: none;
        }
        .hero-breadcrumb {
          color: #2A7F8C;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0 0 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'Syne', sans-serif;
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          color: #fff;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          margin: 0 0 0.6rem;
          letter-spacing: -0.03em;
        }
        .hero-title span { color: #E8185A; }
        .hero-sub {
          color: rgba(255,255,255,0.6);
          font-size: 0.95rem;
          margin: 0;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }
        .hero-count {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 1.25rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 999px;
          padding: 5px 14px;
          color: rgba(255,255,255,0.7);
          font-size: 0.78rem;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
        }

        .gallery-controls {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 2rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .filter-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .filter-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          border: 1.5px solid rgba(30,77,107,0.15);
          background: #fff;
          color: #64748b;
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-tab:hover { border-color: #1E4D6B; color: #1E4D6B; }
        .filter-tab.active {
          background: #1E4D6B;
          border-color: #1E4D6B;
          color: #fff;
          box-shadow: 0 4px 14px rgba(30,77,107,0.25);
        }

        .search-wrap { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; }
        .search-input {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          padding: 8px 14px 8px 36px;
          border: 1.5px solid rgba(30,77,107,0.15);
          border-radius: 999px;
          background: #fff;
          color: #334155;
          outline: none;
          width: 220px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: #94a3b8; }
        .search-input:focus {
          border-color: #1E4D6B;
          box-shadow: 0 0 0 3px rgba(30,77,107,0.1);
        }

        .gallery-grid-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 2rem 4rem;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 210px;
          gap: 14px;
        }
        @media (max-width: 900px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 180px; }
        }
        @media (max-width: 560px) {
          .gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 220px; }
          .gallery-controls { flex-direction: column; align-items: flex-start; }
          .search-input { width: 100%; }
          .search-wrap { width: 100%; }
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #94a3b8;
          text-align: center;
          gap: 0.75rem;
        }
        .empty-state p { margin: 0; font-size: 0.9rem; }
        .empty-state .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #475569;
        }

        .results-meta {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 1rem;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .results-meta span { color: #E8185A; }
      `}</style>

      <div className="gallery-page">
        {/* Hero */}
        <section className="gallery-hero">
          <p className="hero-breadcrumb">Home › Gallery</p>
          <h1 className="hero-title">Photo <span>Collections</span></h1>
          <p className="hero-sub">
            Documenting Rwanda&apos;s biotech agriculture journey — from laboratory to field to community.
          </p>
          <div className="hero-count">
            <Images size={13} />
            {GALLERY_ITEMS.length} collections
          </div>
        </section>

        {/* Controls */}
        <div className="gallery-controls">
          <div className="filter-tabs">
            {CATEGORIES.map(({ key, label, Icon }) => (
              <button
                key={key}
                className={`filter-tab${activeCategory === key ? ' active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search collections…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="gallery-grid-wrap">
          <p className="results-meta">
            Showing <span>{filtered.length}</span> of {GALLERY_ITEMS.length} collections
          </p>
          <div className="gallery-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <Images size={40} strokeWidth={1.2} />
                <p className="empty-title">No collections found</p>
                <p>Try a different category or search term.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <CollectionCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}