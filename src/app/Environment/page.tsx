'use client';

import React, { useState } from 'react';
import Footer from '@/components/Footer';

// ── Project data with full modal content ───────────────────────────
const ecoProjects = [
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
    title: "Soil Regeneration",
    img: "/image/image-07.jpg",
    tag: "Nature",
    excerpt:
      "Field initiatives focused on rebuilding soil health and fertility across farming communities, supporting long-term resilience and reducing dependence on chemical inputs.",
    modal: {
      date: "Ongoing",
      organizer: "BioCAP Rwanda",
      partners: "RAB · Local Farming Cooperatives",
      intro:
        "Soil regeneration efforts focus on restoring degraded farmland through improved crop varieties, reduced chemical dependency, and sustainable land management practices that help farmers build healthier, more productive soil over time.",
      objectives: [
        "Improve long-term soil fertility for smallholder farmers",
        "Reduce reliance on synthetic chemical inputs",
        "Pair biotech crop resistance with sustainable land practices",
      ],
      sessions: [],
      collaboration: [],
      quote: "",
      quoteSource: "",
    },
  },
  {
    title: "Climate Resilience",
    img: "/image/image-09.jpg",
    tag: "Future",
    excerpt:
      "Research and farmer programs aimed at preparing Rwandan agriculture for shifting weather patterns, with crops bred to withstand drought, disease, and changing growing conditions.",
    modal: {
      date: "Ongoing",
      organizer: "BioCAP Rwanda",
      partners: "RAB · International Research Partners",
      intro:
        "Climate resilience work prepares Rwandan agriculture for shifting weather patterns through crop varieties bred to withstand drought, disease pressure, and unpredictable growing seasons — protecting yields as conditions change.",
      objectives: [
        "Develop crop varieties tolerant to drought and heat stress",
        "Support farmers adapting to shifting rainfall patterns",
        "Strengthen food security under changing climate conditions",
      ],
      sessions: [],
      collaboration: [],
      quote: "",
      quoteSource: "",
    },
  },
];

type Project = typeof ecoProjects[number];

// ── Modal ───────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const m = project.modal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#1a3a5c] font-bold shadow-md"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header image */}
        <div className="h-56 relative">
          <img src={project.img} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1a3a5c]/55"></div>
          <div className="absolute top-5 left-5 bg-white/90 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-[#e8185e]">
            {project.tag}
          </div>
          <div className="absolute bottom-5 left-6 right-6">
            <h2 className="text-3xl font-serif font-bold italic text-white drop-shadow-lg">
              {project.title}
            </h2>
            {m.date && (
              <p className="text-white/80 text-xs uppercase tracking-widest font-semibold mt-1">
                {m.date}
              </p>
            )}
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Organizer / partners */}
          {(m.organizer || m.partners) && (
            <div className="grid md:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-5">
              {m.organizer && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#e8185e] mb-1">
                    Organized by
                  </p>
                  <p className="text-[#1a3a5c] font-semibold text-sm">{m.organizer}</p>
                </div>
              )}
              {m.partners && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#e8185e] mb-1">
                    Partners
                  </p>
                  <p className="text-[#1a3a5c] font-semibold text-sm">{m.partners}</p>
                </div>
              )}
            </div>
          )}

          {/* Intro */}
          <p className="text-gray-600 leading-relaxed">{m.intro}</p>

          {/* Objectives */}
          {m.objectives.length > 0 && (
            <div>
              <p className="text-[#e8185e] font-bold uppercase tracking-widest text-xs mb-3">
                Objectives
              </p>
              <ul className="space-y-2">
                {m.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#1a3a5c] text-sm font-medium">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#e8185e] flex-shrink-0"></span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sessions / speakers */}
          {m.sessions.length > 0 && (
            <div>
              <p className="text-[#e8185e] font-bold uppercase tracking-widest text-xs mb-4">
                Sessions & Speakers
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {m.sessions.map((s, i) => (
                  <div key={i} className="border border-slate-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#e8185e] mb-1">
                      {s.role}
                    </p>
                    <p className="text-[#1a3a5c] font-bold text-sm mb-1">{s.name}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{s.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collaboration tags */}
          {m.collaboration.length > 0 && (
            <div>
              <p className="text-[#e8185e] font-bold uppercase tracking-widest text-xs mb-3">
                Collaboration Opportunities
              </p>
              <div className="flex flex-wrap gap-2">
                {m.collaboration.map((c, i) => (
                  <span
                    key={i}
                    className="bg-[#1a3a5c] text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quote */}
          {m.quote && (
            <div className="bg-[#1a3a5c] rounded-2xl p-6 text-center">
              <p className="text-white font-serif italic text-lg leading-relaxed mb-3">
                "{m.quote}"
              </p>
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">
                {m.quoteSource}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────
export default function EnvironmentPage() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ── HERO SECTION ── */}
      <section className="relative h-[500px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/image/image-02.jpg"
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
             <img src="/image/image-06.jpg" className="w-full h-full object-cover" alt="Sustainable Farming" />
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

      {activeProject && (
        <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      )}
    </div>
  );
}