import React from 'react';
import { Link } from 'react-router-dom';
import { SignupBrandPanel } from '../../components/auth/SignupBrandPanel';
import { SignupRegistrationCard } from '../../components/auth/SignupRegistrationCard';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-x-hidden selection:bg-[#D6A94F]/30 selection:text-[#F5D18A]">
      {/* Cinematic Deep Dusk Twilight Atmospheric Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(ellipse_at_top_left,rgba(61,26,58,0.35)_0%,rgba(26,15,43,0.25)_35%,transparent_70%)]" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(214,169,79,0.12)_0%,transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[750px] h-[450px] bg-[radial-gradient(ellipse_at_bottom,rgba(120,191,255,0.06)_0%,transparent_65%)] blur-2xl" />
      </div>

      {/* Top Floating Utility Navigation Bar */}
      <header className="relative z-20 w-full px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between border-b border-[#292E38]/40 bg-[#050609]/60 backdrop-blur-md">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs font-mono text-[#9299A6] hover:text-[#FFBD55] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#D6A94F]" />
          <span>BACK TO HOMEPAGE</span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono text-[#9299A6]">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#292E38]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#52D69A]" />
            <span>256-BIT ENCRYPTION</span>
          </div>

          <div className="flex items-center gap-1 text-[#FFBD55]">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">OFFICIAL REGISTRATION PORTAL</span>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Column: Branding, Dragon Artwork, Highlights, HQ Architectural Stage */}
          <section aria-label="Dracovion Platform Overview" className="w-full">
            <SignupBrandPanel />
          </section>

          {/* Right Column: God-Level Glowing Registration Card */}
          <section aria-label="Dracovion Account Registration" className="w-full">
            <SignupRegistrationCard />
          </section>
        </div>
      </main>

      {/* Page Footer Legal Line */}
      <footer className="relative z-10 py-6 border-t border-[#292E38]/30 text-center text-xs text-[#9299A6] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} DRACOVION TECHNOLOGIES. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[#FFBD55] transition-colors">
              Privacy Notice
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#FFBD55] transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-[#FFBD55] transition-colors">
              Contact Desk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

