import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Star, Clapperboard, Calendar, Clock, Film, ExternalLink, Share2, Heart } from 'lucide-react';
import { AppRoute } from '../constants';

export const MovieModal = ({ movie, isOpen, onClose, onNavigateToCinema }) => {
  if (!isOpen || !movie) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[#0d111a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col"
        >
          {/* Backdrop Header */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden shrink-0">
            <img 
              src={movie.backdrop || movie.poster} 
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] via-[#0d111a]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d111a]/80 via-transparent to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer z-10"
              title="Close Preview"
            >
              <X size={18} />
            </button>

            {/* Badge */}
            {movie.badge && (
              <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                {movie.badge}
              </div>
            )}

            {/* Quick stats on backdrop */}
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {(movie.genres || []).map((genre) => (
                    <span 
                      key={genre}
                      className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl sm:text-4xl font-black italic tracking-tight text-white uppercase drop-shadow-md">
                  {movie.title}
                </h2>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-black text-white">{movie.rating}</span>
                <span className="text-[10px] font-bold text-white/40">/ 10</span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar space-y-6">
            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-white/50 border-b border-white/5 pb-4">
              <div className="flex items-center gap-1.5 text-white/80">
                <Calendar size={14} className="text-blue-400" />
                <span>{movie.year}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1.5 text-white/80">
                <Clock size={14} className="text-purple-400" />
                <span>{movie.duration}</span>
              </div>
              {movie.rottenTomatoes && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-rose-400 font-black">{movie.rottenTomatoes} Rotten Tomatoes</span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">
                SYNOPSIS & OVERVIEW
              </h3>
              <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
                {movie.desc}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateToCinema) onNavigateToCinema();
                }}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Clapperboard size={18} />
                <span>Watch in Cine Cinema</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
