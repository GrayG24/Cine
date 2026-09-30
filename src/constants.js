import { User, Zap, Ghost, Cat, Crown, Bot, ZapOff, Award, Star, Heart, Layers, Target, Palette, PanelsTopLeft, Binary, Activity, ShieldCheck, Rocket, Trophy, Hammer, Search, Flame, Sparkles, Medal, Gamepad2 } from 'lucide-react';

export const AppRoute = {
  HOME: 'home',
  LIBRARY: 'library',
  SETTINGS: 'settings',
  CUSTOMIZATION: 'customization',
  LEADERBOARD: 'leaderboard',
  APPS: 'apps',
  PROXY: 'proxy',
  CATEGORY: 'category',
  ADMIN: 'admin',
  CODES: 'codes',
  CHAT: 'chat',
  SPOTIFY: 'spotify',
  CINEMA: 'cinema',
  STEAM: 'stream',
  STREAM: 'stream',
  ACCOUNT: 'account',
  NOTIFICATIONS: 'home',
  OWNER: 'owner',
};

export const isPlatformOwner = (userOrAccount, currentAuth = null) => {
  if (!userOrAccount && !currentAuth) return false;
  const email = (
    userOrAccount?.email || 
    userOrAccount?.senderEmail || 
    userOrAccount?.userEmail || 
    currentAuth?.email || 
    ''
  ).toLowerCase().trim();
  
  const username = (
    userOrAccount?.username || 
    userOrAccount?.displayName || 
    userOrAccount?.senderName || 
    currentAuth?.displayName || 
    ''
  ).toLowerCase().trim();
  
  const uid = userOrAccount?.uid || userOrAccount?.senderUid || currentAuth?.uid || '';
  const role = userOrAccount?.role || '';

  return (
    email === 'softball_chik_007@yahoo.com' ||
    username === 'graycen' ||
    uid === '8WTl89e5SnSCyyoPoHjvFUgg5nv2' ||
    role === 'OWNER'
  );
};

export const RARITY_ORDER = {
  'Common': 1,
  'Uncommon': 2,
  'Rare': 3,
  'Epic': 4,
  'Legendary': 5,
  'Mythic': 6,
  'Transcendent': 7
};

export const CATEGORIES = [
  { id: 'action', name: 'Action', icon: 'Sword' },
  { id: 'driving', name: 'Driving', icon: 'Car' },
  { id: 'puzzle', name: 'Puzzle', icon: 'BrainCircuit' },
  { id: 'sports', name: 'Sports', icon: 'Target' },
  { id: 'classic', name: 'Classics', icon: 'Gamepad2' },
  { id: 'casual', name: 'Casual', icon: 'Zap' },
];

export const CHARACTERS = [
  { id: 'agent-x', name: 'Default Player', level: 1, desc: 'Your customizable gamer identity.', icon: User },
];

export const PROFILE_BANNERS = [
  { id: 'default', name: 'Cine Glow', level: 1, gradient: 'from-blue-950/80 via-indigo-900/60 to-purple-950/80', desc: 'Deep cosmic blue and radiant royal purple glow.' },
  { id: 'neon-city', name: 'Amethyst Night', level: 5, gradient: 'from-blue-600/60 via-purple-900/60 to-indigo-950/70', desc: 'Deep violet metropolis night skyline.' },
  { id: 'matrix-core', name: 'Matrix Terminal', level: 10, gradient: 'from-emerald-950/70 via-emerald-800/40 to-black', desc: 'Digital code falling through dark cyberspace.' },
  { id: 'cyber-synthwave', name: 'Neon Outrun', level: 15, gradient: 'from-indigo-900/80 via-purple-900/70 to-blue-900/80', desc: 'Retro 80s arcade grid with neon violet accents.' },
  { id: 'cosmic-nebula', name: 'Cosmic Nebula', level: 25, gradient: 'from-violet-900/70 via-indigo-950/60 to-blue-900/60', desc: 'Deep galactic star cluster.' },
  { id: 'solar-flare', name: 'Solar Flare', level: 35, gradient: 'from-amber-600/70 via-orange-700/50 to-purple-900/60', desc: 'Blazing coronal eruption of pure energy.' },
  { id: 'abyssal-void', name: 'Abyssal Void', level: 50, gradient: 'from-slate-950 via-zinc-900/80 to-blue-950/80', desc: 'Endless depth of dark obsidian.' },
  { id: 'rainbow-aurora', name: 'Prismatic Aurora', level: 75, gradient: 'from-blue-600/60 via-indigo-500/50 to-purple-600/50', desc: 'Celestial prismatic curtains of light.' },
  { id: 'golden-glory', name: 'Golden Sovereign', level: 100, theme: 'gold', animated: true, accentColor: '#f59e0b', gradient: 'from-amber-600 via-yellow-400 to-amber-700', desc: 'Animated 24K regal gold foil with pulsing sunburst rays and floating golden shimmer.' },
  { id: 'phantom-supernova', name: 'Phantom Supernova', level: 150, theme: 'supernova', animated: true, accentColor: '#f43f5e', gradient: 'from-rose-600 via-fuchsia-600 to-indigo-950', desc: 'Animated cosmic supernova bursting with hot neon magenta, white plasma, and shockwaves.' },
  { id: 'hyperdrive-quantum', name: 'Quantum Hyperdrive', level: 200, theme: 'quantum', animated: true, accentColor: '#06b6d4', gradient: 'from-cyan-400 via-teal-500 to-slate-950', desc: 'Animated light-speed warp corridor with high-velocity neon cyan streaks and quantum grid.' },
  { id: 'void-dragon', name: 'Void Dragon Sovereign', level: 300, theme: 'void-dragon', animated: true, accentColor: '#10b981', gradient: 'from-emerald-950 via-emerald-600 to-black', desc: 'Animated obsidian abyssal beast radiating toxic emerald dragon fire and glowing scales.' },
  { id: 'astral-demigod', name: 'Astral Demigod Horizon', level: 500, theme: 'demigod', animated: true, accentColor: '#fb7185', gradient: 'from-rose-500 via-orange-400 to-amber-600', desc: 'Animated celestial rose-coral dawn with divine ascending solar rays and sacred halos.' },
  { id: 'celestial-singularity', name: 'Celestial Singularity', level: 750, theme: 'singularity', animated: true, accentColor: '#f97316', gradient: 'from-orange-600 via-red-950 to-black', desc: 'Animated black hole event horizon encircled by a searing vortex of molten lava-orange plasma.' },
  { id: 'celestial-999', name: 'The Absolute Pinnacle Apex', level: 999, theme: 'pinnacle-999', animated: true, accentColor: '#38bdf8', gradient: 'from-red-500 via-yellow-400 via-emerald-400 via-cyan-400 via-purple-500 to-pink-500', desc: 'Animated transcendent holographic rainbow chrome with fluid prismatic waves and diamond stars.' },
];

