import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  Shield,
  Loader2,
  Sparkles,
  RefreshCw,
  Paperclip,
} from 'lucide-react';
import {
  type ChatAttachmentFile,
  mergeMessagesById,
  uploadChatAttachment,
  useChatStream,
} from '../../hooks/useChatRealtime';
import { MessageAttachmentsList, StagedAttachmentsBar } from '../../components/chat/ChatAttachments';

interface ChannelItem {
  id: string;
  name: string;
  code?: string;
  type: 'support' | 'project' | 'order';
  description?: string;
  status?: string;
  unreadCount?: number;
}

export const ClientMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScrolledThreadRef = useRef<string>('');

  const [channels, setChannels] = useState<{
    support: ChannelItem;
    projects: ChannelItem[];
    orders: ChannelItem[];
  }>({
    support: {
      id: 'support',
      name: 'Dracovion Executive & Engineering Desk',
      description: 'Direct secure line with platform leadership, system architects, and senior engineers.',
      type: 'support',
      unreadCount: 0,
    },
    projects: [],
    orders: [],
  });

  const [selectedChannel, setSelectedChannel] = useState<ChannelItem>({
    id: 'support',
    name: 'Dracovion Executive & Engineering Desk',
    description: 'Direct secure line with platform leadership, system architects, and senior engineers.',
    type: 'support',
    unreadCount: 0,
  });

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachmentFile[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentUserId = user?.id || (user as any)?._id;

  const scrollFeedToBottom = () => {
    const el = feedContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  // 1. Load Channels
  const loadChannels = async () => {
    try {
      const res = await api.get<{
        success: boolean;
        channels: {
          support: ChannelItem;
          projects: ChannelItem[];
          orders: ChannelItem[];
        };
      }>('/messages/channels');

      if (res.success && res.channels) {
        const supportChan: ChannelItem = {
          ...res.channels.support,
          type: 'support',
        };
        const projChans: ChannelItem[] = (res.channels.projects || []).map((p: any) => ({
          ...p,
          type: 'project',
        }));
        const orderChans: ChannelItem[] = (res.channels.orders || []).map((o: any) => ({
          ...o,
          type: 'order',
        }));

        setChannels({
          support: supportChan,
          projects: projChans,
          orders: orderChans,
        });

        const params = new URLSearchParams(location.search);
        const queryProject = params.get('project');
        const queryOrder = params.get('order');

        if (queryProject) {
          const found = projChans.find(p => p.id === queryProject);
          if (found) setSelectedChannel(found);
        } else if (queryOrder) {
          const found = orderChans.find(o => o.id === queryOrder);
          if (found) setSelectedChannel(found);
        }
      }
    } catch {
      // Fallback: Support channel remains active
    }
  };

  useEffect(() => {
    loadChannels();
  }, [location.search]);

  // 2. Fetch Messages for Current Channel
  const fetchMessages = async (silent = false) => {
    if (!silent) {
      setIsLoadingMessages(true);
      setErrorMsg(null);
    }
    try {
      let endpoint = '/messages/direct';
      if (selectedChannel.type === 'project') {
        endpoint = `/messages/project/${selectedChannel.id}`;
      } else if (selectedChannel.type === 'order') {
        endpoint = `/messages/order/${selectedChannel.id}`;
      }

      const res = await api.get<{ success: boolean; messages: any[] }>(endpoint);
      setMessages(res.messages || []);
    } catch (err: any) {
      if (!silent) {
        setMessages([]);
        setErrorMsg(err?.message || 'Unable to load channel messages.');
      }
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChannel.id, selectedChannel.type]);

  // 3. Real-time Server-Sent Events stream for <50ms instant chat delivery
  const { isStreamConnected } = useChatStream(Boolean(user), (evt) => {
    if (!evt?.message) return;
    const matchesChannel =
      (selectedChannel.type === 'support' && evt.channelType === 'support') ||
      (selectedChannel.type === 'order' && evt.channelType === 'order' && String(evt.orderId) === String(selectedChannel.id)) ||
      (selectedChannel.type === 'project' && evt.channelType === 'project' && String(evt.projectId) === String(selectedChannel.id));

    if (matchesChannel) {
      setMessages(prev => mergeMessagesById(prev, [evt.message]));
      setTimeout(scrollFeedToBottom, 30);
    }
  });

  // 4. Adaptive background sync + tab focus resync
  useEffect(() => {
    const intervalMs = isStreamConnected ? 8000 : 2500;
    const timer = setInterval(() => {
      fetchMessages(true);
    }, intervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchMessages(true);
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [selectedChannel.id, selectedChannel.type, isStreamConnected]);

  useEffect(() => {
    const threadKey = `${selectedChannel.type}:${selectedChannel.id}:${messages.length}:${messages[messages.length - 1]?._id || ''}`;
    if (lastScrolledThreadRef.current !== threadKey) {
      lastScrolledThreadRef.current = threadKey;
      scrollFeedToBottom();
    }
  }, [selectedChannel.id, selectedChannel.type, messages]);

  const handleFilesSelected = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setIsUploadingAttachment(true);
    setErrorMsg(null);
    try {
      const uploaded: ChatAttachmentFile[] = [];
      for (const file of list.slice(0, 5 - stagedAttachments.length)) {
        const record = await uploadChatAttachment(
          file,
          selectedChannel.type === 'project' ? selectedChannel.id : undefined
        );
        uploaded.push(record);
      }
      setStagedAttachments(prev => [...prev, ...uploaded]);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to upload file attachment.');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.files;
    if (items && items.length > 0) {
      e.preventDefault();
      await handleFilesSelected(items);
    }
  };

  // 5. Send Message
  const handleSend = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault();
    const contentToSend = (customContent !== undefined ? customContent : newMessage).trim();
    const hasAttachments = customContent === undefined && stagedAttachments.length > 0;
    if ((!contentToSend && !hasAttachments) || isSending) return;

    setIsSending(true);
    setErrorMsg(null);
    try {
      let endpoint = '/messages/direct';
      if (selectedChannel.type === 'project') {
        endpoint = `/messages/project/${selectedChannel.id}`;
      } else if (selectedChannel.type === 'order') {
        endpoint = `/messages/order/${selectedChannel.id}`;
      }

      const res = await api.post<{ success: boolean; message: any }>(endpoint, {
        content: contentToSend,
        attachments: hasAttachments ? stagedAttachments.map(a => a._id) : [],
      });

      if (res.success && res.message) {
        setMessages(prev => mergeMessagesById(prev, [res.message]));
        if (customContent === undefined) {
          setNewMessage('');
          setStagedAttachments([]);
        }
        setTimeout(scrollFeedToBottom, 40);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch message.');
    } finally {
      setIsSending(false);
    }
  };

  const starterPrompts = [
    'I would like to request an architectural consultation and quotation.',
    'Could you clarify the expected delivery timeline and milestones?',
    'I have a custom full-stack software requirement I would like to review.',
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E38] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
            <span>OFFICIAL CLIENT DIRECT CHANNEL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Direct Messages &amp; Project Communications</h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
            Real-time direct encrypted line and instant file sharing with Dracovion leadership and engineers.
          </p>
        </div>

        <button
          onClick={() => {
            fetchMessages();
            loadChannels();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-[#FFBD55] text-xs font-mono transition-all self-start sm:self-auto cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Line</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-3">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-[11px] font-mono uppercase text-rose-300 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[calc(100dvh-14.5rem)] lg:min-h-[460px] lg:max-h-[680px]">
        {/* Left: Channels Sidebar (4 cols) */}
        <div className="lg:col-span-4 h-[270px] lg:h-full min-h-0 p-4 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col justify-between overflow-hidden">
          <div data-lenis-prevent className="space-y-5 overflow-y-auto flex-1 min-h-0 pr-1">
            {/* Primary Support Line */}
            <div>
              <span className="text-[10px] font-mono text-[#FFBD55] uppercase tracking-wider block px-2 mb-2 font-bold">
                Direct Channels
              </span>
              <div
                onClick={() => setSelectedChannel(channels.support)}
                className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                  selectedChannel.id === 'support'
                    ? 'bg-[#15191F] border-[#FFBD55] text-white shadow-[0_0_20px_rgba(214,169,79,0.3)]'
                    : 'bg-[#11151D] border-[#292E38] text-[#9299A6] hover:text-white hover:border-[#D6A94F]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#050609] border border-[#D6A94F]/40 flex items-center justify-center text-[#FFBD55]">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white font-display">Executive Support Desk</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#52D69A] animate-pulse" />
                </div>
                <p className="text-[11px] text-[#9299A6] pl-9 line-clamp-1">
                  Platform leadership &amp; project engineers
                </p>
              </div>
            </div>

            {/* Active Projects (if any) */}
            {channels.projects.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider block px-2 mb-2 font-bold flex items-center justify-between">
                  <span>Project Sprints</span>
                  <span className="text-[#9299A6] font-normal">({channels.projects.length})</span>
                </span>
                <div className="space-y-2">
                  {channels.projects.map(p => {
                    const isSelected = selectedChannel.id === p.id && selectedChannel.type === 'project';
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedChannel(p)}
                        className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-[#15191F] border-[#FFBD55] text-white shadow-[0_0_20px_rgba(214,169,79,0.3)]'
                            : 'bg-[#11151D] border-[#292E38] text-[#9299A6] hover:text-white hover:border-[#D6A94F]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-[#FFBD55]">{p.code}</span>
                          <span className="text-[10px] font-mono text-[#52D69A]">{p.status}</span>
                        </div>
                        <div className="text-xs font-bold text-white truncate">{p.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Project Orders (if any) */}
            {channels.orders.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider block px-2 mb-2 font-bold flex items-center justify-between">
                  <span>Active Orders</span>
                  <span className="text-[#9299A6] font-normal">({channels.orders.length})</span>
                </span>
                <div className="space-y-2">
                  {channels.orders.map(o => {
                    const isSelected = selectedChannel.id === o.id && selectedChannel.type === 'order';
                    return (
                      <div
                        key={o.id}
                        onClick={() => setSelectedChannel(o)}
                        className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-[#15191F] border-[#FFBD55] text-white shadow-[0_0_20px_rgba(214,169,79,0.3)]'
                            : 'bg-[#11151D] border-[#292E38] text-[#9299A6] hover:text-white hover:border-[#D6A94F]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-[#FFBD55]">{o.code}</span>
                          <span className="text-[10px] font-mono text-[#E7E9EE] capitalize">{o.status}</span>
                        </div>
                        <div className="text-xs font-bold text-white truncate">{o.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-[#292E38] text-[10px] font-mono text-[#9299A6] flex items-center justify-between shrink-0">
            <span>{isStreamConnected ? 'SSE Real-Time Active' : 'Direct Line SLA: < 2 hrs'}</span>
            <span className="text-[#FFBD55]">Instant Sharing</span>
          </div>
        </div>

        {/* Right: Active Chat Window (8 cols) */}
        <div className="lg:col-span-8 h-[500px] sm:h-[540px] lg:h-full min-h-0 p-5 sm:p-6 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="pb-4 border-b border-[#292E38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display text-white truncate">{selectedChannel.name}</h2>
                {selectedChannel.code && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#11151D] border border-[#D6A94F]/40 text-[#FFBD55] shrink-0">
                    {selectedChannel.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9299A6] mt-0.5 truncate">{selectedChannel.description || 'Secure communication channel.'}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#52D69A]/40 text-[10px] font-mono font-bold text-[#52D69A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#52D69A] animate-pulse" />
                <span>{isStreamConnected ? 'Instant Live Channel' : '24/7 Verified Channel'}</span>
              </span>
            </div>
          </div>

          {/* Messages Feed Area */}
          <div ref={feedContainerRef} data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto my-3 pr-2 space-y-4">
            {isLoadingMessages ? (
              <div className="py-16 text-center text-[#9299A6] font-mono text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#FFBD55]" />
                <span>Loading channel messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-10 px-6 rounded-2xl bg-[#11151D]/60 border border-[#292E38] text-center space-y-4 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#050609] border border-[#D6A94F]/40 flex items-center justify-center text-[#FFBD55] mx-auto shadow-md">
                  <Sparkles className="w-6 h-6 text-[#FFBD55]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white font-display">Direct Channel Ready</h3>
                  <p className="text-xs text-[#9299A6] max-w-md mx-auto">
                    Send messages or share screenshots and specifications directly with Dracovion engineers and leadership.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="pt-2 flex flex-col sm:flex-row flex-wrap justify-center gap-2 text-left">
                  {starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(undefined, prompt)}
                      className="px-3 py-2 rounded-xl bg-[#080A0E] border border-[#292E38] hover:border-[#FFBD55] text-[#9299A6] hover:text-white text-[11px] transition-all cursor-pointer text-left"
                    >
                      &quot;{prompt}&quot;
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => {
                const senderId = String(msg.senderId?._id || msg.senderId || '');
                const isMine = Boolean(currentUserId && senderId === String(currentUserId));
                const senderRole = msg.senderId?.role || (isMine ? 'client' : 'admin');
                const isStaff = ['owner', 'admin', 'ceo', 'super_admin', 'employee', 'team_member'].includes(senderRole);

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] font-mono text-[#9299A6]">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase ${isMine ? 'text-[#FFBD55]' : isStaff ? 'text-[#52D69A]' : 'text-[#E7E9EE]'}`}>
                        {isMine ? 'You' : msg.senderId?.fullName || 'Dracovion Engineering'}
                      </span>
                      {isStaff && !isMine && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#FFBD55]/15 text-[#FFBD55] border border-[#D6A94F]/30 uppercase">
                          Staff
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-xl text-xs leading-relaxed space-y-1 shadow-lg ${
                        isMine
                          ? 'bg-[#15191F] border border-[#D6A94F]/40 text-white rounded-tr-none'
                          : 'bg-[#11151D] border border-[#292E38] text-[#E7E9EE] rounded-tl-none'
                      }`}
                    >
                      {msg.content && <p className="whitespace-pre-wrap select-text">{msg.content}</p>}
                      <MessageAttachmentsList attachments={msg.attachments} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <StagedAttachmentsBar
            files={stagedAttachments}
            onRemove={(id) => setStagedAttachments(prev => prev.filter(f => f._id !== id))}
          />

          {/* Input Bar */}
          <form onSubmit={(e) => handleSend(e)} className="pt-3 border-t border-[#292E38] flex items-center gap-2.5 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files) handleFilesSelected(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAttachment || stagedAttachments.length >= 5}
              title="Attach file, image, or specification (or paste screenshot with Ctrl+V)"
              className="h-[46px] px-3.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-[#FFBD55] disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              {isUploadingAttachment ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FFBD55]" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder="Type your message or paste a screenshot to share..."
              className="flex-1 h-[46px] px-4 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] focus:outline-none focus:border-[#D6A94F] text-xs font-sans transition-all"
            />
            <button
              type="submit"
              disabled={isSending || isUploadingAttachment || (!newMessage.trim() && stagedAttachments.length === 0)}
              className="h-[46px] px-5 sm:px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#050609]" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5 text-[#050609]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
