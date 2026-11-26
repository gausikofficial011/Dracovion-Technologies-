import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, resolveApiUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  User,
  Building,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Phone,
  MessageSquare,
  QrCode,
  Download,
  Lock,
  Unlock,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  Paperclip,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type ChatAttachmentFile,
  mergeMessagesById,
  uploadChatAttachment,
  useChatStream,
} from '../../hooks/useChatRealtime';
import { MessageAttachmentsList, StagedAttachmentsBar } from '../../components/chat/ChatAttachments';

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Order Submitted' },
  { key: 'reviewing', label: 'Technical Review' },
  { key: 'quoted', label: 'Quotation Prepared' },
  { key: 'in_progress', label: 'Active Development' },
  { key: 'delivered', label: 'Handover & Settlement' },
  { key: 'completed', label: 'Project Closed' },
];

import { getMissingPersonalDetails } from '../../utils/orderGovernance';
import {
  UserCheck as GovUserCheck,
  Ban as GovBan,
  Copy as GovCopy,
  RefreshCw as GovRefreshCw,
  Lock as GovLock,
  Unlock as GovUnlock,
  IndianRupee as GovIndianRupee,
  QrCode as GovQrCode,
  CheckCircle2 as GovCheckCircle2,
  AlertCircle as GovAlertCircle,
  ShieldCheck as GovShieldCheck,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, updateProfile, refreshUser } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachmentFile[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const lastScrolledMsgRef = useRef<string>('');

  // Governance: Personal details + direct employee payment settlement state
  const [govFullName, setGovFullName] = useState('');
  const [govPhone, setGovPhone] = useState('');
  const [govCity, setGovCity] = useState('');
  const [govState, setGovState] = useState('');
  const [govWorkAddress, setGovWorkAddress] = useState('');
  const [isSavingPersonalDetails, setIsSavingPersonalDetails] = useState(false);
  const [personalDetailsError, setPersonalDetailsError] = useState<string | null>(null);
  const [personalDetailsSuccess, setPersonalDetailsSuccess] = useState<string | null>(null);

  const [paymentAmountRupees, setPaymentAmountRupees] = useState('');
  const [paymentTransactionRef, setPaymentTransactionRef] = useState('');
  const [isSubmittingDirectPayment, setIsSubmittingDirectPayment] = useState(false);
  const [directPaymentError, setDirectPaymentError] = useState<string | null>(null);
  const [directPaymentSuccess, setDirectPaymentSuccess] = useState<string | null>(null);
  const [copiedPaymentField, setCopiedPaymentField] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get<{ success: boolean; order: any }>(`/orders/${id}`);
      setOrder(res.order);
      if (res.order) {
        fetchMessages(res.order.orderNumber || res.order._id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Order not found.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (orderIdentifier: string) => {
    try {
      const res = await api.get<{ success: boolean; messages: any[] }>(`/orders/${orderIdentifier}/messages`);
      setMessages(res.messages || []);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  // Pre-fill personal details verification form from order snapshot or active user
  useEffect(() => {
    const clientSource = order?.clientId && typeof order.clientId === 'object' ? order.clientId : user;
    const detailSnapshot = order?.clientPersonalDetails;
    setGovFullName((prev) => prev || detailSnapshot?.fullName || clientSource?.fullName || '');
    setGovPhone((prev) => prev || detailSnapshot?.phone || clientSource?.phone || '');
    setGovCity((prev) => prev || detailSnapshot?.city || clientSource?.city || '');
    setGovState((prev) => prev || detailSnapshot?.state || clientSource?.state || '');
    setGovWorkAddress((prev) => prev || detailSnapshot?.address || clientSource?.workAddress || '');
  }, [order, user]);

  // Silent background polling (every 5s) for real-time Direct Chat + employee payment share updates
  const syncOrderAndMessages = async (showSpinner = false) => {
    if (!id) return;
    if (showSpinner) setIsManualSyncing(true);
    try {
      const orderRes = await api.get<{ success: boolean; order: any }>(`/orders/${id}`);
      if (orderRes?.order) {
        setOrder(orderRes.order);
        const orderTarget = orderRes.order._id || id;
        const msgRes = await api.get<{ success: boolean; messages: any[] }>(
          `/orders/${orderTarget}/messages`
        );
        if (Array.isArray(msgRes?.messages)) {
          setMessages(msgRes.messages);
        }
      }
    } catch {
      // Keep UI quiet on transient background polling ticks
    } finally {
      if (showSpinner) setIsManualSyncing(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      syncOrderAndMessages(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCopyPaymentField = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedPaymentField(label);
      setTimeout(() => setCopiedPaymentField(null), 2000);
    } catch {
      setCopiedPaymentField(null);
    }
  };

  const handleSavePersonalDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalDetailsError(null);
    setPersonalDetailsSuccess(null);

    const missing = getMissingPersonalDetails({
      fullName: govFullName.trim(),
      phone: govPhone.trim(),
      city: govCity.trim(),
    });
    if (missing.length > 0) {
      setPersonalDetailsError(`Please complete required personal details: ${missing.join(', ')}.`);
      return;
    }

    setIsSavingPersonalDetails(true);
    try {
      await updateProfile({
        fullName: govFullName.trim(),
        phone: govPhone.trim(),
        city: govCity.trim(),
        state: govState.trim() || undefined,
        workAddress: govWorkAddress.trim() || undefined,
      });
      await refreshUser();
      await syncOrderAndMessages(false);
      setPersonalDetailsSuccess(
        'Personal details saved and verified. Engineering team can now allocate this project.'
      );
    } catch (err: any) {
      setPersonalDetailsError(err.message || 'Unable to save personal details.');
    } finally {
      setIsSavingPersonalDetails(false);
    }
  };

  const handleSubmitDirectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setDirectPaymentError(null);
    setDirectPaymentSuccess(null);

    const parsedAmount = Number(paymentAmountRupees);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setDirectPaymentError('Please enter a valid payment amount in INR greater than ₹0.');
      return;
    }
    if (paymentTransactionRef.trim().length < 4) {
      setDirectPaymentError('Please enter a valid UPI / UTR / Bank transaction reference.');
      return;
    }

    setIsSubmittingDirectPayment(true);
    try {
      const res = await api.post<{ success: boolean; message: string; order: any }>(
        `/orders/${order._id}/submit-handover-payment`,
        {
          amountRupees: parsedAmount,
          transactionRef: paymentTransactionRef.trim(),
        }
      );
      setOrder(res.order);
      setDirectPaymentSuccess(
        res.message || 'Direct payment proof submitted to your assigned engineer for verification.'
      );
      setPaymentTransactionRef('');
      await syncOrderAndMessages(false);
    } catch (err: any) {
      setDirectPaymentError(err.message || 'Payment submission blocked by governance check.');
    } finally {
      setIsSubmittingDirectPayment(false);
    }
  };

  useEffect(() => {
    const key = `${order?._id || ''}:${messages.length}:${messages[messages.length - 1]?._id || ''}`;
    if (lastScrolledMsgRef.current !== key) {
      lastScrolledMsgRef.current = key;
      if (chatFeedRef.current) {
        chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
      }
    }
  }, [order?._id, messages]);

  const { isStreamConnected: isChatStreamLive } = useChatStream(Boolean(user && order?._id), (evt) => {
    if (evt?.channelType === 'order' && String(evt.orderId) === String(order?._id) && evt.message) {
      setMessages((prev) => mergeMessagesById(prev, [evt.message]));
    }
  });

  const handleChatFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setIsUploadingAttachment(true);
    setChatError(null);
    try {
      const uploaded: ChatAttachmentFile[] = [];
      for (const file of list.slice(0, 5 - stagedAttachments.length)) {
        uploaded.push(await uploadChatAttachment(file));
      }
      setStagedAttachments((prev) => [...prev, ...uploaded]);
    } catch (err: any) {
      setChatError(err?.message || 'Failed to upload attachment.');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && stagedAttachments.length === 0) || !order || isSendingMessage) return;

    setIsSendingMessage(true);
    setChatError(null);
    try {
      const res = await api.post<{ success: boolean; message: any }>(`/orders/${order._id}/messages`, {
        content: newMessage.trim(),
        attachments: stagedAttachments.map((a) => a._id),
      });
      setMessages((prev) => mergeMessagesById(prev, [res.message]));
      setNewMessage('');
      setStagedAttachments([]);
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050609] text-white flex items-center justify-center font-mono text-xs text-[#9299A6]">
        Loading order details and engineer connection...
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="min-h-screen bg-[#050609] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400" />
        <h2 className="text-lg font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-[#9299A6]">{errorMessage || 'Unable to locate order.'}</p>
        <Link to="/portal/dashboard" className="text-xs text-[#FFBD55] hover:underline">
          ← Return to Client Dashboard
        </Link>
      </div>
    );
  }

  const currentStepIdx = TIMELINE_STEPS.findIndex((s) => s.key === order.status);
  const employeePhone = order.employeePaymentShare?.phone || order.assignedEmployeeId?.phone || '+91 9489832249';
  const cleanPhoneForWa = employeePhone.replace(/[^0-9]/g, '');
  const isHandoverCleared = order.handoverStatus === 'handover_completed';

  return (
    <div className="min-h-screen bg-[#050609] text-white selection:bg-[#D6A94F]/30 selection:text-[#F5D18A] pb-16">
      {/* Top Header */}
      <header className="w-full px-6 sm:px-10 py-4 border-b border-[#292E38] bg-[#0A0D13]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <Link
          to="/portal/dashboard"
          className="group inline-flex items-center gap-2 text-xs font-mono text-[#9299A6] hover:text-[#FFBD55] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#D6A94F]" />
          <span className="font-semibold uppercase tracking-wider">Back to Dashboard</span>
        </Link>

        <span className="font-mono text-xs text-[#FFBD55] font-bold tracking-widest bg-[#11151D] px-3 py-1 rounded-lg border border-[#292E38]">
          {order.orderNumber}
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title & Scope Card with Rich Multi-Word Typography */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#D6A94F]/40 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-[#FFBD55] font-extrabold tracking-[0.2em] uppercase">
              PROJECT ORDER #{order.orderNumber}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-600 text-emerald-400 text-xs font-mono uppercase font-bold tracking-wider">
              Status: {order.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#9299A6] block font-semibold">
              SPECIFICATION DETAILS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              <span className="italic font-serif font-normal text-slate-300 mr-2">Order:</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#F5D18A]">
                {order.projectTitle}
              </span>
            </h1>
          </div>

          <p className="relative z-10 text-xs sm:text-sm text-[#B7BBC4] leading-relaxed max-w-3xl">
            {order.description}
          </p>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#292E38]/80 text-xs">
            <div className="p-2.5 rounded-xl bg-[#11151D] border border-[#292E38]">
              <div className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider font-semibold">Category</div>
              <div className="text-white font-medium capitalize mt-0.5">{order.serviceCategory.replace(/_/g, ' ')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#11151D] border border-[#292E38]">
              <div className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider font-semibold">Target Budget</div>
              <div className="text-[#FFBD55] font-mono font-bold mt-0.5">{order.estimatedBudget || 'Flexible'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#11151D] border border-[#292E38]">
              <div className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider font-semibold">Delivery Target</div>
              <div className="text-slate-200 mt-0.5">{order.preferredDeadline || '30 days'}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#11151D] border border-[#292E38]">
              <div className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider font-semibold">Priority</div>
              <div className="text-amber-400 font-mono uppercase font-bold mt-0.5">{order.priority}</div>
            </div>
          </div>
        </div>

        {/* 1. ASSIGNED LEAD ENGINEER & DIRECT CONTACT DESK */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#292E38]">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#FFBD55]" />
              <span>Assigned Lead Engineer & Direct Communication</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Direct Contact Line
            </span>
          </div>

          {order.assignedEmployeeId ? (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 rounded-2xl bg-[#11151D] border border-[#292E38]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#080A0E] border border-[#D6A94F]/40 flex items-center justify-center text-[#FFBD55] font-bold text-lg shadow-inner">
                  {order.assignedEmployeeId.fullName.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-widest font-bold">
                    LEAD DELIVERY ARCHITECT
                  </span>
                  <div className="text-base font-bold text-white font-display">
                    {order.assignedEmployeeId.fullName}
                  </div>
                  <div className="text-xs text-[#9299A6]">
                    {order.assignedEmployeeId.designation || 'Senior Full Stack Lead'} • {order.assignedEmployeeId.email}
                  </div>
                </div>
              </div>

              {/* Direct Phone Call & WhatsApp CTAs */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <a
                  href={`tel:${employeePhone}`}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#080A0E] border border-[#292E38] hover:border-[#FFBD55] text-xs font-mono font-bold text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#52D69A]" />
                  <span>{employeePhone}</span>
                </a>

                <a
                  href={`https://wa.me/${cleanPhoneForWa}?text=Hello%20${encodeURIComponent(order.assignedEmployeeId.fullName)},%20I%20am%20inquiring%20about%20my%20Dracovion%20project%20${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] transition-transform hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(90deg, #52D69A 0%, #25D366 100%)',
                  }}
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#050609]" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] text-center space-y-2 text-xs text-[#9299A6]">
              <Clock className="w-8 h-8 text-[#FFBD55] mx-auto animate-pulse" />
              <div className="text-sm font-bold text-white font-display">Technical Review & Engineering Assignment in Progress</div>
              <p className="max-w-md mx-auto text-[#9299A6]">
                Our CEO, Owner, and Lead Engineers have received your project. A designated engineer will verify your personal details, claim this order, and coordinate directly with you via live chat.
              </p>
            </div>
          )}
        </div>

        {/* DIRECT PAYMENT & ALLOCATION GOVERNANCE SECTION */}
        {(() => {
          const clientObj =
            order.clientId && typeof order.clientId === 'object' ? order.clientId : user;
          const missingPersonal = getMissingPersonalDetails(clientObj, order);
          const hasPersonalDetails = missingPersonal.length === 0;
          const isAllocated = Boolean(order.assignedEmployeeId);
          const share = order.employeePaymentShare;
          const hasSharedPayment = Boolean(
            share?.sharedAt && (share?.upiId || share?.bankAccount)
          );
          const isPaymentUnlocked =
            hasPersonalDetails && isAllocated && hasSharedPayment;
          const proof = order.handoverPaymentProof;
          const isHandoverDone = order.handoverStatus === 'handover_completed';

          return (
            <div className="rounded-3xl bg-[#0B0D13] border border-[#222732] p-6 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222732] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      isPaymentUnlocked
                        ? 'bg-[#52D69A]/15 border-[#52D69A]/40 text-[#52D69A]'
                        : 'bg-[#FFBD55]/10 border-[#FFBD55]/30 text-[#FFBD55]'
                    }`}
                  >
                    {isPaymentUnlocked ? (
                      <GovUnlock className="w-5 h-5" />
                    ) : (
                      <GovLock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white font-display">
                      Direct Employee Payment & Allocation Governance
                    </h2>
                    <p className="text-xs font-mono text-[#9299A6]">
                      Personal Details → Engineer Allocation → Employee Payment Share → Direct Settlement
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => syncOrderAndMessages(true)}
                    disabled={isManualSyncing}
                    className="px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#78BFFF] text-xs font-mono text-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <GovRefreshCw
                      className={`w-3.5 h-3.5 text-[#78BFFF] ${isManualSyncing ? 'animate-spin' : ''}`}
                    />
                    <span>Live Sync</span>
                  </button>
                  <span
                    className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider border ${
                      isHandoverDone
                        ? 'bg-[#52D69A]/15 border-[#52D69A]/40 text-[#52D69A]'
                        : isPaymentUnlocked
                        ? 'bg-[#78BFFF]/15 border-[#78BFFF]/40 text-[#78BFFF]'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {isHandoverDone
                      ? 'Verified & Settled'
                      : isPaymentUnlocked
                      ? 'Direct Payment Unlocked'
                      : 'Payment Locked'}
                  </span>
                </div>
              </div>

              {/* 3-Gate Live Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    hasPersonalDetails
                      ? 'bg-[#52D69A]/10 border-[#52D69A]/30 text-[#52D69A]'
                      : 'bg-[#11151D] border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div className="font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    {hasPersonalDetails ? (
                      <GovCheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <GovAlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span>1. Personal Details</span>
                  </div>
                  <p className="text-[11px] text-[#A6AEBC]">
                    {hasPersonalDetails
                      ? 'Name, phone, and city verified for project allocation.'
                      : `Missing: ${missingPersonal.join(', ')}`}
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    isAllocated
                      ? 'bg-[#52D69A]/10 border-[#52D69A]/30 text-[#52D69A]'
                      : 'bg-[#11151D] border-[#292E38] text-[#9299A6]'
                  }`}
                >
                  <div className="font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    {isAllocated ? (
                      <GovCheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <GovLock className="w-3.5 h-3.5" />
                    )}
                    <span>2. Project Allocated</span>
                  </div>
                  <p className="text-[11px] text-[#A6AEBC]">
                    {isAllocated
                      ? 'Designated engineer assigned and active in Direct Chat.'
                      : hasPersonalDetails
                      ? 'Awaiting engineer claim in Dracovion Workspace.'
                      : 'Blocked until personal details are completed.'}
                  </p>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    hasSharedPayment
                      ? 'bg-[#52D69A]/10 border-[#52D69A]/30 text-[#52D69A]'
                      : 'bg-[#11151D] border-[#292E38] text-[#9299A6]'
                  }`}
                >
                  <div className="font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    {hasSharedPayment ? (
                      <GovCheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <GovLock className="w-3.5 h-3.5" />
                    )}
                    <span>3. Employee Payment Share</span>
                  </div>
                  <p className="text-[11px] text-[#A6AEBC]">
                    {hasSharedPayment
                      ? `Shared on ${new Date(share.sharedAt).toLocaleDateString()}`
                      : 'Client may pay only after assigned engineer shares payment details.'}
                  </p>
                </div>
              </div>

              {/* Inline Personal Details Form if Missing */}
              {!hasPersonalDetails && (
                <form
                  onSubmit={handleSavePersonalDetails}
                  className="p-5 rounded-2xl bg-[#11151D] border border-amber-500/35 space-y-4"
                >
                  <div className="flex items-start gap-2.5 text-xs text-amber-200">
                    <GovUserCheck className="w-4 h-4 text-[#FFBD55] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">
                        Complete Your Personal Details to Unlock Allocation
                      </div>
                      <p className="text-[11px] font-mono text-[#9299A6] mt-0.5">
                        Projects cannot be allocated to an engineer and payments remain blocked until your Full Name, Phone Number, and City are verified.
                      </p>
                    </div>
                  </div>

                  {personalDetailsError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300">
                      {personalDetailsError}
                    </div>
                  )}
                  {personalDetailsSuccess && (
                    <div className="p-3 rounded-xl bg-[#52D69A]/10 border border-[#52D69A]/30 text-xs font-mono text-[#52D69A]">
                      {personalDetailsSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={govFullName}
                      onChange={(e) => setGovFullName(e.target.value)}
                      placeholder="Full Name *"
                      required
                      className="px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-[#292E38] text-xs text-white focus:outline-none focus:border-[#FFBD55]/60"
                    />
                    <input
                      type="tel"
                      value={govPhone}
                      onChange={(e) => setGovPhone(e.target.value)}
                      placeholder="Valid Phone Number *"
                      required
                      className="px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-[#292E38] text-xs text-white focus:outline-none focus:border-[#FFBD55]/60"
                    />
                    <input
                      type="text"
                      value={govCity}
                      onChange={(e) => setGovCity(e.target.value)}
                      placeholder="City / Location *"
                      required
                      className="px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-[#292E38] text-xs text-white focus:outline-none focus:border-[#FFBD55]/60"
                    />
                    <input
                      type="text"
                      value={govState}
                      onChange={(e) => setGovState(e.target.value)}
                      placeholder="State / Province"
                      className="px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-[#292E38] text-xs text-white focus:outline-none focus:border-[#FFBD55]/60"
                    />
                    <input
                      type="text"
                      value={govWorkAddress}
                      onChange={(e) => setGovWorkAddress(e.target.value)}
                      placeholder="Communication Address"
                      className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-[#292E38] text-xs text-white focus:outline-none focus:border-[#FFBD55]/60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingPersonalDetails}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] cursor-pointer disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                    }}
                  >
                    {isSavingPersonalDetails ? 'Saving Verification...' : 'Save Personal Details'}
                  </button>
                </form>
              )}

              {/* Locked Notice vs Unlocked Direct Payment Panel */}
              {!isPaymentUnlocked ? (
                <div className="p-5 rounded-2xl bg-[#11151D] border border-red-500/25 flex items-start gap-3">
                  <GovBan className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">
                      Payment Not Allowed Yet
                    </div>
                    <p className="text-xs text-[#A6AEBC] leading-relaxed">
                      {!hasPersonalDetails
                        ? 'Your personal details (Full Name, Phone, City) must be verified before this project can be allocated or any payment can be accepted.'
                        : !isAllocated
                        ? 'Your personal details are complete, and this project is awaiting engineer allocation. Use Direct Chat below to discuss bid scope while an engineer claims your project.'
                        : 'Your assigned engineer has not yet shared their direct payment details for this project. Use Direct Chat below to ask them to share payment details when a milestone or handover is ready.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Employee Shared Direct Payment Details */}
                  <div className="p-5 rounded-2xl bg-[#11151D] border border-[#52D69A]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono uppercase tracking-wider text-[#52D69A] font-bold flex items-center gap-1.5">
                        <GovQrCode className="w-4 h-4" />
                        <span>Assigned Employee Payment Details</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#9299A6]">
                        Direct Settlement
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {share.holderName && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D13] border border-[#222732]">
                          <span className="text-[#9299A6]">Payee Name</span>
                          <span className="text-white font-semibold">{share.holderName}</span>
                        </div>
                      )}
                      {share.upiId && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D13] border border-[#222732] gap-2">
                          <div>
                            <div className="text-[10px] text-[#9299A6]">UPI ID</div>
                            <div className="text-[#FFBD55] font-bold">{share.upiId}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField('upi', share.upiId)}
                            className="px-2.5 py-1 rounded-lg bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55] text-[10px] text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <GovCopy className="w-3 h-3" />
                            <span>{copiedPaymentField === 'upi' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                      {share.bankAccount && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D13] border border-[#222732] gap-2">
                          <div>
                            <div className="text-[10px] text-[#9299A6]">
                              Bank Account {share.ifsc ? `• IFSC: ${share.ifsc}` : ''}
                            </div>
                            <div className="text-white font-bold">{share.bankAccount}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPaymentField('bank', share.bankAccount)}
                            className="px-2.5 py-1 rounded-lg bg-[#11151D] border border-[#292E38] hover:border-[#FFBD55] text-[10px] text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <GovCopy className="w-3 h-3" />
                            <span>{copiedPaymentField === 'bank' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                      {share.phone && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0D13] border border-[#222732]">
                          <span className="text-[#9299A6]">Employee Contact</span>
                          <span className="text-white">{share.phone}</span>
                        </div>
                      )}
                      {share.notes && (
                        <div className="p-2.5 rounded-xl bg-[#0B0D13] border border-[#222732] text-[#A6AEBC] leading-relaxed">
                          <span className="text-[#FFBD55] font-bold">Note: </span>
                          {share.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Direct Payment Submission / Proof Status */}
                  <div className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-4">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#FFBD55] font-bold flex items-center gap-1.5">
                      <GovIndianRupee className="w-4 h-4" />
                      <span>Pay Directly & Submit Transaction Reference</span>
                    </div>

                    {(proof?.transactionRef || proof?.paidAt || proof?.submittedAt) && (() => {
                      const proofStatus = proof.status || proof.verificationStatus || 'pending';
                      const proofAmountRupees = proof.amountMinor
                        ? proof.amountMinor / 100
                        : proof.amountRupees || 0;
                      return (
                        <div
                          className={`p-3.5 rounded-xl border text-xs font-mono space-y-1 ${
                            proofStatus === 'verified'
                              ? 'bg-[#52D69A]/10 border-[#52D69A]/40 text-[#52D69A]'
                              : proofStatus === 'rejected'
                              ? 'bg-red-500/10 border-red-500/35 text-red-300'
                              : 'bg-[#78BFFF]/10 border-[#78BFFF]/35 text-[#78BFFF]'
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            <GovShieldCheck className="w-4 h-4 shrink-0" />
                            <span>
                              Latest Proof: ₹{Number(proofAmountRupees).toLocaleString('en-IN')} • Status:{' '}
                              {String(proofStatus).toUpperCase()}
                            </span>
                          </div>
                          {proof.transactionRef && (
                            <div className="text-[11px] text-[#A6AEBC]">
                              UTR / Ref: {proof.transactionRef}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {directPaymentError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300">
                        {directPaymentError}
                      </div>
                    )}
                    {directPaymentSuccess && (
                      <div className="p-3 rounded-xl bg-[#52D69A]/10 border border-[#52D69A]/30 text-xs font-mono text-[#52D69A]">
                        {directPaymentSuccess}
                      </div>
                    )}

                    {!isHandoverDone && (
                      <form onSubmit={handleSubmitDirectPayment} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9299A6] mb-1">
                              Amount Paid (₹) *
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={paymentAmountRupees}
                              onChange={(e) => setPaymentAmountRupees(e.target.value)}
                              placeholder="e.g. 5000"
                              required
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-[#292E38] text-xs text-white focus:outline-none focus:border-[#FFBD55]/60"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9299A6] mb-1">
                              UPI / UTR Reference *
                            </label>
                            <input
                              type="text"
                              value={paymentTransactionRef}
                              onChange={(e) => setPaymentTransactionRef(e.target.value)}
                              placeholder="e.g. UTR412098765432"
                              required
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D13] border border-[#292E38] text-xs text-white focus:outline-none focus:border-[#FFBD55]/60"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmittingDirectPayment}
                          className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] cursor-pointer disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                          }}
                        >
                          {isSubmittingDirectPayment
                            ? 'Submitting Payment Proof...'
                            : 'Confirm Direct Payment to Employee'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 2. PROJECT DELIVERABLES & PRODUCTION ARTIFACTS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292E38]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D6A94F] font-bold">
                DELIVERABLES VAULT
              </span>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-[#FFBD55]" />
                <span>Project Deliverables &amp; Production Artifacts</span>
              </h2>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border bg-emerald-950/70 border-emerald-500 text-emerald-400">
              Direct Handover • Full Access
            </span>
          </div>

          <div className="space-y-3">
            {order.deliverables && order.deliverables.length > 0 ? (
              <div className="space-y-2.5">
                {order.deliverables.map((deliv: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-white font-display">{deliv.title}</div>
                      <div className="text-[11px] font-mono text-[#9299A6]">
                        {deliv.originalName} • {(deliv.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>

                    <a
                      href={resolveApiUrl(deliv.downloadUrl || `/files/${deliv.fileKey}/download`)}
                      download
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#050609] flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
                      style={{
                        background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                      }}
                    >
                      <Download className="w-3.5 h-3.5 text-[#050609]" />
                      <span>Download Artifact</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#11151D] border border-[#292E38] text-center space-y-2 text-xs text-[#9299A6]">
                <Sparkles className="w-6 h-6 text-[#FFBD55] mx-auto" />
                <div className="text-sm font-bold text-white font-display">Deliverables In Preparation</div>
                <p className="max-w-md mx-auto text-[#9299A6]">
                  Production artifacts (source code repository, deployment builds, and documentation) will be uploaded here directly by your lead engineer as development milestones conclude.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. LIVE PROJECT UPDATIONS FEED (ENGINEER DISPATCHES) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#292E38]">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFBD55]" />
              <span>Live Project Updations Feed</span>
            </h2>
            <span className="text-xs font-mono text-[#D6A94F] font-bold">
              Progress: {order.progressPercent || 0}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#11151D] overflow-hidden border border-[#292E38]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${order.progressPercent || 0}%`,
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            />
          </div>

          {order.projectUpdates && order.projectUpdates.length > 0 ? (
            <div className="space-y-3 pt-2">
              {order.projectUpdates.slice().reverse().map((upd: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#FFBD55]">{upd.title}</span>
                    <span className="text-[10px] text-[#9299A6]">
                      {new Date(upd.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#E7E9EE] leading-relaxed">
                    {upd.description}
                  </p>
                  <div className="text-[10px] font-mono text-[#9299A6] pt-1">
                    Dispatched by: <strong className="text-white">{upd.postedByName}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] text-center text-xs text-[#9299A6]">
              No updates posted yet. As the assigned engineer progresses with development sprints, live notes will display here.
            </div>
          )}
        </div>

        {/* 4. DIRECT CHAT CHANNEL (CLIENT <-> LEAD ENGINEER) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#292E38]">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#78BFFF]" />
              <span>Direct Chat with Assigned Lead Engineer</span>
            </h2>
            <span className="text-xs font-mono text-[#9299A6] inline-flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isChatStreamLive ? 'bg-[#52D69A] animate-pulse' : 'bg-[#FFBD55]'}`} />
              <span>{messages.length} Messages</span>
            </span>
          </div>

          {chatError && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-2">
              <span>{chatError}</span>
              <button type="button" onClick={() => setChatError(null)} className="text-[10px] font-mono uppercase cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div ref={chatFeedRef} data-lenis-prevent className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#9299A6]">
                No messages yet. Send a note or attach a file/screenshot to your assigned lead engineer below.
              </div>
            ) : (
              messages.map((msg: any) => {
                const senderId = String(msg.senderId?._id || msg.senderId || '');
                const currentUserId = String(user?.id || (user as any)?._id || '');
                const isMyMessage = Boolean(currentUserId && senderId === currentUserId);
                return (
                  <div
                    key={msg._id}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                      isMyMessage
                        ? 'ml-auto bg-[#11151D] border border-[#D6A94F]/40'
                        : 'mr-auto bg-[#0A0D13] border border-[#292E38]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-[#9299A6]">
                      <span className="font-bold text-[#FFBD55]">
                        {msg.senderId?.fullName || 'Engineer'} ({msg.senderId?.role || 'Staff'})
                      </span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {msg.content && <p className="text-[#E7E9EE] leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                    <MessageAttachmentsList attachments={msg.attachments} />
                  </div>
                );
              })
            )}
          </div>

          <StagedAttachmentsBar
            files={stagedAttachments}
            onRemove={(attId) => setStagedAttachments((prev) => prev.filter((f) => f._id !== attId))}
          />

          {/* Message Composer */}
          <form onSubmit={handleSendMessage} className="pt-2 border-t border-[#292E38] flex gap-2">
            <input
              ref={chatFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleChatFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => chatFileInputRef.current?.click()}
              disabled={isUploadingAttachment || stagedAttachments.length >= 5}
              title="Attach file or paste screenshot"
              className="px-3 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-[#FFBD55] disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
            >
              {isUploadingAttachment ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFBD55]" />
              ) : (
                <Paperclip className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPaste={(e) => {
                if (e.clipboardData?.files?.length) {
                  e.preventDefault();
                  handleChatFiles(e.clipboardData.files);
                }
              }}
              placeholder="Type your message or paste a screenshot..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs placeholder:text-[#9299A6] focus:border-[#FFBD55] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSendingMessage || isUploadingAttachment || (!newMessage.trim() && stagedAttachments.length === 0)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#050609] transition-transform hover:scale-105 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            >
              {isSendingMessage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#050609]" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5 text-[#050609]" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
