import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { featuredProjects } from '../../sections/projects/ProjectsSection';
import type { ProjectItem } from '../../sections/projects/ProjectsSection';
import {
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Layers,
  Cpu,
  Award,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { GithubIcon } from '../../components/ui/GithubIcon';

export const PortfolioDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Find in static list first
    const found = featuredProjects.find((p) => p.slug === slug);
    if (found) {
      setProject({
        title: found.title,
        industry: found.category,
        summary: found.description,
        githubUrl: found.githubUrl,
        highlights: found.highlights,
        problemStatement:
          found.slug === 'intelligrade-ai'
            ? 'Educational institutions struggle with slow, manual examination grading, subjective scoring inconsistencies, and the high friction of digitizing handwritten mathematical equations and regional language answer scripts.'
            : found.slug === 'buildsphere-ai'
            ? 'Civil and construction enterprises grapple with fragmented communication between site engineers, contractors, and architects, lost daily site logs, delayed RFI resolution, and lack of live 3D BIM spatial tracking.'
            : found.slug === 'sentinelx-ai'
            ? 'Traditional security systems rely on passive video recording with high human operator fatigue, leading to missed perimeter breaches and delayed tactical response during critical security incidents.'
            : found.slug === 'real-time-emergency-system'
            ? 'Emergency dispatch systems experience lethal delays due to inaccurate citizen coordinate broadcasting, congested dispatcher queues, and uncoordinated triage allocation between medical, police, and fire units.'
            : found.slug === 'rag-voice-ai-platform'
            ? 'Voice interaction systems suffer from noticeable latency (>1.5s), hallucinated responses without verifiable grounding, and poor contextual turn-taking during complex technical customer inquiries.'
            : 'Merchants lose significant sales due to complex retail checkouts, lack of native WhatsApp catalog ordering, and manual GST invoice calculations that delay B2B fulfillment.',
        solutionOverview:
          found.slug === 'intelligrade-ai'
            ? 'Architected a multi-engine OCR consensus ensemble (Tesseract, EasyOCR, Surya, PaddleOCR, docTR) paired with LaTeX-OCR and a 7-signal explainable AI evaluation engine (semantic, keyword, concept, reasoning, completeness) with a strict human-in-the-loop teacher review workflow.'
            : found.slug === 'buildsphere-ai'
            ? 'Engineered a full-stack platform featuring interactive 3D BIM spatial models, floorplan viewers, real-world task kanbans, unified issue trackers (RFI, NCR, Risk, Change Order), and automated daily Google Docs engineering report generators.'
            : found.slug === 'sentinelx-ai'
            ? 'Deployed an autonomous neural edge computing pipeline with real-time video telemetry stream ingestion, temporal anomaly classification, and automated instant push alerts to mobile perimeter officers.'
            : found.slug === 'real-time-emergency-system'
            ? 'Engineered a sub-second WebSocket telemetry mesh with one-tap SOS beacon broadcasting, automated GPS triangulation, nearest-responder dynamic routing, and offline-tolerant SQLite sync.'
            : found.slug === 'rag-voice-ai-platform'
            ? 'Constructed a full-duplex streaming audio pipeline utilizing Whisper, ChromaDB dense vector indexing, and LangChain orchestration to synthesize verified, cited domain answers under 450ms.'
            : 'Engineered a multi-tenant WhatsApp Cloud API commerce gateway with interactive catalog carts, automated GST calculation engine, and customer credit ledger tracking.',
        outcomeMetrics: [
          found.metrics,
          'Production-tested architecture published with verified public source code',
          'Strict end-to-end type safety with zero runtime regression tolerance',
        ],
        techStack: found.techStack,
      });
      setIsLoading(false);
      return;
    }

    // Query backend
    api
      .get<{ success: boolean; portfolioItem: any }>(`/catalog/portfolio/${slug}`)
      .then((res) => setProject(res.portfolioItem))
      .catch(() => {
        setProject(featuredProjects[0]);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-[#9299A6] font-mono bg-transparent">
        Loading case study...
      </div>
    );
  }

  const item = project || featuredProjects[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-transparent relative z-10 select-none">
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9299A6] hover:text-[#FFBD55] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Case Studies</span>
        </Link>

        {item.githubUrl && (
          <a
            href={item.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11151D] border border-[#D6A94F]/40 text-xs font-mono font-bold text-[#FFBD55] hover:border-[#FFBD55] hover:text-white transition-all shadow-md"
          >
            <GithubIcon className="w-4 h-4" />
            <span>View Source Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{item.industry || 'CASE STUDY'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-gold-gradient leading-tight">
          {item.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-4xl leading-relaxed pt-2">
          {item.summary}
        </p>
      </div>

      {/* Problem & Solution Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-[#080A0E]/90 backdrop-blur-md border border-[#292E38] space-y-3">
          <div className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider">
            The Operational Challenge
          </div>
          <h3 className="text-xl font-display font-bold text-white">Client Friction & Bottlenecks</h3>
          <p className="text-sm text-slate-300 leading-relaxed pt-2">{item.problemStatement}</p>
        </div>

        <div className="p-8 rounded-3xl bg-[#080A0E]/90 backdrop-blur-md border border-[#292E38] space-y-3">
          <div className="text-xs font-mono font-semibold text-[#FFBD55] uppercase tracking-wider">
            The Dracovion Resolution
          </div>
          <h3 className="text-xl font-display font-bold text-white">Engineering Strategy & Execution</h3>
          <p className="text-sm text-slate-300 leading-relaxed pt-2">{item.solutionOverview}</p>
        </div>
      </div>

      {/* Outcome Metrics */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#080A0E]/90 backdrop-blur-md border border-[#D6A94F]/50 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-[#FFBD55]" />
          <h3 className="text-xl font-display font-bold text-white">Verified Outcome Telemetry</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(item.outcomeMetrics || []).map((metric: string, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-[#11151D] border border-[#292E38] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-slate-200">{metric}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Chips */}
      <div className="p-8 rounded-3xl bg-[#080A0E]/90 backdrop-blur-md border border-[#292E38] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#FFBD55]" />
            <span>Architecture & Technologies Used</span>
          </h3>
          {item.githubUrl && (
            <a
              href={item.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#D6A94F] hover:text-[#FFBD55] hover:underline flex items-center gap-1"
            >
              <span>GitHub Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(item.techStack || ['React', 'TypeScript', 'Python', 'FastAPI']).map((tech: string) => (
            <span
              key={tech}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-[#11151D] border border-[#292E38] text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0A0D13] via-[#11151D] to-[#0A0D13] border border-[#D6A94F]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">
            Facing Similar Architectural Challenges?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Let Dracovion Technologies engineer a high-velocity, production-hardened platform for your enterprise.
          </p>
        </div>

        <Link
          to="/portal/order/new"
          className="px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] whitespace-nowrap flex items-center gap-2 shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.55)] transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 50%, #F5D18A 100%)',
          }}
        >
          <span>Request Custom Project Scope</span>
          <ArrowRight className="w-4 h-4 text-[#050609]" />
        </Link>
      </div>
    </div>
  );
};
