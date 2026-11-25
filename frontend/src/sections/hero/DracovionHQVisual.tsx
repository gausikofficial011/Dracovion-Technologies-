import React, { useState } from 'react';
import { DragonEmblem } from '../../components/ui/DragonLogo';
import { ShieldCheck, Cpu, Sparkles, Building2, Zap } from 'lucide-react';

interface DracovionHQVisualProps {
  mouseOffset?: { x: number; y: number };
}

/**
 * Dracovion Futuristic Corporate Headquarters & Golden Dragon Crest
 * High-definition layered vector & CSS architecture with 3D parallax tilt,
 * volumetric lighting rays, circuit conduits, and glowing cyber-dragon vanguard.
 */
export const DracovionHQVisual: React.FC<DracovionHQVisualProps> = ({ mouseOffset = { x: 0, y: 0 } }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Parallax transform calculations
  const tiltX = mouseOffset.y * 6;
  const tiltY = -mouseOffset.x * 6;

  return (
    <div
      className="relative w-full aspect-[4/4.2] sm:aspect-[4/3.8] max-w-xl mx-auto flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: '1200px',
      }}
    >
      {/* Background Volumetric Light Cone */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,169,79,0.22)_0%,rgba(120,191,255,0.06)_45%,transparent_75%)] blur-3xl pointer-events-none"
        style={{
          transform: `translate3d(${mouseOffset.x * 12}px, ${mouseOffset.y * 12}px, 0)`,
        }}
      />

      {/* Outer Rotating Architectural Halo */}
      <div
        className="absolute w-[85%] h-[85%] rounded-full border border-[#D6A94F]/20 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `rotate(${isHovered ? 45 : 0}deg) scale(${isHovered ? 1.03 : 1})`,
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FFBD55] shadow-[0_0_12px_#FFBD55]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-[#78BFFF] shadow-[0_0_12px_#78BFFF]" />
      </div>

      {/* Inner Concentric Circuit Ring */}
      <div
        className="absolute w-[68%] h-[68%] rounded-full border border-dashed border-[#D6A94F]/30 pointer-events-none animate-spin"
        style={{ animationDuration: '45s' }}
      />

      {/* Main Layered 3D Card Stage */}
      <div
        className="relative z-10 w-[90%] h-[90%] rounded-3xl bg-gradient-to-b from-[#11151D]/90 via-[#0A0D13]/95 to-[#050609] border border-[#292E38] shadow-[0_24px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(214,169,79,0.15)] overflow-hidden flex flex-col justify-between p-6 sm:p-8 transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Sky / Architectural Beam Shimmer */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#D6A94F]/10 via-[#78BFFF]/5 to-transparent pointer-events-none" />

        {/* Top Status Bar: Headquarters Telemetry */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#050609]/80 border border-[#D6A94F]/30">
            <span className="w-2 h-2 rounded-full bg-[#FFBD55] animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-[#F5D18A] uppercase">
              HQ SECURE NODE • TN-IN
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#9299A6]">
            <Building2 className="w-3.5 h-3.5 text-[#D6A94F]" />
            <span className="hidden sm:inline">TAMIL NADU, INDIA</span>
          </div>
        </div>

        {/* Center: Large Golden Dragon Crest Artifice */}
        <div className="relative my-auto flex flex-col items-center justify-center py-4">
          {/* Radial Beacon Behind Dragon */}
          <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-[#FFBD55]/20 via-[#D6A94F]/15 to-transparent blur-2xl animate-pulse-gold pointer-events-none" />

          {/* Floating Dragon Vanguard */}
          <div
            className="relative transform transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(${mouseOffset.x * -16}px, ${mouseOffset.y * -16}px, 30px)`,
            }}
          >
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#161B26]/80 to-[#0A0D13]/90 border border-[#D6A94F]/40 shadow-[0_12px_30px_rgba(214,169,79,0.25)]">
              <DragonEmblem size={96} glow={true} variant="gold" />
            </div>

            {/* Micro Badge Under Dragon */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#050609] border border-[#FFBD55]/50 shadow-md whitespace-nowrap">
              <span className="text-[9px] font-cyber tracking-[0.22em] text-[#FFBD55] uppercase font-bold">
                CYBERNETIC COGNITION
              </span>
            </div>
          </div>
        </div>

        {/* Headquarters Architectural Base & Telemetry Pods */}
        <div className="relative z-20 pt-4 border-t border-[#292E38]/80">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#050609]/70 border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors">
              <div className="flex items-center justify-center gap-1 text-[#FFBD55] mb-0.5">
                <Cpu className="w-3 h-3" />
                <span className="text-sm font-cyber font-bold">100%</span>
              </div>
              <div className="text-[10px] text-[#9299A6] font-mono uppercase tracking-wider">Type-Safe</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#050609]/70 border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors">
              <div className="flex items-center justify-center gap-1 text-[#78BFFF] mb-0.5">
                <Zap className="w-3 h-3" />
                <span className="text-sm font-cyber font-bold">&lt;100ms</span>
              </div>
              <div className="text-[10px] text-[#9299A6] font-mono uppercase tracking-wider">Latency</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#050609]/70 border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-sm font-cyber font-bold">99.9%</span>
              </div>
              <div className="text-[10px] text-[#9299A6] font-mono uppercase tracking-wider">SLA Ready</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#9299A6]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#FFBD55]" />
              <span>GLOBAL DELIVERY ARCHITECTURE</span>
            </span>
            <span className="text-[#D6A94F] font-semibold">EST. 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

