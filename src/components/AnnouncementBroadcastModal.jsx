import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Megaphone, Bell, X, Sparkles, ExternalLink } from 'lucide-react';

export const AnnouncementBroadcastModal = ({ 
  announcement, 
  onDismiss, 
  onViewInNotifications 
}) => {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (!announcement) return;
    setSecondsLeft(10);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [announcement?.id]);

  if (!announcement) return null;

  const progressPercent = (secondsLeft / 10) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="pointer-events-auto relative w-full max-w-xl bg-[#0b0f19]/95 border-2 border-amber-500/50 rounded-[2rem] p-6 sm:p-7 shadow-[0_0_80px_rgba(245,158,11,0.35)] backdrop-blur-2xl overflow-hidden"
        >
          {/* Animated 10-Second Progress Bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_15px_#f59e0b]"
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
                <Crown size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    OWNER BROADCAST
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                </div>
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  Live Platform Announcement
                </h4>
              </div>
            </div>

            {/* 10s Countdown Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs font-mono font-black text-amber-400 tabular-nums">
                {secondsLeft}s
              </span>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">
                AUTO-CLOSE
              </span>
            </div>
          </div>

          {/* Announcement Body */}
          <div className="mb-6 pl-1">
            <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white tracking-tight leading-snug mb-2">
              {announcement.title || 'Important Notice'}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed max-h-32 overflow-y-auto no-scrollbar">
              {announcement.text || announcement.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <button
              onClick={() => {
                onDismiss();
                if (onViewInNotifications) onViewInNotifications();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell size={14} />
              <span>View in Notifications</span>
            </button>

            <button
              onClick={onDismiss}
              className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
            >
              Dismiss ({secondsLeft}s)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
