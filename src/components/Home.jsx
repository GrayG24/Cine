import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, Zap, Trophy, User, Activity, Rocket, Play, Pin, Radio, MessageSquare, Flame, Sparkles, Film, Star, Layers, ArrowUpRight, Clapperboard, Disc3, Lock, AlertTriangle, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Hero } from './Hero';
import { GameCard } from './GameCard';
import { LeaderboardWidget as FullLeaderboardWidget } from './LeaderboardWidget';
import { CHARACTERS, AppRoute } from '../constants';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Current time in America/New_York (EST / EDT)
      const estDateStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
      const estDate = new Date(estDateStr);

      // Next 12:00 AM EST midnight
      const nextMidnightEst = new Date(estDate);
      nextMidnightEst.setDate(nextMidnightEst.getDate() + 1);
      nextMidnightEst.setHours(0, 0, 0, 0);

      const diffMs = nextMidnightEst.getTime() - estDate.getTime();
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));

      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {[
        { label: 'H', value: timeLeft.hours },
        { label: 'M', value: timeLeft.minutes },
        { label: 'S', value: timeLeft.seconds }
      ].map((unit, idx) => (
        <React.Fragment key={unit.label}>
          <div className="flex items-baseline gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-inner">
            <span className="text-sm font-black text-cyan-300 font-mono tabular-nums tracking-wider">{unit.value.toString().padStart(2, '0')}</span>
            <span className="text-[8px] font-black text-white/40 uppercase">{unit.label}</span>
          </div>
          {idx < 2 && <span className="text-cyan-400/50 font-black text-xs font-mono">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export const Home = ({ 
  user, 
  games, 
  dailyPicks,
  favorites, 
  pinnedGames,
  leaderboardData,
  boosts, 
  dailyGame,
  gameOfTheWeek,
  onToggleFavorite, 
  onTogglePin,
  onPlayGame,
  onSwitchToLibrary,
  onNavigate,
  onProfileClick,
  onPlayerClick,
  onLeaderboardClick,
  systemStats: propSystemStats,
  lockedGames = {}
}) => {
  const [localSystemStats, setLocalSystemStats] = useState({ activeUsers: 0, totalPlayers: 0 });

  useEffect(() => {
    if (propSystemStats) return;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/system/status');
        if (res.ok) {
          const data = await res.json();
          setLocalSystemStats(data);
        }
      } catch (err) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [propSystemStats]);

  const systemStats = propSystemStats || localSystemStats;

  const featuredGame = useMemo(() => {
    const targetDaily = dailyGame || gameOfTheWeek;
    if (targetDaily) {
      const game = games.find(g => g.id === targetDaily.id);
      if (game) return game;
    }
    return games.find(g => g.id === 'ovo-classic') || (games && games.length > 0 ? games[0] : { title: 'Unknown', thumbnail: null, description: '' });
  }, [games, dailyGame, gameOfTheWeek]);

  const popularGames = useMemo(() => {
    const popularIds = [
      'minecraft-classic-edition',
      'cookie-clicker-new',
      'ovo-classic',
      'retro-bowl',
      'slope',
      'basket-random',
      'moto-x3m-classic',
      'subway-surfers'
    ];
    const found = popularIds.map(id => games.find(g => g.id === id)).filter(Boolean);
    if (found.length >= 4) return found;
    return (games || []).filter(g => g.isFeatured).slice(0, 8);
  }, [games]);

  const isPotatoMode = user?.settings?.performanceMode;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isPotatoMode ? 0.05 : 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: isPotatoMode 
      ? { opacity: 0, y: 10 } 
      : { opacity: 0, y: 30, filter: 'blur(15px)', scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      scale: 1,
      transition: { 
        duration: isPotatoMode ? 0.35 : 1.1, 
        ease: [0.22, 1, 0.36, 1] 
      } 
    },
  };

  const [isLeaderboardExpanded, setIsLeaderboardExpanded] = useState(false);
  const displayLeaderboardData = useMemo(() => {
    return isLeaderboardExpanded ? (leaderboardData || []).slice(0, 25) : (leaderboardData || []).slice(0, 5);
  }, [leaderboardData, isLeaderboardExpanded]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="pb-40 pt-8"
    >
      <div className="max-w-[100rem] mx-auto px-6 sm:px-8 lg:px-12 mb-12">
        {/* Welcome Hero */}
        <div className="mb-12">
          <motion.div variants={itemVariants}>
            <Hero user={user} onBrowseLibrary={onSwitchToLibrary} onNavigate={onNavigate} />
          </motion.div>
        </div>

        {/* Apps & Hub Quick Launch Bar */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Apps</h3>
            {onNavigate && (
              <button
                onClick={() => onNavigate(AppRoute.APPS)}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Streamly Card */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate && onNavigate(AppRoute.STREAM)}
              className="p-6 rounded-[2.5rem] bg-gradient-to-b from-purple-500/10 via-black/40 to-black/60 border border-purple-500/20 hover:border-purple-500/50 cursor-pointer shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Radio size={22} className="animate-pulse" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  STREAM
                </span>
              </div>
              <h4 className="text-base font-black uppercase italic tracking-tight text-white group-hover:text-purple-400 transition-colors">
                Streamly
              </h4>
              <p className="text-[11px] text-white/50 line-clamp-1 mt-1 font-medium">live streaming platform</p>
              <div className="flex items-center text-[10px] font-black uppercase tracking-wider text-purple-400 gap-1.5 pt-4 mt-4 border-t border-white/5">
                <span>Open Streamly</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Cinema Card */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate && onNavigate(AppRoute.CINEMA)}
              className="p-6 rounded-[2.5rem] bg-gradient-to-b from-amber-500/10 via-black/40 to-black/60 border border-amber-500/20 hover:border-amber-500/50 cursor-pointer shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clapperboard size={22} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  FILMS
                </span>
              </div>
              <h4 className="text-base font-black uppercase italic tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Cinema
              </h4>
              <p className="text-[11px] text-white/50 line-clamp-1 mt-1 font-medium">movies, TV-shows</p>
              <div className="flex items-center text-[10px] font-black uppercase tracking-wider text-amber-400 gap-1.5 pt-4 mt-4 border-t border-white/5">
                <span>Open Cinema</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Spotify Card */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate && onNavigate(AppRoute.SPOTIFY)}
              className="p-6 rounded-[2.5rem] bg-gradient-to-b from-emerald-500/10 via-black/40 to-black/60 border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954]">
                  <Disc3 size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                  MUSIC
                </span>
              </div>
              <h4 className="text-base font-black uppercase italic tracking-tight text-white group-hover:text-[#1DB954] transition-colors">
                Spotify
              </h4>
              <p className="text-[11px] text-white/50 line-clamp-1 mt-1 font-medium">built in spotify player</p>
              <div className="flex items-center text-[10px] font-black uppercase tracking-wider text-[#1DB954] gap-1.5 pt-4 mt-4 border-t border-white/5">
                <span>Open Player</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Messages Card */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate && onNavigate(AppRoute.CHAT)}
              className="p-6 rounded-[2.5rem] bg-gradient-to-b from-blue-500/10 via-black/40 to-black/60 border border-blue-500/20 hover:border-blue-500/50 cursor-pointer shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MessageSquare size={22} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  MESSAGES
                </span>
              </div>
              <h4 className="text-base font-black uppercase italic tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Messages
              </h4>
              <p className="text-[11px] text-white/50 line-clamp-1 mt-1 font-medium">message individual players or global chat</p>
              <div className="flex items-center text-[10px] font-black uppercase tracking-wider text-blue-400 gap-1.5 pt-4 mt-4 border-t border-white/5">
                <span>Open Messages</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Reworked Daily Game Hero UI */}
      <motion.section variants={itemVariants} className="pb-20 relative z-10">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-8 lg:px-12">
            {/* Multi-color ambient background glows */}
            <div className="relative">
              <div className="absolute -top-16 left-1/5 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
              <div className="absolute -bottom-16 right-1/5 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative rounded-[3.2rem] p-[2px] bg-gradient-to-br from-cyan-400/50 via-purple-600/40 to-amber-500/50 shadow-[0_35px_100px_rgba(0,0,0,0.9)] overflow-hidden">
                <div className="rounded-[3.1rem] bg-[#070a14]/95 backdrop-blur-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[480px] lg:min-h-[500px] relative">
                  
                  {/* Subtle Geometric Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

                  {/* Left Details Panel */}
                  <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between z-10 relative">
                    <div>
                      {/* Top Chips Row */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-600/25 border border-yellow-400/60 text-yellow-300 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.35)]">
                          <Sparkles size={13} className="text-yellow-400" />
                          <span>DAILY GAME</span>
                        </div>

                        {featuredGame.category && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/40 text-purple-300 text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                            <Gamepad2 size={12} />
                            <span>{featuredGame.category}</span>
                          </div>
                        )}

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                          <span className="text-white/40">NEXT ROTATION</span>
                          <CountdownTimer />
                        </div>

                        {lockedGames[featuredGame.id] && (lockedGames[featuredGame.id].isBroken || lockedGames[featuredGame.id].isLocked) && (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[10px] font-black uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse">
                            {lockedGames[featuredGame.id].isBroken ? <AlertTriangle size={13} className="text-amber-400" /> : <Lock size={13} />}
                            <span>{lockedGames[featuredGame.id].isBroken ? 'BROKEN / MAINTENANCE' : 'TEMPORARILY LOCKED'}</span>
                          </div>
                        )}
                      </div>

                      {/* Main Title with Multi-color Cyber Gradient & Glow */}
                      <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-400 drop-shadow-[0_2px_15px_rgba(168,85,247,0.3)]">
                        {featuredGame.title}
                      </h2>

                      {/* Maintenance Notice if Locked */}
                      {lockedGames[featuredGame.id]?.reason && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs italic max-w-xl mb-6 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>"{lockedGames[featuredGame.id].reason}"</span>
                        </div>
                      )}

                      {/* 2X EXP Boost Feature Banner (No Engine/Lag, No Ranked Icons, No Rating) */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-600/15 to-cyan-500/15 border border-amber-400/40 max-w-xl mb-6 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-black flex items-center justify-center font-black shadow-lg shrink-0">
                            <Zap size={22} fill="currentColor" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">DAILY GAME PERK</span>
                            <h4 className="text-base sm:text-lg font-black uppercase italic tracking-tight text-white">2X DOUBLE EXP BOOST</h4>
                          </div>
                        </div>
                        <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-amber-400/40 text-center shrink-0">
                          <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">+100 - 150 EXP</span>
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">PER PLAY</span>
                        </div>
                      </div>
                    </div>

                    {/* Play & Favorite Action Bar (Removed More category button) */}
                    <div className="flex flex-wrap items-center gap-3.5 pt-4 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onPlayGame(featuredGame)}
                        className="px-9 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-black font-black text-xs uppercase tracking-[0.25em] transition-all shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-xl bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play size={15} fill="currentColor" />
                        </div>
                        <span>LAUNCH DAILY GAME</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onToggleFavorite(featuredGame.id)}
                        className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white transition-all cursor-pointer shadow-inner"
                        title="Favorite Game"
                      >
                        <Pin size={18} className={(favorites || []).includes(featuredGame.id) ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-white/60'} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Right Media Poster (Removed now active & blinking light, removed rating badge) */}
                  <div className="lg:col-span-5 relative min-h-[340px] lg:min-h-full overflow-hidden group/poster cursor-pointer border-t lg:border-t-0 lg:border-l border-white/10" onClick={() => onPlayGame(featuredGame)}>
                    <img
                      src={featuredGame.thumbnail || null}
                      alt={featuredGame.title}
                      className="w-full h-full object-cover scale-105 group-hover/poster:scale-110 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    {/* Vignette gradients blending into card body */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070a14] via-black/30 to-transparent lg:bg-gradient-to-r lg:from-[#070a14] lg:via-transparent lg:to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Corner Accent Brackets with Multi-color accents */}
                    <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-purple-400/60 rounded-tr-xl pointer-events-none" />
                    <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-xl pointer-events-none hidden lg:block" />

                    {/* Centered Hover Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 text-black flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.8)] scale-90 group-hover/poster:scale-100 transition-transform">
                        <Play size={30} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </motion.section>

      {/* Leaderboard Section */}
      <motion.section variants={itemVariants} className="pb-32 relative z-10 px-6 sm:px-8 lg:px-12">
        <div className="max-w-[100rem] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div>
              <h3 className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter uppercase mb-2">
                LEADERBOARD
              </h3>
            </div>
            {onLeaderboardClick && (
              <button
                onClick={onLeaderboardClick}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>View Full Board</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <FullLeaderboardWidget 
                leaderboardData={displayLeaderboardData} 
                onPlayerClick={onPlayerClick || onProfileClick}
                onViewFullLeaderboard={onLeaderboardClick}
              />
              <div className="flex justify-center">
                <button 
                  onClick={() => setIsLeaderboardExpanded(!isLeaderboardExpanded)}
                  className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all cursor-pointer"
                >
                  {isLeaderboardExpanded ? 'MINIMIZE LEADERBOARD' : 'EXPAND TO TOP 25'}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col justify-center gap-4 relative overflow-hidden">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                  ONLINE PLAYERS
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                  <span className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter">
                    {systemStats.activeUsers.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col justify-center gap-4 relative overflow-hidden">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                  TOTAL COMMUNITY
                </span>
                <div className="flex items-center gap-4">
                  <Activity size={28} className="text-blue-400" />
                  <span className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter">
                    {systemStats.totalPlayers > 1000 ? `${(systemStats.totalPlayers / 1000).toFixed(0)}K` : systemStats.totalPlayers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};
