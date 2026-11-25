import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export type TechVideoMode = 'client' | 'admin' | 'student' | 'team' | 'partner' | 'public';

interface TechModeConfig {
  id: TechVideoMode;
  name: string;
  tagline: string;
  playbackRate: number;
  filterStyle: string;
  accentColor: string;
  secondaryColor: string;
}

const TECH_MODES: Record<TechVideoMode, TechModeConfig> = {
  client: {
    id: 'client',
    name: 'Enterprise Cloud & AI Solutions',
    tagline: 'Microservices Data Mesh • Cloud Telemetry',
    playbackRate: 0.88,
    filterStyle: 'hue-rotate(148deg) saturate(1.55) contrast(1.25) brightness(0.92)',
    accentColor: '#FFBD55',
    secondaryColor: '#D6A94F',
  },
  admin: {
    id: 'admin',
    name: 'Command Center Telemetry & Radar',
    tagline: 'Orbital Telemetry • Network Defense Radar',
    playbackRate: 1.1,
    filterStyle: 'hue-rotate(115deg) saturate(1.85) contrast(1.4) brightness(0.85)',
    accentColor: '#FF6B4A',
    secondaryColor: '#D6A94F',
  },
  student: {
    id: 'student',
    name: 'Deep AI Neural Synapse & Quantum',
    tagline: 'Synaptic Firing • Algorithmic Tensors',
    playbackRate: 1.0,
    filterStyle: 'hue-rotate(170deg) saturate(1.7) contrast(1.3) brightness(0.95)',
    accentColor: '#78BFFF',
    secondaryColor: '#FFBD55',
  },
  team: {
    id: 'team',
    name: 'DevOps Matrix & Terminal Compiler',
    tagline: 'Hex Dumps • K8s & Git Architecture DAG',
    playbackRate: 1.25,
    filterStyle: 'hue-rotate(140deg) saturate(1.4) contrast(1.5) brightness(0.88)',
    accentColor: '#52D69A',
    secondaryColor: '#D6A94F',
  },
  partner: {
    id: 'partner',
    name: 'Global Enterprise Mesh & Fintech',
    tagline: 'Interconnect Nodes • Geodesic Conduits',
    playbackRate: 0.95,
    filterStyle: 'hue-rotate(155deg) saturate(1.45) contrast(1.22) brightness(0.9)',
    accentColor: '#F5D18A',
    secondaryColor: '#FFBD55',
  },
  public: {
    id: 'public',
    name: 'Dracovion Flagship Cyber Architecture',
    tagline: 'Ascending Gold Spiral • Cyber Matrix',
    playbackRate: 1.0,
    filterStyle: 'hue-rotate(145deg) saturate(1.45) contrast(1.3) brightness(0.9)',
    accentColor: '#D6A94F',
    secondaryColor: '#FFBD55',
  },
};

const getTechModeFromPath = (path: string): TechVideoMode => {
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/portal/student') || path.startsWith('/student')) return 'student';
  if (path.startsWith('/portal/team') || path.startsWith('/team') || path.startsWith('/workspace')) return 'team';
  if (path.startsWith('/portal/partner') || path.startsWith('/partner')) return 'partner';
  if (path.startsWith('/portal') || path.startsWith('/client')) return 'client';
  return 'public';
};

interface CyberBackgroundVideoProps {
  opacity?: number;
  hueShift?: boolean;
}

/**
 * Multi-Technology Background Video & Procedural Simulation Engine
 * Automatically routes specialized technology visual video simulations per dashboard:
 * 1. Client Portal Dashboard: Enterprise Cloud SaaS & AI Delivery Mesh
 * 2. Admin Command Center: Presidential Defense Radar & Orbital Telemetry
 * 3. Student Foundation: Deep AI Neural Synapse & Quantum Tensors
 * 4. Team & Staff Workspace: DevOps Terminal Matrix & Compiler Pipeline
 * 5. Partner Portal: Global Geodesic Interconnect & Fintech Mesh
 * 6. Public Website: Flagship Dracovion Ascending Cyber Stream
 */
