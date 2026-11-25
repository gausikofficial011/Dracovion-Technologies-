import React from 'react';
import officialEmblemImg from '../../assets/dracovion-emblem.png';
import officialLogoImg from '../../assets/dracovion-logo.png';
import officialHorizontalImg from '../../assets/dracovion-horizontal.png';

export interface DragonEmblemProps {
  className?: string;
  size?: number;
  glow?: boolean;
  animated?: boolean;
  variant?: 'gold' | 'white' | 'cyber';
}

/**
 * Official Dracovion Dragon Emblem Component
 * Renders the official geometric cybernetic golden dragon emblem.
 */
export const DragonEmblem: React.FC<DragonEmblemProps> = ({
  className = '',
  size = 40,
  glow = false,
  animated = false,
  variant = 'gold',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        animated ? 'transition-transform duration-500 hover:scale-105' : ''
      } ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Dracovion Official Dragon Emblem"
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md pointer-events-none"
          style={{
            background:
              variant === 'white'
                ? 'rgba(255, 255, 255, 0.3)'
                : 'radial-gradient(circle, rgba(255, 189, 85, 0.5) 0%, rgba(214, 169, 79, 0.2) 65%, transparent 100%)',
          }}
        />
      )}
      <img
        src={officialEmblemImg}
        alt="Dracovion Official Dragon Emblem"
        width={size}
        height={size}
        className={`w-full h-full object-contain select-none drop-shadow-[0_0_12px_rgba(214,169,79,0.35)] ${
          variant === 'white' ? 'brightness-125 grayscale contrast-125' : ''
        }`}
        loading="eager"
      />
    </div>
  );
};

export interface DracovionLogoProps {
  variant?: 'full' | 'horizontal' | 'compact' | 'emblem' | 'gold' | 'white' | 'loading';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glow?: boolean;
}

/**
 * Complete Dracovion Official Logo System
 * Supports full horizontal brandmark, compact emblem, loading states, and color variations.
 */
export const DracovionLogo: React.FC<DracovionLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  glow = false,
}) => {
  const heightMap = {
    sm: 34,
    md: 44,
    lg: 56,
    xl: 74,
  };

  const currentHeight = heightMap[size];

  if (variant === 'emblem') {
    return <DragonEmblem size={currentHeight} glow={glow} className={className} />;
  }

  if (variant === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-2xl bg-[#D6A94F]/30 animate-pulse pointer-events-none" />
          <img
            src={officialLogoImg}
            alt="Dracovion Technologies Official Logo"
            className="w-48 sm:w-64 h-auto object-contain select-none drop-shadow-[0_0_25px_rgba(214,169,79,0.5)]"
          />
        </div>
      </div>
    );
  }

  if (variant === 'gold') {
    return (
      <div className={`inline-flex flex-col items-center justify-center group select-none shrink-0 ${className}`}>
        <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
          {glow && (
            <div className="absolute inset-0 rounded-full blur-2xl bg-[#FFBD55]/25 pointer-events-none" />
          )}
          <img
            src={officialLogoImg}
            alt="Dracovion Technologies Official Logo"
            style={{ height: Math.round(currentHeight * 1.9), width: 'auto' }}
            className="object-contain drop-shadow-[0_0_20px_rgba(214,169,79,0.45)]"
          />
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center group select-none shrink-0 ${className}`}>
        <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.02]">
          {glow && (
            <div className="absolute inset-0 rounded-full blur-xl bg-[#FFBD55]/20 pointer-events-none" />
          )}
          <img
            src={officialHorizontalImg}
            alt="Dracovion Technologies Official Logo"
            style={{ height: currentHeight, width: 'auto' }}
            className="object-contain drop-shadow-[0_0_14px_rgba(214,169,79,0.35)]"
          />
        </div>
      </div>
    );
  }

  if (variant === 'white') {
    return (
      <div className={`inline-flex items-center gap-3 group select-none shrink-0 whitespace-nowrap ${className}`}>
        <div className="relative flex-shrink-0">
          <img
            src={officialEmblemImg}
            alt="Dracovion Logo Emblem"
            style={{ height: currentHeight, width: 'auto' }}
            className="object-contain grayscale brightness-150 contrast-125"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-display font-extrabold tracking-[0.05em] text-white text-xl sm:text-2xl leading-none">
            DRACOVION
          </span>
          <span className="text-[10px] sm:text-[11px] font-cyber font-semibold tracking-[0.26em] text-[#9299A6] uppercase mt-1 leading-none">
            TECHNOLOGIES
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 group select-none shrink-0 whitespace-nowrap ${className}`}>
        <img
          src={officialEmblemImg}
          alt="Dracovion Emblem"
          style={{ height: currentHeight, width: 'auto' }}
          className="object-contain drop-shadow-[0_0_10px_rgba(214,169,79,0.35)]"
        />
        <span className="font-display font-extrabold tracking-tight text-white text-base sm:text-lg leading-none">
          DRACOVION
        </span>
      </div>
    );
  }

  // Default 'horizontal'
  return (
    <div className={`inline-flex items-center gap-3 group select-none shrink-0 whitespace-nowrap ${className}`}>
      <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        {glow && (
          <div className="absolute inset-0 rounded-full blur-md bg-[#FFBD55]/30 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />
        )}
        <img
          src={officialEmblemImg}
          alt="Dracovion Logo Emblem"
          style={{ height: currentHeight, width: 'auto' }}
          className="object-contain drop-shadow-[0_0_12px_rgba(214,169,79,0.4)]"
        />
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-extrabold tracking-[0.05em] text-white text-xl sm:text-2xl leading-none">
            DRACOVION
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFBD55] animate-pulse" />
        </div>
        <span className="text-[10px] sm:text-[11px] font-cyber font-semibold tracking-[0.26em] text-[#D6A94F] uppercase mt-1 leading-none">
          TECHNOLOGIES
        </span>
      </div>
    </div>
  );
};
