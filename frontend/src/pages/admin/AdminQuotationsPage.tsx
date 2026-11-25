import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AdminLoadError } from '../../components/admin/AdminLoadError';
import {
  FileCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface LineItemForm {
  description: string;
  quantity: number;
  unitPriceRupees: string;
}

export const AdminQuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [taxRatePercent, setTaxRatePercent] = useState('0');
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState('14');
  const [revisionLimit, setRevisionLimit] = useState('3');
  const [supportTerms, setSupportTerms] = useState('30 days complimentary post-launch support and bug fixes.');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { description: 'Initial System Architecture & Core Frontend', quantity: 1, unitPriceRupees: '25000' },
  ]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    Promise.all([
      api.get<{ success: boolean; quotations: any[] }>('/quotations/admin/all'),
      api.get<{ success: boolean; users: any[] }>('/admin/users', { role: 'client' }),
    ])
      .then(([quoteRes, usersRes]) => {
        setQuotations(quoteRes.quotations || []);
        setClients(usersRes.users || []);
        if (usersRes.users && usersRes.users.length > 0) {
          setClientId(usersRes.users[0]._id);
        }
      })
      .catch((err: any) => setErrorMsg(err?.message || 'Unable to load quotations data.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, unitPriceRupees: '' },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItemForm, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => {
      const p = parseFloat(item.unitPriceRupees) || 0;
      return acc + p * item.quantity;
    }, 0);
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !title || !scopeDescription || lineItems.length === 0) {
      alert('Please fill all required quotation fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        clientId,
        title,
        scopeDescription,
        taxRatePercent: parseFloat(taxRatePercent) || 0,
        estimatedDeliveryDays: parseInt(estimatedDeliveryDays, 10) || 14,
        revisionLimit: parseInt(revisionLimit, 10) || 3,
        supportTerms,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceMinor: Math.round(parseFloat(item.unitPriceRupees) * 100),
        })),
      };

      await api.post('/quotations/admin', payload);
      alert('Quotation successfully created and dispatched to client!');
      setShowCreateModal(false);
      setTitle('');
      setScopeDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-mono text-sm">Loading quotations hub...</div>;
  }

  if (errorMsg) {
    return <AdminLoadError message={errorMsg} onRetry={loadData} />;
  }

  const subtotal = calculateSubtotal();
  const tax = subtotal * ((parseFloat(taxRatePercent) || 0) / 100);
  const total = subtotal + tax;

  return (
    <div className="space-y-8 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E38] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
            <span>OFFICIAL COMMERCIAL PROPOSALS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Quotations &amp; Proposals</h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
            Author itemized proposals, configure GST taxation, and inspect client negotiations.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] hover:scale-[1.02] transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
          }}
        >
          <Plus className="w-4 h-4 text-[#050609]" />
          <span>Prepare New Quotation</span>
        </button>
      </div>

      {quotations.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#9299A6] rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30 flex items-center justify-center text-[#FFBD55] mx-auto shadow-md">
            <Plus className="w-6 h-6 text-[#FFBD55]" />
          </div>
          <h3 className="text-base font-bold text-white">No Quotations Prepared Yet</h3>
          <p className="max-w-md mx-auto text-[#9299A6] text-xs">
            Author custom commercial quotations for approved client scopes. Click &quot;Prepare New Quotation&quot; to author your first proposal.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#FFBD55] bg-[#11151D] border border-[#D6A94F]/50 hover:bg-[#15191F] hover:border-[#FFBD55] transition-all cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Quotation</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#292E38] bg-[#080A0E] shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0D13] text-[#F5D18A] font-mono border-b border-[#292E38]">
              <tr>
                <th className="p-4">Quotation #</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Title &amp; Scope</th>
                <th className="p-4 text-center">Version</th>
                <th className="p-4 text-right">Subtotal</th>
                <th className="p-4 text-right">Total (INR)</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E38]/80 font-mono">
              {quotations.map(q => (
                <tr key={q._id} className="hover:bg-[#11151D]/60 transition-colors">
                  <td className="p-4 font-bold text-[#FFBD55]">{q.quotationNumber}</td>
                  <td className="p-4 font-sans font-bold text-white">
                    {q.clientId?.fullName || 'Client'}
                    <span className="block text-[11px] font-mono text-[#9299A6]">{q.clientId?.email}</span>
                  </td>
                  <td className="p-4 font-sans text-slate-300 max-w-xs truncate">{q.title}</td>
                  <td className="p-4 text-center text-[#9299A6]">v{q.version}</td>
                  <td className="p-4 text-right text-[#9299A6]">
                    ₹{(q.subtotalMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right text-[#FFBD55] font-bold">
                    ₹{(q.totalMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={q.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#D6A94F]/40 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#292E38]">
              <div>
                <h3 className="text-xl font-bold font-display text-white">Prepare New Quotation</h3>
                <span className="text-xs font-mono text-[#FFBD55]">Calculates Subtotals &amp; Indian Minor Units</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#9299A6] hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Target Client *
                  </label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#FFBD55]"
                  >
                    {clients.map(c => (
                      <option key={c._id} value={c._id} className="bg-[#080A0E] text-white">
                        {c.fullName} ({c.email}) {c.companyName ? `- ${c.companyName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Quotation Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Enterprise Logistics Telemetry Web App"
                    className="w-full h-11 px-4 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#FFBD55]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Scope &amp; Architectural Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={scopeDescription}
                  onChange={e => setScopeDescription(e.target.value)}
                  placeholder="Detail the modules, user roles, integrations, and milestones..."
                  className="w-full p-4 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#FFBD55]"
                />
              </div>

              {/* Line items section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider">
                    Itemized Line Items
                  </span>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs text-[#FFBD55] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      placeholder="Line item description"
                      value={item.description}
                      onChange={e => updateLineItem(idx, 'description', e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:outline-none focus:border-[#FFBD55]"
                    />
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateLineItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                      className="w-16 h-10 px-2 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs text-center font-mono focus:outline-none focus:border-[#FFBD55]"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Unit Price (INR)"
                      value={item.unitPriceRupees}
                      onChange={e => updateLineItem(idx, 'unitPriceRupees', e.target.value)}
                      className="w-32 h-10 px-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs text-right font-mono focus:outline-none focus:border-[#FFBD55]"
                    />
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Calculated Totals Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#292E38] text-xs">
                <div>
                  <label className="block text-[#9299A6] mb-1 font-mono">Applicable Tax % (GST)</label>
                  <input
                    type="number"
                    value={taxRatePercent}
                    onChange={e => setTaxRatePercent(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white font-mono focus:outline-none focus:border-[#FFBD55]"
                  />
                </div>
                <div>
                  <label className="block text-[#9299A6] mb-1 font-mono">Estimated Days</label>
                  <input
                    type="number"
                    value={estimatedDeliveryDays}
                    onChange={e => setEstimatedDeliveryDays(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white font-mono focus:outline-none focus:border-[#FFBD55]"
                  />
                </div>
                <div className="p-3 rounded-xl bg-[#11151D] border border-[#D6A94F]/30 flex flex-col justify-center">
                  <span className="text-[#9299A6] text-[10px] uppercase font-mono">Calculated Total</span>
                  <span className="text-lg font-bold text-[#FFBD55] font-mono">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#292E38]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#9299A6] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-lg flex items-center gap-2 cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                  }}
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Issue &amp; Dispatch Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
