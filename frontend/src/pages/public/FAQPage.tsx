import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Dracovion Technologies structure pricing and quotations?',
      a: 'We evaluate every project based on functional scope, integration complexity, and timeline requirements. You will receive an itemized proposal outlining specific line items, delivery days, milestone schedule, and applicable taxes. You can negotiate or accept the quotation directly inside your client dashboard.',
    },
    {
      q: 'Do you charge GST on all projects?',
      a: 'GST is calculated strictly based on legal registration and applicable Indian tax thresholds. Our billing system is fully GST-aware, issuing appropriate tax invoices with CGST/SGST/IGST breakdowns for registered entities, and compliant commercial receipts where applicable.',
    },
    {
      q: 'What is Allhunter and how does it relate to Dracovion Technologies?',
      a: 'Allhunter is our dedicated student-focused platform under Dracovion Technologies. Founded by Gausik Srinivasan in Tamil Nadu, it caters to college engineering and computer science students by providing legitimate software prototype development, architectural guidance, and one-on-one technical mentoring for viva and project evaluations.',
    },
    {
      q: 'Does Allhunter support academic dishonesty or fake thesis papers?',
      a: 'No. We maintain an uncompromising policy against academic dishonesty. We guide students in designing real, working software architectures and conduct thorough technical walkthroughs so that students genuinely understand every line of code, design diagram, and database model.',
    },
    {
      q: 'What technologies and frameworks do you build with?',
      a: 'We specialize in modern TypeScript ecosystems: React 19, Vite, Tailwind CSS on the frontend; Node.js, Express, and Python on the backend; MongoDB Atlas, PostgreSQL, and Redis for persistence; and standard cloud hosting providers (AWS, GCP). We avoid proprietary vendor lock-ins.',
    },
    {
      q: 'Who owns the intellectual property and code once the project is finished?',
      a: 'You do. 100%. Upon completion and payment of the agreed milestones, all bespoke source code, documentation, assets, and deployment keys are transferred to your ownership.',
    },
    {
      q: 'What kind of support is included after the project is deployed?',
      a: 'All projects include a standard 30-day post-launch warranty covering bug fixes, edge case adjustments, and deployment monitoring at no extra cost. Ongoing 24/7 maintenance retainers are also available.',
    },
    {
      q: 'How do payments work for clients in Tamil Nadu and internationally?',
      a: 'We accept bank transfers (NEFT/RTGS/IMPS) and verified UPI across India. International clients can settle accounts through authorized wire transfers. All payment submissions are verified with receipts issued directly in your dashboard.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-[#050609]">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ANSWERS & TRANSPARENT POLICIES</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-300 text-base max-w-xl mx-auto leading-relaxed">
          Everything you need to know about our service engagements, quoting procedure, and student mentoring.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="font-display font-bold text-white text-base sm:text-lg">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#FFBD55] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 text-xs sm:text-sm text-[#9299A6] leading-relaxed border-t border-[#292E38]/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Have Questions CTA */}
      <div className="p-8 rounded-3xl bg-[#11151D] border border-[#D6A94F]/40 text-center space-y-4">
        <h3 className="text-xl font-display font-bold text-white">Have a Unique Requirement?</h3>
        <p className="text-xs sm:text-sm text-[#9299A6] max-w-lg mx-auto">
          Contact our engineering leadership directly for specific architectural inquiries or student project scoping.
        </p>
        <Link
          to="/contact"
          className="btn-gold-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          <span>Ask a Question Directly</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
