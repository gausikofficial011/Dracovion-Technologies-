import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, resolveApiUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  DownloadCloud,
  Send,
  MessageSquare,
  Shield,
  Layers,
  FileArchive,
  User,
  Sparkles,
  Lock,
  Unlock,
  Phone,
  QrCode,
  ExternalLink,
  Paperclip,
  Loader2,
} from 'lucide-react';
import {
  type ChatAttachmentFile,
  mergeMessagesById,
  uploadChatAttachment,
  useChatStream,
} from '../../hooks/useChatRealtime';
import { MessageAttachmentsList, StagedAttachmentsBar } from '../../components/chat/ChatAttachments';

export const ClientProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stagedAttachments, setStagedAttachments] = useState<ChatAttachmentFile[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScrolledRef = useRef<string>('');

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.get<{ success: boolean; project: any }>(`/projects/${id}`),
      api.get<{ success: boolean; messages: any[] }>(`/messages/project/${id}`),
    ])
      .then(([projRes, msgRes]) => {
        setProject(projRes.project);
        setMessages(msgRes.messages || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const { isStreamConnected } = useChatStream(Boolean(user && id), (evt) => {
    if (evt?.channelType === 'project' && String(evt.projectId) === String(id) && evt.message) {
      setMessages(prev => mergeMessagesById(prev, [evt.message]));
    }
  });

  useEffect(() => {
    if (!id) return;
    const timer = setInterval(() => {
      api
        .get<{ success: boolean; messages: any[] }>(`/messages/project/${id}`)
        .then(res => {
          if (Array.isArray(res?.messages)) setMessages(prev => mergeMessagesById(prev, res.messages));
        })
        .catch(() => {});
    }, isStreamConnected ? 8000 : 3000);
    return () => clearInterval(timer);
  }, [id, isStreamConnected]);

  useEffect(() => {
    const key = `${id || ''}:${messages.length}:${messages[messages.length - 1]?._id || ''}`;
    if (lastScrolledRef.current !== key) {
      lastScrolledRef.current = key;
      if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [id, messages]);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setIsUploadingAttachment(true);
    setChatError(null);
    try {
      const uploaded: ChatAttachmentFile[] = [];
      for (const file of list.slice(0, 5 - stagedAttachments.length)) {
        uploaded.push(await uploadChatAttachment(file, id));
      }
      setStagedAttachments(prev => [...prev, ...uploaded]);
    } catch (err: any) {
      setChatError(err?.message || 'Failed to upload attachment.');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && stagedAttachments.length === 0) || isSending) return;
    setIsSending(true);
    setChatError(null);
    try {
      const res = await api.post<{ success: boolean; message: any }>(
        `/messages/project/${id}`,
        {
          content: newMessage.trim(),
          attachments: stagedAttachments.map(a => a._id),
        }
      );
      setMessages(prev => mergeMessagesById(prev, [res.message]));
      setNewMessage('');
      setStagedAttachments([]);
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-[#9299A6] font-mono text-sm">Loading project workspace...</div>;
  }

  if (!project) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-white">Project Not Found or Unauthorized</h2>
        <Link to="/portal/projects" className="text-xs text-[#FFBD55] hover:underline">
          Return to My Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      <Link
        to="/portal/projects"
        className="inline-flex items-center gap-1.5 text-xs text-[#9299A6] hover:text-[#FFBD55] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to My Projects</span>
      </Link>

      {/* Project Header Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#FFBD55] bg-[#11151D] px-3 py-1 rounded-lg border border-[#292E38] font-bold">
              {project.projectCode}
            </span>
            <StatusBadge status={project.status} size="md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">{project.title}</h1>
          <p className="text-xs sm:text-sm text-[#B7BBC4] max-w-2xl leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] shrink-0 text-right sm:text-left">
          <span className="text-[10px] font-mono text-[#D6A94F] uppercase tracking-wider block font-semibold">
            Sprint Progress
          </span>
          <div className="text-2xl font-bold text-white font-mono mt-0.5">{project.progressPercent}%</div>
          <div className="w-36 h-2 rounded-full bg-[#080A0E] overflow-hidden mt-1.5 border border-[#292E38]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${project.progressPercent}%`,
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Milestones & Deliverables Vault */}
        <div className="lg:col-span-2 space-y-8">
          {/* Milestones Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FFBD55]" />
                <span>Sprint Milestones</span>
              </h3>
              <span className="text-xs font-mono text-[#9299A6]">
                {project.milestones.filter((m: any) => m.status === 'completed').length} of {project.milestones.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {project.milestones.map((milestone: any, idx: number) => {
                const isDone = milestone.status === 'completed';
                const isInProgress = milestone.status === 'in_progress';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isDone
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : isInProgress
                        ? 'bg-[#11151D] border-[#D6A94F]/40 shadow-[0_0_15px_rgba(214,169,79,0.15)]'
                        : 'bg-[#11151D]/50 border-[#292E38]'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Clock className={`w-5 h-5 ${isInProgress ? 'text-[#FFBD55] animate-pulse' : 'text-[#9299A6]'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold ${isDone ? 'text-slate-200' : 'text-white'}`}>
                          {milestone.title}
                        </h4>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#080A0E] text-[#FFBD55] border border-[#292E38]">
                          {milestone.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-xs text-[#9299A6] mt-1 leading-relaxed">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deliverables Vault Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-[#FFBD55]" />
                <span>Authorized Deliverables Vault</span>
              </h3>
              <span className="text-xs font-mono flex items-center gap-1 font-semibold text-[#52D69A]">
                <Unlock className="w-3.5 h-3.5 text-[#52D69A]" />
                <span>Deliverables Ready</span>
              </span>
            </div>

            {project.deliverables && project.deliverables.length > 0 ? (
              <div className="space-y-3">
                {project.deliverables.map((deliv: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/40 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 rounded-xl bg-[#080A0E] border border-[#292E38] text-[#FFBD55] shrink-0">
                        <FileArchive className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-sm font-bold text-white truncate">{deliv.title}</div>
                        <div className="text-[11px] font-mono text-[#9299A6]">
                          {deliv.originalName} • {(deliv.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <a
                      href={resolveApiUrl(`/files/${deliv.fileKey}/download`)}
                      download
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#050609] shadow-[0_0_15px_rgba(214,169,79,0.35)] hover:shadow-[0_0_25px_rgba(255,189,85,0.5)] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                      style={{
                        background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
                      }}
                    >
                      <DownloadCloud className="w-3.5 h-3.5 text-[#050609]" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#11151D] border border-[#292E38] text-center space-y-2 text-xs text-[#9299A6]">
                <DownloadCloud className="w-6 h-6 text-[#FFBD55] mx-auto" />
                <div className="text-sm font-bold text-white font-display">Artifacts in Development</div>
                <p className="max-w-md mx-auto text-[#9299A6]">
                  Production artifacts, source repositories, and deployment assets will appear here directly upon milestone completion.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Project Discussion Chat */}
        <div className="p-6 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl flex flex-col h-[560px] max-h-[80dvh] min-h-0 justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-[#292E38] mb-3 shrink-0">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FFBD55]" />
              <span>Project Discussion</span>
            </h3>
            <span className="text-[11px] font-mono text-[#9299A6]">
              {messages.length} Messages
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div ref={feedRef} data-lenis-prevent className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1 mb-3">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#9299A6]">
                No messages yet. Send a note or screenshot to the engineering team.
              </div>
            ) : (
              messages.map((msg: any) => (
                <div key={msg._id} className="p-3 rounded-xl bg-[#11151D] border border-[#292E38] text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#9299A6]">
                    <span className="font-bold text-[#FFBD55]">
                      {msg.senderId?.fullName || 'Participant'}
                    </span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {msg.content && <p className="text-[#E7E9EE] leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                  <MessageAttachmentsList attachments={msg.attachments} />
                </div>
              ))
            )}
          </div>

          {chatError && (
            <div className="mb-2 p-2 rounded-lg bg-rose-950/50 border border-rose-500/40 text-[11px] text-rose-200 flex items-center justify-between">
              <span>{chatError}</span>
              <button type="button" onClick={() => setChatError(null)} className="text-[10px] font-mono uppercase cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          <StagedAttachmentsBar
            files={stagedAttachments}
            onRemove={(attId) => setStagedAttachments(prev => prev.filter(f => f._id !== attId))}
          />

          {/* Message Composer */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#292E38] flex gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAttachment || stagedAttachments.length >= 5}
              title="Attach file or paste screenshot"
              className="p-2.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-[#FFBD55] disabled:opacity-40 cursor-pointer shrink-0"
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
              onPaste={e => {
                if (e.clipboardData?.files?.length) {
                  e.preventDefault();
                  handleFiles(e.clipboardData.files);
                }
              }}
              placeholder="Type message or paste screenshot..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#11151D] border border-[#292E38] text-white placeholder-[#9299A6] focus:outline-none focus:border-[#D6A94F] text-xs"
            />
            <button
              type="submit"
              disabled={isSending || isUploadingAttachment || (!newMessage.trim() && stagedAttachments.length === 0)}
              className="p-2.5 rounded-xl text-[#050609] shadow-[0_0_15px_rgba(214,169,79,0.35)] hover:shadow-[0_0_25px_rgba(255,189,85,0.5)] disabled:opacity-40 transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            >
              <Send className="w-4 h-4 text-[#050609]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
