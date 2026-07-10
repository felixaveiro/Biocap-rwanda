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
  ChevronRight,
} from 'lucide-react';

// ─── BioCap Brand Colors (shared with About / Environment pages) ──
// Navy   : #1B3A5C
// Pink   : #E8185A
// Purple : #7B3FA0
// Teal   : #2A7F8C
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
    subtitle: '6 Virus-Resistant cassava varieties, under sister project "RABP-CMP" received environmental release ',
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
    color: '#1B3A5C',
    colorLight: '#e2edf4',
    status: 'approved',
    statusLabel: 'REMA 2025',
    subtitle: '2 Biotech Potato varieties (Victoria & Ndamira), under sister project "RABP-CMP" received environmental release ',
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
    subtitle: 'With Rwanda BioCap Project, RAB and partners are using gene editing to develop disease-resistant Injagi and Kamara varieties.',
    sections: [
      {
        title: 'Gene Editing Training Pipeline',
        SectionIcon: Dna,
        body: 'At least five RAB early-career scientists will receive hands-on training at IITA\'s Gene Editing Platform at the BecA/ILRI Hub in Nairobi. The full pipeline is covered: target gene identification, guide RNA design, construct development, embryogenic cell suspension, Agrobacterium-mediated transformation, transgene-free editing, sequencing validation, and phenotypic evaluation.',
      },
      {
        title: 'BXW Resistance: Kamara ',
        SectionIcon: ShieldAlert,
        body: 'Training focuses on BXW resistance targets MusaPUB22 and MusaPUB23, already successfully knocked out in dessert banana cultivar Kamara/Sukali Ndiizi using CRISPR-Cas9. The resulting transgene-free events have been validated for mutation accuracy and absence of foreign DNA, and are now ready for field evaluation in Rwanda — led by a RAB scientist returning from her PhD at IITA in 2025.',
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
        style={{ width: size, height: size, objectFit: 'contain' }}
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
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200"
      style={{
        border: `2px solid ${crop.color}`,
        background: active ? crop.color : 'transparent',
        color: active ? '#fff' : crop.color,
        boxShadow: active ? `0 8px 24px ${crop.color}40` : 'none',
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
  colorLight,
  SectionIcon,
}: {
  title: string;
  body: string;
  color: string;
  colorLight: string;
  SectionIcon: React.ElementType;
}) {
  return (
    <div className="bc-card bg-white rounded-2xl border border-slate-100 p-5 h-full">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: colorLight, color }}
        >
          <SectionIcon size={15} aria-hidden="true" />
        </div>
        <p
          className="m-0 text-[0.72rem] font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {title}
        </p>
      </div>
      <p className="m-0 text-[0.88rem] text-slate-500 leading-relaxed text-justify">
        {body}
      </p>
    </div>
  );
}

