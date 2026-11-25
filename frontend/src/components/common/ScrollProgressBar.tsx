import React, { useEffect, useState } from 'react';

/**
 * Top Scroll Progress Bar
 * Displays a subtle gold gradient progress indicator as the user scrolls through the page.
 */
export const ScrollProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const progress = Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#D6A94F] via-[#FFBD55] to-[#F5D18A] transition-[width] duration-75 ease-out shadow-[0_0_10px_rgba(255,189,85,0.7)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

