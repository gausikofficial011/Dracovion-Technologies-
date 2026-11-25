import React from 'react';
import { ContactSection } from '../../sections/contact/ContactSection';
import { Sparkles } from 'lucide-react';

export const StartProjectPage: React.FC = () => {
  return (
    <div className="bg-[#050609]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PROJECT SCOPING & INQUIRY</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-white tracking-tight">
          Start Your Project With <span className="text-gold-shimmer">Dracovion</span>
        </h1>
        <p className="mt-4 text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
          Provide your specifications below. We will analyze your architecture requirements, estimate delivery milestones, and schedule an engineering consultation.
        </p>
      </div>

      <ContactSection />
    </div>
  );
};
