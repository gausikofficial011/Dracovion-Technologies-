import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Code2,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Video,
  FileCheck,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { DragonEmblem } from '../../components/ui/DragonLogo';

export const AllhunterPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 bg-[#050609]">
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#11151D] border border-[#D6A94F]/40 text-xs font-mono text-[#FFBD55]">
          <GraduationCap className="w-4 h-4" />
          <span>ALLHUNTER • POWERED BY DRACOVION TECHNOLOGIES</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-white leading-tight">
          Student Engineering Prototypes & <br />
          <span className="text-gold-shimmer">1-on-1 Technical Mentoring</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
          Founded in Tamil Nadu to empower college engineering and computer science students. Build genuine working software prototypes, master modern architectures, and ace your final-year viva with deep code comprehension.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/contact"
            className="btn-gold-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider"
          >
            <span>Request Student Project Guidance</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/portal/student"
            className="btn-gold-outline w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider"
          >
            <span>Student Portal Access</span>
          </Link>
        </div>
      </div>

      {/* Strict Academic Integrity Pledge Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#11151D] border border-[#D6A94F]/40 max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-lg">
        <div className="p-3.5 rounded-2xl bg-[#050609] border border-[#292E38] text-[#FFBD55] shrink-0">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-display font-bold text-white">Our Strict Academic Integrity Pledge</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Allhunter does NOT sell fraudulent black-box fake projects or encourage academic dishonesty. We guide students line-by-line through real architectures so they can genuinely master the technologies, defend their code in viva sessions, and build a lasting engineering career.
          </p>
        </div>
      </div>

      {/* Key Mentorship Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#050609] border border-[#292E38] text-[#FFBD55] flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white">Working Source Prototypes</h3>
          <p className="text-xs sm:text-sm text-[#9299A6] leading-relaxed">
            Clean, formatted, type-safe repositories in React, Node.js, Python, or Flutter. Includes Git commit history, schema diagrams, and zero-error builds.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#050609] border border-[#292E38] text-[#78BFFF] flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white">1-on-1 Viva Defense Prep</h3>
          <p className="text-xs sm:text-sm text-[#9299A6] leading-relaxed">
            Live screen-share sessions where a senior engineer grills and coaches you on your database design, API routing, and code architecture questions.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#050609] border border-[#292E38] text-emerald-400 flex items-center justify-center">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white">Complete System DDL & Reports</h3>
          <p className="text-xs sm:text-sm text-[#9299A6] leading-relaxed">
            DFDs, ER diagrams, use-case models, and architectural blueprints formatted to academic university submission standards.
          </p>
        </div>
      </div>
    </div>
  );
};
