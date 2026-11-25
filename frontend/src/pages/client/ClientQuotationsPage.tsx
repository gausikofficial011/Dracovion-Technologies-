import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  Shield,
  Loader2,
} from 'lucide-react';

export const ClientQuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadQuotations = () => {
    setIsLoading(true);
    api.get<{ success: boolean; quotations: any[] }>('/quotations/client/my')
      .then(res => {
        setQuotations(res.quotations || []);
        if (res.quotations && res.quotations.length > 0) {
          setSelectedQuote(res.quotations[0]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleAccept = async (id: string) => {
    if (!window.confirm('Accept this quotation? This will approve the proposal and initialize your project immediately.')) {
      return;
    }
    setActionLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await api.post<{ success: boolean; message: string; project: any }>(
        `/quotations/${id}/accept`
      );
      setFeedbackMessage('Quotation accepted! Your project has been initialized in your workspace.');
      loadQuotations();
    } catch (err: any) {
      alert(err.message || 'Failed to accept quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Please provide a reason for declining this proposal (optional):');
    if (reason === null) return;

    setActionLoading(true);
    try {
      await api.post(`/quotations/${id}/reject`, { reason });
      setFeedbackMessage('Proposal marked as declined.');
      loadQuotations();
    } catch (err: any) {
      alert(err.message || 'Failed to reject quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNegotiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setActionLoading(true);
    try {
      const reqPaise = requestedAmount ? Math.round(parseFloat(requestedAmount) * 100) : undefined;
      await api.post(`/quotations/${selectedQuote._id}/negotiate`, {
        notes: negotiationNotes,
        requestedAmountMinor: reqPaise,
      });
      setShowNegotiateModal(false);
      setNegotiationNotes('');
      setRequestedAmount('');
      setFeedbackMessage('Negotiation notes sent. An engineer will review and counter shortly.');
      loadQuotations();
    } catch (err: any) {
      alert(err.message || 'Failed to submit negotiation.');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-mono text-sm">Loading proposals...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Proposals & Quotations</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review itemized scopes, negotiate revisions, and accept proposals to trigger instant project activation.
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {quotations.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#080A0E] border border-[#292E38] text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30 mx-auto flex items-center justify-center text-[#FFBD55]">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white font-display">No Quotations Issued Yet</h3>
          <p className="text-xs text-[#9299A6] max-w-sm mx-auto">
            Once you submit a project enquiry, our technical team prepares a detailed itemized proposal here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of quotes */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-[#FFBD55] uppercase tracking-wider block font-bold">
              Issued Proposals ({quotations.length})
            </span>
            {quotations.map(q => {
              const isSelected = selectedQuote?._id === q._id;
              return (
                <div
                  key={q._id}
                  onClick={() => setSelectedQuote(q)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#11151D] border-[#D6A94F] shadow-[0_0_20px_rgba(214,169,79,0.2)]'
                      : 'bg-[#080A0E] border-[#292E38] hover:border-[#D6A94F]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-[#D6A94F] font-semibold">{q.quotationNumber}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <h4 className="text-sm font-bold text-white">{q.title}</h4>
                  <div className="flex items-center justify-between text-xs text-[#9299A6] mt-2 font-mono">
                    <span>v{q.version}</span>
                    <span className="text-[#FFBD55] font-bold">
                      ₹{(q.totalMinor / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quotation Detail Viewer */}
          {selectedQuote && (
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#292E38]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#FFBD55] font-bold">
                      {selectedQuote.quotationNumber}
                    </span>
                    <span className="text-xs font-mono text-[#9299A6]">• Version {selectedQuote.version}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">{selectedQuote.title}</h2>
                </div>
                <StatusBadge status={selectedQuote.status} size="md" />
              </div>

              {/* Scope Description */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#D6A94F] uppercase tracking-wider block font-bold">
                  Project Scope & Architecture
                </span>
                <p className="text-xs sm:text-sm text-[#E7E9EE] leading-relaxed bg-[#11151D] p-4 rounded-xl border border-[#292E38]">
                  {selectedQuote.scopeDescription}
                </p>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-[#D6A94F] uppercase tracking-wider block font-bold">
                  Itemized Cost Breakdown
                </span>
                <div className="rounded-xl border border-[#292E38] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#11151D] text-[#9299A6] border-b border-[#292E38]">
                      <tr>
                        <th className="p-3">Deliverable Line Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price (INR)</th>
                        <th className="p-3 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#292E38]/80 bg-[#080A0E]">
                      {selectedQuote.lineItems.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#11151D]/50 transition-colors">
                          <td className="p-3 text-white font-medium">{item.description}</td>
                          <td className="p-3 text-center text-[#9299A6] font-mono">{item.quantity}</td>
                          <td className="p-3 text-right text-[#9299A6] font-mono">
                            ₹{(item.unitPriceMinor / 100).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right text-[#FFBD55] font-mono font-semibold">
                            ₹{(item.amountMinor / 100).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-4 rounded-xl bg-[#11151D] border border-[#292E38] flex justify-end">
                <div className="w-full sm:w-64 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#9299A6]">
                    <span>Subtotal:</span>
                    <span>₹{(selectedQuote.subtotalMinor / 100).toLocaleString('en-IN')}</span>
                  </div>
                  {selectedQuote.taxRatePercent > 0 && (
                    <div className="flex justify-between text-[#9299A6]">
                      <span>GST ({selectedQuote.taxRatePercent}%):</span>
                      <span>₹{(selectedQuote.taxAmountMinor / 100).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-[#292E38]">
                    <span>Total Investment:</span>
                    <span className="text-[#FFBD55]">
                      ₹{(selectedQuote.totalMinor / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-[#9299A6]">
                <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                  <span className="text-[#D6A94F] block mb-0.5">Estimated Delivery</span>
                  <span className="text-white font-bold">{selectedQuote.estimatedDeliveryDays} Days</span>
                </div>
                <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                  <span className="text-[#D6A94F] block mb-0.5">Revision Limit</span>
                  <span className="text-white font-bold">{selectedQuote.revisionLimit} Sprints</span>
                </div>
                <div className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]">
                  <span className="text-[#D6A94F] block mb-0.5">Support Terms</span>
                  <span className="text-white font-bold">{selectedQuote.supportTerms}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {['sent', 'negotiating'].includes(selectedQuote.status) && (
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end border-t border-[#292E38]">
                  <button
                    onClick={() => setShowNegotiateModal(true)}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#FFBD55]" />
                    <span>Negotiate Scope or Budget</span>
                  </button>

                  <button
                    onClick={() => handleReject(selectedQuote._id)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    Decline
                  </button>

                  <button
                    onClick={() => handleAccept(selectedQuote._id)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] hover:scale-[1.02] flex items-center justify-center gap-2 transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                    }}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#050609]" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#050609]" />
                        <span>Accept Proposal & Activate Project</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Negotiation Modal */}
      {showNegotiateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#D6A94F]/40 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
            <h3 className="text-lg font-bold text-white font-display">Negotiate Proposal Terms</h3>
            <p className="text-xs text-[#9299A6]">
              Submit your desired adjustments to scope, target pricing, or timeline. We will review and provide an updated version.
            </p>

            <form onSubmit={handleNegotiateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
                  Target Budget (Optional, INR)
                </label>
                <input
                  type="number"
                  value={requestedAmount}
                  onChange={e => setRequestedAmount(e.target.value)}
                  placeholder="e.g. 40000"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:outline-none focus:border-[#D6A94F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
                  Scope Adjustments & Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  value={negotiationNotes}
                  onChange={e => setNegotiationNotes(e.target.value)}
                  placeholder="Describe items you want adjusted, removed, or postponed..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#D6A94F]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNegotiateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9299A6] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#050609] cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                  }}
                >
                  Submit Negotiation Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
