import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Trash2, Camera, User, Palette, Check, Sparkles, Loader2, FileText, CheckCircle2, Award, Crown, Flame, ShieldCheck, Target, Hammer } from 'lucide-react';
import { PROFILE_BANNERS, BADGES } from '../constants';
import { BannerDisplay } from './BannerDisplay';
import { resizeImageToBase64 } from '../lib/storage';
import { computeUserBadges } from './AccountPage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const CustomizeProfileModal = ({ 
  isOpen, 
  onClose, 
  user, 
  firebaseUser,
  earnedBadges: propEarnedBadges,
  onUpdateUser, 
  onUpdateUsername, 
  addNotification 
}) => {
  const allEarnedBadges = propEarnedBadges && propEarnedBadges.length > 0 
    ? propEarnedBadges 
    : computeUserBadges(user, []);

  const [username, setUsername] = useState(user?.username || 'Player');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedBanner, setSelectedBanner] = useState(user?.currentBanner || 'default');
  const [avatarPreview, setAvatarPreview] = useState(user?.customAvatar || null);
  const [selectedBadgeIds, setSelectedBadgeIds] = useState(() => {
    if (Array.isArray(user?.displayedBadgeIds)) {
      return user.displayedBadgeIds;
    }
    return allEarnedBadges.map(b => b.id);
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentBannerObj = PROFILE_BANNERS.find(b => b.id === selectedBanner) || PROFILE_BANNERS[0];
  const userLevel = user?.level || 1;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (addNotification) {
        addNotification('INVALID IMAGE', 'Please select a valid image file (PNG, JPG, WEBP).', 'error');
      }
      return;
    }

    try {
      setIsUploading(true);
      // Resize to max 256x256 and compress to keep size small (<30KB)
      const base64 = await resizeImageToBase64(file, 256, 256, 0.82);
      setAvatarPreview(base64);
      if (addNotification) {
        addNotification('PHOTO LOADED', 'Avatar photo loaded! Click Save to apply.', 'success');
      }
    } catch (err) {
      console.error('Avatar resize error:', err);
      if (addNotification) {
        addNotification('UPLOAD ERROR', 'Failed to process image file.', 'error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
  };

  const toggleBadge = (badgeId) => {
    setSelectedBadgeIds(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      } else {
        return [...prev, badgeId];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const trimmedUsername = username.trim() || user?.username || 'Player';
    const trimmedBio = bio.trim();

    try {
      if (trimmedUsername !== user?.username && onUpdateUsername) {
        await onUpdateUsername(trimmedUsername);
      }

      const updatedPayload = {
        username: trimmedUsername,
        bio: trimmedBio,
        customAvatar: avatarPreview,
        currentCharacter: 'agent-x',
        currentBanner: selectedBanner,
        displayedBadgeIds: selectedBadgeIds,
        unlockedBanners: Array.from(new Set([...(user?.unlockedBanners || ['default']), selectedBanner]))
      };

      if (onUpdateUser) {
        await onUpdateUser(prev => ({
          ...prev,
          ...updatedPayload
        }));
      }

      // Direct write to Firestore to ensure bio and chosen badges stay permanently!
      const targetUid = firebaseUser?.uid || user?.uid;
      if (targetUid) {
        try {
          await updateDoc(doc(db, 'users', targetUid), {
            username: trimmedUsername,
            bio: trimmedBio,
            customAvatar: avatarPreview,
            currentBanner: selectedBanner,
            displayedBadgeIds: selectedBadgeIds
          });
        } catch (dbErr) {
          console.warn('Direct user Firestore update notice:', dbErr);
        }
      }

      if (addNotification) {
        addNotification('PROFILE UPDATED', 'Your profile identity, bio, and badge choices were saved!', 'success', <Sparkles className="text-blue-400" size={14} />);
      }
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
      if (addNotification) {
        addNotification('SAVE ERROR', 'Failed to update profile.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2500] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[#0c0f18] border border-blue-500/30 rounded-[2.5rem] shadow-[0_0_80px_rgba(59,130,246,0.25)] relative overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/15 rounded-full blur-[80px] pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between shrink-0 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles size={12} className="text-blue-400" />
              <span>CUSTOMIZE PROFILE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight uppercase">
              Profile Customization
            </h2>
            <p className="text-xs text-white/50 mt-1">Customize your avatar, name, bio, displayed badges, and banners.</p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 relative z-10">
          {/* Live Preview Card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <div className={`h-32 w-full bg-gradient-to-r ${currentBannerObj.gradient} relative flex items-end p-4`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-black border-2 border-blue-400 p-0.5 overflow-hidden shadow-2xl flex items-center justify-center shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-blue-300">
                      <User size={28} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black italic uppercase text-white truncate">{username || 'Player'}</h3>
                    {/* Live preview of chosen badges */}
                    <div className="flex items-center gap-1">
                      {allEarnedBadges
                        .filter(b => selectedBadgeIds.includes(b.id))
                        .slice(0, 4)
                        .map(badge => {
                          const Icon = badge.icon || Award;
                          return (
                            <div key={badge.id} className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center" title={badge.name}>
                              <Icon size={11} />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  {bio ? (
                    <p className="text-[11px] text-white/70 line-clamp-1 italic mt-0.5">{bio}</p>
                  ) : (
                    <p className="text-[10px] text-white/40 italic mt-0.5">No bio set</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: PROFILE PICTURE */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black uppercase italic tracking-wider text-white flex items-center gap-2">
                  <Camera size={16} className="text-blue-400" />
                  <span>Profile Picture (Avatar)</span>
                </h4>
                <p className="text-xs text-white/50 mt-0.5">Upload your custom picture, or remove to use the default person icon.</p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                <span>{avatarPreview ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 size={15} />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 2: CHANGE NAME */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <h4 className="text-sm font-black uppercase italic tracking-wider text-white flex items-center gap-2">
              <User size={16} className="text-purple-400" />
              <span>Change Name</span>
            </h4>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={24}
              placeholder="Enter your gamer name..."
              className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* SECTION 3: CHANGE PROFILE BIO */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black uppercase italic tracking-wider text-white flex items-center gap-2">
                  <FileText size={16} className="text-blue-400" />
                  <span>Profile Bio</span>
                </h4>
                <p className="text-xs text-white/50 mt-0.5">Leave blank for zero bio until you write one.</p>
              </div>
              <span className="text-[10px] font-mono text-white/40">{bio.length}/160</span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Write a bio to display on your profile (optional)..."
              className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-blue-500 resize-none transition-colors"
            />
          </div>

          {/* SECTION 4: CHOOSE WHICH BADGES ARE SHOWN ON PROFILE */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black uppercase italic tracking-wider text-white flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  <span>Badges Displayed on Profile</span>
                </h4>
                <p className="text-xs text-white/50 mt-0.5">Choose which earned badges are shown next to your name.</p>
              </div>
              <span className="text-[10px] font-black uppercase text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 rounded-full">
                {selectedBadgeIds.length} Selected
              </span>
            </div>

            {allEarnedBadges.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-white/40 italic">
                You haven't earned any badges yet. Play games and level up to unlock badges!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allEarnedBadges.map((badge) => {
                  const isChecked = selectedBadgeIds.includes(badge.id);
                  const Icon = badge.icon || Award;

                  return (
                    <div
                      key={badge.id}
                      onClick={() => toggleBadge(badge.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-500/15 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                          : 'bg-[#121624] border-white/10 opacity-60 hover:opacity-100 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                          isChecked 
                            ? 'bg-blue-500/25 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                            : 'bg-white/5 border-white/10 text-white/40'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="text-xs font-black uppercase tracking-tight text-white block truncate">
                            {badge.name}
                          </span>
                          <span className="text-[10px] text-white/50 block truncate">
                            {badge.requirement || badge.desc}
                          </span>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        isChecked 
                          ? 'bg-blue-500 border-blue-400 text-white' 
                          : 'border-white/20 bg-black/40'
                      }`}>
                        {isChecked && <Check size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 5: PROFILE BANNER THEMES */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <h4 className="text-sm font-black uppercase italic tracking-wider text-white flex items-center gap-2">
              <Palette size={16} className="text-purple-400" />
              <span>Profile Banner Theme</span>
            </h4>
            <p className="text-xs text-white/50">Level up to unlock cooler high-tier cosmic and divine banners.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PROFILE_BANNERS.map((banner) => {
                const isSelected = selectedBanner === banner.id;
                const isUnlocked = userLevel >= (banner.level || 1);

                return (
                  <div
                    key={banner.id}
                    onClick={() => {
                      if (isUnlocked) setSelectedBanner(banner.id);
                      else if (addNotification) {
                        addNotification('LOCKED BANNER', `Reach Level ${banner.level} on the Level Road to equip this banner.`, 'warning');
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all relative ${
                      !isUnlocked 
                        ? 'opacity-40 cursor-not-allowed border-white/5 bg-black/60' 
                        : isSelected
                        ? 'border-blue-400 bg-blue-500/15 shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer'
                        : 'border-white/10 bg-[#121624] hover:border-white/25 cursor-pointer'
                    }`}
                  >
                    <BannerDisplay 
                      banner={banner} 
                      compact={true} 
                      className="h-14 w-full rounded-lg mb-2.5 border border-white/10" 
                    />
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <span className="text-xs font-black uppercase text-white truncate block">{banner.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-bold text-white/40 block">LVL {banner.level}</span>
                          {banner.animated && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20">
                              ANIMATED
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected ? (
                        <Check size={14} className="text-blue-400 shrink-0" />
                      ) : !isUnlocked ? (
                        <span className="text-[8px] font-black uppercase text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0">
                          LVL {banner.level}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 sm:p-8 border-t border-white/10 flex items-center justify-end gap-3 shrink-0 relative z-10 bg-[#090b12]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(59,130,246,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            <span>Save Profile</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
