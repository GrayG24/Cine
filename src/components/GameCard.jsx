import React from 'react';
import { motion } from 'motion/react';
import { Pin, Play, AlertTriangle, Lock, Sparkles } from 'lucide-react';

const CATEGORY_STYLES = {
  driving: { accent: '#06b6d4', glow: 'rgba(6,182,212,0.3)', border: 'border-cyan-500/30 group-hover:border-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  action: { accent: '#f43f5e', glow: 'rgba(244,63,94,0.3)', border: 'border-rose-500/30 group-hover:border-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  sports: { accent: '#10b981', glow: 'rgba(16,185,129,0.3)', border: 'border-emerald-500/30 group-hover:border-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  puzzle: { accent: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', border: 'border-purple-500/30 group-hover:border-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  shooter: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.3)', border: 'border-amber-500/30 group-hover:border-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  strategy: { accent: '#3b82f6', glow: 'rgba(59,130,246,0.3)', border: 'border-blue-500/30 group-hover:border-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  arcade: { accent: '#ec4899', glow: 'rgba(236,72,153,0.3)', border: 'border-pink-500/30 group-hover:border-pink-400', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  retro: { accent: '#eab308', glow: 'rgba(234,179,8,0.3)', border: 'border-yellow-500/30 group-hover:border-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  multiplayer: { accent: '#6366f1', glow: 'rgba(99,102,241,0.3)', border: 'border-indigo-500/30 group-hover:border-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  casual: { accent: '#14b8a6', glow: 'rgba(20,184,166,0.3)', border: 'border-teal-500/30 group-hover:border-teal-400', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  default: { accent: '#a855f7', glow: 'rgba(168,85,247,0.3)', border: 'border-purple-500/30 group-hover:border-purple-400', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
};

export const GameCard = ({ game, isPinned, onTogglePin, onClick, lockInfo }) => {
  const isBroken = Boolean(lockInfo?.isBroken);
  const isLocked = Boolean(lockInfo?.isLocked);

  const catKey = (game?.category || 'default').toLowerCase().trim();
  const theme = CATEGORY_STYLES[catKey] || CATEGORY_STYLES.default;

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative bg-gradient-to-b from-[#0e1220]/95 via-[#080b14]/90 to-black/95 rounded-[2rem] cursor-pointer shadow-2xl backdrop-blur-2xl transition-all duration-500 border ${theme.border} overflow-hidden will-change-transform`}
    >
      {/* Dynamic ambient colored glow on dark card (similar to app cards UI) */}
      <div 
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-20 group-hover:opacity-45 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: theme.accent }}
      />
      <div 
        className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="aspect-[3/4] relative overflow-hidden rounded-t-[2rem]" onClick={() => onClick(game)}>
        <img 
          src={game.thumbnail || null} 
          alt={game.title} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-108"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-transparent to-transparent opacity-80" />
        
        {/* Top Badges (Category & Status - No Ratings) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border backdrop-blur-md shadow-md ${theme.badge}`}>
            {game.category || 'ACTION'}
          </span>

          {isBroken && (
            <div className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-xl rounded-xl flex items-center gap-1.5 border border-amber-400 text-black shadow-lg">
              <AlertTriangle size={11} className="fill-black" />
              <span className="text-[9px] font-black uppercase tracking-wider">BROKEN</span>
            </div>
          )}
          {isLocked && !isBroken && (
            <div className="px-2.5 py-1 bg-rose-600/90 backdrop-blur-xl rounded-xl flex items-center gap-1.5 border border-rose-400 text-white shadow-lg">
              <Lock size={11} />
              <span className="text-[9px] font-black uppercase tracking-wider">LOCKED</span>
            </div>
          )}
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-black shadow-2xl transition-transform"
            style={{ 
              backgroundColor: theme.accent,
              boxShadow: `0 0 35px ${theme.glow}`
            }}
          >
            {isLocked || isBroken ? <Lock size={22} className="text-black" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </div>
        </div>
      </div>

      <div className="p-5 bg-black/40 border-t border-white/5 rounded-b-[2rem] relative z-10" onClick={() => onClick(game)}>
        <h3 className="font-black text-lg text-white uppercase tracking-tight italic leading-tight mb-2 truncate group-hover:text-white transition-colors">
          {game.title}
        </h3>
        <div className="flex items-center justify-between">
          <span 
            className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
            style={{ color: theme.accent }}
          >
            <Sparkles size={11} />
            <span>PLAY NOW</span>
          </span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
            +50 EXP
          </span>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(game.id);
        }}
        className={`absolute top-4 right-4 p-2.5 rounded-xl border transition-all duration-300 z-20 ${
          isPinned 
            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
            : 'bg-black/60 text-white/50 border-white/10 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100 backdrop-blur-xl'
        }`}
        title="Pin Game"
      >
        <Pin size={13} className={isPinned ? 'fill-current' : ''} />
      </button>
    </motion.div>
  );
};
