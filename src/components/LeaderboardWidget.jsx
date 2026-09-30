import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, User, ChevronRight, Zap, Flame, Award, Sparkles, Medal } from 'lucide-react';
import { CHARACTERS, DEFAULT_LEADERBOARD_DATA } from '../constants';
import { calculateTotalExp } from './AccountPage';

export const LeaderboardWidget = ({ leaderboardData, onPlayerClick, onViewFullLeaderboard }) => {
  const rawData = (leaderboardData && leaderboardData.length > 0) ? leaderboardData : DEFAULT_LEADERBOARD_DATA;

  // Accurately sort players by Level and Total EXP (matching the full Leaderboard page)
  const sortedPlayers = [...rawData].sort((a, b) => {
    const lvlDiff = (b.level || 1) - (a.level || 1);
    if (lvlDiff !== 0) return lvlDiff;
    const aTotal = a.totalExp || calculateTotalExp(a);
    const bTotal = b.totalExp || calculateTotalExp(b);
    return bTotal - aTotal;
  });

  const players = sortedPlayers;

  return (
    <div className="p-6 sm:p-8 rounded-[2.5rem] bg-[#0c0f18]/90 border border-blue-500/25 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
      {/* Background ambient accents in blue and purple */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header with Close, Highly-Visible View Full Leaderboard Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/25 to-purple-600/25 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            <Trophy size={24} className="text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight italic">
                GLOBAL RANKINGS
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[9px] font-black uppercase tracking-wider">
                LIVE
              </span>
            </div>
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest mt-0.5">
              Top Ranked Players Across All Games
            </p>
          </div>
        </div>

        {/* View Full Leaderboard Button - prominent and right next to the widget */}
        {onViewFullLeaderboard && (
          <motion.button
            whileHover={{ scale: 1.03, x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onViewFullLeaderboard}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.35)] cursor-pointer transition-all border border-blue-400/30"
          >
            <span>View Full Leaderboard</span>
            <ChevronRight size={14} />
          </motion.button>
        )}
      </div>

      {/* Players List */}
      <div className="space-y-2.5 relative z-10">
        {players.map((player, i) => {
          const character = CHARACTERS.find(c => c.id === player.currentCharacter) || CHARACTERS[0];
          const isGold = i === 0;
          const isSilver = i === 1;
          const isBronze = i === 2;
          const totalExp = player.totalExp || calculateTotalExp(player);

          return (
            <motion.div
              key={player.uid || `${player.username}-${i}`}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onPlayerClick && onPlayerClick(player)}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer border ${
                isGold
                  ? 'bg-gradient-to-r from-yellow-500/20 via-amber-950/20 to-black/60 border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.2)] hover:border-yellow-400'
                  : isSilver
                  ? 'bg-gradient-to-r from-slate-400/15 via-slate-900/30 to-black/60 border-slate-300/40 shadow-[0_0_15px_rgba(203,213,225,0.1)] hover:border-slate-200'
                  : isBronze
                  ? 'bg-gradient-to-r from-amber-700/20 via-amber-950/25 to-black/60 border-amber-600/40 shadow-[0_0_15px_rgba(180,83,9,0.1)] hover:border-amber-500'
                  : 'bg-white/[0.02] hover:bg-blue-500/10 border-white/5 hover:border-blue-500/30'
              }`}
            >
              {/* Left: Rank, Avatar, Name, Level */}
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-8 text-center shrink-0 flex items-center justify-center">
                  {isGold ? (
                    <div className="w-8 h-8 rounded-xl bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                      <span className="text-xs font-black italic">#1</span>
                    </div>
                  ) : isSilver ? (
                    <div className="w-7 h-7 rounded-lg bg-slate-300/20 border border-slate-300/40 flex items-center justify-center text-slate-200">
                      <span className="text-xs font-black italic">#2</span>
                    </div>
                  ) : isBronze ? (
                    <div className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-600/40 flex items-center justify-center text-amber-500">
                      <span className="text-xs font-black italic">#3</span>
                    </div>
                  ) : (
                    <span className="text-xs font-black text-white/40 italic">
                      #{i + 1}
                    </span>
                  )}
                </div>

                {/* Circular Avatar */}
                <div className={`relative w-11 h-11 rounded-full bg-black border-2 overflow-hidden shrink-0 shadow-md ${
                  isGold ? 'border-yellow-400/60' : isSilver ? 'border-slate-300/50' : isBronze ? 'border-amber-600/50' : 'border-blue-500/30'
                }`}>
                  {player.customAvatar ? (
                    <img src={player.customAvatar} alt={player.username} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-300 bg-white/5 rounded-full">
                      <User size={20} />
                    </div>
                  )}
                </div>

                {/* Username & Level */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm sm:text-base font-black uppercase tracking-tight italic truncate ${
                      isGold ? 'text-yellow-300' : isSilver ? 'text-slate-100' : isBronze ? 'text-amber-300' : 'text-white'
                    }`}>
                      {player.username}
                    </p>
                    {player.role === 'OWNER' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase tracking-tighter">
                        OWNER
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                    <span className="text-blue-300">Level {player.level || 1}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{player.gamesPlayed || 0} Games</span>
                  </p>
                </div>
              </div>

              {/* Right: EXP Points */}
              <div className="text-right shrink-0 pl-3">
                <div className="flex items-center justify-end gap-1">
                  <p className="text-sm sm:text-base font-black text-white italic tracking-tight">
                    {totalExp.toLocaleString()}
                  </p>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  TOTAL EXP
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