function CropPanel({ crop }: { crop: CropData }) {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6">
      {/* Header banner */}
      <div
        className="rounded-3xl px-6 lg:px-8 py-6 flex items-center justify-between flex-wrap gap-4 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${crop.color} 0%, #1B3A5C 130%)` }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            <CropMark crop={crop} size={crop.image ? 34 : 24} />
          </div>
          <div>
            <p className="bc-serif m-0 text-white text-xl font-bold">{crop.label}</p>
            <p className="m-0 mt-1 text-white/75 text-[0.8rem]">{crop.subtitle}</p>
          </div>
        </div>

        {crop.status === 'approved' ? (
          <div className="text-right">
            <span className="text-white font-bold text-base inline-flex items-center gap-1.5">
              <CheckCircle size={16} aria-hidden="true" /> Approved
            </span>
            <span className="block text-white/70 text-[0.7rem]">{crop.statusLabel}</span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/40 rounded-full px-3.5 py-1.5 text-[0.72rem] text-white font-semibold">
            <Clock size={13} aria-hidden="true" /> {crop.statusLabel}
          </span>
        )}
      </div>

      {/* Secondary banner — 80% width, mirrors header style with different content */}
      <div className="flex justify-end">
        <div
          className="rounded-3xl px-6 lg:px-8 py-6 flex items-center justify-between flex-wrap gap-4 shadow-lg mt-4"
          style={{ width: '95%', background: `linear-gradient(135deg, ${crop.color} 0%, #1B3A5C 130%)` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
              <FlaskConical size={24} color="#fff" aria-hidden="true" />
            </div>
            <div>
              <p className="bc-serif m-0 text-white text-ml font-bold">Rwanda BioCap Project Intended Objective</p>
              <p className="m-0 mt-1 text-white/75 text-[0.8rem]">
                Researchers at RAB Build Capacity to Develop and Deploy Improved Farmer-preferred  {crop.label} Varieties.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-white font-bold text-base inline-flex items-center gap-1.5">
              <CheckCircle size={16} aria-hidden="true" /> Ongoing
            </span>
            <span className="block text-white/70 text-[0.7rem]">2025–2030 </span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 my-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {crop.sections.map((s) => (
          <InfoCard
            key={s.title}
            title={s.title}
            body={s.body}
            color={crop.color}
            colorLight={crop.colorLight}
            SectionIcon={s.SectionIcon}
          />
        ))}
      </div>

      {/* Documents */}
      <div className="bc-card bg-white rounded-2xl border border-slate-100 p-5 mb-10">
        <p className="m-0 mb-3 text-[0.85rem] font-bold text-[#1B3A5C] flex items-center gap-2">
          <FileText size={15} aria-hidden="true" /> {crop.label} Documents
          <span
            className="rounded-full text-white text-[0.7rem] px-2.5 py-0.5"
            style={{ background: crop.color }}
          >
            1
          </span>
        </p>
        <div className="bg-[#f7f6f4] rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="m-0 text-[0.82rem] font-semibold text-[#1B3A5C]">{crop.docName}</p>
            <p className="m-0 text-[0.72rem] text-slate-400">{crop.docName}</p>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-lg text-white text-[0.78rem] font-bold px-4 py-2 whitespace-nowrap transition-transform hover:-translate-y-0.5"
            style={{ background: crop.color, boxShadow: `0 6px 18px ${crop.color}45` }}
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
    <div className="bg-white min-h-screen font-sans">
      {/* Shared type system + hero pattern with About / Environment pages */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .bc-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .bc-serif { font-family: 'DM Serif Display', Georgia, serif; }

        .bc-card {
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s;
        }
        .bc-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(27,58,92,0.10);
        }

        @media (max-width: 768px) {
          .biotech-hero-bg { background-attachment: scroll !important; }
        }
      `}</style>

      <div className="bc-page">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden min-h-[420px] flex items-center px-6 lg:px-12">
          <div className="absolute inset-0 z-0">
            <div
              className="biotech-hero-bg w-full h-full"
              style={{
                backgroundImage: "url('/image/LABDY3_1.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent" />
          </div>

          <div className="relative z-20 max-w-4xl py-10">
            <p className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-3 drop-shadow-md">
              Rwanda Biotech Capacity Building Project
            </p>
            <h1 className="bc-serif text-5xl lg:text-5xl text-white leading-tight mb-4 italic drop-shadow-lg">
              Three Crops, <span className="text-[#E8185A]">One Pipeline</span>
            </h1>
             <h1 className="bc-serif text-5xl lg:text-5xl text-white leading-tight mb-4 italic drop-shadow-lg">
              Under RAB's <span className="text-[#E8185A]">Center of <br /> Excellence in </span>Crop <br />Biotechnology
            </h1>
            <p className="text-white/90 text-lg max-w-xl leading-relaxed font-medium drop-shadow-md">
              Starting with three main food-security crops: cassava, potato and banana;
               RAB is advancing its national biotechnology pipeline for an accelerated development and 
              deployment of climate-smart, and improved farmer-preferred varieties.
            </p>
          </div>

          <div className="absolute bottom-[-1px] left-0 w-full z-30 leading-[0]">
            <svg className="relative block w-full h-[40px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z"
                fill="#f7f6f4"
              />
            </svg>
          </div>
        </section>

        {/* ── TABS + PANEL ── */}
        <section className="bg-[#f7f6f4] pt-10 pb-14">
          <div className="flex justify-center gap-3 px-4 flex-wrap mb-8">
            {CROPS.map((crop) => (
              <CropTab
                key={crop.key}
                crop={crop}
                active={active === crop.key}
                onClick={() => setActive(crop.key)}
              />
            ))}
          </div>

          <CropPanel crop={activeCrop} />
        </section>
      </div>

      <Footer />
    </div>
  );
}