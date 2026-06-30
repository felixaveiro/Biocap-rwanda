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
  image?: string;
  color: string;
  colorLight: string;
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
    image: '/image/cassava.png',
    color: '#E8185A',
    colorLight: '#fde8ef',
    status: 'approved',
    statusLabel: 'REMA 2025',
    subtitle: '4 information sections · REMA environmental release approved September 2025',
    sections: [
      {
        title: 'Molecular Marker Training',
        SectionIcon: Dna,
        body: 'IITA supports the cassava product component through training for use of molecular markers to select elite progeny lines. This enables RAB scientists to identify and advance the most promising disease-resistant cassava lines with precision, accelerating the breeding pipeline.',
      },
      {
        title: 'Molecular Characterisation',
        SectionIcon: Microscope,
        body: 'DDPSC supports the cassava breeding component by training RAB scientists in techniques required to characterise new cassava lines at the molecular level. This includes event-specific PCR, T-DNA copy number assessment, DNA sequencing and bioinformatics, and expression of the RNAi cassette in F1 progeny lines.',
      },
      {
        title: 'Virus Diagnostics & Capacity',
        SectionIcon: ShieldAlert,
        body: 'Training is also provided in virus diagnostics for detection of the pathogens that cause CBSD and CMD. Although applied to cassava, most of these techniques are applicable to all transgenic crops and will raise capacity for this type of analysis at RAB — ensuring participants can transfer skills and establish them independently.',
      },
      {
        title: 'Centre of Excellence in crop Biotechnology at RAB Rubona Station',
        SectionIcon: TrendingUp,
        body: 'These activities lay the groundwork for Rwanda to take a leadership role in agricultural biotechnology. Through targeted investments in infrastructure, capacity building, and product innovation, the Centre of Excellence for Crop Biotechnology at RAB Rubona will become a nationally anchored platform for science-based food security solutions.',
      },
    ],
    docName: 'A5-Biotech-Cassava-General-FAQ-2025',
  },
  {
    key: 'potato',
    label: 'Biotech Potato',
    image: '/image/potato.png',
    Icon: CircleDot,
    color: '#1E4D6B',
    colorLight: '#e2edf4',
    status: 'approved',
    statusLabel: 'REMA 2025',
    subtitle: '4 information sections · REMA environmental release approved September 2025',
    sections: [
      {
        title: 'Training & Transformation Pipeline',
        SectionIcon: Dna,
        body: 'Trainees begin with a two-to-three-month residency at CIP laboratories within the BecA-ILRI Hub in Nairobi for advanced techniques, after initial training organised in Rwanda. The full transformation cycle covers gene construct assembly, Agrobacterium culture maintenance, plasmid validation, explant infection, plant regeneration, molecular characterisation, and greenhouse phenotyping.',
      },
      {
        title: 'Target Varieties & 3R-Gene Construct',
        SectionIcon: ShieldAlert,
        body: 'Farmer-preferred Rwandan varieties Kinigi and Cyerekezo will be transformed with the three-gene construct pCIP99 (GB MN164628.2), containing Rpi-vnt1.1 from Solanum venturii and Rpi-RB and Rpi-blb2 from Solanum bulbocastanum. This 3R-gene stacking delivers broad-spectrum, durable resistance to diverse late blight pathogen strains under field conditions.',
      },
      {
        title: 'Cisgenic Approach & Regulatory Pathway',
        SectionIcon: Microscope,
        body: 'A second construct from TSL stacks Rpi-vnt1, Rpi-amr1, and Rpi-amr3 — all sourced exclusively from the Solanum genus — creating potential for cisgenic classification rather than transgenic, which may simplify the regulatory pathway. The potato ALS gene serves as a selectable marker conferring chlorsulfuron herbicide resistance for streamlined selection.',
      },
      {
        title: 'Confined Field Trials & National Ownership',
        SectionIcon: TrendingUp,
        body: 'Resulting transformation events will advance to confined field trials (CFTs) across three existing RABP-CMP sites, with all activities led by trained Rwandan scientists. RAB will carefully select recipient varieties distinct from any pending biotech releases to avoid regulatory complications, as tuber morphology remains the primary field-level identification method.',
      },
    ],
    docName: 'A5-Biotech-Potato-General-FAQ-2025',
  },
  {
    key: 'banana',
    label: 'Biotech Banana',
    Icon: Banana,
    image: '/image/banana.png',
    color: '#7B3FA0',
    colorLight: '#f3eaf8',
    status: 'trials',
    statusLabel: 'In Trials',
    subtitle: '4 information sections · Under confined field trial evaluation',
    sections: [
      {
        title: 'Gene Editing Training Pipeline',
        SectionIcon: Dna,
        body: 'At least five RAB early-career scientists will receive hands-on training at IITA\'s Gene Editing Platform at the BecA/ILRI Hub in Nairobi. The full pipeline is covered: target gene identification, guide RNA design, construct development, embryogenic cell suspension, Agrobacterium-mediated transformation, transgene-free editing, sequencing validation, and phenotypic evaluation.',
      },
      {
        title: 'BXW Resistance: Sukali Ndiizi',
        SectionIcon: ShieldAlert,
        body: 'Training focuses on BXW resistance targets MusaPUB22 and MusaPUB23, already successfully knocked out in dessert banana cultivar Sukali Ndiizi using CRISPR-Cas9. The resulting transgene-free events have been validated for mutation accuracy and absence of foreign DNA, and are now ready for field evaluation in Rwanda — led by a RAB scientist returning from her PhD at IITA in 2025.',
      },
      {
        title: 'Injagi Editing & FULCRUM™ System',
        SectionIcon: FlaskConical,
        body: 'RAB will establish a gene editing pipeline for Injagi — a farmer-preferred cooking banana — using the FULCRUM™ system licensed by IITA from Pairwise, securing Rwanda\'s freedom to operate for public-sector use. RAB scientists will develop embryogenic cell suspensions for Injagi and edit susceptibility genes including Alcohol Dehydrogenase 1 (ADH1) to confer Fusarium Wilt resistance, with plans to stack both BXW and Fusarium resistance traits.',
      },
      {
        title: 'National Ownership & Long-Term Impact',
        SectionIcon: TrendingUp,
        body: 'Upon training completion, RAB will have an in-country self-sustaining banana gene editing pipeline. The RAB team will lead edited line development, biosafety data generation, phenotypic evaluation under high-disease pressure, and integration into national seed systems — positioning Rwanda as a regional leader in banana biotechnology.',
      },
    ],
    docName: 'A5-Biotech-Banana-General-FAQ-2025',
  },
];

// ─── Crop icon/image helper ────────────────────────────────────────

function CropMark({
  crop,
  size,
  iconColor = '#fff',
}: {
  crop: CropData;
  size: number;
  iconColor?: string;
}) {
  if (crop.image) {
    return (
      <img
        src={crop.image}
        alt={crop.label}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
        }}
      />
    );
  }
  return <crop.Icon size={size} color={iconColor} aria-hidden="true" />;
}

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
        gap: '8px',
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
      <CropMark crop={crop} size={16} iconColor={active ? '#fff' : crop.color} />
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
          textAlign: 'justify',
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
              overflow: 'hidden',
            }}
          >
            <CropMark crop={crop} size={crop.image ? 30 : 22} />
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
          Three Food Security Crops in Pipeline
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
          {/* Cassava, Potato &amp; Banana — REMA-approved environmental release, September 2025 */}
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