'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Images,
  Microscope,
  Leaf,
  Users,
  FlaskConical,
  ZoomIn,
} from 'lucide-react';

// ─── BioCap Brand Tokens ───────────────────────────────────────────
// Navy    : #1E4D6B   Pink/Magenta : #E8185A
// Purple  : #7B3FA0   Teal         : #2A7F8C
// Bg      : #F7F4FB
// ──────────────────────────────────────────────────────────────────

type Category = 'all' | 'field' | 'lab' | 'community' | 'crops';

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  caption: string;
  category: Category;
  /** Tailwind-compatible span class for masonry feel */
  tall?: boolean;
}

// Replace src values with your actual image paths under /public/image/
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: '/image/image-01.jpg',
    alt: 'Field research cassava',
    title: 'Cassava Field Trials',
    caption: 'Researchers evaluating CBSD-resistant cassava lines at RAB Rubona station.',
    category: 'field',
    tall: true,
  },
  {
    id: 2,
    src: '/image/image-02.jpg',
    alt: 'Laboratory DNA analysis',
    title: 'DNA Sequencing Lab',
    caption: 'Molecular characterization of biotech crop lines at the RABP-CMP laboratory.',
    category: 'lab',
  },
  {
    id: 3,
    src: '/image/image-03.jpg',
    alt: 'Farmer training session',
    title: 'Farmer Engagement',
    caption: 'Smallholder farmers learning about biotech potato benefits during a field day.',
    category: 'community',
    tall: true,
  },
  {
    id: 4,
    src: '/image/image-04.jpg',
    alt: 'Potato crop inspection',
    title: 'Late Blight Resistance',
    caption: 'Biotech potato plants showing strong resistance to late blight in highland trials.',
    category: 'crops',
  },
  {
    id: 5,
    src: '/image/image-05.jpg',
    alt: 'Tissue culture lab',
    title: 'Tissue Culture Propagation',
    caption: 'Clean planting material produced through advanced tissue culture techniques.',
    category: 'lab',
  },
  {
    id: 6,
    src: '/image/image-06.jpg',
    alt: 'Banana field evaluation',
    title: 'Banana BXW Trials',
    caption: 'Confined field evaluation of BXW-resistant banana lines across multiple sites.',
    category: 'field',
    tall: true,
  },
  {
    id: 7,
    src: '/image/image-07.jpg',
    alt: 'Community workshop',
    title: 'Biosafety Workshop',
    caption: 'Stakeholders participating in REMA-led biosafety regulatory training.',
    category: 'community',
  },
  {
    id: 8,
    src: '/image/image-08.jpg',
    alt: 'Cassava harvest',
    title: 'Improved Cassava Yield',
    caption: 'Demonstrating 40% yield improvement from biotech varieties versus conventional.',
    category: 'crops',
  },
  {
    id: 9,
    src: '/image/image-09.jpg',
    alt: 'Greenhouse experiment',
    title: 'Greenhouse Screening',
    caption: 'Early-stage disease screening of new transgenic lines under controlled conditions.',
    category: 'lab',
    tall: true,
  },
  {
    id: 10,
    src: '/image/image-10.jpg',
    alt: 'Youth engagement science fair',
    title: 'Science Outreach',
    caption: 'BioCap scientists inspiring the next generation at a Kigali science fair.',
    category: 'community',
  },
  {
    id: 11,
    src: '/image/image-11.jpg',
    alt: 'Maize biotech evaluation',
    title: 'Biotech Maize Plot',
    caption: 'Performance evaluation of drought-tolerant maize varieties at RAB Karama.',
    category: 'crops',
  },
  {
    id: 12,
    src: '/image/image-12.jpg',
    alt: 'Soil sampling field',
    title: 'Environmental Monitoring',
    caption: 'Soil and ecological monitoring as part of REMA environmental release assessment.',
    category: 'field',
  },
];

const CATEGORIES: { key: Category; label: string; Icon: React.ElementType }[] = [
  { key: 'all',       label: 'All Photos',  Icon: Images      },
  { key: 'field',     label: 'Field Work',  Icon: Leaf        },
  { key: 'lab',       label: 'Laboratory',  Icon: Microscope  },
  { key: 'community', label: 'Community',   Icon: Users       },
  { key: 'crops',     label: 'Crops',       Icon: FlaskConical},
];

