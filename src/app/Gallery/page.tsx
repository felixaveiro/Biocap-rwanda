'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ExternalLink,
  Search,
  Images,
  Leaf,
  Users,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  Presentation,
  Megaphone,
  Dna,
} from 'lucide-react';
import Footer from '@/components/Footer';
import { galleryApi } from '@/lib/api/gallery';
import type { WebsiteGalleryCollection } from '@/lib/api/gallery';
import type { GalleryCategory, GalleryItem as GalleryRecord } from '@/types';

type Category = 'all' | 'field' | 'lab' | 'community' | 'crops' | 'workshop' | 'conference' | 'outreach' | 'dna' | GalleryCategory;

interface GalleryCardItem {
  id: number | string;
  src: string;
  alt: string;
  title: string;
  caption: string;
  category: Category;
  href: string;
  itemCount: number;
  date: string;
  tall?: boolean;
  galleryId?: string;
}

const GALLERY_ITEMS: GalleryCardItem[] = [
  {
    id: 1,
    src: '/image/DSC_5973.JPG',
    alt: 'HUYE Eating and Believing of Cassava',
    title: 'Eating is Believing  — Cassava',
    caption: 'Regulatory confined field trial assessments of biotech cassava varieties conducted at the Huye research station, evaluating agronomic performance and biosafety compliance.',
    category: 'field',
    href: 'https://biotechnology.pixieset.com/cassava01/',
    itemCount: 70,
    date: 'December 04, 2025',
    tall: true,
  },
  {
    id: 2,
    src: '/image/DSC01236.jpg',
    alt: 'OFAB stakeholder engagement outcomes',
    title: 'OFAB: Outcomes & Impact',
    caption: 'Documenting the outcomes of the Open Forum on Agricultural Biotechnology (OFAB), highlighting evidence-based dialogue between scientists, policymakers, and civil society on biotech adoption in Rwanda.',
    category: 'community',
    href: 'https://biotechnology.pixieset.com/theimpactofofabformediaandinfruencersday2/',
    itemCount: 17,
    date: 'May 20, 2026',
  },
  {
    id: 3,
    src: '/image/DSC01175.jpg',
    alt: 'OFAB media and influencer engagement',
    title: 'OFAB Media & Influencer Engagement',
    caption: 'Strategic science communication sessions bringing together journalists and digital influencers to strengthen public understanding of agricultural biotechnology research and its implications for food security.',
    category: 'outreach',
    href: 'https://biotechnology.pixieset.com/ofabday02/',
    itemCount: 29,
    date: 'May 19, 2026',
    tall: true,
  },
  {
    id: 4,
    src: '/image/image-04.jpg',
    alt: 'DNA Day public science outreach',
    title: 'DNA Day — Science Outreach',
    caption: 'Annual DNA Day celebrations engaging students, educators, and the public in hands-on molecular biology activities, fostering scientific literacy and interest in biotechnology careers.',
    category: 'dna',
    href: 'https://biotechnology.pixieset.com/biocapdnaday/',
    itemCount: 28,
    date: 'May 6, 2026',
  },
  {
    id: 5,
    src: '/image/DSC_6501.JPG',
    alt: 'Huye confined field trial maize',
    title: 'HUYE Confined Field Trial — Maize',
    caption: 'Confined field trial evaluations of biotech maize lines at the Huye research station, assessing yield performance, pest resistance, and adherence to national biosafety protocols.',
    category: 'field',
    href: 'https://biotechnology.pixieset.com/biocapmaize/',
    itemCount: 62,
    date: 'December 04, 2025',
    tall: true,
  },
  {
    id: 6,
    src: '/image/IMG_39(2).jpg',
    alt: 'BIOCAP project launch and presentations',
    title: 'BIOCAP Project Launch & Presentations',
    caption: 'Official launch of the BIOCAP initiative, featuring technical presentations to government representatives, research institutions, and development partners on project objectives, methodology, and anticipated impact on Rwanda\'s agricultural biotechnology capacity.',
    category: 'conference',
    href: 'https://biotechnology.pixieset.com/biocap-launch/',
    itemCount: 77,
    date: 'January 02, 2026',
    tall: true,
  },
  {
    id: 7,
    src: '/image/LABDY3_1.jpg',
    alt: 'BIOCAP community field visit',
    title: 'BIOCAP Field Visit & Farmer Engagement',
    caption: 'Community-level field visits under the BIOCAP programme, facilitating direct engagement between researchers and smallholder farmers to communicate trial progress, gather farmer feedback, and build grassroots support for biotech crop adoption.',
    category: 'community',
    href: 'https://biotechnology.pixieset.com/biocapfield/',
    itemCount: 38,
    date: 'January 02, 2026',
    tall: true,
  },
];

