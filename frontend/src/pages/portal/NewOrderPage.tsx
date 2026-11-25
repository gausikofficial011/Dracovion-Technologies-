import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getMissingPersonalDetails } from '../../utils/orderGovernance';
import { UserCheck, Phone as GovPhoneIcon, MapPin as GovMapPinIcon, Lock as GovLockIcon } from 'lucide-react';
import {
  Globe,
  Smartphone,
  Cpu,
  Layers,
  Palette,
  Wrench,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Calendar,
  IndianRupee,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  {
    id: 'website_development',
    title: 'Custom Website Development',
    desc: 'High-performance bespoke corporate sites, marketing pages, and portfolios.',
    icon: Globe,
    badge: 'Popular',
  },
  {
    id: 'fullstack_web_app',
    title: 'Enterprise Software & Web App',
    desc: 'Scalable cloud software, ERP, CRM, microservices, and management portals.',
    icon: Layers,
    badge: 'Enterprise',
  },
  {
    id: 'portfolio_and_landing',
    title: 'Mobile App Development',
    desc: 'Native iOS & Android, Flutter, and cross-platform mobile solutions.',
    icon: Smartphone,
    badge: 'iOS & Android',
  },
  {
    id: 'ai_and_ml_solutions',
    title: 'AI & Machine Learning',
    desc: 'Neural architectures, predictive analytics, LLM integrations, and automation bots.',
    icon: Cpu,
    badge: 'Next-Gen',
  },
  {
    id: 'ui_ux_design',
    title: 'UI/UX Design & Architecture',
    desc: 'Cinematic design systems, wireframing, high-fidelity Figma prototypes.',
    icon: Palette,
    badge: 'Design',
  },
  {
    id: 'maintenance_and_support',
    title: 'Maintenance & Cloud Support',
    desc: '24/7 SLA monitoring, zero-downtime database optimization, security patching.',
    icon: Wrench,
    badge: 'Support',
  },
];

const BUDGET_RANGES = [
  '₹25,000 - ₹50,000 (Starter / MVP)',
  '₹50,000 - ₹1,00,000 (Professional)',
  '₹1,00,000 - ₹2,50,000 (Enterprise Solution)',
  '₹2,50,000 - ₹5,00,000+ (Flagship Platform)',
  'To Be Estimated / Flexible',
];

