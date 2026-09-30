import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid, LayoutList, Gamepad2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCard } from './GameCard';
import { CATEGORIES } from '../constants';

export const CategoryPage = ({ categoryId, games, favorites = [], onToggleFavorite, onPlayGame, onBack, lockedGames = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const category = CATEGORIES.find(c => c.id === categoryId) || { name: categoryId, icon: '🎮', color: 'text-cyan-400' };
  
  const filteredGames = useMemo(() => {
    const list = games.filter(g => {
      const matchCat = (g.category && g.category.toLowerCase() === categoryId.toLowerCase()) || 
                       (Array.isArray(g.categories) && g.categories.some(c => c.toLowerCase() === categoryId.toLowerCase()));
      const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
    return [...list].sort((a, b) => a.title.localeCompare(b.title));
  }, [games, categoryId, searchQuery]);

  return (
    <div className="min-h-screen pt-8 pb-32 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back to Library</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight italic leading-none">
                {category.name}
              </h1>
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mt-2">
                {filteredGames.length} Games in Category
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121620] border border-white/10 focus:border-cyan-500/50 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-bold focus:outline-none transition-all placeholder:text-white/30"
            />
          </div>
          
          <div className="flex gap-1 p-1 bg-[#121620] border border-white/10 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-black shadow-md' : 'text-white/40 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-black shadow-md' : 'text-white/40 hover:text-white'}`}
              title="List View"
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game, i) => (
              <GameCard 
                key={game.id}
                game={game}
                isFavorite={favorites.includes(game.id)}
                isPinned={favorites.includes(game.id)}
                onTogglePin={onToggleFavorite}
                onClick={onPlayGame}
                lockInfo={lockedGames[game.id]}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
          <Gamepad2 size={40} className="mx-auto text-white/20 mb-3" />
          <h3 className="text-xl font-black text-white uppercase italic tracking-tight">No Games Found</h3>
          <p className="text-white/40 text-xs mt-1 max-w-sm mx-auto">
            No games match your current filter in the {category.name} category.
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-bold uppercase tracking-wider border border-white/10 transition-all"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};
