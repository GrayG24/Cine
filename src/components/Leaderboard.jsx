import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Zap, User, ChevronRight, Sparkles, Gamepad2, Flame, Award, Medal } from 'lucide-react';
import { calculateTotalExp, computeUserBadges } from './AccountPage';
import { DEFAULT_LEADERBOARD_DATA } from '../constants';

export const Leaderboard = ({ user, leaderboardData = [], onPlayerClick }) => {
  const [boardType, setBoardType] = useState('levels'); // 'levels' | 'games'

  const rawData = (leaderboardData && leaderboardData.length > 0) ? leaderboardData : DEFAULT_LEADERBOARD_DATA;

  // Sort based on active leaderboard type
  const sortedData = [...rawData].sort((a, b) => {
    if (boardType === 'games') {
      return (b.gamesPlayed || 0) - (a.gamesPlayed || 0);
    }
    const lvlDiff = (b.level || 1) - (a.level || 1);
    if (lvlDiff !== 0) return lvlDiff;
    const aTotal = a.totalExp || calculateTotalExp(a);
    const bTotal = b.totalExp || calculateTotalExp(b);
    return bTotal - aTotal;
  });

  // Calculate self rank
  const userRank = sortedData.findIndex(p => (p.uid === user?.uid || p.username === user?.username)) + 1;
  const displayRank = userRank > 0 ? `#${userRank}` : '#?,???';
  
  // Tier logic: 1st is Gold, 2nd is Silver, 3rd is Bronze, rest below that are NOOB
  const getTier = (rank) => {
    if (rank === 1) return { label: 'GOLD', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/50' };
    if (rank === 2) return { label: 'SILVER', color: 'text-slate-300', bg: 'bg-slate-400/20', border: 'border-slate-400/40' };
    if (rank === 3) return { label: 'BRONZE', color: 'text-amber-500', bg: 'bg-amber-600/20', border: 'border-amber-600/40' };
    return { label: 'NOOB', color: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/30' };
  };

  const userTier = userRank > 0 ? getTier(userRank) : { label: 'NOOB', color: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/30' };

  const topPlayers = sortedData.slice(0, 3);
  const otherPlayers = sortedData.slice(3);

  // Visual Podium order: [Silver (#2), Gold (#1), Bronze (#3)]
  const podium = [
    { 
      rank: 2, 
      player: topPlayers[1], 
      tier: getTier(2),
      gradient: 'from-slate-400/20 via-slate-500/10 to-black/80', 
      border: 'border-slate-400/50', 
      text: 'text-slate-300', 
      height: 'h-[370px]' 
    },
    { 
      rank: 1, 
      player: topPlayers[0], 
      tier: getTier(1),
      gradient: 'from-amber-400/25 via-yellow-500/15 to-black/80', 
      border: 'border-yellow-400/60 shadow-[0_0_50px_rgba(234,179,8,0.25)]', 
      text: 'text-yellow-400', 
      height: 'h-[430px]' 
    },
    { 
      rank: 3, 
      player: topPlayers[2], 
      tier: getTier(3),
      gradient: 'from-amber-700/20 via-orange-800/10 to-black/80', 
      border: 'border-amber-700/50', 
      text: 'text-amber-500', 
      height: 'h-[340px]' 
    },
  ];

  return (
    <div className="min-h-screen pt-8 pb-40 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Trophy size={14} className="text-yellow-400" />
            <span>GLOBAL RANKINGS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
            LEADERBOARD
          </h1>
          <p className="text-white/50 text-xs sm:text-sm font-medium uppercase tracking-widest max-w-lg">
            Live rankings across all players. Climb the leaderboards in Levels (EXP) and Most Played Games.
          </p>
        </div>

        {/* Player Personal Stat Badge */}
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-[#0c0f18] border border-blue-500/30 backdrop-blur-2xl shadow-xl">
          <div className="px-5 py-2 border-r border-white/10 text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">YOUR RANK</span>
            <span className="text-3xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{displayRank}</span>
          </div>
          <div className="px-5 py-2 text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">YOUR TIER</span>
            <span className={`text-2xl font-black italic tracking-tight ${userTier.color}`}>
              {userTier.label}
            </span>
          </div>
        </div>
      </div>

      {/* Two Separate Leaderboard Tabs */}
      <div className="flex items-center gap-4 mb-10 pb-4 border-b border-white/10">
        <button
          onClick={() => setBoardType('levels')}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            boardType === 'levels'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.35)]'
              : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <Zap size={15} />
          <span>Levels (EXP)</span>
        </button>
        <button
          onClick={() => setBoardType('games')}
          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            boardType === 'games'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.35)]'
              : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <Gamepad2 size={15} />
          <span>Most Played Games</span>
        </button>
      </div>

      {/* Top 3 Podium (Gold, Silver, Bronze) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-16">
        {podium.map(({ rank, player, tier, gradient, border, text, height }) => {
          if (!player) return null;
          const isWinner = rank === 1;
          const playerTotalExp = player.totalExp || calculateTotalExp(player);

          return (
            <motion.div
              key={player.uid || player.username}
              whileHover={{ y: -8 }}
              onClick={() => onPlayerClick && onPlayerClick(player)}
              className={`relative rounded-[2.5rem] p-6 bg-gradient-to-b ${gradient} border ${border} backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-between text-center cursor-pointer group transition-all ${
                isWinner ? 'order-first md:order-2 border-2' : rank === 2 ? 'order-2 md:order-1' : 'order-3'
              }`}
              style={{ minHeight: isWinner ? '400px' : '350px' }}
            >
              {/* Podium Header with Medal & Tier */}
              <div className="flex flex-col items-center">
                {isWinner ? (
                  <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400/60 text-yellow-300 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                    <span className="text-2xl font-black italic tracking-tighter drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]">#1</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className={`text-xs font-black uppercase tracking-widest ${text}`}>
                      #{rank}
                    </span>
                  </div>
                )}

                {/* Tier Badge */}
                <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 ${tier.bg} ${tier.color} border ${tier.border}`}>
                  {tier.label}
                </span>

                {/* Avatar */}
                <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 border-2 ${border} bg-black overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300 flex items-center justify-center`}>
                  {player.customAvatar ? (
                    <img src={player.customAvatar} alt={player.username} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 bg-white/5 rounded-full">
                      <User size={38} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-black text-white">
                    #{rank}
                  </div>
                </div>
              </div>

              {/* Player Info */}
              <div className="mt-4 w-full">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <h3 className="text-xl font-black italic tracking-tight uppercase text-white truncate max-w-[200px]">
                    {player.username}
                  </h3>
                </div>

                <div className="flex items-center justify-center gap-2 mt-1.5">
                  {boardType === 'levels' ? (
                    <>
                      <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                        Level {player.level || 1}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span className={`text-xs font-black italic ${text}`}>
                        {playerTotalExp.toLocaleString()} EXP
                      </span>
                    </>
                  ) : (
                    <span className={`text-xs font-black italic ${text}`}>
                      {player.gamesPlayed || 0} Games Played
                    </span>
                  )}
                </div>
              </div>

              {/* View Profile Action */}
              <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-blue-400 transition-colors">
                <span>View Profile</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Ranks 4+ Table (Tiers: NOOBIES) */}
      <div className="rounded-[2.5rem] bg-[#0c0f18] border border-blue-500/20 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-white/60">
            Contenders ({otherPlayers.length + 3} Total Ranked)
          </span>
          <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest">
            {boardType === 'levels' ? 'Ranked by Total EXP & Level' : 'Ranked by Total Games Played'}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {otherPlayers.map((player, idx) => {
            const rankNumber = idx + 4;
            const isSelf = player.uid === user?.uid || player.username === user?.username;
            const tier = getTier(rankNumber); // 'NOOBIES'
            const playerTotalExp = player.totalExp || calculateTotalExp(player);
            const playerBadges = computeUserBadges(player, rawData);

            return (
              <motion.div
                key={player.uid || `${player.username}-${idx}`}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                onClick={() => onPlayerClick && onPlayerClick(player)}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  isSelf ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <span className="text-base sm:text-lg font-black italic text-white/30 w-8 text-center shrink-0">
                    #{rankNumber}
                  </span>

                  <div className="w-11 h-11 rounded-full bg-black border border-blue-500/30 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                    {player.customAvatar ? (
                      <img src={player.customAvatar} alt={player.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 bg-white/5 rounded-full">
                        <User size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-black italic uppercase tracking-tight text-white truncate">
                        {player.username}
                      </h4>
                      {isSelf && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-wider">
                          YOU
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${tier.bg} ${tier.color} border ${tier.border}`}>
                        {tier.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                      Level {player.level || 1}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div>
                    {boardType === 'levels' ? (
                      <>
                        <span className="text-sm sm:text-base font-black italic text-white block">
                          {playerTotalExp.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block">
                          TOTAL EXP
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm sm:text-base font-black italic text-white block">
                          {player.gamesPlayed || 0}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 block">
                          GAMES PLAYED
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
