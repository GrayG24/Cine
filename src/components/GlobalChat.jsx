import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare, Shield, Zap, Globe, Minus, Maximize2, Sparkles, ChevronRight } from 'lucide-react';

export const GlobalChat = ({ messages, onSendMessage, user, onClose, onPlayerClick }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [size, setSize] = useState({ width: 420, height: 600 });
  
  const scrollRef = useRef(null);
  const constraintsRef = useRef(null);
  const resizeRef = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  // Handle Resize Mouse Events
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizeRef.current) return;
      setSize(prev => ({
        width: Math.max(340, Math.min(window.innerWidth - 48, e.clientX - (window.innerWidth - prev.width - 24))),
        height: Math.max(300, Math.min(window.innerHeight - 100, e.clientY - (window.innerHeight - prev.height - 24)))
      }));
    };
    const handleMouseUp = () => {
      resizeRef.current = false;
      document.body.style.cursor = 'default';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const effectiveMinimized = isMinimized && !isFullScreen;

  return (
    <>
      {/* Draggable boundary constraint layer */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[99]" />

      <motion.div 
        drag={!isFullScreen && !effectiveMinimized}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          height: isFullScreen ? 'calc(100vh - 120px)' : effectiveMinimized ? '64px' : `${size.height}px`,
          width: isFullScreen ? 'calc(100% - 320px)' : effectiveMinimized ? '280px' : `${size.width}px`,
          bottom: isFullScreen ? '40px' : '24px',
          right: isFullScreen ? '40px' : '24px',
          borderRadius: isFullScreen ? '32px' : '24px',
          zIndex: isFullScreen ? 40 : 1000,
        }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="fixed bg-black/85 backdrop-blur-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`h-16 shrink-0 px-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02] ${!isFullScreen && !effectiveMinimized ? 'cursor-grab active:cursor-grabbing' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>
              <div className="absolute -inset-1 bg-emerald-500/20 blur-md rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex flex-col">
              <h3 className="font-black text-white uppercase tracking-[0.2em] text-[10px] italic leading-none">GLOBAL CHAT</h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Minimize / Maximize */}
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
              title="Minimize"
            >
              {effectiveMinimized ? <Maximize2 size={13} /> : <Minus size={13} />}
            </button>

            {/* Fullscreen */}
            {!effectiveMinimized && (
              <button 
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                <Maximize2 size={13} className={isFullScreen ? 'rotate-180' : ''} />
              </button>
            )}

            {/* Close */}
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Close"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Message Container Area */}
        <div className={`flex-1 flex flex-col min-h-0 relative transition-all duration-300 ${effectiveMinimized ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                <MessageSquare size={36} strokeWidth={1.5} />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] italic">No messages yet...</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.username === user.username;
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 group`}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span 
                        onClick={() => onPlayerClick && onPlayerClick({ username: msg.username, uid: msg.senderUid, customAvatar: msg.customAvatar, currentCharacter: msg.character })}
                        className={`text-[9px] font-black uppercase tracking-widest italic cursor-pointer hover:underline ${isMe ? 'text-blue-400' : 'text-white/60 hover:text-white'}`}
                      >
                        {msg.username}
                      </span>
                      <span className="text-[7px] font-bold text-white/10 tabular-nums">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed transition-all ${
                      isMe 
                        ? 'bg-white text-black shadow-lg rounded-tr-none' 
                        : 'bg-white/5 text-white border border-white/5 rounded-tl-none group-hover:border-white/10'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <div className="relative flex items-center">
              <input 
                id="chat-input"
                type="text" 
                placeholder="TYPE A MESSAGE..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-5 pr-12 py-3.5 text-[10px] font-black text-white outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/15 uppercase tracking-widest italic"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    onSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('chat-input');
                  if (input && input.value.trim()) {
                    onSendMessage(input.value);
                    input.value = '';
                  }
                }}
                className="absolute right-3 p-1.5 hover:bg-white/10 rounded-lg transition-all"
              >
                <Send size={12} className="text-white/30 hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Resize Grabber (Bottom-Right) */}
          {!isFullScreen && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                resizeRef.current = true;
                document.body.style.cursor = 'nwse-resize';
              }}
              className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center z-50 p-1.5 group"
            >
              <div className="w-1 h-1 bg-white/10 group-hover:bg-white/30 rounded-full transition-colors" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-white/15 group-hover:border-white/30 rounded-br-md transition-colors" />
            </div>
          )}
        </div>

        {/* Minimized Quick Bar overlay (inside the 280px container when minimized) */}
        {effectiveMinimized && (
          <div 
            onClick={() => setIsMinimized(false)}
            className="absolute inset-0 flex items-center justify-between px-5 cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <MessageSquare size={12} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">Chat Minimized</span>
              </div>
            </div>
            <ChevronRight size={14} className="text-white/30 animate-pulse" />
          </div>
        )}
      </motion.div>
    </>
  );
};
