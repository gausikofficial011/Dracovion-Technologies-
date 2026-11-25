import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DragonEmblem } from '../../components/ui/DragonLogo';
import { FounderPortrait } from '../../components/ui/FounderPortrait';
import { ShieldCheck, Target, Eye, Sparkles, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const values = [
    { title: 'Type-Safe Precision', desc: 'Zero runtime surprises. We craft strictly verified architectures from database to frontend.' },
    { title: 'Radical Transparency', desc: 'Predictable milestone approvals, clear code repositories, and no hidden surprises.' },
    { title: 'Cinematic Aesthetic', desc: 'We reject generic templates. Every interface reflects elite bespoke craftsmanship.' },
    { title: 'Global Ambition', desc: 'Founded in Tamil Nadu with an engineering standard built for international enterprise scale.' },
  ];

  return (
    <section className="relative py-24 bg-[#0A0D13] border-t border-[#292E38]" aria-label="About Dracovion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Content */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-4 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE DRACOVION DOCTRINE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight leading-tight">
              TECHNOLOGY WITH PURPOSE. <br />
              <span className="text-gold-shimmer">INNOVATION WITH IMPACT.</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Dracovion Technologies is a digital product and system engineering company founded by{' '}
              <strong className="text-white font-semibold">Gausik Srinivasan</strong>. We combine deep engineering principles with modern luxury aesthetics to build systems that scale effortlessly.
            </p>

            <p className="mt-4 text-sm sm:text-base text-[#9299A6] leading-relaxed">
              Operating initially from Tamil Nadu, India, we partner with visionary entrepreneurs, established businesses, and students through our Allhunter mentoring platform, delivering software solutions that set benchmarks for reliability, velocity, and visual supremacy.
            </p>

            {/* Mission & Vision Split Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors">
                <div className="flex items-center gap-2.5 text-[#FFBD55] mb-2 font-display font-bold text-base">
                  <Target className="w-4 h-4" />
                  <span>Our Mission</span>
                </div>
                <p className="text-xs text-[#9299A6] leading-relaxed">
                  To engineer robust, elegant software and intelligent architectures that eliminate friction and empower organizations to operate without technical boundaries.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors">
                <div className="flex items-center gap-2.5 text-[#78BFFF] mb-2 font-display font-bold text-base">
                  <Eye className="w-4 h-4" />
                  <span>Our Vision</span>
                </div>
                <p className="text-xs text-[#9299A6] leading-relaxed">
                  To ascend as a globally revered technology company recognized for groundbreaking software engineering, aesthetic brilliance, and next-gen developer education.
                </p>
              </div>
            </div>

            {/* CTA to About Page */}
            <div className="mt-8">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#11151D] border border-[#D6A94F]/40 hover:border-[#FFBD55] hover:bg-[#161B26] transition-all group"
              >
                <span>Read Full Company Story</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#FFBD55]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Values & Interactive Showcase Graphic */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative p-8 rounded-3xl bg-gradient-to-b from-[#11151D] to-[#050609] border border-[#292E38] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D6A94F]/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#292E38]">
                <DragonEmblem size={44} glow={true} variant="gold" />
                <div>
                  <div className="text-xs font-mono font-semibold text-[#FFBD55] tracking-widest uppercase">
                    CORE PRINCIPLES
                  </div>
                  <div className="text-lg font-display font-bold text-white">How We Engineer</div>
                </div>
              </div>

              <div className="space-y-4">
                {values.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#0A0D13]/70 border border-[#292E38]/80 hover:border-[#D6A94F]/40 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#FFBD55] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{v.title}</h4>
                      <p className="text-[11px] text-[#9299A6] leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Founder Signature Pill */}
              <div className="mt-6 pt-4 border-t border-[#292E38] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FounderPortrait variant="avatar" size="md" />
                  <div>
                    <div className="text-[10px] font-mono text-[#9299A6] uppercase tracking-wider">
                      Founder & Principal
                    </div>
                    <div className="text-sm font-display font-bold text-[#FFBD55]">
                      Gausik Srinivasan
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#9299A6] uppercase tracking-widest hidden sm:inline">
                  LEADERSHIP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

