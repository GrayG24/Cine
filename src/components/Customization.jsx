import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Shield, 
  Layers, 
  Bot, 
  User, 
  ChevronRight, 
  Check, 
  Crown, 
  Sparkles, 
  Activity, 
  Zap, 
  Lock, 
  Award, 
  Eye, 
  Trophy, 
  Compass, 
  Flame,
  Upload,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { CHARACTERS, PROFILE_BANNERS } from '../constants';
import { BannerDisplay } from './BannerDisplay';

export const Customization = ({ user, onUpdateUser, onUpdateUsername }) => {
  const [activeTab, setActiveTab] = useState('identity');
  const [tempUsername, setTempUsername] = useState(user.username);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Define All 16 System Themes with distinct colors and special characteristics to match index.css Variables
  const themes = [
    { id: 'void', name: 'PURE VOID', primary: '#f4f4f5', bg: '#020202', desc: 'Ultra-minimalist pitch-black obsidian space.', level: 1, type: 'basic' },
    { id: 'cyan', name: 'CYBER CYAN', primary: '#00f2ff', bg: '#083344', desc: 'Bright glowing electric cyan grid.', level: 1, type: 'basic' },
    
    { id: 'violet', name: 'AMETHYST GLOW', primary: '#bf80ff', bg: '#130a1c', desc: 'Mystical deep amethyst velvet.', level: 5, type: 'advanced' },
    { id: 'cobalt', name: 'COBALT BLUE', primary: '#2563eb', bg: '#030712', desc: 'Tech blue sci-fi military console.', level: 5, type: 'advanced' },
    
    { id: 'emerald', name: 'MATRIX GREEN', primary: '#39ff14', bg: '#020804', desc: 'Digital terminal hacker interface.', level: 10, type: 'advanced' },
    
    { id: 'galaxy', name: 'COSMIC NEBULA', primary: '#d946ef', bg: '#0b0114', desc: 'Glowing magenta and stardust cosmic purple.', level: 15, type: 'rare' },
    { id: 'synthwave', name: 'SYNTHWAVE NEON', primary: '#ff007f', bg: '#1a051d', desc: '80s retro sunset glow with pink grid.', level: 20, type: 'rare' },
    
    { id: 'gold', name: 'SHINY GOLD', primary: '#ffd700', bg: '#1a0d00', desc: 'Gilded champion polished solid gold.', level: 25, type: 'epic' },
    { id: 'fire', name: 'VOLCANIC FLAME', primary: '#ff4500', bg: '#0c0201', desc: 'Pulsing hot molten lava and basalt.', level: 25, type: 'epic' },
    
    // Code/Special Themes Custom Config
    { id: 'rainbow', name: 'RAINBOW CODES', primary: '#f43f5e', bg: '#08020f', desc: 'Beautiful cycling neon color spectrum.', isCode: true, type: 'mythic' },
    { id: 'spongebob', name: 'BEACH BUBBLES', primary: '#fde047', bg: '#050b1a', desc: 'Bright yellow bubbles and nautical navy.', isCode: true, type: 'rare' },
    { id: 'kanye', name: 'GRADUATION BEATS', primary: '#c084fc', bg: '#0e0514', desc: 'Moody lavender lo-fi vinyl beats.', isCode: true, type: 'epic' },
    { id: 'hologram', name: 'HOLOGRAM BLUE', primary: '#a5f3fc', bg: '#040814', desc: 'CRT scanlines and glitched ice-blue holograms.', isCode: true, type: 'legendary' },
    { id: 'ironman', name: 'ARC TECHNOLOGY', primary: '#dc2626', bg: '#110103', desc: 'Armor-plated hot rod crimson and gold.', isCode: true, type: 'epic' },
    { id: 'usa', name: 'PATRIOT PRIDE', primary: '#3b82f6', bg: '#0f0505', desc: 'Patriotic glowing stars and striped neon.', isCode: true, type: 'rare' },
    { id: 'tester', name: 'BETA TESTING', primary: '#ff2a85', bg: '#080a10', desc: 'Dotted experimental rose pink system grid.', isCode: true, type: 'mythic' },
    { id: 'glitch', name: 'SYSTEM GLITCH', primary: '#ff00ff', bg: '#04010a', desc: 'Chaotic cyber aberration glitch overlays.', isCode: true, type: 'mythic' },
    { id: 'doge', name: 'SO MUCH DOGE', primary: '#d97706', bg: '#241a0f', desc: 'Very golden-brown toast, much warm glow.', isCode: true, type: 'mythic' },
    { id: 'owner', name: 'OWNER EXCLUSIVE', primary: '#fbbf24', bg: '#0a0104', desc: 'Ultimate VIP crown rainbow gold.', isCode: true, type: 'transcendent' },
  ];

  const handleUsernameChange = (e) => {
    setTempUsername(e.target.value);
    setUsernameStatus(null);
  };

  const submitUsername = () => {
    const trimmed = tempUsername.trim();
    if (!trimmed || trimmed === user.username) return;
    try {
      onUpdateUsername(trimmed);
      setUsernameStatus({ type: 'success', text: 'USERNAME UPDATED IMMEDIATELY!' });
    } catch (e) {
      setUsernameStatus({ type: 'error', text: 'FAILED TO UPDATE USERNAME.' });
    }
  };

  // Safe checks for unlocks
  const isCharUnlocked = (char) => {
    if (char.id === 'agent-x') return true;
    const unlockedList = user.unlockedCharacters || [];
    if (char.isCode) {
      return unlockedList.includes(char.id);
    }
    return user.level >= (char.level || 1) || unlockedList.includes(char.id);
  };

  const isThemeUnlocked = (theme) => {
    if (theme.id === 'void' || theme.id === 'cyan') return true;
    const unlockedList = user.unlockedThemes || [];
    if (theme.isCode) {
      return unlockedList.includes(theme.id);
    }
    return user.level >= (theme.level || 1) || unlockedList.includes(theme.id);
  };

  const isBannerUnlocked = (banner) => {
    if (banner.id === 'default') return true;
    const unlockedList = user.unlockedBanners || [];
    return user.level >= (banner.level || 1) || unlockedList.includes(banner.id);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Limit to ~3MB
    if (file.size > 3 * 1024 * 1024) {
      alert('Image file size must be under 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        onUpdateUser({
          ...user,
          customAvatar: dataUrl
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAvatar = () => {
    onUpdateUser({
      ...user,
      customAvatar: null
    });
  };

  return (
    <div className="min-h-screen pt-40 pb-40 relative overflow-hidden transition-all duration-500 bg-background text-foreground animate-fade-in">
      {/* Background Ambience Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      <div className="max-w-[100rem] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Navigation Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="flex flex-col gap-10">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary">PROFILE STYLES</span>
                </motion.div>
                <h1 className="text-7xl font-extrabold text-white uppercase tracking-tighter italic leading-none">
                  MY LOOKS
                </h1>
                <p className="text-white/30 text-xs font-mono tracking-widest uppercase mt-4 italic">Change your picture, site themes, and profile banners.</p>
              </div>

              {/* Subnavigation Hub */}
              <div className="flex flex-col gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-[2.5rem]">
                {[
                  { id: 'identity', label: 'AVATARS', icon: User, desc: 'YOUR PIC', count: CHARACTERS.length + (user.customAvatar ? 1 : 0) },
                  { id: 'visuals', label: 'THEMES', icon: Palette, desc: 'SITE THEME', count: themes.length },
                  { id: 'banners', label: 'BANNERS', icon: ImageIcon, desc: 'PROFILE BANNER', count: PROFILE_BANNERS.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between px-6 py-5 rounded-2xl transition-all relative overflow-hidden group cursor-pointer ${
                      activeTab === tab.id 
                        ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.15)]' 
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <tab.icon size={20} className="relative z-10 shrink-0" />
                      <div className="text-left relative z-10">
                        <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{tab.label}</p>
                        <p className={`text-[8px] font-bold uppercase tracking-wider ${activeTab === tab.id ? 'text-black/50' : 'text-white/20'}`}>{tab.desc}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono font-black border px-2 py-0.5 rounded-md ${activeTab === tab.id ? 'border-black/10 bg-black/5 text-black' : 'border-white/5 bg-white/[0.02] text-white/40'}`}>
                      {tab.count}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-white"
                        style={{ zIndex: 0 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Content Center */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: CARD IDENTITY (CHARACTERS & CUSTOM UPLOAD) */}
              {activeTab === 'identity' && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-12"
                >
                  {/* Custom Upload Profile Picture Banner */}
                  <div className="p-8 sm:p-10 rounded-[3rem] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-transparent border border-blue-500/30 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-3xl bg-black border-2 border-white/20 p-1 overflow-hidden shrink-0 shadow-2xl">
                          {user.customAvatar ? (
                            <img src={user.customAvatar} alt="Custom Avatar" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <div className="w-full h-full rounded-2xl bg-white/5 flex items-center justify-center text-white/30">
                              <User size={36} />
                            </div>
                          )}
                          {user.customAvatar && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-blue-500 text-[8px] font-black uppercase text-white shadow">
                              ACTIVE
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block mb-1">
                            CUSTOM AVATAR UPLOAD
                          </span>
                          <h4 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
                            Upload Your Own Profile Picture
                          </h4>
                          <p className="text-xs text-white/50 mt-1 max-w-md">
                            Upload any PNG, JPG, GIF or WEBP image to display across your profile, leaderboards, and chat.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-white hover:bg-white/90 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer"
                        >
                          <Upload size={16} />
                          <span>{user.customAvatar ? 'Change Photo' : 'Upload Image'}</span>
                        </button>

                        {user.customAvatar && (
                          <button
                            onClick={handleRemoveCustomAvatar}
                            className="p-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition-all cursor-pointer"
                            title="Remove custom photo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Built-in Character Roster */}
                  <div className="space-y-8 bg-white/[0.01] border border-white/5 p-8 sm:p-10 rounded-[3rem]">
                    <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">CHOOSE FROM PRESETS</h3>
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1 rounded-full self-start sm:self-auto">
                          {CHARACTERS.filter(isCharUnlocked).length} / {CHARACTERS.filter(char => !char.isCode || isCharUnlocked(char)).length} UNLOCKED
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] italic mt-1 animate-pulse">
                        💡 UNLOCK MORE PROFILE PICTURES FROM CODES
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                      {CHARACTERS.filter(char => !char.isCode || isCharUnlocked(char)).map((char) => {
                        const isUnlocked = isCharUnlocked(char);
                        const isSelected = !user.customAvatar && user.currentCharacter === char.id;
                        return (
                          <button
                            key={char.id}
                            onClick={() => {
                              if (isUnlocked) {
                                onUpdateUser({ ...user, currentCharacter: char.id, customAvatar: null });
                              }
                            }}
                            className={`aspect-square rounded-[2.2rem] p-1.5 transition-all relative group overflow-hidden cursor-pointer ${
                              isSelected 
                                ? 'bg-white ring-4 ring-white/20 shadow-[0_0_40px_rgba(255,255,255,0.2)] scale-[1.03]' 
                                : isUnlocked 
                                  ? 'bg-white/[0.02] border border-white/10 hover:border-white/30 hover:bg-white/[0.04]' 
                                  : 'bg-black/50 border border-white/5 opacity-30 cursor-not-allowed'
                            }`}
                          >
                            <div className="w-full h-full rounded-[1.9rem] overflow-hidden bg-black flex items-center justify-center relative">
                              {char.img ? (
                                <img 
                                  src={char.img} 
                                  alt={char.name} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="text-white/20">
                                  <char.icon size={26} />
                                </div>
                              )}

                              {/* Lock indicator */}
                              {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5">
                                  <Lock size={12} className="text-white/40" />
                                  <span className="text-[7px] font-mono font-black text-rose-500 uppercase tracking-wider">LVL {char.level || 'CODE'}</span>
                                </div>
                              )}

                              {/* Selected pill */}
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-black rounded-lg flex items-center justify-center border border-white/10 shadow-2xl z-20 animate-fade-in">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Redesigned Name Changer Panel */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div className="space-y-2 text-left max-w-md">
                      <p className="text-[9px] font-mono text-primary uppercase font-bold tracking-widest animate-pulse">SYSTEM IDENTIFICATION</p>
                      <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">RENAME YOUR PILOT</h4>
                      <p className="text-[10px] text-white/40 font-medium leading-relaxed uppercase">Update your global profile name displayed across leaderboard stats and global chat rooms instantly.</p>
                    </div>

                    <div className="w-full md:w-96 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <input 
                          type="text"
                          value={tempUsername}
                          onChange={handleUsernameChange}
                          maxLength={15}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-left text-sm font-black text-white uppercase tracking-widest italic focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner"
                          placeholder="ENTER NEW NAME..."
                        />
                      </div>
                      
                      <button 
                        onClick={submitUsername}
                        disabled={tempUsername.trim() === user.username || !tempUsername.trim()}
                        className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-10 disabled:scale-100 disabled:pointer-events-none italic shrink-0 cursor-pointer"
                      >
                        SAVE NAME
                      </button>
                    </div>

                    {usernameStatus && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute bottom-3 right-8 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider ${
                          usernameStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        {usernameStatus.text}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SYSTEM THEME SELECTION (UNLOCKED VIA LEVEL ROAD) */}
              {activeTab === 'visuals' && (
                <motion.div
                  key="visuals"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">CHOOSE SITE THEME</h3>
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">Unlocked progressively through the Level Road</p>
                      </div>
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1 rounded-full self-start sm:self-auto">
                        {themes.filter(isThemeUnlocked).length} / {themes.filter(theme => !theme.isCode || isThemeUnlocked(theme)).length} UNLOCKED
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] italic mt-1 animate-pulse">
                      💡 UNLOCK SITE THEMES ON THE LEVEL ROAD
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {themes.filter(theme => !theme.isCode || isThemeUnlocked(theme)).map((theme) => {
                      const isUnlocked = isThemeUnlocked(theme);
                      const isSelected = user.currentTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            if (isUnlocked) {
                              onUpdateUser({ ...user, currentTheme: theme.id });
                            }
                          }}
                          className={`group text-left p-6 rounded-[2.5rem] transition-all relative overflow-hidden flex flex-col justify-between h-80 cursor-pointer ${
                            isSelected 
                              ? 'bg-white text-black shadow-[0_30px_60px_rgba(255,255,255,0.18)] scale-[1.02]' 
                              : isUnlocked
                                ? 'bg-white/[0.02] border border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                                : 'bg-black/50 border border-white/5 opacity-30 cursor-not-allowed'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white via-zinc-100 to-zinc-200 -z-10" />
                          )}

                          <div className="w-full h-28 rounded-[1.8rem] bg-black/40 border border-white/5 relative overflow-hidden mb-4 p-3 flex gap-2">
                            <div className="w-5 h-full rounded-xl flex flex-col items-center py-2" style={{ background: theme.bg, borderRight: `1px solid ${theme.primary}15` }}>
                              <div className="w-2 h-2 rounded-full mb-2 shrink-0 animate-pulse" style={{ background: theme.primary }} />
                              <div className="w-2 h-1.5 rounded-sm opacity-30 shrink-0 mb-1" style={{ background: theme.primary }} />
                              <div className="w-2 h-1.5 rounded-sm opacity-30 shrink-0 mb-1" style={{ background: theme.primary }} />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="h-6 rounded-lg flex items-center justify-between px-2.5 bg-white/5" style={{ borderLeft: `2.5px solid ${theme.primary}` }}>
                                <div className="w-10 h-1.5 rounded" style={{ background: theme.primary }} />
                                <div className="w-2 h-2 rounded-full" style={{ background: theme.primary }} />
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div className="rounded-md bg-white/5 p-1 flex flex-col justify-between">
                                  <div className="w-4 h-1 rounded" style={{ background: `${theme.primary}50` }} />
                                  <div className="w-6 h-1 rounded" style={{ background: `${theme.primary}25` }} />
                                </div>
                                <div className="rounded-md bg-white/5 p-1 flex flex-col justify-between">
                                  <div className="w-4 h-1 rounded" style={{ background: `${theme.primary}50` }} />
                                  <div className="w-6 h-1 rounded" style={{ background: `${theme.primary}25` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start justify-between w-full mt-2 relative z-10">
                            <div className="flex gap-2 p-1 bg-black/20 rounded-full border border-white/5">
                              <span 
                                className="w-5 h-5 rounded-full border border-black/20 block shadow-inner" 
                                style={{ background: theme.primary }}
                              />
                              <span 
                                className="w-5 h-5 rounded-full border border-black/20 block" 
                                style={{ background: theme.bg }}
                              />
                            </div>

                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                              isSelected 
                                ? 'bg-black/5 border-black/10 text-black/60' 
                                : 'bg-white/5 border-white/10 text-white/40'
                            }`}>
                              {theme.type.toUpperCase()}
                            </span>
                          </div>

                          <div className="space-y-1 mt-4 relative z-10">
                            <h4 className="text-lg font-black uppercase tracking-tight italic">{theme.name}</h4>
                            <p className={`text-[9px] font-semibold leading-relaxed uppercase ${isSelected ? 'text-black/50' : 'text-white/40'}`}>
                              {theme.desc}
                            </p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-black/5 w-full flex items-center justify-between relative z-10">
                            {isSelected ? (
                              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-black">
                                <Sparkles size={11} className="animate-spin" />
                                <span>ACTIVE</span>
                              </div>
                            ) : isUnlocked ? (
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">READY TO USE</span>
                                <ChevronRight size={12} className="text-white/30 group-hover:translate-x-1 transition-transform" />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-rose-500">
                                <Lock size={10} />
                                <span>LOCKED (LEVEL {theme.level || 'CODE'})</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PROFILE BANNERS (UNLOCKED VIA LEVEL ROAD) */}
              {activeTab === 'banners' && (
                <motion.div
                  key="banners"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">PROFILE BANNERS</h3>
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">
                          Customize your profile card header banner. Unlocked through Level Road milestones.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1 rounded-full self-start sm:self-auto">
                        {PROFILE_BANNERS.filter(isBannerUnlocked).length} / {PROFILE_BANNERS.length} UNLOCKED
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] italic mt-1 animate-pulse">
                      💡 UNLOCK PROFILE BANNERS BY PROGRESSING ON THE LEVEL ROAD
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PROFILE_BANNERS.map((banner) => {
                      const isUnlocked = isBannerUnlocked(banner);
                      const isSelected = (user.currentBanner || 'default') === banner.id;

                      return (
                        <button
                          key={banner.id}
                          onClick={() => {
                            if (isUnlocked) {
                              onUpdateUser({ ...user, currentBanner: banner.id });
                            }
                          }}
                          className={`p-6 rounded-[2.5rem] text-left transition-all border relative overflow-hidden group cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black border-white shadow-2xl scale-[1.02]'
                              : isUnlocked
                              ? 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]'
                              : 'bg-black/50 border-white/5 opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {/* Banner preview strip */}
                          <BannerDisplay 
                            banner={banner} 
                            compact={false} 
                            className="h-28 w-full rounded-2xl mb-4 border border-white/10 shadow-inner flex items-end p-4"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1 shadow-md">
                                {banner.animated && <Sparkles size={10} className="text-amber-300 animate-pulse" />}
                                LEVEL {banner.level} {banner.animated ? '• ANIMATED' : ''}
                              </span>
                            </div>
                          </BannerDisplay>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-base font-black uppercase italic tracking-tight">{banner.name}</h4>
                              <p className={`text-[10px] font-medium uppercase mt-0.5 ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                                {banner.desc}
                              </p>
                            </div>

                            <div>
                              {isSelected ? (
                                <span className="px-3 py-1 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-wider">
                                  EQUIPPED
                                </span>
                              ) : isUnlocked ? (
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">
                                  EQUIP
                                </span>
                              ) : (
                                <div className="flex items-center gap-1 text-[9px] font-black text-rose-400 uppercase">
                                  <Lock size={12} />
                                  <span>LVL {banner.level}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
