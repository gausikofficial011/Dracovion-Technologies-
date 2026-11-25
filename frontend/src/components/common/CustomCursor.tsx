import React, { useEffect, useState } from 'react';

/**
 * Custom Interactive Luxury Cursor
 * - Small gold cursor dot with a smooth trailing ring
 * - Automatically expands on interactive elements (links, buttons, inputs, interactive cards)
 * - Completely disabled on touch screens and when prefers-reduced-motion is enabled
 * - Pointer-events: none to ensure zero interference with clicking and text selection
 */
export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if device supports fine pointer (mouse/trackpad, not touch)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth follower animation loop
    let animId: number;
    let currentX = -100;
    let currentY = -100;

    const animateFollower = () => {
      currentX += (position.x - currentX) * 0.18;
      currentY += (position.y - currentY) * 0.18;
      setFollowerPos({ x: currentX, y: currentY });
      animId = requestAnimationFrame(animateFollower);
    };

    animId = requestAnimationFrame(animateFollower);

    // Track hover on interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('a, button, input, textarea, select, [role="button"], .interactive, .glass-panel-hover');
      setIsHovered(!!interactive);
    };

    window.addEventListener('mouseover', handleElementHover, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseover', handleElementHover);
      cancelAnimationFrame(animId);
    };
  }, [position.x, position.y]);

  if (!isEnabled || !isVisible) return null;

  return (
    <>
      {/* Central Gold Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isClicking ? 0.7 : isHovered ? 1.4 : 1})`,
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD55] shadow-[0_0_12px_rgba(255,189,85,0.9)]" />
      </div>

      {/* Trailing Luxury Gold Ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-color,background-color] duration-200"
        style={{
          transform: `translate3d(${followerPos.x}px, ${followerPos.y}px, 0)`,
          width: isHovered ? '48px' : '28px',
          height: isHovered ? '48px' : '28px',
          borderRadius: '50%',
          border: isHovered ? '1.5px solid #FFBD55' : '1px solid rgba(214, 169, 79, 0.45)',
          backgroundColor: isHovered ? 'rgba(214, 169, 79, 0.08)' : 'transparent',
          boxShadow: isHovered ? '0 0 20px rgba(214, 169, 79, 0.25)' : 'none',
        }}
      />
    </>
  );
};

