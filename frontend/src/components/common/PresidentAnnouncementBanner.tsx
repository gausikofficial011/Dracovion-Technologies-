import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Megaphone, ArrowRight, X, Sparkles, AlertCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PresidentAnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<any | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if dismissed in this browser session
    const dismissedId = sessionStorage.getItem('dracovion_dismissed_announcement');

    api.get<{ success: boolean; announcement: any | null }>('/announcements/active')
      .then((res) => {
        if (res.announcement && res.announcement._id !== dismissedId) {
          setAnnouncement(res.announcement);
        } else {
          setAnnouncement(null);
        }
      })
      .catch(() => {
        setAnnouncement(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    if (announcement?._id) {
      sessionStorage.setItem('dracovion_dismissed_announcement', announcement._id);
    }
    setIsDismissed(true);
  };

  if (isLoading || !announcement || !announcement.isActive || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full relative z-50 bg-[#080A0E] border-b border-[#D6A94F]/60 shadow-[0_4px_30px_rgba(214,169,79,0.25)] text-white overflow-hidden"
        aria-label="Official Platform Announcement"
      >
        {/* Subtle Ambient Gold Gradient Trace */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,189,85,0.12)_0%,transparent_75%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Left: Official Badge & Title */}
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 flex-1 overflow-hidden">
            <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-[#050609] bg-gradient-to-r from-[#FFBD55] via-[#D6A94F] to-[#F5D18A] flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 text-[#050609]" />
              <span>
                {announcement.badge && !/president/i.test(announcement.badge)
                  ? announcement.badge
                  : 'OFFICIAL ANNOUNCEMENT'}
              </span>
            </span>

            <div className="overflow-hidden flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 text-xs">
              <strong className="text-white font-display font-bold shrink-0 tracking-wide text-[12px] sm:text-xs">
                {announcement.title}:
              </strong>
              <span className="text-[#E7E9EE] text-xs leading-relaxed truncate sm:line-clamp-1 font-sans">
                {announcement.message}
              </span>
            </div>
          </div>

          {/* Right: Action Link & Dismiss Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
            {announcement.linkUrl && (
              announcement.linkUrl.startsWith('http') ? (
                <a
                  href={announcement.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-bold text-[#FFBD55] hover:text-white bg-[#15191F] border border-[#D6A94F]/40 hover:border-[#FFBD55] transition-all"
                >
                  <span>{announcement.linkLabel || 'Read Statement →'}</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              ) : (
                <Link
                  to={announcement.linkUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono font-bold text-[#FFBD55] hover:text-white bg-[#15191F] border border-[#D6A94F]/40 hover:border-[#FFBD55] transition-all"
                >
                  <span>{announcement.linkLabel || 'Read Statement →'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-[#9299A6] hover:text-white hover:bg-[#15191F] transition-colors cursor-pointer"
              aria-label="Dismiss official announcement"
              title="Close announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

