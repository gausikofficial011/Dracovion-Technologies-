import React from 'react';
import { Link } from 'react-router-dom';

interface MonogramLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  asLink?: boolean;
}

export const MonogramLogo: React.FC<MonogramLogoProps> = ({
  size = 'md',
  showTagline = false,
  asLink = true,
}) => {
  const sizeMap = {
    sm: { box: 32, textClass: 'text-lg', subClass: 'text-[9px]' },
    md: { box: 42, textClass: 'text-xl', subClass: 'text-[11px]' },
    lg: { box: 56, textClass: 'text-2xl', subClass: 'text-xs' },
  };

  const { box, textClass, subClass } = sizeMap[size];

  const content = (
    <div className="flex items-center gap-3 select-none group">
      {/* Abstract Geometric Dragon Monogram 'D' */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#D6A94F] to-[#FFBD55] opacity-25 blur-md group-hover:opacity-45 transition-opacity"
        />
        <svg
          width={box}
          height={box}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="logoDragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4D2" />
              <stop offset="50%" stopColor="#FFBD55" />
              <stop offset="100%" stopColor="#D6A94F" />
            </linearGradient>
          </defs>
          {/* Outer Monogram Frame */}
          <rect width="100" height="100" rx="24" fill="#080A0E" />
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            rx="22"
            stroke="rgba(214, 169, 79, 0.35)"
            strokeWidth="3"
          />

          {/* Dragon Geometric D Arc */}
          <path
            d="M28 22 H54 C72 22, 82 34, 82 50 C82 66, 72 78, 54 78 H28 V22 Z"
            stroke="url(#logoDragonGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Facet / Dragon Crest */}
          <path
            d="M44 38 H52 C60 38, 66 43, 66 50 C66 57, 60 62, 52 62 H44 V38 Z"
            fill="url(#logoDragonGrad)"
            opacity="0.3"
          />

          {/* Core Dragon Eye Node */}
          <circle cx="50" cy="50" r="4.5" fill="#FFBD55" />
          <polygon points="50,22 64,36 52,36 42,22" fill="#FFBD55" opacity="0.8" />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <div className={`font-bold tracking-tight text-white ${textClass} flex items-center gap-1.5`}>
          <span>Dracovion</span>
          <span className="text-gold-gradient font-light">Technologies</span>
        </div>
        {showTagline && (
          <span className={`text-[#9299A6] font-mono tracking-widest uppercase ${subClass}`}>
            Technology Without Limits.
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-[#D6A94F]/50 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};
