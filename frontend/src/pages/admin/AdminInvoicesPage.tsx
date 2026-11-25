import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Printer,
  Loader2,
} from 'lucide-react';

interface InvoiceLineItemForm {
  description: string;
  quantity: number;
  unitPriceRupees: string;
}

export const AdminInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [clientId, setClientId] = useState('');
  const [isGstApplicable, setIsGstApplicable] = useState(false);
  const [gstRatePercent, setGstRatePercent] = useState('18');
  const [dueDateDays, setDueDateDays] = useState('14');
  const [lineItems, setLineItems] = useState<InvoiceLineItemForm[]>([
    { description: 'Sprint 1 Architecture & Prototype Milestone', quantity: 1, unitPriceRupees: '25000' },
  ]);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.get<{ success: boolean; invoices: any[] }>('/invoices/admin/all'),
      api.get<{ success: boolean; projects: any[] }>('/projects/admin/all'),
      api.get<{ success: boolean; users: any[] }>('/admin/users', { role: 'client' }),
    ])
      .then(([invRes, projRes, userRes]) => {
        setInvoices(invRes.invoices || []);
        setProjects(projRes.projects || []);
        setClients(userRes.users || []);
        if (projRes.projects && projRes.projects.length > 0) {
          setProjectId(projRes.projects[0]._id);
          setClientId(projRes.projects[0].clientId?._id || userRes.users[0]?._id);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPriceRupees: '' }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItemForm, value: any) => {
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

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !clientId || lineItems.length === 0) {
      alert('Please fill all required invoice fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        projectId,
        clientId,
        isGstApplicable,
        gstRatePercent: isGstApplicable ? parseFloat(gstRatePercent) || 0 : 0,
        dueDateDays: parseInt(dueDateDays, 10) || 14,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPriceMinor: Math.round(parseFloat(item.unitPriceRupees) * 100),
        })),
      };

      await api.post('/invoices/admin', payload);
      alert('Commercial invoice issued successfully!');
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to issue invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-mono text-sm">Loading invoices hub...</div>;
  }

  const subtotal = calculateSubtotal();
  const tax = isGstApplicable ? subtotal * ((parseFloat(gstRatePercent) || 0) / 100) : 0;
  const total = subtotal + tax;

  return (
    <div className="space-y-8 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E38] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
            <span>OFFICIAL FINANCIAL BILLING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Invoices &amp; Billing Hub</h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
            Issue GST-aware commercial tax invoices and track outstanding customer balances.
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
          <span>Generate Invoice</span>
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#9299A6] rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl">
          No invoices issued yet. Click &quot;Generate Invoice&quot; to issue a billing document.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#292E38] bg-[#080A0E] shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0D13] text-[#F5D18A] border-b border-[#292E38]">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Client</th>
                <th className="p-4">Project</th>
                <th className="p-4 text-right">Subtotal</th>
                <th className="p-4 text-center">GST Status</th>
                <th className="p-4 text-right">Total (INR)</th>
                <th className="p-4 text-right">Balance Due</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292E38]/80">
              {invoices.map(inv => (
                <tr key={inv._id} className="hover:bg-[#11151D]/60 transition-colors">
                  <td className="p-4 font-bold text-[#FFBD55]">{inv.invoiceNumber}</td>
                  <td className="p-4 font-sans text-white font-medium">
                    {inv.clientId?.fullName || 'Client'}
                  </td>
                  <td className="p-4 font-sans text-[#9299A6]">{inv.projectId?.title || 'Scope'}</td>
                  <td className="p-4 text-right text-[#9299A6]">
                    ₹{(inv.subtotalMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-center">
                    {inv.isGstApplicable ? (
                      <span className="text-[#FFBD55] font-semibold">{inv.gstRatePercent}% GST</span>
                    ) : (
                      <span className="text-[#9299A6]">Non-GST</span>
                    )}
                  </td>
                  <td className="p-4 text-right text-white font-bold">
                    ₹{(inv.totalMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right text-[#FFBD55] font-bold">
                    ₹{(inv.balanceDueMinor / 100).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#292E38]">
              <div>
                <h3 className="text-xl font-bold text-white font-display">Generate Commercial Invoice</h3>
                <span className="text-xs font-mono text-[#FFBD55]">Configurable GST &amp; Minor Units</span>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#9299A6] hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9299A6] uppercase tracking-wider mb-2">
                    Select Project *
                  </label>
                  <select
                    value={projectId}
                    onChange={e => {
                      const pId = e.target.value;
                      setProjectId(pId);
                      const proj = projects.find(p => p._id === pId);
                      if (proj && proj.clientId?._id) setClientId(proj.clientId._id);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                  >
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.projectCode} - {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9299A6] uppercase tracking-wider mb-2">
                    Client *
                  </label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                  >
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.fullName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GST Configuration Toggle */}
              <div className="p-4 rounded-xl bg-[#11151D] border border-[#292E38] space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGstApplicable}
                    onChange={e => setIsGstApplicable(e.target.checked)}
                    className="w-4 h-4 rounded border-[#292E38] accent-[#D6A94F]"
                  />
                  <span className="text-xs font-semibold text-white">
                    Apply GST to this Invoice (Tamil Nadu Inter/Intra State Breakdown)
                  </span>
                </label>

                {isGstApplicable && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-[#9299A6]">GST Rate Percentage:</span>
                    <select
                      value={gstRatePercent}
                      onChange={e => setGstRatePercent(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#080A0E] border border-[#292E38] text-white text-xs font-mono focus:border-[#D6A94F] focus:outline-none"
                    >
                      <option value="18">18% (9% CGST + 9% SGST)</option>
                      <option value="12">12% (6% CGST + 6% SGST)</option>
                      <option value="5">5% (2.5% CGST + 2.5% SGST)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider">
                    Invoice Line Items
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
                      className="flex-1 px-3 py-2 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateLineItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-2 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs text-center font-mono focus:border-[#D6A94F] focus:outline-none"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Unit Price"
                      value={item.unitPriceRupees}
                      onChange={e => updateLineItem(idx, 'unitPriceRupees', e.target.value)}
                      className="w-32 px-3 py-2 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs text-right font-mono focus:border-[#D6A94F] focus:outline-none"
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

              {/* Total preview */}
              <div className="p-4 rounded-xl bg-[#11151D] border border-[#292E38] flex justify-end font-mono text-xs">
                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-[#9299A6]">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {isGstApplicable && (
                    <div className="flex justify-between text-[#9299A6]">
                      <span>GST ({gstRatePercent}%):</span>
                      <span>₹{tax.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-[#292E38]">
                    <span>Invoice Total:</span>
                    <span className="text-[#FFBD55]">₹{total.toLocaleString('en-IN')}</span>
                  </div>
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] transition-all cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                  }}
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#050609]" />}
                  <span>Issue Commercial Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