// ─── Lightbox ─────────────────────────────────────────────────────
function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 25, 42, 0.92)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: 42,
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          transition: 'background 0.2s',
        }}
      >
        <X size={18} />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous"
        style={{
          position: 'absolute',
          left: '1.25rem',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: 46,
          height: 46,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          transition: 'background 0.2s',
        }}
      >
        <ChevronLeft size={22} />
      </button>

      {/* Image container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#0f1a2a',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}>
          <Image
            src={item.src}
            alt={item.alt}
            fill
            style={{ objectFit: 'cover' }}
            sizes="860px"
            priority
          />
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ margin: '0 0 4px', color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: 'Syne, sans-serif' }}>
            {item.title}
          </p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.83rem', lineHeight: 1.5 }}>
            {item.caption}
          </p>
          <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
            {index + 1} / {items.length}
          </p>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next"
        style={{
          position: 'absolute',
          right: '1.25rem',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: 46,
          height: 46,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          transition: 'background 0.2s',
        }}
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

// ─── Gallery Card ──────────────────────────────────────────────────
function GalleryCard({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        gridRow: item.tall ? 'span 2' : 'span 1',
        background: '#ddd',
        boxShadow: hovered
          ? '0 12px 40px rgba(30, 77, 107, 0.22)'
          : '0 2px 12px rgba(30, 77, 107, 0.08)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s ease',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: item.tall ? '420px' : '200px' }}>
        <Image
          src={item.src}
          alt={item.alt}
          fill
          style={{
            objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
          }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Hover overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15,25,42,0.88) 0%, rgba(15,25,42,0.2) 55%, transparent 100%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1.1rem',
        }}
      >
        <div
          style={{
            transform: hovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'transform 0.3s ease',
          }}
        >
          <p style={{ margin: '0 0 3px', color: '#fff', fontWeight: 700, fontSize: '0.88rem', fontFamily: 'Syne, sans-serif' }}>
            {item.title}
          </p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', lineHeight: 1.4 }}>
            {item.caption}
          </p>
        </div>
      </div>

      {/* Zoom icon */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'rgba(255,255,255,0.15)',
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
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}
      >
        <ZoomIn size={15} />
      </div>

      {/* Category pill */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          background: 'rgba(232, 24, 90, 0.85)',
          backdropFilter: 'blur(4px)',
          borderRadius: '999px',
          padding: '2px 10px',
          fontSize: '0.65rem',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'Syne, sans-serif',
        }}
      >
        {item.category}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = GALLERY_ITEMS.filter((item) => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.caption.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null)),
    [filtered.length]
  );
  const nextImage = useCallback(() =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : null)),
    [filtered.length]
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .gallery-page { font-family: 'DM Sans', sans-serif; background: #F7F4FB; min-height: 100vh; }

        /* Hero */
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

        /* Controls */
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
        .filter-tabs {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
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

        /* Search */
        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          pointer-events: none;
        }
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

        /* Grid */
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

        /* Empty state */
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

        /* Results count */
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
          <p className="hero-breadcrumb">
            Home › Gallery
          </p>
          <h1 className="hero-title">
            Photo <span>Gallery</span>
          </h1>
          <p className="hero-sub">
            Documenting Rwanda's biotech agriculture journey — from laboratory to field to community.
          </p>
          <div className="hero-count">
            <Images size={13} aria-hidden="true" />
            {GALLERY_ITEMS.length} photographs
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
                <Icon size={13} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div className="search-wrap">
            <Search size={15} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="search-input"
              placeholder="Search photos…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search gallery"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="gallery-grid-wrap">
          <p className="results-meta">
            Showing <span>{filtered.length}</span> of {GALLERY_ITEMS.length} photos
          </p>

          <div className="gallery-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <Images size={40} strokeWidth={1.2} />
                <p className="empty-title">No photos found</p>
                <p>Try a different category or search term.</p>
              </div>
            ) : (
              filtered.map((item, idx) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onClick={() => openLightbox(idx)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </>
  );
}