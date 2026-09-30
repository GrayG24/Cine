import React from 'react';
import { motion } from 'motion/react';
import { Headphones, ArrowLeft, Construction } from 'lucide-react';
import { AppRoute } from '../constants';

export const SpotifyPage = ({ onNavigate }) => {
  return (
    <div className="w-full min-h-screen py-8 pb-32 text-white flex flex-col">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <motion.button
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate(AppRoute.APPS)}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/70 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider italic">Back to Apps</span>
        </motion.button>

        <span className="px-3.5 py-1 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] text-[10px] font-black uppercase tracking-widest">
          Spotify
        </span>
      </div>

      {/* Clean Empty Container */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] rounded-[3rem] bg-black/40 border border-white/10 backdrop-blur-2xl p-8 sm:p-16 text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-3xl bg-[#1DB954]/10 border border-[#1DB954]/25 text-[#1DB954] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(29,185,84,0.2)]">
          <Headphones size={36} />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-white mb-3">
          SPOTIFY
        </h2>
        <p className="text-white/40 text-xs sm:text-sm font-medium uppercase tracking-widest max-w-md mb-8">
          The Spotify music player is currently undergoing upgrades.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-wider">
          <Construction size={16} className="text-[#1DB954]" />
          <span>Under Maintenance</span>
        </div>
      </div>
    </div>
  );
};
