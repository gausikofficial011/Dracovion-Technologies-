import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  Layers,
  Cpu,
  Code2,
  Smartphone,
  Palette,
  Cloud,
  Database,
  Terminal,
} from 'lucide-react';

interface StaticServiceDetail {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  fullDescription: string;
  deliverables: string[];
  techStack: string[];
  workflow: string[];
  typicalTimeline: string;
  indicativePrice: string;
}

const detailedServicesData: Record<string, StaticServiceDetail> = {
  'web-development': {
    slug: 'web-development',
    title: 'Custom Web Development',
    category: 'Web Applications',
    tagline: 'High-Performance Corporate Portals, SaaS Platforms & Reactive Interfaces',
    fullDescription:
      'We engineer bespoke web applications utilizing React 19, Vite, Next.js, and strict TypeScript. Every project is optimized for Core Web Vitals (95+ score), responsive across mobile, tablet, and ultra-wide screens, secured with modern cryptographic headers, and styled with luxury dark obsidian palettes.',
    deliverables: [
      'Production-ready React / Next.js Source Code',
      'Fully Responsive Tailwind Design System Tokens',
      'SEO Metadata & OpenGraph Optimization',
      'CI/CD Deployment Configuration (Vercel / Cloudflare / AWS)',
      'Security Hardening & SSL Verification',
    ],
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Node.js', 'Next.js'],
    workflow: [
      'Wireframing & Architecture Specification',
      'Design Token & Micro-Interaction Crafting',
      'Type-Safe Component Implementation',
      'Core Web Vitals & Cross-Device QA',
      'Production Deployment & DNS Handover',
    ],
    typicalTimeline: '2 to 4 Weeks',
    indicativePrice: '₹25,000 - ₹85,000 (Scope Dependent)',
  },
  'mobile-development': {
    slug: 'mobile-development',
    title: 'Mobile Application Development',
    category: 'Mobile Applications',
    tagline: 'High-Velocity iOS & Android Cross-Platform Systems',
    fullDescription:
      'We craft smooth, native-feeling mobile applications with React Native and Flutter. From biometric authentication and offline-first SQLite caches to real-time WebSockets and push notification pipelines, our mobile engineering ensures fluid 60 FPS interactions on Android and iOS.',
    deliverables: [
      'Complete React Native / Flutter Source Repository',
      'Compiled APK / AAB for Android Google Play',
      'iOS IPA Build Configuration for TestFlight',
      'Push Notification & Firebase Telemetry Integration',
      'Store Submission Compliance Documentation',
    ],
    techStack: ['React Native', 'Flutter', 'TypeScript', 'Firebase', 'SQLite', 'Node.js'],
    workflow: [
      'Mobile UX & Touch Target Journey Design',
      'Offline Caching & State Architecture',
      'Native Device Hardware Integration (Camera, GPS, Biometrics)',
      'Stress Testing Across Low/Mid-Tier Devices',
      'App Store & Play Store Ingestion',
    ],
    typicalTimeline: '3 to 6 Weeks',
    indicativePrice: '₹40,000 - ₹1,20,000',
  },
  'ai-ml': {
    slug: 'ai-ml',
    title: 'AI & Machine Learning Solutions',
    category: 'Artificial Intelligence',
    tagline: 'Cognitive Automation, Predictive Models & LLM Integration',
    fullDescription:
      'We build practical AI systems that solve real business bottlenecks. Our capabilities span custom OCR document parsing, retrieval-augmented generation (RAG) vector search engines, predictive analytics, and automated multi-channel triage agents with Python, PyTorch, and FastAPI.',
    deliverables: [
      'Trained Model Weights & Inference Pipeline Code',
      'High-Throughput FastAPI Microservice Container',
      'Interactive Management & Human-in-the-Loop Dashboard',
      'Vector Database Integration (Pinecone / ChromaDB / MongoDB Atlas Search)',
      'Model Accuracy & Benchmark Evaluation Report',
    ],
    techStack: ['Python', 'FastAPI', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Docker'],
    workflow: [
      'Data Corpus Ingestion & Preprocessing',
      'Feature Engineering & Model Architecture Selection',
      'Hyperparameter Tuning & Cross-Validation',
      'Inference Microservice Containerization',
      'API Integration & Continuous Telemetry',
    ],
    typicalTimeline: '3 to 5 Weeks',
    indicativePrice: '₹45,000 - ₹1,50,000',
  },
  'software-development': {
    slug: 'software-development',
    title: 'Software Development & Architecture',
    category: 'Enterprise Engineering',
    tagline: 'Modular Full-Stack Systems, Custom ERPs & Microservices',
    fullDescription:
      'We engineer large-scale bespoke software suites, enterprise ERP modules, internal logistics systems, and automated billing software. With strict domain-driven design, isolated data tenants, and robust API contracts, our codebases remain effortlessly maintainable as your enterprise scales.',
    deliverables: [
      'Full Monorepo / Microservices Architecture',
      'Strict TypeScript Interfaces & Zod Validation Schemas',
      'Automated Vitest / Jest Unit & Integration Test Suites',
      'Role-Based Access Control (RBAC) & Audit Log Engine',
      'Architecture Blueprint & API Reference Manual',
    ],
    techStack: ['Node.js', 'Express', 'TypeScript', 'MongoDB Atlas', 'PostgreSQL', 'Docker'],
    workflow: [
      'Entity Relationship Modeling & Domain Boundary Mapping',
      'Database Indexing & Query Profiling',
      'Secure Authentication & Session Infrastructure',
      'Automated Test Suite Execution',
      'Deployment & High-Availability Clustering',
    ],
    typicalTimeline: '4 to 8 Weeks',
    indicativePrice: '₹60,000 - ₹2,50,000',
  },
  'ui-ux-design': {
    slug: 'ui-ux-design',
    title: 'UI/UX Design Systems',
    category: 'Product Design',
    tagline: 'Cinematic Visual Identities, Design Tokens & Ergonomic UIs',
    fullDescription:
      'We craft unforgettable digital brand presences. Rejecting boring generic templates, we formulate bespoke design languages with dark obsidian luxury aesthetics, antique gold accents, custom typography hierarchies, responsive layouts, and interactive Figma prototypes.',
    deliverables: [
      'Complete Master Figma Design File',
      'Standardized Design Tokens (Colors, Typography, Spacing, Shadows)',
      'Component Library Primitives (Buttons, Cards, Modals, Forms)',
      'High-Fidelity Interactive Clickable Prototypes',
      'Design-to-Code Style Guide for Engineering Teams',
    ],
    techStack: ['Figma', 'Design Tokens', 'Tailwind CSS', 'Framer Motion', 'Adobe CC'],
    workflow: [
      'User Research & Competitor Landscape Audit',
      'Low-Fidelity Wireframes & User Journey Flows',
      'Moodboards & Visual Direction Definition',
      'High-Fidelity UI Screens & Component Assembly',
      'Interactive Prototyping & Developer Handoff',
    ],
    typicalTimeline: '2 to 3 Weeks',
    indicativePrice: '₹20,000 - ₹60,000',
  },
  'cloud-solutions': {
    slug: 'cloud-solutions',
    title: 'Cloud Solutions & DevOps',
    category: 'Cloud Infrastructure',
    tagline: 'Scalable Serverless Clusters, Multi-Region Architecture & Cost Governance',
    fullDescription:
      'We architect, deploy, and manage cloud environments across Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure. Our DevOps engineers implement automated CI/CD pipelines, container orchestration with Docker and Kubernetes, and proactive cost-reduction strategies.',
    deliverables: [
      'Infrastructure as Code (Terraform / CloudFormation)',
      'Automated GitHub Actions CI/CD Pipeline',
      'CloudWatch / Datadog Monitoring & Health Alerts',
      'Automated Daily Offsite Database Backup Routines',
      'Cloud Architecture Cost Reduction Roadmap',
    ],
    techStack: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'],
    workflow: [
      'Cloud Infrastructure & Security Audit',
      'Terraform Scripting & Resource Provisioning',
      'CI/CD Pipeline Setup & Build Optimization',
      'Zero-Downtime Migration & Traffic Cutover',
      'Automated Alerting & Runbook Creation',
    ],
    typicalTimeline: '2 to 4 Weeks',
    indicativePrice: '₹30,000 - ₹90,000',
  },
  'database-management': {
    slug: 'database-management',
    title: 'Database Management & Tuning',
    category: 'Data Architecture',
    tagline: 'High-Concurrency Schema Modeling, Query Profiling & Replication',
    fullDescription:
      'We design, optimize, and maintain mission-critical databases using MongoDB Atlas, PostgreSQL, MySQL, and Redis. We resolve slow database queries, optimize compound indexes, eliminate N+1 latency bottlenecks, and implement high-availability replica sets.',
    deliverables: [
      'Optimized Database Schema DDL & Migration Scripts',
      'Comprehensive Compound Index Architecture',
      'Redis Cache Layer Configuration',
      'Disaster Recovery Replication & Backup Verification Log',
      'Query Performance Benchmark Report',
    ],
    techStack: ['MongoDB Atlas', 'PostgreSQL', 'MySQL', 'Redis', 'Mongoose', 'Prisma'],
    workflow: [
      'Slow Query Log Profiling & Bottleneck Diagnosis',
      'Schema Normalization & Compound Indexing',
      'Caching Strategy Design with Redis',
      'Replication & Failover Testing',
      'Production Validation & Continuous Telemetry',
    ],
    typicalTimeline: '1 to 3 Weeks',
    indicativePrice: '₹25,000 - ₹70,000',
  },
  'it-consulting': {
    slug: 'it-consulting',
    title: 'IT Consulting & Automation',
    category: 'Strategic Advisory',
    tagline: 'Founder-to-Founder Technology Advisory & Workflow Automation',
    fullDescription:
      'Direct strategic technology guidance for founders and business leaders. We help you choose the right tech stacks, review software architecture before committing capital, eliminate repetitive human tasks with automated webhooks and WhatsApp bots, and conduct security reviews.',
    deliverables: [
      'Technical Architecture Blueprint PDF',
      'Codebase & Security Vulnerability Assessment',
      'Automated Webhook & Notification Dispatch Bot',
      'Tech Stack Evaluation & Cost-Projection Matrix',
      'Founder Advisory Consultation Sessions',
    ],
    techStack: ['Architecture Blueprints', 'Webhooks', 'REST APIs', 'Security Audits', 'Automation Bots'],
    workflow: [
      'Organizational Discovery & Tech Debt Inventory',
      'Architecture Evaluation & Vulnerability Scan',
      'Automation Opportunity Identification',
      'Implementation of Automation Scripts & Connectors',
      'Executive Briefing & Strategic Action Plan',
    ],
    typicalTimeline: '1 to 2 Weeks',
    indicativePrice: '₹15,000 - ₹50,000',
  },
};

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // 1. Check if we have our comprehensive static specification
    if (slug && detailedServicesData[slug]) {
      setService(detailedServicesData[slug]);
      setIsLoading(false);
      return;
    }

    // 2. Otherwise query backend service catalog
    api
      .get<{ success: boolean; service: any }>(`/catalog/services/${slug}`)
      .then((res) => {
        if (res.service) {
          setService(res.service);
        } else {
          setService(detailedServicesData['web-development']);
        }
      })
      .catch(() => {
        // Fallback to default
        setService(detailedServicesData['web-development']);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-[#9299A6] font-mono bg-[#050609]">
        Loading service specifications...
      </div>
    );
  }

  const s = service || detailedServicesData['web-development'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-[#050609]">
      {/* Back button */}
      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9299A6] hover:text-[#FFBD55] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Service Catalogue</span>
      </Link>

      {/* Hero Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{s.category || 'ENTERPRISE SOLUTION'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight leading-tight">
          {s.title}
        </h1>

        <p className="text-sm font-mono text-[#D6A94F]">
          {s.tagline || s.shortDescription}
        </p>

        <p className="text-base sm:text-lg text-slate-300 max-w-4xl leading-relaxed pt-2">
          {s.fullDescription}
        </p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38]">
          <span className="text-xs font-mono text-[#9299A6] uppercase block mb-1">
            Typical Delivery Cycle
          </span>
          <span className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FFBD55]" />
            <span>{s.typicalTimeline || `${s.typicalDeliveryDays || 14} Days`}</span>
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38]">
          <span className="text-xs font-mono text-[#9299A6] uppercase block mb-1">
            Indicative Investment
          </span>
          <span className="text-lg font-bold text-[#F5D18A]">
            {s.indicativePrice || 'Transparent Milestone Billing'}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38]">
          <span className="text-xs font-mono text-[#9299A6] uppercase block mb-1">
            Engineering Standard
          </span>
          <span className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Type-Safe / QA Verified</span>
          </span>
        </div>
      </div>

      {/* Deliverables & Tech Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Deliverables */}
        <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] space-y-4">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FFBD55]" />
            <span>What We Deliver</span>
          </h3>
          <div className="space-y-3 pt-2">
            {(s.deliverables || s.features || []).map((del: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#D6A94F] flex-shrink-0 mt-0.5" />
                <span>{del}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technologies & Languages */}
        <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] space-y-4">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#78BFFF]" />
            <span>Technologies & Frameworks</span>
          </h3>
          <p className="text-xs text-[#9299A6]">
            Every component is authored with modern, industry-standard languages and audited tools.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {(s.techStack || ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'MongoDB Atlas']).map(
              (tech: string) => (
                <span
                  key={tech}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-[#050609] border border-[#292E38] text-slate-200"
                >
                  {tech}
                </span>
              )
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[#292E38]">
            <span className="text-xs font-mono text-[#D6A94F] uppercase tracking-wider block mb-2">
              Commitment to Excellence
            </span>
            <p className="text-xs text-[#9299A6] leading-relaxed">
              We never outsource to third-party sub-contractors. Your platform is built directly by Dracovion engineers under founder oversight.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#11151D] via-[#161B26] to-[#11151D] border border-[#D6A94F]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">
            Ready to Begin this Service Engagement?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Submit your project scope or schedule a consultation with our engineering architects.
          </p>
        </div>

        <Link
          to="/contact"
          className="btn-gold-primary px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2"
        >
          <span>Request Detailed Proposal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
