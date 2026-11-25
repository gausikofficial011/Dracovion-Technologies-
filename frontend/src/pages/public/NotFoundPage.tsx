import React from 'react';
import { Link } from 'react-router-dom';
import { DragonEmblem } from '../../components/ui/DragonLogo';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[#050609] relative overflow-hidden">
      {/* Ambient Gold Halo */}
      <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(214,169,79,0.1)_0%,transparent_70%)] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto space-y-6">
        <DragonEmblem size={72} glow={true} variant="gold" className="mx-auto" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ERROR 404 • UNCHARTED COORDINATE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight">
          Page Beyond Digital Horizon
        </h1>

        <p className="text-sm sm:text-base text-[#9299A6] leading-relaxed">
          The requested resource, architecture path, or document does not exist within the Dracovion platform network.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-gold-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            to="/services"
            className="btn-gold-outline px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <span>Explore Services</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

