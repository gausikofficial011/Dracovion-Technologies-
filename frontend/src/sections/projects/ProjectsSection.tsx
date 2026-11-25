import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Sparkles, Layers, Shield, ExternalLink, Code2, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from '../../components/ui/GithubIcon';

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: 'Web Applications' | 'AI & ML' | 'Mobile Applications' | 'Enterprise Systems' | 'Automation' | 'UI/UX';
  description: string;
  techStack: string[];
  metrics: string;
  deliverables: string;
  githubUrl?: string;
  imageAccent: string;
  highlights: string[];
}

export const featuredProjects: ProjectItem[] = [
  {
    id: 'proj-intelligrade',
    slug: 'intelligrade-ai',
    title: 'IntelliGrade — AI Answer Script Evaluation & Document Intelligence',
    category: 'AI & ML',
    description: 'Enterprise-grade academic platform automating the digitization, multi-engine OCR transcription, and 7-signal explainable AI evaluation of handwritten student examination answer scripts with human-in-the-loop teacher review.',
    techStack: ['Python', 'FastAPI', 'React 19', 'PostgreSQL', 'PyTorch', 'Celery', 'Redis', 'Docker'],
    metrics: '1,520+ automated test suites passed • 90%+ auto-suggested grading confidence tier',
    deliverables: 'Multi-engine OCR ensemble, 7-signal evaluation engine, LaTeX formula OCR, institutional analytics',
    githubUrl: 'https://github.com/gausikofficial011/IntelliGrade',
    imageAccent: 'from-amber-500/25 via-[#D6A94F]/15 to-transparent',
    highlights: [
      'Multi-engine OCR fusion (Tesseract, EasyOCR, Surya, PaddleOCR, docTR)',
      'Mathematical formula recognition via LaTeX-OCR (pix2tex)',
      'Explainable 7-signal AI rubric scoring (semantic, concept, keyword, reasoning)',
      'Multi-tenant academic hierarchy with student privacy compliance',
    ],
  },
  {
    id: 'proj-buildsphere',
    slug: 'buildsphere-ai',
    title: 'BuildSphere AI — Enterprise Construction Management & BIM Platform',
    category: 'Enterprise Systems',
    description: 'Comprehensive enterprise civil and construction operations platform integrating 3D BIM spatial models, interactive floorplans, task kanban, site issue tracking, and automated Google Docs engineering logs across 25 portal roles.',
    techStack: ['FastAPI', 'Python', 'React 19', 'TypeScript', '3D BIM / Spatial', 'SQLite / Postgres', 'Docker'],
    metrics: '25 isolated portal roles • Sub-second BIM telemetry & floorplan inspection',
    deliverables: 'Full-stack platform, BIM 3D viewer, daily site log engine, Google Docs export',
    githubUrl: 'https://github.com/gausikofficial011/BuildSphere-AI',
    imageAccent: 'from-[#FFBD55]/25 via-amber-600/15 to-transparent',
    highlights: [
      'Interactive 3D Digital Twin & spatial floorplan inspection',
      'Unified issue tracker: RFI, NCR, Snag, Risk & Change Orders',
      'Daily site logs with automated Google Docs and PDF report generation',
      'Granular RBAC orchestrating 25 distinct site contractor and engineer roles',
    ],
  },
  {
    id: 'proj-sentinelx',
    slug: 'sentinelx-ai',
    title: 'SentinelX AI — Autonomous Security & Threat Intelligence Mesh',
    category: 'AI & ML',
    description: 'Autonomous neural edge surveillance and threat intelligence system featuring live video stream telemetry, real-time perimeter anomaly detection, automated alert dispatch, and cross-platform mobile officer command apps.',
    techStack: ['TypeScript', 'Python', 'FastAPI', 'PyTorch', 'React Native', 'WebRTC', 'Docker'],
    metrics: 'Real-time neural edge inference • Sub-120ms video telemetry alert dispatch',
    deliverables: 'Surveillance neural pipeline, operator dashboard, mobile incident apps',
    githubUrl: 'https://github.com/gausikofficial011/SentinelX-AI',
    imageAccent: 'from-purple-500/20 via-indigo-600/10 to-transparent',
    highlights: [
      'Autonomous video stream ingestion and temporal anomaly detection',
      'Instant push alerts to perimeter officers and central dispatchers',
      'Cross-platform responsive operator console with dark-mode HUD',
      'Zero-latency WebRTC streams for multi-camera facility coverage',
    ],
  },
  {
    id: 'proj-emergency-system',
    slug: 'real-time-emergency-system',
    title: 'Real-Time Emergency Response & Dispatch System 3.0',
    category: 'Mobile Applications',
    description: 'Mission-critical emergency coordination and dispatch application enabling instant citizen SOS beacon broadcasting, automated GPS triangulation, multi-agency triage allocation, and live first-responder navigation.',
    techStack: ['TypeScript', 'React Native', 'Node.js', 'Express', 'Socket.io', 'Mapbox / GPS', 'MongoDB'],
    metrics: 'Sub-3 second beacon dispatch to nearest responding unit • 99.99% mission uptime',
    deliverables: 'Citizen mobile application, first-responder dashboard, dispatch command center',
    githubUrl: 'https://github.com/gausikofficial011/Real-Time-Emergency-System-3.0-APP',
    imageAccent: 'from-rose-500/20 via-red-600/10 to-transparent',
    highlights: [
      'Instant one-tap SOS beacon with automated background telemetry',
      'Dynamic routing algorithm optimizing responder travel time',
      'Real-time WebSocket telemetry connecting ambulances, fire, and police',
      'Offline-tolerant local SQLite synchronization for zero-network scenarios',
    ],
  },
  {
    id: 'proj-rag-voice',
    slug: 'rag-voice-ai-platform',
    title: 'RAG Voice AI — Multimodal Interactive Knowledge Assistant',
    category: 'AI & ML',
    description: 'Voice-first Retrieval-Augmented Generation agent architecture combining real-time streaming speech recognition, high-density vector search, grounded LLM synthesis, and ultra-low latency audio response streaming.',
    techStack: ['Python', 'FastAPI', 'LangChain', 'ChromaDB', 'Whisper', 'WebSockets', 'React'],
    metrics: 'Sub-450ms end-to-end voice query response • 100% grounded domain citations',
    deliverables: 'Full-duplex voice WebSocket server, vector ingestion engine, client voice UI',
    githubUrl: 'https://github.com/gausikofficial011/RAG-VOICE-AI-PLATFORM',
    imageAccent: 'from-[#D6A94F]/20 via-[#FFBD55]/10 to-transparent',
    highlights: [
      'Full-duplex streaming audio pipeline with turn-taking detection',
      'Grounded retrieval mitigating hallucinations via vector embeddings',
      'Custom knowledge-base ingestion for institutional documents and manuals',
      'Lightweight React client with live audio waveform visualization',
    ],
  },
  {
    id: 'proj-securevendor',
    slug: 'securevendor-commerce',
    title: 'SecureVendor — Multi-Tenant WhatsApp B2B Commerce Platform',
    category: 'Web Applications',
    description: 'Secure multi-tenant commerce engine connecting industrial and consumer merchants to verified WhatsApp ordering channels, automated GST billing, credit terms ledgers, and real-time inventory management.',
    techStack: ['TypeScript', 'React 19', 'Node.js', 'WhatsApp Cloud API', 'PostgreSQL', 'Tailwind CSS'],
    metrics: 'Automated 100% catalog-to-WhatsApp conversion • Zero lost checkout carts',
    deliverables: 'Multi-tenant vendor dashboard, WhatsApp ordering bot, GST invoice engine',
    githubUrl: 'https://github.com/gausikofficial011/securevendor',
    imageAccent: 'from-emerald-500/20 via-teal-600/10 to-transparent',
    highlights: [
      'Interactive WhatsApp catalog browsing and instant 1-click cart submission',
      'Automated GST compliant PDF generation with state tax rules',
      'Multi-branch vendor isolation with dedicated custom domain routing',
      'Real-time order synchronization with push notification updates',
    ],
  },
];

