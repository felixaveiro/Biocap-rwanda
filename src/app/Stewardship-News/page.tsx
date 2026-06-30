'use client';

import React, { useState } from 'react';
import Footer from '@/components/Footer';
import ProjectDetailPage, { type Project } from '@/components/ProjectDetailPage';

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
    img: "/image/2R0A9989.jpg",
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
    img: "/image/2R0A0175.jpg",
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
];

// ── Page ─────────────────────────────────────────────────────────────
export default function EnvironmentPage() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // If a project is selected, render its detail page instead
  if (activeProject) {
    return (
      <ProjectDetailPage
        project={activeProject}
        onBack={() => setActiveProject(null)}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ── HERO SECTION ── */}
      <section className="relative h-[500px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/image/IMG_149.jpg"
            alt="BioCap Environment"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a3a5c]/65"></div>
        </div>

        <div className="relative z-10 text-white px-6">
          <p className="text-xs font-bold tracking-[5px] uppercase mb-4 text-[#e8185e]">Nature & Science</p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold italic leading-tight drop-shadow-lg">
            Protecting Our <br/> Environment
          </h1>
        </div>

        <div className="absolute bottom-[-1px] left-0 w-full z-20 leading-[0]">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,34.75V0Z" fill="#ffffff"></path>
          </svg>
        </div>
      </section>

      {/* ── CORE CONTENT ── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl h-[450px]">
            <img src="/image/IMG_101.jpg" className="w-full h-full object-cover" alt="Sustainable Farming" />
          </div>
          <div className="absolute bottom-[-20px] right-[-20px] bg-[#e8185e] text-white p-8 rounded-2xl shadow-xl max-w-[280px]">
            <p className="font-bold italic text-lg leading-snug">"Changing how we grow food and take care of our environment."</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-[2px] bg-[#e8185e]"></div>
            <span className="text-[#e8185e] font-bold uppercase tracking-widest text-xs">Our Commitment & Stewardship Activities</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1a3a5c] font-bold leading-tight">
            Sustainable Agriculture for <span className="italic text-[#e8185e]">Rwanda.</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Stronger crops can reduce the need for too many chemicals, and better seeds can
            grow well even in tough conditions. This supports sustainable agriculture and
            helps us use our land more wisely.
          </p>
        </div>
      </section>

      {/* ── PROJECT GRID ── */}
      <section className="py-24 bg-slate-50 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif font-bold text-[#1a3a5c]">Biotech Stewardship News</h2>
            <div className="w-20 h-1 bg-[#e8185e] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {ecoProjects.map((p, i) => (
              <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="h-64 overflow-hidden relative">
                  <img src={p.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.title} />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase text-[#e8185e]">{p.tag}</div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-[#1a3a5c] mb-3">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-4">
                    {p.excerpt}
                  </p>
                  <button
                    onClick={() => setActiveProject(p)}
                    className="text-[#e8185e] font-bold text-xs uppercase tracking-widest hover:gap-3 flex items-center gap-2 transition-all"
                  >
                    Learn More <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-24 bg-[#1a3a5c] text-white text-center px-6 overflow-hidden relative">
        <div className="absolute opacity-5 right-[-50px] top-0">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="white"><path d="M12 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-4xl mb-8">"</div>
          <p className="text-2xl md:text-3xl font-serif italic leading-relaxed mb-10">
            Science is the best tool we have to protect our hills and valleys while ensuring no Rwandan goes hungry.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#e8185e] flex items-center justify-center font-bold">BC</div>
            <div className="text-left">
              <p className="font-bold text-sm">BioCap Research Team</p>
              <p className="text-white/50 text-[10px] uppercase tracking-widest">Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}