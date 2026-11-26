import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Send,
  Search,
  Loader2,
  RefreshCw,
  Paperclip,
  Shield,
  Package,
  FolderGit2,
} from 'lucide-react';
import {
  type ChatAttachmentFile,
  mergeMessagesById,
  uploadChatAttachment,
  useChatStream,
} from '../../hooks/useChatRealtime';
import { MessageAttachmentsList, StagedAttachmentsBar } from '../../components/chat/ChatAttachments';

interface ConversationItem {
  client: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string;
    companyName?: string;
    collegeOrUniversity?: string;
    phone?: string;
    createdAt: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    channelType?: string;
    senderId?: {
      fullName: string;
      role: string;
    };
  };
  messageCount: number;
  unreadCount: number;
  updatedAt: string;
}

interface ClientSubChannel {
  id: string;
  type: 'support' | 'order' | 'project';
  name: string;
  code?: string;
  status?: string;
  messageCount?: number;
}

export const AdminMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get('client');
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScrolledThreadRef = useRef<string>('');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<ConversationItem['client'] | null>(null);
  const [clientSubChannels, setClientSubChannels] = useState<ClientSubChannel[]>([]);
  const [activeSubChannel, setActiveSubChannel] = useState<ClientSubChannel>({
    id: 'support',
    type: 'support',
    name: 'Direct Support Line',
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachmentFile[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
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

  // 1. Fetch Conversations
  const loadConversations = async (silent = false) => {
    if (!silent) {
      setIsLoadingList(true);
      setErrorMsg(null);
    }
    try {
      const res = await api.get<{
        success: boolean;
        conversations: ConversationItem[];
      }>('/messages/admin/conversations');

      if (res.success && res.conversations) {
        setConversations(res.conversations);

        if (res.conversations.length > 0) {
          if (initialClientId) {
            const requested = res.conversations.find(c => c.client._id === initialClientId);
            if (requested && (!selectedClient || selectedClient._id !== requested.client._id)) {
              setSelectedClient(requested.client);
            } else if (!selectedClient) {
              setSelectedClient(res.conversations[0].client);
            }
          } else if (!selectedClient) {
            setSelectedClient(res.conversations[0].client);
          }
        }
      }
    } catch (err: any) {
      if (!silent) {
        setErrorMsg(err?.message || 'Unable to load client chat conversations.');
      }
    } finally {
      if (!silent) setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [initialClientId]);

  // 2. Fetch available channels (Support + Orders + Projects) for Selected Client
  const loadClientSubChannels = async (clientId: string) => {
    try {
      const res = await api.get<{
        success: boolean;
        channels: {
          support: ClientSubChannel;
          orders: ClientSubChannel[];
          projects: ClientSubChannel[];
        };
      }>(`/messages/admin/client/${clientId}/channels`);

      if (res.success && res.channels) {
        const supportChan: ClientSubChannel = { ...res.channels.support, id: 'support', type: 'support' };
        const combined: ClientSubChannel[] = [
          supportChan,
          ...(res.channels.orders || []).map(o => ({ ...o, type: 'order' as const })),
          ...(res.channels.projects || []).map(p => ({ ...p, type: 'project' as const })),
        ];
        setClientSubChannels(combined);

        setActiveSubChannel(prev => {
          const matching = combined.find(c => c.id === prev.id && c.type === prev.type);
          if (matching) return matching;
          // Auto-select order tab when support is empty but active order has chat history
          if ((supportChan.messageCount || 0) === 0) {
            const orderWithHistory = combined.find(c => c.type !== 'support' && (c.messageCount || 0) > 0);
            if (orderWithHistory) return orderWithHistory;
          }
          return supportChan;
        });
      }
    } catch {
      const fallback: ClientSubChannel = { id: 'support', type: 'support', name: 'Direct Support Line' };
      setClientSubChannels([fallback]);
      setActiveSubChannel(fallback);
    }
  };

  useEffect(() => {
    if (!selectedClient?._id) return;
    setActiveSubChannel({ id: 'support', type: 'support', name: 'Direct Support Line' });
    loadClientSubChannels(selectedClient._id);
  }, [selectedClient?._id]);

  // 3. Fetch Messages for Selected Client + SubChannel
  const loadMessages = async (silent = false) => {
    if (!selectedClient) return;
    if (!silent) {
      setIsLoadingMessages(true);
      setErrorMsg(null);
    }
    try {
      let endpoint = `/messages/admin/client/${selectedClient._id}`;
      if (activeSubChannel.type === 'order') {
        endpoint = `/messages/order/${activeSubChannel.id}`;
      } else if (activeSubChannel.type === 'project') {
        endpoint = `/messages/project/${activeSubChannel.id}`;
      }

      const res = await api.get<{
        success: boolean;
        messages: any[];
      }>(endpoint);

      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err: any) {
      if (!silent) {
        setMessages([]);
        setErrorMsg(err?.message || 'Unable to load conversation messages.');
      }
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [selectedClient?._id, activeSubChannel.id, activeSubChannel.type]);

  // 4. Real-time Server-Sent Events stream for <50ms message delivery
  const { isStreamConnected } = useChatStream(Boolean(user), (evt) => {
    if (!evt?.message) return;

    const matchesSelected =
      selectedClient &&
      String(evt.clientId || '') === String(selectedClient._id) &&
      ((activeSubChannel.type === 'support' && evt.channelType === 'support') ||
        (activeSubChannel.type === 'order' && evt.channelType === 'order' && String(evt.orderId) === String(activeSubChannel.id)) ||
        (activeSubChannel.type === 'project' && evt.channelType === 'project' && String(evt.projectId) === String(activeSubChannel.id)));

    if (matchesSelected) {
      setMessages(prev => mergeMessagesById(prev, [evt.message]));
      setTimeout(scrollFeedToBottom, 30);
    }
    loadConversations(true);
    if (selectedClient?._id && String(evt.clientId || '') === String(selectedClient._id)) {
      loadClientSubChannels(selectedClient._id);
    }
  });

  // 5. Fallback periodic sync (slower when SSE live, faster when reconnecting) + focus resync
  useEffect(() => {
    const intervalMs = isStreamConnected ? 8000 : 2500;
    const timer = setInterval(() => {
      loadMessages(true);
      loadConversations(true);
    }, intervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadMessages(true);
        loadConversations(true);
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [selectedClient?._id, activeSubChannel.id, activeSubChannel.type, isStreamConnected]);

  useEffect(() => {
    const threadKey = `${selectedClient?._id || 'none'}:${activeSubChannel.type}:${activeSubChannel.id}:${messages.length}:${messages[messages.length - 1]?._id || ''}`;
    if (lastScrolledThreadRef.current !== threadKey) {
      lastScrolledThreadRef.current = threadKey;
      scrollFeedToBottom();
    }
  }, [selectedClient?._id, activeSubChannel.id, activeSubChannel.type, messages]);

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
          activeSubChannel.type === 'project' ? activeSubChannel.id : undefined
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

  // 6. Send Admin Reply
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || (!newMessage.trim() && stagedAttachments.length === 0) || isSending) return;

    setIsSending(true);
    setErrorMsg(null);
    try {
      let endpoint = `/messages/admin/client/${selectedClient._id}`;
      if (activeSubChannel.type === 'order') {
        endpoint = `/messages/order/${activeSubChannel.id}`;
      } else if (activeSubChannel.type === 'project') {
        endpoint = `/messages/project/${activeSubChannel.id}`;
      }

      const res = await api.post<{
        success: boolean;
        message: any;
      }>(endpoint, {
        content: newMessage.trim(),
        attachments: stagedAttachments.map(a => a._id),
      });

      if (res.success && res.message) {
        setMessages(prev => mergeMessagesById(prev, [res.message]));
        setNewMessage('');
        setStagedAttachments([]);
        setTimeout(scrollFeedToBottom, 40);
        loadConversations(true);
        loadClientSubChannels(selectedClient._id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch reply.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.client.fullName?.toLowerCase().includes(q) ||
      c.client.email?.toLowerCase().includes(q) ||
      c.client.companyName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E38] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
            <span>OFFICIAL EXECUTIVE MESSAGING CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Client Direct Communications</h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
            Real-time direct messaging, order discussions, and instant file sharing with registered clients.
          </p>
        </div>

        <button
          onClick={() => {
            loadConversations();
            loadMessages();
            if (selectedClient?._id) loadClientSubChannels(selectedClient._id);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-[#FFBD55] text-xs font-mono transition-all self-start sm:self-auto cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Threads</span>
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

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[calc(100dvh-13.5rem)] lg:min-h-[460px] lg:max-h-[680px]">
        {/* Left: Client Threads Roster (4 cols) */}
        <div className="lg:col-span-4 h-[280px] lg:h-full min-h-0 p-4 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 min-h-0 overflow-hidden flex flex-col flex-1">
            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clients by name, email, company..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] text-xs focus:outline-none focus:border-[#D6A94F]"
              />
            </div>

            <div className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider px-2 font-bold flex items-center justify-between shrink-0">
              <span>Client Threads</span>
              <span className="text-[#9299A6]">({filteredConversations.length})</span>
            </div>

            {/* List */}
            <div data-lenis-prevent className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1">
              {isLoadingList ? (
                <div className="py-16 text-center text-[#9299A6] font-mono text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFBD55]" />
                  <span>Loading clients...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#9299A6]">
                  No client threads found.
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const isSelected = selectedClient?._id === conv.client._id;

                  return (
                    <div
                      key={conv.client._id}
                      onClick={() => setSelectedClient(conv.client)}
                      className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-[#15191F] border-[#FFBD55] text-white shadow-[0_0_20px_rgba(214,169,79,0.25)]'
                          : 'bg-[#11151D] border-[#292E38] text-[#9299A6] hover:text-white hover:border-[#D6A94F]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white truncate max-w-[170px]">
                          {conv.client.fullName}
                        </span>
                        {conv.unreadCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FFBD55] text-[#050609]">
                            {conv.unreadCount} NEW
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#9299A6]">
                            {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-[#FFBD55] truncate">
                        {conv.client.companyName || conv.client.collegeOrUniversity || conv.client.email}
                      </div>

                      <p className="text-[11px] text-[#9299A6] line-clamp-1 mt-1 font-sans">
                        {conv.lastMessage ? conv.lastMessage.content : 'Ready for direct consultation.'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#292E38] text-[10px] font-mono text-[#9299A6] flex items-center justify-between shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreamConnected ? 'bg-[#52D69A] animate-pulse' : 'bg-[#FFBD55]'}`} />
              <span>{isStreamConnected ? 'SSE Real-Time Active' : 'Fast Sync Active'}</span>
            </span>
            <span className="text-[#FFBD55]">Instant Sharing</span>
          </div>
        </div>

        {/* Right: Active Discussion Box (8 cols) */}
        <div className="lg:col-span-8 h-[500px] sm:h-[540px] lg:h-full min-h-0 p-5 sm:p-6 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col overflow-hidden">
          {selectedClient ? (
            <>
              {/* Header */}
              <div className="pb-3 border-b border-[#292E38] space-y-3 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#11151D] border border-[#D6A94F]/40 flex items-center justify-center font-mono font-bold text-[#FFBD55] shrink-0">
                      {selectedClient.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold font-display text-white truncate">{selectedClient.fullName}</h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#11151D] border border-[#D6A94F]/40 text-[#FFBD55] uppercase shrink-0">
                          {selectedClient.role}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#9299A6] flex items-center gap-2 truncate">
                        <span className="truncate">{selectedClient.email}</span>
                        {selectedClient.phone && <span className="shrink-0">• {selectedClient.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#52D69A]/40 text-[10px] font-mono font-bold text-[#52D69A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52D69A] animate-pulse" />
                      <span>{isStreamConnected ? 'Instant Live Channel' : 'Channel Online'}</span>
                    </span>
                  </div>
                </div>

                {/* Client Channels Switcher (Direct Support + Order Chats + Project Sprints) */}
                {clientSubChannels.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                    {clientSubChannels.map(ch => {
                      const active = activeSubChannel.id === ch.id && activeSubChannel.type === ch.type;
                      return (
                        <button
                          key={`${ch.type}:${ch.id}`}
                          type="button"
                          onClick={() => setActiveSubChannel(ch)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono transition-all shrink-0 cursor-pointer border ${
                            active
                              ? 'bg-[#15191F] border-[#FFBD55] text-[#FFBD55] font-bold'
                              : 'bg-[#11151D] border-[#292E38] text-[#9299A6] hover:text-white hover:border-[#D6A94F]/40'
                          }`}
                        >
                          {ch.type === 'support' ? (
                            <Shield className="w-3 h-3" />
                          ) : ch.type === 'order' ? (
                            <Package className="w-3 h-3" />
                          ) : (
                            <FolderGit2 className="w-3 h-3" />
                          )}
                          <span className="truncate max-w-[180px]">
                            {ch.code ? `${ch.code} • ${ch.name}` : ch.name}
                          </span>
                          {(ch.messageCount || 0) > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#050609] text-[10px] text-[#FFBD55]">
                              {ch.messageCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div ref={feedContainerRef} data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto my-3 pr-2 space-y-4">
                {isLoadingMessages ? (
                  <div className="py-16 text-center text-[#9299A6] font-mono text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FFBD55]" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#9299A6] space-y-2">
                    <p>
                      No messages in <strong className="text-white">{activeSubChannel.name}</strong> yet.
                    </p>
                    <p className="text-[11px] text-[#FFBD55]">
                      Type a message below or attach/paste a screenshot or document to share instantly.
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isStaff = ['owner', 'admin', 'ceo', 'super_admin', 'employee', 'team_member'].includes(msg.senderId?.role || '');
                    const senderId = String(msg.senderId?._id || msg.senderId || '');
                    const isMe = Boolean(currentUserId && senderId === String(currentUserId));

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[10px] font-mono text-[#9299A6]">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`text-[10px] font-mono font-bold uppercase ${isMe ? 'text-[#FFBD55]' : isStaff ? 'text-[#52D69A]' : 'text-white'}`}>
                            {isMe ? 'You (Executive)' : msg.senderId?.fullName || selectedClient.fullName}
                          </span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl max-w-xl text-xs leading-relaxed space-y-1 shadow-lg ${
                            isMe
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
              <form onSubmit={handleSend} className="pt-3 border-t border-[#292E38] flex items-center gap-2.5 shrink-0">
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
                  placeholder={`Message ${selectedClient.fullName}${activeSubChannel.code ? ` (${activeSubChannel.code})` : ''} — or paste screenshot...`}
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
            </>
          ) : (
            <div className="py-24 text-center text-xs text-[#9299A6] my-auto">
              Select a client from the roster on the left to begin messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
