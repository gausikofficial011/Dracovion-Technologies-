import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../api/client';
import { FounderPortrait } from '../../components/ui/FounderPortrait';
import {
  Sparkles,
  Send,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Shield,
  Loader2,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'web-development',
    budget: '',
    timeline: '',
    description: '',
    privacyConsent: true,
    honeypot: '', // spam prevention bot trap
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const budgetOptions = [
    'Under ₹25,000',
    '₹25,000 - ₹50,000',
    '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹3,00,000',
    '₹3,00,000+ (Enterprise)',
    'Subsidized Student Mini/Major Project',
  ];

  const serviceOptions = [
    { label: 'Web Development', value: 'web-development' },
    { label: 'Mobile App Development', value: 'mobile-development' },
    { label: 'AI & Machine Learning', value: 'ai-ml' },
    { label: 'Software Development', value: 'software-development' },
    { label: 'UI/UX Design', value: 'ui-ux-design' },
    { label: 'Cloud Solutions', value: 'cloud-solutions' },
    { label: 'Database Management', value: 'database-management' },
    { label: 'IT Consulting & Automation', value: 'it-consulting' },
    { label: 'Allhunter Student Mentoring & Project', value: 'allhunter-student-project' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Spam honeypot trap check
    if (formData.honeypot) {
      setSuccessMessage('Thank you for reaching out!');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.description.trim()) {
      setErrorMessage('Please fill in your name, email, and project description.');
      return;
    }

    if (!formData.budget.trim()) {
      setErrorMessage('Please specify your needed amount / budget in typing.');
      return;
    }

    if (!formData.timeline.trim()) {
      setErrorMessage('Please specify your needed days / timeline in typing.');
      return;
    }

    if (!formData.privacyConsent) {
      setErrorMessage('Please accept the privacy policy to submit your inquiry.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        serviceCategory: formData.service,
        projectTitle: formData.company.trim()
          ? `${formData.company.trim()} — ${formData.service} Inquiry`
          : `${formData.service} Engagement Request`,
        requirementsDescription: formData.company.trim()
          ? `[Company: ${formData.company.trim()}] ${formData.description.trim()}`
          : formData.description.trim(),
        preferredDeadline: formData.timeline,
        budgetRange: formData.budget,
        pricingPreference: 'negotiable' as const,
        privacyConsent: true,
      };

      const res = await api.post<{ success: boolean; message: string }>('/enquiries', payload);

      if (res.success) {
        setSuccessMessage(
          res.message || 'Thank you! Your inquiry has been received. Our engineering team will review it within 24 hours.'
        );
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: 'web-development',
          budget: '',
          timeline: '',
          description: '',
          privacyConsent: true,
          honeypot: '',
        });
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to submit inquiry. Please verify your connection or email dracoviontechnology@gmail.com directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-24 bg-[#050609] border-t border-[#292E38]" aria-label="Contact Section">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[radial-gradient(circle,rgba(214,169,79,0.08)_0%,transparent_70%)] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Info & Trust Callout */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DIRECT FOUNDER ENGAGEMENT</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight leading-tight">
                LET'S BUILD <br />
                <span className="text-gold-shimmer">SOMETHING</span> <br />
                <span className="text-cyber-gradient">EXTRAORDINARY.</span>
              </h2>

              <p className="mt-6 text-base text-[#9299A6] leading-relaxed">
                Whether you require a full-stack corporate web application, high-throughput backend APIs, or student software mentoring via Allhunter, we are ready to discuss your requirements.
              </p>

              {/* Direct Info Cards */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#11151D] border border-[#D6A94F]/35">
                  <FounderPortrait variant="avatar" size="md" />
                  <div>
                    <div className="text-xs text-[#FFBD55] uppercase font-mono tracking-wider">Founder & Principal Architect</div>
                    <div className="text-sm font-display font-bold text-white">
                      Gausik Srinivasan
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
                  <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#292E38] flex items-center justify-center text-[#FFBD55]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#9299A6] uppercase font-mono tracking-wider">Direct Email</div>
                    <a href="mailto:dracoviontechnology@gmail.com" className="text-sm font-semibold text-white hover:text-[#FFBD55] transition-colors font-mono">
                      dracoviontechnology@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
                  <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#292E38] flex items-center justify-center text-[#78BFFF]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#9299A6] uppercase font-mono tracking-wider">Operational HQ</div>
                    <div className="text-sm font-semibold text-white">
                      Tamil Nadu, India • Global Scalability
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
                  <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#292E38] flex items-center justify-center text-emerald-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#9299A6] uppercase font-mono tracking-wider">Response Velocity</div>
                    <div className="text-sm font-semibold text-white">
                      Under 24 business hours guaranteed
                    </div>
                  </div>
                </div>

                <a
                  href="https://github.com/dracovion-technology"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#292E38] group-hover:border-[#FFBD55]/40 flex items-center justify-center text-slate-300 group-hover:text-[#FFBD55] transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-[#9299A6] uppercase font-mono tracking-wider">Official GitHub</div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#FFBD55] transition-colors font-mono">
                      github.com/dracovion-technology
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/dracovion_technologies?hvrq=MWxuaXdtZ2tsYjdhNQ=="
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#050609] border border-[#292E38] group-hover:border-[#FFBD55]/40 flex items-center justify-center text-slate-300 group-hover:text-[#FFBD55] transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-[#9299A6] uppercase font-mono tracking-wider">Official Instagram</div>
                    <div className="text-sm font-semibold text-white group-hover:text-[#FFBD55] transition-colors font-mono">
                      @dracovion_technologies
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#292E38] flex items-center gap-3 text-xs font-mono text-[#9299A6]">
              <Shield className="w-4 h-4 text-[#D6A94F]" />
              <span>STRICT NDA & ZERO-LEAKAGE PRIVACY PROTOCOLS</span>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#11151D] border border-[#292E38] shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
                Initiate Project Discussion
              </h3>
              <p className="text-xs text-[#9299A6] mb-8">
                Provide your requirements below. We will provide architecture recommendations and a preliminary estimate.
              </p>

              {/* Honeypot field (hidden from genuine users) */}
              <input
                type="text"
                name="user_organization_verification"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {successMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed">{successMessage}</div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senthil Nathan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0D13] border border-[#292E38] focus:border-[#FFBD55] text-white text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. senthil@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0D13] border border-[#292E38] focus:border-[#FFBD55] text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0D13] border border-[#292E38] focus:border-[#FFBD55] text-white text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                      Company / College / Entity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Ltd / University"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0D13] border border-[#292E38] focus:border-[#FFBD55] text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Service */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                      Service *
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#0A0D13] border border-[#292E38] focus:border-[#FFBD55] text-white text-xs outline-none transition-colors"
                    >
                      {serviceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Needed Amount / Budget */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Needed Amount (₹) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹35,000 or 50,000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0D13] border border-[#292E38] focus:border-[#FFBD55] text-white text-xs outline-none transition-colors placeholder:text-slate-500 font-mono"
                    />
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-mono">Quick:</span>
                      {['₹25k', '₹50k', '₹1L', '₹2.5L+', 'Flexible'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setFormData({ ...formData, budget: chip })}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                            formData.budget === chip
                              ? 'bg-[#D6A94F]/20 text-[#FFBD55] border-[#D6A94F]'
                              : 'bg-[#11151D] text-slate-400 border-[#292E38] hover:text-white hover:border-[#D6A94F]/50'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Needed Days / Timeline */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Days To Complete *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15 Days, 30 Days"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0D13] border border-[#292E38] focus:border-[#FFBD55] text-white text-xs outline-none transition-colors placeholder:text-slate-500 font-mono"
                    />
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-mono">Quick:</span>
                      {['7 Days', '15 Days', '30 Days', '60 Days', 'Flexible'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setFormData({ ...formData, timeline: chip })}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                            formData.timeline === chip
                              ? 'bg-[#D6A94F]/20 text-[#FFBD55] border-[#D6A94F]'
                              : 'bg-[#11151D] text-slate-400 border-[#292E38] hover:text-white hover:border-[#D6A94F]/50'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                    Project Requirements Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your functional goals, target platforms, integration requirements, or student academic viva objectives..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0D13] border border-[#292E38] focus:border-[#FFBD55] text-white text-sm outline-none transition-colors resize-none"
                  />
                </div>

                {/* Privacy Consent Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#0A0D13] border border-[#292E38] text-[#FFBD55] focus:ring-0"
                  />
                  <label htmlFor="privacyConsent" className="text-xs text-[#9299A6] cursor-pointer">
                    I agree to the secure processing of my details under Dracovion's Privacy Policy.
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold-primary w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT PROJECT REQUIREMENTS</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

