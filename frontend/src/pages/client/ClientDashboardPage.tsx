import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DragonEmblem } from '../../components/ui/DragonLogo';
import { isOrderCompletedAndPaid, isProjectCompletedAndPaid } from '../../utils/orderGovernance';
import {
  FolderGit2,
  FileCheck,
  Receipt,
  ArrowRight,
  Clock,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  Layers,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      api.get<{ success: boolean; projects: any[] }>('/projects/client/my'),
      api.get<{ success: boolean; quotations: any[] }>('/quotations/client/my'),
      api.get<{ success: boolean; orders: any[] }>('/orders/my'),
    ])
      .then(([projRes, quoteRes, orderRes]) => {
        if (projRes.status === 'fulfilled') setProjects(projRes.value.projects || []);
        if (quoteRes.status === 'fulfilled') setQuotations(quoteRes.value.quotations || []);
        if (orderRes.status === 'fulfilled') setOrders(orderRes.value.orders || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const pendingQuotations = quotations.filter((q) => q.status === 'sent' || q.status === 'negotiating');
  const deliveredOrders = orders.filter(isOrderCompletedAndPaid);
  const deliveredProjects = projects.filter(isProjectCompletedAndPaid);
  const totalDeliveredCount = deliveredOrders.length + deliveredProjects.length;
  const activeProjects = projects.filter(
    (p) => !['cancelled', 'rejected'].includes(p.status) && !isProjectCompletedAndPaid(p)
  );
  const activeOrders = orders.filter(
    (o) => o.status !== 'cancelled' && !isOrderCompletedAndPaid(o)
  );

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[#FFBD55] text-[10px] font-mono font-bold uppercase">Submitted</span>;
      case 'reviewing':
        return <span className="px-2.5 py-1 rounded-full bg-[#D6A94F]/15 border border-[#D6A94F]/40 text-[#F5D18A] text-[10px] font-mono font-bold uppercase">In Review</span>;
      case 'quoted':
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold uppercase">Quoted</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[#52D69A] text-[10px] font-mono font-bold uppercase">In Progress</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 text-[10px] font-mono font-bold uppercase">Delivered</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-700/40 border border-slate-600 text-slate-300 text-[10px] font-mono font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner - Cinematic Obsidian & Antique Gold */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#11151D] via-[#0A0D13] to-[#050609] border-[1.5px] border-[#D6A94F]/40 shadow-[0_0_35px_rgba(214,169,79,0.18)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Ambient Gold Glow Aura */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#D6A94F]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#52D69A] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#FFBD55] uppercase tracking-widest">
              WELCOME BACK • CLIENT COMMAND PORTAL
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight flex items-center gap-3">
            <span>{user?.fullName || 'Valued Client'}</span>
            <DragonEmblem size={28} glow={true} variant="gold" />
          </h1>

          <p className="text-xs sm:text-sm text-[#B7BBC4] max-w-xl">
            {user?.companyName
              ? `Enterprise engagement with ${user.companyName}`
              : 'Direct technology partnership with Dracovion Technologies.'}
            {' '}Manage custom software, track active sprints, and review milestone deliverables.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/portal/order/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_25px_rgba(214,169,79,0.4)] hover:shadow-[0_0_35px_rgba(255,189,85,0.6)] hover:scale-[1.02] transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 50%, #F5D18A 100%)',
            }}
          >
            <PlusCircle className="w-4 h-4 text-[#050609]" />
            <span>Order New Project</span>
          </Link>

          <Link
            to="/start-project"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0A0D13]/80 hover:bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all"
          >
            <span>Custom Scope</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D6A94F]" />
          </Link>
        </div>
      </div>

      {/* Metric Cards - Premium Obsidian & Gold Facets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors shadow-lg group">
          <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-2">
            <span className="uppercase tracking-wider">ACTIVE ORDERS</span>
            <div className="w-8 h-8 rounded-lg bg-[#11151D] border border-[#292E38] group-hover:border-[#FFBD55]/40 flex items-center justify-center text-[#FFBD55] transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {activeOrders.length + activeProjects.length}
          </div>
          <div className="text-[11px] text-[#9299A6] mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52D69A]" />
            <span>In engineering, review, or sprint</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors shadow-lg group">
          <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-2">
            <span className="uppercase tracking-wider">ACTIONABLE QUOTES</span>
            <div className="w-8 h-8 rounded-lg bg-[#11151D] border border-[#292E38] group-hover:border-[#D6A94F]/40 flex items-center justify-center text-[#D6A94F] transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#FFBD55] to-[#F5D18A]">
            {pendingQuotations.length}
          </div>
          <div className="text-[11px] text-[#9299A6] mt-1">Awaiting review or negotiation</div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors shadow-lg group">
          <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-2">
            <span className="uppercase tracking-wider">TOTAL DELIVERED</span>
            <div className="w-8 h-8 rounded-lg bg-[#11151D] border border-[#292E38] group-hover:border-emerald-600/40 flex items-center justify-center text-emerald-400 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {totalDeliveredCount}
          </div>
          <div className="text-[11px] text-[#9299A6] mt-1">Completed &amp; payment verified</div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors shadow-lg group">
          <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-2">
            <span className="uppercase tracking-wider">DELIVERABLES VAULT</span>
            <div className="w-8 h-8 rounded-lg bg-[#11151D] border border-[#292E38] group-hover:border-[#78BFFF]/40 flex items-center justify-center text-[#78BFFF] transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {deliveredProjects.reduce((acc, p) => acc + (p.deliverables ? p.deliverables.length : 0), 0) +
              deliveredOrders.reduce((acc, o) => acc + (o.deliverables ? o.deliverables.length : 0), 0)}
          </div>
          <div className="text-[11px] text-[#9299A6] mt-1">Available production artifacts</div>
        </div>
      </div>

      {/* Active Project Orders Section (Websites, Apps, Software, AI) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFBD55]" />
            <h3 className="text-lg font-bold font-display text-white tracking-wide">
              Active Project Orders & Solutions
            </h3>
          </div>
          <Link
            to="/portal/order/new"
            className="text-xs text-[#FFBD55] hover:text-[#F5D18A] flex items-center gap-1 font-mono font-medium transition-colors"
          >
            <span>+ New Order Request</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-[#080A0E] border border-[#292E38] text-center space-y-4 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30 flex items-center justify-center text-[#FFBD55] mx-auto shadow-[0_0_20px_rgba(214,169,79,0.15)]">
              <DragonEmblem size={32} glow={true} variant="gold" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold font-display text-white">No Project Orders Initialized Yet</h4>
              <p className="text-xs text-[#9299A6] max-w-md mx-auto leading-relaxed">
                Choose a bespoke website, custom mobile app, enterprise SaaS, or AI model.
                Your dedicated project lead will triage and prepare an executive quote within 24 hours.
              </p>
            </div>
            <Link
              to="/portal/order/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-lg hover:scale-105 transition-all"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            >
              <PlusCircle className="w-4 h-4 text-[#050609]" />
              <span>Place Your First Project Order</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="p-6 rounded-3xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/60 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-[#FFBD55] font-bold tracking-wider">
                      {order.orderNumber}
                    </span>
                    {getOrderStatusBadge(order.status)}
                  </div>
                  <h4 className="text-base font-bold text-white font-display group-hover:text-[#F5D18A] transition-colors">
                    {order.projectTitle}
                  </h4>
                  <p className="text-xs text-[#9299A6] line-clamp-2 mt-1 leading-relaxed">
                    {order.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#292E38] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#9299A6]">
                    <span className="capitalize">{order.serviceCategory.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span className="text-[#FFBD55]">{order.estimatedBudget || 'Flexible'}</span>
                  </div>

                  <Link
                    to={`/portal/order/${order._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFBD55] hover:text-[#F5D18A] group-hover:translate-x-1 transition-all"
                  >
                    <span>Track Milestones</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actionable Pending Quotations Alert */}
      {pendingQuotations.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#080A0E] border border-[#D6A94F]/50 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#FFBD55]" />
              <span>Pending Quotation Awaiting Your Review</span>
            </h3>
            <Link to="/client/quotations" className="text-xs text-[#FFBD55] hover:underline font-mono">
              View All Proposals →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQuotations.map((quote) => (
              <div
                key={quote._id}
                className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-mono text-[#9299A6]">{quote.quotationNumber}</div>
                  <div className="text-sm font-bold text-white">{quote.title}</div>
                  <div className="text-xs text-[#FFBD55] font-mono mt-0.5">
                    ₹{(quote.totalMinor / 100).toLocaleString('en-IN')} (Incl. Tax)
                  </div>
                </div>
                <Link
                  to="/client/quotations"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#050609] bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] hover:opacity-95"
                >
                  Review Proposal
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