export const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [preferredDeadline, setPreferredDeadline] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  // Personal details required before project allocation & payment unlocking
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [stateRegion, setStateRegion] = useState(user?.state || '');
  const [workAddress, setWorkAddress] = useState(user?.workAddress || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');

  useEffect(() => {
    if (!user) return;
    setFullName((prev) => prev || user.fullName || '');
    setPhone((prev) => prev || user.phone || '');
    setCity((prev) => prev || user.city || '');
    setStateRegion((prev) => prev || user.state || '');
    setWorkAddress((prev) => prev || user.workAddress || '');
    setCompanyName((prev) => prev || user.companyName || '');
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const missingDetails = getMissingPersonalDetails({
      fullName: fullName.trim(),
      phone: phone.trim(),
      city: city.trim(),
    });
    if (missingDetails.length > 0) {
      setErrorMessage(
        `Complete personal details are required before your project can be allocated: please provide ${missingDetails.join(', ')}.`
      );
      return;
    }

    if (!projectTitle.trim()) {
      setErrorMessage('Please give your project a descriptive title.');
      return;
    }
    if (description.trim().length < 15) {
      setErrorMessage('Please provide a brief description of your requirements (at least 15 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; message: string; order: any }>('/orders', {
        serviceCategory: selectedCategory,
        projectTitle: projectTitle.trim(),
        description: description.trim(),
        estimatedBudget,
        preferredDeadline,
        priority,
        personalDetails: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          state: stateRegion.trim() || undefined,
          workAddress: workAddress.trim() || undefined,
          companyName: companyName.trim() || undefined,
        },
      });

      await refreshUser();
      setCreatedOrder(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050609] text-white relative selection:bg-[#D6A94F]/30 selection:text-[#F5D18A]">
      {/* Background Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(214,169,79,0.1)_0%,transparent_65%)] blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full px-6 sm:px-10 py-5 flex items-center justify-between border-b border-[#292E38]/40 bg-[#050609]/80 backdrop-blur-md">
        <Link
          to="/portal/dashboard"
          className="group inline-flex items-center gap-2 text-xs font-mono text-[#9299A6] hover:text-[#FFBD55] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#D6A94F]" />
          <span>BACK TO CLIENT DASHBOARD</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151D] border border-[#292E38] text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DIRECT DISPATCH TO ENGINEERING</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Success Modal / State */}
        <AnimatePresence>
          {createdOrder ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 sm:p-12 rounded-3xl bg-[#080A0E] border-[1.5px] border-[#D6A94F] shadow-[0_0_60px_rgba(214,169,79,0.4)] text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D6A94F]/20 via-[#FFBD55]/30 to-transparent border border-[#FFBD55] flex items-center justify-center mx-auto text-[#FFBD55]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase">
                  ORDER RECEIVED &amp; QUEUED
                </span>
                <h1 className="text-3xl font-extrabold font-display text-white">
                  Project Order #{createdOrder.orderNumber}
                </h1>
                <p className="text-sm text-[#B7BBC4] max-w-lg mx-auto leading-relaxed">
                  Your project order for <strong className="text-white">"{createdOrder.projectTitle}"</strong> has
                  been dispatched to our leadership and engineering teams.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#292E38]/80 pb-2">
                  <span className="text-[#9299A6]">Category:</span>
                  <span className="text-white font-medium capitalize">{createdOrder.serviceCategory.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between border-b border-[#292E38]/80 pb-2">
                  <span className="text-[#9299A6]">Budget:</span>
                  <span className="text-[#FFBD55] font-mono">{createdOrder.estimatedBudget || 'Not specified'}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-[#9299A6]">Initial Status:</span>
                  <span className="text-emerald-400 font-mono uppercase font-bold">{createdOrder.status}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/portal/order/${createdOrder.orderNumber}`}
                  className="px-6 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#080A0E] flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 50%, #D6A94F 100%)',
                  }}
                >
                  <span>Track Order Live</span>
                  <ArrowRight className="w-4 h-4 text-[#080A0E]" />
                </Link>
                <Link
                  to="/portal/dashboard"
                  className="px-6 py-3.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#11151D] border border-[#292E38] hover:text-white"
                >
                  Return to Dashboard
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Header Title */}
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#D6A94F] uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-[#FFBD55]" />
                  <span>CLIENT PROJECT INITIATION</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                  Place a New <span className="text-[#FFBD55]">Project Order</span>
                </h1>
                <p className="text-sm text-[#9299A6] mt-1">
                  Select your technology category and outline your requirements. Our CEO, Owner, and Lead Engineers will review and claim your project.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Order Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* STEP 1: Select Service Category */}
                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#F5D18A]">
                    Step 1: Choose Solution Category *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-b from-[#11151D] to-[#0A0D13] border-[#FFBD55] shadow-[0_0_20px_rgba(214,169,79,0.25)]'
                              : 'bg-[#080A0E] border-[#292E38] hover:border-[#D6A94F]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-[#FFBD55] text-[#080A0E]' : 'bg-[#15191F] text-[#D6A94F]'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#15191F] text-[#9299A6] border border-[#292E38]">
                              {cat.badge}
                            </span>
                          </div>

                          <div className="text-sm font-bold text-white font-display mb-1">{cat.title}</div>
                          <div className="text-[11px] text-[#9299A6] leading-relaxed">{cat.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 2: Project Scope & Specifications */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] space-y-5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#F5D18A]">
                    Step 2: Project Specifications *
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Next-Gen Real Estate Telemetry Portal"
                      className="w-full px-4 py-3 rounded-xl bg-[#15191F] border border-[#353941] text-white text-sm focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Requirements &amp; Scope Description *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you want to build: key features, user roles, integrations, desired design style, and target audience..."
                      className="w-full p-4 rounded-xl bg-[#15191F] border border-[#353941] text-white text-sm focus:border-[#FFBD55] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-[#FFBD55]" />
                          <span>Needed Amount / Budget (₹) *</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹35,000 or 50,000"
                        value={estimatedBudget}
                        onChange={(e) => setEstimatedBudget(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none placeholder:text-slate-500 font-mono"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-500 font-mono">Quick:</span>
                        {['₹25k', '₹50k', '₹1L', '₹2.5L+', 'Flexible'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setEstimatedBudget(chip)}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                              estimatedBudget === chip
                                ? 'bg-[#D6A94F]/20 text-[#FFBD55] border-[#D6A94F]'
                                : 'bg-[#080A0E] text-slate-400 border-[#292E38] hover:text-white hover:border-[#D6A94F]/50'
                            }`}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#78BFFF]" />
                          <span>Days To Complete *</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15 Days, 30 Days"
                        value={preferredDeadline}
                        onChange={(e) => setPreferredDeadline(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none placeholder:text-slate-500 font-mono"
                      />
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-500 font-mono">Quick:</span>
                        {['7 Days', '15 Days', '30 Days', '60 Days', 'Flexible'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setPreferredDeadline(chip)}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                              preferredDeadline === chip
                                ? 'bg-[#D6A94F]/20 text-[#FFBD55] border-[#D6A94F]'
                                : 'bg-[#080A0E] text-slate-400 border-[#292E38] hover:text-white hover:border-[#D6A94F]/50'
                            }`}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D6A94F]" />
                        <span>Project Priority</span>
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none cursor-pointer"
                      >
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent Priority</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 3: Client Personal Details Verification */}
                <div className="rounded-2xl bg-[#0D1017] border border-[#292E38] p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#222732] pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#52D69A]/15 border border-[#52D69A]/30 flex items-center justify-center text-[#52D69A]">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white font-display">
                          3. Client Personal Details Verification
                        </h3>
                        <p className="text-[11px] font-mono text-[#9299A6]">
                          Projects are allocated only when verified personal contact details are on file.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFBD55]/10 border border-[#FFBD55]/30 text-[10px] font-mono text-[#FFBD55] uppercase tracking-wider self-start sm:self-auto">
                      <GovLockIcon className="w-3 h-3" />
                      Required for Allocation
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#9299A6] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full legal name"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-sm text-white placeholder-[#5B6475] focus:outline-none focus:border-[#FFBD55]/60"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#9299A6] mb-1.5">
                        <span className="inline-flex items-center gap-1">
                          <GovPhoneIcon className="w-3 h-3 text-[#78BFFF]" />
                          Valid Phone Number *
                        </span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-sm text-white placeholder-[#5B6475] focus:outline-none focus:border-[#FFBD55]/60"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#9299A6] mb-1.5">
                        <span className="inline-flex items-center gap-1">
                          <GovMapPinIcon className="w-3 h-3 text-[#52D69A]" />
                          City / Location *
                        </span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., Chennai, Bengaluru"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-sm text-white placeholder-[#5B6475] focus:outline-none focus:border-[#FFBD55]/60"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#9299A6] mb-1.5">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={stateRegion}
                        onChange={(e) => setStateRegion(e.target.value)}
                        placeholder="e.g., Tamil Nadu"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-sm text-white placeholder-[#5B6475] focus:outline-none focus:border-[#FFBD55]/60"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#9299A6] mb-1.5">
                        Organization / Institution
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company, college, or team (optional)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-sm text-white placeholder-[#5B6475] focus:outline-none focus:border-[#FFBD55]/60"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#9299A6] mb-1.5">
                        Communication Address
                      </label>
                      <input
                        type="text"
                        value={workAddress}
                        onChange={(e) => setWorkAddress(e.target.value)}
                        placeholder="Street / campus / office address (optional)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-sm text-white placeholder-[#5B6475] focus:outline-none focus:border-[#FFBD55]/60"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#11151D] border border-[#222732] text-[11px] font-mono text-[#A6AEBC] leading-relaxed">
                    <span className="text-[#FFBD55] font-bold">Payment Governance:</span> Submitting this brief does not request payment upfront. Once an engineer verifies your personal details and claims your project, you can chat directly with them inside your Order Portal. You will be allowed to pay directly <span className="text-white">only after</span> the assigned employee explicitly shares their payment details with you.
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-display font-bold text-sm uppercase tracking-wider text-[#080A0E] flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_30px_rgba(214,169,79,0.35)] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 50%, #D6A94F 100%)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#080A0E]" />
                      <span>Submitting Order &amp; Alerting Engineering...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Project Order</span>
                      <ArrowRight className="w-4 h-4 text-[#080A0E]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

