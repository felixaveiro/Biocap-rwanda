'use client';

import React, { useState } from 'react';
import Footer from '@/components/Footer';
import {
  Leaf,
  CircleDot,
  Banana,
  Dna,
  ShieldAlert,
  TrendingUp,
  FlaskConical,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Microscope,
  Sprout,
} from 'lucide-react';

// ─── BioCap Brand Colors ───────────────────────────────────────────
// Pink/Magenta : #E8185A  (from "Bio" wordmark + DNA strand)
// Navy         : #1E4D6B  (from "Cap" wordmark + farm)
// Purple       : #7B3FA0  (upper DNA helix)
// Teal         : #2A7F8C  (molecular structure nodes)
// Light bg     : #F7F4FB
// ──────────────────────────────────────────────────────────────────

type CropKey = 'cassava' | 'potato' | 'banana';

interface CropData {
  key: CropKey;
  label: string;
  Icon: React.ElementType;
  color: string;         // primary accent hex
  colorLight: string;    // pill / badge bg
  status: 'approved' | 'trials';
  statusLabel: string;
  subtitle: string;
  sections: { title: string; body: string; SectionIcon: React.ElementType }[];
  docName: string;
}

const CROPS: CropData[] = [
  {
    key: 'cassava',
    label: 'Biotech Cassava',
    Icon: Leaf,
    color: '#E8185A',
    colorLight: '#fde8ef',
    status: 'approved',
    statusLabel: 'REMA 2025',
    subtitle: '4 information sections · REMA environmental release approved September 2025',
    sections: [
      {
        title: 'What is Biotech Cassava?',
        SectionIcon: Dna,
        body: 'Biotech cassava varieties have been developed to resist Cassava Brown Streak Disease (CBSD) and Cassava Mosaic Disease (CMD), which devastate yields across Sub-Saharan Africa. Rwanda\'s RABP-CMP program has developed and tested lines like TH16-T2xR2-82 and TH16-T2xR1-222 in confined field trials.',
      },
      {
        title: 'Key Challenges Addressed',
        SectionIcon: ShieldAlert,
        body: 'CBSD and CMD can destroy up to 100% of a cassava harvest. Rwanda\'s smallholder farmers depend on cassava as both food and income. Biotech resistance traits directly address these devastating threats to food security.',
      },
      {
        title: 'Benefits for Farmers',
        SectionIcon: TrendingUp,
        body: 'Disease resistance means stable yields, lower crop losses, and reduced need for replanting. Biotech cassava also offers improved nutritional profiles and yield improvements of up to 40% compared to susceptible conventional varieties.',
      },
      {
        title: 'Field Trial Results',
        SectionIcon: FlaskConical,
        body: 'Confined field trials in Rubona and other RAB stations demonstrated strong CBSD resistance. Environmental release approval was granted by REMA on September 3rd, 2025 — marking Rwanda\'s first approval of a biotech food crop.',
      },
    ],
    docName: 'A5-Biotech-Cassava-General-FAQ-2025',
  },
  {
    key: 'potato',
    label: 'Biotech Potato',
    Icon: CircleDot,
    color: '#1E4D6B',
    colorLight: '#e2edf4',
    status: 'approved',
    statusLabel: 'REMA 2025',
    subtitle: '4 information sections · REMA environmental release approved September 2025',
    sections: [
      {
        title: 'What is Biotech Potato?',
        SectionIcon: Dna,
        body: 'Biotech potato varieties developed under the RABP-CMP program are engineered to resist Late Blight (Phytophthora infestans) — the most devastating potato disease globally. These varieties carry resistance genes (R genes) sourced from wild potato relatives to confer durable protection.',
      },
      {
        title: 'Key Challenges Addressed',
        SectionIcon: ShieldAlert,
        body: 'Late Blight can destroy an entire potato field within days under wet conditions. Rwandan farmers spend heavily on fungicide applications — up to 15 sprays per season. Biotech resistance drastically reduces input costs and crop losses for smallholders.',
      },
      {
        title: 'Benefits for Farmers',
        SectionIcon: TrendingUp,
        body: 'Resistant varieties eliminate most fungicide spray cycles, cutting production costs significantly. Yield stability improves by up to 50% in seasons with high disease pressure. Reduced chemical use also benefits the environment and farmer health.',
      },
      {
        title: 'Field Trial Results',
        SectionIcon: Microscope,
        body: 'Multi-season confined field trials across Rwanda\'s highland potato zones showed near-complete resistance to Late Blight strains. REMA granted environmental release approval in September 2025, enabling seed multiplication and expanded farmer access.',
      },
    ],
    docName: 'A5-Biotech-Potato-General-FAQ-2025',
  },
  {
    key: 'banana',
    label: 'Biotech Banana',
    Icon: Banana,
    color: '#7B3FA0',
    colorLight: '#f3eaf8',
    status: 'trials',
    statusLabel: 'In Trials',
    subtitle: '4 information sections · Under confined field trial evaluation',
    sections: [
      {
        title: 'What is Biotech Banana?',
        SectionIcon: Dna,
        body: 'Biotech banana varieties are being developed to resist Banana Xanthomonas Wilt (BXW) and Black Sigatoka, two of the most destructive banana diseases in East and Central Africa. Rwanda\'s RABP-CMP program is evaluating transgenic and gene-edited lines in confined trials.',
      },
      {
        title: 'Key Challenges Addressed',
        SectionIcon: ShieldAlert,
        body: 'BXW has devastated banana production across the Great Lakes region, with losses exceeding 90% in affected plantations. Banana is a staple food and key income source for millions of Rwandan households, making disease resistance a critical food security priority.',
      },
      {
        title: 'Benefits for Farmers',
        SectionIcon: TrendingUp,
        body: 'Disease-resistant banana varieties would eliminate the need for costly and labor-intensive BXW management practices like debudding and tool sterilization. Yield stability and nutritional security for farming households would improve significantly.',
      },
      {
        title: 'Field Trial Status',
        SectionIcon: FlaskConical,
        body: 'Confined field trials are ongoing at RAB research stations. Early results show promising resistance profiles. The program is on track to submit a dossier to REMA for environmental release consideration pending successful multi-season trial data.',
      },
    ],
    docName: 'A5-Biotech-Banana-General-FAQ-2025',
  },
];

