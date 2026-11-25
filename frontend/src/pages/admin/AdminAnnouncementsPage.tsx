import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Megaphone,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminAnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State for New Announcement
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState('OFFICIAL ANNOUNCEMENT');
  const [type, setType] = useState<'presidential' | 'critical' | 'release' | 'general'>('presidential');
  const [linkUrl, setLinkUrl] = useState('/allhunter');
  const [linkLabel, setLinkLabel] = useState('Explore Innovations →');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get<{ success: boolean; announcements: any[] }>('/announcements/admin/all');
      setAnnouncements(res.announcements || []);
    } catch {
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please provide both an announcement title and the broadcast message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; message: string; announcement: any }>(
        '/announcements/admin',
        {
          title: title.trim(),
          message: message.trim(),
          badge: badge.trim(),
          type,
          linkUrl: linkUrl.trim() || undefined,
          linkLabel: linkLabel.trim() || undefined,
          isActive,
        }
      );

      setSuccessMsg(res.message || 'Presidential announcement published live!');
      setTitle('');
      setMessage('');
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.patch<{ success: boolean; message: string; announcement: any }>(
        `/announcements/admin/${id}/toggle`,
        {}
      );
      setSuccessMsg(res.message);
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle broadcast.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this presidential announcement record permanently?')) {
      return;
    }

    try {
      await api.delete(`/announcements/admin/${id}`);
      setSuccessMsg('Announcement record deleted.');
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292E38] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-2">
            <Radio className="w-3.5 h-3.5 text-[#FFBD55] animate-pulse" />
            <span>EXECUTIVE BROADCAST DESK</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white">President's Public Announcements</h1>
          <p className="text-xs sm:text-sm text-[#9299A6] mt-1 max-w-2xl">
            Publish official announcements from the Platform President. Active broadcasts appear instantly at the very top of the website frontpage for every visitor.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#080A0E] border border-[#292E38] flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFBD55] to-[#D6A94F] text-[#050609] flex items-center justify-center font-bold text-xs shadow-md">
            👑
          </div>
          <div>
            <div className="text-xs font-bold text-white">Presidential Desk</div>
            <div className="text-[10px] font-mono text-emerald-400">Frontpage Banner Sync Active</div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D6A94F] font-bold flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FFBD55]" />
            <span>Frontpage Visitor Live Preview</span>
          </span>
          <span className="text-[10px] font-mono text-[#9299A6]">Top of Homepage</span>
        </div>

        {/* Live Banner Preview */}
        <div className="p-4 rounded-2xl bg-[#080A0E] border border-[#D6A94F]/60 shadow-[0_0_30px_rgba(214,169,79,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5 flex-1 overflow-hidden">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-[#050609] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] shrink-0">
              {badge || "PRESIDENT'S BROADCAST"}
            </span>
            <div className="truncate">
              <strong className="text-white font-bold mr-2">
                {title || 'Official Platform Directive'}:
              </strong>
              <span className="text-slate-300">
                {message || 'Your public statement or website announcement will render here for every visitor.'}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-bold text-[#FFBD55] bg-[#15191F] border border-[#D6A94F]/40 shrink-0 self-end sm:self-auto">
            <span>{linkLabel || 'Explore Details →'}</span>
          </span>
        </div>
      </div>

      {/* Create Announcement Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#292E38] pb-3">
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#FFBD55]" />
            <span>Publish New Frontpage Announcement</span>
          </h2>
          <span className="text-xs font-mono text-[#9299A6]">Public Website Broadcast</span>
        </div>

        <form onSubmit={handleCreateAnnouncement} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Title / Headline */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                Announcement Headline / Topic *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Welcome to Dracovion Technologies • Next-Gen Digital Forge"
                className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
              />
            </div>

            {/* Badge Tag */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                Badge Header *
              </label>
              <input
                type="text"
                required
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. PRESIDENT'S BROADCAST"
                className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-[#FFBD55] focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Full Announcement Text */}
          <div>
            <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
              Broadcast Message Content *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. We are proud to unveil our expanded AI Architecture capabilities and the Allhunter Student Engineering Foundation across Tamil Nadu. Explore our verified engineering projects and client deliverables."
              className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs leading-relaxed focus:border-[#FFBD55] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Action Link URL */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                Action Button URL (Optional)
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="e.g. /allhunter or /start-project or /services"
                className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs font-mono focus:border-[#FFBD55] focus:outline-none"
              />
            </div>

            {/* Button Label */}
            <div>
              <label className="block text-[11px] font-semibold text-[#D6A94F] uppercase font-mono mb-1.5">
                Button Label
              </label>
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="e.g. Explore Innovations →"
                className="w-full px-4 py-3 rounded-xl bg-[#11151D] border border-[#292E38] text-white text-xs focus:border-[#FFBD55] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#292E38]">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="broadcastActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-[#11151D] border border-[#292E38] text-[#FFBD55] focus:ring-0"
              />
              <label htmlFor="broadcastActive" className="text-xs text-white font-medium cursor-pointer">
                Publish Live on Public Frontpage Immediately
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider text-[#050609] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.55)] hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#050609]" />
                  <span>Transmitting Broadcast...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#050609]" />
                  <span>Broadcast to Frontpage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Announcements History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#080A0E] border border-[#292E38] shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#292E38] pb-3">
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FFBD55]" />
            <span>Presidential Broadcast Archives</span>
          </h2>
          <span className="text-xs font-mono text-[#9299A6]">{announcements.length} Records</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-[#9299A6]">Loading broadcasts...</div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#9299A6] space-y-2">
            <Radio className="w-8 h-8 text-[#9299A6] mx-auto opacity-40" />
            <p>No presidential announcements published yet. Use the form above to post your first broadcast.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div
                key={item._id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  item.isActive
                    ? 'bg-[#11151D] border-[#D6A94F]/80 shadow-[0_0_20px_rgba(214,169,79,0.15)]'
                    : 'bg-[#0A0D13] border-[#292E38] opacity-70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        item.isActive
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700'
                          : 'bg-[#15191F] text-[#9299A6] border border-[#292E38]'
                      }`}
                    >
                      {item.isActive ? '● LIVE ON FRONTPAGE' : '○ INACTIVE'}
                    </span>
                    <span className="text-[10px] font-mono text-[#FFBD55] uppercase font-bold">{item.badge}</span>
                    <span className="text-[10px] font-mono text-[#9299A6]">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(item._id)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer ${
                        item.isActive
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60'
                          : 'bg-[#15191F] text-slate-300 border border-[#292E38] hover:text-white'
                      }`}
                    >
                      {item.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{item.isActive ? 'Turn Off Broadcast' : 'Make Active'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-xl text-[#9299A6] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white font-display">{item.title}</h3>
                  <p className="text-xs text-[#B7BBC4] mt-1 leading-relaxed">{item.message}</p>
                </div>

                {item.linkUrl && (
                  <div className="text-[11px] font-mono text-[#78BFFF] flex items-center gap-1">
                    <span>Link: {item.linkUrl}</span>
                    <span className="text-[#9299A6]">({item.linkLabel})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