export const CyberBackgroundVideo: React.FC<CyberBackgroundVideoProps> = ({
  opacity = 0.38,
}) => {
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const routeMode = getTechModeFromPath(location.pathname);
  const currentModeKey = routeMode;
  const currentConfig = TECH_MODES[currentModeKey];

  // Guarantee continuous video playback & update playback rate per technology
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.playbackRate = currentConfig.playbackRate;
    } catch (_) {}

    const playVideo = () => {
      video.play().catch(() => {});
    };

    playVideo();
    window.addEventListener('click', playVideo, { once: true });
    window.addEventListener('touchstart', playVideo, { once: true });

    return () => {
      window.removeEventListener('click', playVideo);
      window.removeEventListener('touchstart', playVideo);
    };
  }, [currentConfig.playbackRate]);

  // Procedural Canvas Simulation Engine specialized per technology mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // MODE SPECIFIC DATA INITIALIZERS

    // 1. Client: Enterprise Cloud Mesh nodes
    const clientNodes = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 3 + 2,
      pulse: Math.random() * Math.PI,
      label: ['API', 'Auth', 'DB', 'Cache', 'AI-Inference', 'CDN', 'Vault', 'Queue'][Math.floor(Math.random() * 8)],
    }));

    // 2. Admin: Radar sweep & targets
    let radarAngle = 0;
    const adminTargets = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.42 * Math.min(width, height),
      label: `NODE-${Math.floor(Math.random() * 900 + 100)}`,
      status: Math.random() > 0.15 ? 'SECURE' : 'MONITOR',
      pulse: 0,
    }));

    // 3. Student: Neural Network Layers
    const neuralLayers = [
      Array.from({ length: 5 }, (_, i) => ({ x: 0.18, y: 0.2 + i * 0.15 })), // Input
      Array.from({ length: 8 }, (_, i) => ({ x: 0.4, y: 0.12 + i * 0.11 })), // Hidden 1
      Array.from({ length: 7 }, (_, i) => ({ x: 0.62, y: 0.15 + i * 0.12 })), // Hidden 2
      Array.from({ length: 4 }, (_, i) => ({ x: 0.84, y: 0.24 + i * 0.17 })), // Output
    ];
    let neuralPulse = 0;

    // 4. Team / Workspace: Terminal Matrix Rain
    const matrixChars = '01DRACOVION_GIT_DOCKER_K8S_BUILD_PASS_SHA256_0x7FFE_01';
    const fontSize = 13;
    const matrixCols = Math.floor(width / fontSize);
    const matrixDrops: number[] = Array.from({ length: matrixCols }, () => Math.floor(Math.random() * -60));

    // 5. Partner: Geodesic Constellation
    const partnerCities = [
      { name: 'SAN FRANCISCO', x: 0.18, y: 0.38 },
      { name: 'LONDON', x: 0.42, y: 0.32 },
      { name: 'DUBAI', x: 0.58, y: 0.45 },
      { name: 'CHENNAI / BLR', x: 0.68, y: 0.52 },
      { name: 'SINGAPORE', x: 0.78, y: 0.58 },
      { name: 'TOKYO', x: 0.86, y: 0.36 },
      { name: 'SYDNEY', x: 0.88, y: 0.78 },
      { name: 'NEW YORK', x: 0.26, y: 0.36 },
      { name: 'FRANKFURT', x: 0.46, y: 0.34 },
    ];
    let partnerPulse = 0;

    let lastDraw = 0;
    const fps = 30; // Smooth 30 FPS for optimal performance
    const interval = 1000 / fps;

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (time - lastDraw < interval) return;
      lastDraw = time;

      // Dark fade trail
      ctx.fillStyle = 'rgba(5, 6, 9, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // RENDER SPECIFIC TECHNOLOGY ENGINE
      if (currentModeKey === 'client') {
        // --- 1. ENTERPRISE CLOUD SAAS & AI MESH ---
        ctx.strokeStyle = 'rgba(214, 169, 79, 0.16)';
        ctx.fillStyle = '#FFBD55';
        ctx.lineWidth = 1;

        // Draw node connections
        for (let i = 0; i < clientNodes.length; i++) {
          const a = clientNodes[i];
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > width) a.vx *= -1;
          if (a.y < 0 || a.y > height) a.vy *= -1;
          a.pulse += 0.04;

          for (let j = i + 1; j < clientNodes.length; j++) {
            const b = clientNodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 160) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(214, 169, 79, ${0.28 * (1 - dist / 160)})`;
              ctx.stroke();

              // Transmitting packet
              if (Math.sin(a.pulse + j) > 0.85) {
                const px = a.x + (b.x - a.x) * ((Math.sin(a.pulse * 2) + 1) / 2);
                const py = a.y + (b.y - a.y) * ((Math.sin(a.pulse * 2) + 1) / 2);
                ctx.fillStyle = '#FFF7DB';
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // Node body & label
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.size + Math.sin(a.pulse) * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 189, 85, 0.7)';
          ctx.fill();

          if (i % 3 === 0) {
            ctx.font = '9px monospace';
            ctx.fillStyle = 'rgba(214, 169, 79, 0.6)';
            ctx.fillText(a.label, a.x + 8, a.y + 3);
          }
        }
      } else if (currentModeKey === 'admin') {
        // --- 2. PRESIDENTIAL TACTICAL DEFENSE RADAR ---
        const cx = width / 2;
        const cy = height / 2;
        const maxR = Math.min(width, height) * 0.44;

        radarAngle += 0.025;

        // Concentric Tactical Circles
        ctx.strokeStyle = 'rgba(214, 169, 79, 0.18)';
        ctx.lineWidth = 1;
        for (let r = maxR * 0.25; r <= maxR; r += maxR * 0.25) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx - maxR, cy);
        ctx.lineTo(cx + maxR, cy);
        ctx.moveTo(cx, cy - maxR);
        ctx.lineTo(cx, cy + maxR);
        ctx.stroke();

        // Sweeping Radar Beam (Conic Gradient)
        const sweepGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        sweepGradient.addColorStop(0, 'rgba(255, 189, 85, 0.35)');
        sweepGradient.addColorStop(1, 'rgba(214, 169, 79, 0.0)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, radarAngle - 0.45, radarAngle);
        ctx.closePath();
        ctx.fillStyle = 'rgba(214, 169, 79, 0.12)';
        ctx.fill();
        ctx.restore();

        // Radar Sweep Line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(radarAngle) * maxR, cy + Math.sin(radarAngle) * maxR);
        ctx.strokeStyle = 'rgba(255, 247, 219, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tactical Targets
        adminTargets.forEach((t) => {
          const tx = cx + Math.cos(t.angle) * t.dist;
          const ty = cy + Math.sin(t.angle) * t.dist;

          const diffAngle = Math.abs((radarAngle % (Math.PI * 2)) - (t.angle % (Math.PI * 2)));
          if (diffAngle < 0.2) t.pulse = 1.0;
          t.pulse = Math.max(0.15, t.pulse - 0.02);

          ctx.beginPath();
          ctx.arc(tx, ty, 3 + t.pulse * 3, 0, Math.PI * 2);
          ctx.fillStyle = t.status === 'SECURE' ? `rgba(214, 169, 79, ${t.pulse})` : `rgba(255, 107, 74, ${t.pulse})`;
          ctx.fill();

          ctx.font = '9px monospace';
          ctx.fillStyle = `rgba(255, 189, 85, ${t.pulse})`;
          ctx.fillText(`[${t.label}]`, tx + 6, ty - 4);
        });

        // Top telemetry header
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(214, 169, 79, 0.45)';
        ctx.fillText('DRACOVION EXECUTIVE TACTICAL COMMAND • ORBITAL NODE PING: 12ms • ZERO ANOMALIES', 30, 40);
      } else if (currentModeKey === 'student') {
        // --- 3. DEEP AI NEURAL SYNAPSE & QUANTUM ---
        neuralPulse += 0.035;

        // Draw synaptic connections between layers
        for (let l = 0; l < neuralLayers.length - 1; l++) {
          const layerA = neuralLayers[l];
          const layerB = neuralLayers[l + 1];

          for (let i = 0; i < layerA.length; i++) {
            const na = { x: layerA[i].x * width, y: layerA[i].y * height };
            for (let j = 0; j < layerB.length; j++) {
              const nb = { x: layerB[j].x * width, y: layerB[j].y * height };

              ctx.beginPath();
              ctx.moveTo(na.x, na.y);
              ctx.lineTo(nb.x, nb.y);
              const linkWeight = Math.sin(neuralPulse + i * 0.7 + j * 0.5);
              ctx.strokeStyle = `rgba(120, 191, 255, ${0.08 + Math.max(0, linkWeight) * 0.22})`;
              ctx.lineWidth = 1;
              ctx.stroke();

              // Action potential pulse
              if (linkWeight > 0.75) {
                const pos = (neuralPulse * 2 + i + j) % 1;
                const px = na.x + (nb.x - na.x) * pos;
                const py = na.y + (nb.y - na.y) * pos;
                ctx.fillStyle = '#FFF7DB';
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }

        // Draw neurons
        neuralLayers.forEach((layer, lIdx) => {
          layer.forEach((node, nIdx) => {
            const nx = node.x * width;
            const ny = node.y * height;
            const glow = Math.sin(neuralPulse * 2 + lIdx + nIdx) * 0.5 + 0.5;

            ctx.beginPath();
            ctx.arc(nx, ny, 4 + glow * 3, 0, Math.PI * 2);
            ctx.fillStyle = lIdx === 0 ? '#78BFFF' : lIdx === 3 ? '#FFBD55' : 'rgba(214, 169, 79, 0.85)';
            ctx.fill();
          });
        });

        // Floating AI equations
        const formulas = ['∇·B = 0', 'ReLU(W·x + b)', 'Softmax(z_i)', 'Loss → 0.0014', 'E = mc²', 'Q_t+1 = Q_t + αδ'];
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(120, 191, 255, 0.35)';
        formulas.forEach((f, idx) => {
          const fx = (0.1 + idx * 0.15) * width;
          const fy = (0.85 + Math.sin(neuralPulse + idx) * 0.03) * height;
          ctx.fillText(f, fx, fy);
        });
      } else if (currentModeKey === 'team') {
        // --- 4. DEVOPS MATRIX & TERMINAL ENGINE ---
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < matrixDrops.length; i++) {
          const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
          const x = i * fontSize;
          const y = matrixDrops[i] * fontSize;

          if (Math.random() > 0.86) {
            ctx.fillStyle = '#FFF7DB'; // Bright runner
          } else if (Math.random() > 0.4) {
            ctx.fillStyle = '#52D69A'; // Emerald DevOps code
          } else {
            ctx.fillStyle = 'rgba(214, 169, 79, 0.75)'; // Warm Gold trail
          }

          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i]++;
        }

        // Terminal Prompt overlay watermark
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(82, 214, 154, 0.25)';
        ctx.fillText('dracovion@workspace:~$ git status --porcelain && docker build -t dracovion/engine:latest .', 24, height - 28);
      } else if (currentModeKey === 'partner') {
        // --- 5. GLOBAL GEODESIC & FINTECH MESH ---
        partnerPulse += 0.03;

        // Draw connections between partner tech hubs
        ctx.strokeStyle = 'rgba(245, 209, 138, 0.16)';
        ctx.lineWidth = 1;

        for (let i = 0; i < partnerCities.length; i++) {
          const a = { x: partnerCities[i].x * width, y: partnerCities[i].y * height };
          for (let j = i + 1; j < partnerCities.length; j++) {
            const b = { x: partnerCities[j].x * width, y: partnerCities[j].y * height };

            // Curved arc
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2 - 40;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(midX, midY, b.x, b.y);
            ctx.strokeStyle = `rgba(214, 169, 79, ${0.12 + Math.sin(partnerPulse + i + j) * 0.08})`;
            ctx.stroke();
          }

          // City Hub Pin
          ctx.beginPath();
          ctx.arc(a.x, a.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#FFBD55';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(a.x, a.y, 8 + Math.sin(partnerPulse + i) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(214, 169, 79, 0.35)';
          ctx.stroke();

          ctx.font = '9px monospace';
          ctx.fillStyle = 'rgba(245, 209, 138, 0.7)';
          ctx.fillText(partnerCities[i].name, a.x + 8, a.y + 3);
        }
      } else {
        // --- 6. PUBLIC FLAGSHIP CYBER ASCENSION ---
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < matrixDrops.length; i++) {
          const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
          const x = i * fontSize;
          const y = matrixDrops[i] * fontSize;

          if (Math.random() > 0.88) {
            ctx.fillStyle = '#FFF7DB'; // Bright gold head
          } else {
            ctx.fillStyle = 'rgba(214, 169, 79, 0.75)'; // Brand Gold trail
          }

          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.98) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i]++;
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentModeKey]);

  return (
    <>
      {/* Background Container */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
        style={{ willChange: 'transform' }}
      >
        {/* Layer 1: Procedural Technology Canvas Simulation */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />

        {/* Layer 2: High-Def Cyber Technology Hacking Video Loop with Dynamic Mode Shader */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen transition-all duration-1000"
          style={{
            opacity,
            filter: currentConfig.filterStyle,
          }}
        >
          <source src="/assets/cyber-tech-bg.mp4" type="video/mp4" />
          <source src="/assets/cyber-tech-bg.webm" type="video/webm" />
        </video>

        {/* Layer 3: High-Tech Cyber Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(214, 169, 79, 0.45) 1px, transparent 1px)',
            backgroundSize: '100% 4px',
          }}
        />

        {/* Layer 4: Cinematic Vignette (Preserves maximum contrast and legibility for content) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(5, 6, 9, 0.45) 0%, rgba(5, 6, 9, 0.82) 70%, #050609 100%)',
          }}
        />
      </div>
    </>
  );
};
