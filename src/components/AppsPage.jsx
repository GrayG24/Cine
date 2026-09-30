import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clapperboard, Radio, Disc3, MessageSquare, ExternalLink } from 'lucide-react';
import { AppRoute } from '../constants';
import { safeLocalStorageGetJSON, safeLocalStorageSet } from '../lib/storage';

export const AppsPage = ({ onNavigate }) => {
  const [recentApps, setRecentApps] = useState(() => {
    return safeLocalStorageGetJSON('recent_apps_list', []);
  });

  const apps = [
    {
      id: 'chat',
      name: 'Messages',
      icon: MessageSquare,
      route: AppRoute.CHAT,
      description: 'message individual players or chat in community channels',
      category: 'COMMUNITY',
      badge: 'MESSAGES',
      accent: '#3b82f6',
      bgGlow: 'rgba(59,130,246,0.2)',
      action: () => {
        onNavigate(AppRoute.CHAT);
        trackRecentApp('chat');
      }
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: Disc3,
      route: AppRoute.SPOTIFY,
      description: 'built in spotify player',
      category: 'MUSIC',
      badge: 'AUDIO',
      accent: '#10b981',
      bgGlow: 'rgba(16,185,129,0.15)',
      action: () => {
        onNavigate(AppRoute.SPOTIFY);
        trackRecentApp('spotify');
      }
    },
    {
      id: 'stream',
      name: 'Streamly',
      icon: Radio,
      route: AppRoute.STREAM,
      description: 'live streaming platform',
      category: 'STREAMING',
      badge: 'UPGRADES',
      accent: '#a855f7',
      bgGlow: 'rgba(168,85,247,0.15)',
      action: () => {
        onNavigate(AppRoute.STREAM);
        trackRecentApp('stream');
      }
    },
    {
      id: 'cinema',
      name: 'Cinema',
      icon: Clapperboard,
      route: AppRoute.CINEMA,
      description: 'movies, TV-shows',
      category: 'THEATER',
      badge: 'UPGRADES',
      accent: '#f59e0b',
      bgGlow: 'rgba(245,158,11,0.15)',
      action: () => {
        onNavigate(AppRoute.CINEMA);
        trackRecentApp('cinema');
      }
    },
  ];

  const trackRecentApp = (appId) => {
    setRecentApps(prev => {
      const updated = [appId, ...prev.filter(id => id !== appId)].slice(0, 4);
      safeLocalStorageSet('recent_apps_list', updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen pt-8 pb-32 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight italic leading-none">
          Apps
        </h1>
        <p className="text-white/40 text-xs sm:text-sm font-medium mt-1">
          Explore apps, utilities, music, and community hubs.
        </p>
      </div>

      {/* Grid of Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app) => (
          <motion.div
            key={app.id}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={app.action}
            className="p-8 rounded-[2.5rem] bg-gradient-to-b from-white/[0.03] to-black/60 border border-white/10 hover:border-white/30 cursor-pointer shadow-xl transition-all group flex flex-col justify-between h-64 relative overflow-hidden"
          >
            <div 
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
              style={{ backgroundColor: app.accent }}
            />

            <div className="flex items-start justify-between">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white border"
                style={{ 
                  backgroundColor: `${app.accent}20`,
                  borderColor: `${app.accent}40`,
                  color: app.accent,
                  boxShadow: `0 0 25px ${app.accent}30`
                }}
              >
                <app.icon size={26} />
              </div>

              <span 
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                style={{ 
                  backgroundColor: `${app.accent}15`,
                  borderColor: `${app.accent}30`,
                  color: app.accent
                }}
              >
                {app.badge}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">
                {app.name}
              </h3>
              <p className="text-xs text-white/50 leading-relaxed mt-1 line-clamp-2">
                {app.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] font-black uppercase tracking-wider text-white/70">
              <span className="text-white/40">{app.category}</span>
              <div className="flex items-center gap-1.5 text-primary group-hover:translate-x-1 transition-transform">
                <span>Open App</span>
                <ExternalLink size={12} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
