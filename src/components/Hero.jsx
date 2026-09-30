import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2 } from 'lucide-react';
import { AppRoute } from '../constants';

export const Hero = ({ user, onBrowseLibrary, onNavigate }) => {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#12162a]/95 via-[#0e1122]/95 to-[#090b16] border border-blue-500/20 p-8 sm:p-12 shadow-[0_25px_80px_rgba(15,23,42,0.8)]">
      {/* Background Ambient Lights with Blue & Purple Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />
      
      <div className="relative z-10 space-y-6 max-w-4xl">
        {/* Main Pitch */}
        <div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black italic tracking-normal uppercase text-white leading-tight sm:leading-tight pb-2 overflow-visible">
            Welcome to{' '}
            <span className="inline-block py-1 px-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.4)]">
              Cine
            </span>
          </h1>

          {/* Text under Welcome to Cine */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-[0.2em] text-white/50 font-mono">
              Dashboard
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBrowseLibrary}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center gap-3 cursor-pointer"
          >
            <Gamepad2 size={18} />
            <span>Browse 100+ Games</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
