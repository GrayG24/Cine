import React from 'react';
import { User, Award, Flag, MessageSquare } from 'lucide-react';
import { CHARACTERS, isPlatformOwner } from '../constants';
import { computeUserBadges } from './AccountPage';
import { auth } from '../lib/firebase';

const LEVEL_UP_BASE = 80;

export const MiniProfile = ({ 
  player, 
  onClose,
  currentUser,
  onViewProfile,
  onReportAccount,
  onMessagePlayer
}) => {
  // Find character matching player's characterId or currentCharacter
  const charId = player.characterId || player.currentCharacter || 'agent-x';
  const character = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
  const AvatarIcon = character.icon || User;

  // Compute all badges and filter by user-chosen displayed badges if set
  const allEarnedBadges = computeUserBadges(player);
  let earnedBadges = Array.isArray(player.displayedBadgeIds)
    ? allEarnedBadges.filter(b => player.displayedBadgeIds.includes(b.id))
    : allEarnedBadges;

  const isPlayerOwner = isPlatformOwner(player, auth?.currentUser);

  if (isPlayerOwner) {
    const ownerBadge = allEarnedBadges.find(b => b.id === 'site-owner');
    if (ownerBadge && !earnedBadges.some(b => b.id === 'site-owner')) {
      earnedBadges = [ownerBadge, ...earnedBadges];
    }
  }

  const totalExpNeeded = (player.level || 1) * LEVEL_UP_BASE;
  const expProgressPercent = Math.min(100, ((player.exp || 0) / totalExpNeeded) * 100);

  return (
    <div className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#0b0e17] border border-blue-500/25 rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full text-center shadow-[0_30px_80px_rgba(0,0,0,0.9)] relative flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Profile Avatar Container */}
        <div className="relative mx-auto mb-5 shrink-0">
          <div className="w-24 h-24 rounded-full bg-black border-2 border-blue-500/40 flex items-center justify-center text-white relative z-10 shadow-[0_0_25px_rgba(59,130,246,0.3)] overflow-hidden">
            {player.customAvatar ? (
              <img 
                src={player.customAvatar} 
                alt={player.username} 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : character.img ? (
              <img 
                src={character.img} 
                alt={character.name} 
                className="w-full h-full object-cover rounded-full" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <AvatarIcon size={36} className="text-blue-300" />
            )}
          </div>
        </div>

        {/* Username with Badges next to name */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
            {player.username}
          </h3>
          {/* Detailed badge icons */}
          {earnedBadges.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {earnedBadges.map((badge) => {
                const BadgeIcon = badge.icon || Award;
                const badgeConfig = 
                  badge.id === 'leaderboard-first' ? 'text-amber-400 bg-amber-500/15 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                  badge.id === 'leaderboard-top10' ? 'text-purple-300 bg-purple-500/15 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]' :
                  badge.id === 'grandmaster-999' ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]' :
                  badge.id === 'century-club' ? 'text-blue-300 bg-blue-500/15 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                  badge.id === 'games-master' ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                  badge.id === 'site-owner' ? 'text-amber-400 bg-amber-500/15 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                  'text-purple-300 bg-purple-500/15 border-purple-500/30';

                return (
                  <div key={badge.id} className="relative group/mini-badge inline-block">
                    <div 
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${badgeConfig}`}
                    >
                      <BadgeIcon size={14} />
                    </div>
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/mini-badge:flex flex-col items-center z-50 pointer-events-none w-max max-w-[200px]">
                      <div className="bg-[#0b0e17]/95 border border-blue-500/40 rounded-xl px-3 py-1.5 shadow-2xl text-center backdrop-blur-xl">
                        <span className="text-[10px] font-black uppercase text-white block tracking-wider">{badge.name}</span>
                        <span className="text-[9px] text-white/80 mt-0.5 block leading-tight font-medium">{badge.desc}</span>
                      </div>
                      <div className="w-1.5 h-1.5 bg-[#0b0e17] border-r border-b border-blue-500/40 rotate-45 -mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bio (Zero bio until set) */}
        {player.bio ? (
          <p className="text-xs text-white/70 italic mb-4 max-w-xs mx-auto line-clamp-2">
            "{player.bio}"
          </p>
        ) : null}

        {/* Level and Experience Bar */}
        <div className="bg-white/[0.03] border border-blue-500/20 rounded-2xl p-4 mb-6 text-left shadow-inner">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-2 text-white/60">
            <span>LEVEL {player.level || 1}</span>
            <span>{player.exp || 0} / {totalExpNeeded} XP</span>
          </div>
          <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
              style={{ width: `${expProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto shrink-0">
          {onViewProfile && (
            <button
              onClick={() => {
                onViewProfile(player);
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-black uppercase tracking-wider text-xs transition-all italic shadow-[0_0_20px_rgba(59,130,246,0.35)] cursor-pointer"
            >
              View Full Profile
            </button>
          )}

          {onMessagePlayer && player && (player.uid || player.id) !== currentUser?.uid && (
            <button
              onClick={() => {
                onMessagePlayer(player);
                onClose();
              }}
              className="w-full py-3 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded-2xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <MessageSquare size={14} />
              <span>Message Player</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {onReportAccount && player && (player.uid || player.id) !== currentUser?.uid && (
              <button
                onClick={() => onReportAccount(player)}
                className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-2xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Report this account for breaking rules"
              >
                <Flag size={14} />
                <span>Report</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-black uppercase tracking-wider text-xs transition-all italic border border-white/10 cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
