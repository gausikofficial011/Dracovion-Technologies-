import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Handshake, ArrowRight, FolderGit2, MessageSquare } from 'lucide-react';
import { DragonEmblem } from '../../components/ui/DragonLogo';
import { Link } from 'react-router-dom';

export const PartnerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projectsCount, setProjectsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    Promise.allSettled([
      api.get<{ success: boolean; projects: any[] }>('/projects/client/my'),
      api.get<{ success: boolean; orders: any[] }>('/orders/my'),
    ]).then(([projRes, orderRes]) => {
      if (projRes.status === 'fulfilled') setProjectsCount((projRes.value.projects || []).length);
      if (orderRes.status === 'fulfilled') setOrdersCount((orderRes.value.orders || []).length);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-10 bg-[#050609]">
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#11151D] via-[#161B26] to-[#11151D] border border-[#D6A94F]/40 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#050609] border border-[#D6A94F]/40 text-xs font-mono text-[#FFBD55]">
            <Handshake className="w-4 h-4 text-[#FFBD55]" />
            <span>GLOBAL PARTNER ALLIANCE</span>
          </div>
          <DragonEmblem size={36} glow={true} variant="gold" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-vanguard font-bold text-white relative z-10">
          Strategic Partner Command
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed relative z-10">
          Welcome, {user?.fullName}. Collaborate directly on co-engineered enterprise systems, submit client project scopes, and coordinate with Dracovion leadership.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2">
          <div className="text-xs font-mono text-[#FFBD55] uppercase">Your Submitted Orders</div>
          <div className="text-3xl font-cyber font-bold text-white">{ordersCount}</div>
          <div className="text-xs text-[#9299A6]">Live partner orders tracked in portal</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2">
          <div className="text-xs font-mono text-[#78BFFF] uppercase">Active Engagements</div>
          <div className="text-3xl font-cyber font-bold text-[#78BFFF]">{projectsCount}</div>
          <div className="text-xs text-[#9299A6]">Co-engineered client projects</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2">
          <div className="text-xs font-mono text-emerald-400 uppercase">Account Status</div>
          <div className="text-2xl font-display font-bold text-emerald-400 uppercase">
            {user?.status || 'Active'}
          </div>
          <div className="text-xs text-[#9299A6]">{user?.companyName || 'Registered Partner'}</div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] space-y-4">
        <h3 className="text-xl font-display font-bold text-white">Initiate a Partner Engagement or Referral</h3>
        <p className="text-xs sm:text-sm text-[#9299A6] leading-relaxed">
          Submit a new enterprise project order or message our engineering leadership directly to formalize partnership terms and technical scope.
        </p>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link to="/portal/order/new" className="btn-gold-primary px-6 py-3 rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2">
            <FolderGit2 className="w-4 h-4" />
            <span>Create Project Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/portal/messages" className="btn-gold-outline px-6 py-3 rounded-xl text-xs font-semibold uppercase inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Message Leadership</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
