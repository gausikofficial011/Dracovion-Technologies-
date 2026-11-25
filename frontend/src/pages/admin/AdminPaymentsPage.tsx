import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AdminLoadError } from '../../components/admin/AdminLoadError';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  Loader2,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPayments = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    api.get<{ success: boolean; payments: any[] }>('/payments/admin/all')
      .then(res => setPayments(res.payments || []))
      .catch((err: any) => setErrorMsg(err?.message || 'Unable to load payments ledger.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadPayments();
  }, []);

  const handleVerify = async (paymentId: string) => {
    const notes = window.prompt('Enter verification note (e.g. Verified via Bank Netbanking UTR match):', 'Verified in bank account ledger');
    if (notes === null) return;

    setActionLoading(true);
    try {
      await api.patch(`/payments/admin/${paymentId}/verify`, { status: 'verified', notes });
      alert('Payment record marked as verified! Invoice balance updated.');
      loadPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to verify payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (paymentId: string) => {
    const notes = window.prompt('Enter reason for declining this payment record (e.g. UTR not found on bank statement):');
    if (notes === null) return;

    setActionLoading(true);
    try {
      await api.patch(`/payments/admin/${paymentId}/verify`, { status: 'rejected', notes });
      alert('Payment record marked as rejected.');
      loadPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-mono text-sm">Loading payments ledger...</div>;
  }

  if (errorMsg) {
    return <AdminLoadError message={errorMsg} onRetry={loadPayments} />;
  }

  return (
    <div className="space-y-8 select-none">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
          <span>FINANCIAL AUDIT &amp; SETTLEMENT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Payment Records &amp; Reconciliation</h1>
        <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
          Verify bank transfer UTRs, approve UPI transactions, and reconcile customer balances.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#9299A6] rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl">
          No customer payments recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#292E38] bg-[#080A0E] shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0D13] text-[#F5D18A] border-b border-[#292E38]">
              <tr>
                <th className="p-4">Payment Ref</th>
                <th className="p-4">Client</th>
                <th className="p-4">Project</th>
                <th className="p-4">Method</th>
                <th className="p-4">UTR / Transaction Ref</th>
                <th className="p-4 text-right">Amount (INR)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E38]/80">
              {payments.map(p => (
                <tr key={p._id} className="hover:bg-[#11151D]/60 transition-colors">
                  <td className="p-4 font-bold text-[#FFBD55]">{p.paymentReference}</td>
                  <td className="p-4 font-sans font-medium text-white">
                    {p.clientId?.fullName || 'Client'}
                    <span className="block text-[11px] font-mono text-[#9299A6]">{p.clientId?.email}</span>
                  </td>
                  <td className="p-4 font-sans text-[#9299A6]">{p.projectId?.title || 'Scope'}</td>
                  <td className="p-4 uppercase text-[#FFBD55] font-semibold">{p.paymentMethod.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-white font-bold">{p.transactionReference}</td>
                  <td className="p-4 text-right text-emerald-400 font-bold">
                    ₹{(p.amountMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="p-4 text-center">
                    {p.status === 'submitted' || p.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVerify(p._id)}
                          disabled={actionLoading}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 font-semibold cursor-pointer transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleReject(p._id)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 font-semibold cursor-pointer transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        {p.status === 'verified' ? `Verified by ${p.verifiedBy?.fullName || 'Admin'}` : 'Declined'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
