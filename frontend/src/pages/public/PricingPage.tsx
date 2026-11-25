import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, FileText } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const tiers = [
    {
      name: 'Allhunter Student Prototype',
      target: 'College Engineering & MCA Students (Tamil Nadu / India)',
      priceFormatted: '₹4,500',
      delivery: '5-7 Days',
      description: 'Full working prototype, clean source code repository, documentation, and viva technical coaching.',
      features: [
        'Complete working prototype frontend & backend',
        'Database models & API walkthrough',
        'System architecture diagrams & DFD flowcharts',
        'One-on-one live viva coaching & defense review',
        '100% academic integrity & clean commit history',
      ],
      isPopular: false,
      isStudent: true,
      category: 'allhunter_student_project',
    },
    {
      name: 'Corporate & Portfolio Site',
      target: 'Founders, Consultancies & Emerging Brands',
      priceFormatted: '₹15,000',
      delivery: '7-10 Days',
      description: 'High-speed, SEO-engineered corporate web platforms with bespoke typography, motion, and conversion funnels.',
      features: [
        '100% responsive dark obsidian luxury layout',
        'Framer Motion & Canvas ambient micro-interactions',
        'Lead capture form with spam protection & email alerts',
        'Core Web Vitals 95+ & Google Search optimization',
        'SSL hardening & edge cloud deployment',
      ],
      isPopular: false,
      category: 'web-development',
    },
    {
      name: 'Full-Stack Web Application',
      target: 'Startups, SaaS Founders & Enterprises',
      priceFormatted: '₹45,000',
      delivery: '20-30 Days',
      description: 'Custom SaaS platform, customer portal, or operational tool with secure authentication and database persistence.',
      features: [
        'Strict type-safe TypeScript & React 19 architecture',
        'Server-enforced RBAC (Admin, Client, Team)',
        'MongoDB Atlas database architecture & compound indexes',
        'Interactive dashboards & real-time analytics',
        '30-day post-launch warranty & SLA guarantee',
      ],
      isPopular: true,
      category: 'software-development',
    },
    {
      name: 'Custom Enterprise & AI Solution',
      target: 'Established Operations & Scaled Firms',
      priceFormatted: '₹95,000+',
      delivery: 'Custom Sprints',
      description: 'Dedicated bespoke microservices, multimodal AI/OCR pipelines, custom ERP integrations, and 24/7 SLA.',
      features: [
        'Dedicated Principal Engineer & Architecture Blueprint',
        'Custom PyTorch / FastAPI AI Model Ingestion',
        'Multi-branch GST accounting & billing reconciliation',
        'Zero-trust encrypted deliverable vault',
        'Priority 24/7 incident SLA retainer option',
      ],
      isPopular: false,
      category: 'ai-ml',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-[#050609]">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>RADICAL TRANSPARENCY</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight">
          Transparent Indicative Pricing
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          No hidden fees, no hostage source code. Every engagement operates on transparent milestone approvals and milestone invoicing.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 relative shadow-lg ${
              tier.isPopular
                ? 'bg-[#161B26] border-[#FFBD55] shadow-[0_20px_50px_rgba(214,169,79,0.25)]'
                : 'bg-[#11151D] border-[#292E38] hover:border-[#D6A94F]/40'
            }`}
          >
            {tier.isPopular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider text-[#050609] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] uppercase shadow-md">
                Most Requested
              </span>
            )}

            <div>
              <div className="text-xs font-mono text-[#D6A94F] mb-1">
                {tier.target}
              </div>

              <h3 className="text-xl font-display font-bold text-white mb-4">
                {tier.name}
              </h3>

              <div className="mb-4">
                <span className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                  {tier.priceFormatted}
                </span>
                <span className="text-xs text-[#9299A6] block mt-1 font-mono">
                  Delivery: {tier.delivery}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {tier.description}
              </p>

              <div className="space-y-2.5 mb-6 border-t border-[#292E38] pt-4">
                {tier.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FFBD55] flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/contact"
              className={`w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 ${
                tier.isPopular
                  ? 'btn-gold-primary'
                  : 'btn-gold-outline'
              }`}
            >
              <span>Get Precise Quotation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Assurance Banner */}
      <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
        <ShieldCheck className="w-12 h-12 text-[#FFBD55] shrink-0" />
        <div className="space-y-1">
          <h4 className="text-lg font-display font-bold text-white">Direct Milestone Deliverable Guarantee</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Work is divided into inspectable milestones (e.g. Prototype, API Integration, Production Deploy). Code reviews, project updates, and production deliverables are accessible directly through your client vault.
          </p>
        </div>
      </div>
    </div>
  );
};
