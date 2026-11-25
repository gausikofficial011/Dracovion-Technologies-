import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { featuredProjects } from '../../sections/projects/ProjectsSection';
import { Sparkles, ArrowRight, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Web Applications',
    'AI & ML',
    'Mobile Applications',
    'Enterprise Systems',
    'Automation',
    'UI/UX',
  ];

  const filtered =
    activeCategory === 'All'
      ? featuredProjects
      : featuredProjects.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-[#050609]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>VERIFIED ENGINEERING CASE STUDIES</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight">
          Featured Projects & Portfolio
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Explore real-world case studies demonstrating how Dracovion Technologies solves complex business friction with type-safe software, low latency, and cinematic user interfaces.
        </p>

        {/* Categories Filter */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] text-[#050609] font-bold shadow-md shadow-[#D6A94F]/25'
                  : 'bg-[#11151D] text-[#9299A6] hover:text-white border border-[#292E38]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold text-[#FFBD55] bg-[#050609] border border-[#D6A94F]/30 uppercase">
                  {item.category}
                </span>
                <span className="text-[11px] font-mono text-[#9299A6] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified</span>
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-white group-hover:text-gold-gradient transition-colors mb-3 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#9299A6] leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Impact Callout */}
              <div className="p-4 rounded-xl bg-[#0A0D13] border border-[#292E38] mb-6">
                <div className="text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-1">
                  Verified Outcome Metric
                </div>
                <div className="text-xs text-slate-200">{item.metrics}</div>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {item.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-[#050609] border border-[#292E38] text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to={`/portfolio/${item.slug}`}
              className="btn-gold-outline w-full py-2.5 rounded-xl inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider group-hover:border-[#FFBD55]"
            >
              <span>Read Architectural Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
