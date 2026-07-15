'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from '@/components/Footer';
import ProjectDetailPage, { type Project } from '@/components/ProjectDetailPage';
import PrecisionBiotechnologyArticle from '@/components/PrecisionBiotechnologyArticle';
import CommunicationSocialEngagementArticle from '@/components/CommunicationSocialEngagementArticle';
import { Sprout, ShieldCheck, Megaphone, Dna, Radio } from 'lucide-react';

// Maps each project title to the slug used in the footer's "Recent News" links
const PROJECT_SLUGS: Record<string, string> = {
  'DNA Week': 'dna-week',
  'Risk Assessment & Stewardship': 'risk-assessment-stewardship',
  'Communication & Advocacy': 'communication-advocacy',
  'Precision Biotechnology': 'precision-biotechnology',
  'Communication & Social Engagement': 'communication-social-engagement',
};

// ── Project data ────────────────────────────────────────────────────
const ecoProjects: Project[] = [
  {
    title: "DNA Week",
    img: "/image/image-04.jpg",
    tag: "Sustainability",
    excerpt:
      "UR-CST and partners marked the third DNA Week with a seminar on biotechnology in agriculture, medicine, and the environment — featuring experts from RBC, RAB, REMA, and BioCAP, and a panel on building Rwanda's next generation of scientists.",
    modal: {
      date: "6 May 2026",
      organizer: "Department of Biology, School of Science, UR-CST",
      partners: "BioCAP Rwanda · Alliance for Science Rwanda · AATF · OFAB Rwanda Chapter · RAB",
      intro:
        "Now in its third year in Rwanda, DNA Week commemorates the discovery of the DNA double helix and the completion of the Human Genome Project. The 2026 edition brought together students, researchers, government institutions, and private-sector partners to examine how biotechnology is shaping agriculture, medicine, environmental management, and innovation across Rwanda.",
      objectives: [
        "Raise public awareness of DNA and modern biotechnology",
        "Connect students directly with scientists and industry professionals",
        "Introduce medical, agricultural, environmental, and industrial biotechnology",
        "Encourage critical thinking on biotechnology's role in national development",
      ],
      sessions: [
        {
          name: "Prof. Banzi Wellars",
          role: "Welcome Remarks, UR-CST",
          summary:
            "Framed DNA as the foundation of life and innovation, calling on students to connect mathematics, genetics, and bioinformatics to real scientific discovery.",
        },
        {
          name: "Guest Speaker, RBC",
          role: "Medical Biotechnology",
          summary:
            "Traced the history of DNA discovery and its role in medicine — molecular diagnostics, recombinant DNA technology, insulin production, and outbreak response.",
        },
        {
          name: "Dr. Bellancile Uzayisenga",
          role: "BioCAP Program Coordinator",
          summary:
            "Presented the five-year BioCAP initiative and its Centre of Excellence at RAB Rubona, covering disease-resistant potato, cassava, and banana research.",
        },
        {
          name: "Guest Speaker, REMA",
          role: "Biosafety Framework",
          summary:
            "Explained Rwanda's biosafety systems, the Cartagena Protocol, and the need for clear public communication to counter GMO misinformation.",
        },
        {
          name: "Inter Business Company",
          role: "Diagnostics & Laboratory Technology",
          summary:
            "Walked students through the full DNA analysis workflow, from sample collection to data analysis, and Rwanda's diagnostic platforms used during outbreaks.",
        },
        {
          name: "Dr. Léonce Dusengemungu",
          role: "Engineering Resilient Crops",
          summary:
            "Showed how gene identification and transformation are producing crops resistant to late blight, cassava brown streak virus, and stem borers.",
        },
      ],
      collaboration: [
        "Student internships",
        "Joint research projects",
        "Laboratory access",
        "Technical training",
        "Capacity building programs",
        "Biotechnology awareness activities",
      ],
      quote:
        "Rwanda's biotechnology future depends not only on technology and infrastructure, but on developing skilled young scientists who can contribute to innovation and public understanding.",
      quoteSource: "Closing message, DNA Week 2026 Panel Discussion",
    },
  },
  {
    title: "Risk Assessment & Stewardship",
    img: "/image/Risk-ssessment.jpg",
    tag: "Biosafety",
    excerpt:
      "A two-day workshop in Kigali strengthened scientists' and regulators' understanding of how biotech crop risks are identified, evaluated, and managed — from hazard analysis through to stewardship and field-level safety.",
    modal: {
      date: "16–17 June 2026",
      organizer: "Rwanda Agriculture and Animal Resources Development Board (RAB)",
      partners: "AATF · Michigan State University · BioCAP · OFAB Rwanda · Alliance for Science Rwanda · CIP",
      intro:
        "Held at Park Inn Hotel, Kigali, this workshop brought together scientists, regulators, and project stakeholders to deepen understanding of the practical risk assessment and risk management approaches applied throughout biotech crop development, with emphasis on stewardship, biosafety, and evidence-based decision-making.",
      objectives: [
        "Strengthen practical understanding of risk assessment in agricultural biotechnology",
        "Apply the risk = hazard × exposure framework to real product decisions",
        "Review the current status of biotech cassava, potato, and maize in Rwanda",
        "Build stewardship capacity for responsible deployment of biotech crops",
      ],
      sessions: [
        {
          name: "Rob",
          role: "Risk Analysis in Decision-Making",
          summary:
            "Walked participants through hazard identification, level of harm, and likelihood of exposure, and the risk management options of accepting, managing, avoiding, or monitoring risk.",
        },
        {
          name: "Dr. Athanase",
          role: "Biotech Product Overview",
          summary:
            "Reviewed the status of RNAi-enhanced cassava (four completed field trial seasons), R-gene potato varieties, and TELA maize under evaluation for fall armyworm resistance.",
        },
        {
          name: "Technical Panel",
          role: "Risk Assessment & Management of Biotech Products",
          summary:
            "Covered molecular characterization, protein expression and toxicity testing, and safety evaluation of cassava and maize proteins against internationally recognized standards.",
        },
        {
          name: "Technical Panel",
          role: "Risk Management & Stewardship",
          summary:
            "Defined stewardship as balancing human needs and plant productivity, and outlined how stewardship practices protect product effectiveness and the environment.",
        },
      ],
      collaboration: [
        "Joint regulatory training",
        "Cross-institutional risk communication",
        "Future commodity-specific workshops (potato, cassava)",
        "Stakeholder capacity building",
      ],
      quote:
        "Biotechnology should not be viewed as fundamentally different from other crop improvement approaches, but as an important tool that contributes to sustainable agricultural development.",
      quoteSource: "Ms. Florence, Acting Director, RAB — Opening Remarks",
    },
  },
  {
    title: "Communication & Advocacy",
    img: "/image/dna-communication-advocacy.jpg",
    tag: "Public Engagement",
    excerpt:
      "Communicators, regulators, and scientists examined how to translate complex biotech science into clear, trustworthy public messaging — and how Rwanda's regulatory bodies work together to register and approve new technologies.",
    modal: {
      date: "16–17 June 2026",
      organizer: "Rwanda Agriculture and Animal Resources Development Board (RAB)",
      partners: "AATF · Michigan State University · BioCAP · OFAB Rwanda · Alliance for Science Rwanda · CIP",
      intro:
        "A core part of the workshop focused on effective communication and advocacy strategies for agricultural biotechnology — simplifying scientific information, countering misinformation, and building public trust through transparent, consistent messaging.",
      objectives: [
        "Equip communicators to simplify complex biotech science for general audiences",
        "Address common misconceptions about GMOs with evidence-based responses",
        "Clarify the roles of REMA and RICA in registering and approving biotech products",
        "Harmonize messaging across institutions and stakeholders",
      ],
      sessions: [
        {
          name: "Communication Facilitators",
          role: "Communication & Advocacy of Biotech Crops",
          summary:
            "Addressed the frequently asked question \"Are GMOs safe?\", framing GMOs as a technology rather than a single product, with current evidence supporting its safety.",
        },
        {
          name: "REMA Representative",
          role: "Q&A: Regulation & Registration",
          summary:
            "Explained REMA's role supporting registration processes and acting as a custodian regulatory body for biotech products.",
        },
        {
          name: "RICA Representative",
          role: "Q&A: Consumer Evaluation",
          summary:
            "Outlined RICA's role conducting consumer evaluations and approving and monitoring compliance requirements.",
        },
        {
          name: "Stakeholder Panel",
          role: "Stakeholder Discussions",
          summary:
            "Representatives across Rwanda's four focal biotech crops discussed harmonizing communication approaches and strengthening science-communication skills nationally.",
        },
      ],
      collaboration: [
        "Coordinated cross-institution messaging",
        "Public engagement campaigns",
        "Science communication skills training",
        "Continued REMA/RICA stakeholder dialogue",
      ],
      quote:
        "Trust is built not only through scientific evidence but also through clear, consistent, and responsible communication.",
      quoteSource: "Workshop Communication & Advocacy Session",
    },
  },
  {
    title: "Precision Biotechnology",
    img: "/image/Precision-decision.jpg",
    tag: "Precision Breeding",
    excerpt:
      "Through the Rwanda BioCap Project, Rwanda is building one of Africa's emerging hubs for gene editing and modern crop biotechnology at RAB's Centre of Excellence — using CRISPR genome editing to protect farmer-preferred banana varieties like Kamaramasenge and Ijangi from devastating diseases while preserving the traits farmers and consumers value most.",
    modal: {
      date: "15/12/2026",
      organizer: "By Nshimiyimana Pacifique — Rwanda BioCap Project",
      partners: "Rwanda Agriculture and Animal Resources Development Board (RAB) · RAB Rubona Centre of Excellence in Crop Biotechnology",
      intro:
        "For centuries, crop improvement has relied on selecting plants with desirable traits and crossing them over many generations. While conventional breeding has transformed global agriculture, it often transfers both desirable and undesirable genes together, requiring many years of repeated breeding before improved varieties are ready for farmers. Today, Rwanda is embracing a new era of agricultural innovation through precision biotechnology, a science-based approach that enables researchers to improve crops with remarkable precision while preserving the qualities that farmers cultivate and consumers prefer. Through the Rwanda BioCap Project, Rwanda is establishing one of Africa's emerging hubs for gene editing and modern crop biotechnology at RAB's Centre of Excellence in Crop Biotechnology, positioning the country among the first on the continent to build national capacity in precision breeding for Africa's food security crops.",
      objectives: [
        "Build national capacity in precision breeding for Africa's food security crops through advanced laboratories, scientific expertise, and responsible regulatory systems",
        "Apply CRISPR genome editing — first demonstrated as a programmable gene-editing tool in 2012 by Dr. Emmanuelle Charpentier and Dr. Jennifer A. Doudna, who received the 2020 Nobel Prize in Chemistry for the discovery",
        "Protect banana, which occupies approximately 258,500 hectares and produces over 1.14 million metric tonnes annually in Rwanda according to the National Institute of Statistics of Rwanda (NISR)",
        "Restore and protect farmer-preferred varieties rather than replace them, preserving taste, texture, aroma, and market value",
      ],
      sessions: [
        {
          name: "What is Precision Biotechnology?",
          role: "The science of targeted improvement",
          summary:
            "Precision biotechnology combines modern genomic tools that allow scientists to make highly targeted improvements within a plant's own DNA. Unlike conventional breeding, which reshuffles thousands of genes simultaneously, precision breeding modifies only the specific gene associated with an important agricultural trait while leaving the rest of the plant's genetic makeup unchanged. Often described as molecular genetic scissors, CRISPR enables scientists to precisely edit naturally occurring genes responsible for disease resistance, climate resilience, improved nutrition, and yield potential.",
        },
        {
          name: "Why Banana Matters to Rwanda",
          role: "Food security, income, and heritage",
          summary:
            "Banana is far more than a crop in Rwanda; it is a pillar of food security, nutrition, rural livelihoods, and cultural heritage. Yet production is already under severe pressure from Banana Xanthomonas Wilt (BXW) and Fusarium Wilt Tropical Race 4 (TR4), alongside climate change. For dessert bananas such as Kamaramasenge (also known as Sukari Ndizi), disease pressure has undermined a variety farmers rely on for income and consumers value for its sweetness, aroma, and market appeal. Because bananas are propagated vegetatively rather than through seeds, conventional breeding is exceptionally slow and technically challenging.",
        },
        {
          name: "Preserving What Farmers Prefer While Solving What They Do Not",
          role: "Protecting Ijangi and Kamaramasenge",
          summary:
            "One of the greatest advantages of genome editing is its ability to improve a single characteristic without altering the identity of a farmer-preferred variety. Ijangi, a consumer-loved green cooking banana used in dishes such as matoke and chips, faces urgent BXW pressure, while Kamaramasenge (Kamara/Sukari Ndizi) has already lost production potential and cooperative income to disease. Rather than asking farmers and consumers to abandon Kamaramasenge for a genetically different substitute, Rwanda BioCap's approach aims to restore and protect the existing variety itself — the variety remains Kamaramasenge, only stronger, more resilient, and better protected against disease.",
        },
      ],
      collaboration: [
        "Advanced laboratories and genomics infrastructure",
        "Bioinformatics and CRISPR genome editing capacity",
        "Greenhouse evaluation and biosafety assessment",
        "Variety registration and farmer deployment",
      ],
      quote:
        "The ability to rewrite the code of life has immense potential for improving human health, agriculture and the environment.",
      quoteSource: "Dr. Jennifer Doudna, 2020 Nobel Prize-winning biochemist",
    },
  },
  {
    title: "Communication & Social Engagement",
    img: "/image/IMG_155.jpg",
    tag: "Science Communication",
    excerpt:
      "The Rwanda BioCap Project is placing communication at the heart of responsible biotechnology — combating misinformation, empowering digital voices, reaching farmers through community radio, and using edutainment to build public trust in science.",
    modal: {
      date: "15/12/2026",
      organizer: "By Nshimiyimana Pacifique — Rwanda BioCap Project",
      partners: "Alliance for Science Rwanda (AfS-Rwanda) · Rwanda Agriculture Board (RAB) · Open Forum on Agricultural Biotechnology (OFAB) · Rwanda Media Commission (RMC)",
      intro:
        "No matter how innovative a new crop variety may be, its impact depends on whether farmers understand it, consumers trust it, policymakers support it, and communities feel included in the conversation. Recognizing this, the Rwanda BioCap Project places Communication & Social Engagement at the heart of its mission to advance responsible crop biotechnology.",
      objectives: [
        "Shift from one-way communication to genuine public engagement and dialogue",
        "Combat misinformation across social platforms with credible, fact-checked content",
        "Empower digital voices — influencers, agripreneurs, and educators — as science communicators",
        "Reach farmers through trusted traditional media, especially community radio",
        "Use edutainment, including radio drama series, to make biotechnology relatable",
      ],
      sessions: [
        {
          name: "From One-Way Communication to Public Engagement",
          role: "Building dialogue, not just messaging",
          summary:
            "Communication is treated as a continuous process connecting researchers, regulators, farmers, journalists, educators, policymakers, and the public throughout the innovation journey.",
        },
        {
          name: "Combating Misinformation in the Digital Age",
          role: "Evidence-based, fact-checked content",
          summary:
            "Working with AfS-Rwanda, RAB, OFAB, and the Rwanda Media Commission, BioCap strengthens science communication capacity among journalists and digital communicators to counter myths with credible information.",
        },
        {
          name: "Leaving No Farmer Behind",
          role: "Radio and inclusive outreach",
          summary:
            "Radio remains the most trusted and accessible platform in rural Rwanda. BioCap combines digital innovation with community radio, talk shows, and local-language programming to reach every farmer.",
        },
      ],
      collaboration: [
        "Journalist and digital communicator capacity building",
        "Radio and drama series (edutainment) development",
        "Farmer champion and influencer partnerships",
        "Cross-institutional misinformation response",
      ],
      quote:
        "The future of biotechnology will be shaped not only by scientific discoveries but also by how effectively science is communicated, understood and embraced by society.",
      quoteSource: "Rwanda BioCap Project — Communication & Social Engagement",
    },
  },
];

