import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Lock,
  CheckCircle2,
  Compass,
  Sparkles,
} from 'lucide-react';

const HOMEPAGE_ANCHORS = [
  { label: 'Services', href: '#services' },
  { label: 'About Us', href: '#about' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Payment & Bids', href: '#payment-method' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact & Chat', href: '#contact' },
];

/**
 * Homepage quick-navigation guide and brief explanation of Dracovion's
 * direct project allocation, payment sharing, and live chat rules.
 */
export const PaymentAndAllocationSection: React.FC = () => {
  const { isAuthenticated, isWorkspaceStaff } = useAuth();
  const chatDestination = isAuthenticated
    ? isWorkspaceStaff
      ? '/workspace/orders'
      : '/portal/messages'
    : '/contact';

  return (
    <section
      id="payment-method"
      className="relative py-20 bg-[#050609] border-t border-[#292E38]"
      aria-label="Payment Method and Engagement Policy"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Homepage Section Navigation Detail Strip */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0D13] border border-[#D6A94F]/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#FFBD55] uppercase tracking-wider font-bold shrink-0">
            <Compass className="w-4 h-4 text-[#FFBD55]" />
            <span>Homepage Navigation Guide</span>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Homepage sections">
            {HOMEPAGE_ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-lg bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55]/60 text-xs font-mono text-[#E7E9EE] hover:text-[#FFBD55] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/pricing"
              className="px-3 py-1.5 rounded-lg bg-[#11151D] border border-[#292E38] hover:border-[#78BFFF]/60 text-xs font-mono text-[#78BFFF] transition-colors"
            >
              Scope &amp; Bids
            </Link>
            <Link
              to={chatDestination}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-700/60 hover:border-emerald-500 text-xs font-mono text-emerald-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Chat Desk</span>
            </Link>
          </nav>
        </div>

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRANSPARENT PAYMENT &amp; ALLOCATION POLICY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight">
            PAYMENT &amp; <span className="text-gold-shimmer">PROJECT METHOD.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#9299A6] leading-relaxed">
            Built for direct accountability: projects are allocated only after verified personal details, live chat connects you with your engineer, and direct payments open exclusively when your assigned engineer shares payment credentials.
          </p>
        </div>

        {/* 4-Stage Interactive Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#D6A94F]/40 flex items-center justify-center text-[#FFBD55]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono text-[#FFBD55] uppercase font-bold">
              01. Personal Details Gate
            </div>
            <h3 className="text-base font-display font-bold text-white">Verified Details Required</h3>
            <p className="text-xs text-[#9299A6] leading-relaxed">
              Every project order is allocated to a Lead Engineer <strong className="text-white">only after</strong> you provide complete personal details (Full Name, Phone Number, and City/Location).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#78BFFF]/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#78BFFF]/40 flex items-center justify-center text-[#78BFFF]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono text-[#78BFFF] uppercase font-bold">
              02. Allocation &amp; Live Chat
            </div>
            <h3 className="text-base font-display font-bold text-white">Direct Person-to-Person Chat</h3>
            <p className="text-xs text-[#9299A6] leading-relaxed">
              Once allocated, talk directly inside the built-in real-time order chat with your assigned engineer to finalize scope bids, milestones, and technical updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-rose-500/40 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#050609] border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono text-rose-400 uppercase font-bold">
              03. Zero Unverified Payments
            </div>
            <h3 className="text-base font-display font-bold text-white">Employee Must Share Details First</h3>
            <p className="text-xs text-[#9299A6] leading-relaxed">
              Clients are <strong className="text-white">not allowed</strong> to make payments beforehand. Payment unlocks <strong className="text-white">only when</strong> the assigned employee explicitly shares their payment details with you.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-emerald-500/50 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#050609] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold">
              04. Direct Pay &amp; Handover
            </div>
            <h3 className="text-base font-display font-bold text-white">UPI / Bank Transfer Direct</h3>
            <p className="text-xs text-[#9299A6] leading-relaxed">
              Pay directly via UPI (GPay / PhonePe / Paytm) or Bank Transfer (NEFT / IMPS) to your assigned engineer, submit your UTR reference, and unlock production deliverables.
            </p>
          </div>
        </div>

        {/* Concise Action Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0A0D13] via-[#11151D] to-[#0A0D13] border border-[#D6A94F]/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#FFBD55]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accepted Methods: UPI • NEFT / IMPS Bank Transfer • Custom Bid Milestones</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-white">
              Ready to initiate your project or talk directly with our engineers?
            </h3>
            <p className="text-xs text-[#9299A6]">
              Provide your personal details when placing an order so an engineer can claim it and open direct chat &amp; payment access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to={isAuthenticated ? '/portal/order/new' : '/signup'}
              className="btn-gold-primary inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAuthenticated ? 'Place Order & Verify Details' : 'Create Account to Start'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={chatDestination}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold bg-[#080A0E] border border-[#292E38] hover:border-[#78BFFF] text-[#78BFFF] transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Direct Chat</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
