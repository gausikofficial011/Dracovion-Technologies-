import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Shield, Users, MapPin, Award } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  verified: boolean;
}

export const HighlightsSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const stats: StatItem[] = [
    {
      label: 'Verified Engagements',
      value: '15+',
      subtext: 'Bespoke web apps, AI workflows & student platforms',
      icon: Award,
      verified: true,
    },
    {
      label: 'Engineering Core',
      value: '100%',
      subtext: 'Full-stack type-safety & zero technical debt guarantee',
      icon: Shield,
      verified: true,
    },
    {
      label: 'Initial Focus Market',
      value: 'TN, India',
      subtext: 'Tamil Nadu founder roots with global delivery scalability',
      icon: MapPin,
      verified: true,
    },
    {
      label: 'Production SLA',
      value: '99.9%',
      subtext: 'High-availability infrastructure & active engineering support',
      icon: CheckCircle2,
      verified: true,
    },
  ];

  return (
    <section ref={ref} className="relative py-16 bg-[#0A0D13] border-y border-[#292E38]" aria-label="Company Highlights">
      {/* Background Decorative Gold Trace */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(214,169,79,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
                className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#292E38] group-hover:border-[#D6A94F]/50 flex items-center justify-center text-[#D6A94F] group-hover:text-[#FFBD55] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  {stat.verified && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 uppercase">
                      Verified
                    </span>
                  )}
                </div>

                <div className="font-cyber font-bold text-3xl sm:text-4xl text-gold-gradient tracking-wide">
                  {stat.value}
                </div>

                <div className="mt-1 text-sm font-semibold text-slate-200">
                  {stat.label}
                </div>

                <div className="mt-1.5 text-xs text-[#9299A6] leading-relaxed">
                  {stat.subtext}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