const cardStyles: Record<string, { icon: typeof Sprout; accent: string; accentBg: string }> = {
  "DNA Week": { icon: Sprout, accent: "#2A7F8C", accentBg: "#e6f4f6" },
  "Risk Assessment & Stewardship": { icon: ShieldCheck, accent: "#7B3FA0", accentBg: "#f3e8f9" },
  "Communication & Advocacy": { icon: Megaphone, accent: "#E8185A", accentBg: "#fde8ef" },
  "Precision Biotechnology": { icon: Dna, accent: "#2F8F5B", accentBg: "#e7f5ec" },
  "Communication & Social Engagement": { icon: Radio, accent: "#D97706", accentBg: "#fef3e2" },
};

// ── Inner content component ─────────────────────────────────────────
function StewardshipNewsContent() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const slug = searchParams.get('project');
    if (!slug) return;

    const match = ecoProjects.find(p => PROJECT_SLUGS[p.title] === slug);
    if (match) setActiveProject(match);
  }, [searchParams]);

  // Handle switching views directly between articles
  if (activeProject) {
    if (activeProject.title === 'Precision Biotechnology') {
      return (
        <PrecisionBiotechnologyArticle
          project={activeProject}
          onBack={() => setActiveProject(null)}
          allProjects={ecoProjects}
          onSelectProject={(selected) => setActiveProject(selected)}
        />
      );
    }
    if (activeProject.title === 'Communication & Social Engagement') {
      return (
        <CommunicationSocialEngagementArticle
          project={activeProject}
          onBack={() => setActiveProject(null)}
          allProjects={ecoProjects}
          onSelectProject={(selected: Project) => setActiveProject(selected)}
        />
      );
    }
    return (
      <ProjectDetailPage
        project={activeProject}
        onBack={() => setActiveProject(null)}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .env-page { font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #334155; }
        .env-serif { font-family: 'DM Serif Display', Georgia, serif; }

        .env-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .env-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f3;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s, border-color 0.28s;
        }
        .env-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 3px;
          background: linear-gradient(90deg, #1B3A5C, #E8185A);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          z-index: 10;
        }
        .env-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 44px rgba(27,58,92,0.14);
          border-color: transparent;
        }
        .env-card:hover::before { transform: scaleX(1); }

        .env-card-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.85rem;
          flex-shrink: 0;
          transition: transform 0.25s;
        }
        .env-card:hover .env-card-icon { transform: scale(1.08) rotate(-4deg); }
      `}</style>

      <div className="env-page">
        {/* ── HERO SECTION ── */}
        <section className="relative overflow-hidden min-h-[420px] flex items-center px-6 lg:px-12">
          <div className="absolute inset-0 z-0">
            <img
              src="/image/IMG_149.jpg"
              alt="BioCap Environment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C] via-[#1B3A5C]/85 to-transparent" />
          </div>

          <div className="relative z-20 max-w-4xl py-10">
            <p className="text-[#E8185A] text-xs font-bold tracking-[4px] uppercase mb-3 drop-shadow-md">
              Agriculture  &amp; Science
            </p>
            <h1 className="env-serif text-5xl lg:text-7xl text-white leading-tight mb-4 italic drop-shadow-lg">
              Infrastructure  <span className="text-[#E8185A]">development</span>
            </h1>
            <p className="text-white/90 text-lg max-w-xl leading-relaxed font-medium drop-shadow-md">
              Rwanda BioCap Project emphasizes on the role of human capacity development, 
              laboratory infrastructure and stewardship; 
              to ensure a sustained deployment of innovations in crop biotechnology for farmers’ field productivity and environmental stewardship.
            </p>
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

        {/* ── CORE CONTENT ── */}
        <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center bg-white">
          <div className="relative">
            <div className="bg-[#1B3A5C] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img src="/image/IMG_101.jpg" className="w-full h-full object-cover" alt="Sustainable Farming" />
            </div>
            <div className="absolute bottom-[-20px] right-[-20px] bg-white p-6 rounded-2xl shadow-xl max-w-[260px] border border-slate-100">
              <p className="env-serif italic text-[#1B3A5C] text-lg leading-snug">
                &ldquo;Changing how we grow food and take care of our environment.&rdquo;
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest">
              <div className="w-6 h-[2px] bg-[#E8185A]" /> Our Commitment &amp; Stewardship Program
            </div>
            <h2 className="env-serif text-3xl lg:text-4xl text-[#1B3A5C] leading-tight">
              A Sustainable Agriculture for <span className="text-[#E8185A] italic">Rwanda</span>
            </h2>
            <p className="text-slate-600 text-base leading-relaxed text-justify">
              "We don't have time, We need faster and more effective delivery of solutions to our farmers, 
              and we must establish strong partnership models. This is also the time to communicate science
              effectively to build trust."
            </p>
            <p className="text-[#1B3A5C] text-sm font-bold mt-1">
              — Dr. Joyce Maru, <span className="font-normal text-slate-500">Regional Director - CIP</span>
            </p>
          </div>
        </section>

        {/* ── STEWARDSHIP / PROJECT GRID ── */}
        <section className="py-16 bg-[#f7f6f4] px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 text-[#E8185A] text-xs font-bold uppercase tracking-widest mb-3">
                <div className="w-6 h-[2px] bg-[#E8185A]" /> What We're Building
                <div className="w-6 h-[2px] bg-[#E8185A]" />
              </div>
              <h2 className="env-serif text-3xl lg:text-4xl text-[#1B3A5C] mb-3">
                Biotech Stewardship News
              </h2>
              <div className="w-14 h-1 rounded-full mx-auto" style={{ background: 'linear-gradient(90deg, #E8185A, #ff4d8b)' }} />
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {ecoProjects.map((p, i) => {
                const style = cardStyles[p.title];
                const Icon = style?.icon;
                return (
                  <div key={i} className="env-card shadow-sm">
                    <div className="h-56 overflow-hidden relative">
                      <img
                        src={p.img}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        alt={p.title}
                      />
                      <div
                        className="absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase"
                        style={{ background: 'rgba(255,255,255,0.9)', color: style?.accent ?? '#E8185A' }}
                      >
                        {p.tag}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      {Icon && (
                        <div className="env-card-icon" style={{ background: style.accentBg, color: style.accent }}>
                          <Icon size={22} strokeWidth={1.75} />
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-[#1B3A5C] mb-2">{p.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-5 text-justify flex-1">
                        {p.excerpt}
                      </p>
                      <button
                        onClick={() => setActiveProject(p)}
                        className="text-[#E8185A] font-bold text-xs uppercase tracking-widest hover:gap-3 flex items-center gap-2 transition-all mt-auto"
                      >
                        Learn More <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ── */}
        <section className="py-16 px-6 lg:px-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f2240 0%, #254a7a 55%, #1e4976 100%)' }}>
          <div className="env-dots" />
          <div className="max-w-3xl mx-auto relative z-10 text-center text-white">
            <svg className="w-8 h-8 mx-auto mb-6 text-[#E8185A]/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <p className="env-serif italic text-2xl md:text-3xl leading-relaxed mb-8 text-justify">
              Science is the best tool we have to protect our hills and valleys while ensuring no
              Rwandan goes hungry.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E8185A] flex items-center justify-center font-bold text-sm">
                BC
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Rwanda BioCap Research Team</p>
                <p className="text-white/50 text-[10px] uppercase tracking-widest">Kigali, Rwanda</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

// ── Page Wrapper ──
export default function EnvironmentPage() {
  return (
    <Suspense fallback={null}>
      <StewardshipNewsContent />
    </Suspense>
  );
}