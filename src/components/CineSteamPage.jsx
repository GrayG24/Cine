import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, ArrowLeft, Play, Search, Star, Download, Flame, Shield, Users, Sparkles, Tag, ExternalLink, Library as LibraryIcon, Compass, Trophy } from 'lucide-react';
import { AppRoute, GAMES_DATA } from '../constants';

const STEAM_CATEGORIES = ['STORE', 'LIBRARY', 'SPECIAL OFFERS', 'TOP RATED'];

export const CineSteamPage = ({ onNavigate, onPlayGame, user }) => {
  const [activeTab, setActiveTab] = useState('STORE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  const allGames = GAMES_DATA || [];
  const featuredGame = allGames[0] || {
    id: 'retro-bowl',
    title: 'Retro Bowl 25',
    category: 'SPORTS',
    cover: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&auto=format&fit=crop&q=80',
    description: 'The premier pixel retro American football coaching simulator. Manage your roster, call the offensive plays, and win the championship trophy!',
    rating: '98% Overwhelmingly Positive',
    plays: '1.2M',
  };

  const tags = ['ALL', 'ACTION', 'SPORTS', 'RETRO', '3D', 'ARCADE'];

  const filteredGames = allGames.filter(game => {
    const matchesSearch = (game.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (game.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || (game.category || '').toUpperCase().includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const libraryGames = allGames.slice(0, 8);

  const handleLaunchGame = (game) => {
    if (onPlayGame) {
      onPlayGame(game);
    } else {
      onNavigate(AppRoute.LIBRARY);
    }
  };

  return (
    <div className="w-full min-h-screen py-8 pb-32 text-white">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate(AppRoute.APPS)}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/70 hover:text-white transition-all flex items-center gap-2 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider italic">Back to Apps</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1b2838] border border-[#66c0f4]/40 flex items-center justify-center text-[#66c0f4] shadow-[0_0_30px_rgba(102,192,244,0.3)]">
              <Gamepad2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Cine Steam</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#66c0f4]/20 text-[#66c0f4] border border-[#66c0f4]/30">
                  DECK POWERED
                </span>
              </div>
              <p className="text-white/40 text-xs font-medium mt-0.5">The ultimate browser game store & library powered by Cine</p>
            </div>
          </div>
        </div>

        {/* Steam Big Picture mode button */}
        <button
          onClick={() => onNavigate(AppRoute.LIBRARY)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#171a21] to-[#1b2838] hover:from-[#1b2838] hover:to-[#2a475e] border border-[#66c0f4]/30 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg"
        >
          <Compass size={15} className="text-[#66c0f4]" />
          <span>Full Games Library</span>
        </button>
      </div>

      {/* Steam Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-[#171a21]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {STEAM_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest italic transition-all whitespace-nowrap ${
              activeTab === cat
                ? 'bg-[#66c0f4] text-black shadow-[0_0_20px_rgba(102,192,244,0.4)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: STORE */}
      {activeTab === 'STORE' && (
        <>
          {/* Steam Featured Spotlight Banner */}
          <div className="mb-10 rounded-[2.5rem] relative overflow-hidden border border-[#66c0f4]/30 bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#0e141b] shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Media column (7 cols) */}
              <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] overflow-hidden bg-black">
                <img
                  src={featuredGame.cover}
                  alt={featuredGame.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-[#66c0f4]/40 text-[#66c0f4] text-[10px] font-black uppercase tracking-widest">
                  ★ FEATURED & RECOMMENDED
                </div>
              </div>

              {/* Info column (5 cols) */}
              <div className="lg:col-span-5 p-8 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#66c0f4] mb-2 block">
                    CINE STEAM SPOTLIGHT
                  </span>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-6 text-white">
                    {featuredGame.title}
                  </h2>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                      <span className="text-white/40 font-medium">Reviews:</span>
                      <span className="text-[#66c0f4] font-bold">Overwhelmingly Positive</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                      <span className="text-white/40 font-medium">Category:</span>
                      <span className="text-white font-bold">{featuredGame.category || 'Arcade'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                      <span className="text-white/40 font-medium">Price:</span>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#a4d007] text-black text-[9px] font-black px-1.5 py-0.5 rounded">-100%</span>
                        <span className="text-emerald-400 font-bold uppercase">Free To Play</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLaunchGame(featuredGame)}
                  className="w-full py-4 rounded-2xl bg-[#66c0f4] hover:bg-[#78caff] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(102,192,244,0.4)]"
                >
                  <Play size={16} fill="currentColor" />
                  <span>PLAY NOW IN BROWSER</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Search & Tag Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                    selectedTag === tag
                      ? 'bg-[#66c0f4] text-black border-[#66c0f4]'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-[#171a21] border border-white/10 rounded-2xl px-4 py-2 w-full sm:w-72">
              <Search size={16} className="text-[#66c0f4] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Cine Steam games..."
                className="bg-transparent border-none text-xs text-white placeholder:text-white/30 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Steam Store Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map(game => (
              <motion.div
                key={game.id}
                whileHover={{ y: -6 }}
                className="group rounded-[2rem] bg-gradient-to-b from-[#1b2838] to-[#171a21] border border-white/10 hover:border-[#66c0f4]/50 overflow-hidden shadow-xl transition-all flex flex-col justify-between cursor-pointer"
                onClick={() => handleLaunchGame(game)}
              >
                {/* Game Cover */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/80">
                  <img
                    src={game.cover}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-transparent to-transparent" />

                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[#66c0f4] text-[9px] font-black uppercase tracking-widest">
                    {game.category || 'GAME'}
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-2xl bg-[#66c0f4] text-black flex items-center justify-center shadow-[0_0_30px_rgba(102,192,244,0.6)]">
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-tight text-white group-hover:text-[#66c0f4] transition-colors line-clamp-1 mb-4">
                      {game.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#a4d007] text-black text-[9px] font-black px-1.5 py-0.5 rounded">-100%</span>
                      <span className="text-emerald-400 font-black text-xs uppercase">FREE</span>
                    </div>
                    <span className="text-[#66c0f4] text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      Launch <Play size={10} fill="currentColor" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* TAB CONTENT: LIBRARY */}
      {activeTab === 'LIBRARY' && (
        <div className="space-y-4">
          <div className="p-6 rounded-[2.5rem] bg-[#171a21]/80 border border-white/10 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LibraryIcon size={20} className="text-[#66c0f4]" />
              <div>
                <h3 className="text-sm font-black uppercase italic tracking-tight">Your Cine Steam Library</h3>
                <p className="text-xs text-white/40">{libraryGames.length} games ready to play on this device</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#66c0f4]">STATUS: SYNCED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {libraryGames.map(game => (
              <div
                key={game.id}
                className="p-4 rounded-2xl bg-[#1b2838]/70 border border-white/10 hover:border-[#66c0f4]/40 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-black shrink-0">
                    <img src={game.cover} alt={game.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase italic tracking-tight text-white">{game.title}</h4>
                    <span className="text-[10px] text-white/40">Cloud Ready • Instant Play</span>
                  </div>
                </div>
                <button
                  onClick={() => handleLaunchGame(game)}
                  className="px-4 py-2 rounded-xl bg-[#66c0f4] hover:bg-[#78caff] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Play size={12} fill="currentColor" />
                  <span>PLAY</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SPECIAL OFFERS */}
      {activeTab === 'SPECIAL OFFERS' && (
        <div className="p-10 rounded-[2.5rem] bg-[#171a21]/80 border border-white/10 text-center space-y-4">
          <Sparkles size={36} className="text-[#66c0f4] mx-auto" />
          <h3 className="text-xl font-black uppercase italic tracking-tight">Cine Steam Weekend Free Weekend</h3>
          <p className="text-xs text-white/60 max-w-lg mx-auto">
            All featured titles, retro arcade ports, and indie hits on Cine Steam are 100% free and unblocked to play anytime.
          </p>
          <button
            onClick={() => setActiveTab('STORE')}
            className="px-8 py-3 rounded-2xl bg-[#66c0f4] text-black font-black text-xs uppercase tracking-widest"
          >
            EXPLORE THE STORE
          </button>
        </div>
      )}

      {/* TAB CONTENT: TOP RATED */}
      {activeTab === 'TOP RATED' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allGames.slice(0, 6).map((game, i) => (
            <div
              key={game.id}
              onClick={() => handleLaunchGame(game)}
              className="p-5 rounded-[2rem] bg-[#1b2838]/80 border border-white/10 hover:border-[#66c0f4]/40 cursor-pointer transition-all flex items-center gap-4"
            >
              <div className="text-2xl font-black italic text-[#66c0f4] w-8">#{i + 1}</div>
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-black shrink-0">
                <img src={game.cover} alt={game.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase italic tracking-tight text-white truncate">{game.title}</h4>
                <div className="flex items-center gap-1 text-[#66c0f4] text-[10px] font-bold mt-1">
                  <Star size={10} fill="currentColor" />
                  <span>99% Positive</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
