import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Users,
  Layers,
  Cpu,
  CheckCircle2,
  Headphones,
} from 'lucide-react';

export const WhyChooseUsSection: React.FC = () => {
  const reasons = [
    {
      title: 'Innovation First',
      desc: 'We pioneer modern software paradigms, reactive state patterns, and cognitive AI workflows instead of repeating stale patterns.',
      icon: Zap,
    },
    {
      title: 'Customer-Centric Approach',
      desc: 'Transparent milestones, honest scoping, collaborative communication channels, and alignment with your specific business KPI goals.',
      icon: Users,
    },
    {
      title: 'Scalable Architecture',
      desc: 'Engineered from day zero for high throughput. Modular domain layers that grow smoothly from initial MVP to millions of requests.',
      icon: Layers,
    },
    {
      title: 'Modern Technologies',
      desc: 'We build exclusively with strict TypeScript, modern React, optimized database schemas, and cloud-native serverless runtimes.',
      icon: Cpu,
    },
    {
      title: 'Quality Engineering',
      desc: 'Rigorous unit testing, continuous integration checks, OWASP top 10 security adherence, and zero console warning policies.',
      icon: CheckCircle2,
    },
    {
      title: 'Long-Term Support',
      desc: 'We remain your dedicated engineering partners post-launch with 24/7 proactive monitoring, vulnerability patching, and SLA guarantees.',
      icon: Headphones,
    },
  ];

  return (
    <section className="relative py-24 bg-[#0A0D13] border-t border-[#292E38]" aria-label="Why Choose Dracovion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE DRACOVION ADVANTAGE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight">
            WHY VISIONARY LEADERS <span className="text-gold-shimmer">CHOOSE US.</span>
          </h2>
          <p className="mt-4 text-base text-[#9299A6]">
            We bridge the chasm between raw technical power and bespoke luxury design to ensure your digital footprint commands authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-all duration-300 hover:-translate-y-1.5 group shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#050609] border border-[#292E38] group-hover:border-[#FFBD55] flex items-center justify-center text-[#D6A94F] group-hover:text-[#FFBD55] transition-all mb-6">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-display font-bold text-white group-hover:text-gold-gradient transition-colors mb-2.5">
                  {item.title}
                </h3>

                <p className="text-sm text-[#9299A6] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

