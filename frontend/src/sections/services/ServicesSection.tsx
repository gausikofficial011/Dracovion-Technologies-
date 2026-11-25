import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  Smartphone,
  Cpu,
  Layers,
  Palette,
  Cloud,
  Database,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface ServiceDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  badge?: string;
}

export const servicesList: ServiceDefinition[] = [
  {
    id: 'web-dev',
    slug: 'web-development',
    title: 'Web Development',
    description: 'Bespoke corporate web platforms, reactive client interfaces, and high-concurrency SaaS applications engineered for performance.',
    icon: Code2,
    features: ['React 19 & Next.js Architecture', 'Core Web Vitals 95+ Guarantee', 'Modern SSR/SSG & Edge Caching', 'Interactive Canvas & Motion Systems'],
    badge: 'Popular',
  },
  {
    id: 'mobile-dev',
    slug: 'mobile-development',
    title: 'Mobile App Development',
    description: 'Smooth, native-feeling cross-platform iOS & Android applications with offline-first state and real-time push synchronizations.',
    icon: Smartphone,
    features: ['React Native & Flutter Pipelines', 'Zero-Lag Hardware Accelerated UI', 'Biometric Auth & Secure Keystore', 'App Store & Play Store Compliance'],
  },
  {
    id: 'ai-ml',
    slug: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Cognitive intelligence integrations, predictive machine learning pipelines, LLM fine-tuning, and automated enterprise triage agents.',
    icon: Cpu,
    features: ['Custom Neural Workflow Engines', 'Vector Embeddings & RAG Search', 'Automated OCR & Document Parsing', 'Computer Vision & Inference APIs'],
    badge: 'Innovative',
  },
  {
    id: 'software-dev',
    slug: 'software-development',
    title: 'Software Development',
    description: 'Full-cycle custom software engineering, modular microservices, enterprise ERP integrations, and resilient internal tool suites.',
    icon: Layers,
    features: ['Strict Type-Safe TypeScript/Go', 'Domain-Driven Design (DDD)', 'Multi-tenant Data Isolation', 'Automated Unit & Integration Testing'],
  },
  {
    id: 'ui-ux',
    slug: 'ui-ux-design',
    title: 'UI/UX Design',
    description: 'Cinematic visual languages, dark-mode luxury aesthetics, design token systems, and interaction architectures designed for conversion.',
    icon: Palette,
    features: ['Figma Design Systems & Tokens', 'Micro-Interactions & Prototyping', 'WCAG 2.1 AA Accessibility', 'User Journey & Funnel Audits'],
  },
  {
    id: 'cloud-solutions',
    slug: 'cloud-solutions',
    title: 'Cloud Solutions',
    description: 'Cloud-native serverless architecture, multi-region scaling, cost-governance, and CI/CD pipelines across AWS, Azure, and GCP.',
    icon: Cloud,
    features: ['Kubernetes & Docker Orchestration', 'Automated Infrastructure as Code', 'Zero-Downtime Deployment Blueprints', 'Cloud Cost Optimization Roadmaps'],
  },
  {
    id: 'database-mgmt',
    slug: 'database-management',
    title: 'Database Management',
    description: 'Optimized schema modeling, automated read/write partitioning, query profiling, and disaster-recovery replication for high throughput.',
    icon: Database,
    features: ['MongoDB Atlas High-Availability', 'PostgreSQL / MySQL Schema Tuning', 'Redis Distributed Cache Layers', 'Point-In-Time Backup Restorations'],
  },
  {
    id: 'it-consulting',
    slug: 'it-consulting',
    title: 'IT Consulting & Automation',
    description: 'Strategic founder-to-founder technology advisory, legacy code refactoring, webhook orchestrations, and bespoke automation bots.',
    icon: Terminal,
    features: ['Architecture & Tech Stack Audits', 'Webhook & API Workflow Connectors', 'WhatsApp & CRM Notification Bots', 'Security Vulnerability Hardening'],
  },
];

export const ServicesSection: React.FC = () => {
  return (
    <section className="relative py-24 bg-[#050609]" aria-label="Our Services">
      {/* Background Decorative Gold Ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,rgba(214,169,79,0.07)_0%,transparent_70%)] blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CAPABILITIES & ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight leading-tight">
              END-TO-END <span className="text-gold-shimmer">IT SOLUTIONS.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#9299A6] leading-relaxed">
              We engineer scalable digital infrastructure, intelligent cognitive pipelines, and bespoke software systems designed to outlast ordinary technological cycles.
            </p>
          </div>

          <Link
            to="/services"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-[#FFBD55] hover:text-white transition-colors group"
          >
            <span>Explore All 8 Capabilities</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 8 Premium Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesList.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(214,169,79,0.25)]"
              >
                {/* Glow Hover Background */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#D6A94F]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  {/* Top Bar with Icon & Optional Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#050609] border border-[#292E38] group-hover:border-[#D6A94F] flex items-center justify-center text-[#D6A94F] group-hover:text-[#FFBD55] transition-all group-hover:scale-105 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    {service.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider text-[#050609] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] uppercase shadow-sm">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-display font-bold text-white group-hover:text-[#F5D18A] transition-colors mb-2.5">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#9299A6] leading-relaxed mb-6 line-clamp-3">
                    {service.description}
                  </p>

                  {/* Key Features Bullet List */}
                  <div className="space-y-2 mb-6 border-t border-[#292E38]/60 pt-4">
                    {service.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A94F] flex-shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explore Link */}
                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[#D6A94F] group-hover:text-white transition-colors pt-2 border-t border-[#292E38]/60"
                >
                  <span>Explore Details</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

