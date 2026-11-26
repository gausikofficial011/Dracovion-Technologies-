import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { getMissingPersonalDetails } from '../../utils/orderGovernance';
import {
  type ChatAttachmentFile,
  mergeMessagesById,
  uploadChatAttachment,
  useChatStream,
} from '../../hooks/useChatRealtime';
import { MessageAttachmentsList, StagedAttachmentsBar } from '../../components/chat/ChatAttachments';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Building,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  LogOut,
  ChevronDown,
  X,
  Send,
  Loader2,
  AlertCircle,
  Lock,
  Unlock,
  MessageSquare,
  FileCheck,
  PlusCircle,
  TrendingUp,
  IndianRupee,
  QrCode,
  UserCheck,
  Paperclip,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WorkspaceOrdersPage: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Status Update Modal
  const [activeModalOrder, setActiveModalOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Post Update Modal
  const [updateModalOrder, setUpdateModalOrder] = useState<any>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');
  const [updateProgress, setUpdateProgress] = useState(50);
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);

  // Chat Drawer / Modal
  const [chatModalOrder, setChatModalOrder] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [stagedChatAttachments, setStagedChatAttachments] = useState<ChatAttachmentFile[]>([]);
  const [isUploadingChatFile, setIsUploadingChatFile] = useState(false);
  const [chatModalError, setChatModalError] = useState<string | null>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const lastChatScrollRef = useRef<string>('');

  // Share Employee Payment Details Modal
  const [paymentShareOrder, setPaymentShareOrder] = useState<any>(null);
  const [shareUpiId, setShareUpiId] = useState('');
  const [shareBankAccount, setShareBankAccount] = useState('');
  const [shareIfsc, setShareIfsc] = useState('');
  const [shareHolderName, setShareHolderName] = useState('');
  const [sharePhone, setSharePhone] = useState('');
  const [shareNotes, setShareNotes] = useState('');
  const [isSharingPayment, setIsSharingPayment] = useState(false);
  const [sharePaymentError, setSharePaymentError] = useState<string | null>(null);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get<{ success: boolean; stats: any; orders: any[] }>('/orders');
      setOrders(res.orders || []);
      setStats(res.stats || null);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClaimOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/assign`, {});
      setActionSuccess('You have successfully claimed this project order! Direct contact and chat connection established.');
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to claim project.');
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalOrder) return;

    setIsUpdating(true);
    try {
      await api.patch(`/orders/${activeModalOrder._id}/status`, {
        status: newStatus,
        clientVisibleNote: clientNote,
        internalNotes: internalNote,
      });

      setActionSuccess(`Order ${activeModalOrder.orderNumber} updated! Client was notified via Gmail.`);
      setActiveModalOrder(null);
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePostUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModalOrder) return;

    setIsPostingUpdate(true);
    try {
      await api.post(`/orders/${updateModalOrder._id}/post-update`, {
        title: updateTitle,
        description: updateDesc,
        progressPercent: updateProgress,
      });
      setActionSuccess(`Project updation posted to client timeline for ${updateModalOrder.orderNumber}!`);
      setUpdateModalOrder(null);
      setUpdateTitle('');
      setUpdateDesc('');
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to post update.');
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const openUpdateModal = (order: any) => {
    setUpdateModalOrder(order);
    setUpdateTitle('');
    setUpdateDesc('');
    setUpdateProgress(order.progressPercent || 50);
  };

  const openChatModal = async (order: any) => {
    setChatModalOrder(order);
    try {
      const res = await api.get<{ success: boolean; messages: any[] }>(`/orders/${order._id}/messages`);
      setChatMessages(res.messages || []);
    } catch {
      setChatMessages([]);
    }
  };

  const { isStreamConnected: isChatStreamLive } = useChatStream(Boolean(user && chatModalOrder?._id), (evt) => {
    if (evt?.channelType === 'order' && String(evt.orderId) === String(chatModalOrder?._id) && evt.message) {
      setChatMessages((prev) => mergeMessagesById(prev, [evt.message]));
    }
  });

  // Live fallback polling inside open Direct Chat drawer
  useEffect(() => {
    if (!chatModalOrder?._id) return;
    const targetOrderId = chatModalOrder._id;
    const interval = setInterval(async () => {
      try {
        const res = await api.get<{ success: boolean; messages: any[] }>(
          `/orders/${targetOrderId}/messages`
        );
        if (Array.isArray(res?.messages)) {
          setChatMessages((prev) => mergeMessagesById(prev, res.messages));
        }
      } catch {
        // Keep drawer active on transient polling errors
      }
    }, isChatStreamLive ? 8000 : 2500);
    return () => clearInterval(interval);
  }, [chatModalOrder?._id, isChatStreamLive]);

  useEffect(() => {
    const key = `${chatModalOrder?._id || ''}:${chatMessages.length}:${chatMessages[chatMessages.length - 1]?._id || ''}`;
    if (lastChatScrollRef.current !== key) {
      lastChatScrollRef.current = key;
      if (chatFeedRef.current) {
        chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
      }
    }
  }, [chatModalOrder?._id, chatMessages]);

  const handleChatModalFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setIsUploadingChatFile(true);
    setChatModalError(null);
    try {
      const uploaded: ChatAttachmentFile[] = [];
      for (const file of list.slice(0, 5 - stagedChatAttachments.length)) {
        uploaded.push(await uploadChatAttachment(file));
      }
      setStagedChatAttachments((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      setChatModalError(err?.message || 'Failed to upload file attachment.');
    } finally {
      setIsUploadingChatFile(false);
    }
  };

  const openSharePaymentModal = (order: any) => {
    setSharePaymentError(null);
    setPaymentShareOrder(order);
    const existing = order.employeePaymentShare || {};
    const empObj =
      order.assignedEmployeeId && typeof order.assignedEmployeeId === 'object'
        ? order.assignedEmployeeId
        : user;
    setShareUpiId(existing.upiId || empObj?.upiId || '');
    setShareBankAccount(existing.bankAccount || empObj?.bankAccountNumber || '');
    setShareIfsc(existing.ifsc || empObj?.bankIfsc || '');
    setShareHolderName(existing.holderName || empObj?.fullName || '');
    setSharePhone(existing.phone || empObj?.phone || '');
    setShareNotes(existing.notes || '');
  };

  const handleSharePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentShareOrder) return;
    setSharePaymentError(null);

    if (!shareUpiId.trim() && !shareBankAccount.trim()) {
      setSharePaymentError('Provide at least a UPI ID or Bank Account Number so the client can pay directly.');
      return;
    }

    setIsSharingPayment(true);
    try {
      await api.post(`/orders/${paymentShareOrder._id}/share-payment-details`, {
        upiId: shareUpiId.trim() || undefined,
        bankAccount: shareBankAccount.trim() || undefined,
        ifsc: shareIfsc.trim() || undefined,
        holderName: shareHolderName.trim() || undefined,
        phone: sharePhone.trim() || undefined,
        notes: shareNotes.trim() || undefined,
      });
      setActionSuccess(
        `Direct payment details shared with client for ${paymentShareOrder.orderNumber}! Client payment portal is now unlocked.`
      );
      setPaymentShareOrder(null);
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setSharePaymentError(err.message || 'Failed to share payment details.');
    } finally {
      setIsSharingPayment(false);
    }
  };

  const handleVerifyHandoverPayment = async (orderId: string) => {
    setVerifyingOrderId(orderId);
    try {
      await api.post(`/orders/${orderId}/verify-handover-payment`, { verified: true });
      setActionSuccess(
        'Direct client payment verified! Handover settlement marked complete and project deliverables unlocked.'
      );
      fetchOrders();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to verify payment proof.');
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newChatMessage.trim() && stagedChatAttachments.length === 0) || !chatModalOrder || isSendingChatMessage) return;

    setIsSendingChatMessage(true);
    setChatModalError(null);
    try {
      const res = await api.post<{ success: boolean; message: any }>(`/orders/${chatModalOrder._id}/messages`, {
        content: newChatMessage.trim(),
        attachments: stagedChatAttachments.map((a) => a._id),
      });
      setChatMessages((prev) => mergeMessagesById(prev, [res.message]));
      setNewChatMessage('');
      setStagedChatAttachments([]);
    } catch (err: any) {
      setChatModalError(err.message || 'Failed to send message.');
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && order.serviceCategory !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050609]/80 backdrop-blur-sm text-white selection:bg-[#D6A94F]/30 selection:text-[#F5D18A] pb-16 relative z-10">
      {/* Top Bar */}
      <header className="w-full px-6 sm:px-10 py-4 border-b border-[#292E38] bg-[#0A0D13]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm font-extrabold font-display tracking-widest text-[#D6A94F]">
            DRACOVION<span className="text-white">®</span>
          </Link>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#15191F] border border-[#292E38] text-[#FFBD55] font-mono font-bold uppercase tracking-wider">
            WORKSPACE: {user?.role?.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {isSuperAdmin && (
            <Link
              to="/workspace/super-admin"
              className="px-3 py-1.5 rounded-xl bg-[#11151D] border border-emerald-500/40 text-emerald-400 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Super Admin Console</span>
            </Link>
          )}

          {(user?.role === 'owner' || user?.role === 'ceo' || isSuperAdmin) && (
            <Link
              to="/admin/users"
              className="px-3 py-1.5 rounded-xl bg-[#11151D] border border-rose-500/40 text-rose-300 hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Users &amp; Fraud</span>
            </Link>
          )}

          {(user?.role === 'owner' || isSuperAdmin) && (
            <Link
              to="/admin/announcements"
              className="px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#D6A94F]/40 text-[#FFBD55] hover:text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">President's Broadcast</span>
            </Link>
          )}

          <Link
            to="/admin/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-white hover:text-[#FFBD55] text-xs font-medium transition-all"
            title="Edit Profile & Picture"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'Staff'}
                className="w-5 h-5 rounded-full object-cover border border-[#D6A94F]"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FFBD55] to-[#D6A94F] text-[#050609] flex items-center justify-center font-bold text-[10px]">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
            )}
            <span className="hidden sm:inline font-mono">{user?.fullName?.split(' ')[0]}</span>
          </Link>

          <button
            onClick={() => logout()}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 hover:border-rose-700/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Success Alert Banner */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{actionSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Executive Header with Varied Typography */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#D6A94F] uppercase font-bold block">
              ENGINEERING DELIVERY COMMAND
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
              <span className="italic font-serif font-normal text-slate-300 mr-2">Client</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#FFBD55]">
                Project Orders
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#9299A6]">
              Claim client orders, share direct handover settlement details, post live updates, and release project deliverables.
            </p>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9299A6] block font-semibold">Total Orders</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFBD55] block font-semibold">Unassigned (To Claim)</span>
              <div className="text-2xl font-bold font-mono text-[#FFBD55] mt-1">{stats.unassigned}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#78BFFF] block font-semibold">Active Development</span>
              <div className="text-2xl font-bold font-mono text-[#78BFFF] mt-1">{stats.inProgress}</div>
            </div>
            <div className="p-5 rounded-2xl bg-[#080A0E] border border-[#292E38]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-semibold">Completed Handover</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.completed}</div>
            </div>
          </div>
        )}

        {/* Status Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-[#080A0E] border border-[#292E38]">
          <span className="text-xs font-mono text-[#9299A6] flex items-center gap-1.5 px-2">
            <Filter className="w-3.5 h-3.5 text-[#D6A94F]" />
            <span>Filter Status:</span>
          </span>

          {['all', 'submitted', 'reviewing', 'in_progress', 'delivered', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-semibold transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-[#FFBD55] text-[#080A0E]'
                  : 'bg-[#15191F] text-[#9299A6] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Orders List / Cards */}
        {isLoading ? (
          <div className="p-16 text-center text-xs font-mono text-[#9299A6]">
            Fetching platform orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#080A0E] border border-[#292E38] text-center space-y-2">
            <Layers className="w-8 h-8 text-[#9299A6] mx-auto" />
            <div className="text-sm font-bold text-white font-display">No Orders Found</div>
            <div className="text-xs text-[#9299A6]">There are no client orders matching the current filter.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map((order) => {
              const isAssignedToMe = order.assignedEmployeeId?._id === user?.id || order.assignedEmployeeId === user?.id;
              const isUnassigned = !order.assignedEmployeeId;

              return (
                <div
                  key={order._id}
                  className="p-6 sm:p-7 rounded-3xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F]/60 transition-all space-y-5 shadow-2xl relative overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#292E38]/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-[#FFBD55] bg-[#11151D] px-3 py-1 rounded-lg border border-[#292E38]">
                        {order.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#15191F] border border-[#292E38] text-[10px] font-mono text-[#78BFFF] uppercase font-bold">
                        {order.serviceCategory.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-[#9299A6]">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono uppercase font-bold border ${
                          order.status === 'completed' || order.status === 'delivered'
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-400'
                            : order.status === 'in_progress'
                            ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                            : 'bg-[#11151D] border border-[#D6A94F]/50 text-[#FFBD55]'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                      <h3 className="text-lg font-bold font-display text-white">{order.projectTitle}</h3>
                      <p className="text-xs text-[#B7BBC4] leading-relaxed">{order.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2">
                        <span className="text-[#FFBD55] font-semibold">Budget: {order.estimatedBudget || 'Flexible'}</span>
                        <span className="text-slate-400">Deadline: {order.preferredDeadline || '30 days'}</span>
                        <span className="text-amber-400 uppercase font-bold">Priority: {order.priority}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[11px] font-mono text-[#9299A6] mb-1">
                          <span>Sprint Progress</span>
                          <span className="text-[#FFBD55] font-bold">{order.progressPercent || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#11151D] overflow-hidden border border-[#292E38]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${order.progressPercent || 0}%`,
                              background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Client & Assigned Column */}
                    <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-3 text-xs">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                          <span className="text-[#D6A94F] uppercase">Client Information</span>
                          {order.clientId?.accountType === 'student' || order.clientId?.collegeOrUniversity ? (
                            <span className="px-2 py-0.5 rounded bg-[#FFBD55]/20 text-[#FFBD55] border border-[#FFBD55]/30">
                              🎓 Student
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#78BFFF]/20 text-[#78BFFF] border border-[#78BFFF]/30">
                              🏢 Company
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white mt-1 text-sm">{order.clientId?.fullName || 'Client'}</div>
                        <div className="text-[11px] text-[#9299A6] font-mono">{order.clientId?.email}</div>
                        {order.clientId?.phone && (
                          <div className="text-[11px] text-emerald-400 font-mono mt-0.5 font-semibold">
                            📱 {order.clientId.phone}
                          </div>
                        )}
                        {(order.clientId?.collegeOrUniversity || order.clientId?.companyName) && (
                          <div className="text-[11px] text-[#FFBD55] font-semibold mt-1">
                            {order.clientId?.collegeOrUniversity || order.clientId?.companyName}
                            {order.clientId?.department ? ` • ${order.clientId.department}` : ''}
                            {order.clientId?.academicYear ? ` (${order.clientId.academicYear})` : ''}
                          </div>
                        )}
                        {order.clientId?.city && (
                          <div className="text-[10px] text-[#9299A6] font-mono">
                            📍 {order.clientId.city}
                          </div>
                        )}

                        {(() => {
                          const missingPersonal = getMissingPersonalDetails(order.clientId, order);
                          return (
                            <div
                              className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono ${
                                missingPersonal.length === 0
                                  ? 'bg-[#52D69A]/10 border-[#52D69A]/30 text-[#52D69A]'
                                  : 'bg-red-500/10 border-red-500/30 text-red-300'
                              }`}
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>
                                {missingPersonal.length === 0
                                  ? 'Personal Details Verified'
                                  : `Missing: ${missingPersonal.join(', ')} — Allocation Blocked`}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="pt-2 border-t border-[#292E38]">
                        <div className="text-[10px] font-mono text-[#D6A94F] uppercase font-bold">Assigned Lead Engineer</div>
                        {order.assignedEmployeeId ? (
                          <div className="mt-1 space-y-0.5">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#52D69A]" />
                              <span>{order.assignedEmployeeId.fullName}</span>
                            </div>
                            <div className="text-[11px] text-[#78BFFF] font-mono">
                              Contact: {order.assignedEmployeeId.phone || 'Via Workspace Chat'}
                            </div>
                            <div className="text-[10px] font-mono mt-1">
                              {order.employeePaymentShare?.sharedAt ? (
                                <span className="text-[#52D69A]">
                                  ✓ Direct payment shared ({order.employeePaymentShare.upiId || 'Bank'})
                                </span>
                              ) : (
                                <span className="text-amber-300">
                                  ⏳ Payment details not shared yet (Client payment locked)
                                </span>
                              )}
                            </div>
                            {order.handoverPaymentProof?.submittedAt && (
                              <div className="text-[10px] font-mono text-[#78BFFF] mt-0.5">
                                Paid ₹{Number(order.handoverPaymentProof.amountRupees || 0).toLocaleString()} • UTR:{' '}
                                {order.handoverPaymentProof.transactionRef} ({order.handoverPaymentProof.verificationStatus})
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-amber-400 font-mono mt-1 font-bold">
                            Unassigned — Available to Claim
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#292E38]/80 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const missingPersonal = getMissingPersonalDetails(order.clientId, order);
                        const isPersonalComplete = missingPersonal.length === 0;
                        const assignedId =
                          order.assignedEmployeeId?._id || order.assignedEmployeeId || null;
                        const canManageHandover =
                          isSuperAdmin ||
                          user?.role === 'owner' ||
                          user?.role === 'ceo' ||
                          (assignedId && assignedId === user?.id);

                        return (
                          <>
                            {isUnassigned ? (
                              <button
                                type="button"
                                disabled={!isPersonalComplete}
                                title={
                                  isPersonalComplete
                                    ? 'Claim and allocate this project'
                                    : `Allocation blocked until client provides: ${missingPersonal.join(', ')}`
                                }
                                onClick={() => handleClaimOrder(order._id)}
                                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-md cursor-pointer hover:scale-[1.02] transition-transform disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{
                                  background: isPersonalComplete
                                    ? 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)'
                                    : 'linear-gradient(90deg, #4B5563 0%, #6B7280 100%)',
                                }}
                              >
                                {isPersonalComplete
                                  ? 'Claim / Self-Assign Project'
                                  : 'Allocation Locked (Details Missing)'}
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openUpdateModal(order)}
                                  className="px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#78BFFF] text-slate-200 hover:text-white font-mono text-[11px] flex items-center gap-1.5 cursor-pointer"
                                >
                                  <TrendingUp className="w-3.5 h-3.5 text-[#78BFFF]" />
                                  <span>Post Live Updation</span>
                                </button>

                                {canManageHandover && (
                                  <button
                                    type="button"
                                    onClick={() => openSharePaymentModal(order)}
                                    className="px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#FFBD55]/45 hover:border-[#FFBD55] text-[#FFBD55] hover:text-white font-mono text-[11px] flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span>
                                      {order.employeePaymentShare?.sharedAt
                                        ? 'Update Shared Payment'
                                        : 'Share Payment Details'}
                                    </span>
                                  </button>
                                )}

                                {canManageHandover &&
                                  order.handoverStatus === 'payment_submitted' && (
                                    <button
                                      type="button"
                                      disabled={verifyingOrderId === order._id}
                                      onClick={() => handleVerifyHandoverPayment(order._id)}
                                      className="px-3 py-1.5 rounded-xl bg-[#52D69A]/15 border border-[#52D69A]/50 hover:bg-[#52D69A]/25 text-[#52D69A] font-mono text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>
                                        {verifyingOrderId === order._id
                                          ? 'Verifying...'
                                          : 'Verify Payment & Unlock Deliverables'}
                                      </span>
                                    </button>
                                  )}
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => openChatModal(order)}
                              className="px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#52D69A] text-slate-200 hover:text-white font-mono text-[11px] flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#52D69A]" />
                              <span>Direct Chat Line</span>
                            </button>
                          </>
                        );
                      })()}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalOrder(order);
                        setNewStatus(order.status);
                        setClientNote(order.clientVisibleNote || '');
                        setInternalNote(order.internalNotes || '');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#15191F] border border-[#D6A94F]/60 text-[#FFBD55] hover:border-[#FFBD55] font-semibold text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Update Status &amp; Notify</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 1. Post Live Project Updation Modal */}
      <AnimatePresence>
        {updateModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-[#080A0E] border-[1.5px] border-[#78BFFF] p-7 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#292E38] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#78BFFF] uppercase font-bold">
                    SPRINT TELEMETRY UPDATE
                  </span>
                  <h3 className="text-lg font-bold font-display text-white">Post Project Update</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setUpdateModalOrder(null)}
                  className="p-1 rounded-lg text-[#9299A6] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                    Update Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="e.g. Completed Payment Gateway & Auth Integration"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#78BFFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                    Detailed Sprint Engineering Notes *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={updateDesc}
                    onChange={(e) => setUpdateDesc(e.target.value)}
                    placeholder="Describe specific modules completed, current testing status, and upcoming milestones..."
                    className="w-full p-3 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#78BFFF] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>Overall Project Progress Percentage</span>
                    <span className="text-[#FFBD55] font-bold">{updateProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={updateProgress}
                    onChange={(e) => setUpdateProgress(Number(e.target.value))}
                    className="w-full accent-[#FFBD55] cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isPostingUpdate}
                    className="flex-1 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#080A0E] flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, #78BFFF 0%, #52D69A 100%)',
                    }}
                  >
                    {isPostingUpdate ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#080A0E]" />
                    ) : (
                      <span>Broadcast Update to Client</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpdateModalOrder(null)}
                    className="px-5 py-3 rounded-xl bg-[#15191F] border border-[#292E38] text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Status Update Modal */}
      <AnimatePresence>
        {activeModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-[#080A0E] border-[1.5px] border-[#D6A94F] p-7 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#292E38] pb-3">
                <div>
                  <div className="text-[10px] font-mono text-[#FFBD55] uppercase font-bold">
                    ORDER #{activeModalOrder.orderNumber}
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">Update Status</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalOrder(null)}
                  className="p-1 rounded-lg text-[#9299A6] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Select New Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none capitalize"
                  >
                    <option value="submitted">Submitted (Awaiting Triage)</option>
                    <option value="reviewing">Reviewing (Technical Scope Evaluation)</option>
                    <option value="quoted">Quoted (Quotation Generated)</option>
                    <option value="in_progress">In Progress (Active Development)</option>
                    <option value="delivered">Delivered (Handover to Client)</option>
                    <option value="completed">Completed (Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Client-Visible Note (Emailed to Client via Gmail)
                  </label>
                  <textarea
                    rows={3}
                    value={clientNote}
                    onChange={(e) => setClientNote(e.target.value)}
                    placeholder="e.g. Architecture sprint commenced. Database models and API gateways are fully scaffolded."
                    className="w-full p-3 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Internal Engineering Notes (Staff-Only)
                  </label>
                  <textarea
                    rows={2}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Private technical notes between employees, CEO, and owner..."
                    className="w-full p-3 rounded-xl bg-[#15191F] border border-[#353941] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#080A0E] flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                    }}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#080A0E]" />
                        <span>Updating &amp; Emailing Client...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#080A0E]" />
                        <span>Apply &amp; Notify Client</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalOrder(null)}
                    className="px-5 py-3 rounded-xl bg-[#15191F] border border-[#292E38] text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Direct Chat Line Drawer Modal */}
      <AnimatePresence>
        {chatModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-3xl bg-[#080A0E] border-[1.5px] border-[#52D69A] p-6 space-y-4 shadow-2xl relative flex flex-col h-[600px] max-h-[85dvh] min-h-0 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-[#292E38] pb-3 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    SECURE CLIENT CHANNEL
                  </span>
                  <h3 className="text-base font-bold font-display text-white">
                    Chat: {chatModalOrder.projectTitle} ({chatModalOrder.orderNumber})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setChatModalOrder(null)}
                  className="p-1 rounded-lg text-[#9299A6] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages stream */}
              {chatModalError && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-[11px] text-rose-200 flex items-center justify-between shrink-0">
                  <span>{chatModalError}</span>
                  <button type="button" onClick={() => setChatModalError(null)} className="text-[10px] font-mono uppercase cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              <div ref={chatFeedRef} data-lenis-prevent className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1 pt-1">
                {chatMessages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[#9299A6]">
                    No messages recorded yet. Start the conversation with the client below.
                  </div>
                ) : (
                  chatMessages.map((msg: any) => {
                    const senderId = String(msg.senderId?._id || msg.senderId || '');
                    const currentUserId = String(user?.id || (user as any)?._id || '');
                    const isMe = Boolean(currentUserId && senderId === currentUserId);
                    return (
                      <div
                        key={msg._id}
                        className={`p-3 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                          isMe
                            ? 'ml-auto bg-[#11151D] border border-emerald-500/40 text-white'
                            : 'mr-auto bg-[#0A0D13] border border-[#292E38] text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-[#9299A6]">
                          <span className="font-bold text-[#FFBD55]">
                            {msg.senderId?.fullName || 'User'} ({msg.senderId?.role || 'User'})
                          </span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                        <MessageAttachmentsList attachments={msg.attachments} />
                      </div>
                    );
                  })
                )}
              </div>

              <StagedAttachmentsBar
                files={stagedChatAttachments}
                onRemove={(attId) => setStagedChatAttachments((prev) => prev.filter((f) => f._id !== attId))}
              />

              {/* Chat Composer */}
              <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-[#292E38] flex gap-2 shrink-0">
                <input
                  ref={chatFileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleChatModalFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  disabled={isUploadingChatFile || stagedChatAttachments.length >= 5}
                  title="Attach file or paste screenshot"
                  className="px-3 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-emerald-500/60 text-[#9299A6] hover:text-emerald-300 disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
                >
                  {isUploadingChatFile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  onPaste={(e) => {
                    if (e.clipboardData?.files?.length) {
                      e.preventDefault();
                      handleChatModalFiles(e.clipboardData.files);
                    }
                  }}
                  placeholder="Type direct response or paste screenshot..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSendingChatMessage || isUploadingChatFile || (!newChatMessage.trim() && stagedChatAttachments.length === 0)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#050609] transition-transform hover:scale-105 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                  style={{
                    background: 'linear-gradient(90deg, #52D69A 0%, #25D366 100%)',
                  }}
                >
                  {isSendingChatMessage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#050609]" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5 text-[#050609]" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Share Employee Direct Payment Details Modal (Portaled to body) */}
      {paymentShareOrder &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl bg-[#080A0E] border-[1.5px] border-[#FFBD55] p-6 sm:p-7 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-[#292E38] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#FFBD55] uppercase font-bold">
                    DIRECT CLIENT SETTLEMENT AUTHORIZATION
                  </span>
                  <h3 className="text-lg font-bold font-display text-white">
                    Share Payment Details ({paymentShareOrder.orderNumber})
                  </h3>
                  <p className="text-[11px] font-mono text-[#9299A6] mt-0.5">
                    Only once you share these details can the client pay you directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentShareOrder(null)}
                  className="p-1.5 rounded-lg text-[#9299A6] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sharePaymentError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300">
                  {sharePaymentError}
                </div>
              )}

              <form onSubmit={handleSharePaymentSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9299A6] mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={shareHolderName}
                      onChange={(e) => setShareHolderName(e.target.value)}
                      placeholder="Payee full name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9299A6] mb-1">
                      Employee Contact Phone
                    </label>
                    <input
                      type="text"
                      value={sharePhone}
                      onChange={(e) => setSharePhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9299A6] mb-1">
                    UPI ID (GPay / PhonePe / Paytm)
                  </label>
                  <input
                    type="text"
                    value={shareUpiId}
                    onChange={(e) => setShareUpiId(e.target.value)}
                    placeholder="e.g. engineer@okaxis"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white focus:border-[#FFBD55] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9299A6] mb-1">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={shareBankAccount}
                      onChange={(e) => setShareBankAccount(e.target.value)}
                      placeholder="Account number (if bank transfer)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9299A6] mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={shareIfsc}
                      onChange={(e) => setShareIfsc(e.target.value)}
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white focus:border-[#FFBD55] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9299A6] mb-1">
                    Milestone / Settlement Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={shareNotes}
                    onChange={(e) => setShareNotes(e.target.value)}
                    placeholder="Agreed bid amount, milestone note, or transfer reference instruction..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white focus:border-[#FFBD55] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentShareOrder(null)}
                    className="px-4 py-2 rounded-xl border border-[#292E38] text-[#9299A6] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSharingPayment}
                    className="px-5 py-2.5 rounded-xl font-bold text-[#050609] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                    }}
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>
                      {isSharingPayment
                        ? 'Sharing & Unlocking...'
                        : 'Share Payment Details & Unlock Client Pay'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
