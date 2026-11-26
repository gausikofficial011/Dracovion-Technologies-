import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, resolveApiUrl } from '../../api/client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AdminLoadError } from '../../components/admin/AdminLoadError';
import {
  getMissingPersonalDetails,
  isOrderCompletedAndPaid,
  isProjectCompletedAndPaid,
} from '../../utils/orderGovernance';
import {
  Package,
  CheckCircle2,
  Upload,
  Loader2,
  MessageSquare,
  UserCheck,
  User,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Sparkles,
  DownloadCloud,
} from 'lucide-react';

type UnifiedItem =
  | { kind: 'order'; data: any; sortTs: number }
  | { kind: 'project'; data: any; sortTs: number };

const ORDER_STATUSES = [
  'submitted',
  'reviewing',
  'quoted',
  'approved',
  'in_progress',
  'review_pending',
  'delivered',
  'completed',
  'revision_requested',
  'cancelled',
];

const PROJECT_STATUSES = [
  'approved',
  'in_progress',
  'review',
  'delivered',
  'completed',
  'revision_required',
  'blocked',
  'cancelled',
];

export const AdminProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'projects'>('all');
  const [selectedRef, setSelectedRef] = useState<{ kind: 'order' | 'project'; id: string } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sprint project upload state
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Order management state
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateProgress, setUpdateProgress] = useState(50);
  const [orderDeliverableTitle, setOrderDeliverableTitle] = useState('');
  const [orderDeliverableFile, setOrderDeliverableFile] = useState<File | null>(null);
  const [isPostingOrderUpdate, setIsPostingOrderUpdate] = useState(false);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    if (type === 'success') {
      setTimeout(() => {
        setBanner((prev) => (prev?.text === text ? null : prev));
      }, 5000);
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [ordersResult, projectsResult, usersResult] = await Promise.allSettled([
        api.get<{ success: boolean; orders: any[] }>('/orders'),
        api.get<{ success: boolean; projects: any[] }>('/projects/admin/all'),
        api.get<{ success: boolean; users: any[] }>('/admin/users?status=active'),
      ]);

      const ordersOk = ordersResult.status === 'fulfilled';
      const projectsOk = projectsResult.status === 'fulfilled';

      if (!ordersOk && !projectsOk) {
        const err: any = (ordersResult as PromiseRejectedResult).reason || (projectsResult as PromiseRejectedResult).reason;
        setErrorMsg(err?.message || 'Unable to load company projects and orders.');
        return;
      }

      const nextOrders = ordersOk ? ordersResult.value.orders || [] : [];
      const nextProjects = projectsOk ? projectsResult.value.projects || [] : [];
      setOrders(nextOrders);
      setProjects(nextProjects);

      if (usersResult.status === 'fulfilled') {
        const activeWorkspaceStaff = (usersResult.value.users || []).filter(
          (u: any) => u.portalType === 'workspace' || ['owner', 'super_admin', 'ceo', 'employee'].includes(u.role)
        );
        setStaffMembers(activeWorkspaceStaff);
      }

      const paramOrderId = searchParams.get('order');
      const paramProjectId = searchParams.get('project');

      setSelectedRef((prev) => {
        if (paramOrderId && nextOrders.some((o: any) => o._id === paramOrderId || o.orderNumber === paramOrderId)) {
          const match = nextOrders.find((o: any) => o._id === paramOrderId || o.orderNumber === paramOrderId);
          return { kind: 'order', id: match._id };
        }
        if (paramProjectId && nextProjects.some((p: any) => p._id === paramProjectId || p.projectCode === paramProjectId)) {
          const match = nextProjects.find((p: any) => p._id === paramProjectId || p.projectCode === paramProjectId);
          return { kind: 'project', id: match._id };
        }
        if (prev) {
          if (prev.kind === 'order' && nextOrders.some((o: any) => o._id === prev.id)) return prev;
          if (prev.kind === 'project' && nextProjects.some((p: any) => p._id === prev.id)) return prev;
        }
        if (nextOrders.length > 0) return { kind: 'order', id: nextOrders[0]._id };
        if (nextProjects.length > 0) return { kind: 'project', id: nextProjects[0]._id };
        return null;
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load project control hub.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unifiedItems: UnifiedItem[] = useMemo(() => {
    const orderItems: UnifiedItem[] = orders.map((o) => ({
      kind: 'order',
      data: o,
      sortTs: new Date(o.updatedAt || o.createdAt || 0).getTime(),
    }));
    const projectItems: UnifiedItem[] = projects.map((p) => ({
      kind: 'project',
      data: p,
      sortTs: new Date(p.updatedAt || p.createdAt || 0).getTime(),
    }));

    const combined =
      activeTab === 'orders'
        ? orderItems
        : activeTab === 'projects'
        ? projectItems
        : [...orderItems, ...projectItems];

    return combined.sort((a, b) => b.sortTs - a.sortTs);
  }, [orders, projects, activeTab]);

  const selectedItem: UnifiedItem | null = useMemo(() => {
    if (!selectedRef) return unifiedItems[0] || null;
    if (selectedRef.kind === 'order') {
      const found = orders.find((o) => o._id === selectedRef.id);
      if (found) return { kind: 'order', data: found, sortTs: 0 };
    } else {
      const found = projects.find((p) => p._id === selectedRef.id);
      if (found) return { kind: 'project', data: found, sortTs: 0 };
    }
    return unifiedItems[0] || null;
  }, [selectedRef, orders, projects, unifiedItems]);

  useEffect(() => {
    if (selectedItem?.kind === 'order') {
      setUpdateProgress(selectedItem.data.progressPercent ?? 50);
      setSelectedAssigneeId(selectedItem.data.assignedEmployeeId?._id || '');
    }
  }, [selectedItem?.kind, selectedItem?.data?._id]);

  const selectItem = (item: UnifiedItem) => {
    setSelectedRef({ kind: item.kind, id: item.data._id });
    setSearchParams(item.kind === 'order' ? { order: item.data._id } : { project: item.data._id }, { replace: true });
  };

  // Sprint project handlers
  const handleProjectStatusChange = async (projectId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/projects/${projectId}/status`, {
        status: newStatus,
        note: `Administrative state transition to ${newStatus}`,
      });
      showBanner('success', `Sprint project status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}.`);
      await loadData();
    } catch (err: any) {
      showBanner('error', err?.message || 'Failed to update project status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMilestoneToggle = async (projectId: string, index: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    setActionLoading(true);
    try {
      await api.patch(`/projects/${projectId}/milestones/${index}`, { status: nextStatus });
      showBanner('success', 'Milestone progress updated.');
      await loadData();
    } catch (err: any) {
      showBanner('error', err?.message || 'Failed to update milestone');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProjectDeliverableUpload = async (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    if (!deliverableFile) {
      showBanner('error', 'Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', deliverableFile);
      formData.append('projectId', projectId);
      formData.append('title', deliverableTitle || deliverableFile.name);
      formData.append('isDeliverable', 'true');

      await api.post('/files/upload', formData);
      showBanner('success', 'Deliverable artifact uploaded securely to project vault.');
      setDeliverableFile(null);
      setDeliverableTitle('');
      await loadData();
    } catch (err: any) {
      showBanner('error', err?.message || 'Failed to upload deliverable file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Client order handlers
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await api.patch<{ success: boolean; message?: string }>(`/orders/${orderId}/status`, {
        status: newStatus,
        clientVisibleNote: statusNote.trim() || `Company status updated to ${newStatus.replace(/_/g, ' ')}.`,
      });
      showBanner('success', res.message || `Order status updated to ${newStatus.replace(/_/g, ' ')}.`);
      setStatusNote('');
      await loadData();
    } catch (err: any) {
      showBanner('error', err?.message || 'Failed to update client order status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrderAssign = async (orderId: string, employeeId?: string) => {
    setActionLoading(true);
    try {
      const res = await api.patch<{ success: boolean; message?: string }>(`/orders/${orderId}/assign`, {
        ...(employeeId ? { employeeId } : {}),
      });
      showBanner('success', res.message || 'Lead engineer allocated to client order.');
      await loadData();
    } catch (err: any) {
      showBanner('error', err?.message || 'Unable to assign engineer to this order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOrderHandover = async (orderId: string) => {
    setActionLoading(true);
    try {
      const res = await api.post<{ success: boolean; message?: string }>(`/orders/${orderId}/verify-handover-payment`, {});
      showBanner('success', res.message || 'Handover payment verified and final deliverables unlocked.');
      await loadData();
    } catch (err: any) {
      showBanner('error', err?.message || 'Unable to verify handover payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrderPostUpdate = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateDescription.trim()) {
      showBanner('error', 'Update title and description are required.');
      return;
    }

    setIsPostingOrderUpdate(true);
    try {
      let uploadedFileMeta: any = null;
      if (orderDeliverableFile) {
        const formData = new FormData();
        formData.append('file', orderDeliverableFile);
        formData.append('isDeliverable', 'true');
        const uploadRes = await api.post<{ success: boolean; file: any }>('/files/upload', formData);
        uploadedFileMeta = uploadRes.file;
      }

      const res = await api.post<{ success: boolean; message?: string }>(`/orders/${orderId}/post-update`, {
        title: updateTitle.trim(),
        description: updateDescription.trim(),
        progressPercent: Number(updateProgress) || 0,
        ...(uploadedFileMeta
          ? {
              deliverableTitle: orderDeliverableTitle.trim() || uploadedFileMeta.originalName || orderDeliverableFile?.name,
              deliverableFileKey: uploadedFileMeta.fileKey,
              deliverableOriginalName: uploadedFileMeta.originalName,
              deliverableSizeBytes: uploadedFileMeta.sizeBytes,
            }
          : {}),
      });

      showBanner('success', res.message || 'Progress update posted to client timeline.');
      setUpdateTitle('');
      setUpdateDescription('');
      setOrderDeliverableTitle('');
      setOrderDeliverableFile(null);
      await loadData();
    } catch (err: any) {
      showBanner('error', err?.message || 'Failed to post progress update.');
    } finally {
      setIsPostingOrderUpdate(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-mono text-sm">Loading project &amp; order control hub...</div>;
  }

  if (errorMsg) {
    return <AdminLoadError message={errorMsg} onRetry={loadData} />;
  }

  const totalCount = orders.length + projects.length;

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
            <span>COMPANY DELIVERY COMMAND</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Projects, Client Orders &amp; State Machine
          </h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
            Review placed client project orders, allocate lead engineers, manage sprint transitions, and release verified deliverables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadData()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 text-xs font-mono text-[#9299A6] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#FFBD55]" />
            <span>Refresh</span>
          </button>
          <Link
            to="/workspace/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#11151D] border border-[#D6A94F]/40 hover:border-[#FFBD55] text-xs font-mono font-bold text-[#FFBD55] transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Full Orders Desk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {banner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            banner.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{banner.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'all', label: 'All Projects & Orders', count: totalCount },
          { key: 'orders', label: 'Client Orders', count: orders.length },
          { key: 'projects', label: 'Quotation Sprints', count: projects.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 border ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] border-transparent shadow-md'
                : 'bg-[#080A0E] text-[#9299A6] border-[#292E38] hover:text-white hover:border-[#D6A94F]/40'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                activeTab === tab.key ? 'bg-[#050609]/20 text-[#050609]' : 'bg-[#11151D] text-[#FFBD55]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {unifiedItems.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#9299A6] rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-xl">
          {totalCount === 0
            ? 'No client orders or sprint projects yet. Placed client orders and accepted quotation sprints will appear here automatically.'
            : activeTab === 'projects'
            ? 'No quotation-based sprint projects yet. Check "Client Orders" for submitted client project requests.'
            : 'No client orders found in this view.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Unified Projects & Orders List */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider block">
              Active Queue ({unifiedItems.length})
            </span>
            {unifiedItems.map((item) => {
              const isOrder = item.kind === 'order';
              const d = item.data;
              const isSelected = selectedItem?.kind === item.kind && selectedItem.data._id === d._id;
              const code = isOrder ? d.orderNumber : d.projectCode;
              const title = isOrder ? d.projectTitle : d.title;
              const isPaidDelivered = isOrder ? isOrderCompletedAndPaid(d) : isProjectCompletedAndPaid(d);

              return (
                <div
                  key={`${item.kind}-${d._id}`}
                  onClick={() => selectItem(item)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#11151D] border-[#D6A94F] shadow-lg shadow-[#D6A94F]/10'
                      : 'bg-[#080A0E] border-[#292E38] hover:border-[#D6A94F]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          isOrder
                            ? 'bg-[#D6A94F]/20 text-[#FFBD55] border border-[#D6A94F]/40'
                            : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {isOrder ? 'ORDER' : 'SPRINT'}
                      </span>
                      <span className="text-xs font-mono text-[#FFBD55] truncate">{code}</span>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>

                  <h4 className="text-sm font-bold text-white truncate">{title}</h4>

                  <div className="flex items-center justify-between text-xs text-[#9299A6] mt-2 font-mono">
                    <span className="truncate">{d.clientId?.fullName || 'Client'}</span>
                    <span className="text-[#FFBD55] font-bold shrink-0">{d.progressPercent ?? 0}%</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#9299A6] mt-1.5 pt-1.5 border-t border-[#292E38]/60">
                    <span>
                      {isOrder
                        ? d.assignedEmployeeId?.fullName
                          ? `Lead: ${d.assignedEmployeeId.fullName}`
                          : 'Unassigned'
                        : d.category?.replace(/_/g, ' ') || 'Sprint'}
                    </span>
                    {isPaidDelivered && (
                      <span className="text-emerald-400 font-bold">Delivered &amp; Paid</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Control Panel */}
          {selectedItem?.kind === 'order' && (() => {
            const order = selectedItem.data;
            const client = order.clientId || {};
            const clientObjId = client._id || client;
            const missingDetails = getMissingPersonalDetails(client, order);
            const isPaidDelivered = isOrderCompletedAndPaid(order);
            const hasPaymentProof = Boolean(order.handoverPaymentProof?.transactionRef || order.handoverPaymentProof?.status);
            const paymentProofAmount = order.handoverPaymentProof?.amountMinor
              ? order.handoverPaymentProof.amountMinor / 100
              : order.handoverPaymentProof?.amountRupees || 0;

            return (
              <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#292E38]">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#D6A94F]/20 border border-[#D6A94F]/40 text-[10px] font-mono font-bold text-[#FFBD55] uppercase">
                        CLIENT ORDER
                      </span>
                      <span className="text-xs font-mono text-[#FFBD55]">{order.orderNumber}</span>
                      <span className="text-xs font-mono text-[#9299A6]">
                        • {order.serviceCategory?.replace(/_/g, ' ')}
                      </span>
                      {order.estimatedBudget && (
                        <span className="text-xs font-mono text-emerald-400">• {order.estimatedBudget}</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white font-display">{order.projectTitle}</h2>
                    <div className="text-xs font-mono text-[#9299A6]">
                      Client: <span className="text-white font-semibold">{client.fullName || 'Client'}</span> ({client.email || '—'})
                      {client.phone ? ` • ${client.phone}` : ''}
                      {(client.companyName || client.collegeOrUniversity) ? ` • ${client.companyName || client.collegeOrUniversity}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={order.status} size="md" />
                    {clientObjId && (
                      <Link
                        to={`/admin/messages?client=${clientObjId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#D6A94F]/40 hover:border-[#FFBD55] text-[11px] font-mono font-bold text-[#FFBD55]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Client Chat</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Requirements Brief */}
                <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D6A94F] font-bold block">
                    Project Requirements Scope
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {order.description}
                  </p>
                  {order.preferredDeadline && (
                    <div className="text-[11px] font-mono text-[#9299A6] pt-1">
                      Preferred Timeline: <span className="text-white">{order.preferredDeadline}</span>
                    </div>
                  )}
                </div>

                {/* Governance & Engineer Allocation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#D6A94F] font-bold">
                        Engineer Allocation
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          missingDetails.length === 0
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <UserCheck className="w-3 h-3" />
                        {missingDetails.length === 0 ? 'Details Verified' : `Missing: ${missingDetails.join(', ')}`}
                      </span>
                    </div>

                    <div className="text-xs text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-[#FFBD55]" />
                      <span>
                        {order.assignedEmployeeId
                          ? `${order.assignedEmployeeId.fullName} (${order.assignedEmployeeId.designation || 'Engineer'})`
                          : 'No engineer assigned yet'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedAssigneeId}
                        onChange={(e) => setSelectedAssigneeId(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] text-xs text-white focus:border-[#D6A94F] focus:outline-none"
                      >
                        <option value="">Assign to myself (Current Admin)</option>
                        {staffMembers.map((staff) => (
                          <option key={staff._id} value={staff._id}>
                            {staff.fullName} ({staff.role})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={actionLoading || missingDetails.length > 0}
                        onClick={() => handleOrderAssign(order._id, selectedAssigneeId || undefined)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        {order.assignedEmployeeId ? 'Reassign' : 'Allocate'}
                      </button>
                    </div>
                  </div>

                  {/* Handover & Settlement Card */}
                  <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#D6A94F] font-bold">
                        Payment &amp; Handover Gate
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          isPaidDelivered
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {isPaidDelivered ? 'COMPLETED & PAID' : String(order.handoverStatus || 'in_development').replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#9299A6] space-y-1">
                      <div>
                        Direct Payment Share:{' '}
                        <span className={order.employeePaymentShare?.sharedAt ? 'text-emerald-400' : 'text-amber-300'}>
                          {order.employeePaymentShare?.sharedAt
                            ? `Shared (${order.employeePaymentShare.upiId || order.employeePaymentShare.bankAccount || 'Active'})`
                            : 'Pending share on Orders Desk'}
                        </span>
                      </div>
                      {hasPaymentProof && (
                        <div className="text-sky-300">
                          Proof: Ref {order.handoverPaymentProof.transactionRef || 'Recorded'}
                          {paymentProofAmount > 0 ? ` • ₹${Number(paymentProofAmount).toLocaleString('en-IN')}` : ''}
                          {' '}({order.handoverPaymentProof.status || 'pending'})
                        </div>
                      )}
                    </div>

                    {!isPaidDelivered && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleVerifyOrderHandover(order._id)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Payment &amp; Complete Handover</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status State Machine Controls */}
                <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider">
                      Advance Order Lifecycle Status
                    </span>
                    <span className="text-[10px] font-mono text-amber-300/90">
                      Note: Completed orders count under Total Delivered after payment is verified.
                    </span>
                  </div>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Optional client-visible status note (sent with email update)..."
                    className="w-full px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] text-xs text-white focus:border-[#D6A94F] focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={actionLoading || order.status === st}
                        onClick={() => handleOrderStatusChange(order._id, st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all cursor-pointer ${
                          order.status === st
                            ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
                            : 'bg-[#080A0E] text-[#9299A6] hover:text-white border border-[#292E38] hover:border-[#D6A94F]'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Post Progress Update & Deliverable Artifact */}
                <div className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FFBD55]" />
                    <span>Post Sprint Progress &amp; Deliverable Artifact</span>
                  </h4>
                  <form onSubmit={(e) => handleOrderPostUpdate(e, order._id)} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                          Update Milestone Title
                        </label>
                        <input
                          type="text"
                          required
                          value={updateTitle}
                          onChange={(e) => setUpdateTitle(e.target.value)}
                          placeholder="e.g. Core Architecture & Voice Pipeline Deployed"
                          className="w-full px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                          Progress ({updateProgress}%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={updateProgress}
                          onChange={(e) => setUpdateProgress(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                        Client Update Notes
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={updateDescription}
                        onChange={(e) => setUpdateDescription(e.target.value)}
                        placeholder="Summarize build milestones completed for the client timeline..."
                        className="w-full px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                          Optional Deliverable Title
                        </label>
                        <input
                          type="text"
                          value={orderDeliverableTitle}
                          onChange={(e) => setOrderDeliverableTitle(e.target.value)}
                          placeholder="e.g. Production Build v1.0"
                          className="w-full px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                          Attach Deliverable File (Optional)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setOrderDeliverableFile(e.target.files ? e.target.files[0] : null)}
                          className="w-full text-xs text-[#9299A6] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#D6A94F]/40 file:text-xs file:font-bold file:bg-[#080A0E] file:text-[#FFBD55] cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPostingOrderUpdate}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] transition-all cursor-pointer disabled:opacity-50"
                      style={{ background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)' }}
                    >
                      {isPostingOrderUpdate && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#050609]" />}
                      <span>Post Timeline Update</span>
                    </button>
                  </form>
                </div>

                {/* Recent Timeline & Deliverables */}
                {(order.projectUpdates?.length > 0 || order.deliverables?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2.5">
                      <span className="text-[10px] font-mono uppercase text-[#D6A94F] font-bold block">
                        Recent Updates ({order.projectUpdates?.length || 0})
                      </span>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {[...(order.projectUpdates || [])].reverse().slice(0, 6).map((u: any, i: number) => (
                          <div key={i} className="p-2.5 rounded-xl bg-[#080A0E] border border-[#292E38] text-xs">
                            <div className="flex items-center justify-between gap-2 font-bold text-white">
                              <span className="truncate">{u.title}</span>
                              <span className="text-[10px] font-mono text-[#FFBD55] shrink-0">{u.progressPercent}%</span>
                            </div>
                            <p className="text-[11px] text-[#9299A6] mt-1">{u.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2.5">
                      <span className="text-[10px] font-mono uppercase text-[#D6A94F] font-bold block">
                        Vault Deliverables ({order.deliverables?.length || 0})
                      </span>
                      {(!order.deliverables || order.deliverables.length === 0) ? (
                        <div className="text-xs text-[#9299A6]">No deliverable files uploaded yet.</div>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {order.deliverables.map((d: any, i: number) => (
                            <div key={i} className="p-2.5 rounded-xl bg-[#080A0E] border border-[#292E38] flex items-center justify-between gap-2 text-xs">
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate">{d.title || d.originalName}</div>
                                <div className="text-[10px] font-mono text-[#9299A6] truncate">{d.originalName}</div>
                              </div>
                              {d.fileKey && !String(d.fileKey).startsWith('DELIV_') && (
                                <a
                                  href={resolveApiUrl(d.downloadUrl || `/files/${d.fileKey}/download`)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#FFBD55] shrink-0"
                                  title="Download Deliverable"
                                >
                                  <DownloadCloud className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {selectedItem?.kind === 'project' && (() => {
            const selectedProject = selectedItem.data;
            const clientObjId = selectedProject.clientId?._id || selectedProject.clientId;
            return (
              <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292E38]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-[10px] font-mono font-bold text-sky-300 uppercase">
                        SPRINT PROJECT
                      </span>
                      <span className="text-xs font-mono text-[#FFBD55]">{selectedProject.projectCode}</span>
                      <span className="text-xs font-mono text-[#9299A6]">
                        • Client: {selectedProject.clientId?.fullName} ({selectedProject.clientId?.email})
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white font-display">{selectedProject.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedProject.status} size="md" />
                    {clientObjId && (
                      <Link
                        to={`/admin/messages?client=${clientObjId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#D6A94F]/40 text-[11px] font-mono font-bold text-[#FFBD55]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Status State Machine Transitions */}
                <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-3">
                  <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider block">
                    Advance State Machine Status:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_STATUSES.map((st) => (
                      <button
                        key={st}
                        disabled={actionLoading || selectedProject.status === st}
                        onClick={() => handleProjectStatusChange(selectedProject._id, st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all cursor-pointer ${
                          selectedProject.status === st
                            ? 'bg-gradient-to-r from-[#D6A94F] to-[#FFBD55] text-[#050609] font-bold shadow-md'
                            : 'bg-[#080A0E] text-[#9299A6] hover:text-white border border-[#292E38] hover:border-[#D6A94F]'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-3">
                  <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider block">
                    Milestones Progress:
                  </span>
                  <div className="space-y-2">
                    {(selectedProject.milestones || []).map((m: any, idx: number) => {
                      const isDone = m.status === 'completed';
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                            isDone
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-[#11151D] border-[#292E38]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleMilestoneToggle(selectedProject._id, idx, m.status)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-500 text-white border-emerald-400'
                                  : 'bg-[#080A0E] text-[#9299A6] border-[#292E38] hover:text-white'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <div>
                              <div className={`text-xs font-bold ${isDone ? 'text-[#9299A6] line-through' : 'text-white'}`}>
                                {m.title}
                              </div>
                              {m.description && <div className="text-[11px] text-[#9299A6]">{m.description}</div>}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#9299A6] uppercase">
                            {m.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upload Deliverable Vault Form */}
                <div className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#FFBD55]" />
                    <span>Upload Deliverable Artifact (Vault Release)</span>
                  </h4>

                  <form onSubmit={(e) => handleProjectDeliverableUpload(e, selectedProject._id)} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                          Deliverable Title
                        </label>
                        <input
                          type="text"
                          value={deliverableTitle}
                          onChange={(e) => setDeliverableTitle(e.target.value)}
                          placeholder="e.g. Production Source Code v1.0"
                          className="w-full px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] text-white text-xs focus:border-[#D6A94F] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[#9299A6] uppercase mb-1">
                          Select File (.zip, .pdf, .tar.gz)
                        </label>
                        <input
                          type="file"
                          required
                          onChange={(e) => setDeliverableFile(e.target.files ? e.target.files[0] : null)}
                          className="w-full text-xs text-[#9299A6] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#D6A94F]/40 file:text-xs file:font-bold file:bg-[#080A0E] file:text-[#FFBD55] cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] transition-all cursor-pointer disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                      }}
                    >
                      {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#050609]" />}
                      <span>Upload &amp; Authorize for Client Download</span>
                    </button>
                  </form>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
