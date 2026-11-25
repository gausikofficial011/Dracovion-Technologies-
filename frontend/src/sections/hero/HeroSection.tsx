import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Shield, Cpu, Layers } from 'lucide-react';
import { HeroCanvas } from './HeroCanvas';
import { DracovionHQVisual } from './DracovionHQVisual';
import { StoryModal } from './StoryModal';

export const HeroSection: React.FC = () => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center pt-10 pb-14 lg:pt-14 lg:pb-20 overflow-hidden bg-transparent"
      aria-label="Hero Section"
    >
      {/* 1. Canvas Gold Particles & Circuit Conduits */}
      <HeroCanvas />

      {/* 2. Ambient Gold & Obsidian Radial Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(214,169,79,0.12)_0%,transparent_70%)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(120,191,255,0.06)_0%,transparent_70%)] blur-[100px] pointer-events-none" />

      {/* 3. Subtle Cybernetic Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #D6A94F 1px, transparent 1px), linear-gradient(to bottom, #D6A94F 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography, Tagline, Story and CTAs */}
          <div className="lg:col-span-7 flex flex-col text-left">
            {/* Market & Identity Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#11151D] border border-[#D6A94F]/40 shadow-sm w-fit mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#FFBD55] animate-ping" />
              <span className="text-[11px] font-mono tracking-widest text-[#F5D18A] uppercase font-semibold">
                DRACOVION TECHNOLOGIES • FOUNDER-LED IT EXCELLENCE
              </span>
            </motion.div>

            {/* Main Editorial Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-vanguard font-extrabold text-4xl sm:text-6xl xl:text-[4.25rem] tracking-tight text-white leading-[1.06] max-w-2xl">
                ENGINEERING <br />
                <span className="text-gold-shimmer relative inline-block">
                  THE FUTURE.
                </span>{' '}
                <br />
                BUILDING{' '}
                <span className="text-cyber-gradient">BEYOND LIMITS.</span>
              </h1>
            </motion.div>

            {/* Description Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="mt-6 text-base sm:text-lg lg:text-xl text-[#9299A6] max-w-xl font-normal leading-relaxed"
            >
              A next-generation technology company delivering innovative IT solutions, intelligent systems and digital
              products for individuals, businesses and institutions.
            </motion.p>

            {/* Dual CTAs: WORK WITH US & WATCH OUR STORY */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              {/* Primary Button */}
              <Link
                to="/contact"
                className="btn-gold-primary inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm sm:text-base font-bold tracking-wide uppercase group shadow-[0_8px_25px_-5px_rgba(214,169,79,0.5)] transition-all cursor-pointer"
              >
                <span>WORK WITH US</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Secondary Button */}
              <button
                type="button"
                onClick={() => setIsStoryOpen(true)}
                className="btn-gold-outline inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-sm sm:text-base font-semibold tracking-wide uppercase group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#D6A94F]/20 flex items-center justify-center group-hover:bg-[#FFBD55] group-hover:text-[#050609] transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>WATCH OUR STORY</span>
              </button>
            </motion.div>

            {/* Trust Pillars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="mt-10 pt-8 border-t border-[#292E38] grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-cyber font-bold tracking-wider text-[#FFBD55]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TAMIL NADU</span>
                </div>
                <div className="text-[11px] text-[#9299A6] mt-0.5">Initial Core Market</div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-cyber font-bold tracking-wider text-[#78BFFF]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>MODULAR</span>
                </div>
                <div className="text-[11px] text-[#9299A6] mt-0.5">Scalable Architecture</div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-cyber font-bold tracking-wider text-emerald-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>GLOBAL</span>
                </div>
                <div className="text-[11px] text-[#9299A6] mt-0.5">Technology Vision</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Dracovion Headquarters & 3D Layered Artwork */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <DracovionHQVisual mouseOffset={mouseOffset} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Story Video / Narrative Modal */}
      <StoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
    </section>
  );
};

