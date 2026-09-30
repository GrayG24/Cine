import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, ShieldAlert, Flag, Send, CheckCircle2, User, Gamepad2, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ACCOUNT_REASONS = [
  { id: 'harassment', label: 'Harassment & Toxic Behavior', desc: 'Hate speech, personal attacks, or aggressive chat.' },
  { id: 'inappropriate', label: 'Inappropriate Username or Avatar', desc: 'Offensive, vulgar, or disallowed profile visuals.' },
  { id: 'cheating', label: 'Cheating & Score Exploits', desc: 'Using unauthorized scripts, auto-clickers, or hacked XP.' },
  { id: 'spam', label: 'Spamming & Chat Flooding', desc: 'Mass repeating messages or advertising unauthorized links.' },
  { id: 'rules', label: 'Breaking Community Guidelines', desc: 'General disregard of platform behavior policies.' },
];

const GAME_REASONS = [
  { id: 'black_screen', label: "Game doesn't load / Blank screen", desc: 'Stuck on black or white loading container.' },
  { id: 'controls', label: 'Controls not responding', desc: 'Keyboard or mouse inputs do not register.' },
  { id: 'crash', label: 'Game crashes or freezes', desc: 'Freezes mid-gameplay or throws unhandled script error.' },
  { id: 'broken_link', label: 'Broken embed / Blocked by host', desc: 'Host server refuses connection or iframe error.' },
  { id: 'glitch', label: 'Severe progression glitch', desc: 'Cannot pass levels or assets are corrupted.' },
];

export const ReportModal = ({ 
  isOpen, 
  onClose, 
  reportType = 'game_broken', // 'game_broken' | 'account_reported'
  target = null, 
  currentUser = null,
  addNotification 
}) => {
  const isGame = reportType === 'game_broken';
  const reasons = isGame ? GAME_REASONS : ACCOUNT_REASONS;

  const [selectedReason, setSelectedReason] = useState(reasons[0].label);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !target) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const targetId = isGame ? (target.id || 'game') : (target.uid || target.username || 'user');
      const targetName = isGame ? (target.title || 'Unknown Game') : (target.username || 'Unknown User');

      await addDoc(collection(db, 'reports'), {
        type: reportType,
        targetId: String(targetId),
        targetName: String(targetName),
        targetEmail: target.email || null,
        targetAvatar: target.customAvatar || null,
        reason: selectedReason,
        details: details.trim(),
        reportedByUid: currentUser?.uid || 'guest_user',
        reportedByName: currentUser?.username || 'Guest Player',
        status: 'pending',
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });

      setIsSuccess(true);
      if (addNotification) {
        addNotification(
          'REPORT SUBMITTED',
          `Your report for ${targetName} was sent to the owner for review.`,
          'success'
        );
      }

      setTimeout(() => {
        setIsSuccess(false);
        setDetails('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting report:', err);
      if (addNotification) {
        addNotification('ERROR', 'Failed to submit report. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-[#0e121a] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">
              Report Sent to Owner
            </h3>
            <p className="text-xs font-medium text-white/60 max-w-xs uppercase tracking-wider">
              Thank you for keeping Cine safe and operational. The owner has been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isGame 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              }`}>
                {isGame ? <Gamepad2 size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest block ${
                  isGame ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {isGame ? 'FLAG BROKEN GAME' : 'REPORT USER ACCOUNT'}
                </span>
                <h3 className="text-xl font-black italic uppercase text-white tracking-tight truncate max-w-[280px]">
                  {isGame ? (target.title || 'Game') : `@${target.username || 'User'}`}
                </h3>
              </div>
            </div>

            {/* Target Card Preview */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
              {isGame ? (
                <div className="w-10 h-10 rounded-xl bg-black overflow-hidden shrink-0 border border-white/10">
                  <img src={target.cover} alt={target.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-black overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                  {target.customAvatar ? (
                    <img src={target.customAvatar} alt={target.username} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User size={20} className="text-white/40" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase italic text-white truncate">
                  {isGame ? target.title : target.username}
                </p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  {isGame ? `${target.category} Game` : (target.level ? `Level ${target.level} Player` : 'Community Account')}
                </p>
              </div>
            </div>

            {/* Reason selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block">
                Select Primary Issue
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {reasons.map((r) => {
                  const isSelected = selectedReason === r.label;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReason(r.label)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected 
                          ? isGame 
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200' 
                            : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-white/70'
                      }`}
                    >
                      <p className="text-xs font-black uppercase tracking-wider">{r.label}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{r.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description textarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 block">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder={isGame ? "Describe when the game breaks or what happens..." : "Describe what the user did or provide context..."}
                className="w-full bg-[#121622] border border-white/10 rounded-xl p-3 text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none transition-all"
              />
            </div>

            {/* Submit button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3.5 px-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isGame
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 shadow-rose-500/20'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Flag size={14} />
                    <span>Send Report to Owner</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
