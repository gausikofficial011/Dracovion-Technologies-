import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import officialLogoImg from '../../assets/dracovion-logo.png';
import officialEmblemImg from '../../assets/dracovion-emblem.png';

interface IntroAnimationProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (forceShow) return true;
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return false;
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('intro') === '1') return true;
      const alreadyShown = sessionStorage.getItem('dracovion_intro_played');
      return !alreadyShown;
    } catch {
      return true;
    }
  });

  const handleFinish = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('dracovion_intro_played', 'true');
    } catch {
      // ignore
    }
    onComplete?.();
  };

  useEffect(() => {
    if (!isVisible) return;

    // Cinematic presentation duration: 3.2s total then luxury fade-out
    const timer = setTimeout(() => {
      handleFinish();
    }, 3400);

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="dracovion-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050609] select-none overflow-hidden"
          style={{ willChange: 'opacity' }}
        >
          {/* Ambient Deep Radial Gold Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,169,79,0.18)_0%,rgba(5,6,9,0.95)_70%)] pointer-events-none" />

          {/* Concentric Geometric Radar Conduits */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.2, 1.8], opacity: [0, 0.25, 0] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-[450px] h-[450px] rounded-full border border-[#D6A94F]/40 pointer-events-none"
          />
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.0, 1.5], opacity: [0, 0.35, 0] }}
            transition={{ duration: 3.0, delay: 0.8, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-[350px] h-[350px] rounded-full border border-[#FFBD55]/30 pointer-events-none"
          />

          {/* Subtle Cyber Grid */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #D6A94F 1px, transparent 1px), linear-gradient(to bottom, #D6A94F 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Top Skip Button */}
          <button
            onClick={handleFinish}
            className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider text-[#9299A6] hover:text-[#FFBD55] bg-[#11151D]/80 hover:bg-[#15191F] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all cursor-pointer shadow-lg"
            aria-label="Skip intro animation"
          >
            <span>ENTER SITE</span>
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Centerpiece Container */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-lg">
            {/* Step 1: Golden Cyber-Dragon Logo Artwork with 3D Reveal & Volumetric Light Sweep */}
            <motion.div
              initial={{ opacity: 0, scale: 0.72, y: 15 }}
              animate={{ opacity: 1, scale: [0.72, 1.04, 1.0], y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-4 group"
            >
              {/* Radial Energy Aura Behind Dragon */}
              <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-[#D6A94F]/25 via-[#FFBD55]/35 to-[#F5D18A]/25 blur-3xl pointer-events-none animate-pulse" />

              {/* The Official Company Dragon Emblem Image */}
              <div className="relative w-40 sm:w-48 h-40 sm:h-48 flex items-center justify-center overflow-hidden">
                <img
                  src={officialEmblemImg}
                  alt="Dracovion Technologies Official Dragon Emblem"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(214,169,79,0.7)] select-none"
                />

                {/* Volumetric Gold Light Sweep passing across the Dragon */}
                <motion.div
                  initial={{ x: '-150%' }}
                  animate={{ x: '250%' }}
                  transition={{ duration: 1.5, delay: 0.7, ease: 'easeInOut' }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#FFF7DB]/50 to-transparent skew-x-[-28deg] pointer-events-none"
                />
              </div>
            </motion.div>

            {/* Step 2: DRACOVION Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden"
            >
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-[#FFF4D2] via-[#FFBD55] to-[#D6A94F] filter drop-shadow-[0_2px_20px_rgba(214,169,79,0.4)]">
                DRACOVION
              </h1>

              {/* Sweep across text */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.3, delay: 1.1, ease: 'easeInOut' }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-[#FFFFFF]/60 to-transparent skew-x-[-25deg] pointer-events-none"
              />
            </motion.div>

            {/* Step 3: TECHNOLOGIES subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease: 'easeOut' }}
              className="mt-2"
            >
              <span className="text-xs sm:text-sm font-sora font-semibold tracking-[0.42em] text-[#D6A94F] uppercase">
                TECHNOLOGIES
              </span>
            </motion.div>

            {/* Step 4: Tagline reveal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="mt-6 flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#B7BBC4] uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFBD55] animate-spin" style={{ animationDuration: '6s' }} />
              <span>ENGINEERING THE FUTURE. BUILDING BEYOND LIMITS.</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFBD55] animate-spin" style={{ animationDuration: '6s' }} />
            </motion.div>

            {/* Step 5: Sleek Gold Progress Line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '180px' }}
              transition={{ duration: 2.2, delay: 0.4, ease: 'linear' }}
              className="mt-7 h-[2px] bg-gradient-to-r from-[#D6A94F]/20 via-[#FFBD55] to-[#D6A94F]/20 rounded-full shadow-[0_0_10px_#FFBD55]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