export const LEVEL_ROAD_TIERS = [
  { level: 5, name: 'Amethyst Initiate', type: 'BANNER', desc: 'Unlocks the Amethyst Night profile banner.' },
  { level: 10, name: 'Terminal Hacker', type: 'BANNER', desc: 'Unlocks the Matrix Terminal cyberspace banner.' },
  { level: 15, name: 'Neon Outrunner', type: 'BANNER', desc: 'Unlocks the Neon Outrun retro banner.' },
  { level: 25, name: 'Cosmic Explorer', type: 'BANNER', desc: 'Unlocks the Cosmic Nebula interstellar banner.' },
  { level: 35, name: 'Solar Vanguard', type: 'BANNER', desc: 'Unlocks the Solar Flare energetic banner.' },
  { level: 50, name: 'Obsidian Veteran', type: 'BANNER', desc: 'Unlocks the Abyssal Void deep obsidian banner.' },
  { level: 75, name: 'Prismatic Master', type: 'BANNER', desc: 'Unlocks the Prismatic Aurora celestial banner.' },
  { level: 100, name: 'Level 100 Sovereign', type: 'ANIMATED BANNER', desc: 'Earns the Level 100 badge and animated 24K Golden Sovereign banner.' },
  { level: 150, name: 'Supernova Phantom', type: 'ANIMATED BANNER', desc: 'Unlocks the explosive neon magenta Phantom Supernova animated banner.' },
  { level: 200, name: 'Quantum Voyager', type: 'ANIMATED BANNER', desc: 'Unlocks the high-velocity neon cyan Quantum Hyperdrive animated banner.' },
  { level: 300, name: 'Void Dragon Lord', type: 'ANIMATED BANNER', desc: 'Unlocks the toxic emerald fire Void Dragon Sovereign animated banner.' },
  { level: 500, name: 'Arcade Demigod', type: 'ANIMATED BANNER', desc: 'Unlocks the celestial rose-coral Astral Demigod Horizon animated banner.' },
  { level: 750, name: 'Singularity Overlord', type: 'ANIMATED BANNER', desc: 'Unlocks the molten lava-orange Celestial Singularity black hole banner.' },
  { level: 999, name: 'The Absolute Pinnacle', type: 'MAX ROAD & HOLO BANNER', desc: 'Completed Level Road! Unlocks MAX Level badge & holographic rainbow animated banner.' }
];

export const DEFAULT_LEADERBOARD_DATA = [
  { username: 'ApexGamer', level: 999, exp: 0, totalExp: 999000, gamesPlayed: 280, bio: 'Classroom 9X speedrunner.' },
  { username: 'CyberRonin', level: 412, exp: 12000, totalExp: 520000, gamesPlayed: 520, bio: 'Playing retro classics.' },
  { username: 'NeonSpecter', level: 250, exp: 8400, totalExp: 310000, gamesPlayed: 215, bio: 'High score hunter.' },
  { username: 'VoidWalker', level: 180, exp: 5000, totalExp: 195000, gamesPlayed: 178, bio: 'Drift and puzzle fan.' },
  { username: 'GlitchMaster', level: 95, exp: 3200, totalExp: 92000, gamesPlayed: 142, bio: 'Arcade champion.' },
  { username: 'ZeroDay', level: 60, exp: 2100, totalExp: 45000, gamesPlayed: 98, bio: 'Casual gamer.' },
  { username: 'BitCrusher', level: 35, exp: 1200, totalExp: 22000, gamesPlayed: 64, bio: 'Exploring new releases.' },
  { username: 'LogicBomb', level: 18, exp: 800, totalExp: 9500, gamesPlayed: 32, bio: 'Classroom 9X newcomer.' },
];

