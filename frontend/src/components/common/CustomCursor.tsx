import React, { useEffect, useRef, useState } from 'react';

/**
 * Custom Interactive Luxury Cursor (Public Showcase Only)
 * - Small gold cursor dot with a smooth trailing ring
 * - Uses refs + direct DOM transforms so mouse movement never triggers React re-renders or disconnects the loop
 * - Automatically hidden on touch screens, when pointer leaves viewport, or with prefers-reduced-motion
 */
export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    let targetX = -100;
    let targetY = -100;
    let followerX = -100;
    let followerY = -100;
    let visible = false;
    let hovered = false;
    let clicking = false;
    let animId = 0;

    const applyVisuals = () => {
      if (dotRef.current) {
        dotRef.current.style.opacity = visible ? '1' : '0';
        const dotScale = clicking ? 0.72 : hovered ? 1.35 : 1;
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      }

      if (ringRef.current) {
        ringRef.current.style.opacity = visible ? '1' : '0';
        const size = hovered ? '44px' : '26px';
        ringRef.current.style.width = size;
        ringRef.current.style.height = size;
        ringRef.current.style.border = hovered ? '1.5px solid #FFBD55' : '1px solid rgba(214, 169, 79, 0.45)';
        ringRef.current.style.backgroundColor = hovered ? 'rgba(214, 169, 79, 0.08)' : 'transparent';
        ringRef.current.style.boxShadow = hovered ? '0 0 20px rgba(214, 169, 79, 0.25)' : 'none';
      }
    };

    const animateFollower = () => {
      followerX += (targetX - followerX) * 0.22;
      followerY += (targetY - followerY) * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(animateFollower);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!visible) {
        followerX = e.clientX;
        followerY = e.clientY;
      }
      visible = true;
      targetX = e.clientX;
      targetY = e.clientY;

      const target = e.target as HTMLElement | null;
      hovered = Boolean(
        target?.closest('a, button, input, textarea, select, [role="button"], .interactive, .glass-panel-hover')
      );
      applyVisuals();
    };

    const onMouseDown = () => {
      clicking = true;
      applyVisuals();
    };

    const onMouseUp = () => {
      clicking = false;
      applyVisuals();
    };

    const onMouseLeave = () => {
      visible = false;
      applyVisuals();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    animId = requestAnimationFrame(animateFollower);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] opacity-0 transition-opacity duration-150"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD55] shadow-[0_0_12px_rgba(255,189,85,0.9)]" />
      </div>

      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] opacity-0 rounded-full transition-[width,height,border-color,background-color,opacity] duration-200"
        style={{ width: '26px', height: '26px', border: '1px solid rgba(214, 169, 79, 0.45)' }}
      />
    </>
  );
};
