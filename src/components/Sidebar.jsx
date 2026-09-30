import React, { useState, useEffect } from 'react';
import { House, Gamepad2, LayoutGrid, MessageSquare, Settings as SettingsIcon, User, ShieldAlert, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { AppRoute, CHARACTERS, isPlatformOwner } from '../constants';
import { Logo } from './Logo';

export const Sidebar = ({ 
  user, 
  currentView, 
  onViewChange, 
  onProfileClick, 
  onLogin, 
  onLogout, 
  firebaseUser, 
  isExpanded, 
  onToggleExpand, 
  onlineCount: propOnlineCount 
}) => {
  const [time, setTime] = useState(new Date());
  const [localOnlineCount, setLocalOnlineCount] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (propOnlineCount !== undefined) return;
    const fetchStatus = () => {
      fetch('/api/system/status')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.activeUsers === 'number') {
            setLocalOnlineCount(data.activeUsers);
          }
        })
        .catch(() => {});
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [propOnlineCount]);

  const onlineCount = propOnlineCount !== undefined ? propOnlineCount : localOnlineCount;
  const currentChar = CHARACTERS.find(c => c.id === user.currentCharacter) || CHARACTERS[0];
  const sidebarTransition = { duration: 0.65, ease: [0.22, 1, 0.36, 1] };

  // Owner check: softball_chik_007@yahoo.com, Graycen, or role OWNER
  const isOwner = isPlatformOwner(user, firebaseUser);

  const menuItems = [
    { id: AppRoute.HOME, label: 'Dashboard', icon: House },
    { id: AppRoute.LIBRARY, label: 'Games', icon: Gamepad2 },
    { id: AppRoute.APPS, label: 'Apps & Media', icon: LayoutGrid },
    { id: AppRoute.ACCOUNT, label: 'Profile', icon: User },
    { id: AppRoute.CHAT, label: 'Messages', icon: MessageSquare },
    { id: AppRoute.SETTINGS, label: 'Settings', icon: SettingsIcon },
  ];

  // ONLY show Owner Portal if user is the Owner
  if (isOwner) {
    menuItems.push({
      id: AppRoute.OWNER,
      label: 'Owner Portal',
      icon: Crown,
      isOwnerSpecial: true
    });
  }

  return (
    <motion.aside
      onMouseEnter={() => onToggleExpand(true)}
      onMouseLeave={() => {
        if (user?.settings?.sidebarAutoHide !== false) {
          onToggleExpand(false);
        }
      }}
      initial={false}
      animate={{ 
        width: isExpanded ? 270 : 80,
      }}
      transition={sidebarTransition}
      className="fixed left-4 top-4 bottom-4 z-50 flex flex-col bg-[#0b0e14]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto"
    >
      {/* Brand Header */}
      <div className={`h-20 flex items-center shrink-0 border-b border-white/5 transition-all ${
        isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'
      }`}>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange(AppRoute.HOME)}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.25)] p-1"
        >
          <Logo />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? 160 : 0,
            marginLeft: isExpanded ? 12 : 0,
          }}
          transition={sidebarTransition}
          className="flex flex-col overflow-hidden whitespace-nowrap"
        >
          <span className="font-black text-xl italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-none">
            CINE
          </span>
          <span className="text-[9px] font-bold tracking-widest text-purple-400 uppercase mt-1">
            APPS & GAMES
          </span>
        </motion.div>
      </div>

      {/* Nav Navigation */}
      <nav className={`flex-1 py-4 space-y-1.5 overflow-y-auto no-scrollbar transition-all ${
        isExpanded ? 'px-3' : 'px-2 flex flex-col items-center'
      }`}>
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const isOwnerTab = item.isOwnerSpecial;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`h-12 flex items-center rounded-2xl transition-all duration-200 group relative ${
                isExpanded ? 'w-full px-3.5 justify-start' : 'w-12 justify-center px-0'
              } ${
                isOwnerTab
                  ? isActive
                    ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.35)] font-black'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 font-bold'
                  : isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/15 text-blue-300 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)] font-bold' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon 
                size={20} 
                className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isOwnerTab
                    ? 'text-amber-400 group-hover:text-amber-300'
                    : isActive 
                      ? 'text-blue-400' 
                      : 'text-white/50 group-hover:text-white'
                }`} 
              />

              {isExpanded && (
                <motion.div
                  initial={false}
                  animate={{
                    opacity: 1,
                    width: 160,
                    marginLeft: 12,
                  }}
                  transition={sidebarTransition}
                  className="overflow-hidden whitespace-nowrap text-left flex items-center justify-between flex-1"
                >
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {item.label}
                  </span>
                  {isOwnerTab && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase tracking-tighter ml-2">
                      OWNER
                    </span>
                  )}
                </motion.div>
              )}

              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-md ${
                  isOwnerTab 
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_0_10px_#f59e0b]'
                    : 'bg-gradient-to-b from-blue-400 to-purple-500 shadow-[0_0_10px_#60a5fa]'
                }`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Online Status & Footer Profile */}
      <div className={`p-3 border-t border-white/5 flex flex-col gap-2 shrink-0 transition-all ${
        isExpanded ? 'items-stretch' : 'items-center'
      }`}>
        <div 
          onClick={() => {
            if (onViewChange) {
              onViewChange(AppRoute.ACCOUNT);
            } else if (onProfileClick) {
              onProfileClick();
            }
          }}
          className={`flex items-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all group ${
            isExpanded ? 'w-full p-2.5 justify-start gap-3' : 'w-12 h-12 justify-center p-0 gap-0'
          }`}
        >
          <div className="relative w-9 h-9 shrink-0">
            <div className="w-full h-full rounded-full bg-black border border-white/10 overflow-hidden flex items-center justify-center">
              {user?.customAvatar ? (
                <img src={user.customAvatar} alt={user.username} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-300/80 bg-white/5 rounded-full">
                  <User size={18} />
                </div>
              )}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0b0e14] ${
              firebaseUser && !firebaseUser.isAnonymous ? 'bg-emerald-500' : 'bg-cyan-400 animate-pulse'
            }`} />
          </div>

          {isExpanded && (
            <motion.div
              initial={false}
              animate={{
                opacity: 1,
                width: 150,
                marginLeft: 12,
              }}
              transition={sidebarTransition}
              className="overflow-hidden whitespace-nowrap text-left flex-1 min-w-0"
            >
              <p className="text-xs font-black text-white uppercase italic truncate">
                {user?.username || 'Player'}
              </p>
              <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider truncate">
                {firebaseUser && !firebaseUser.isAnonymous ? `Level ${user?.level || 1}` : 'Sign In / Account'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