export const BADGES = [
  { id: 'leaderboard-first', name: '1st Place', requirement: '1st Place on Leaderboard', icon: Medal, color: '#f59e0b', rarity: 'Mythic', desc: 'Awarded for holding 1st place on the EXP or Games Played leaderboard.' },
  { id: 'leaderboard-top10', name: 'Top 10', requirement: 'Top 10 on Leaderboard', icon: Flame, color: '#8b5cf6', rarity: 'Legendary', desc: 'Awarded for reaching the top 10 on the leaderboard.' },
  { id: 'grandmaster-999', name: 'MAX Level', requirement: 'Reach Level 999', icon: Trophy, color: 'rainbow', rarity: 'Transcendent', desc: 'Reached maximum Level 999.' },
  { id: 'century-club', name: 'Level 100', requirement: 'Reach Level 100', icon: Award, color: '#3b82f6', rarity: 'Epic', desc: 'Reached Level 100.' },
  { id: 'games-master', name: '100+ Games', requirement: 'Play 100+ Games', icon: Gamepad2, color: '#06b6d4', rarity: 'Epic', desc: 'Played 100 or more games.' },
  { id: 'early-access', name: 'Early Access', requirement: 'Early Access Pioneer', icon: Hammer, color: '#a855f7', rarity: 'Rare', desc: 'Joined Cine during early access.' },
  { id: 'site-owner', name: 'Site Owner', requirement: 'Cine Platform Owner', icon: Crown, color: '#fbbf24', rarity: 'Mythic', desc: 'Official platform owner of Cine.' },
];

export const QUEST_POOL = [
  { id: 'play-50', title: 'Grand Master', description: 'Play 50 games to prove your absolute dedication.', reward: 2500, progress: 0, target: 50, isCompleted: false, rarity: 'common', type: 'exp', questType: 'play' },
  { id: 'score-25000', title: 'High Stakes', description: 'Reach a total score of 25,000.', reward: 1500, progress: 0, target: 25000, isCompleted: false, rarity: 'common', type: 'rare', questType: 'score' },
  { id: 'play-100', title: 'Centurion', description: 'Play 100 games to reach legendary status.', reward: 5000, progress: 0, target: 100, isCompleted: false, rarity: 'rare', type: 'exp', questType: 'play' },
  { id: 'fav-15', title: 'Curator', description: 'Favorite 15 different games to build your collection.', reward: 1000, progress: 0, target: 15, isCompleted: false, rarity: 'common', type: 'exp', questType: 'fav' },
  { id: 'score-50000', title: 'Millionaire Mindset', description: 'Reach a total score of 50,000.', reward: 3000, progress: 0, target: 50000, isCompleted: false, rarity: 'rare', type: 'rare', questType: 'score' },
  { id: 'play-200', title: 'Godlike', description: 'Play 200 games. Are you even human?', reward: 10000, progress: 0, target: 200, isCompleted: false, rarity: 'epic', type: 'exp', questType: 'play' },
  { 
    id: 'quest-exclusive-diamond', 
    title: 'Diamond Hands', 
    description: 'Play 500 games to unlock the exclusive "Diamond" Frame.', 
    reward: 0, 
    progress: 0, 
    target: 500, 
    isCompleted: false, 
    rarity: 'legendary',
    type: 'item',
    questType: 'play',
    rewardItem: {
      type: 'frame',
      id: 'diamond',
      name: 'Diamond Frame'
    }
  },
  { 
    id: 'quest-frame-cyberpunk', 
    title: 'Neon Runner', 
    description: 'Play 300 games to unlock the exclusive "Cyberpunk" Frame.', 
    reward: 0, 
    progress: 0, 
    target: 300, 
    isCompleted: false, 
    rarity: 'epic',
    type: 'item',
    questType: 'play',
    rewardItem: {
      type: 'frame',
      id: 'cyberpunk',
      name: 'Cyberpunk Frame'
    }
  },
  { 
    id: 'quest-theme-synthwave', 
    title: 'Outrun the Night', 
    description: 'Reach a total score of 150,000 to unlock the exclusive "Synthwave" Theme.', 
    reward: 0, 
    progress: 0, 
    target: 150000, 
    isCompleted: false, 
    rarity: 'legendary',
    type: 'item',
    questType: 'score',
    rewardItem: {
      type: 'theme',
      id: 'synthwave',
      name: 'Synthwave Theme'
    }
  },
  { 
    id: 'quest-frame-matrix', 
    title: 'The One', 
    description: 'Reach a total score of 75,000 to unlock the exclusive "Matrix" Frame.', 
    reward: 0, 
    progress: 0, 
    target: 75000, 
    isCompleted: false, 
    rarity: 'epic',
    type: 'item',
    questType: 'score',
    rewardItem: {
      type: 'frame',
      id: 'matrix',
      name: 'Matrix Frame'
    }
  },
  { 
    id: 'quest-theme-hologram', 
    title: 'Holographic Dreams', 
    description: 'Play 600 games to unlock the exclusive "Hologram Blue" Theme.', 
    reward: 0, 
    progress: 0, 
    target: 600, 
    isCompleted: false, 
    rarity: 'legendary',
    type: 'item',
    questType: 'play',
    rewardItem: {
      type: 'theme',
      id: 'hologram',
      name: 'Hologram Blue Theme'
    }
  },
  { id: 'play-300', title: 'Eternal Gamer', description: 'Play 300 games. You are a legend.', reward: 20000, progress: 0, target: 300, isCompleted: false, rarity: 'epic', type: 'exp', questType: 'play' },
  { id: 'score-100000', title: 'System Overlord', description: 'Reach a total score of 100,000.', reward: 5000, progress: 0, target: 100000, isCompleted: false, rarity: 'legendary', type: 'rare', questType: 'score' },
  { 
    id: 'quest-avatar-dogeking', 
    title: 'Doge Royalty', 
    description: 'Play 150 games to unlock the exclusive "Doge King" Avatar.', 
    reward: 0, 
    progress: 0, 
    target: 150, 
    isCompleted: false, 
    rarity: 'rare',
    type: 'item',
    questType: 'play',
    rewardItem: {
      type: 'character',
      id: 'doge-king',
      name: 'Doge King Avatar'
    }
  }
];

