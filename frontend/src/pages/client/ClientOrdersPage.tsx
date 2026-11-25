import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Package,
  PlusCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  MessageSquare,
  FileCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { DragonEmblem } from '../../components/ui/DragonLogo';

export const ClientOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; orders: any[] }>('/orders/my');
      setOrders(res.orders || []);
    } catch (_) {
      if (!silent) setOrders([]);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[#FFBD55] text-[10px] font-mono font-bold uppercase tracking-wider">
            Submitted • In Triage
          </span>
        );
      case 'reviewing':
        return (
          <span className="px-2.5 py-1 rounded-full bg-[#D6A94F]/15 border border-[#D6A94F]/40 text-[#F5D18A] text-[10px] font-mono font-bold uppercase tracking-wider">
            Under Architectural Review
          </span>
        );
      case 'quoted':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            Quote Prepared
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[#52D69A] text-[10px] font-mono font-bold uppercase tracking-wider">
            Active Engineering Sprint
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            Delivered • Review Pending
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            Completed &amp; Released
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[#9299A6] border border-[#292E38] text-[10px] font-mono font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return !['completed', 'cancelled'].includes(o.status);
    if (statusFilter === 'completed') return o.status === 'completed';
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#080A0E] border-[1.5px] border-[#D6A94F]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#52D69A] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-[#FFBD55] uppercase tracking-widest">
              CLIENT ORDER MANAGEMENT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Your Given Orders</h1>
          <p className="text-xs sm:text-sm text-[#B7BBC4] max-w-xl">
            Track all software, web, mobile, and AI project orders placed with Dracovion Technologies. Review milestones, communicate directly with assigned engineers, and retrieve deliverables.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadOrders()}
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
            <span>+ Order New Project</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#292E38] overflow-x-auto">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'active', label: 'Active & In Progress' },
            { id: 'submitted', label: 'Submitted & In Triage' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
                  : 'bg-[#080A0E] text-[#9299A6] border border-[#292E38] hover:border-[#D6A94F]/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Feed */}
      {isLoading ? (
        <div className="py-24 text-center text-[#9299A6] font-mono text-xs flex items-center justify-center gap-2">
          <DragonEmblem size={24} glow={true} variant="gold" />
          <span>Synchronizing client orders ledger...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-[#080A0E] border border-[#292E38] text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30 flex items-center justify-center mx-auto text-[#FFBD55]">
            <Package className="w-8 h-8 text-[#FFBD55]" />
          </div>
          <h3 className="text-lg font-bold font-display text-white">No Given Orders Found</h3>
          <p className="text-xs text-[#9299A6] max-w-md mx-auto leading-relaxed">
            {statusFilter === 'all'
              ? 'You have not submitted any project orders yet. Place an order to have our engineering leads author a custom architectural specification and quotation.'
              : `No orders matching filter "${statusFilter}".`}
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
              <span>Place Your Project Order</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map(order => (
            <div
              key={order._id}
              className="p-6 sm:p-7 rounded-3xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/60 transition-all flex flex-col justify-between space-y-5 shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
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

                <div>
                  <h3 className="text-base font-bold text-white font-display group-hover:text-[#F5D18A] transition-colors">
                    {order.projectTitle}
                  </h3>
                  <p className="text-xs text-[#9299A6] line-clamp-2 mt-1 leading-relaxed">
                    {order.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                    <span className="text-[#9299A6] block text-[10px] uppercase">Budget Target</span>
                    <span className="text-white font-semibold">{order.estimatedBudget || 'Flexible'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                    <span className="text-[#9299A6] block text-[10px] uppercase">Preferred Deadline</span>
                    <span className="text-white font-semibold">{order.preferredDeadline || 'Open Schedule'}</span>
                  </div>
                </div>

                {order.assignedEmployeeId && (
                  <div className="p-3 rounded-xl bg-[#11151D] border border-[#D6A94F]/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#080A0E] border border-[#D6A94F]/40 flex items-center justify-center font-mono font-bold text-[#FFBD55] text-[10px]">
                        {order.assignedEmployeeId.fullName?.charAt(0)}
                      </div>
                      <span className="text-white font-medium text-[11px]">
                        Lead Engineer: {order.assignedEmployeeId.fullName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#52D69A]">Active Assigned</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#292E38] flex items-center justify-between gap-3">
                <Link
                  to={`/portal/messages?order=${order._id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#9299A6] hover:text-[#FFBD55] font-mono transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Order Discussion</span>
                </Link>

                <Link
                  to={`/portal/order/${order._id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#050609] shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                  }}
                >
                  <span>Track Milestones</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#050609]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

