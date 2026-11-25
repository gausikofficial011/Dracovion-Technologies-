import React from 'react';
import { DracovionLogo, DragonEmblem } from '../ui/DragonLogo';
import { Code2, Layers, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const SignupBrandPanel: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Ambient Atmospheric Lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#D6A94F]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 rounded-full bg-[#78BFFF]/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#FFBD55]/10 blur-[80px] pointer-events-none" />

      {/* Top Header Branding & Headline */}
      <div className="relative z-10 space-y-6 lg:space-y-8 pt-2">
        {/* Company Logo */}
        <div className="flex items-center gap-3">
          <DracovionLogo variant="horizontal" size="lg" glow={true} />
        </div>

        {/* Section Label: JOIN DRACOVION — */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#D6A94F] uppercase">
            JOIN DRACOVION
          </span>
          <div className="h-[1.5px] w-12 bg-gradient-to-r from-[#D6A94F] to-transparent" />
        </div>

        {/* Main Headline */}
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-vanguard tracking-tight text-white leading-[1.1]">
            Create Your
          </h1>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-vanguard tracking-tight leading-[1.1] text-gold-shimmer">
            Account
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-[#B7BBC4] max-w-md leading-relaxed font-sans font-normal">
          Be part of Dracovion Technologies. Collaborate, innovate and build the future with us.
        </p>

        {/* Three Feature Highlight Rows */}
        <div className="space-y-4 pt-2 max-w-md">
          {/* Feature 01 */}
          <motion.div
            whileHover={{ x: 6, borderColor: 'rgba(214, 169, 79, 0.6)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#080A0E]/80 backdrop-blur-md border border-[#292E38]/80 hover:border-[#D6A94F]/50 transition-colors shadow-lg group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#0A0D13] border border-[#D6A94F]/40 flex items-center justify-center text-[#FFBD55] shadow-[0_0_15px_rgba(214,169,79,0.2)] shrink-0 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white font-display group-hover:text-[#FFBD55] transition-colors">
                Access Our Services
              </div>
              <div className="text-xs text-[#9299A6]">Explore and request IT solutions</div>
            </div>
          </motion.div>

          {/* Feature 02 */}
          <motion.div
            whileHover={{ x: 6, borderColor: 'rgba(214, 169, 79, 0.6)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#080A0E]/80 backdrop-blur-md border border-[#292E38]/80 hover:border-[#D6A94F]/50 transition-colors shadow-lg group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#0A0D13] border border-[#D6A94F]/40 flex items-center justify-center text-[#FFBD55] shadow-[0_0_15px_rgba(214,169,79,0.2)] shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white font-display group-hover:text-[#FFBD55] transition-colors">
                Track Your Projects
              </div>
              <div className="text-xs text-[#9299A6]">Manage and monitor your work</div>
            </div>
          </motion.div>

          {/* Feature 03 */}
          <motion.div
            whileHover={{ x: 6, borderColor: 'rgba(214, 169, 79, 0.6)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#080A0E]/80 backdrop-blur-md border border-[#292E38]/80 hover:border-[#D6A94F]/50 transition-colors shadow-lg group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#0A0D13] border border-[#D6A94F]/40 flex items-center justify-center text-[#FFBD55] shadow-[0_0_15px_rgba(214,169,79,0.2)] shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white font-display group-hover:text-[#FFBD55] transition-colors">
                Be Part of Our Ecosystem
              </div>
              <div className="text-xs text-[#9299A6]">Clients · Students · Partners</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Center-Right Ethereal Dragon Artwork Layer */}
      <div className="relative my-6 lg:my-8 w-full flex items-center justify-center pointer-events-none">
        {/* Golden Energy Radial Flare */}
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[#FFBD55]/25 via-[#D6A94F]/15 to-transparent blur-3xl animate-pulse pointer-events-none" />

        {/* Official Golden Dragon Artwork */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
            rotate: [-0.5, 0.5, -0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative z-10 w-full max-w-xs flex items-center justify-center"
        >
          <img
            src="/dracovion-emblem.png"
            alt="Official Dracovion Dragon Artwork"
            className="w-56 sm:w-64 h-auto object-contain filter drop-shadow-[0_0_40px_rgba(214,169,79,0.55)] select-none"
          />
        </motion.div>
      </div>

      {/* Bottom Futuristic Corporate Headquarters Architectural Stage */}
      <div className="relative z-10 mt-auto pt-4">
        <div className="relative rounded-2xl overflow-hidden border border-[#D6A94F]/30 bg-gradient-to-b from-[#11151D]/90 to-[#050609] shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(214,169,79,0.15)] group">
          {/* Top Edge Gold Neon Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFBD55] to-transparent shadow-[0_0_10px_#FFBD55]" />

          {/* Architectural Layer Content */}
          <div className="relative p-5 sm:p-6 flex flex-col justify-between">
            {/* Dusk / Evening Glass Facade Lighting */}
            <div className="flex items-center justify-between pb-3 border-b border-[#292E38]/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#52D69A] shadow-[0_0_8px_#52D69A] animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest text-[#F5D18A] uppercase font-bold">
                  DRACOVION RESEARCH PARK • HQ
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#9299A6]">
                <Sparkles className="w-3.5 h-3.5 text-[#FFBD55]" />
                <span>TN, INDIA</span>
              </div>
            </div>

            {/* Headquarters Signage & Architectural Graphic */}
            <div className="pt-4 pb-2 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold font-display text-white tracking-wider flex items-center gap-2">
                  <DragonEmblem size={24} variant="gold" />
                  <span>DRACOVION<span className="text-[#FFBD55] text-xs align-super">®</span></span>
                </div>
                <div className="text-[9px] font-mono tracking-[0.25em] text-[#9299A6] uppercase mt-0.5">
                  TECHNOLOGY & INNOVATION CAMPUS
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-[#FFBD55]">ENGINEERING THE FUTURE</div>
                <div className="text-[10px] font-mono text-[#78BFFF]">BUILDING BEYOND LIMITS</div>
              </div>
            </div>

            {/* Illuminated Edge Contours & Reflection Representation */}
            <div className="mt-3 pt-3 border-t border-[#292E38]/50 flex items-center justify-between text-[10px] font-mono text-[#9299A6]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFBD55]" />
                <span>Zero Trust Architecture</span>
              </span>
              <span className="text-[#D6A94F]">Global Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

