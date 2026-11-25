import React from 'react';
import { motion } from 'framer-motion';
import { Search, Compass, Palette, Code2, Rocket, Sparkles } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'DISCOVER',
      subtitle: 'Strategic Needs Analysis & Scope Blueprint',
      desc: 'We dissect your organizational objectives, performance requirements, target audience nuances, and security constraints to author a deterministic technical roadmap.',
      icon: Search,
      deliverable: 'Scope Specification & Architecture DDL',
    },
    {
      num: '02',
      title: 'PLAN',
      subtitle: 'System Architecture & Milestone Structuring',
      desc: 'We map database schemas, API boundary interfaces, state management lifecycles, and break delivery down into transparent, verifiable milestones.',
      icon: Compass,
      deliverable: 'Interactive Milestones & SOW Document',
    },
    {
      num: '03',
      title: 'DESIGN',
      subtitle: 'Cinematic Visual Language & Design Tokens',
      desc: 'Our design studio translates your brand identity into bespoke luxury interface tokens, responsive layouts, motion prototypes, and WCAG AA compliant palettes.',
      icon: Palette,
      deliverable: 'Figma High-Fidelity Wireframes & Prototypes',
    },
    {
      num: '04',
      title: 'DEVELOP',
      subtitle: 'Strict Type-Safe Implementation & Testing',
      desc: 'Our engineers write clean, maintainable TypeScript with complete test coverage, reactive state flows, rate-limited backend security, and micro-interactions.',
      icon: Code2,
      deliverable: 'Verified Git Repository & CI Pipeline',
    },
    {
      num: '05',
      title: 'DEPLOY & SUPPORT',
      subtitle: 'Zero-Downtime Rollout & 24/7 SLA Guardianship',
      desc: 'We orchestrate production infrastructure, SSL provisioning, edge caching, and provide uninterrupted monitoring with proactive security patching.',
      icon: Rocket,
      deliverable: 'Live Production URL & Deliverable Vault',
    },
  ];

  return (
    <section className="relative py-24 bg-[#050609] border-t border-[#292E38]" aria-label="Development Workflow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RIGOROUS METHODOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight">
            DEVELOPMENT <span className="text-gold-shimmer">WORKFLOW.</span>
          </h2>
          <p className="mt-4 text-base text-[#9299A6]">
            From conceptual formulation to planetary production scale, our five-stage engineering cycle ensures zero surprises and relentless momentum.
          </p>
        </div>

        {/* Workflow Timeline */}
        <div className="relative">
          {/* Central Connecting Gold Line on Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#D6A94F]/10 via-[#FFBD55]/40 to-[#D6A94F]/10 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-cyber font-extrabold text-3xl text-gold-outline group-hover:text-[#FFBD55] transition-all">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#292E38] group-hover:border-[#FFBD55] flex items-center justify-center text-[#FFBD55] transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-display font-bold text-white group-hover:text-[#F5D18A] transition-colors mb-1">
                      {step.title}
                    </h3>

                    <div className="text-[11px] font-mono text-[#D6A94F] mb-3">
                      {step.subtitle}
                    </div>

                    <p className="text-xs text-[#9299A6] leading-relaxed mb-6">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#292E38]/60 text-[10px] font-mono text-slate-300">
                    <span className="text-[#9299A6]">Output: </span>
                    <span className="text-[#F5D18A]">{step.deliverable}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

