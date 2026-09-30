export const TRENDING_MOVIES = [
  {
    id: 'dune-2',
    title: 'Dune: Part Two',
    type: 'movie',
    year: 2024,
    rating: '8.6',
    rottenTomatoes: '92%',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    desc: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    duration: '2h 46m',
    badge: '#1 TRENDING MOVIE',
    featured: true
  },
  {
    id: 'spider-verse',
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    year: 2023,
    rating: '8.7',
    rottenTomatoes: '96%',
    genres: ['Animation', 'Action', 'Superhero'],
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
    desc: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence, but must redefine what it means to be a hero.',
    duration: '2h 20m',
    badge: '#2 TRENDING MOVIE',
    featured: true
  },
  {
    id: 'deadpool-wolverine',
    title: 'Deadpool & Wolverine',
    type: 'movie',
    year: 2024,
    rating: '7.8',
    rottenTomatoes: '79%',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    desc: 'A listless Wade Wilson toils away in civilian life until an existential threat pulls him back into action, partnering with a reluctant Wolverine to save his timeline.',
    duration: '2h 08m',
    badge: 'BOX OFFICE SMASH'
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    type: 'movie',
    year: 2014,
    rating: '8.7',
    rottenTomatoes: '73%',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
    desc: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    duration: '2h 49m',
    badge: 'ALL-TIME CLASSIC'
  },
  {
    id: 'arcane',
    title: 'Arcane: League of Legends',
    type: 'series',
    year: 2024,
    rating: '9.0',
    rottenTomatoes: '100%',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    desc: 'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.',
    duration: 'Season 2 Finale',
    badge: '#1 TRENDING SERIES'
  },
  {
    id: 'cyberpunk-edgerunners',
    title: 'Cyberpunk: Edgerunners',
    type: 'series',
    year: 2022,
    rating: '8.3',
    rottenTomatoes: '100%',
    genres: ['Anime', 'Action', 'Sci-Fi'],
    poster: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=1200&auto=format&fit=crop&q=80',
    desc: 'A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner: a mercenary outlaw.',
    duration: 'Complete Series',
    badge: 'MUST WATCH'
  }
];

export const TRENDING_APPS = [
  {
    id: 'spotify-media',
    title: 'Cine Spotify Music',
    type: 'app',
    category: 'AUDIO & STREAMING',
    rating: '4.9',
    badge: 'TRENDING APP',
    route: 'spotify',
    desc: 'Listen to your favorite gaming playlists, lo-fi beats, synthwave, and top charts while you game with zero latency.',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    actionText: 'Open Music Player'
  },
  {
    id: 'cinema-player',
    title: 'Cine Cinema Hub',
    type: 'app',
    category: 'MEDIA & STREAMING',
    rating: '4.8',
    badge: 'ENTERTAINMENT',
    route: 'cinema',
    desc: 'Browse cinematic trailers, entertainment news, movie showcases, and watch exclusive community previews.',
    cover: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    actionText: 'Launch Cinema'
  },
  {
    id: 'global-chat',
    title: 'Global Player Lounge',
    type: 'app',
    category: 'SOCIAL & COMMUNITY',
    rating: '4.9',
    badge: 'HOTTEST CHAT',
    route: 'chat',
    desc: 'Connect live with players worldwide, showcase your custom circle avatars, level badges, and unlock secret codes.',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    actionText: 'Join Chat'
  },
  {
    id: 'cine-stream',
    title: 'Cine Stream Gaming',
    type: 'app',
    category: 'GAMING HUB',
    rating: '4.8',
    badge: 'LIVE STREAMS',
    route: 'stream',
    desc: 'Full Steam-style gaming dashboard with top-rated speedruns, featured leaderboards, and exclusive title showcases.',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    actionText: 'Launch Stream Hub'
  }
];
