import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Gamepad2, Pin, Zap, Sparkles, AlertTriangle, Lock, ChevronRight, Play } from 'lucide-react';

export const Library = ({ 
  games, 
  favorites = [], 
  pinnedGames = [], 
  onToggleFavorite, 
  onTogglePin, 
  onPlayGame,
  lockedGames = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = React.useMemo(() => {
    return Array.from(new Set(games.flatMap(g => g.categories || (g.category ? [g.category] : []))))
      .filter(cat => cat !== 'adventure');
  }, [games]);

  const filteredGames = React.useMemo(() => {
    const list = games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const gameCats = game.categories || (game.category ? [game.category] : []);
      const matchesCategory = !selectedCategory || gameCats.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });
    return [...list].sort((a, b) => a.title.localeCompare(b.title));
  }, [games, searchQuery, selectedCategory]);

  return (
    <div className="w-full min-h-screen py-8 pb-32 text-white">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              EXPLORE ALL
            </span>
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">• {games.length} Games</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase text-white">
            GAMES LIBRARY
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all titles..."
            className="w-full bg-[#0a0d18] border border-white/10 rounded-2xl px-5 py-3.5 pl-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors shadow-xl"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${
            selectedCategory === null 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
              : 'bg-white/[0.03] text-white/60 border-white/10 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          All Games
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                : 'bg-white/[0.03] text-white/60 border-white/10 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game) => (
          <SimpleGameCard
            key={game.id}
            game={game}
            isFavorite={(favorites || []).includes(game.id)}
            isPinned={(pinnedGames || []).includes(game.id)}
            onToggleFavorite={onToggleFavorite}
            onTogglePin={onTogglePin}
            onPlay={() => onPlayGame(game)}
            lockInfo={lockedGames[game.id]}
          />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
          <Gamepad2 size={40} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-sm">No games found matching your search</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
            className="mt-4 px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-bold uppercase tracking-wider border border-white/10"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

const CATEGORY_ACCENTS = {
  driving: '#06b6d4',
  action: '#f43f5e',
  sports: '#10b981',
  puzzle: '#8b5cf6',
  shooter: '#f59e0b',
  strategy: '#3b82f6',
  arcade: '#ec4899',
  retro: '#eab308',
  multiplayer: '#6366f1',
  casual: '#14b8a6',
  default: '#a855f7'
};

const SimpleGameCard = ({ game, isFavorite, isPinned, onToggleFavorite, onTogglePin, onPlay, lockInfo }) => {
  const isBroken = Boolean(lockInfo?.isBroken);
  const isLocked = Boolean(lockInfo?.isLocked);
  const catKey = (game?.category || (game.categories && game.categories[0]) || 'default').toLowerCase().trim();
  const accent = CATEGORY_ACCENTS[catKey] || CATEGORY_ACCENTS.default;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPlay}
      className="p-6 rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] via-[#090c16]/90 to-black/95 border cursor-pointer shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
      style={{ borderColor: `${accent}35` }}
    >
      {/* Ambient background colored glow blob matching App Cards */}
      <div 
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: accent }}
      />
      <div 
        className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      {/* Top Header Row: Category Badge + Status + Favorite Pin */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span 
            className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md"
            style={{ 
              backgroundColor: `${accent}18`, 
              color: accent, 
              borderColor: `${accent}40` 
            }}
          >
            {game.category ? game.category.replace('_', ' ') : 'ACTION'}
          </span>

          {isBroken && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
              <AlertTriangle size={10} className="fill-black" />
              Broken
            </span>
          )}
          {isLocked && !isBroken && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Lock size={10} />
              Locked
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          className={`w-8 h-8 rounded-xl backdrop-blur-xl border flex items-center justify-center transition-all ${
            isFavorite 
              ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]' 
              : 'bg-black/60 border-white/10 text-white/40 hover:text-white hover:bg-black/80'
          }`}
          title="Pin to favorites"
        >
          <Pin size={13} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Card Thumbnail Poster */}
      <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 relative mb-4 group-hover:border-white/20 transition-all">
        <img
          src={game.thumbnail || game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        {/* Centered Play Button Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-xl scale-90 group-hover:scale-100 transition-transform"
            style={{ 
              backgroundColor: accent,
              boxShadow: `0 0 25px ${accent}80`
            }}
          >
            {isLocked || isBroken ? <Lock size={18} className="text-black" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </div>
        </div>
      </div>

      {/* Title & Metadata (No Ratings) */}
      <div className="relative z-10">
        <h4 
          className="text-base sm:text-lg font-black uppercase italic tracking-tight text-white transition-colors truncate"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
        >
          {game.title}
        </h4>
        <p className="text-[11px] text-white/50 line-clamp-1 mt-1 font-medium">
          {(game.categories || [game.category || 'action']).map(c => c.replace('_', ' ')).join(' • ')}
        </p>

        {/* Bottom Action Bar matching App Cards */}
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider pt-3.5 mt-3.5 border-t border-white/5">
          <div 
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: accent }}
          >
            <span>{isLocked || isBroken ? 'Under Maintenance' : 'Launch Game'}</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
            +100-150 EXP
          </span>
        </div>
      </div>
    </motion.div>
  );
};
