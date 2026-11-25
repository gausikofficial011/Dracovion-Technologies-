import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesList } from '../../sections/services/ServicesSection';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Layers,
  Code2,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'business' | 'students'>('all');

  const studentServices = [
    {
      id: 'student-final-year',
      slug: 'allhunter-student-project',
      title: 'Allhunter Final Year & Mini Project Development',
      description: 'Authentic software prototype engineering, full source code repositories, system architecture diagrams, and 1-on-1 viva voce technical defense preparation for engineering students.',
      icon: GraduationCap,
      features: ['Legitimate Academic Alignment (Zero Copy-Paste)', 'Database Schemas & API Documentation', 'Full Working Prototype Source Code', 'Personalized Viva Coaching Sessions'],
      badge: 'Student Subsidized',
    },
    {
      id: 'student-mentoring',
      slug: 'allhunter-mentoring',
      title: 'Allhunter 1-on-1 Code Mentoring & Architecture Review',
      description: 'Hands-on pair programming and debugging with a senior software engineer to master React, Node.js, TypeScript, and Python best practices.',
      icon: Code2,
      features: ['1-on-1 Screen Share Debugging Sessions', 'Git & CI/CD Industry Practices', 'Code Refactoring & Clean Architecture', 'Portfolio Project Review'],
      badge: 'Mentorship',
    },
  ];

  const displayedServices =
    filter === 'students'
      ? studentServices
      : filter === 'business'
      ? servicesList
      : [...servicesList, ...studentServices];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-[#050609]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CAPABILITIES & ARCHITECTURE</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight">
          End-to-End IT Solutions
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          From full-stack enterprise platforms and mobile ecosystems to cognitive AI pipelines and student prototype mentoring in Tamil Nadu, our engineering standards remain uncompromised.
        </p>

        {/* Filter Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] text-[#050609] shadow-md shadow-[#D6A94F]/25 font-bold'
                : 'bg-[#11151D] text-[#9299A6] hover:text-white border border-[#292E38]'
            }`}
          >
            All Offerings (10)
          </button>
          <button
            onClick={() => setFilter('business')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              filter === 'business'
                ? 'bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] text-[#050609] shadow-md shadow-[#D6A94F]/25 font-bold'
                : 'bg-[#11151D] text-[#9299A6] hover:text-white border border-[#292E38]'
            }`}
          >
            Corporate & Enterprise (8)
          </button>
          <button
            onClick={() => setFilter('students')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'students'
                ? 'bg-gradient-to-r from-[#78BFFF] to-[#38BDF8] text-[#050609] shadow-md font-bold'
                : 'bg-[#11151D] text-[#9299A6] hover:text-white border border-[#292E38]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Allhunter Student Hub (2)</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.slug}
              className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)] flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#050609] border border-[#292E38] group-hover:border-[#FFBD55] flex items-center justify-center text-[#D6A94F] group-hover:text-[#FFBD55] transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  {service.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold text-[#050609] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] uppercase">
                      {service.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-display font-bold text-white group-hover:text-gold-gradient transition-colors mb-2.5">
                  {service.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#9299A6] leading-relaxed mb-6">
                  {service.description}
                </p>

                <div className="space-y-2 mb-6 border-t border-[#292E38]/60 pt-4">
                  {service.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A94F] flex-shrink-0" />
                      <span className="line-clamp-1">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to={service.slug.startsWith('allhunter') ? '/allhunter' : `/services/${service.slug}`}
                className="btn-gold-outline w-full py-2.5 rounded-xl inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:border-[#FFBD55]"
              >
                <span>View Full Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
