import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, Code2, Users, ArrowRight, CheckCircle2, Shield, Heart } from 'lucide-react';
import { DragonEmblem } from '../../components/ui/DragonLogo';

export const CareersPage: React.FC = () => {
  const openRoles = [
    {
      title: 'Senior Full-Stack Architect (TypeScript / Node.js)',
      department: 'Core Engineering',
      type: 'Full-time / Remote (India)',
      desc: 'Lead the architecture of high-throughput web applications, microservices, and distributed databases with zero runtime tolerance for bugs.',
      requirements: ['4+ years building production TypeScript / React / Node.js applications', 'Deep understanding of MongoDB Atlas indexing & relational schema tuning', 'Passionate about type safety and zero-compromise code quality'],
    },
    {
      title: 'Frontend Motion & UI/UX Specialist',
      department: 'Design & Interaction Studio',
      type: 'Full-time / Hybrid (Tamil Nadu / Remote)',
      desc: 'Craft cinematic interactive experiences, WebGL/Three.js canvases, Framer Motion animations, and accessible design system tokens.',
      requirements: ['Mastery of modern CSS, Tailwind, GSAP, Framer Motion, and Three.js', 'Proven portfolio demonstrating luxury or dark-mode aesthetic mastery', 'Focus on 60 FPS performance and reduced-motion fallbacks'],
    },
    {
      title: 'AI & Cognitive Systems Engineer',
      department: 'Dracovion AI Labs',
      type: 'Full-time / Remote',
      desc: 'Architect domain-specific RAG vector retrieval pipelines, automated invoice OCR models, and intelligent multi-agent triage workflows.',
      requirements: ['Strong Python, PyTorch, FastAPI, and Vector DB experience', 'Experience deploying containerized inference models on cloud runtimes', 'Practical understanding of prompt engineering and structured LLM outputs'],
    },
    {
      title: 'Student Technical Mentor (Allhunter Division)',
      department: 'Allhunter Mentorship',
      type: 'Part-time / Flexible',
      desc: 'Mentor passionate engineering and computer science students across Tamil Nadu on real-world prototypes, clean code, and viva defense.',
      requirements: ['Strong grasp of full-stack fundamentals (React, Node, Python, SQL)', 'Empathy, clear communication, and dedication to academic honesty', 'Ability to conduct live 1-on-1 code reviews and architecture walkthroughs'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-[#050609]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JOIN THE VANGUARD</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight">
          Careers & Engineering Culture
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          At Dracovion Technologies, we build beyond conventional limits. We hire exceptional minds who treat software engineering as an exacting craft.
        </p>
      </div>

      {/* Culture Values */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#11151D] border border-[#292E38] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <DragonEmblem size={40} glow={true} variant="gold" />
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              What Defines Our Craft
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#0A0D13] border border-[#292E38]">
              <div className="text-[#FFBD55] font-bold text-base mb-1">Direct Technical Ownership</div>
              <p className="text-xs text-[#9299A6] leading-relaxed">
                No middle managers or corporate fluff. Engineers own their architecture end-to-end and see the direct impact of their work.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A0D13] border border-[#292E38]">
              <div className="text-[#78BFFF] font-bold text-base mb-1">Obsessive Code Rigor</div>
              <p className="text-xs text-[#9299A6] leading-relaxed">
                We take immense pride in strict types, clean commit histories, well-documented schemas, and zero console warnings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0A0D13] border border-[#292E38]">
              <div className="text-emerald-400 font-bold text-base mb-1">Competitive & Flexible</div>
              <p className="text-xs text-[#9299A6] leading-relaxed">
                Merit-based compensation, transparent performance evaluations, flexible working hours, and remote-first setup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#292E38]">
          <h3 className="text-2xl font-display font-bold text-white">
            Open Engineering Positions
          </h3>
          <span className="text-xs font-mono text-[#D6A94F]">4 Current Openings</span>
        </div>

        <div className="space-y-4">
          {openRoles.map((role, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-all duration-300 hover:-translate-y-1 group flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-[#FFBD55] font-semibold uppercase">
                    {role.department}
                  </span>
                  <span className="text-xs text-[#9299A6]">•</span>
                  <span className="text-xs text-[#9299A6] font-mono">{role.type}</span>
                </div>

                <h4 className="text-xl font-display font-bold text-white group-hover:text-gold-gradient transition-colors">
                  {role.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {role.desc}
                </p>

                <div className="space-y-1 pt-2">
                  {role.requirements.map((req, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2 text-xs text-[#9299A6]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A94F] flex-shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={`mailto:dracoviontechnology@gmail.com?subject=Application:%20${encodeURIComponent(role.title)}`}
                className="btn-gold-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap inline-flex items-center justify-center gap-2"
              >
                <span>Apply via Email</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* General Applications */}
      <div className="p-8 rounded-3xl bg-[#0A0D13] border border-[#292E38] text-center space-y-4">
        <h4 className="text-xl font-display font-bold text-white">Don't See Your Exact Role?</h4>
        <p className="text-xs sm:text-sm text-[#9299A6] max-w-xl mx-auto">
          We are always eager to speak with extraordinary engineers, designers, and researchers. Send your GitHub, portfolio, and background to{' '}
          <a href="mailto:dracoviontechnology@gmail.com" className="text-[#FFBD55] underline font-mono">
            dracoviontechnology@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

