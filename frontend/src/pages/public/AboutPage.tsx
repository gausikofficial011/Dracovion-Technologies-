import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, MapPin, Target, Eye, Code, ArrowRight, Award, CheckCircle2, Cpu } from 'lucide-react';
import { DragonEmblem } from '../../components/ui/DragonLogo';
import { FounderPortrait } from '../../components/ui/FounderPortrait';

export const AboutPage: React.FC = () => {
  const pillars = [
    {
      title: 'Architectural Rigor',
      desc: 'We adhere to clean domain modeling, type-safe schema validation, and zero-runtime exceptions.',
    },
    {
      title: 'Cinematic Precision',
      desc: 'Every interface is treated as an editorial work of art, merging dark obsidian luxury with responsive ergonomics.',
    },
    {
      title: 'Zero Bureaucracy',
      desc: 'Clients communicate directly with principal engineering leadership, ensuring prompt velocity and uncompromised clarity.',
    },
    {
      title: 'Educational Stewardship',
      desc: 'Through Allhunter, we mentor the next generation of engineers in Tamil Nadu with honest code guidance and authentic prototype engineering.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 bg-[#050609]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OUR IDENTITY & DOCTRINE</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight">
          About Dracovion Technologies
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
          Founded by <strong className="text-white">Gausik Srinivasan</strong>, Dracovion Technologies stands at the intersection of high-grade engineering discipline and cinematic visual supremacy.
        </p>
      </div>

      {/* Founder Story & Heritage */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#11151D] border border-[#292E38] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D6A94F]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-mono text-[#FFBD55]">
              <MapPin className="w-4 h-4" />
              <span>ORIGINS • TAMIL NADU, INDIA • GLOBAL HORIZON</span>
            </div>
            <DragonEmblem size={44} glow={true} variant="gold" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl sm:text-4xl font-vanguard font-bold text-white">
                Founder-Led <span className="text-gold-shimmer">Engineering Dedication</span>
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                <p>
                  Dracovion Technologies was established with a singular conviction: that modern software should never be compromised by generic templates or bloated agency processes. Based in Tamil Nadu, India, we combine deep technical rigor with modern luxury design principles to create systems that stand out internationally.
                </p>
                <p>
                  Under the technical direction of founder <strong className="text-white">Gausik Srinivasan</strong>, we specialize in full-stack web applications, resilient backend architectures, AI workflow automations, and student mentoring via Allhunter. Every line of code is intentional, type-safe, and architected for long-term production resilience.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <FounderPortrait variant="card" className="max-w-sm mx-auto lg:max-w-none" />
            </div>
          </div>

          <div className="pt-6 space-y-4 border-t border-[#292E38]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0A0D13] border border-[#292E38]">
                <span className="text-xs font-mono text-[#9299A6] uppercase block mb-1">Founder & Principal</span>
                <span className="text-sm font-semibold text-white">Gausik Srinivasan</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0A0D13] border border-[#292E38]">
                <span className="text-xs font-mono text-[#9299A6] uppercase block mb-1">Origin Market</span>
                <span className="text-sm font-semibold text-[#FFBD55]">Tamil Nadu, India</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0A0D13] border border-[#292E38]">
                <span className="text-xs font-mono text-[#9299A6] uppercase block mb-1">Student Engineering Arm</span>
                <span className="text-sm font-semibold text-[#78BFFF]">Allhunter Mentorship</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://github.com/dracovion-technology"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-[#0A0D13] border border-[#292E38] hover:border-[#FFBD55] transition-all group flex flex-col justify-between"
              >
                <span className="text-xs font-mono text-[#9299A6] uppercase block mb-1 group-hover:text-[#FFBD55] transition-colors">Official GitHub</span>
                <span className="text-sm font-semibold text-white flex items-center justify-between">
                  <span>dracovion-technology</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFBD55] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </a>

              <a
                href="https://www.instagram.com/dracovion_technologies?hvrq=MWxuaXdtZ2tsYjdhNQ=="
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl bg-[#0A0D13] border border-[#292E38] hover:border-[#FFBD55] transition-all group flex flex-col justify-between"
              >
                <span className="text-xs font-mono text-[#9299A6] uppercase block mb-1 group-hover:text-[#FFBD55] transition-colors">Official Instagram</span>
                <span className="text-sm font-semibold text-white flex items-center justify-between">
                  <span>@dracovion_technologies</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFBD55] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#050609] border border-[#292E38] text-[#FFBD55] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white">Our Mission</h3>
          <p className="text-sm text-[#9299A6] leading-relaxed">
            To provide businesses, entrepreneurs, and student engineers with dependable, beautifully crafted software architectures that eliminate technical friction, protect intellectual capital, and accelerate measurable progress.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#050609] border border-[#292E38] text-[#78BFFF] flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white">Our Vision</h3>
          <p className="text-sm text-[#9299A6] leading-relaxed">
            To build Dracovion Technologies into an internationally respected digital forge known for pioneering cognitive intelligence systems, uncompromising design standards, and transparent founder-led engineering stewardship.
          </p>
        </div>
      </div>

      {/* Core Engineering Pillars */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold tracking-widest text-[#FFBD55] uppercase">
            OPERATIONAL STANDARDS
          </span>
          <h2 className="text-3xl font-display font-bold text-white mt-2">
            The Pillars of Dracovion Engineering
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-all flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-[#FFBD55] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-base font-bold text-white mb-1">{pillar.title}</h4>
                <p className="text-xs sm:text-sm text-[#9299A6] leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#11151D] via-[#161B26] to-[#11151D] border border-[#D6A94F]/40 text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Ready to Engineer Your Next Digital Milestone?
        </h3>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          Connect directly with our engineering team to review requirements, architecture options, and accurate milestone budgets.
        </p>
        <Link
          to="/contact"
          className="btn-gold-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider"
        >
          <span>Initiate Project Discussion</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
