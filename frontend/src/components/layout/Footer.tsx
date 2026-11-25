import React from 'react';
import { Link } from 'react-router-dom';
import { DracovionLogo } from '../ui/DragonLogo';
import {
  MapPin,
  Mail,
  GraduationCap,
  ArrowUpRight,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050609] border-t border-[#292E38] text-[#9299A6] relative overflow-hidden">
      {/* Subtle Ambient Gold Light Trace */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#D6A94F]/60 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Info & Mission (Col 1-4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-block" aria-label="Dracovion Home">
              <DracovionLogo variant="horizontal" size="md" glow={true} />
            </Link>

            <p className="text-sm text-[#9299A6] leading-relaxed max-w-sm">
              ENGINEERING THE FUTURE. BUILDING BEYOND LIMITS. <br />
              Next-generation full-stack software architectures, cognitive artificial intelligence, and bespoke digital products founded by Gausik Srinivasan.
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-[#FFBD55] flex-shrink-0" />
                <span>Headquarters: Tamil Nadu, India (Global Scalability)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-[#D6A94F] flex-shrink-0" />
                <a href="mailto:dracoviontechnology@gmail.com" className="hover:text-[#FFBD55] transition-colors font-mono">
                  dracoviontechnology@gmail.com
                </a>
              </div>
            </div>

            {/* Social Icons (Direct SVG) */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://github.com/dracovion-technology"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55] flex items-center justify-center text-slate-300 hover:text-[#FFBD55] transition-all"
                aria-label="Dracovion Technologies on GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/dracovion_technologies?hvrq=MWxuaXdtZ2tsYjdhNQ=="
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55] flex items-center justify-center text-slate-300 hover:text-[#FFBD55] transition-all"
                aria-label="Dracovion Technologies on Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55] flex items-center justify-center text-slate-300 hover:text-[#FFBD55] transition-all"
                aria-label="Dracovion on LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55] flex items-center justify-center text-slate-300 hover:text-[#FFBD55] transition-all"
                aria-label="Dracovion on X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* End-to-End Services (Col 5-7) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase mb-4 text-[#F5D18A]">
              Services & Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/services/web-development" className="hover:text-white transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/services/mobile-development" className="hover:text-white transition-colors">
                  Mobile App Development
                </Link>
              </li>
              <li>
                <Link to="/services/ai-ml" className="hover:text-white transition-colors">
                  AI & Machine Learning
                </Link>
              </li>
              <li>
                <Link to="/services/software-development" className="hover:text-white transition-colors">
                  Software Engineering
                </Link>
              </li>
              <li>
                <Link to="/services/ui-ux-design" className="hover:text-white transition-colors">
                  UI/UX Design Systems
                </Link>
              </li>
              <li>
                <Link to="/services/cloud-solutions" className="hover:text-white transition-colors">
                  Cloud Infrastructure
                </Link>
              </li>
              <li>
                <Link to="/services/database-management" className="hover:text-white transition-colors">
                  Database Management
                </Link>
              </li>
              <li>
                <Link to="/services/it-consulting" className="hover:text-white transition-colors">
                  IT Consulting & Automation
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Navigation & Gateway (Col 8-10) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase mb-4 text-[#F5D18A]">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Dracovion
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Products & Innovations
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors">
                  Projects & Portfolio
                </Link>
              </li>
              <li>
                <Link to="/allhunter" className="hover:text-white transition-colors flex items-center gap-1.5 text-[#FFBD55]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Allhunter for Students</span>
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">
                  Careers & Culture
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing &amp; Custom Bids
                </Link>
              </li>
              <li>
                <a href="/#payment-method" className="hover:text-white transition-colors">
                  Payment &amp; Allocation Method
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Direct Chat
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/dracovion-technology"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>GitHub Organization</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/dracovion_technologies?hvrq=MWxuaXdtZ2tsYjdhNQ=="
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </li>
              <li className="pt-2 border-t border-[#292E38]/60 flex items-center gap-3">
                <Link
                  to="/signin"
                  className="px-3 py-1 rounded-lg bg-[#11151D] border border-[#D6A94F]/40 text-[#FFBD55] hover:border-[#FFBD55] transition-colors text-xs font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] transition-all text-xs font-bold uppercase tracking-wider hover:opacity-90"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Student & Allhunter Banner (Col 11-12) */}
          <div className="lg:col-span-2">
            <div className="p-4 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#FFBD55] text-xs font-mono font-semibold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Allhunter Hub</span>
              </div>
              <p className="text-xs text-[#9299A6] leading-relaxed">
                Empowering college students in Tamil Nadu with legitimate prototype engineering, code reviews, and viva defense mentoring.
              </p>
              <Link
                to="/allhunter"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFBD55] hover:text-white transition-colors"
              >
                <span>Visit Allhunter</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Legal, Policy & Copyright Strip */}
        <div className="mt-14 pt-8 border-t border-[#292E38] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="text-[#9299A6]">
            &copy; {new Date().getFullYear()} DRACOVION TECHNOLOGIES. All rights reserved. Founded by Gausik Srinivasan.
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#9299A6]">
            <Link to="/privacy" className="hover:text-[#FFBD55] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#FFBD55] transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/cookies" className="hover:text-[#FFBD55] transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
