import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Shield, Star, Award, Zap, Crown, Activity, Flame, 
  ChevronRight, Lock, CheckCircle2, Hammer, Trophy, Sparkles, 
  Gamepad2, Settings, Copy, Check, Palette, Image as ImageIcon,
  Camera, Upload, Trash2, Edit3, CheckCheck
} from 'lucide-react';
import { CHARACTERS, BADGES, PROFILE_BANNERS, isPlatformOwner } from '../constants';
import { BannerDisplay } from './BannerDisplay';

const LEVEL_UP_BASE = 80;

export const ProfileModal = ({ user, firebaseUser, onClose, isSuperAdmin, onOpenSettings, onUpdateUser, onLogout, onOpenAccount }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'badges', 'progression', 'edit'
  const [editFilter, setEditFilter] = useState('all'); // 'all', 'photo', 'banner'
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [copiedUid, setCopiedUid] = useState(false);
  const fileInputRef = useRef(null);

  const character = CHARACTERS.find(c => c.id === user.currentCharacter) || CHARACTERS[0];
  const currentBanner = PROFILE_BANNERS.find(b => b.id === user.currentBanner) || PROFILE_BANNERS[0];
  const unlockedBadges = BADGES.filter(b => (user.unlockedBadges || []).includes(b.id));

  const superAdminStatus = isSuperAdmin || isPlatformOwner(user, firebaseUser);
  
  const hasAdminAccess = !!firebaseUser && (
    superAdminStatus || 
    user.role === 'OWNER' || 
    user.role === 'MODERATOR' || 
    user.role === 'ADMIN' ||
    user.isAdmin === true
  );

  const currentLevel = user.level || 1;
  const currentExp = user.exp || 0;
  const nextLevelExp = currentLevel * LEVEL_UP_BASE;
  const progressPercent = currentLevel >= 100 ? 100 : Math.min(100, Math.round((currentExp / nextLevelExp) * 100));
  const remainingExp = Math.max(0, nextLevelExp - currentExp);

  const handleCopyUid = () => {
    if (user.uid) {
      navigator.clipboard?.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const isCharUnlocked = (char) => {
    if (char.id === 'agent-x') return true;
    const unlockedList = user.unlockedCharacters || [];
    if (char.isCode) {
      return unlockedList.includes(char.id);
    }
    return user.level >= (char.level || 1) || unlockedList.includes(char.id);
  };

  const isBannerUnlocked = (banner) => {
    if (banner.id === 'default') return true;
    const unlockedList = user.unlockedBanners || ['default'];
    return user.level >= (banner.level || 1) || unlockedList.includes(banner.id);
  };

  const handleEquipBanner = (bannerId) => {
    if (!onUpdateUser) return;
    const banner = PROFILE_BANNERS.find(b => b.id === bannerId);
    if (!banner || !isBannerUnlocked(banner)) return;
    onUpdateUser(prev => ({
      ...prev,
      currentBanner: bannerId,
      unlockedBanners: Array.from(new Set([...(prev.unlockedBanners || ['default']), bannerId]))
    }));
    setFeedbackMsg({ type: 'success', text: `Equipped ${banner.name} Banner!` });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleEquipCharacter = (charId) => {
    if (!onUpdateUser) return;
    const char = CHARACTERS.find(c => c.id === charId);
    if (!char || !isCharUnlocked(char)) return;
    onUpdateUser(prev => ({
      ...prev,
      currentCharacter: charId,
      customAvatar: null
    }));
    setFeedbackMsg({ type: 'success', text: `Equipped ${char.name} Avatar!` });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackMsg({ type: 'error', text: 'Please upload a valid image file (PNG, JPG, WEBP, GIF).' });
      setTimeout(() => setFeedbackMsg(null), 3500);
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setFeedbackMsg({ type: 'error', text: 'Image file size must be under 3MB.' });
      setTimeout(() => setFeedbackMsg(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result;
      if (base64Data && onUpdateUser) {
        onUpdateUser(prev => ({
          ...prev,
          customAvatar: base64Data
        }));
        setFeedbackMsg({ type: 'success', text: 'Profile Picture Updated Successfully!' });
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAvatar = () => {
    if (!onUpdateUser) return;
    onUpdateUser(prev => ({
      ...prev,
      customAvatar: null
    }));
    setFeedbackMsg({ type: 'success', text: 'Custom picture removed. Restored character avatar.' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const LEVEL_ROAD_TIERS = [
    { level: 1, title: 'Cine Initiate', type: 'Theme', name: 'Cyber Cyan Theme', desc: 'Electrified cyan matrix look for the site.' },
    { level: 5, title: 'Cyber Cadet', type: 'Theme & Banner', name: 'Amethyst Theme + Cyberpunk Banner', desc: 'Unlocks Amethyst Glow theme and the Neon Cyberpunk profile banner.' },
    { level: 10, title: 'Arcade Veteran', type: 'Theme & Banner', name: 'Matrix Green Theme + Terminal Banner', desc: 'Unlocks Matrix Green terminal theme and Matrix falling code banner.' },
    { level: 15, title: 'Cosmic Traveler', type: 'Theme', name: 'Cosmic Nebula Theme', desc: 'Unlocks glowing magenta and celestial stardust look.' },
    { level: 20, title: 'Synthwave Runner', type: 'Theme & Banner', name: 'Synthwave Neon Theme + Nebula Banner', desc: 'Unlocks retro 80s pink neon theme and deep space banner.' },
    { level: 25, title: 'Apex Champion', type: 'Theme', name: 'Shiny Gold & Volcanic Flame Themes', desc: 'Solid gilded gold champion theme and pulsing lava theme.' },
    { level: 35, title: 'Solar Warden', type: 'Banner', name: 'Solar Flare Profile Banner', desc: 'Blazing coronal eruption of pure energy.' },
    { level: 50, title: 'Obsidian Overlord', type: 'Banner', name: 'Abyssal Void Profile Banner', desc: 'Ultra-dark obsidian profile card banner.' },
    { level: 75, title: 'Celestial Monarch', type: 'Banner', name: 'Rainbow Aurora Banner', desc: 'Prismatic auroral wave banner display.' },
    { level: 100, title: 'Interstellar Legend', type: 'Banner', name: 'Golden Sovereign Banner', desc: 'Radiant prestige of a true Cine master.' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-5xl bg-[#0d0f14] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] z-10"
        >
          {/* Top Banner Header with Custom Unlockable Banner Graphic Engine */}
          <BannerDisplay 
            banner={currentBanner} 
            className="h-44 sm:h-52 w-full border-b border-white/10 shrink-0"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 rounded-2xl bg-black/60 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all z-20 group cursor-pointer"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Banner Meta Tag & Direct Banner Edit Trigger */}
            <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
              <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                {currentBanner.name} {currentBanner.animated ? '• ANIMATED' : ''}
              </span>
              {hasAdminAccess && (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Shield size={12} />
                  Staff
                </span>
              )}
            </div>

            {/* Quick Edit Banner Button */}
            <button
              onClick={() => {
                setActiveTab('edit');
                setEditFilter('banner');
              }}
              className="absolute bottom-4 right-6 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 hover:border-cyan-400 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer z-20 group"
            >
              <ImageIcon size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Edit Banner</span>
            </button>
          </BannerDisplay>

          {/* Profile Identity Bar */}
          <div className="px-8 sm:px-12 -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pb-6 border-b border-white/5 relative z-10 shrink-0">
            {/* Avatar & Core Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-black border-2 border-white/20 p-1 shadow-2xl flex items-center justify-center overflow-hidden relative">
                  {user.customAvatar ? (
                    <img src={user.customAvatar} alt={user.username} className="w-full h-full object-cover rounded-full" />
                  ) : character.img ? (
                    <img src={character.img} alt={character.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-cyan-400">
                      <User size={48} />
                    </div>
                  )}

                  {/* Hover Camera Overlay to Edit Picture */}
                  <button
                    onClick={() => {
                      setActiveTab('edit');
                      setEditFilter('photo');
                    }}
                    title="Change Profile Picture"
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10"
                  >
                    <Camera size={24} className="text-cyan-400 mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Edit Photo</span>
                  </button>
                </div>

                {/* Role Crown / Icon */}
                <div className="absolute -top-3 -right-2 pointer-events-none z-20">
                  {(isSuperAdmin || user.role === 'OWNER') && (
                    <div className="p-1.5 rounded-xl bg-yellow-500 text-black shadow-lg">
                      <Crown size={18} fill="currentColor" />
                    </div>
                  )}
                  {user.role === 'MODERATOR' && (
                    <div className="p-1.5 rounded-xl bg-blue-500 text-white shadow-lg">
                      <Hammer size={18} fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight">
                    {user.username}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider">
                    LVL {currentLevel}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-white/40 text-xs font-mono">
                    {user.uid ? `${user.uid.slice(0, 10)}...` : 'Local Session'}
                  </span>
                  {user.uid && (
                    <button
                      onClick={handleCopyUid}
                      title="Copy Player UID"
                      className="p-1 rounded-md text-white/30 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedUid ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Edit Profile, Admin Panel, Close */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab(activeTab === 'edit' ? 'overview' : 'edit');
                  setEditFilter('all');
                }}
                className={`px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border-cyan-500/40'
                }`}
              >
                <Edit3 size={14} />
                <span>{activeTab === 'edit' ? 'View Profile' : 'Edit Profile'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenAccount) {
                    onOpenAccount();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <User size={14} />
                <span>Account Portal</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 px-8 sm:px-12 pt-4 pb-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity size={14} />
              <span>Overview & Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer whitespace-nowrap ${
                activeTab === 'edit'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette size={14} />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer whitespace-nowrap ${
                activeTab === 'badges'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Award size={14} />
              <span>Badges ({unlockedBadges.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('progression')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer whitespace-nowrap ${
                activeTab === 'progression'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy size={14} />
              <span>Level Road</span>
            </button>
          </div>

          {/* Feedback Toast if any */}
          <AnimatePresence>
            {feedbackMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mx-8 sm:mx-12 mt-4 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 ${
                  feedbackMsg.type === 'error'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{feedbackMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content Body (Scrollable) */}
          <div className="flex-1 p-8 sm:p-12 overflow-y-auto custom-scrollbar">
            {/* EDIT PROFILE TAB */}
            {activeTab === 'edit' && (
              <div className="space-y-10">
                {/* Header & Sub-filter Switcher */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-wider text-white">Customize Identity</h3>
                    <p className="text-xs text-white/50 mt-1">Upload a custom profile photo and equip unlocked profile banners.</p>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'photo', label: 'Profile Picture' },
                      { id: 'banner', label: 'Profile Banner' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setEditFilter(f.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          editFilter === f.id
                            ? 'bg-cyan-500 text-black shadow-md'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 1: PROFILE PICTURE / AVATAR */}
                {(editFilter === 'all' || editFilter === 'photo') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                      <Camera size={18} className="text-cyan-400" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-white">Profile Picture</h4>
                    </div>

                    {/* Custom Image Uploader Card */}
                    <div className="p-6 sm:p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-black border-2 border-cyan-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                        {user.customAvatar ? (
                          <img src={user.customAvatar} alt="Current Custom Avatar" className="w-full h-full object-cover rounded-full" />
                        ) : character.img ? (
                          <img src={character.img} alt={character.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                          <User size={36} className="text-white/40" />
                        )}
                      </div>

                      <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-white">
                            {user.customAvatar ? 'Custom Upload Active' : `Preset: ${character.name}`}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                            Equipped
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Upload any custom PNG, JPG, GIF or WEBP image under 3MB. It will be showcased on your profile, top bar, and chat.
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/png, image/jpeg, image/webp, image/gif"
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                          >
                            <Upload size={14} />
                            <span>Upload Custom Photo</span>
                          </button>

                          {user.customAvatar && (
                            <button
                              onClick={handleRemoveCustomAvatar}
                              className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 size={14} />
                              <span>Remove Custom Photo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Preset Avatars Selector */}
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-white/40 block mb-4">
                        Or Choose From Unlocked Character Avatars
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {CHARACTERS.map(char => {
                          const unlocked = isCharUnlocked(char);
                          const isCurrent = !user.customAvatar && user.currentCharacter === char.id;

                          return (
                            <div
                              key={char.id}
                              onClick={() => unlocked && handleEquipCharacter(char.id)}
                              className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center relative group ${
                                isCurrent
                                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                  : unlocked
                                  ? 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.05] cursor-pointer'
                                  : 'bg-black/40 border-white/5 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <div className="w-16 h-16 rounded-full bg-black/60 border border-white/10 overflow-hidden mb-2 relative">
                                {char.img ? (
                                  <img src={char.img} alt={char.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/40">
                                    <User size={24} />
                                  </div>
                                )}

                                {!unlocked && (
                                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white/60">
                                    <Lock size={16} />
                                  </div>
                                )}
                              </div>

                              <span className="text-[11px] font-black uppercase italic text-white line-clamp-1">{char.name}</span>
                              <span className="text-[9px] font-bold text-white/40 uppercase mt-0.5">
                                {isCurrent ? (
                                  <span className="text-cyan-400 flex items-center gap-1">
                                    <Check size={10} /> Active
                                  </span>
                                ) : unlocked ? (
                                  'Ready'
                                ) : (
                                  `Lvl ${char.level || 1}`
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 2: PROFILE BANNER */}
                {(editFilter === 'all' || editFilter === 'banner') && (
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                      <ImageIcon size={18} className="text-cyan-400" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-white">Profile Banner</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PROFILE_BANNERS.map(banner => {
                        const unlocked = isBannerUnlocked(banner);
                        const isCurrent = user.currentBanner === banner.id;

                        return (
                          <div
                            key={banner.id}
                            onClick={() => unlocked && handleEquipBanner(banner.id)}
                            className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                              isCurrent
                                ? 'border-cyan-400 bg-white/[0.04] shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                                : unlocked
                                ? 'border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer'
                                : 'border-white/5 bg-black/40 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {/* Live Graphic Preview Strip */}
                            <BannerDisplay 
                              banner={banner} 
                              compact={true} 
                              className="h-20 w-full rounded-2xl border border-white/10 mb-4 p-3 flex items-start justify-between"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 shadow-md">
                                  {banner.animated && <Sparkles size={10} className="text-amber-300 animate-pulse" />}
                                  Level {banner.level}
                                </span>
                              </div>
                              {isCurrent && (
                                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                                  <CheckCheck size={12} /> Equipped
                                </span>
                              )}
                              {!unlocked && (
                                <span className="px-2.5 py-0.5 rounded-md bg-black/80 text-white/50 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-white/10">
                                  <Lock size={10} /> Locked
                                </span>
                              )}
                            </BannerDisplay>

                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <h5 className="text-sm font-black uppercase italic tracking-tight text-white">{banner.name}</h5>
                                <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">{banner.desc}</p>
                              </div>

                              <button
                                disabled={!unlocked}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (unlocked) handleEquipBanner(banner.id);
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'bg-cyan-500 text-black'
                                    : unlocked
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-white/5 text-white/30'
                                }`}
                              >
                                {isCurrent ? 'Active' : unlocked ? 'Equip' : `Lvl ${banner.level}`}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Level Progress Banner */}
                <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 shadow-inner">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest mb-3">
                    <span className="text-white/40">Level Progression</span>
                    <span className="text-cyan-400 font-mono">
                      {currentLevel >= 100 ? 'MAX REACHED' : `${currentExp} / ${nextLevelExp} XP (${progressPercent}%)`}
                    </span>
                  </div>

                  <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider mt-3">
                    <span>Current: Level {currentLevel}</span>
                    <span>{currentLevel >= 100 ? 'Supreme Master' : `${remainingExp} XP to Level ${currentLevel + 1}`}</span>
                  </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                      <Zap size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Total Score / XP</span>
                      <p className="text-2xl font-black text-white italic tracking-tight">{currentExp.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                      <Award size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Badges Earned</span>
                      <p className="text-2xl font-black text-white italic tracking-tight">{unlockedBadges.length} / {BADGES.length}</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                      <Gamepad2 size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Pinned Favorites</span>
                      <p className="text-2xl font-black text-white italic tracking-tight">{(user.pinnedGames || []).length}</p>
                    </div>
                  </div>
                </div>

                {/* Badges Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase italic tracking-wider text-white">Recent Badges</h3>
                    <button
                      onClick={() => setActiveTab('badges')}
                      className="text-xs font-black uppercase text-cyan-400 hover:text-cyan-300 tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  {unlockedBadges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {unlockedBadges.slice(0, 4).map(badge => (
                        <div key={badge.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-3">
                            <badge.icon size={22} className="text-cyan-400" />
                          </div>
                          <span className="text-xs font-black uppercase italic text-white line-clamp-1">{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center bg-black/20">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">No badges unlocked yet. Play games to earn trophies!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BADGES TAB */}
            {activeTab === 'badges' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black uppercase italic tracking-wider text-white">Trophy & Badge Showcase</h3>
                  <span className="text-xs text-white/40 font-mono">{unlockedBadges.length} Unlocked</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {BADGES.map(badge => {
                    const isUnlocked = (user.unlockedBadges || []).includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`p-5 rounded-3xl border transition-all flex flex-col items-center text-center ${
                          isUnlocked
                            ? 'bg-white/[0.03] border-white/10 shadow-lg'
                            : 'bg-black/30 border-white/5 opacity-40 grayscale'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mb-3">
                          <badge.icon size={26} className={isUnlocked ? 'text-cyan-400' : 'text-white/20'} />
                        </div>
                        <span className="text-xs font-black uppercase italic text-white tracking-tight line-clamp-1">{badge.name}</span>
                        <p className="text-[10px] text-white/50 leading-relaxed mt-1 line-clamp-2">
                          {badge.description || badge.desc || 'Awarded to dedicated Cine players.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL PROGRESSION ROAD TAB */}
            {activeTab === 'progression' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black uppercase italic tracking-wider text-white">Level Progression Road</h3>
                    <p className="text-xs text-white/40 mt-0.5">Reach milestone levels to unlock site themes and profile banners</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {LEVEL_ROAD_TIERS.map((tier) => {
                    const isPassed = currentLevel >= tier.level;
                    return (
                      <div
                        key={tier.level}
                        className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                          isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                            : 'bg-white/[0.02] border-white/10 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isPassed ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/40'
                          }`}>
                            {tier.level}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-cyan-300">
                                {tier.type}
                              </span>
                              <h4 className="text-sm font-black uppercase italic tracking-tight text-white">{tier.name}</h4>
                              {isPassed && <CheckCircle2 size={16} className="text-emerald-400" />}
                            </div>
                            <p className="text-xs text-white/50 mt-1">{tier.desc}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shrink-0 ${
                          isPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/40'
                        }`}>
                          {isPassed ? 'UNLOCKED' : `LEVEL ${tier.level}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
