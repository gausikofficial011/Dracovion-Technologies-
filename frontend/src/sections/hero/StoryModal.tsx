import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Cpu, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DragonEmblem } from '../../components/ui/DragonLogo';
import { FounderPortrait } from '../../components/ui/FounderPortrait';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 bg-[#050609]/92 backdrop-blur-xl"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-modal-title"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl bg-[#0A0D13] border border-[#D6A94F]/45 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_45px_rgba(214,169,79,0.2)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Gold Halo */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl pointer-events-none rounded-full" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-5 border-b border-[#292E38]/80 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <DragonEmblem size={44} glow={true} variant="gold" />
                <div className="min-w-0">
                  <span className="block text-[11px] font-mono font-semibold tracking-widest text-[#FFBD55] uppercase">
                    THE FOUNDER'S ODYSSEY & VISION
                  </span>
                  <h3 id="story-modal-title" className="text-xl sm:text-3xl font-vanguard font-bold text-white leading-tight mt-0.5">
                    The Genesis of Dracovion Technologies
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-2 rounded-full bg-[#11151D] border border-[#292E38] text-[#9299A6] hover:text-white hover:border-[#D6A94F] transition-all cursor-pointer"
                aria-label="Close story modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Narrative */}
            <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-6 space-y-5 text-slate-300 text-sm sm:text-base leading-relaxed custom-scrollbar">
              <p>
                Founded by <strong className="text-white">Gausik Srinivasan</strong> in Tamil Nadu, India,{' '}
                <strong className="text-gold-gradient">Dracovion Technologies</strong> was born from a singular conviction:
                that modern engineering should transcend ordinary limitations and synthesize uncompromised technical rigor with breathtaking aesthetic artistry.
              </p>

              {/* Cinematic Quote Callout */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#11151D] border border-[#292E38] border-l-4 border-l-[#D6A94F] flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-inner">
                <FounderPortrait variant="avatar" size="lg" />
                <div className="space-y-2 min-w-0">
                  <p className="font-editorial italic text-[#F5D18A] font-semibold text-xl sm:text-2xl leading-snug tracking-wide">
                    "We do not merely assemble software; we forge enduring technological vanguard architectures that propel our partners past digital frontiers."
                  </p>
                  <div className="text-xs font-mono text-[#9299A6]">
                    — Gausik Srinivasan, Founder & Principal Architect
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="flex flex-col p-4 rounded-xl bg-[#11151D]/90 border border-[#292E38] h-full">
                  <Cpu className="w-5 h-5 text-[#FFBD55] mb-2.5 shrink-0" />
                  <div className="font-bold text-white text-sm mb-1.5">Pure Type-Safety</div>
                  <div className="text-xs text-[#9299A6] leading-relaxed">
                    End-to-end verified schemas, robust contracts, and zero technical debt.
                  </div>
                </div>

                <div className="flex flex-col p-4 rounded-xl bg-[#11151D]/90 border border-[#292E38] h-full">
                  <Globe className="w-5 h-5 text-[#78BFFF] mb-2.5 shrink-0" />
                  <div className="font-bold text-white text-sm mb-1.5">Global Standard</div>
                  <div className="text-xs text-[#9299A6] leading-relaxed">
                    Rooted in Tamil Nadu with engineering scale built for international clients.
                  </div>
                </div>

                <div className="flex flex-col p-4 rounded-xl bg-[#11151D]/90 border border-[#292E38] h-full">
                  <Shield className="w-5 h-5 text-[#D6A94F] mb-2.5 shrink-0" />
                  <div className="font-bold text-white text-sm mb-1.5">Zero-Trust Security</div>
                  <div className="text-xs text-[#9299A6] leading-relaxed">
                    Encrypted deliverables, strict access control, and full audit logging.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="relative z-10 px-6 sm:px-8 py-4 sm:py-5 border-t border-[#292E38]/80 bg-[#080B10] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-[#9299A6]">
                <Sparkles className="w-4 h-4 text-[#FFBD55]" />
                <span>EXPERIENCE CINEMATIC LUXURY</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-[#11151D] border border-[#292E38] hover:border-slate-600 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  to="/start-project"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[#050609] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] hover:opacity-95 shadow-lg shadow-[#D6A94F]/20 transition-all"
                >
                  <span>Initiate Engagement</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

