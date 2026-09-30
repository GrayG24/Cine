import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Maximize2, Minimize2, RefreshCw, Zap, AlertTriangle } from 'lucide-react';

export const GameView = ({ game, onClose, onReportGame }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const iframeRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      // Safely reload iframe crossing origin boundaries by re-assigning src
      iframeRef.current.src = game.iframeUrl;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-black flex flex-col"
    >
      {/* Game Header */}
      <div className="h-16 bg-[#0b0c16]/95 backdrop-blur-2xl border-b border-purple-500/20 shadow-[0_4px_25px_rgba(168,85,247,0.15)] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-purple-500/30 border border-blue-500/40 flex items-center justify-center text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Zap size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tighter italic leading-none">{game.title}</h3>
            <p className="text-[9px] font-black text-purple-300/60 uppercase tracking-widest mt-1 italic">{game.category || 'ARCADE'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (onReportGame) {
                onReportGame(game);
              } else {
                setIsReported(true);
              }
            }}
            disabled={isReported}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all italic border cursor-pointer ${
              isReported 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default' 
                : 'bg-purple-500/10 text-purple-300 border-purple-500/25 hover:bg-purple-500/20 hover:border-purple-500/50'
            }`}
            title={isReported ? "Game reported successfully" : "Report this game as broken to the site owner"}
          >
            <AlertTriangle size={13} className={isReported ? "" : "animate-pulse text-purple-400"} />
            <span>{isReported ? 'REPORTED' : 'REPORT BROKEN'}</span>
          </button>

          <button 
            onClick={handleReload}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all cursor-pointer"
            title="Reload Game"
          >
            <RefreshCw size={17} />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)] cursor-pointer"
            title="Close Game"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Game Iframe */}
      <div className="flex-1 bg-black relative">
        <iframe
          ref={iframeRef}
          id={game.idAttr || undefined}
          src={game.iframeUrl}
          className="w-full h-full border-none"
          title={game.title}
          allow={game.allow || "autoplay; fullscreen; keyboard"}
          sandbox={game.sandbox || undefined}
          loading={game.loading || undefined}
          referrerPolicy="no-referrer"
          allowFullScreen
        ></iframe>
      </div>
    </motion.div>
  );
};