// ─── Sub-components ────────────────────────────────────────────────

function CropTab({
  crop,
  active,
  onClick,
}: {
  crop: CropData;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 22px',
        borderRadius: '999px',
        border: `2px solid ${crop.color}`,
        background: active ? crop.color : 'transparent',
        color: active ? '#fff' : crop.color,
        fontFamily: 'inherit',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <crop.Icon size={15} aria-hidden="true" />
      {crop.label}
    </button>
  );
}

function InfoCard({
  title,
  body,
  color,
  SectionIcon,
}: {
  title: string;
  body: string;
  color: string;
  SectionIcon: React.ElementType;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e4f0',
        borderRadius: '10px',
        padding: '1.1rem 1.25rem',
      }}
    >
      <p
        style={{
          margin: '0 0 0.5rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <SectionIcon size={14} aria-hidden="true" />
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: '0.85rem',
          color: '#444',
          lineHeight: 1.6,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function CropPanel({ crop }: { crop: CropData }) {
  return (
    <div>
      {/* Header banner */}
      <div
        style={{
          margin: '1rem 1rem 0',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          background: crop.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <crop.Icon size={22} color="#fff" aria-hidden="true" />
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: 'Georgia, serif',
                color: '#fff',
                fontSize: '1.15rem',
                fontWeight: 700,
              }}
            >
              {crop.label}
            </p>
            <p
              style={{
                margin: '2px 0 0',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.78rem',
              }}
            >
              {crop.subtitle}
            </p>
          </div>
        </div>

        {/* Status badge */}
        {crop.status === 'approved' ? (
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <CheckCircle size={16} aria-hidden="true" /> Approved
            </span>
            <span
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.7rem',
              }}
            >
              {crop.statusLabel}
            </span>
          </div>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '0.72rem',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            <Clock size={13} aria-hidden="true" /> {crop.statusLabel}
          </span>
        )}
      </div>

      {/* 2-col info grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.75rem',
          margin: '0.75rem 1rem',
        }}
      >
        {crop.sections.map((s) => (
          <InfoCard key={s.title} title={s.title} body={s.body} color={crop.color} SectionIcon={s.SectionIcon} />
        ))}
      </div>

      {/* Documents */}
      <div
        style={{
          margin: '0 1rem 1rem',
          background: '#fff',
          border: '1px solid #e8e4f0',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
        }}
      >
        <p
          style={{
            margin: '0 0 0.75rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FileText size={14} aria-hidden="true" /> {crop.label} Documents{' '}
          <span
            style={{
              background: crop.color,
              color: '#fff',
              borderRadius: '999px',
              padding: '1px 8px',
              fontSize: '0.7rem',
            }}
          >
            1
          </span>
        </p>
        <div
          style={{
            background: '#f7f4fb',
            borderRadius: 6,
            padding: '0.7rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>
              {crop.docName}
            </p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#888' }}>{crop.docName}</p>
          </div>
          <button
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: crop.color,
              color: '#fff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <Download size={13} aria-hidden="true" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function BiotechCropsPage() {
  const [active, setActive] = useState<CropKey>('cassava');
  const activeCrop = CROPS.find((c) => c.key === active)!;

  return (
    <div
      style={{
        fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif",
        background: '#F7F4FB',
        minHeight: '100vh',
      }}
    >
      {/* Hero */}
      <section
        style={{
          background: '#1E4D6B',
          padding: '2.5rem 2rem 2rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#2A7F8C',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            margin: '0 0 0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Home <Sprout size={11} aria-hidden="true" /> Biotech Crops
        </p>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            color: '#fff',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 700,
            margin: '0 0 0.5rem',
          }}
        >
          Our Biotech Crops
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
          Cassava, Potato &amp; Banana — REMA-approved environmental release, September 2025
        </p>
      </section>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '1.5rem 1rem 0',
          flexWrap: 'wrap',
        }}
      >
        {CROPS.map((crop) => (
          <CropTab
            key={crop.key}
            crop={crop}
            active={active === crop.key}
            onClick={() => setActive(crop.key)}
          />
        ))}
      </div>

      {/* Active crop panel */}
      <CropPanel crop={activeCrop} />
      <Footer />
    </div>
  );
}