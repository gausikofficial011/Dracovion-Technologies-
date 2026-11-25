import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  FolderGit2,
  Package,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  PlusCircle,
  Sparkles,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { DragonEmblem } from '../../components/ui/DragonLogo';

export const ClientProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'projects'>('all');

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [projRes, orderRes] = await Promise.allSettled([
        api.get<{ success: boolean; projects: any[] }>('/projects/client/my'),
        api.get<{ success: boolean; orders: any[] }>('/orders/my'),
      ]);

      if (projRes.status === 'fulfilled') setProjects(projRes.value.projects || []);
      if (orderRes.status === 'fulfilled') setOrders(orderRes.value.orders || []);
    } catch (_) {
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[#FFBD55] text-[10px] font-mono font-bold uppercase">
            Submitted • In Triage
          </span>
        );
      case 'reviewing':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-[#D6A94F]/15 border border-[#D6A94F]/40 text-[#F5D18A] text-[10px] font-mono font-bold uppercase">
            Under Review
          </span>
        );
      case 'quoted':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold uppercase">
            Quoted
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[#52D69A] text-[10px] font-mono font-bold uppercase">
            In Progress
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 text-[10px] font-mono font-bold uppercase">
            Delivered
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[#9299A6] border border-[#292E38] text-[10px] font-mono font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  const totalEngagements = projects.length + orders.length;

  if (isLoading) {
    return (
      <div className="py-24 text-center text-[#9299A6] font-mono text-xs flex items-center justify-center gap-2">
        <DragonEmblem size={20} glow={true} variant="gold" />
        <span>Loading active client engagements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#080A0E] border-[1.5px] border-[#D6A94F]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#52D69A] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-[#FFBD55] uppercase tracking-widest">
              ACTIVE DELIVERABLES &amp; ORDERS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Your Projects &amp; Orders</h1>
          <p className="text-xs sm:text-sm text-[#B7BBC4] max-w-xl">
            Track active engineering milestones, review staging deployments, monitor placed orders, and retrieve production artifacts.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadData()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-[#FFBD55] text-xs font-mono transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/portal/order/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:scale-105 transition-all w-fit cursor-pointer"
            style={{
              background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
            }}
          >
            <PlusCircle className="w-4 h-4 text-[#050609]" />
            <span>Order New Project</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#292E38] pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
              : 'bg-[#080A0E] text-[#9299A6] border border-[#292E38] hover:text-white'
          }`}
        >
          All Engagements ({totalEngagements})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
              : 'bg-[#080A0E] text-[#9299A6] border border-[#292E38] hover:text-white'
          }`}
        >
          Given Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
              : 'bg-[#080A0E] text-[#9299A6] border border-[#292E38] hover:text-white'
          }`}
        >
          Active Sprints ({projects.length})
        </button>
      </div>

      {/* Empty State when zero total */}
      {totalEngagements === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-[#080A0E] border border-[#292E38] text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30 flex items-center justify-center mx-auto text-[#FFBD55]">
            <FolderGit2 className="w-8 h-8 text-[#FFBD55]" />
          </div>
          <h3 className="text-lg font-bold font-display text-white">No Engagements or Orders Yet</h3>
          <p className="text-xs text-[#9299A6] max-w-md mx-auto leading-relaxed">
            Ready to build a bespoke website, mobile app, enterprise SaaS, or AI model? Place an order request to initialize your engineering sprint.
          </p>
          <div className="pt-2">
            <Link
              to="/portal/order/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase text-[#050609] shadow-lg hover:scale-105 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            >
              <PlusCircle className="w-4 h-4 text-[#050609]" />
              <span>Start Your First Project Order</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Given Orders */}
          {(activeTab === 'all' || activeTab === 'orders') && orders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#FFBD55]" />
                  <h2 className="text-base font-bold font-display text-white">
                    Given Project Orders ({orders.length})
                  </h2>
                </div>
                <Link
                  to="/portal/orders"
                  className="text-xs text-[#FFBD55] hover:underline font-mono"
                >
                  View Full Orders Hub →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map(order => (
                  <div
                    key={order._id}
                    className="p-6 sm:p-7 rounded-3xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/60 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#FFBD55] bg-[#11151D] px-2.5 py-1 rounded-lg border border-[#292E38]">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] font-mono text-[#9299A6] uppercase">
                            {order.serviceCategory?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {getOrderStatusBadge(order.status)}
                      </div>

                      <h3 className="text-base font-bold text-white font-display group-hover:text-[#F5D18A] transition-colors">
                        {order.projectTitle}
                      </h3>
                      <p className="text-xs text-[#9299A6] line-clamp-2 mt-1 leading-relaxed">
                        {order.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#292E38] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#9299A6]">
                        <span>Budget: <strong className="text-white">{order.estimatedBudget || 'Flexible'}</strong></span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to={`/portal/messages?order=${order._id}`}
                          className="text-xs text-[#9299A6] hover:text-[#FFBD55] font-mono"
                        >
                          Chat
                        </Link>
                        <Link
                          to={`/portal/order/${order._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#050609] shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                          style={{
                            background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                          }}
                        >
                          <span>Track Milestones</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#050609]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Active Sprints */}
          {(activeTab === 'all' || activeTab === 'projects') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#D6A94F]" />
                <h2 className="text-base font-bold font-display text-white">
                  Active Engineering Sprints ({projects.length})
                </h2>
              </div>

              {projects.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#080A0E] border border-[#292E38] text-center text-xs text-[#9299A6]">
                  No formal sprint workspaces initialized yet. When your order quote is accepted, it promotes automatically to an active engineering sprint here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map(project => {
                    const completedCount = project.milestones ? project.milestones.filter((m: any) => m.status === 'completed').length : 0;
                    const totalMilestones = project.milestones ? project.milestones.length : 0;

                    return (
                      <div
                        key={project._id}
                        className="p-6 sm:p-7 rounded-3xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all flex flex-col justify-between space-y-5 shadow-xl group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono text-[#FFBD55] bg-[#11151D] px-2.5 py-1 rounded-lg border border-[#292E38]">
                              {project.projectCode || 'DRV-PROJ'}
                            </span>
                            <StatusBadge status={project.status} />
                          </div>

                          <h3 className="text-lg font-bold font-display text-white mb-1.5 group-hover:text-[#FFBD55] transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-xs text-[#9299A6] line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-[#292E38]">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-1.5">
                              <span>SPRINT PROGRESS</span>
                              <span className="text-[#FFBD55] font-bold">{project.progressPercent || 0}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#15191F] border border-[#292E38] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${project.progressPercent || 0}%`,
                                  background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#9299A6] font-mono">
                            <span>Milestones: {completedCount} / {totalMilestones}</span>
                            <span>Deliverables: {project.deliverables?.length || 0}</span>
                          </div>

                          <Link
                            to={`/portal/projects/${project._id}`}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] hover:bg-[#15191F] transition-all cursor-pointer"
                          >
                            <span>Open Project Control Workspace</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#FFBD55]" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
