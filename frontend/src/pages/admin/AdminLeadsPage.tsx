import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AdminLoadError } from '../../components/admin/AdminLoadError';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  User,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
} from 'lucide-react';

export const AdminLeadsPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadLeads = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    api.get<{ success: boolean; enquiries: any[] }>('/enquiries/admin/all', {
      status: statusFilter,
      search: search || undefined,
    })
      .then(res => setEnquiries(res.enquiries || []))
      .catch((err: any) => setErrorMsg(err?.message || 'Unable to load leads & enquiries.'))
      .finally(() => setIsLoading(false));
  }, [statusFilter, search]);

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedLead) return;
    setStatusUpdating(true);
    try {
      const res = await api.patch<{ success: boolean; enquiry: any }>(
        `/enquiries/admin/${selectedLead._id}`,
        { status: newStatus, internalNotes }
      );
      setSelectedLead(res.enquiry);
      loadLeads();
    } catch (err: any) {
      alert(err.message || 'Failed to update enquiry status');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Leads & Enquiries Management</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Triage incoming client requirements, update engagement status, and convert leads into quotations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#080A0E] border border-[#292E38] shadow-lg flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadLeads()}
            placeholder="Search leads by name, email, or title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] text-xs focus:outline-none focus:border-[#D6A94F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'new', 'under_review', 'contacted', 'quoted', 'converted', 'rejected'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap capitalize cursor-pointer ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
                  : 'bg-[#11151D] text-[#9299A6] hover:text-white border border-[#292E38] hover:border-[#D6A94F]/40'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-[#9299A6] font-mono text-sm">Loading enquiry leads...</div>
      ) : errorMsg ? (
        <AdminLoadError message={errorMsg} onRetry={loadLeads} />
      ) : enquiries.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#9299A6] rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl">
          No enquiries matching current filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#292E38] bg-[#080A0E] shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0D13] text-[#F5D18A] font-mono border-b border-[#292E38]">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Service</th>
                <th className="p-4">Project Objective</th>
                <th className="p-4">Needed Amount</th>
                <th className="p-4">Days / Timeline</th>
                <th className="p-4">Submitted</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E38]/80">
              {enquiries.map(lead => (
                <tr key={lead._id} className="hover:bg-[#11151D]/60 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{lead.customerName}</div>
                    <div className="text-[11px] font-mono text-[#9299A6]">{lead.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-[#11151D] text-[10px] font-mono text-[#FFBD55] border border-[#D6A94F]/30">
                      {lead.serviceCategory}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-[#E7E9EE] font-medium">
                    {lead.projectTitle}
                  </td>
                  <td className="p-4 font-mono text-[#FFBD55] font-semibold">{lead.budgetRange}</td>
                  <td className="p-4 font-mono text-[#78BFFF] text-[11px]">{lead.preferredDeadline || 'Flexible'}</td>
                  <td className="p-4 text-[#9299A6] font-mono">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setInternalNotes(lead.internalNotes || '');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#FFBD55] bg-[#11151D] border border-[#D6A94F]/40 hover:border-[#FFBD55] hover:bg-[#161B26] transition-all cursor-pointer"
                    >
                      Triage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Triage Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#292E38]">
              <div>
                <h3 className="text-xl font-bold text-white font-display">{selectedLead.projectTitle}</h3>
                <span className="text-xs font-mono text-[#FFBD55]">Enquiry Lead Triage</span>
              </div>
              <StatusBadge status={selectedLead.status} size="md" />
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                <span className="text-[#9299A6] block text-[10px] uppercase">Name</span>
                <span className="text-white font-bold">{selectedLead.customerName}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                <span className="text-[#9299A6] block text-[10px] uppercase">Email</span>
                <span className="text-white truncate block">{selectedLead.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                <span className="text-[#9299A6] block text-[10px] uppercase">Phone</span>
                <span className="text-white">{selectedLead.phone || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                <span className="text-[#9299A6] block text-[10px] uppercase">Needed Amount</span>
                <span className="text-[#FFBD55] font-bold">{selectedLead.budgetRange}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                <span className="text-[#9299A6] block text-[10px] uppercase">Days / Timeline</span>
                <span className="text-[#78BFFF] font-bold">{selectedLead.preferredDeadline || 'Flexible'}</span>
              </div>
            </div>

            {/* Scope Details */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#9299A6] uppercase block">Requirements Description</span>
              <p className="text-xs text-[#E7E9EE] p-4 rounded-xl bg-[#11151D] border border-[#292E38] leading-relaxed whitespace-pre-wrap">
                {selectedLead.requirementsDescription}
              </p>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#9299A6] uppercase block">Internal Admin Notes</span>
              <textarea
                rows={3}
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                placeholder="Add confidential notes, feasibility estimates, or phone call summaries..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#D6A94F]"
              />
            </div>

            {/* Status Change Toggles */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#9299A6] uppercase block">Update Engagement Status</span>
              <div className="flex flex-wrap gap-2">
                {['under_review', 'contacted', 'quoted', 'converted', 'archived', 'rejected'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    disabled={statusUpdating}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono capitalize bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-white cursor-pointer transition-colors"
                  >
                    Set {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#292E38]">
              <a
                href={`mailto:${selectedLead.email}?subject=Dracovion Technologies Inquiry: ${selectedLead.projectTitle}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#FFBD55] bg-[#11151D] border border-[#D6A94F]/40 hover:border-[#FFBD55] hover:bg-[#161B26] flex items-center gap-1.5 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#FFBD55]" />
                <span>Email Client Directly</span>
              </a>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
