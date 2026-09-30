import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Star, Pin, Sparkles, Gamepad2, Lock, AlertTriangle, Wrench } from 'lucide-react';

export const GameModal = ({ game, isFavorite, onToggleFavorite, onClose, lockInfo, isOwner }) => {
  if (!game) return null;
  
  const isBroken = Boolean(lockInfo?.isBroken);
  const isLocked = Boolean(lockInfo?.isLocked);
  const isUnavailable = (isBroken || isLocked) && !isOwner;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-8"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#0b0c16] border border-purple-500/30 rounded-[3rem] max-w-4xl w-full shadow-[0_0_60px_rgba(168,85,247,0.25)] relative overflow-hidden flex flex-col md:flex-row"
      >
        {/* Ambient Purple/Blue Neon Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/15 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
          <img 
            src={game.thumbnail} 
            alt={game.title} 
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c16] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0b0c16]" />
          
          {(isBroken || isLocked) && (
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
              {isBroken && (
                <span className="px-3 py-1 rounded-xl bg-amber-500/90 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                  <AlertTriangle size={12} />
                  Broken Title
                </span>
              )}
              {isLocked && (
                <span className="px-3 py-1 rounded-xl bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                  <Lock size={12} />
                  Locked by Owner
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between relative z-10">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 border border-purple-500/20 hover:border-blue-500/50 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all group cursor-pointer"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>

          <div>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] italic">{game.category || 'ARCADE'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                <Star size={12} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-wider">4.9</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Sparkles size={12} />
                <span className="text-[10px] font-black uppercase tracking-wider">EXP READY</span>
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
              {game.title}
            </h2>

            {/* Maintenance / Lock Notice */}
            {isUnavailable && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-left space-y-1 mb-4">
                <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                  <Lock size={14} />
                  <span>TEMPORARILY UNAVAILABLE</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  {lockInfo?.reason || (isBroken ? 'This title has been marked as broken by the owner and is temporarily locked for maintenance.' : 'This title is temporarily locked for maintenance by the platform owner.')}
                </p>
              </div>
            )}

            {(isBroken || isLocked) && isOwner && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-left space-y-1 mb-4">
                <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                  <Wrench size={14} />
                  <span>OWNER MAINTENANCE PREVIEW</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                  This game is currently {isBroken ? 'marked broken' : 'locked'} to players. As platform owner, you have testing bypass clearance enabled.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 pt-5 border-t border-white/5">
            {isUnavailable ? (
              <button 
                disabled
                className="flex-[2] py-4 bg-white/10 text-white/30 border border-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all italic flex items-center justify-center gap-3 cursor-not-allowed"
              >
                <Lock size={16} />
                <span>LOCKED BY OWNER</span>
              </button>
            ) : (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('play-game', { detail: game }))}
                className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all italic flex items-center justify-center gap-3 cursor-pointer ${
                  (isBroken || isLocked) && isOwner
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.35)]'
                }`}
              >
                <Play size={16} fill="currentColor" />
                <span>{(isBroken || isLocked) && isOwner ? 'PLAY AS OWNER (TEST)' : 'PLAY NOW'}</span>
              </button>
            )}
            <button 
              onClick={() => onToggleFavorite(game.id)} 
              className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all italic border cursor-pointer ${
                isFavorite 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.25)]' 
                  : 'bg-white/5 text-white/50 border-white/10 hover:border-purple-500/40 hover:text-white'
              } flex items-center justify-center gap-2`}
            >
              <Pin size={16} className={isFavorite ? "fill-current text-blue-400" : ""} />
              <span>{isFavorite ? 'PINNED' : 'PIN'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
