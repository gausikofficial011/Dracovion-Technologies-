import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Database, ShieldCheck, ArrowRight, Sparkles, ExternalLink, Activity, Layers, Cpu } from 'lucide-react';
import { GithubIcon } from '../../components/ui/GithubIcon';

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: 'Live Platform' | 'Active Production' | 'Private Beta';
  tagline: string;
  description: string;
  metrics: string[];
  features: string[];
  href: string;
  githubUrl?: string;
}

export const productsList: ProductItem[] = [
  {
    id: 'intelligrade',
    name: 'IntelliGrade AI Platform',
    slug: 'intelligrade-ai',
    category: 'EdTech & Document Intelligence',
    status: 'Live Platform',
    tagline: 'Multi-Engine OCR & 7-Signal AI Examination Script Evaluation',
    description: 'An enterprise-grade academic platform automating the digitization, multi-engine OCR transcription, and 7-signal explainable AI evaluation of handwritten student examination answer scripts with human-in-the-loop teacher review.',
    metrics: ['1,520+ Automated Tests', '90%+ Auto-Grade Confidence', 'LaTeX-OCR Math Recognition'],
    features: [
      'Multi-engine OCR consensus (Tesseract, EasyOCR, Surya, docTR)',
      'Explainable 7-signal evaluation (semantic, reasoning, concepts)',
      'Human-in-the-loop teacher review & approval state machine',
      'Multi-tenant academic hierarchy with student privacy security',
    ],
    href: '/portfolio/intelligrade-ai',
    githubUrl: 'https://github.com/gausikofficial011/IntelliGrade',
  },
  {
    id: 'buildsphere',
    name: 'BuildSphere AI Enterprise',
    slug: 'buildsphere-ai',
    category: 'Civil & Construction Tech',
    status: 'Active Production',
    tagline: '3D BIM Digital Twin & Real-World Operations Orchestrator',
    description: 'A cloud-native construction operations and project management platform featuring interactive 3D BIM spatial digital twins, daily site logs, issue trackers (RFI / NCR / Snag / Risk / Change Order), and Google Docs reporting across 25 portal roles.',
    metrics: ['25 Isolated Portal Roles', 'Interactive 3D BIM Spatial Inspection', 'Automated Google Docs Reports'],
    features: [
      'Digital Twin & interactive floorplan spatial inspection',
      'Unified issue tracker for site RFIs, NCRs, and risk alerts',
      'Automated daily engineering site log synchronization',
      'JWT role-isolated workspaces for all project stakeholders',
    ],
    href: '/portfolio/buildsphere-ai',
    githubUrl: 'https://github.com/gausikofficial011/BuildSphere-AI',
  },
  {
    id: 'sentinelx',
    name: 'SentinelX Autonomous AI',
    slug: 'sentinelx-ai',
    category: 'Cybersecurity & Edge AI',
    status: 'Active Production',
    tagline: 'Autonomous Perimeter Security & Live Threat Intelligence Mesh',
    description: 'Autonomous neural edge surveillance and security intelligence mesh featuring real-time video telemetry stream ingestion, perimeter anomaly classification, sub-120ms alert dispatch, and cross-platform mobile officer command apps.',
    metrics: ['Sub-120ms Neural Ingestion', 'Zero-Latency WebRTC Video', 'Mobile Tactical Dispatch'],
    features: [
      'Real-time temporal anomaly detection on video streams',
      'Automated geolocation beacon routing to mobile patrol units',
      'Dark-mode tactical HUD for operations center dispatchers',
      'Edge computing support with offline event queue caching',
    ],
    href: '/portfolio/sentinelx-ai',
    githubUrl: 'https://github.com/gausikofficial011/SentinelX-AI',
  },
];

export const ProductsSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-transparent border-t border-[#292E38]/60" aria-label="Products & Innovations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PROPRIETARY DIGITAL PLATFORMS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight leading-tight">
              BUILDING DIGITAL PRODUCTS <br />
              <span className="text-gold-shimmer">
                FOR THE FUTURE.
              </span>
            </h2>
            <p className="text-base text-[#9299A6] leading-relaxed">
              Dracovion Technologies engineers and deploys autonomous software platforms addressing high-stakes operations in academic document intelligence, construction management, and neural threat surveillance.
            </p>
          </div>

          <Link
            to="/products"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-[#FFBD55] hover:text-white transition-colors group cursor-pointer"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {productsList.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="p-8 rounded-3xl bg-[#080A0E]/90 backdrop-blur-md border border-[#292E38] hover:border-[#D6A94F]/60 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_-10px_rgba(214,169,79,0.25)] group select-none relative overflow-hidden"
            >
              <div>
                {/* Top Badge: Category & Status */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-mono tracking-wider text-[#9299A6] uppercase">
                    {product.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                      product.status === 'Live Platform'
                        ? 'bg-emerald-500/10 text-[#52D69A] border-emerald-500/30'
                        : 'bg-amber-500/10 text-[#FFBD55] border-amber-500/30'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>{product.status}</span>
                  </span>
                </div>

                {/* Product Name & Tagline */}
                <h3 className="text-2xl font-display font-bold text-white group-hover:text-[#F5D18A] transition-colors mb-2">
                  {product.name}
                </h3>
                <div className="text-xs font-mono text-[#D6A94F] mb-4 font-semibold">
                  {product.tagline}
                </div>

                <p className="text-xs text-[#9299A6] leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Metrics Badges */}
                <div className="space-y-2 mb-6">
                  {product.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-xs font-mono text-slate-300 flex items-center gap-2"
                    >
                      <Activity className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>

                {/* Key Features List */}
                <ul className="space-y-2 mb-8">
                  {product.features.map((feat, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-[#FFBD55] font-bold mt-0.5">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#292E38] flex items-center justify-between gap-3">
                <Link
                  to={product.href}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#FFBD55] group-hover:text-white transition-colors"
                >
                  <span>Explore Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                {product.githubUrl && (
                  <a
                    href={product.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-[#9299A6] hover:text-[#FFBD55] hover:border-[#D6A94F]/50 transition-colors"
                    title="View GitHub Repository"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
