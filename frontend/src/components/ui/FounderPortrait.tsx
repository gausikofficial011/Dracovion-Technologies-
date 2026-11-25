import React from 'react';
import founderPhoto from '../../assets/founder-gausik.png';

export interface FounderPortraitProps {
  variant?: 'card' | 'avatar';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

const AVATAR_SIZE_CLASSES: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

/**
 * Renders the official portrait of Dracovion Technologies founder Gausik Srinivasan
 * with obsidian-and-gold luxury framing across public and portal views.
 */
export const FounderPortrait: React.FC<FounderPortraitProps> = ({
  variant = 'avatar',
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  const altText = 'Gausik Srinivasan — Founder & Principal Architect, Dracovion Technologies';

  if (variant === 'card') {
    return (
      <div
        className={`relative rounded-2xl overflow-hidden border border-[#D6A94F]/45 bg-[#0A0D13] shadow-[0_18px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(214,169,79,0.16)] group select-none ${className}`}
      >
        <div className="relative aspect-[4/4.6] w-full overflow-hidden bg-gradient-to-b from-[#D5DCE8] via-[#B4BECB] to-[#0A0D13]">
          <img
            src={founderPhoto}
            alt={altText}
            className="w-full h-full object-cover object-top scale-[1.06] origin-top transition-transform duration-700 group-hover:scale-[1.09]"
            loading="lazy"
          />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_36px_rgba(5,6,9,0.45)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050609] via-[#050609]/85 to-transparent pointer-events-none" />
        </div>

        {showBadge && (
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#11151D]/90 border border-[#D6A94F]/50 text-[10px] font-mono font-bold tracking-widest text-[#FFBD55] uppercase mb-1.5">
              Founder & Principal
            </span>
            <div className="text-lg sm:text-xl font-display font-bold text-white leading-tight">
              Gausik Srinivasan
            </div>
            <div className="text-xs font-mono text-[#9299A6] mt-0.5">
              Dracovion Technologies • Tamil Nadu, India
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden border-2 border-[#D6A94F]/75 ring-1 ring-[#FFBD55]/20 bg-[#161B24] shadow-[0_0_16px_rgba(214,169,79,0.28)] shrink-0 select-none ${AVATAR_SIZE_CLASSES[size]} ${className}`}
    >
      <img
        src={founderPhoto}
        alt={altText}
        className="w-full h-full object-cover object-top scale-[2.25] origin-[48%_14%]"
        loading="lazy"
      />
      <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_14px_rgba(5,6,9,0.65)]" />
    </div>
  );
};