const RAW_GAMES_DATA = [
  {
    id: 'geometry-dash-fr',
    title: 'Geometry Dash',
    description: 'Jump, fly, and flip through spikes on neon maps with perfect rhythm.',
    thumbnail: 'https://geometrydash-game.ru/wp-content/uploads/2021/07/95-954583_geometry-dash.jpg',
    iframeUrl: 'https://geometry.games/vi/h5/geometry-dash/index.html',
    category: 'action',
    categories: ['action', 'classic'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'WASD', action: 'SPACE' }
  },
  {
    id: 'ovo-classic',
    title: 'OvO',
    description: 'A simple, tight parkour game. Slide, dive, and jump over spikes as a stickman.',
    thumbnail: 'https://www.numuki.com/game/card/ovo-game-5037.webp',
    iframeUrl: 'https://db.duck.tinyexams.com/html/ovo/index.html',
    category: 'action',
    categories: ['action'],
    isFeatured: true,
    rating: 4.9,
    controls: { move: 'ARROWS', action: 'SPACE' }
  },
  {
    id: 'basket-random',
    title: 'Basket Random',
    description: 'Goofy 2-player basketball with crazy ragdoll physics, changing environments, and weird balls.',
    thumbnail: 'https://www.fnfgo.com/wp-content/uploads/2024/01/Basket-Random.jpeg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/basket_random/index.html',
    category: 'sports',
    categories: ['sports'],
    isFeatured: true,
    rating: 4.5,
    controls: { move: 'W / UP', action: 'W / UP' }
  },
  {
    id: 'boxing-random',
    title: 'Boxing Random',
    description: 'Hop, punch, and win funny boxing matches with silly one-button physics.',
    thumbnail: 'https://play-lh.googleusercontent.com/jku-om6R4p5KuvMRlOFjH6blrRjw1EnDb5S7h7WXm1J0bFrY18LXKbmjQnv7SDUWYn8=w526-h296',
    iframeUrl: 'https://labgstore311.github.io/g20/class-825',
    category: 'sports',
    categories: ['sports'],
    isFeatured: true,
    rating: 4.4,
    controls: { move: 'W / UP', action: 'W / UP' }
  },
  {
    id: 'minecraft-classic-edition',
    title: 'Minecraft',
    description: 'Build houses, explore caves, and survive. Just you and a massive world of infinite blocks.',
    thumbnail: 'https://wallpapercave.com/wp/wp6548068.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/minecraft/index.html',
    category: 'classic',
    categories: ['classic', 'casual'],
    isFeatured: true,
    rating: 4.9,
    controls: { move: 'WASD', action: 'L-CLICK' }
  },
  {
    id: 'moto-x3m-classic',
    title: 'Moto X3M',
    description: 'Ride a dirt bike across giant spikes and loop-de-loops to beat the timer.',
    thumbnail: 'https://motox3mgame.org/data/image/game/moto-x3m-bike-race-game1.png',
    iframeUrl: 'https://db.duck.tinyexams.com/html/motox3m/index.html',
    category: 'driving',
    categories: ['driving', 'action'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'ARROWS', action: 'ARROWS' }
  },
  {
    id: 'cookie-clicker-new',
    title: 'Cookie Clicker',
    description: 'Click the giant cookie to buy grandmas, factories, and portals that bake more cookies.',
    thumbnail: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_1.5/ncom/software/switch/70010000066299/432bf350e866b2544f9a5cd80de83e0c24f4efddfd7811016c4aa33e48c5df7c',
    iframeUrl: 'https://db.duck.tinyexams.com/html/cookie_clicker/index.html',
    category: 'casual',
    categories: ['casual'],
    isFeatured: true,
    rating: 4.9,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'idle-breakout-classic',
    title: 'Idle Breakout',
    description: 'An idle upgrade game based on brick breaker. Buy custom balls and watch them smash blocks.',
    thumbnail: 'https://23azo.com/images/idle-breakout.webp',
    iframeUrl: 'https://ubg67.gitlab.io/idle-breakout/',
    category: 'casual',
    categories: ['casual'],
    isFeatured: true,
    rating: 4.3,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'crazy-cattle-3d',
    title: 'Crazy Cattle 3D',
    description: 'Dash around as a runaway cow, smash obstacles, and dodge barriers to see how far you can go.',
    thumbnail: 'https://i.kym-cdn.com/entries/icons/original/000/053/836/cc3dcovergood.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/crazycattle3d/index.html',
    category: 'action',
    categories: ['action', 'casual'],
    isFeatured: true,
    rating: 4.2,
    controls: { move: 'WASD', action: 'SPACE' }
  },
  {
    id: 'crossy-road-classic',
    title: 'Crossy Road',
    description: 'Tap to hop across heavy traffic, rivers, and train tracks. Avoid the eagle at all costs!',
    thumbnail: 'https://cdn-www.bluestacks.com/bs-images/Banner_Video_Cover.jpg',
    iframeUrl: 'https://i.gamesgo.net/uploads/game/html5/4072/',
    category: 'action',
    categories: ['action', 'casual'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'ARROWS', action: 'ARROWS' }
  },
  {
    id: 'dino-game-classic',
    title: 'Dino Game',
    description: 'The classic offline T-Rex runner. Jump over cacti and dodge pterodactyls to beat your high score.',
    thumbnail: 'https://www.coolmathgames.com/sites/default/files/DinoGame_OG-logo.jpg',
    iframeUrl: 'https://gameshost.io/HTML5GAMES/dino/',
    category: 'classic',
    categories: ['classic', 'casual'],
    isFeatured: true,
    rating: 4.5,
    controls: { move: 'SPACE', action: 'SPACE' }
  },
  {
    id: 'doge-miner-classic',
    title: 'Doge Miner',
    description: 'Click the doge to mine dogecoins, hire slave shibes, buy rocket ships, and head to the moon.',
    thumbnail: 'https://funkypotato.com/images/2017/03/doge-miner.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/doge_miner/index.html',
    category: 'casual',
    categories: ['casual'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'doge-miner-2',
    title: 'Doge Miner 2',
    description: 'Mine even more dogecoins! Hire space shibes, buy upgrades, and colonize planets for ultimate doge power.',
    thumbnail: 'https://dogeminer2.com/og-image.jpg',
    iframeUrl: 'https://machita66.com/d/dgmn2',
    category: 'casual',
    categories: ['casual'],
    isFeatured: true,
    rating: 4.9,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'drift-boss-pro',
    title: 'Drift Boss',
    description: 'Drift perfectly to stay on a narrow, twisting platform without falling.',
    thumbnail: 'https://abcya.app/wp-content/uploads/2024/07/Drift-Boss.png',
    iframeUrl: 'https://db.duck.tinyexams.com/html/drift_boss/index.html',
    category: 'driving',
    categories: ['driving', 'casual'],
    isFeatured: true,
    rating: 4.6,
    controls: { move: 'L-CLICK', action: 'L-CLICK' }
  },
  {
    id: 'drive-mad-original',
    title: 'Drive Mad',
    description: 'Drive 4x4 trucks over crazy, bumpy obstacles and try not to flip over.',
    thumbnail: 'https://watchdocumentaries.com/wp-content/uploads/drive-mad-game.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/drive_mad/index.html',
    category: 'driving',
    categories: ['driving'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'WASD / ARROWS', action: 'WASD / ARROWS' }
  },
  {
    id: 'dune-surfer',
    title: 'Dune',
    description: 'Slide down sand dunes and fly high into the sky. Just land smoothly so you don\'t crash.',
    thumbnail: 'https://avatars.mds.yandex.net/get-games/3006389/2a00000182b154e646f49ea496dc06df679b/cover1',
    iframeUrl: 'https://db.duck.tinyexams.com/html/dune/index.html',
    category: 'casual',
    categories: ['casual'],
    isFeatured: true,
    rating: 4.5,
    controls: { move: 'L-CLICK', action: 'L-CLICK' }
  },
  {
    id: 'flappy-bird-classic',
    title: 'Flappy Bird',
    description: 'The notoriously frustrating bird game. Tap to flap between green pipes and beat your high score.',
    thumbnail: 'https://wallpaperaccess.com/full/4622684.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/flappy_bird/index.html',
    category: 'casual',
    categories: ['casual', 'classic'],
    isFeatured: true,
    rating: 4.4,
    controls: { move: 'SPACE / CLICK', action: 'SPACE / CLICK' }
  },
  {
    id: 'snek-io',
    title: 'Snek.io',
    description: 'Slither around to eat glowing orbs and grow. Cut off other snakes to turn them into your food.',
    thumbnail: 'https://wallpaperaccess.com/full/5720723.jpg',
    iframeUrl: 'https://db2.tinyexams.com/2026/more/snek-io/pre.html',
    category: 'action',
    categories: ['action', 'casual'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'MOUSE / WASD', action: 'L-CLICK / SPACE' }
  },
  {
    id: 'pixel-path',
    title: 'Pixel Path',
    description: 'Walk along precise grid paths to reach the level exit. Be careful not to fall off the edges.',
    thumbnail: 'https://w8.snokido.com/img/large/pixel-path.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/pixel_path/index.html',
    category: 'puzzle',
    categories: ['puzzle'],
    isFeatured: true,
    rating: 4.6,
    controls: { move: 'WASD / ARROWS', action: 'AUTO' }
  },
  {
    id: 'pac-man-classic',
    title: 'Pac-Man',
    description: 'The iconic arcade ghost maze. Eat dots, dodge blinky/pinky/inky/clyde, and power up to hunt them back.',
    thumbnail: 'https://img.okezone.com/content/2023/02/20/326/2768266/sejarah-penciptaan-game-legendaris-pac-man-10aXQ8DlD0.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/pac_man/index.html',
    category: 'classic',
    categories: ['classic'],
    isFeatured: true,
    rating: 4.9,
    controls: { move: 'WASD / ARROWS', action: 'NONE' }
  },
  {
    id: 'uno-classic',
    title: 'UNO Online',
    description: 'Play the classic card game online against other players. Draw, skip, reverse, and shout UNO!',
    thumbnail: 'https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Funo%2Fhome%2FGameName_Store_Landscape_2560x1440-2560x1440-5195e8a3e06d672f97a1ee49ecea59027c14cae4.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/uno/index.html',
    category: 'classic',
    categories: ['classic', 'casual'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'soul-essence-adventure',
    title: 'Soul Essence',
    description: 'A retro pixel-art dungeon crawler. Swing swords, defeat skeletons, dodge traps, and level up.',
    thumbnail: 'https://i.ytimg.com/vi/wghxRBqs5rc/maxresdefault.jpg',
    iframeUrl: 'https://db2.tinyexams.com/2022/unity2/soul-essence-adventure/pre.html',
    category: 'action',
    categories: ['action'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'WASD / ARROWS', action: 'SPACE / J / K' }
  },
  {
    id: 'deadly-descent',
    title: 'Deadly Descent',
    description: 'Sled down a steep hill while dodging trees and rocks in a simple winter test of speed.',
    thumbnail: 'https://i.ytimg.com/vi/TjDvUleS4qI/mqdefault.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/deadly_descent/index.html',
    category: 'driving',
    categories: ['driving'],
    isFeatured: true,
    rating: 4.5,
    controls: { move: 'A/D / ARROWS', action: 'SPACE' }
  },
  {
    id: 'snow-rider-3d',
    title: 'Snow Rider 3D',
    description: 'Sled down a snowy mountain, dodge boulders, jump gaps, and collect gifts to unlock new sleds.',
    thumbnail: 'https://snowrider3dsanta.io/data/image/game/play-snow-rider-3d-game.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/snow_rider_3d/index.html',
    category: 'driving',
    categories: ['driving'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'gun-spin',
    title: 'Gun Spin',
    description: 'Fire a gun to make it spin and fly backwards. Use timing and upgrades to cover crazy distances.',
    thumbnail: 'https://tcf.admeen.org/game/17500/17178/400x246/gunspin.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/gun_spin/index.html',
    category: 'casual',
    categories: ['casual'],
    isFeatured: true,
    rating: 4.6,
    controls: { move: 'MOUSE / CLICK', action: 'L-CLICK' }
  },
  {
    id: 'blocky-puzzle',
    title: 'Blocky Puzzle',
    description: 'Drag wood blocks onto a grid. Clear solid rows and columns to beat your score before running out of space.',
    thumbnail: 'https://block-blast.io/cache/data/image/game/block-blast-game-m328x200.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/blocky_puzzle/index.html',
    category: 'puzzle',
    categories: ['puzzle'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'MOUSE / DRAG', action: 'L-CLICK' }
  },
  {
    id: 'drift-rider',
    title: 'Drift Rider',
    description: 'Slide tuner cars around track corners to gain points and speed. Buy custom wings, rims, and body kits.',
    thumbnail: 'https://www.drifted.com/wp-content/uploads/2026/01/big-angle-drift-toyota-gr-supra-drift-rider-768x471.jpg',
    iframeUrl: 'https://db2.tinyexams.com/2023/unity3/drift-rider/pre.html',
    category: 'driving',
    categories: ['driving'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'zombie-derby-pixel',
    title: 'Zombie Derby: Pixel Survival',
    description: 'Drive blocky cars directly through groups of pixel zombies. Upgrade tires, machine guns, and nitro.',
    thumbnail: 'https://www.nintendo.com/eu/media/images/assets/nintendo_switch_games/zombiederbypixelsurvival/2x1_ZombieDerbyPixelSurvival_image1600w.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/zombie_derby_pixel_survival/index.html',
    category: 'driving',
    categories: ['driving', 'action'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'super-mario-bros',
    title: 'Super Mario Bros',
    description: 'The retro platformer classic. Run and jump through pipes, eat giant mushrooms, and rescue Peach from Bowser.',
    thumbnail: 'https://slopegame.net/data/image/game/super-mario-bros.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/super_mario_bros/index.html',
    category: 'classic',
    categories: ['classic', 'action'],
    isFeatured: true,
    rating: 4.9,
    controls: { move: 'ARROWS / WASD', action: 'Z / X / SHIFT' }
  },
  {
    id: 'bloxorz',
    title: 'Bloxorz',
    description: 'Roll a 3D block around a grid and make it drop perfectly into the square hole without falling off.',
    thumbnail: 'https://subwaygame.io/wp-content/uploads/2023/06/Bloxorz.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/bloxorz/index.html',
    category: 'puzzle',
    categories: ['puzzle', 'classic'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'ARROWS', action: 'NONE' }
  },
  {
    id: 'the-worlds-hardest-game',
    title: 'The World\'s Hardest Game',
    description: 'Control a red square to dodge moving blue circles. Avoid them, grab yellow keys, and reach the safe zone.',
    thumbnail: 'https://worldshardest-game.com/wp-content/uploads/2025/02/Worlds-Hardest-Game-Online-For-FREE.webp',
    iframeUrl: 'https://db.duck.tinyexams.com/html/theworldshardestgame/index.html',
    category: 'classic',
    categories: ['classic', 'puzzle', 'action'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'ARROWS / WASD', action: 'NONE' }
  },
  {
    id: 'football-bros',
    title: 'Football Bros',
    description: 'Vibrant, cartoonish American football. Run routes, throw spirals, and dive into the touchdown zone.',
    thumbnail: 'https://w8.snokido.com/img/large/football-bros.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/football_bros/index.html',
    category: 'sports',
    categories: ['sports'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'bloonstd',
    title: 'Bloons Tower Defense',
    description: 'Place dart monkeys, tack shooters, and ice towers to pop incoming balloons before they escape.',
    thumbnail: 'https://media.indiedb.com/images/games/1/13/12389/Bloons_Tower_Defense_4_1.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/bloonstd/index.html',
    category: 'casual',
    categories: ['casual', 'puzzle'],
    isFeatured: true,
    rating: 4.6,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'bloonstd2',
    title: 'Bloons Tower Defense 2',
    description: 'Upgraded tower defenses! Place boomerangs, road spikes, and massive super monkeys to clear balloon paths.',
    thumbnail: 'https://th.bing.com/th/id/R.fe4098c489c87754f9a8a05edcfce7fb?rik=EoW0kRxLM3m9nQ&pid=ImgRaw&r=0',
    iframeUrl: 'https://db.duck.tinyexams.com/html/bloonstd2/index.html',
    category: 'casual',
    categories: ['casual', 'puzzle'],
    isFeatured: true,
    rating: 4.6,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'bloonstd3',
    title: 'Bloons Tower Defense 3',
    description: 'Upgraded monkey units and path layouts. Use spike-o-pults and glue-gunners to slow down and pop balloon waves.',
    thumbnail: 'https://cdn2.spiele-umsonst.de/flash_thumb/bloonstd3.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/bloonstd3/index.html',
    category: 'casual',
    categories: ['casual', 'puzzle'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'btd5',
    title: 'Bloons TD 5',
    description: 'Throw darts as a monkey to pop balloons, buy upgrades, and beat high score waves.',
    thumbnail: 'https://pvmedia.org/wp-content/uploads/2021/11/Bloons-td-5-switch-hero.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/btd5/index.html',
    category: 'casual',
    categories: ['casual', 'puzzle'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'diver-down',
    title: 'Diver Down',
    description: 'Swim deep to grab treasure chest gold while dodging angry sharks and jellyfish.',
    thumbnail: 'https://i.ytimg.com/vi/w57YsaJOyOc/maxresdefault.jpg',
    iframeUrl: 'https://db2.tinyexams.com/2024/godot/diver-down/pre.html',
    category: 'action',
    categories: ['action', 'casual'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'geometry-dash-subzero',
    title: 'Geometry Dash Subzero',
    description: 'Jump over spikes on freezing neon maps with sick beats.',
    thumbnail: 'https://geometrydash-subzero.io/data/image/game/geo_subzero_1.png',
    iframeUrl: 'https://geometry.games/vi/h5/geometry-dash-subzero/',
    category: 'action',
    categories: ['action', 'classic'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'WASD / SPACE', action: 'L-CLICK / SPACE' }
  },
  {
    id: 'idle-ants',
    title: 'Idle Ants',
    description: 'Watch an army of tiny ants eat regular food and carry it back to their little nest.',
    thumbnail: 'https://www.yoosfuhl.com/wp-content/uploads/2024/11/Idle-Ants-game.jpg',
    iframeUrl: 'https://thepercentcalculator.com/playgame/idleants/',
    category: 'casual',
    categories: ['casual'],
    isFeatured: true,
    rating: 4.5,
    controls: { move: 'MOUSE', action: 'L-CLICK' }
  },
  {
    id: 'retro-bowl',
    title: 'Retro Bowl',
    description: 'Throw deep passes, dodge tackles, and coach your own pixel football squad.',
    thumbnail: 'https://retro-bowl.me/feature-image.png',
    iframeUrl: 'https://db.duck.tinyexams.com/html/retro_bowl/index.html',
    category: 'sports',
    categories: ['sports', 'classic'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'retro-bowl-college',
    title: 'Retro Bowl College',
    description: 'Recruit college players, win big games, and become a legendary football coach.',
    thumbnail: 'https://retrobowl26.org/cache/data/image/game/retro-bowl-college-game-m216x122.jpg',
    iframeUrl: 'https://db.duck.tinyexams.com/html/retro_bowl_college/index.html',
    category: 'sports',
    categories: ['sports', 'classic'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'monster-tracks',
    title: 'Monster Tracks',
    description: 'Try not to flip a huge monster truck while driving over bumpy wooden bridges.',
    thumbnail: 'https://escaperoad.org/data/image/game/monster-tracks/monster-tracks.png',
    iframeUrl: 'https://games.playtropolis.com/monster-tracks/',
    allow: 'autoplay; fullscreen; camera; focus-without-user-activation *; monetization; keyboard-map *; xr-spatial-tracking; clipboard-write; web-share; accelerometer; magnetometer; gyroscope',
    sandbox: 'allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts allow-same-origin allow-downloads',
    loading: 'eager',
    category: 'driving',
    categories: ['driving'],
    isFeatured: true,
    rating: 4.6,
    controls: { move: 'A / D / ARROWS', action: 'W / SPACE' }
  },
  {
    id: 'stack-bounce',
    title: 'Stack Bounce',
    description: 'Tap to smash a ball down through rotating towers of plates. Avoid the solid black lines.',
    thumbnail: 'https://freegame.gg/thumbs/stack-bounce/big-banner.jpg',
    iframeUrl: 'https://stackbounce.h5games.usercontent.goog/v/1aqsvv0aegbjg/?origin=https%3A%2F%2Fgamesnacks.com&gameCenterId=gamesnacks',
    category: 'casual',
    categories: ['casual'],
    isFeatured: true,
    rating: 4.5,
    controls: { move: 'MOUSE / CLICK', action: 'L-CLICK' }
  },
  {
    id: 'stunt-car-extreme',
    title: 'Stunt Car Extreme',
    description: 'Speed through loops, fly off ramps, and do insane stunts in cool muscle cars.',
    thumbnail: 'https://i.ytimg.com/vi/CFRL1UN-m6w/maxresdefault.jpg',
    iframeUrl: 'https://minigamesville.com/wp-content/uploads/2025/08/Stunt_Car_Extreme-1.html',
    idAttr: 'game-frame',
    category: 'driving',
    categories: ['driving', 'action'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'subway-surfers',
    title: 'Subway Surfers',
    description: 'Dodge oncoming trains, jump over barricades, and outrun the grumpy inspector on your hoverboard.',
    thumbnail: 'https://wallpaper.dog/large/20687361.jpg',
    iframeUrl: 'https://sudoku-online.github.io/a8/subway-surfers-san-francisco',
    category: 'action',
    categories: ['action', 'casual'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'slope',
    title: 'Slope',
    description: 'Roll down a steep 3D neon course that gets faster by the second. Dodge obstacles and try not to fall off.',
    thumbnail: 'https://slopegame.net/data/image/game/slope-game.png',
    iframeUrl: '/raw/games/slope/index.html',
    category: 'driving',
    categories: ['driving', 'action'],
    isFeatured: true,
    rating: 4.8,
    controls: { move: 'A / D / ARROWS', action: 'NONE' }
  },
  {
    id: 'tomb-of-the-mask',
    title: 'Tomb of the Mask',
    description: 'Swipe to zip wall-to-wall inside creepy tombs, eat dots, and dodge spikes.',
    thumbnail: 'https://m.media-amazon.com/images/I/61ljJZNJV0L.png',
    iframeUrl: 'https://tomb-of-the-mask-online.github.io/file/',
    category: 'classic',
    categories: ['classic', 'action'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'WASD / ARROWS', action: 'SPACE' }
  },
  {
    id: 'bowmasters',
    title: 'Bowmasters',
    description: 'Throw axes, arrows, and custom weapons to knock out opponent stickmen.',
    thumbnail: 'https://imag.malavida.com/mvimgbig/download-fs/bowmasters-19647-2.jpg',
    iframeUrl: 'https://aaravr10.github.io/bowmasters/',
    category: 'action',
    categories: ['action', 'sports'],
    isFeatured: true,
    rating: 4.6,
    controls: { move: 'MOUSE / DRAG', action: 'L-CLICK' }
  },
  {
    id: 'stickman-hook',
    title: 'Stickman Hook',
    description: 'Swing from hooks like a spider stickman and bounce to the finish line.',
    thumbnail: 'https://poki.click/wp-content/uploads/2025/11/Stickman-Hook-image-300x146.png',
    iframeUrl: 'https://azgames.io/stickman-hook.embed?utm_source=g4g.io',
    category: 'action',
    categories: ['action', 'casual'],
    isFeatured: true,
    rating: 4.7,
    controls: { move: 'MOUSE / CLICK', action: 'L-CLICK / HOLD' }
  },
  {
    id: 'pokemon-ruby',
    title: 'Pokémon Ruby',
    description: 'Catch wild monsters, defeat gym leaders, and become a champion.',
    thumbnail: 'https://www.nintendo.com/eu/media/images/10_share_images/games_15/game_boy_advance_7/SI_GBA_PokemonRuby_enGB_image1600w.jpg',
    iframeUrl: 'https://classicjoy.games/embed?slug=pokemon-ruby',
    category: 'classic',
    categories: ['classic', 'adventure'],
    isFeatured: true,
    rating: 4.9,
    controls: { move: 'WASD / ARROWS', action: 'J: A / K: B / ENTER: START / SHIFT: SELECT' }
  },
  {
    id: 'mario-kart-ds',
    title: 'Mario Kart DS',
    description: 'Drift around track corners, throw red shells at friends, and race as Mario.',
    thumbnail: 'https://www.nintendo.com/eu/media/images/10_share_images/games_15/nintendo_ds_22/SI_NDS_MarioKartDS_image1600w.jpg',
    iframeUrl: 'https://classicjoy.games/embed?slug=mario-kart-ds',
    category: 'classic',
    categories: ['classic', 'driving'],
    isFeatured: true,
    rating: 4.9,
    controls: { move: 'WASD / ARROWS', action: 'J: A / K: B / L: Item / ENTER: START' }
  }
];

export const GAMES_DATA = [...RAW_GAMES_DATA].sort((a, b) => 
  a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
);
