import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Shield, 
  Trash2, 
  Users, 
  Info, 
  Flame, 
  Flag, 
  Search, 
  Plus, 
  User, 
  ExternalLink,
  Sparkles,
  Check,
  Hash,
  X,
  Crown
} from 'lucide-react';
import { AppRoute, CHARACTERS, DEFAULT_LEADERBOARD_DATA } from '../constants';
import { filterProfanity } from '../lib/profanity';

const QUICK_EMOJIS = ['🔥', '🎮', '👑', '⚡', '🚀', '❤️', '🏆', '💯', '😂', '👏'];

export const GlobalChatPage = ({ 
  messages = [], 
  onSendMessage, 
  onDeleteMessage, 
  user, 
  onlineCount = 1, 
  onNavigate,
  onReportAccount,
  onPlayerClick,
  leaderboardData = [],
  initialDirectUser = null
}) => {
  // Active conversation: 'global' or a player object { uid, username, customAvatar, level }
  const [activeChannel, setActiveChannel] = useState('global');
  const [activeDirectPlayer, setActiveDirectPlayer] = useState(initialDirectUser || null);
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [isNewDmModalOpen, setIsNewDmModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  // If initialDirectUser changes, activate direct chat with them
  useEffect(() => {
    if (initialDirectUser) {
      setActiveChannel('dm');
      setActiveDirectPlayer(initialDirectUser);
    }
  }, [initialDirectUser]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel, activeDirectPlayer]);

  // Candidate players for DMs from leaderboard and existing messages
  const communityPlayers = useMemo(() => {
    const list = [...(leaderboardData && leaderboardData.length > 0 ? leaderboardData : DEFAULT_LEADERBOARD_DATA)];
    // Extract any players from messages who messaged user
    messages.forEach(m => {
      if (m.username && m.username !== user?.username && m.username !== 'SYSTEM') {
        if (!list.some(p => p.username === m.username || (p.uid && p.uid === m.senderUid))) {
          list.push({
            uid: m.senderUid,
            username: m.username,
            customAvatar: m.customAvatar,
            level: 1
          });
        }
      }
    });
    // Filter out self
    return list.filter(p => p.username !== user?.username && (!user?.uid || p.uid !== user?.uid));
  }, [leaderboardData, messages, user]);

  // List of active DM partners who have exchanged messages with user
  const activeDmPartners = useMemo(() => {
    const map = new Map();
    // Add current activeDirectPlayer if set
    if (activeDirectPlayer) {
      const key = activeDirectPlayer.uid || activeDirectPlayer.username;
      map.set(key, activeDirectPlayer);
    }

    messages.forEach(m => {
      const isFromMeToSomeone = (m.senderUid === user?.uid || m.username === user?.username) && (m.recipientUid || m.recipientUsername);
      const isToMeFromSomeone = (m.recipientUid === user?.uid || m.recipientUsername === user?.username) && m.username !== user?.username;

      if (isFromMeToSomeone) {
        const key = m.recipientUid || m.recipientUsername;
        if (!map.has(key)) {
          const matched = communityPlayers.find(p => p.uid === m.recipientUid || p.username === m.recipientUsername);
          map.set(key, matched || { uid: m.recipientUid, username: m.recipientUsername, level: 1 });
        }
      } else if (isToMeFromSomeone) {
        const key = m.senderUid || m.username;
        if (!map.has(key)) {
          const matched = communityPlayers.find(p => p.uid === m.senderUid || p.username === m.username);
          map.set(key, matched || { uid: m.senderUid, username: m.username, customAvatar: m.customAvatar, level: 1 });
        }
      }
    });

    return Array.from(map.values());
  }, [messages, user, communityPlayers, activeDirectPlayer]);

  // Filter messages based on active channel (Global vs Direct Message)
  const filteredMessages = useMemo(() => {
    if (activeChannel === 'global') {
      // Global messages have no recipient
      return messages.filter(m => !m.recipientUid && !m.recipientUsername);
    }

    if (activeChannel === 'dm' && activeDirectPlayer) {
      const theirUid = activeDirectPlayer.uid;
      const theirName = (activeDirectPlayer.username || '').toLowerCase();
      const myUid = user?.uid;
      const myName = (user?.username || '').toLowerCase();

      return messages.filter(m => {
        const mSenderUid = m.senderUid;
        const mSenderName = (m.username || m.senderName || '').toLowerCase();
        const mRecipientUid = m.recipientUid;
        const mRecipientName = (m.recipientUsername || '').toLowerCase();

        // Check if sent by me to them
        const sentByMeToThem = (mSenderUid === myUid || mSenderName === myName) && 
          ((theirUid && mRecipientUid === theirUid) || (theirName && mRecipientName === theirName));

        // Check if sent by them to me
        const sentByThemToMe = ((theirUid && mSenderUid === theirUid) || (theirName && mSenderName === theirName)) && 
          (mRecipientUid === myUid || mRecipientName === myName);

        return sentByMeToThem || sentByThemToMe;
      });
    }

    return [];
  }, [messages, activeChannel, activeDirectPlayer, user]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const filtered = filterProfanity ? filterProfanity(inputText.trim()) : inputText.trim();
    if (onSendMessage) {
      if (activeChannel === 'dm' && activeDirectPlayer) {
        onSendMessage(filtered, activeDirectPlayer);
      } else {
        onSendMessage(filtered);
      }
    }
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
  };

  const selectDirectChat = (player) => {
    setActiveDirectPlayer(player);
    setActiveChannel('dm');
    setIsNewDmModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen py-8 pb-32 text-white max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(AppRoute.APPS)}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/70 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider italic">Apps</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/25 to-purple-600/25 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <MessageSquare size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Cine Messages</h1>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    {onlineCount} ACTIVE
                  </span>
                </div>
              </div>
              <p className="text-white/50 text-xs font-medium mt-0.5">Chat in global community channels or direct message individual players</p>
            </div>
          </div>
        </div>

        {/* Quick self badge */}
        <div className="flex items-center gap-3 bg-[#0c0f18] border border-blue-500/30 px-4 py-2.5 rounded-2xl shadow-lg">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-400/40 bg-black flex items-center justify-center shrink-0">
            {user?.customAvatar ? (
              <img src={user.customAvatar} alt={user?.username} className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-blue-300" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black italic uppercase text-white leading-tight">{user?.username || 'Player'}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">LVL {user?.level || 1}</span>
          </div>
        </div>
      </div>

      {/* Main Messages Container with Sidebar & Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Channels / Direct Messages List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-[#0c0f18]/90 backdrop-blur-3xl rounded-[2.5rem] border border-blue-500/25 shadow-2xl p-5 overflow-hidden h-[680px]">
          {/* Channel selector */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <span className="text-[11px] font-black uppercase tracking-widest text-white/50">CHANNELS & DIRECT</span>
            <button
              onClick={() => setIsNewDmModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>New Message</span>
            </button>
          </div>

          <div className="space-y-1.5 mb-5">
            {/* Global Public Room Tab */}
            <button
              onClick={() => {
                setActiveChannel('global');
                setActiveDirectPlayer(null);
              }}
              className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer border ${
                activeChannel === 'global'
                  ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/20 border-blue-500/50 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeChannel === 'global' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40'}`}>
                  <Hash size={16} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black uppercase tracking-wider block">Global Chat</span>
                  <span className="text-[10px] text-white/40 block">Public room for all players</span>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </button>
          </div>

          {/* Direct Messages Section Header */}
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
              DIRECT MESSAGES ({activeDmPartners.length})
            </span>
          </div>

          {/* DM Partners List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {activeDmPartners.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center flex flex-col items-center justify-center my-6">
                <MessageSquare size={26} className="text-white/20 mb-2" />
                <p className="text-xs font-black uppercase tracking-tight text-white/50">No Direct Messages Yet</p>
                <p className="text-[10px] text-white/30 mt-1 max-w-[180px]">Click "+ New Message" or select a player from the leaderboard to start a private chat.</p>
              </div>
            ) : (
              activeDmPartners.map((partner) => {
                const isSelected = activeChannel === 'dm' && activeDirectPlayer && (
                  (activeDirectPlayer.uid && partner.uid === activeDirectPlayer.uid) ||
                  (activeDirectPlayer.username && partner.username === activeDirectPlayer.username)
                );

                return (
                  <button
                    key={partner.uid || partner.username}
                    onClick={() => selectDirectChat(partner)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/20 border-purple-500/50 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                        : 'bg-white/[0.02] border-white/5 text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-black border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                        {partner.customAvatar ? (
                          <img src={partner.customAvatar} alt={partner.username} className="w-full h-full object-cover" />
                        ) : (
                          <User size={14} className="text-blue-300" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-xs font-black uppercase italic tracking-tight text-white block truncate">
                          {partner.username}
                        </span>
                        <span className="text-[9px] font-bold text-white/40 block">
                          Level {partner.level || 1}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-black uppercase text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Message Thread (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[680px] bg-[#0c0f18]/90 backdrop-blur-3xl rounded-[2.5rem] border border-blue-500/25 shadow-2xl overflow-hidden">
          {/* Chat Channel Banner */}
          <div className="h-16 px-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
            {activeChannel === 'global' ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <Hash size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase tracking-wider italic text-white">ALL-CHAT-PUBLIC</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[9px] font-black tracking-widest text-blue-300 uppercase">
                      {filteredMessages.length} Messages
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40">Open public lobby for all players</span>
                </div>
              </div>
            ) : activeDirectPlayer ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-black border border-purple-500/40 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                    {activeDirectPlayer.customAvatar ? (
                      <img src={activeDirectPlayer.customAvatar} alt={activeDirectPlayer.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User size={18} className="text-purple-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black uppercase tracking-tight italic text-white truncate">
                        @{activeDirectPlayer.username}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-black uppercase text-purple-300">
                        DIRECT MESSAGE
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40">Private player conversation</span>
                  </div>
                </div>

                <button
                  onClick={() => onPlayerClick && onPlayerClick(activeDirectPlayer)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>Profile</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            ) : null}
          </div>

          {/* Message List */}
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 scroll-smooth custom-scrollbar">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-3">
                <MessageSquare size={40} className="text-blue-500/30" />
                <p className="text-xs font-black uppercase tracking-widest italic text-white/60">
                  {activeChannel === 'global' ? 'No public messages yet.' : `No direct messages with @${activeDirectPlayer?.username} yet.`}
                </p>
                <p className="text-[11px] text-white/40">Send the first message to start the conversation!</p>
              </div>
            ) : (
              filteredMessages.map((msg, index) => {
                const isMe = msg.username === user?.username || msg.senderUid === user?.uid;
                const isSystem = msg.username === 'SYSTEM';
                const msgChar = CHARACTERS.find(c => c.id === msg.character) || null;

                if (isSystem) {
                  return (
                    <motion.div
                      key={msg.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-2 px-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-center text-xs font-black uppercase tracking-wider italic my-2"
                    >
                      <span className="font-mono text-blue-400 mr-2">[SYSTEM]</span>
                      {msg.text}
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div 
                      onClick={() => onPlayerClick && onPlayerClick({
                        username: msg.username,
                        uid: msg.senderUid,
                        customAvatar: msg.customAvatar,
                        currentCharacter: msg.character
                      })}
                      className="w-10 h-10 rounded-full bg-black border border-white/10 hover:border-blue-500/50 flex items-center justify-center shrink-0 overflow-hidden shadow-lg mt-0.5 cursor-pointer transition-colors"
                      title={`View ${msg.username}'s profile`}
                    >
                      {isMe && user?.customAvatar ? (
                        <img src={user.customAvatar} alt={msg.username} className="w-full h-full object-cover rounded-full" />
                      ) : msg.customAvatar ? (
                        <img src={msg.customAvatar} alt={msg.username} className="w-full h-full object-cover rounded-full" />
                      ) : msgChar?.img ? (
                        <img src={msgChar.img} alt={msg.username} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={18} className="text-white/50" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span 
                          onClick={() => onPlayerClick && onPlayerClick({
                            username: msg.username,
                            uid: msg.senderUid
                          })}
                          className={`text-[11px] font-black uppercase tracking-tight italic cursor-pointer hover:underline ${isMe ? 'text-blue-400' : 'text-white/90 hover:text-purple-300'}`}
                        >
                          {msg.username}
                        </span>
                        {(msg.role === 'OWNER' || msg.username?.toLowerCase() === 'owner') ? (
                          <Crown size={12} className="text-amber-400 fill-amber-400 shrink-0" title="Platform Owner" />
                        ) : msg.isAdmin ? (
                          <Shield size={10} className="text-rose-500 shrink-0" title="Admin" />
                        ) : null}
                        <span className="text-[9px] font-medium text-white/30">
                          {msg.timestamp ? new Date(msg.timestamp?.toMillis ? msg.timestamp.toMillis() : msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                        </span>
                        
                        {/* Report user button on hover */}
                        {!isMe && onReportAccount && (
                          <button
                            onClick={() => onReportAccount({
                              uid: msg.senderUid,
                              username: msg.username
                            })}
                            className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-400 transition-all p-0.5 cursor-pointer"
                            title={`Report @${msg.username}`}
                          >
                            <Flag size={11} />
                          </button>
                        )}

                        {user?.isAdmin && onDeleteMessage && (
                          <button
                            onClick={() => onDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 text-rose-400/60 hover:text-rose-400 transition-opacity p-0.5 cursor-pointer"
                            title="Delete message"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border border-blue-400/40 rounded-tr-none shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                            : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Quick Reaction Toolbar */}
          <div className="px-6 py-2 border-t border-white/5 bg-white/[0.01] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 shrink-0 mr-1">QUICK REACT:</span>
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 flex items-center justify-center text-sm transition-transform hover:scale-110 shrink-0 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 px-6 border-t border-white/10 bg-black/40 flex items-center gap-3">
            <div className="flex-1 relative flex items-center bg-white/5 border border-white/10 focus-within:border-blue-500/50 rounded-2xl px-4 transition-colors">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={300}
                placeholder={activeChannel === 'global' ? "Message global public chat..." : `Message @${activeDirectPlayer?.username}...`}
                className="w-full bg-transparent border-none py-3.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
              <span className="text-[10px] text-white/20 ml-2 font-mono shrink-0">
                {inputText.length}/300
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputText.trim()}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-30 text-white transition-all flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.35)] shrink-0 cursor-pointer"
            >
              <Send size={18} />
            </motion.button>
          </form>
        </div>
      </div>

      {/* NEW DIRECT MESSAGE MODAL */}
      <AnimatePresence>
        {isNewDmModalOpen && (
          <div className="fixed inset-0 z-[2600] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0c0f18] border border-blue-500/30 rounded-[2.5rem] shadow-[0_0_80px_rgba(59,130,246,0.25)] p-6 sm:p-8 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Start Direct Message</h3>
                  <p className="text-xs text-white/50">Pick a player from the community to message individually</p>
                </div>
                <button
                  onClick={() => setIsNewDmModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Player */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={dmSearchQuery}
                  onChange={(e) => setDmSearchQuery(e.target.value)}
                  placeholder="Search player username..."
                  className="w-full bg-[#121624] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Player list */}
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {communityPlayers
                  .filter(p => (p.username || '').toLowerCase().includes(dmSearchQuery.toLowerCase()))
                  .map((player) => (
                    <div
                      key={player.uid || player.username}
                      onClick={() => selectDirectChat(player)}
                      className="p-3 rounded-2xl bg-white/[0.02] hover:bg-blue-500/15 border border-white/5 hover:border-blue-500/30 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                          {player.customAvatar ? (
                            <img src={player.customAvatar} alt={player.username} className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} className="text-blue-300" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase italic tracking-tight text-white block">
                            {player.username}
                          </span>
                          <span className="text-[10px] text-white/40 block">
                            Level {player.level || 1} • {player.gamesPlayed || 0} Games
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectDirectChat(player);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md cursor-pointer"
                      >
                        Message
                      </button>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
