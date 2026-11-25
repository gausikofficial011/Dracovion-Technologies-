import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AdminLoadError } from '../../components/admin/AdminLoadError';
import {
  Inbox,
  FolderGit2,
  Users,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadMetrics = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    api
      .get<{ success: boolean; metrics: any; recentEnquiries: any[]; recentProjects: any[] }>(
        '/admin/dashboard-metrics'
      )
      .then((res) => setData(res))
      .catch((err: any) => {
        setErrorMsg(err?.message || 'Unable to load executive dashboard metrics.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#9299A6] font-mono text-sm">
        Aggregating live business metrics...
      </div>
    );
  }

  if (errorMsg || !data || !data.metrics) {
    return (
      <AdminLoadError
        message={errorMsg || 'Dashboard metrics response was empty. Please sign in again.'}
        onRetry={loadMetrics}
      />
    );
  }

  const { metrics, recentEnquiries, recentProjects } = data;

  return (
    <div className="space-y-8 select-none">
      {/* Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
            <span>EXECUTIVE COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Operational Overview
          </h1>
          <p className="text-xs text-[#9299A6] mt-1">
            Real-time pipeline: leads, active client sprints, verified revenue, and financial reconciliation.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/quotations"
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
            }}
          >
            + Create Quotation
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-2">
            <span>INCOMING LEADS</span>
            <Inbox className="w-4 h-4 text-[#FFBD55]" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{metrics.totalEnquiries}</div>
          <div className="text-[11px] text-[#FFBD55] font-mono mt-1">
            {metrics.newEnquiries} pending review
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-2">
            <span>ACTIVE SPRINTS</span>
            <FolderGit2 className="w-4 h-4 text-[#D6A94F]" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{metrics.activeProjects}</div>
          <div className="text-[11px] text-[#9299A6] mt-1">
            {metrics.completedProjects} delivered &amp; completed
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-2">
            <span>DELIVERED PROJECTS</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">
            {metrics.completedProjects || 0}
          </div>
          <div className="text-[11px] text-[#9299A6] mt-1">
            Production release packages completed
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38] shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-[#9299A6] mb-2">
            <span>REGISTERED CLIENTS</span>
            <Users className="w-4 h-4 text-[#F5D18A]" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{metrics.totalClients}</div>
          <div className="text-[11px] text-[#9299A6] mt-1">Active client &amp; student accounts</div>
        </div>
      </div>

      {/* Two Columns: Recent Leads & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enquiries / Leads */}
        <div className="p-6 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#FFBD55]" />
              <span>Recent Inquiries</span>
            </h3>
            <Link to="/admin/leads" className="text-xs text-[#FFBD55] hover:text-[#F5D18A] hover:underline font-mono">
              View All Leads →
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9299A6]">No project leads recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {recentEnquiries.map((lead: any) => (
                <div
                  key={lead._id}
                  className="p-3.5 rounded-2xl bg-[#11151D] border border-[#292E38] flex items-center justify-between gap-3 hover:border-[#D6A94F]/40 transition-colors"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white">{lead.customerName}</span>
                      <span className="text-[10px] font-mono text-[#9299A6]">({lead.email})</span>
                    </div>
                    <div className="text-xs text-[#E7E9EE] truncate">{lead.projectTitle}</div>
                    <div className="text-[11px] font-mono text-[#FFBD55]">
                      Budget: {lead.budgetRange}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <StatusBadge status={lead.status} />
                    <Link
                      to="/admin/leads"
                      className="text-[11px] text-[#FFBD55] hover:underline font-semibold"
                    >
                      Triage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="p-6 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#D6A94F]" />
              <span>Active Projects &amp; Sprints</span>
            </h3>
            <Link to="/admin/projects" className="text-xs text-[#FFBD55] hover:text-[#F5D18A] hover:underline font-mono">
              Manage All Projects →
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9299A6]">No projects currently active.</div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((proj: any) => (
                <div
                  key={proj._id}
                  className="p-3.5 rounded-2xl bg-[#11151D] border border-[#292E38] flex items-center justify-between gap-3 hover:border-[#D6A94F]/40 transition-colors"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-[#FFBD55]">{proj.projectCode}</span>
                      <span className="text-xs font-bold text-white truncate">{proj.title}</span>
                    </div>
                    <div className="text-[11px] text-[#9299A6]">
                      Client: {proj.clientId?.fullName || 'Client'} ({proj.progressPercent}% Complete)
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <StatusBadge status={proj.status} />
                    <Link
                      to="/admin/projects"
                      className="text-[11px] text-[#FFBD55] hover:underline font-semibold"
                    >
                      Control →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