const CATEGORIES: { key: Category; label: string; Icon: React.ElementType }[] = [
  { key: 'all',        label: 'All Collections',                    Icon: Images        },
  { key: 'field',      label: 'Confined Field Trials (CFTs)',       Icon: Leaf          },
  { key: 'workshop',   label: 'Capacity-Building & Training',       Icon: GraduationCap },
  { key: 'conference', label: 'Regulatory & Launch Proceedings',    Icon: Presentation  },
  { key: 'outreach',   label: 'Science Communication & Advocacy',  Icon: Megaphone     },
  { key: 'dna',        label: 'Molecular Biology & DNA Week',       Icon: Dna           },
  { key: 'community',  label: 'Farmer Extension & Stakeholder Consultation', Icon: Users },
  { key: 'crops',      label: 'Biotech Crop Pipeline',              Icon: FlaskConical  },
  { key: 'activities', label: 'Activities',                          Icon: Leaf          },
  { key: 'events',     label: 'Events',                              Icon: Presentation  },
  { key: 'team',       label: 'Team',                                Icon: Users         },
];

// Maps each category key to its technical label, reused for the pill badge on each card
const CATEGORY_LABELS: Record<Category, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.key]: c.label }),
  {} as Record<Category, string>
);
function CollectionCard({ item }: { item: GalleryCardItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={item.galleryId ? `/Gallery/${item.galleryId}` : item.href}
      target={item.galleryId ? undefined : '_blank'}
      rel={item.galleryId ? undefined : 'noopener noreferrer'}
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
          ? '0 16px 48px rgba(27,58,92,0.26)'
          : '0 2px 14px rgba(27,58,92,0.09)',
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
          unoptimized
        />
      </div>

      {/* Always-visible bottom gradient + info */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(27,58,92,0.92) 0%, rgba(27,58,92,0.35) 50%, transparent 100%)',
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
            fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
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
              fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
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
              fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
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
        maxWidth: 'calc(100% - 3.25rem)',
        background: 'rgba(232,24,90,0.85)',
        backdropFilter: 'blur(4px)',
        borderRadius: '12px',
        padding: '3px 10px',
        fontSize: '0.62rem',
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '0.04em',
        lineHeight: 1.35,
        textTransform: 'uppercase' as const,
        fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}>
        {CATEGORY_LABELS[item.category]}
      </div>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedItems, setUploadedItems] = useState<GalleryCardItem[]>([]);
  const [websiteItems, setWebsiteItems] = useState<GalleryCardItem[]>([]);

  useEffect(() => {
    let isCurrent = true;
    let websiteRequestInFlight = false;

    const loadPublishedItems = async () => {
      try {
        const firstPage = await galleryApi.getItems({ page: 1, limit: 100 });
        const pages = await Promise.all(
          Array.from({ length: Math.max(0, firstPage.pagination.pages - 1) }, (_, index) =>
            galleryApi.getItems({ page: index + 2, limit: 100 })
          )
        );
        const records = [firstPage, ...pages].flatMap((response) => response.data);

        if (isCurrent) {
          setUploadedItems(
            records
              .map((item: GalleryRecord) => {
                const cover = item.images?.find((image) => image.isCover) || item.images?.[0];
                return {
                  id: item._id,
                  galleryId: item._id,
                  src: item.mediaType === 'video' ? item.thumbnailUrl || '/image/IMG_101.jpg' : cover?.url || '/image/IMG_101.jpg',
                  alt: item.title,
                  title: item.title,
                  caption: item.caption,
                  category: item.category,
                  href: `/Gallery/${item._id}`,
                  itemCount: item.mediaType === 'video' ? 1 : item.images?.length || 0,
                  date: new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                  }),
                  tall: true,
                };
              })
          );
        }
      } catch (error) {
        console.error('Failed to load published gallery collections:', error);
      }
    };

    const loadWebsiteCollections = async () => {
      if (websiteRequestInFlight) return;
      websiteRequestInFlight = true;
      try {
        const response = await galleryApi.getWebsiteCollections();
        if (!isCurrent) return;
        setWebsiteItems(
          (response.items || [])
            .filter((collection: WebsiteGalleryCollection) => collection.status === 'published')
            .map((collection) => ({
              id: collection.id,
              galleryId: collection.slug,
              src: collection.coverUrl || '/image/IMG_101.jpg',
              alt: collection.name,
              title: collection.name,
              caption: collection.description || '',
              category: 'activities',
              href: `/Gallery/${collection.slug}`,
              itemCount: collection.itemCount || 0,
              date: collection.updatedAt
                ? new Date(collection.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit',
                  })
                : '',
              tall: true,
            }))
        );
      } catch (error) {
        console.error('Failed to load website gallery collections:', error);
      } finally {
        websiteRequestInFlight = false;
      }
    };

    const refreshVisibleCollections = () => {
      if (document.visibilityState === 'visible') void loadWebsiteCollections();
    };

    void loadPublishedItems();
    void loadWebsiteCollections();
    const refreshInterval = window.setInterval(refreshVisibleCollections, 5_000);
    document.addEventListener('visibilitychange', refreshVisibleCollections);
    return () => {
      isCurrent = false;
      window.clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', refreshVisibleCollections);
    };
  }, []);

  const allGalleryItems = [...websiteItems, ...uploadedItems, ...GALLERY_ITEMS];

  const filtered = allGalleryItems.filter((item) => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.caption.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .gallery-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; background: #F7F4FB; min-height: 100vh; color: #334155; }

        .gallery-hero {
          background: #1B3A5C;
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
          color: #E8185A;
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin: 0 0 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          font-weight: 700;
        }
        .hero-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-style: italic;
          color: #fff;
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          font-weight: 400;
          margin: 0 0 0.6rem;
          letter-spacing: -0.02em;
        }
        .hero-title span { color: #E8185A; }
        .hero-sub {
          color: rgba(255,255,255,0.75);
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.7;
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
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
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
          border: 1.5px solid rgba(27,58,92,0.15);
          background: #fff;
          color: #64748b;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-tab:hover { border-color: #1B3A5C; color: #1B3A5C; }
        .filter-tab.active {
          background: #1B3A5C;
          border-color: #1B3A5C;
          color: #fff;
          box-shadow: 0 4px 14px rgba(27,58,92,0.25);
        }

        .search-wrap { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 12px; color: #94a3b8; pointer-events: none; }
        .search-input {
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          font-size: 0.85rem;
          padding: 8px 14px 8px 36px;
          border: 1.5px solid rgba(27,58,92,0.15);
          border-radius: 999px;
          background: #fff;
          color: #334155;
          outline: none;
          width: 220px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: #94a3b8; }
        .search-input:focus {
          border-color: #1B3A5C;
          box-shadow: 0 0 0 3px rgba(27,58,92,0.1);
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
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #475569;
        }

        .results-meta {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 1rem;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .results-meta span { color: #E8185A; }
      `}</style>

      <div className="gallery-page">
        {/* Hero */}
       {/* ── HERO — identical structure to Resource/DNA Week page ── */}
<section className="relative min-h-[420px] flex items-center px-6 lg:px-12 overflow-hidden">
  <div className="absolute inset-0 z-0">
      <Image
      src="/image/IMG_101.jpg"
      alt="BioCap Rwanda photo collections"
        fill
        unoptimized
        sizes="100vw"
        className="object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent" />
  </div>

  <div className="relative z-20 max-w-4xl py-10">
    <p className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-3 drop-shadow-md">
      Home &rsaquo; Gallery
    </p>
    <h1
      className="text-5xl lg:text-7xl text-white leading-tight mb-4 drop-shadow-lg"
      style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}
    >
      Photo <span className="text-[#E8185A]">Collections</span>
    </h1>
    <p className="text-white/90 text-lg max-w-xl leading-relaxed font-medium drop-shadow-md">
      Documenting Rwanda&apos;s biotech agriculture journey, from laboratory to the field and communities.
    </p>
    <div className="inline-flex items-center gap-2 mt-6 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-bold uppercase tracking-wider">
      <Images size={13} /> {allGalleryItems.length} collections
    </div>
  </div>

  <div className="absolute bottom-[-1px] left-0 w-full z-30 leading-[0]">
    <svg className="relative block w-full h-[40px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path
        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z"
        fill="#ffffff"
      />
    </svg>
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
            Showing <span>{filtered.length}</span> of {allGalleryItems.length} collections
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
        <Footer />
      </div>
    </>
  );
}