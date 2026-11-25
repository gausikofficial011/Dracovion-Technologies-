import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Building,
  GraduationCap,
  Loader2,
  RefreshCw,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

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
    senderId?: {
      fullName: string;
      role: string;
    };
  };
  messageCount: number;
  unreadCount: number;
  updatedAt: string;
}

export const AdminMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get('client');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<ConversationItem['client'] | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Conversations
  const loadConversations = async (silent = false) => {
    if (!silent) setIsLoadingList(true);
    try {
      const res = await api.get<{
        success: boolean;
        conversations: ConversationItem[];
      }>('/messages/admin/conversations');

      if (res.success && res.conversations) {
        setConversations(res.conversations);

        // Select first or requested client if none selected
        if (!selectedClient && res.conversations.length > 0) {
          if (initialClientId) {
            const requested = res.conversations.find(c => c.client._id === initialClientId);
            if (requested) setSelectedClient(requested.client);
            else setSelectedClient(res.conversations[0].client);
          } else {
            setSelectedClient(res.conversations[0].client);
          }
        }
      }
    } catch (_) {
    } finally {
      if (!silent) setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [initialClientId]);

  // 2. Fetch Messages for Selected Client
  const loadMessages = async (silent = false) => {
    if (!selectedClient) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const res = await api.get<{
        success: boolean;
        messages: any[];
      }>(`/messages/admin/client/${selectedClient._id}`);

      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (_) {
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [selectedClient?._id]);

  // Auto-poll messages every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      loadMessages(true);
      loadConversations(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [selectedClient?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Send Admin Reply
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await api.post<{
        success: boolean;
        message: any;
      }>(`/messages/admin/client/${selectedClient._id}`, {
        content: newMessage.trim(),
      });

      if (res.success && res.message) {
        setMessages(prev => [...prev, res.message]);
        setNewMessage('');
        setTimeout(scrollToBottom, 50);
        loadConversations(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch reply');
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
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E38] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-[10px] font-mono text-[#FFBD55] uppercase font-bold mb-2">
            <span>OFFICIAL EXECUTIVE MESSAGING CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">Client Direct Communications</h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1">
            Real-time direct messaging hub connecting platform leadership and engineering directly with registered clients.
          </p>
        </div>

        <button
          onClick={() => {
            loadConversations();
            loadMessages();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-[#FFBD55] text-xs font-mono transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Threads</span>
        </button>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left: Client Threads Roster (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 overflow-hidden flex flex-col flex-1">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9299A6] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clients by name, email, company..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] text-xs focus:outline-none focus:border-[#D6A94F]"
              />
            </div>

            <div className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider px-2 font-bold flex items-center justify-between">
              <span>Client Threads</span>
              <span className="text-[#9299A6]">({filteredConversations.length})</span>
            </div>

            {/* List */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {isLoadingList ? (
                <div className="py-20 text-center text-[#9299A6] font-mono text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFBD55]" />
                  <span>Loading clients...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#9299A6]">
                  No client threads found matching query.
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
                        {conv.lastMessage ? conv.lastMessage.content : 'No messages yet in thread.'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#292E38] text-[10px] font-mono text-[#9299A6] flex items-center justify-between">
            <span>Server: Active</span>
            <span className="text-[#FFBD55]">Live Webhook Line</span>
          </div>
        </div>

        {/* Right: Active Discussion Box (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col justify-between overflow-hidden">
          {selectedClient ? (
            <>
              {/* Header */}
              <div className="pb-4 border-b border-[#292E38] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#11151D] border border-[#D6A94F]/40 flex items-center justify-center font-mono font-bold text-[#FFBD55]">
                    {selectedClient.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold font-display text-white">{selectedClient.fullName}</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#11151D] border border-[#D6A94F]/40 text-[#FFBD55] uppercase">
                        {selectedClient.role}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#9299A6] flex items-center gap-2">
                      <span>{selectedClient.email}</span>
                      {selectedClient.phone && <span>• {selectedClient.phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151D] border border-[#52D69A]/40 text-[10px] font-mono font-bold text-[#52D69A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#52D69A] animate-pulse" />
                    <span>Client Online Channel</span>
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto my-4 pr-2 space-y-4">
                {isLoadingMessages ? (
                  <div className="py-20 text-center text-[#9299A6] font-mono text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FFBD55]" />
                    <span>Loading conversation history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-[#9299A6] space-y-2">
                    <p>No messages exchanged with {selectedClient.fullName} yet.</p>
                    <p className="text-[11px] text-[#FFBD55]">Initiate the direct consultation below.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isStaff = ['owner', 'admin', 'ceo', 'super_admin', 'employee', 'team_member'].includes(msg.senderId?.role || '');
                    const isMe = msg.senderId?._id === user?.id || msg.senderId === user?.id;

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
                          className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed space-y-1 shadow-lg ${
                            isMe
                              ? 'bg-[#15191F] border border-[#D6A94F]/40 text-white rounded-tr-none'
                              : 'bg-[#11151D] border border-[#292E38] text-[#E7E9EE] rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSend} className="pt-3 border-t border-[#292E38] flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={`Reply directly to ${selectedClient.fullName}...`}
                  className="flex-1 h-[46px] px-4 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] focus:outline-none focus:border-[#D6A94F] text-xs font-sans transition-all"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="h-[46px] px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.5)] disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  style={{
                    background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                  }}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#050609]" />
                  ) : (
                    <>
                      <span>Reply</span>
                      <Send className="w-3.5 h-3.5 text-[#050609]" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="py-32 text-center text-xs text-[#9299A6]">
              Select a client from the roster on the left to begin messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

