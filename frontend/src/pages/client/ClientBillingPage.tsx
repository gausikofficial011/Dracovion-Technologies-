import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const ClientBillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State for Payment Record Submission
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer_neft_rtgs' | 'cash' | 'other'>('upi');
  const [transactionReference, setTransactionReference] = useState('');

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.get<{ success: boolean; invoices: any[] }>('/invoices/client/my'),
      api.get<{ success: boolean; payments: any[] }>('/payments/client/my'),
      api.get<{ success: boolean; projects: any[] }>('/projects/client/my'),
    ])
      .then(([invRes, payRes, projRes]) => {
        setInvoices(invRes.invoices || []);
        setPayments(payRes.payments || []);
        setProjects(projRes.projects || []);
        if (projRes.projects && projRes.projects.length > 0) {
          setSelectedProjectId(projRes.projects[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !amountRupees || !transactionReference) {
      alert('Please fill all required payment details');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const amountMinor = Math.round(parseFloat(amountRupees) * 100);
      const idempotencyKey = `PAY_CLI_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await api.post('/payments/submit', {
        projectId: selectedProjectId,
        invoiceId: selectedInvoiceId || undefined,
        amountMinor,
        paymentMethod,
        transactionReference,
        idempotencyKey,
      });

      setFeedback('Payment record submitted successfully! Our accounting administrator will verify against the bank ledger.');
      setShowSubmitModal(false);
      setAmountRupees('');
      setTransactionReference('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment record');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-mono text-sm">Loading billing records...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Billing & Invoices</h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
            Access tax-compliant invoices and record payments made via UPI or Bank Transfer.
          </p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] hover:scale-[1.02] transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
          }}
        >
          <Plus className="w-4 h-4 text-[#050609]" />
          <span>Record a Payment</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Invoices Table Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#FFBD55]" />
          <span>Commercial Invoices</span>
        </h3>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9299A6]">
            No invoices have been issued yet. Invoices are generated as milestones are reached.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#11151D] text-[#9299A6] font-mono border-b border-[#292E38]">
                <tr>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Project</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-center">Tax / GST</th>
                  <th className="p-3 text-right">Total (INR)</th>
                  <th className="p-3 text-right">Balance Due</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292E38]/80 font-mono bg-[#080A0E]">
                {invoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-[#11151D]/50 transition-colors">
                    <td className="p-3 text-[#FFBD55] font-bold">{inv.invoiceNumber}</td>
                    <td className="p-3 text-[#E7E9EE] font-sans">{inv.projectId?.title || 'Custom Scope'}</td>
                    <td className="p-3 text-right text-[#9299A6]">
                      ₹{(inv.subtotalMinor / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center text-[#9299A6]">
                      {inv.isGstApplicable ? `${inv.gstRatePercent}% GST` : 'Zero Tax / N/A'}
                    </td>
                    <td className="p-3 text-right text-white font-bold">
                      ₹{(inv.totalMinor / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right text-[#FFBD55] font-bold">
                      ₹{(inv.balanceDueMinor / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Submissions Ledger Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#D6A94F]" />
          <span>Recorded Payments & Verification Status</span>
        </h3>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9299A6]">
            No payment submissions recorded. Use the &quot;Record a Payment&quot; button above after making a bank transfer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#11151D] text-[#9299A6] border-b border-[#292E38]">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">UTR / Transaction ID</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                  <th className="p-3 text-center">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292E38]/80 bg-[#080A0E]">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-[#11151D]/50 transition-colors">
                    <td className="p-3 text-white font-bold">{p.paymentReference}</td>
                    <td className="p-3 text-[#E7E9EE] font-sans">{p.projectId?.title || 'Scope'}</td>
                    <td className="p-3 text-[#9299A6] uppercase">{p.paymentMethod.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-[#FFBD55]">{p.transactionReference}</td>
                    <td className="p-3 text-right text-white font-bold">
                      ₹{(p.amountMinor / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#D6A94F]/40 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
            <h3 className="text-lg font-bold text-white font-display">Record a Payment Submission</h3>
            <p className="text-xs text-[#9299A6]">
              Submit the transaction reference of your bank transfer or UPI payment. An administrator will verify the amount against the company account.
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
                  Select Project *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#D6A94F]"
                >
                  {projects.map(proj => (
                    <option key={proj._id} value={proj._id}>
                      {proj.projectCode} - {proj.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
                  Select Associated Invoice (Optional)
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#D6A94F]"
                >
                  <option value="">No specific invoice (Milestone Advance)</option>
                  {invoices.map(inv => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} (Balance Due: ₹{(inv.balanceDueMinor / 100).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
                    Amount Paid (INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountRupees}
                    onChange={e => setAmountRupees(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:outline-none focus:border-[#D6A94F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#D6A94F]"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="bank_transfer_neft_rtgs">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="cash">Direct Deposit / Cash</option>
                    <option value="other">Other Commercial Wire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D6A94F] uppercase tracking-wider mb-2">
                  Transaction Reference / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  value={transactionReference}
                  onChange={e => setTransactionReference(e.target.value)}
                  placeholder="e.g. UTR12983719823 or UPI Ref 4123891283"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:outline-none focus:border-[#D6A94F]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9299A6] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#050609] flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                  }}
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#050609]" />}
                  <span>Submit Payment Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