export const ProjectsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'AI & ML',
    'Enterprise Systems',
    'Mobile Applications',
    'Web Applications',
  ];

  const filtered =
    activeCategory === 'All'
      ? featuredProjects
      : featuredProjects.filter((p) => p.category === activeCategory);

  return (
    <section className="relative py-24 bg-transparent border-t border-[#292E38]/60" aria-label="Featured Projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL PRODUCTION SHOWCASE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight leading-tight">
              ENGINEERED REALITIES. <br />
              <span className="text-gold-shimmer">
                PROVEN CODEBASES.
              </span>
            </h2>
            <p className="text-base text-[#9299A6] leading-relaxed">
              Explore authentic software platforms built, tested, and published by Dracovion Technologies — featuring verified GitHub repositories, production architectures, and real-world performance benchmarks.
            </p>
          </div>

          <Link
            to="/projects"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-[#FFBD55] hover:text-white transition-colors group cursor-pointer"
          >
            <span>View All Engineering Repositories</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] text-[#050609] font-bold shadow-md shadow-[#D6A94F]/25'
                  : 'bg-[#11151D] text-[#9299A6] hover:text-white border border-[#292E38]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, idx) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-8 rounded-3xl bg-[#080A0E]/90 backdrop-blur-md border border-[#292E38] hover:border-[#D6A94F]/60 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)] group relative overflow-hidden select-none"
              >
                {/* Background Accent Aura */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${project.imageAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="relative z-10 space-y-4">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold text-[#FFBD55] bg-[#11151D] border border-[#D6A94F]/30 uppercase">
                      {project.category}
                    </span>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#9299A6] hover:text-[#FFBD55] transition-colors font-mono"
                        title="View Verified GitHub Repository"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Repository</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-display font-bold text-white group-hover:text-[#F5D18A] transition-colors leading-snug">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#9299A6] leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Verified Metric Badge */}
                  <div className="p-3.5 rounded-xl bg-[#11151D] border border-[#292E38]">
                    <div className="text-[10px] font-mono text-[#D6A94F] uppercase font-bold flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#52D69A]" />
                      <span>Verified Outcome Benchmark</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed font-mono">
                      {project.metrics}
                    </div>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-1.5 pt-1">
                    {project.highlights.slice(0, 2).map((hl, i) => (
                      <li key={i} className="text-[11px] text-[#B7BBC4] flex items-start gap-2">
                        <span className="text-[#FFBD55] font-bold mt-0.5">•</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-[#15191F] border border-[#292E38] text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-6 mt-6 border-t border-[#292E38] relative z-10 flex items-center justify-between">
                  <Link
                    to={`/portfolio/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFBD55] group-hover:text-white transition-colors"
                  >
                    <span>Inspect Case Study</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#11151D] border border-[#292E38] text-[#9299A6] hover:text-[#FFBD55] hover:border-[#D6A94F]/50 transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
