import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppRoute, GAMES_DATA, BADGES, QUEST_POOL, CHARACTERS, isPlatformOwner } from './constants.js';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { GameModal } from './components/GameModal';
import { ProfileModal } from './components/ProfileModal';
import { MiniProfile } from './components/MiniProfile';
import { CategoryPage } from './components/CategoryPage';
import { Library } from './components/Library';
import { Settings } from './components/Settings';
import { Leaderboard } from './components/Leaderboard';
import { LeaderboardWidget } from './components/LeaderboardWidget';
import AuthPortal from './components/AuthPortal';
import { EducationalCloak } from './components/EducationalCloak';
import { AppsPage } from './components/AppsPage';
import { SpotifyPage } from './components/SpotifyPage';
import { GlobalChatPage } from './components/GlobalChatPage';
import { CineCinemaPage } from './components/CineCinemaPage';
import { CineStreamPage } from './components/CineStreamPage';
import { ProxyPage } from './components/ProxyPage';
import { CodesPage } from './components/CodesPage';
import MusicPage from './components/MusicPage';
import { OwnerPortalPage } from './components/OwnerPortalPage';
import { AccountPage, calculateTotalExp } from './components/AccountPage';
import { AnnouncementBroadcastModal } from './components/AnnouncementBroadcastModal';
import { ReportModal } from './components/ReportModal';
import { LoadingScreen } from './components/LoadingScreen';
import { InteractiveBackground } from './components/InteractiveBackground';
import { GameView } from './components/GameView';
import { Bell, Star, Zap, Shield, Trophy, Palette, Layers, Bot, X, Crown, ZapOff, ShieldAlert, MessageSquare, Users, Send, Trash2, Megaphone, Settings as SettingsIcon, Activity, Sparkles, Ghost, BrainCircuit, Rocket, Plus, Award, Flame, User, AlertTriangle, Lock, Play, Waves, ChevronRight, Pin, Hammer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signOut, signInWithRedirect, getRedirectResult, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, query, orderBy, limit, serverTimestamp, getDocFromServer, addDoc, deleteDoc } from 'firebase/firestore';

import { filterProfanity } from './lib/profanity';
import { 
  safeLocalStorageGet, 
  safeLocalStorageGetJSON,
  safeLocalStorageSet, 
  safeLocalStorageRemove, 
  safeSessionStorageGet, 
  safeSessionStorageSet, 
  safeStoreUserProfile 
} from './lib/storage';

const EXP_PER_PLAY = 25;
const LEVEL_UP_BASE = 80;

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  
  if (errorMsg.includes('resource-exhausted') || errorMsg.includes('Quota exceeded') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
    window.isFirestoreQuotaExceeded = true;
    window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
    console.warn('Firestore Quota Exceeded for', operationType, path);
    return;
  }

  const errInfo = {
    error: errorMsg,
    authInfo: {
      userId: auth.currentUser?.uid || 'none',
      email: auth.currentUser?.email || 'none',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

const LockedPage = ({ title, onReturn }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-12 text-center space-y-8">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-24 h-24 bg-rose-500/20 rounded-[2.5rem] flex items-center justify-center border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.2)]"
    >
      <Lock size={48} className="text-rose-500" />
    </motion.div>
    <div className="space-y-4">
      <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic">Coming <span className="text-rose-500">Soon</span></h1>
      <div className="flex items-center justify-center gap-3">
        <div className="h-px w-12 bg-rose-500/30"></div>
        <p className="text-xs font-black text-rose-500 uppercase tracking-[0.5em]">Page under construction</p>
        <div className="h-px w-12 bg-rose-500/30"></div>
      </div>
    </div>
    <p className="text-white/40 font-medium max-w-md leading-relaxed uppercase text-[10px] tracking-widest">
      This section is not finished yet. Check back soon.
    </p>
    <button 
      onClick={onReturn}
      className="px-10 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:bg-rose-500 hover:text-white transition-all italic"
    >
      RETURN TO HOME
    </button>
  </div>
);

const getRandomQuests = (pool, count) => {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const DEFAULT_USER = {
  username: 'Player',
  email: '',
  exp: 0,
  totalExp: 0,
  level: 1,
  gamesPlayed: 0,
  bio: '',
  currentTheme: 'void',
  unlockedThemes: ['void', 'cyan'],
  currentFrame: 'default',
  unlockedFrames: ['default'],
  currentCharacter: 'agent-x',
  customAvatar: null,
  currentBanner: 'default',
  unlockedBanners: ['default'],
  unlockedCharacters: ['agent-x'],
  unlockedCursors: ['default'],
  unlockedBadges: [],
  redeemedCodes: [],
  favorites: [],
  pinnedGames: [],
  featuredBadgeId: null,
  dailyExp: {},
  dailyGames: {},
  lastActiveDate: new Date().toISOString().split('T')[0],
  score: 0,
  uid: 'user-' + Math.random().toString(36).substr(2, 9),
  hasSetProfile: false,
  isAdmin: false,
  streak: 1,
  lastLoginDate: new Date().toISOString().split('T')[0],
  customTheme: {
    primary: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.6)',
    bg: '#020617'
  },
  settings: {
    sidebarAutoHide: false,
    notifications: true,
    displayProfileBadges: true,
    customCursor: false,
    cursorStyle: 'default',
    animatedBg: true,
    uiOpacity: 0.8,
    homeBanner: true,
    performanceMode: false,
    hideUnreleased: true,
    showFPS: false,
    reduceMotion: false,
    lowQualityParticles: false,
    backgroundEffects: true,
    interactiveBg: true,
    disableGlow: false,
    highContrast: false,
  }
};

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
      
      const target = e.target;
      const isClickable = target.closest('button, a, [role="button"], .cursor-pointer, input, select, textarea');
      setIsHovering(!!isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div 
      className={`proto-cursor ${isHovering ? 'proto-cursor-hover' : ''}`}
      animate={{ 
        x: position.x, 
        y: position.y,
        scale: isMouseDown ? 0.8 : (isHovering ? 1.2 : 1),
        boxShadow: isHovering ? '0 0 20px var(--primary-glow)' : '0 0 10px rgba(255,255,255,0.1)'
      }}
      transition={{ 
        type: "spring", 
        damping: 30, 
        stiffness: 400, 
        mass: 0.5,
      }}
      style={{ translateX: '-50%', translateY: '-50%' }}
    />
  );
};

const EpilepsyWarning = ({ onProceed, onSkip }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-6">
      <div className="max-w-xl w-full p-12 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="w-24 h-24 rounded-[2rem] bg-rose-500/20 flex items-center justify-center text-rose-500 mx-auto mb-10 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
          <AlertTriangle size={48} strokeWidth={2.5} />
        </div>
        
        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-8">EPILEPSY WARNING</h2>
        
        <div className="space-y-6 mb-12">
          <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed italic text-left">
            This loading screen may contain flashing lights, rapid patterns, or visual effects that could trigger seizures for people with photosensitive epilepsy or other light-sensitive conditions.
          </p>
          <p className="text-white/40 text-[10px] font-medium leading-relaxed uppercase tracking-widest text-left">
            Viewer discretion is advised. If you have a history of epilepsy or seizures, or experience symptoms such as dizziness, altered vision, eye or muscle twitching, loss of awareness, or convulsions, please press skip loading screen.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={onProceed}
            className="w-full py-6 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] italic hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
          >
            CONTINUE TO LOADING SCREEN
          </button>
          <button 
            onClick={onSkip}
            className="w-full py-6 bg-red-500 text-white border border-red-500/50 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] italic hover:bg-red-600 transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)] active:scale-95"
          >
            SKIP LOADING SCREEN
          </button>
        </div>
      </div>
    </div>
  );
};

const BossEvent = ({ onDefeat }) => {
  const [health, setHealth] = useState(100);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isHit, setIsHit] = useState(false);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAttack = () => {
    const nextHealth = health - 5;
    if (nextHealth <= 0) {
      setHealth(0);
      onDefeat();
      return;
    }
    setHealth(nextHealth);
    setIsHit(true);
    setShake(5);
    setTimeout(() => {
      setIsHit(false);
      setShake(0);
    }, 100);
  };

  if (health <= 0) return null;

  return (
    <motion.div 
      animate={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        x: shake ? [0, -shake, shake, 0] : 0
      }}
      transition={{ 
        left: { duration: 2, ease: "easeInOut" },
        top: { duration: 2, ease: "easeInOut" },
        x: { duration: 0.1, repeat: Infinity }
      }}
      className="fixed z-[9999] pointer-events-auto cursor-crosshair"
      style={{ transform: 'translate(-50%, -50%)' }}
    >
      <div 
        onClick={handleAttack}
        className={`relative group transition-transform ${isHit ? 'scale-95' : 'hover:scale-110'}`}
      >
        {/* Phase Effects */}
        {health < 50 && (
          <div className="absolute inset-0 bg-rose-600/30 blur-[100px] rounded-full animate-pulse"></div>
        )}
        
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-6 bg-black rounded-full border-2 border-white/10 overflow-hidden shadow-2xl">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ 
              width: `${health}%`,
              backgroundColor: health < 30 ? '#ef4444' : health < 60 ? '#f59e0b' : '#10b981'
            }}
            className="h-full shadow-[0_0_20px_rgba(239,68,68,0.5)]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">BOSS HEALTH: {health}%</span>
          </div>
        </div>
        
        <div className="relative">
          <div className={`absolute inset-0 bg-rose-500/20 blur-3xl rounded-full ${health < 50 ? 'animate-ping' : 'animate-pulse'}`}></div>
          <div className={`w-48 h-48 bg-black rounded-full border-8 ${health < 30 ? 'border-rose-600 shadow-[0_0_100px_#ef4444]' : 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.5)]'} flex items-center justify-center transition-all duration-300 ${isHit ? 'brightness-150' : ''}`}>
            <Ghost size={96} className={`${health < 30 ? 'text-rose-600' : 'text-rose-500'} ${health < 50 ? 'animate-bounce' : ''}`} />
          </div>
          <div className="absolute -inset-8 border-4 border-dashed border-rose-500/30 rounded-full animate-spin-slow"></div>
          <div className="absolute -inset-12 border-2 border-dotted border-rose-500/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
        </div>

        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="px-6 py-2 bg-rose-500 text-black font-black text-xs uppercase tracking-[0.3em] rounded-full shadow-[0_0_30px_rgba(239,68,68,0.5)] border-2 border-white/20"
          >
            DEFEAT BOSS
          </motion.div>
        </div>

        {/* Damage Particles */}
        {isHit && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 200, 
                  y: (Math.random() - 0.5) * 200, 
                  opacity: 0,
                  scale: 0
                }}
                className="absolute w-2 h-2 bg-rose-500 rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MatrixRain = ({ performanceMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101";
    const fontSize = performanceMode ? 20 : 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "var(--primary)";
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, performanceMode ? 80 : 40);
    return () => clearInterval(interval);
  }, [performanceMode]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};

const StarRain = ({ onCollect }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (items.length < 25) {
        setItems(prev => [...prev, {
          id: Math.random(),
          x: Math.random() * 90,
          delay: Math.random() * 2,
          rotation: Math.random() * 360,
          speed: Math.random() * 2 + 3,
          scale: Math.random() * 0.5 + 0.8
        }]);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [items]);

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ y: -100, opacity: 0, rotate: item.rotation }}
            animate={{ 
              y: '110vh', 
              opacity: 1, 
              rotate: item.rotation + 360,
              x: [0, 30, -30, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              y: { duration: item.speed, ease: "linear", delay: item.delay },
              rotate: { duration: item.speed, ease: "linear", delay: item.delay },
              x: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            onAnimationComplete={() => setItems(prev => prev.filter(i => i.id !== item.id))}
            className="absolute pointer-events-auto cursor-pointer p-8" // Increased padding for easier click
            style={{ left: `${item.x}%` }}
            onClick={() => {
              onCollect();
              setItems(prev => prev.filter(i => i.id !== item.id));
            }}
          >
            <div className="relative group" style={{ scale: item.scale }}>
              <div className="absolute -inset-4 bg-white/10 blur-2xl rounded-full group-hover:bg-white/20 transition-colors animate-pulse"></div>
              <div className="relative p-4 bg-black/90 backdrop-blur-md border-2 border-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] group-hover:scale-125 transition-all duration-300">
                <Star size={40} className="text-white fill-white group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                  <Plus size={16} className="text-black font-bold" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ExpRain = ({ onCollect }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (items.length < 30) {
        setItems(prev => [...prev, {
          id: Math.random(),
          amount: Math.floor(Math.random() * 8000) + 2000,
          x: Math.random() * 90,
          delay: Math.random() * 1.5,
          speed: Math.random() * 1.5 + 2.5
        }]);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [items]);

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ y: -100, opacity: 0, scale: 0.5 }}
            animate={{ 
              y: '110vh', 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.2, 1, 0.8],
              x: [0, -30, 30, 0]
            }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ 
              y: { duration: item.speed, ease: "linear", delay: item.delay },
              opacity: { duration: item.speed, ease: "linear", delay: item.delay },
              scale: { duration: item.speed, ease: "linear", delay: item.delay },
              x: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            onAnimationComplete={() => setItems(prev => prev.filter(i => i.id !== item.id))}
            className="absolute pointer-events-auto cursor-pointer p-10" // Massive padding for easy click
            style={{ left: `${item.x}%` }}
            onClick={() => {
              onCollect(item.amount);
              setItems(prev => prev.filter(i => i.id !== item.id));
            }}
          >
            <div className="flex flex-col items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-white blur-2xl opacity-40 group-hover:opacity-80 transition-opacity"></div>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.8)] group-hover:scale-150 transition-transform border-4 border-black/30 relative z-10">
                  <Zap size={32} className="text-black animate-pulse" />
                </div>
              </div>
              <div className="mt-2 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full border border-white/50">
                <span className="text-xs font-black text-white tracking-tighter">+{item.amount.toLocaleString()} EXP</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};


const App = () => {
  const dailyGame = useMemo(() => {
    if (!GAMES_DATA || GAMES_DATA.length === 0) return { id: 'ovo-classic', name: 'OvO' };
    
    const now = new Date();
    const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const estDate = new Date(estString);
    
    // Calendar days since epoch in America/New_York (EST/EDT)
    const estDayTimestamp = Date.UTC(estDate.getFullYear(), estDate.getMonth(), estDate.getDate());
    const dayIndex = Math.floor(estDayTimestamp / (1000 * 60 * 60 * 24));
    
    const index = Math.abs(dayIndex) % GAMES_DATA.length;
    const game = GAMES_DATA[index];
    return { id: game.id, name: game.title, description: game.description, thumbnail: game.thumbnail };
  }, []);

  const [customDailyGame, setCustomDailyGame] = useState(null);
  const activeDailyGame = customDailyGame || dailyGame;

  const [currentView, setCurrentView] = useState(AppRoute.HOME);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const isLoggingIn = useRef(false);

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setIsAuthLoading(false);
    });

    // Safety timeout: if auth takes more than 5s, continue anyway
    const timeout = setTimeout(() => setIsAuthLoading(false), 5000);

    // Handle redirect result for schools/browsers that block popups
    getRedirectResult(auth).catch((error) => {
      if (error.code !== 'auth/redirect-cancelled-by-user') {
        console.error('Redirect result error:', error);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const [lockedGames, setLockedGames] = useState({});
  const [directChatUser, setDirectChatUser] = useState(null);

  const [countOwnerOnLeaderboard, setCountOwnerOnLeaderboard] = useState(false);

  // Global Site Settings Listener (Maintenance, Daily Game, Announcements, Game Locks, Owner Leaderboard Count)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsMaintenanceMode(data.isMaintenanceMode || false);
        setCountOwnerOnLeaderboard(data.countOwnerOnLeaderboard === true);
        if (data.dailyGameId || data.gameOfTheWeekId) {
          setCustomDailyGame({ 
            id: data.dailyGameId || data.gameOfTheWeekId, 
            name: data.dailyGameName || data.gameOfTheWeekName 
          });
        }
        if (data.lockedGames) {
          setLockedGames(data.lockedGames);
        } else {
          setLockedGames({});
        }
      }
    }, (error) => {
      console.warn('Settings Snapshot Error:', error);
    });
    return () => unsub();
  }, []);

  const handleToggleCountOwner = async () => {
    try {
      const nextVal = !countOwnerOnLeaderboard;
      setCountOwnerOnLeaderboard(nextVal);
      await setDoc(doc(db, 'settings', 'global'), {
        countOwnerOnLeaderboard: nextVal
      }, { merge: true });
      addNotification(
        'LEADERBOARD UPDATED',
        nextVal 
          ? 'Owner account is now counted on the leaderboard.' 
          : 'Owner account hidden from leaderboard. 2nd place has ranked up to 1st place!',
        'success'
      );
    } catch (err) {
      console.error('Failed to toggle owner leaderboard count:', err);
      addNotification('UPDATE FAILED', 'Could not update leaderboard setting.', 'error');
    }
  };

  const [isAuthPortalOpen, setIsAuthPortalOpen] = useState(false);
  const [isFirstTimeVisitor, setIsFirstTimeVisitor] = useState(false);

  // Close sign in portal immediately if user is already signed in
  useEffect(() => {
    if (firebaseUser && !firebaseUser.isAnonymous) {
      setIsAuthPortalOpen(false);
    }
  }, [firebaseUser]);

  // Sign in page ONLY appears if user is NOT signed in
  useEffect(() => {
    if (isAuthLoading) return;
    const hasSeenWelcome = safeSessionStorageGet('classroom9x_welcome_prompted');
    if ((!firebaseUser || firebaseUser.isAnonymous) && !hasSeenWelcome) {
      setIsFirstTimeVisitor(true);
      setIsAuthPortalOpen(true);
      safeSessionStorageSet('classroom9x_welcome_prompted', 'true');
    }
  }, [isAuthLoading, firebaseUser]);

  const handleLogin = (isFirst = false) => {
    // Only open sign in modal if not signed in
    if (!firebaseUser || firebaseUser.isAnonymous) {
      setIsFirstTimeVisitor(isFirst);
      setIsAuthPortalOpen(true);
    } else {
      addNotification('ALREADY SIGNED IN', `You are signed in as ${firebaseUser.displayName || firebaseUser.email || 'Player'}.`, 'info');
    }
  };

  const handleLogout = () => signOut(auth);

  const handleViewChange = (newView, param = null) => {
    setSearchQuery('');
    if (typeof param === 'string') {
      setSelectedCategoryId(param);
    } else if (param && param.targetUser) {
      setDirectChatUser(param.targetUser);
    } else if (newView !== AppRoute.CHAT) {
      setDirectChatUser(null);
    }
    if (newView !== AppRoute.ACCOUNT) {
      setViewingProfileUser(null);
    }
    setCurrentView(newView);
  };

  const handleViewProfile = (targetUser) => {
    if (!targetUser) return;
    setViewingProfileUser(targetUser);
    setSelectedPlayer(null);
    setCurrentView(AppRoute.ACCOUNT);
  };
  
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo(0, 0);
      }
      if (document && document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document && document.body) {
        document.body.scrollTop = 0;
      }
    } catch (e) {}
  }, [currentView]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(DEFAULT_USER);
  const [isPinnedMinimized, setIsPinnedMinimized] = useState(true);
  const pinnedGamesList = useMemo(() => {
    return (user.pinnedGames || []).map(id => GAMES_DATA.find(g => g.id === id)).filter(Boolean);
  }, [user.pinnedGames]);

  // Sync unlocks and check for admin status
  useEffect(() => {
    const themeUnlocks = { 10: 'emerald' };
    const frameUnlocks = { 5: 'neon', 15: 'emerald', 30: 'gold', 60: 'solar', 100: 'interstellar' };

    setUser(prev => {
      let updated = false;
      const unlockedThemes = [...prev.unlockedThemes];
      const unlockedFrames = [...(prev.unlockedFrames || ['obsidian'])];
      const unlockedCharacters = [...(prev.unlockedCharacters || ['agent-x'])];
      
      const isAdmin = prev.isAdmin;

      Object.entries(themeUnlocks).forEach(([lvl, theme]) => {
        if (prev.level >= parseInt(lvl) && !unlockedThemes.includes(theme)) {
          unlockedThemes.push(theme);
          updated = true;
        }
      });

      Object.entries(frameUnlocks).forEach(([lvl, frame]) => {
        if (prev.level >= parseInt(lvl) && !unlockedFrames.includes(frame)) {
          unlockedFrames.push(frame);
          updated = true;
        }
      });

      if (updated || isAdmin !== prev.isAdmin) {
        return { 
          ...prev, 
          unlockedThemes, 
          unlockedFrames, 
          unlockedCharacters,
          isAdmin
        };
      }
      return prev;
    });
  }, [user.level]);

  useEffect(() => {
    const root = document.documentElement;
    const themes = {
      cyan: { primary: '#00f2ff', glow: 'rgba(0, 242, 255, 0.4)' },
      emerald: { primary: '#39ff14', glow: 'rgba(57, 255, 20, 0.4)' },
      violet: { primary: '#bf80ff', glow: 'rgba(191, 128, 255, 0.4)' },
      cobalt: { primary: '#2563eb', glow: 'rgba(37, 99, 235, 0.4)' },
      gold: { primary: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)' },
      fire: { primary: '#ff4500', glow: 'rgba(255, 69, 0, 0.6)' },
      rainbow: { primary: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' },
      tester: { primary: '#ff2a85', glow: 'rgba(255, 42, 133, 0.4)' },
      owner: { primary: '#fbbf24', glow: 'rgba(251, 191, 36, 0.8)' },
      galaxy: { primary: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)' },
      hologram: { primary: '#a5f3fc', glow: 'rgba(165, 243, 252, 0.4)' },
      ironman: { primary: '#dc2626', glow: 'rgba(220, 38, 38, 0.4)' },
      spongebob: { primary: '#fde047', glow: 'rgba(253, 224, 71, 0.4)' },
      kanye: { primary: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' },
      synthwave: { primary: '#ff007f', glow: 'rgba(255, 0, 127, 0.4)' },
      usa: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
      void: { primary: '#f4f4f5', glow: 'rgba(244, 244, 245, 0.4)' },
      glitch: { primary: '#ff00ff', glow: 'rgba(255, 0, 255, 0.4)' },
      doge: { primary: '#d97706', glow: 'rgba(217, 119, 6, 0.4)' }
    };

    const theme = user.currentTheme === 'custom' ? user.customTheme : themes[user.currentTheme] || themes.cyan;
    
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-glow', theme.glow);
    root.style.setProperty('--accent', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    
    root.className = `font-sans antialiased bg-background text-foreground theme-${user.currentTheme}`;
  }, [user.currentTheme, user.customTheme]);
  const [activeGame, setActiveGame] = useState(null);
  const [playingGame, setPlayingGame] = useState(null);

  const addExpAndTrackPlayRef = useRef(null);
  const updateQuestProgressRef = useRef(null);

  useEffect(() => {
    const handlePlayGame = (e) => {
      const game = e.detail;
      if (!game) return;

      const gameLock = lockedGames[game.id];
      const isOwnerUser = isPlatformOwner(user, firebaseUser || auth.currentUser);

      if (gameLock && (gameLock.isLocked || gameLock.isBroken) && !isOwnerUser) {
        addNotification(
          'GAME UNAVAILABLE',
          gameLock.reason || (gameLock.isBroken ? 'This game has been reported broken and is temporarily locked for maintenance.' : 'This title is temporarily locked by the platform owner.'),
          'warning'
        );
        return;
      }

      setPlayingGame(game);
      setActiveGame(null);
      
      // Award rewards ONLY when the actual play button is pressed inside the game card
      if (addExpAndTrackPlayRef.current) {
        addExpAndTrackPlayRef.current(game);
      }
      if (updateQuestProgressRef.current) {
        updateQuestProgressRef.current('play', 1);
        updateQuestProgressRef.current('score', 250);
      }
    };
    window.addEventListener('play-game', handlePlayGame);
    return () => window.removeEventListener('play-game', handlePlayGame);
  }, [lockedGames, firebaseUser, user]);
  const [chatMessages, setChatMessages] = useState([
    { username: 'SYSTEM', text: 'WELCOME TO CLASSROOM 9X.', timestamp: new Date().toISOString() },
    { username: 'ADMIN', text: 'NEW UPDATE IS NOW LIVE. ENJOY THE GAMES.', timestamp: new Date().toISOString() }
  ]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (user.settings.showChat !== undefined) {
      setIsChatOpen(user.settings.showChat);
    }
  }, [user.settings.showChat]);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setIsQuotaExceeded(true);
    window.addEventListener('firestore-quota-exceeded', handleQuota);
    return () => window.removeEventListener('firestore-quota-exceeded', handleQuota);
  }, []);

  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isCloaked, setIsCloaked] = useState(true);
  const [isExitingCloak, setIsExitingCloak] = useState(false);

  // Dynamic Browser Tab Title and Favicon based on Cloak State
  useEffect(() => {
    const faviconEl = document.getElementById('app-favicon') || document.querySelector("link[rel*='icon']");
    if (isCloaked) {
      document.title = 'Student Tools';
      if (faviconEl) {
        faviconEl.setAttribute('href', 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>');
      }
    } else {
      document.title = 'Cine';
      if (faviconEl) {
        faviconEl.setAttribute('href', 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>');
      }
    }
  }, [isCloaked]);
  const [isGlitched, setIsGlitched] = useState(false);
  const [isRainbowChaos, setIsRainbowChaos] = useState(false);
  const [isFireStorm, setIsFireStorm] = useState(false);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [isMatrixRain, setIsMatrixRain] = useState(false);
  const [isGravityChaos, setIsGravityChaos] = useState(false);
  const [isChatOnFire, setIsChatOnFire] = useState(false);
  const [isVoidStorm, setIsVoidStorm] = useState(false);
  const [isSystemOverload, setIsSystemOverload] = useState(false);
  const [isGoldenHour, setIsGoldenHour] = useState(false);
  const [showBoss, setShowBoss] = useState(false);
  const [showBadgeRain, setShowBadgeRain] = useState(false);
  const [showExpRain, setShowExpRain] = useState(false);


  const [notifications, setNotifications] = useState([]);
  const [quests, setQuests] = useState([]);
  const [boosts, setBoosts] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [viewingProfileUser, setViewingProfileUser] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [adminAnnouncement, setAdminAnnouncement] = useState(null);
  const [systemStats, setSystemStats] = useState({ activeUsers: 1, totalPlayers: 1 });

  const isModalOpen = !!(
    activeGame || 
    isProfileModalOpen || 
    selectedPlayer || 
    isMaintenanceMode
  );

  // Global Events Listener
  useEffect(() => {
    if (!firebaseUser || window.isFirestoreQuotaExceeded) return;
    const q = query(collection(db, 'events'), orderBy('timestamp', 'desc'), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;
      const eventData = snapshot.docs[0].data();
      
      // Safe, clock-skew resilient verification (using Math.abs and a wider 2-minute buffer)
      let eventTime = Date.now();
      if (eventData.timestamp) {
        eventTime = eventData.timestamp.toMillis ? eventData.timestamp.toMillis() : Date.now();
      }
      if (Math.abs(Date.now() - eventTime) > 120000) return;

      const { type, senderName, character, frame } = eventData;
      setAdminAnnouncement({
        text: `${senderName.toUpperCase()} STARTED ${type.replace(/_/g, ' ').toUpperCase()} EVENT!`,
        sender: { username: senderName, characterId: character || 'agent-x', frameId: frame || 'obsidian' },
        announcementType: 'event',
        timestamp: new Date().toISOString()
      });
      setTimeout(() => setAdminAnnouncement(null), 8000);

      // Trigger effects
      if (type === 'RAINBOW_CHAOS') {
        setIsRainbowChaos(true);
        setTimeout(() => setIsRainbowChaos(false), 30000);
      } else if (type === 'SYSTEM_GLITCH') {
        setIsGlitched(true);
        setTimeout(() => setIsGlitched(false), 10000);
      } else if (type === 'PARTY_MODE') {
        setIsPartyMode(true);
        setTimeout(() => setIsPartyMode(false), 30000);
      } else if (type === 'MATRIX_RAIN') {
        setIsMatrixRain(true);
        setTimeout(() => setIsMatrixRain(false), 15000);
      } else if (type === 'GRAVITY_CHAOS') {
        setIsGravityChaos(true);
        setTimeout(() => setIsGravityChaos(false), 15000);
      } else if (type === 'FIRE_STORM') {
        setIsFireStorm(true);
        setTimeout(() => setIsFireStorm(false), 15000);
      } else if (type === 'VOID_STORM') {
        setIsVoidStorm(true);
        setTimeout(() => setIsVoidStorm(false), 20000);
      } else if (type === 'GOLDEN_HOUR') {
        setIsGoldenHour(true);
        setTimeout(() => setIsGoldenHour(false), 60000);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });
    return () => unsub();
  }, [firebaseUser]);



  const [broadcastAnnouncement, setBroadcastAnnouncement] = useState(null);
  const broadcastShownIds = useRef(new Set());
  const [reportModalData, setReportModalData] = useState({
    isOpen: false,
    type: 'game_broken',
    target: null
  });

  const handleOpenReportModal = (type, target) => {
    setReportModalData({
      isOpen: true,
      type,
      target
    });
  };

  const handleCloseReportModal = () => {
    setReportModalData(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const handleReportEvent = (e) => {
      const { type, target } = e.detail || {};
      handleOpenReportModal(type || 'game_broken', target || null);
    };
    window.addEventListener('open-report-modal', handleReportEvent);
    return () => window.removeEventListener('open-report-modal', handleReportEvent);
  }, []);

  // Global Announcements Listener
  useEffect(() => {
    if (!firebaseUser || window.isFirestoreQuotaExceeded) return;
    const q = query(collection(db, 'announcements'), orderBy('timestamp', 'desc'), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const announcementId = docSnap.id;
      
      let announcementTime = Date.now();
      if (data.timestamp) {
        announcementTime = data.timestamp.toMillis ? data.timestamp.toMillis() : Date.now();
      }

      // Check for 10-second global screen overlay broadcast
      if (data && (data.showOverlay === true || data.isGlobalBroadcast === true || data.broadcast === true)) {
        if (!broadcastShownIds.current.has(announcementId)) {
          const ageMs = Date.now() - announcementTime;
          // Show overlay if broadcast was published within the past 15 minutes
          if (ageMs < 15 * 60 * 1000) {
            broadcastShownIds.current.add(announcementId);
            setBroadcastAnnouncement({ id: announcementId, ...data });
          }
        }
      }

      // If user had closed this specific announcement banner already, do not show top banner again
      if (safeLocalStorageGet('classroom9x_dismissed_announcement_id') === announcementId) {
        return;
      }

      // Keep top banner visible for up to 2 hours after publication
      const ageMs = Date.now() - announcementTime;
      if (ageMs > 2 * 60 * 60 * 1000) return; // 2 hours limit

      setAdminAnnouncement({
        id: announcementId,
        text: data.text,
        sender: { 
          username: data.senderName || 'System', 
          characterId: data.character || 'agent-x', 
          frameId: data.frame || 'default' 
        },
        announcementType: data.type || 'system',
        timestamp: new Date(announcementTime).toISOString()
      });

      // Clear any existing dismiss timer to avoid conflicts
      if (adminAnnouncementTimer.current) {
        clearTimeout(adminAnnouncementTimer.current);
      }

      // Auto-dismiss the active announcement banner after 15 seconds of appearing
      adminAnnouncementTimer.current = setTimeout(() => {
        setAdminAnnouncement(null);
      }, 15000);

    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
    });

    return () => {
      unsub();
      if (adminAnnouncementTimer.current) {
        clearTimeout(adminAnnouncementTimer.current);
      }
    };
  }, [firebaseUser]);

  // Handle manual dismissal of global announcements
  const handleCloseAnnouncement = () => {
    if (adminAnnouncement?.id) {
      safeLocalStorageSet('classroom9x_dismissed_announcement_id', adminAnnouncement.id);
    }
    setAdminAnnouncement(null);
  };

  // Periodically update user's lastSeen timestamp in Firestore to remain active
  useEffect(() => {
    if (!firebaseUser || !user || !user.hasSetProfile) return;
    
    const updateActive = async () => {
      if (document.hidden) return; // Skip if tab is inactive/backgrounded
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, {
          lastSeen: serverTimestamp()
        });
      } catch (err) {
        console.warn('Failed to update active status:', err);
      }
    };
    
    // Update immediately on mount/auth
    updateActive();
    
    // Update active status every 3 minutes
    const interval = setInterval(updateActive, 180000);
    return () => clearInterval(interval);
  }, [firebaseUser, user?.hasSetProfile]);

  // Listen to total user list with limit to compute global active stats without reading entire DB
  useEffect(() => {
    if (!firebaseUser || window.isFirestoreQuotaExceeded) return;
    
    // Query registered users to accurately count total community players
    const q = query(collection(db, 'users'), limit(300));
    const unsub = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(d => {
        const data = d.data();
        let lastSeenMs = 0;
        if (data.lastSeen) {
          lastSeenMs = data.lastSeen.toMillis ? data.lastSeen.toMillis() : 0;
        }
        return { ...data, lastSeenMs };
      });
      
      const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
      const activeCount = users.filter(u => u.lastSeenMs > fiveMinsAgo).length;
      
      // Guest accounts do not count toward total community player count
      const registeredUsers = users.filter(u => 
        !u.isAnonymous && 
        u.email && 
        !u.isDeleted && 
        u.username && 
        !u.username.toLowerCase().startsWith('guest')
      );
      
      setSystemStats({
        activeUsers: Math.max(activeCount, 1),
        totalPlayers: Math.max(registeredUsers.length, (!firebaseUser?.isAnonymous && firebaseUser?.email ? 1 : 0))
      });
    }, (error) => {
      console.warn('System stats collection sync error:', error);
    });
    
    return () => unsub();
  }, [firebaseUser]);

  const lastNotifiedLevel = useRef(user?.level || 1);
  const lastNotifiedThemesCount = useRef(user?.unlockedThemes?.length || 0);
  const lastNotifiedFramesCount = useRef(user?.unlockedFrames?.length || 0);
  const lastNotifiedCharsCount = useRef(user?.unlockedCharacters?.length || 0);
  const lastCompletedQuestsCount = useRef(0);
  const fpsHistory = useRef([]);
  const lastLagNotification = useRef(0);
  const adminAnnouncementTimer = useRef(null);

  // Leaderboard Real-time Sync (Filtered only on registered users for both Levels & Games Played)
  useEffect(() => {
    if (!firebaseUser || window.isFirestoreQuotaExceeded) {
      if (!firebaseUser) setLeaderboardData([]);
      return;
    }
    const q = query(collection(db, 'users'), limit(200));
    const unsub = onSnapshot(q, (snapshot) => {
      const isOwnerPlayer = (player) => {
        return isPlatformOwner(player);
      };

      const data = snapshot.docs
        .map(d => ({ ...d.data(), uid: d.id }))
        .filter(player => {
          const isValid = player.username && player.username !== 'Player' && player.hasSetProfile === true && !player.isAnonymous && !player.username.toLowerCase().startsWith('guest') && !player.isDeleted;
          if (!isValid) return false;
          // When NOT toggled, owner's account does not show on leaderboard, so whoever is below ranks up
          if (!countOwnerOnLeaderboard && isOwnerPlayer(player)) {
            return false;
          }
          return true;
        });
      setLeaderboardData(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsub();
  }, [firebaseUser, countOwnerOnLeaderboard]);

  // Global Chat Real-time Sync
  useEffect(() => {
    if (!firebaseUser || window.isFirestoreQuotaExceeded) {
      if (!firebaseUser) setChatMessages([]);
      return;
    }
    const q = query(collection(db, 'chat'), orderBy('timestamp', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          username: data.username || data.senderName || 'Anonymous',
          senderName: data.senderName || data.username || 'Anonymous',
          customAvatar: data.customAvatar || null,
          recipientUid: data.recipientUid || null,
          recipientUsername: data.recipientUsername || null,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp || new Date().toISOString()
        };
      }).reverse();
      setChatMessages(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chat');
    });
    return () => unsub();
  }, [firebaseUser]);

  useEffect(() => {
    // WebSocket removed in favor of Firestore real-time listeners
  }, []);

  const sendChatMessage = async (text, recipient = null) => {
    if (!text || !text.trim()) return;
    if (!firebaseUser) {
      handleLogin();
      return;
    }

    const now = Date.now();
    if (now - lastChatTime.current < 1500) {
      addNotification('RATE LIMIT', 'Wait a moment between messages.', 'warning');
      return;
    }
    lastChatTime.current = now;

    try {
      const filteredText = filterProfanity(text.trim());
      const senderDisplayName = user?.username || (firebaseUser.isAnonymous ? `Guest_${firebaseUser.uid.substring(0, 5)}` : 'Player');
      const payload = {
        text: filteredText,
        senderUid: firebaseUser.uid,
        senderName: senderDisplayName,
        username: senderDisplayName,
        customAvatar: user?.customAvatar || null,
        timestamp: serverTimestamp(),
        character: user?.currentCharacter || 'agent-x',
        frame: user?.currentFrame || 'obsidian',
        isAdmin: Boolean(user?.isAdmin || user?.role === 'OWNER')
      };

      if (recipient) {
        if (recipient.uid) payload.recipientUid = recipient.uid;
        if (recipient.username) payload.recipientUsername = recipient.username;
      }

      await addDoc(collection(db, 'chat'), payload);
    } catch (err) {
      console.error('Chat error:', err);
      handleFirestoreError(err, OperationType.CREATE, 'chat');
    }
  };

  const deleteChatMessage = async (messageId) => {
    if (!user.isAdmin) return;
    try {
      await deleteDoc(doc(db, 'chat', messageId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `chat/${messageId}`);
    }
  };

  useEffect(() => {
    if (!user.settings.lagNotifications) return;

    let lastTime = performance.now();
    let frameCount = 0;

    const checkLag = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        fpsHistory.current.push(fps);
        if (fpsHistory.current.length > 5) fpsHistory.current.shift();

        const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
        
        if (avgFps < 30 && Date.now() - lastLagNotification.current > 60000 && !isAuthLoading && user.hasSetProfile) {
          addNotification('Lag Detected', 'The experience could be laggy. Try closing other tabs.', 'system', <ZapOff className="text-rose-500" />);
          lastLagNotification.current = Date.now();
        }

        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(checkLag);
    };

    const animId = requestAnimationFrame(checkLag);
    return () => cancelAnimationFrame(animId);
  }, [user.settings.lagNotifications]);

  const initialLoadCompleted = useRef(false);

  useEffect(() => {
    if (user.level > lastNotifiedLevel.current) {
      if (initialLoadCompleted.current && lastNotifiedLevel.current > 0) {
        addNotification('Level Up!', `You reached Level ${user.level}`, 'level', <Zap className="text-theme" />);
      }
      lastNotifiedLevel.current = user.level;
    }
  }, [user.level]);

  useEffect(() => {
    if (user.unlockedThemes.length > lastNotifiedThemesCount.current) {
      if (initialLoadCompleted.current && lastNotifiedThemesCount.current > 0) {
        const newTheme = user.unlockedThemes[user.unlockedThemes.length - 1];
        addNotification('Theme Unlocked!', `New theme: ${newTheme}`, 'system', <Star className="text-theme" />);
      }
      lastNotifiedThemesCount.current = user.unlockedThemes.length;
    }
  }, [user.unlockedThemes]);

  useEffect(() => {
    if (user.unlockedFrames.length > lastNotifiedFramesCount.current) {
      if (initialLoadCompleted.current && lastNotifiedFramesCount.current > 0) {
        const newFrame = user.unlockedFrames[user.unlockedFrames.length - 1];
        addNotification('Frame Unlocked!', `New frame: ${newFrame}`, 'system', <Shield className="text-theme" />);
      }
      lastNotifiedFramesCount.current = user.unlockedFrames.length;
    }
  }, [user.unlockedFrames]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  useEffect(() => {
    if (user.unlockedCharacters.length > lastNotifiedCharsCount.current) {
      if (initialLoadCompleted.current && lastNotifiedCharsCount.current > 0) {
        const newChar = user.unlockedCharacters[user.unlockedCharacters.length - 1];
        addNotification('Avatar Unlocked!', `New character: ${newChar}`, 'system', <Zap className="text-theme" />);
      }
      lastNotifiedCharsCount.current = user.unlockedCharacters.length;
    }
  }, [user.unlockedCharacters]);

  useEffect(() => {
    const qArray = Array.isArray(quests) ? quests : [];
    const completedQuests = qArray.filter(q => q.isCompleted);
    if (completedQuests.length > lastCompletedQuestsCount.current) {
      if (initialLoadCompleted.current && lastCompletedQuestsCount.current > 0) {
        const latestQuest = completedQuests[completedQuests.length - 1];
        addNotification('Quest Completed!', latestQuest.title, 'system', <Trophy className="text-theme" />);
      }
      lastCompletedQuestsCount.current = completedQuests.length;
    }
  }, [quests]);

  useEffect(() => {
    if (!isAuthLoading && user.hasSetProfile && firebaseUser) {
      // Sync last notified values to current state without firing notifications
      lastNotifiedLevel.current = user.level;
      lastNotifiedThemesCount.current = user.unlockedThemes.length;
      lastNotifiedFramesCount.current = user.unlockedFrames.length;
      lastNotifiedCharsCount.current = user.unlockedCharacters.length;
      const qArray = Array.isArray(quests) ? quests : [];
      lastCompletedQuestsCount.current = qArray.filter(q => q.isCompleted).length;

      // Small delay after first data load to prevent rapid fire notifications
      const timer = setTimeout(() => {
        initialLoadCompleted.current = true;
      }, 10000); // 10s delay to be sure
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, user.hasSetProfile, firebaseUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setBoosts(prev => (Array.isArray(prev) ? prev : []).filter(b => b.expiresAt > now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedQuests = safeLocalStorageGetJSON('classroom9x_quests_v1');
    const lastQuestDate = safeLocalStorageGet('classroom9x_quest_date');
    const today = new Date().toISOString().split('T')[0];

    if (lastQuestDate === today && Array.isArray(savedQuests) && savedQuests.length > 0) {
      setQuests(savedQuests);
    } else {
      const dailyQuests = getRandomQuests(QUEST_POOL, 3);
      safeLocalStorageSet('classroom9x_quest_date', today);
      safeLocalStorageSet('classroom9x_quests_v1', dailyQuests);
      setQuests(dailyQuests);
    }
  }, []);

  useEffect(() => {
    safeLocalStorageSet('classroom9x_quests_v1', quests);
  }, [quests]);

  useEffect(() => {
    if (user.username !== 'Player' && user.hasSetProfile) {
      const url = '/api/leaderboard/update';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          username: user.username,
          level: user.level,
          score: user.score,
          characterId: user.currentCharacter,
          featuredBadgeId: user.featuredBadgeId,
          gamesPlayed: user.gamesPlayed,
          frameId: user.currentFrame,
          unlockedBadges: user.unlockedBadges,
          currentTheme: user.currentTheme,
          lastActive: Date.now()
        })
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return { success: true, fallback: true };
      })
      .catch(err => {
        // Silently skip if it's a network failure, abort, or parsing syntax error
        if (err.name !== 'TypeError' && err.name !== 'SyntaxError') {
          console.error('Leaderboard sync error:', err.message);
        }
      });
    }
  }, [user.score, user.level, user.username, user.hasSetProfile, user.currentCharacter, user.featuredBadgeId, user.gamesPlayed, user.currentFrame, user.unlockedBadges, user.currentTheme]);

  const updateQuestProgress = (type, amount = 1) => {
    setQuests(prev => prev.map(q => {
      if (q.questType === type && !q.isCompleted) {
        const newProgress = Math.min(q.progress + amount, q.target);
        const isCompleted = newProgress === q.target;
        return { ...q, progress: newProgress, isCompleted };
      }
      return q;
    }));
  };
  updateQuestProgressRef.current = updateQuestProgress;

  const handleClaimQuestReward = (questId) => {
    const quest = quests.find(q => q.id === questId);
    if (quest && quest.isCompleted) {
      if (quest.type === 'exp') {
        if (user.level >= 100) {
          addNotification('Max Level Reached', 'You are already at peak power!', 'level', <Zap className="text-theme" />);
        } else {
          const multiplier = boosts.reduce((acc, b) => acc + (b.multiplier - 1), 1);
          const finalReward = Math.floor(quest.reward * multiplier);
          setUser(prev => ({ ...prev, exp: prev.exp + finalReward }));
          addNotification('Reward Claimed!', `+${finalReward} EXP Added`, 'level', <Zap className="text-theme" />);
        }
      } else if (quest.type === 'rare') {
        setUser(prev => ({ ...prev, score: prev.score + 1000 }));
        addNotification('Rare Reward!', 'Score Boost Activated', 'badge', <Star className="text-amber-400" />);
        setBoosts(prev => [...prev, { id: Math.random().toString(), name: 'Rare Boost', multiplier: 2.0, expiresAt: Date.now() + 3600000 }]);
      } else if (quest.type === 'item' && quest.rewardItem) {
        const item = quest.rewardItem;
        setUser(prev => {
          const updates = {};
          if (item.type === 'frame') updates.unlockedFrames = Array.from(new Set([...(prev.unlockedFrames || []), item.id]));
          if (item.type === 'character') updates.unlockedCharacters = Array.from(new Set([...(prev.unlockedCharacters || []), item.id]));
          if (item.type === 'theme') updates.unlockedThemes = Array.from(new Set([...(prev.unlockedThemes || []), item.id]));
          return { ...prev, ...updates };
        });
        addNotification('Item Unlocked!', item.name, 'system', <Trophy className="text-theme" />);
      }
      setQuests(prev => prev.map(q => {
        if (q.id === questId) {
          return { ...q, claimed: true };
        }
        return q;
      }));
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => (Array.isArray(prev) ? prev : []).filter(n => n.id !== id));
  };










  const addNotification = (title, message, type, icon, color) => {
    if (title === 'ADMIN ANNOUNCEMENT') return;
    if (!user.settings.notifications) return;
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type, icon, color }]);
    setTimeout(() => {
      removeNotification(id);
    }, 8000);
  };


  useEffect(() => {
    document.documentElement.style.setProperty('--ui-opacity', user.settings.uiOpacity.toString());
  }, [user.settings.uiOpacity]);

  // Sync User Profile with Firestore
  useEffect(() => {
    if (!firebaseUser) {
      setUser(DEFAULT_USER);
      return;
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    
    // Initial fetch and real-time sync
    const unsub = onSnapshot(userRef, async (snapshot) => {
      // 1. Fetch admin status (always check this regardless of profile existence)
      const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
      const isOwnerByAuth = isPlatformOwner(null, firebaseUser);

      if (snapshot.exists()) {
        const userData = snapshot.data();
        const isOwnerAccount = isOwnerByAuth || isPlatformOwner(userData, firebaseUser) || adminDoc.data()?.role === 'OWNER';
        
        // Check if account has been deleted / terminated by the owner
        if (userData.isDeleted) {
          console.warn('Account terminated by owner:', firebaseUser.uid);
          await auth.signOut();
          setUser(DEFAULT_USER);
          addNotification(
            'ACCOUNT TERMINATED',
            "This account was deleted by the owner and no longer exists.",
            'error'
          );
          return;
        }
        
        // Strict verification for admin/owner status: softball_chik_007@yahoo.com or Graycen is OWNER
        const finalRole = isOwnerAccount ? 'OWNER' : (adminDoc.exists() ? adminDoc.data().role : null);
        const finalIsAdmin = isOwnerAccount || Boolean(adminDoc.exists());

        // AUTO-RESTORE SITE-OWNER BADGE FOR TRUE PLATFORM OWNER & STRIP FROM NON-OWNERS
        if (isOwnerAccount) {
          const curBadges = userData.unlockedBadges || [];
          const curDisplay = userData.displayedBadgeIds || [];
          if (!curBadges.includes('site-owner') || !curDisplay.includes('site-owner') || userData.role !== 'OWNER' || userData.currentFrame !== 'owner') {
            const updatedBadges = Array.from(new Set(['site-owner', ...curBadges]));
            const updatedDisplay = Array.from(new Set(['site-owner', ...curDisplay])).slice(0, 4);
            setDoc(userRef, {
              role: 'OWNER',
              currentFrame: 'owner',
              unlockedBadges: updatedBadges,
              displayedBadgeIds: updatedDisplay
            }, { merge: true }).catch(err => console.warn('Could not auto-restore owner badges:', err));
          }
        } else {
          // Strictly strip site-owner badge and owner role from any non-owner accounts
          const curBadges = userData.unlockedBadges || [];
          const curDisplay = userData.displayedBadgeIds || [];
          if (curBadges.includes('site-owner') || curDisplay.includes('site-owner') || userData.role === 'OWNER') {
            const strippedBadges = curBadges.filter(id => id !== 'site-owner');
            const strippedDisplay = curDisplay.filter(id => id !== 'site-owner');
            setDoc(userRef, {
              role: userData.role === 'OWNER' ? null : userData.role,
              unlockedBadges: strippedBadges,
              displayedBadgeIds: strippedDisplay
            }, { merge: true }).catch(err => console.warn('Non-owner badge stripped:', err));
          }
        }

        if (isOwnerAccount && !adminDoc.exists()) {
          setDoc(doc(db, 'admins', firebaseUser.uid), { 
            email: firebaseUser.email || (userData.username ? `${userData.username}@owner.local` : 'graycen@owner.local'),
            role: 'OWNER',
            addedAt: serverTimestamp()
          }, { merge: true }).catch(err => console.warn('Admin enrollment failed:', err));
        }

        setUser(prev => ({ 
          ...prev, 
          ...userData, 
          uid: firebaseUser.uid, 
          email: firebaseUser.email,
          isAnonymous: firebaseUser.isAnonymous || false,
          isAdmin: finalIsAdmin,
          role: finalRole,
          unlockedBadges: isOwnerAccount 
            ? Array.from(new Set(['site-owner', ...(userData.unlockedBadges || [])]))
            : (userData.unlockedBadges || []).filter(id => id !== 'site-owner'),
          displayedBadgeIds: isOwnerAccount
            ? Array.from(new Set(['site-owner', ...(userData.displayedBadgeIds || [])])).slice(0, 4)
            : (userData.displayedBadgeIds || []).filter(id => id !== 'site-owner')
        }));
      } else {
        // Create initial profile
        const isAnon = firebaseUser.isAnonymous || false;
        
        // Prevent recreation if email is deleted by admin
        if (!isAnon && firebaseUser.email) {
          try {
            const deletedEmailRef = doc(db, 'deleted_emails', firebaseUser.email.toLowerCase());
            const deletedEmailDoc = await getDoc(deletedEmailRef);
            if (deletedEmailDoc.exists()) {
              console.warn('Blocked recreation/login for deleted user email:', firebaseUser.email);
              await auth.signOut();
              setUser(DEFAULT_USER);
              addNotification(
                'ACCOUNT ERROR',
                "Your account was deleted by an admin, and you can't recreate or log in with this email anymore.",
                'error'
              );
              return;
            }
          } catch (checkErr) {
            console.error('Error verifying deleted status:', checkErr);
          }
        }

        const initialProfile = {
          ...DEFAULT_USER,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          isAnonymous: isAnon,
          username: isAnon ? `Guest_${firebaseUser.uid.substring(0, 5)}` : (firebaseUser.displayName || 'Player'),
          hasSetProfile: true,
          lastLoginDate: new Date().toISOString().split('T')[0],
          isAdmin: isOwnerByAuth || adminDoc.exists(),
          role: isOwnerByAuth ? 'OWNER' : (adminDoc.exists() ? adminDoc.data().role : null),
          unlockedBadges: isOwnerByAuth ? ['site-owner'] : [],
          displayedBadgeIds: isOwnerByAuth ? ['site-owner'] : [],
          currentFrame: isOwnerByAuth ? 'owner' : 'default'
        };

        console.log('Admin Check (New User):', { 
          uid: firebaseUser.uid, 
          isAdminFlag,
          role
        });

        try {
          await setDoc(userRef, initialProfile);
          setUser(initialProfile);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
        }
      }
    }, (error) => {
      console.warn('User Sync Error:', error);
    });

    return () => unsub();
  }, [firebaseUser]);

  const lastSyncedData = useRef(null);
  const lastSyncTime = useRef(0);
  const lastChatTime = useRef(0);
  const errCount = useRef(0);

  // Sync user data to Firestore whenever local 'user' state changes
  useEffect(() => {
    if (!firebaseUser || !user || user.username === 'Player' || !user.hasSetProfile) return;

    const syncUser = async () => {
      // Robust auth check before syncing
      if (!auth.currentUser || auth.currentUser.uid !== firebaseUser.uid) {
        return;
      }

      // Check if data actually changed significantly
      const currentData = {
        level: user.level,
        score: user.score,
        exp: user.exp,
        gamesPlayed: user.gamesPlayed,
        unlockedBadges: user.unlockedBadges,
        username: user.username,
        bio: user.bio || '',
        displayedBadgeIds: user.displayedBadgeIds || [],
        currentCharacter: user.currentCharacter,
        customAvatar: user.customAvatar || null,
        currentBanner: user.currentBanner || 'default',
        unlockedBanners: user.unlockedBanners || ['default'],
        currentFrame: user.currentFrame,
        currentTheme: user.currentTheme,
        customTheme: user.customTheme,
        unlockedThemes: user.unlockedThemes,
        unlockedFrames: user.unlockedFrames,
        unlockedCharacters: user.unlockedCharacters,
        featuredBadgeId: user.featuredBadgeId,
        pinnedGames: user.pinnedGames,
        favorites: user.favorites,
        settings: user.settings,
        redeemedCodes: user.redeemedCodes,
        hasSetProfile: user.hasSetProfile
      };

      const hasChanged = !lastSyncedData.current || JSON.stringify(currentData) !== JSON.stringify(lastSyncedData.current);
      const timeSinceSync = Date.now() - lastSyncTime.current;
      
      // Stop syncing if quota exceeded or consecutive errors
      if (window.isFirestoreQuotaExceeded || errCount.current >= 3) {
        if (errCount.current === 3) {
          console.error("Firestore sync SUSPENDED due to resource limits.");
          errCount.current = 4; // Stop logging after first time
        }
        return;
      }

      // Only sync if changed OR forced periodic sync (every 10 mins)
      if (!hasChanged && timeSinceSync < 600000) {
        return;
      }

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, {
          uid: user.uid,
          username: user.username,
          bio: user.bio || '',
          displayedBadgeIds: isPlatformOwner(user, firebaseUser)
            ? Array.from(new Set(['site-owner', ...(user.displayedBadgeIds || [])])).slice(0, 4)
            : (user.displayedBadgeIds || []).filter(id => id !== 'site-owner'),
          level: user.level,
          score: user.score,
          exp: user.exp,
          isAnonymous: user.isAnonymous || false,
          gamesPlayed: user.gamesPlayed,
          currentCharacter: user.currentCharacter,
          customAvatar: user.customAvatar || null,
          currentBanner: user.currentBanner || 'default',
          unlockedBanners: user.unlockedBanners || ['default'],
          currentFrame: user.currentFrame,
          currentTheme: user.currentTheme,
          customTheme: user.customTheme || null,
          unlockedThemes: user.unlockedThemes,
          unlockedFrames: user.unlockedFrames,
          unlockedCharacters: user.unlockedCharacters,
          unlockedBadges: isPlatformOwner(user, firebaseUser)
            ? Array.from(new Set(['site-owner', ...(user.unlockedBadges || [])]))
            : (user.unlockedBadges || []).filter(id => id !== 'site-owner'),
          redeemedCodes: user.redeemedCodes || [],
          featuredBadgeId: user.featuredBadgeId,
          favorites: user.favorites,
          pinnedGames: user.pinnedGames || [],
          settings: user.settings,
          hasSetProfile: user.hasSetProfile,
          dailyExp: user.dailyExp || {},
          dailyGames: user.dailyGames || {},
          lastActiveDate: user.lastActiveDate || new Date().toISOString().split('T')[0]
        });
        
        lastSyncedData.current = currentData;
        lastSyncTime.current = Date.now();
        errCount.current = 0; // Reset error count on success
      } catch (err) {
        errCount.current++;
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      }
    };

    const timeout = setTimeout(syncUser, 4000); // 4s debounce + change detection
    return () => clearTimeout(timeout);
  }, [user, firebaseUser]);

  useEffect(() => {
    safeStoreUserProfile(user);

    const body = document.getElementById('app-body');
    if (body) {
      body.setAttribute('data-theme', user.currentTheme);
      
      if (user.currentTheme === 'custom' && user.customTheme) {
        body.classList.add('custom-theme');
        body.style.setProperty('--primary', user.customTheme.primary);
        body.style.setProperty('--primary-glow', user.customTheme.glow);
        body.style.setProperty('--bg-dark', user.customTheme.bg);
      } else {
        body.classList.remove('custom-theme');
        body.style.removeProperty('--primary');
        body.style.removeProperty('--primary-glow');
        body.style.removeProperty('--bg-dark');
      }

      if (activeGame || isProfileModalOpen) {
        if (!isCloaked) {
          body.style.overflow = 'hidden';
          body.classList.add('modal-open');
        } else {
          body.style.overflow = 'auto';
          body.classList.remove('modal-open');
        }
      } else {
        body.style.overflow = 'auto';
        body.classList.remove('modal-open');
      }

      const styles = ['default', 'amongus', 'star', 'crosshair', 'sword', 'neon', 'ring'];
      styles.forEach(s => body.classList.remove(`cursor-${s}`));

      if (user.settings.disableGlow) {
        body.classList.add('reduce-glow');
      } else {
        body.classList.remove('reduce-glow');
      }

      if (user.settings.customCursor && !activeGame && user.currentTheme !== 'spongebob' && !isCloaked) {
        body.classList.add('custom-cursor-enabled');
        body.classList.add(`cursor-${user.settings.cursorStyle}`);
      } else {
        body.classList.remove('custom-cursor-enabled');
      }

      if (user.settings.animatedBg) {
        body.classList.add('animated-bg-enabled');
      } else {
        body.classList.remove('animated-bg-enabled');
      }

      if (user.settings.liquidGlass) {
        body.classList.add('liquid-glass');
      } else {
        body.classList.remove('liquid-glass');
      }

      if (user.settings.highContrast) {
        body.classList.add('high-contrast');
      } else {
        body.classList.remove('high-contrast');
      }

      if (user.settings.reduceMotion) {
        body.classList.add('reduce-motion-enabled');
      } else {
        body.classList.remove('reduce-motion-enabled');
      }
    }
  }, [user, activeGame, isCloaked]);

  const dailyPicks = useMemo(() => {
    const now = new Date();
    const estOffset = -5;
    const estDate = new Date(now.getTime() + (estOffset * 60 * 60 * 1000));
    const dateString = estDate.toISOString().split('T')[0];
    
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash |= 0;
    }
    
    const seededRandom = () => {
      hash = Math.sin(hash) * 10000;
      return hash - Math.floor(hash);
    };

    const shuffled = [...GAMES_DATA].sort(() => seededRandom() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkBadge = (id) => {
      if (!user.unlockedBadges.includes(id)) {
        const badge = BADGES.find(b => b.id === id);
        if (badge) {
          setUser(prev => ({
            ...prev,
            unlockedBadges: [...prev.unlockedBadges, id]
          }));
          const className = 
            badge.color === 'rainbow' ? 'mythic-rainbow-text' : 
            badge.color === 'galaxy' ? 'transcendent-galaxy-text' : '';
          
          addNotification('Badge Unlocked!', badge.name, 'badge', <badge.icon className={className} style={{ color: (badge.color !== 'rainbow' && badge.color !== 'galaxy') ? badge.color : undefined }} />, badge.color);
        }
      }
    };

    if (user.gamesPlayed >= 1) checkBadge('first-contact');
    if (user.gamesPlayed >= 50) checkBadge('warlord');
    if (user.gamesPlayed >= 100) checkBadge('endurance');
    
    if (user.level >= 10) checkBadge('sentinel');
    if (user.level >= 50) checkBadge('elite-squad');
    if (user.level >= 100) checkBadge('overlord-badge');
    
    if (user.favorites.length >= 5) checkBadge('archivist');
    if (user.favorites.length >= 10) checkBadge('data-hoarder');
    
    if ((user?.unlockedThemes?.length || 0) >= 8) checkBadge('chameleon');
    if ((user?.unlockedFrames?.length || 0) >= 4) checkBadge('aesthetician');
    if ((user?.unlockedCharacters?.length || 0) >= 4) checkBadge('recruiter');
    
    if (user?.unlockedCharacters?.includes('glitch')) checkBadge('the-glitch');
  }, [
    user?.level, 
    user?.gamesPlayed, 
    user?.favorites?.length, 
    user?.unlockedThemes?.length, 
    user?.unlockedFrames?.length, 
    user?.unlockedCharacters?.length
  ]);

  const addExpAndTrackPlay = (game) => {
    setUser(prev => {
      const newGamesPlayed = (prev.gamesPlayed || 0) + 1;
      const currentLvl = Math.min(prev.level || 1, 999);

      const multiplier = boosts.reduce((acc, b) => acc + (b.multiplier - 1), 1);
      const isDaily = activeDailyGame && game && (game.id === activeDailyGame.id || game.title === activeDailyGame.name);
      const dailyMultiplier = isDaily ? 2 : 1;
      const baseExp = 120;
      const bonusExp = Math.floor(Math.random() * 60);
      const earnedExp = Math.floor((baseExp + bonusExp) * multiplier * dailyMultiplier);
      
      const oldTotalExp = prev.totalExp || calculateTotalExp(prev);
      const newTotalExp = oldTotalExp + earnedExp;

      // Track daily EXP & games
      const today = new Date().toISOString().split('T')[0];
      const prevDailyExp = prev.dailyExp || {};
      const updatedDailyExp = {
        ...prevDailyExp,
        [today]: (prevDailyExp[today] || 0) + earnedExp
      };
      const prevDailyGames = prev.dailyGames || {};
      const updatedDailyGames = {
        ...prevDailyGames,
        [today]: (prevDailyGames[today] || 0) + 1
      };

      if (isDaily) {
        addNotification(
          '2X DAILY GAME BOOST!',
          `+${earnedExp} EXP awarded! (2X Daily Multiplier applied for playing ${game.title})`,
          'success',
          <Zap className="text-yellow-400" />
        );
      }

      // If already at max level 999, EXP bar cannot progress anymore
      if (currentLvl >= 999) {
        return {
          ...prev,
          level: 999,
          exp: 0,
          totalExp: newTotalExp,
          score: prev.score + (earnedExp * 5),
          gamesPlayed: newGamesPlayed,
          dailyExp: updatedDailyExp,
          dailyGames: updatedDailyGames,
          lastActiveDate: today
        };
      }

      let updatedExp = (prev.exp || 0) + earnedExp;
      let newLevel = currentLvl;
      let unlockedBanners = [...(prev.unlockedBanners || ['default'])];

      const bannerUnlocks = {
        5: 'neon-city',
        10: 'matrix-core',
        20: 'cosmic-nebula',
        35: 'solar-flare',
        50: 'abyssal-void',
        75: 'rainbow-aurora',
        100: 'golden-glory',
        999: 'celestial-999'
      };

      // Handle multiple level ups if enough EXP is earned, capped at 999
      while (updatedExp >= newLevel * LEVEL_UP_BASE && newLevel < 999) {
        updatedExp -= (newLevel * LEVEL_UP_BASE);
        newLevel += 1;
        
        if (newLevel >= 999) {
          newLevel = 999;
          updatedExp = 0; // Cap EXP bar at max level
        }

        if (bannerUnlocks[newLevel] && !unlockedBanners.includes(bannerUnlocks[newLevel])) {
          unlockedBanners.push(bannerUnlocks[newLevel]);
        }
      }

      return { 
        ...prev, 
        exp: newLevel >= 999 ? 0 : updatedExp, 
        totalExp: newTotalExp,
        level: newLevel, 
        score: prev.score + (earnedExp * 5),
        unlockedBanners,
        gamesPlayed: newGamesPlayed,
        dailyExp: updatedDailyExp,
        dailyGames: updatedDailyGames,
        lastActiveDate: today
      };
    });
  };
  addExpAndTrackPlayRef.current = addExpAndTrackPlay;

  const setTheme = (theme) => {
    if (typeof theme !== 'string') return;
    setUser(prev => ({ ...prev, currentTheme: theme }));
  };
  const setFrame = (frameId) => {
    if (typeof frameId !== 'string') return;
    setUser(prev => ({ ...prev, currentFrame: frameId }));
  };
  const setCharacter = (charId) => {
    if (typeof charId !== 'string') return;
    setUser(prev => ({ ...prev, currentCharacter: charId }));
  };

  const setFeaturedBadge = (badgeId) => {
    setUser(prev => ({ 
      ...prev, 
      featuredBadgeId: prev.featuredBadgeId === badgeId ? null : badgeId 
    }));
  };

  const handleCosmicEvent = (type) => {
    if (type === 'doge') {
      const alreadyHasDoge = user.unlockedThemes?.includes('doge');
      if (alreadyHasDoge) return;

      setUser(prev => {
        const newThemes = Array.from(new Set([...(prev.unlockedThemes || []), 'doge']));
        const newCharacters = Array.from(new Set([...(prev.unlockedCharacters || ['agent-x']), 'doge']));
        return {
          ...prev,
          unlockedThemes: newThemes,
          unlockedCharacters: newCharacters
        };
      });

      addNotification(
        'SO MUCH WOW',
        'You saw the rare floating Doge! DOGE theme and DOGE avatar unlocked.',
        'success',
        <Star size={14} className="text-amber-400" />
      );
      return;
    }

    if (user.unlockedBadges.includes('stargazer')) return;
    
    setUser(prev => {
      const newBadges = [...prev.unlockedBadges, 'stargazer'];
      const newThemes = [...prev.unlockedThemes];
      if (!newThemes.includes('galaxy')) newThemes.push('galaxy');
      
      return {
        ...prev,
        unlockedBadges: newBadges,
        unlockedThemes: newThemes
      };
    });
    
    addNotification('COSMIC EVENT WITNESSED', 'You saw a HUGE shooting star! STARGAZER badge and GALAXY theme unlocked.', 'badge', <Star size={14} className="mythic-rainbow-text" />, 'rainbow');
  };

  const toggleFriend = (username) => {
    setUser(prev => {
      const isFriend = (prev.friends || []).includes(username);
      const isSent = (prev.sentRequests || []).includes(username);
      
      if (isFriend) {
        // Remove friend
        return { 
          ...prev, 
          friends: (prev.friends || []).filter(f => f !== username) 
        };
      } else if (isSent) {
        // Cancel request
        return { 
          ...prev, 
          sentRequests: (prev.sentRequests || []).filter(r => r !== username) 
        };
      } else {
        // Send request
        addNotification('FRIEND REQUEST', `Friend request sent to ${username}`, 'success', <Users size={14} />);
        return { 
          ...prev, 
          sentRequests: [...(prev.sentRequests || []), username] 
        };
      }
    });
  };

  const acceptFriendRequest = (username) => {
    setUser(prev => ({
      ...prev,
      friendRequests: (prev.friendRequests || []).filter(r => r !== username),
      friends: [...(prev.friends || []), username]
    }));
    addNotification('FRIEND ADDED', `You are now friends with ${username}`, 'success', <Users size={14} />);
  };

  const rejectFriendRequest = (username) => {
    setUser(prev => ({
      ...prev,
      friendRequests: (prev.friendRequests || []).filter(r => r !== username)
    }));
  };

  const updateSettings = (newSettings) => {
    setUser(prev => {
      const updatedSettings = { ...prev.settings, ...newSettings };
      if (newSettings.betaFeatures) {
        updatedSettings.betaFeatures = { ...prev.settings.betaFeatures, ...newSettings.betaFeatures };
      }
      return { ...prev, settings: updatedSettings };
    });
  };

  const redeemCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    const alreadyRedeemed = (user.redeemedCodes || []).some(c => c.toUpperCase() === cleanCode);

    if (alreadyRedeemed && cleanCode !== 'CODES211') {
      return { success: false, message: 'DECRYPTION KEY ALREADY USED' };
    }

    if (cleanCode === 'ADMIN6') {
      const role = 'MODERATOR';
      const updatedRedeemedCodes = Array.from(new Set([...(user.redeemedCodes || []), 'ADMIN6']));
      const updatedUnlockedThemes = Array.from(new Set([...(user.unlockedThemes || []), 'tester']));
      const updatedUnlockedFrames = Array.from(new Set([...(user.unlockedFrames || []), 'moderator', 'tester']));
      const updatedUnlockedBadges = Array.from(new Set([...(user.unlockedBadges || []), 'tester-badge']));
      
      const updateAdminEnrollment = async () => {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          await updateDoc(userRef, {
            redeemedCodes: updatedRedeemedCodes,
            unlockedThemes: updatedUnlockedThemes,
            unlockedFrames: updatedUnlockedFrames,
            unlockedBadges: updatedUnlockedBadges,
            currentFrame: 'moderator',
            currentTheme: 'tester',
            isAdmin: true,
            role: role,
            lastSeen: serverTimestamp()
          });
          
          await setDoc(doc(db, 'admins', firebaseUser.uid), {
            email: firebaseUser.email,
            role: role,
            addedAt: serverTimestamp()
          }, { merge: true });
          
          console.log('Successfully enrolled admin!');
        } catch (err) {
          console.error('Admin enrollment failed:', err);
        }
      };

      setUser(prev => ({
        ...prev,
        isAdmin: true,
        role: role,
        unlockedThemes: updatedUnlockedThemes,
        unlockedFrames: updatedUnlockedFrames,
        unlockedBadges: updatedUnlockedBadges,
        currentFrame: 'moderator',
        currentTheme: 'tester',
        redeemedCodes: updatedRedeemedCodes
      }));

      if (firebaseUser) {
        updateAdminEnrollment();
      }
      addNotification('MODERATOR ACCESS GRANTED', 'WELCOME, MODERATOR', 'system', <Hammer className="text-blue-500" />);
      return { success: true, message: 'MODERATOR PROTOCOL ACTIVATED: SYSTEM RECONSTRUCTED & TESTER ITEMS SYNCED' };
    }

    if (cleanCode === 'OWNER3413') {
      const role = 'OWNER';
      const allThemes = ['cyan', 'emerald', 'violet', 'cobalt', 'gold', 'fire', 'galaxy', 'hologram', 'rainbow', 'ironman', 'spongebob', 'owner', 'synthwave', 'kanye', 'tester', 'usa', 'glitch', 'doge', 'void'];
      const allFrames = ['moderator', 'obsidian', 'default', 'neon', 'solar', 'interstellar', 'glitch', 'hologram', 'deep-sea', 'owner', 'diamond', 'cyberpunk', 'matrix', 'tester', 'usa'];
      const allChars = CHARACTERS.map(c => c.id);
      const allBadges = Array.from(new Set([...BADGES.map(b => b.id), 'stargazer']));
      const allCodes = ['GLITCH', 'RAINBOW', 'SPONGEBOB', 'PINEAPPLE', 'HOLOGRAM', 'JARVIS', '9XISBACK', 'ADMIN6', 'IMAGENIUS', 'TESTER9832', 'OWNER3413', 'CODES211', 'MERICA', 'CLASSROOM9X'];
      
      const updatedRedeemedCodes = Array.from(new Set([...(user.redeemedCodes || []), ...allCodes]));
      const updatedUnlockedThemes = Array.from(new Set([...(user.unlockedThemes || []), ...allThemes]));
      const updatedUnlockedFrames = Array.from(new Set([...(user.unlockedFrames || []), ...allFrames]));
      const updatedUnlockedCharacters = Array.from(new Set([...(user.unlockedCharacters || []), ...allChars]));
      const updatedUnlockedBadges = Array.from(new Set([...(user.unlockedBadges || []), ...allBadges]));
      const nextScore = Math.max(user.score, 999999);

      const updateOwnerEnrollment = async () => {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
           await updateDoc(userRef, {
            level: 999,
            isAdmin: true,
            role: role,
            redeemedCodes: updatedRedeemedCodes,
            unlockedThemes: updatedUnlockedThemes,
            unlockedFrames: updatedUnlockedFrames,
            unlockedCharacters: updatedUnlockedCharacters,
            unlockedBadges: updatedUnlockedBadges,
            currentTheme: 'owner',
            currentFrame: 'owner',
            currentCharacter: 'owner',
            img: 'https://styles.redditmedia.com/t5_bp2vj4/styles/profileIcon_c4myk79c495d1.png?width=256&height=256&frame=1&auto=webp&crop=256:256,smart&s=269d44883cc4c673f2b47c1e178b2f8de500e331',
            score: nextScore,
            lastSeen: serverTimestamp()
          });

          await setDoc(doc(db, 'admins', firebaseUser.uid), {
            email: firebaseUser.email,
            role: role,
            addedAt: serverTimestamp()
          }, { merge: true });

          console.log('Successfully enrolled owner!');
        } catch (err) {
          console.error('Owner enrollment failed:', err);
        }
      };

      setUser(prev => ({
        ...prev,
        level: 999,
        isAdmin: true,
        role: role,
        redeemedCodes: updatedRedeemedCodes,
        unlockedThemes: updatedUnlockedThemes,
        unlockedFrames: updatedUnlockedFrames,
        unlockedCharacters: updatedUnlockedCharacters,
        unlockedBadges: updatedUnlockedBadges,
        currentTheme: 'owner',
        currentFrame: 'owner',
        currentCharacter: 'owner',
        img: 'https://styles.redditmedia.com/t5_bp2vj4/styles/profileIcon_c4myk79c495d1.png?width=256&height=256&frame=1&auto=webp&crop=256:256,smart&s=269d44883cc4c673f2b47c1e178b2f8de500e331',
        score: nextScore
      }));

      if (firebaseUser) {
        updateOwnerEnrollment();
      }
      addNotification('ADMIN ACCESS GRANTED', 'WELCOME BACK, OWNER', 'system', <Crown className="text-theme" />);
      return { success: true, message: 'OWNER PROTOCOL ACTIVATED: EVERYTHING UNLOCKED' };
    }

    if (cleanCode === 'CODES211') {
      setQuests(prev => prev.map(q => ({ ...q, progress: q.target, isCompleted: true })));
      addNotification('Daily Override', 'ALL DAILY OBJECTIVES COMPLETED', 'system', <Zap className="text-theme" />);
      return { success: true, message: 'OVERRIDE SUCCESSFUL: DAILY QUESTS COMPLETED' };
    }

    if (cleanCode === 'GLITCH') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'GLITCH'])),
        unlockedFrames: Array.from(new Set([...(prev.unlockedFrames || []), 'glitch'])),
        unlockedCharacters: Array.from(new Set([...(prev.unlockedCharacters || []), 'glitch']))
      }));
      addNotification('Connection Established', 'PROTOCOL: GLITCH EXPANSION LOADED', 'system', <Zap className="text-theme" />);
      return { success: true, message: 'PROTOCOL BREACH: GLITCH CHARACTER ACQUIRED' };
    }

    if (cleanCode === 'RAINBOW') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'RAINBOW'])),
        unlockedThemes: Array.from(new Set([...prev.unlockedThemes, 'rainbow']))
      }));
      addNotification('Connection Established', 'PROTOCOL: SPECTRUM MODE ACTIVE', 'system', <Palette className="text-theme" />);
      return { success: true, message: 'PROTOCOL INITIATED: SPECTRUM MODE UNLOCKED' };
    }

    if (cleanCode === 'SPONGEBOB' || cleanCode === 'PINEAPPLE') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'SPONGEBOB', 'PINEAPPLE'])),
        unlockedThemes: Array.from(new Set([...prev.unlockedThemes, 'spongebob'])),
        unlockedCharacters: Array.from(new Set([...(prev.unlockedCharacters || []), 'spongebob']))
      }));
      addNotification('Connection Established', 'PROTOCOL: BIKINI BOTTOM LINKED', 'system', <Star className="text-yellow-500" />);
      return { success: true, message: 'WHO LIVES IN A PINEAPPLE UNDER THE SEA? SPONGEBOB THEME & AVATAR UNLOCKED!' };
    }

    if (cleanCode === 'HOLOGRAM') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'HOLOGRAM'])),
        unlockedThemes: Array.from(new Set([...prev.unlockedThemes, 'hologram'])),
        unlockedFrames: Array.from(new Set([...(prev.unlockedFrames || []), 'hologram']))
      }));
      addNotification('Connection Established', 'PROTOCOL: HOLO MATRIX SYNCED', 'system', <Layers className="text-theme" />);
      return { success: true, message: 'VIRTUAL DEPLOYMENT: HOLOGRAM MODULE & FRAME ACTIVATED' };
    }

    if (cleanCode === 'JARVIS') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'JARVIS'])),
        unlockedThemes: Array.from(new Set([...prev.unlockedThemes, 'ironman'])),
        unlockedCharacters: Array.from(new Set([...(prev.unlockedCharacters || []), 'stark']))
      }));
      addNotification('Connection Established', 'PROTOCOL: JARVIS ONLINE', 'system', <Bot className="text-theme" />);
      return { success: true, message: 'WELCOME HOME, SIR: STARK AVATAR UNLOCKED' };
    }

    if (cleanCode === 'MERICA') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'MERICA'])),
        unlockedThemes: Array.from(new Set([...prev.unlockedThemes, 'usa'])),
        unlockedFrames: Array.from(new Set([...(prev.unlockedFrames || []), 'usa'])),
        unlockedCharacters: Array.from(new Set([...(prev.unlockedCharacters || []), 'patriot']))
      }));
      addNotification('Connection Established', 'PROTOCOL: FREEDOM SYNCED', 'system', <Zap className="text-theme" />);
      return { success: true, message: 'PROTOCOL INITIATED: USA THEME, FRAME & PATRIOT AVATAR UNLOCKED' };
    }

    if (cleanCode === '9XISBACK') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), '9XISBACK'])),
        level: prev.level + 100
      }));
      addNotification('Code Redeemed!', 'PROFILE CLEARANCE GRANTED', 'system', <Shield className="text-theme" />);
      return { success: true, message: 'PROFILE CLEARANCE GRANTED: +100 LEVELS' };
    }

    if (cleanCode === 'CLASSROOM9X') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'CLASSROOM9X'])),
        score: prev.score + 100000,
        level: prev.level + 5
      }));
      addNotification('Classroom 9x Access', 'LEGACY PROTOCOL ACTIVATED', 'system', <Crown className="text-theme" />);
      return { success: true, message: '9X PROTOCOL: +100,000 EXP & +5 LEVELS' };
    }

    if (cleanCode === 'IMAGENIUS') {
      const kanyeThemes = ['kanye'];
      const kanyeChars = ['kanye', 'ye-mask'];
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'IMAGENIUS'])),
        unlockedThemes: Array.from(new Set([...prev.unlockedThemes, ...kanyeThemes])),
        unlockedCharacters: Array.from(new Set([...(prev.unlockedCharacters || []), ...kanyeChars])),
      }));
      addNotification('IMAGENIUS ACTIVATED', 'I AM A GOD', 'system', <Star className="text-theme" />);
      return { success: true, message: 'KANYE EXCLUSIVES UNLOCKED: GRADUATION THEME, YE, YE MASK' };
    }

    if (cleanCode === 'TESTER9832') {
      setUser(prev => ({
        ...prev,
        redeemedCodes: Array.from(new Set([...(prev.redeemedCodes || []), 'TESTER9832'])),
        unlockedThemes: Array.from(new Set([...prev.unlockedThemes, 'tester'])),
        unlockedFrames: Array.from(new Set([...(prev.unlockedFrames || []), 'tester'])),
        unlockedBadges: Array.from(new Set([...(prev.unlockedBadges || []), 'tester-badge'])),
      }));
      addNotification('Early Access Granted', 'WELCOME TESTER', 'system', <Trophy className="text-theme" />);
      return { success: true, message: 'EARLY ACCESS ITEMS UNLOCKED: TESTER THEME, TESTER FRAME, TESTER BADGE' };
    }
    return { success: false, message: 'INVALID DECRYPTION KEY' };
  };

  const togglePin = (gameId) => {
    if (typeof gameId !== 'string') return;
    
    if (!firebaseUser) {
      addNotification('Access Locked', 'Sign in to pin your favorite games!', 'error', <Lock className="text-rose-500" />);
      return;
    }

    const currentPinned = user.pinnedGames || [];
    const isAdding = !currentPinned.includes(gameId);
    
    if (isAdding && currentPinned.length >= 7) {
      addNotification('LIMIT REACHED', 'MAX PINNED GAMES REACHED!', 'error', <ShieldAlert className="text-rose-500" />);
      return;
    }
    
    // Perform state update
    setUser(prev => {
      const newPinned = isAdding 
        ? [...new Set([...(prev.pinnedGames || []), gameId])]
        : (prev.pinnedGames || []).filter(id => id !== gameId);
        
      const newFavorites = isAdding
        ? [...new Set([...(prev.favorites || []), gameId])]
        : (prev.favorites || []).filter(id => id !== gameId);

      return { ...prev, favorites: newFavorites, pinnedGames: newPinned };
    });

    // Notify outside of state updater to avoid double triggers in strict mode
    addNotification(
      isAdding ? 'PINNED' : 'UNPINNED',
      isAdding ? 'Added to your quick access.' : 'Removed from your quick access.',
      'success',
      <Pin size={14} className={isAdding ? 'fill-primary text-primary' : 'text-primary'} />
    );
  };

  const handleGameSelect = (game) => {
    setActiveGame(game);
  };

  const handleUpdateUsername = (newName) => {
    if (!firebaseUser) {
      addNotification('Access Locked', 'this feature is locked! Create an account to change your username', 'error', <Lock className="text-rose-500" />);
      return;
    }

    const FORBIDDEN_WORDS = [
      'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'pussy', 'nigger', 'faggot', 'bastard',
      'slut', 'whore', 'cock', 'cum', 'penis', 'vagina', 'porn', 'sex', 'hitler', 'nazi'
    ];
    const cleanName = newName.trim().toLowerCase();
    if (cleanName === 'player') {
      addNotification('System Error', 'CHOOSE A MORE UNIQUE USERNAME', 'error', <ShieldAlert className="text-rose-500" />);
      return;
    }
    if (FORBIDDEN_WORDS.some(word => cleanName.includes(word))) {
      addNotification('System Error', 'INAPPROPRIATE USERNAME DETECTED', 'error', <ShieldAlert className="text-rose-500" />);
      return;
    }
    
    setUser(prev => ({ 
      ...prev, 
      username: newName,
      hasSetProfile: true 
    }));
    addNotification('Identity Updated', `New username: ${newName}`, 'system', <Star className="text-theme" />);
  };

  const handleResetProgress = () => {
    setUser({
      ...DEFAULT_USER,
      username: user.username,
      hasSetProfile: true, // Keep profile status so they don't have to re-enter name
      uid: user.uid 
    });
    setCurrentView(AppRoute.HOME);
    addNotification('System Reset', 'All progress has been erased.', 'error', <Trash2 className="text-rose-500" />);
  };


  const filteredGames = useMemo(() => {
    if (!searchQuery) {
      return [...GAMES_DATA].sort((a, b) => a.title.localeCompare(b.title));
    }
    const query = searchQuery.toLowerCase().trim();
    const queryTokens = query.split(/\s+/).filter(Boolean);
    
    if (queryTokens.length === 0) {
      return [...GAMES_DATA].sort((a, b) => a.title.localeCompare(b.title));
    }

    const scored = (GAMES_DATA || []).map(game => {
      let score = 0;
      const title = game.title.toLowerCase();
      const desc = (game.description || '').toLowerCase();
      const category = (game.category || '').toLowerCase();
      const categories = (game.categories || []).map(c => c.toLowerCase());

      // Exact title match
      if (title === query) score += 1000;
      // Title starts with query
      else if (title.startsWith(query)) score += 500;
      // Title contains full query
      else if (title.includes(query)) score += 200;

      // Token match in title
      queryTokens.forEach(token => {
        if (title.includes(token)) score += 50;
      });

      // Category match
      if (category.includes(query) || categories.some(cat => cat.includes(query))) {
        score += 100;
      }
      queryTokens.forEach(token => {
        if (category.includes(token) || categories.some(cat => cat.includes(token))) {
          score += 20;
        }
      });

      // Description contains full query
      if (desc.includes(query)) score += 10;
      // Token match in description
      queryTokens.forEach(token => {
        if (desc.includes(token)) score += 2;
      });

      return { game, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => {
        // First sort by score (relevance)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Then sort alphabetically
        return a.game.title.localeCompare(b.game.title);
      })
      .map(item => item.game);
  }, [searchQuery]);

  const handleFlameClick = () => {
    if (!user.unlockedThemes.includes('fire')) {
      setUser(prev => ({
        ...prev,
        unlockedThemes: Array.from(new Set([...prev.unlockedThemes, 'fire']))
      }));
      addNotification('Theme Unlocked!', 'You caught a flame! Fire theme unlocked.', 'badge', <Flame className="text-orange-500" />);
    }
  };

  const renderContent = () => {
    if (searchQuery) return <Library games={filteredGames} favorites={user.favorites} pinnedGames={user.pinnedGames} onToggleFavorite={togglePin} onTogglePin={togglePin} onPlayGame={handleGameSelect} lockedGames={lockedGames} />;
    switch (currentView) {
      case AppRoute.CATEGORY: return <CategoryPage categoryId={selectedCategoryId || ''} games={GAMES_DATA} favorites={user.favorites} pinnedGames={user.pinnedGames} onToggleFavorite={togglePin} onTogglePin={togglePin} onPlayGame={handleGameSelect} lockedGames={lockedGames} />;
      case AppRoute.LIBRARY: return <Library games={GAMES_DATA} favorites={user.favorites} pinnedGames={user.pinnedGames} onToggleFavorite={togglePin} onTogglePin={togglePin} onPlayGame={handleGameSelect} lockedGames={lockedGames} />;
      case AppRoute.APPS: 
        return (
          <AppsPage 
            onNavigate={(route) => setCurrentView(route)}
          />
        );
      case AppRoute.SPOTIFY:
        return (
          <SpotifyPage 
            onNavigate={(route) => setCurrentView(route)}
          />
        );
      case AppRoute.CHAT:
        return (
          <GlobalChatPage 
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            onDeleteMessage={deleteChatMessage}
            user={user}
            onlineCount={systemStats.activeUsers}
            onNavigate={handleViewChange}
            onPlayerClick={handleViewProfile}
            onReportAccount={(target) => handleOpenReportModal('account_reported', target)}
            leaderboardData={leaderboardData}
            initialDirectUser={directChatUser}
          />
        );
      case AppRoute.ACCOUNT:
        return (
          <AccountPage 
            user={user}
            firebaseUser={firebaseUser}
            viewingUser={viewingProfileUser}
            onCloseViewingUser={() => setViewingProfileUser(null)}
            leaderboardData={leaderboardData}
            onNavigate={handleViewChange}
            onUpdateUser={setUser}
            addNotification={addNotification}
          />
        );
      case AppRoute.OWNER: {
        const isOwnerUser = isPlatformOwner(user, firebaseUser || auth.currentUser);
        if (!isOwnerUser) {
          return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">Owner Clearance Required</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider max-w-md">This control portal is strictly restricted to the platform owner.</p>
            </div>
          );
        }
        return (
          <OwnerPortalPage 
            user={user}
            firebaseUser={firebaseUser}
            onNavigate={(route) => setCurrentView(route)}
            onTestGame={(game) => handleGameSelect(game)}
            lockedGames={lockedGames}
            countOwnerOnLeaderboard={countOwnerOnLeaderboard}
            onToggleCountOwner={handleToggleCountOwner}
            onUpdateUser={setUser}
            addNotification={addNotification}
            dailyGame={activeDailyGame}
            gamesData={GAMES_DATA}
          />
        );
      }
      case AppRoute.CINEMA:
        return (
          <CineCinemaPage 
            onNavigate={(route) => setCurrentView(route)}
          />
        );
      case AppRoute.STEAM:
      case AppRoute.STREAM:
        return (
          <CineStreamPage 
            onNavigate={(route) => setCurrentView(route)}
            user={user}
          />
        );
      case AppRoute.CODES:
        return (
          <CodesPage 
            user={user} 
            onRedeemCode={redeemCode} 
            addNotification={addNotification} 
          />
        );
      case AppRoute.PROXY: return <ProxyPage />;
      case AppRoute.CUSTOMIZATION:
      case AppRoute.SETTINGS: return <Settings user={user} onUpdateSettings={updateSettings} onSetTheme={setTheme} onRedeemCode={redeemCode} onResetProgress={handleResetProgress} onUpdateUsername={handleUpdateUsername} addNotification={addNotification} />;
      case AppRoute.LEADERBOARD: 
        return <Leaderboard user={user} onPlayerClick={handleViewProfile} leaderboardData={leaderboardData} />;
      default: return (
        <Home 
          user={user} 
          games={GAMES_DATA} 
          dailyPicks={dailyPicks} 
          favorites={user.favorites}
          pinnedGames={user.pinnedGames}
          leaderboardData={leaderboardData}
          boosts={boosts} 
          dailyGame={activeDailyGame}
          gameOfTheWeek={activeDailyGame}
          onToggleFavorite={togglePin}
          onTogglePin={togglePin}
          onPlayGame={handleGameSelect}
          onSwitchToLibrary={() => setCurrentView(AppRoute.LIBRARY)}
          onNavigate={handleViewChange}
          onProfileClick={() => {
            setViewingProfileUser(null);
            handleViewChange(AppRoute.ACCOUNT);
          }}
          onPlayerClick={handleViewProfile}
          onLeaderboardClick={() => setCurrentView(AppRoute.LEADERBOARD)}
          systemStats={systemStats}
          lockedGames={lockedGames}
        />
      );
    }
  };

  const handleSetCustomTheme = (config) => {
    setUser(prev => ({
      ...prev,
      customTheme: config,
      currentTheme: 'custom'
    }));
  };

  const [cloakSequence, setCloakSequence] = useState('');

  const handleToggleCloak = () => {
    if (isCloaked) {
      setIsCloaked(false);
      setIsExitingCloak(true);
      setCloakSequence('');
    } else {
      setIsCloaked(true);
      setIsExitingCloak(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      const tag = e.target?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;

      if (!isInput && !isCloaked) {
        if (e.key === '`' || e.key === '~' || (e.shiftKey && (e.key === 'C' || e.key === 'c'))) {
          e.preventDefault();
          handleToggleCloak();
          return;
        }
      }

      if (e.shiftKey && !isCloaked) {
        if (e.key === '0') {
          const nextSeq = (cloakSequence + '0').slice(-4);
          setCloakSequence(nextSeq);
          if (nextSeq === '0000') {
            e.preventDefault();
            handleToggleCloak();
          }
        } else if (e.key !== 'Shift') {
          setCloakSequence('');
        }
      } else {
        setCloakSequence('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCloaked, cloakSequence]);

  const handleLoadingComplete = React.useCallback(() => {
    setIsInitialLoading(false);
    setIsExitingCloak(false);
    setIsAuthLoading(false);
  }, []);

  const selectPlayerModal = useMemo(() => {
    if (!selectedPlayer) return null;
    return (
      <MiniProfile 
        player={selectedPlayer} 
        onClose={() => setSelectedPlayer(null)} 
        currentUser={user}
        onViewProfile={handleViewProfile}
        onReportAccount={(target) => handleOpenReportModal('account_reported', target)}
        onMessagePlayer={(player) => {
          setSelectedPlayer(null);
          handleViewChange(AppRoute.CHAT, { targetUser: player });
        }}
      />
    );
  }, [selectedPlayer, user]);

  const renderCurrentView = () => {
    return (
      <div id="app-body" className="min-h-screen">
        {/* Global Banners Layer */}
        <div className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none space-y-2 p-4">
          {/* Quota Exhausted Banner */}
          <AnimatePresence>
            {isQuotaExceeded && (
              <motion.div 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-4xl mx-auto bg-rose-500/90 backdrop-blur-3xl border border-rose-400/50 rounded-2xl p-4 flex items-center justify-between shadow-2xl pointer-events-auto overflow-hidden relative group"
              >
                <div className="flex items-center gap-4 relative z-10 text-white">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tighter italic leading-none">DATABASE QUOTA EXCEEDED</h4>
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1 italic">Site state syncing is currently restricted. Normal service resumes at Midnight PT.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsQuotaExceeded(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white relative z-10"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Maintenance Banner */}
          {isMaintenanceMode && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="max-w-4xl mx-auto bg-amber-500/90 backdrop-blur-3xl border border-amber-400/50 rounded-2xl p-4 flex items-center justify-between shadow-2xl pointer-events-auto overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250px_250px] animate-[slide_3s_linear_infinite]" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center text-black">
                  <AlertTriangle size={24} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-black uppercase tracking-tighter italic leading-none">SYSTEM MAINTENANCE</h4>
                  <p className="text-[10px] font-black text-black/60 uppercase tracking-widest mt-1 italic">The site is currently in restricted access mode</p>
                </div>
              </div>
              {user?.isAdmin && (
                <div className="bg-black/10 px-4 py-2 rounded-xl backdrop-blur-md relative z-10">
                  <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] italic">ADMIN BYPASS ACTIVE</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Global Announcement Banner */}
          <AnimatePresence>
            {adminAnnouncement && (
              <motion.div 
                initial={{ y: -100, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -50, opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl pointer-events-auto relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-theme/20 via-transparent to-theme/20 opacity-30" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                      {(() => {
                        const character = CHARACTERS.find(c => c.id === adminAnnouncement.sender.characterId);
                        if (character?.img) {
                          return (
                            <img 
                              src={character.img} 
                              alt="" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          );
                        } else {
                          const Icon = character?.icon || User;
                          return <Icon size={24} className="text-white/40" />;
                        }
                      })()}
                    </div>
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">{adminAnnouncement.sender.username}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] italic">{adminAnnouncement.announcementType} BROADCAST</span>
                     </div>
                     <p className="text-lg font-black text-white tracking-tight italic leading-tight">{adminAnnouncement.text}</p>
                  </div>
                  <button 
                    onClick={handleCloseAnnouncement}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/20 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {user.isBanned ? (
            <div key="banned" className="fixed inset-0 z-[10000] bg-black flex items-center justify-center p-6">
              <div className="text-center font-black text-rose-500 uppercase tracking-widest">
                <h1 className="text-6xl mb-4 italic">ACCESS DENIED</h1>
                <p className="text-white/40">You have been permanently banned from Classroom 9X.</p>
              </div>
            </div>
          ) : isMaintenanceMode && !user.isAdmin ? (
            <motion.div 
              key="maintenance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-[#020617] flex items-center justify-center p-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-500/5 blur-[100px] animate-pulse"></div>
              <div className="max-w-xl w-full p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl text-center relative">
                <div className="w-24 h-24 bg-rose-500/20 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-8 border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
                  <ShieldAlert size={48} />
                </div>
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">SITE UNDER <br /><span className="text-rose-500">MAINTENANCE</span></h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] mb-12 italic leading-relaxed">
                  Classroom 9X is currently undergoing scheduled updates. <br />The site will be back up soon. Come back later!
                </p>
                <button 
                   onClick={handleLogin}
                   className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-rose-500 hover:text-white transition-all italic shadow-2xl"
                >
                  ADMIN LOGIN
                </button>
              </div>
            </motion.div>
          ) : isCloaked ? (
            <EducationalCloak key="cloak" onToggleCloak={handleToggleCloak} />
          ) : isInitialLoading || isExitingCloak ? (
            <LoadingScreen key="loading" onComplete={handleLoadingComplete} onCosmicEvent={handleCosmicEvent} />
          ) : (
            <motion.div 
              key="main-app"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -15 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full min-h-screen proto-shell theme-${user.currentTheme} ${isModalOpen ? 'modal-active' : ''} ${user.settings.customCursor ? 'custom-cursor-active' : ''}`}
            >
              <div className="proto-backdrop transition-opacity duration-1000 opacity-100" />
        <div className="proto-grid transition-opacity duration-1000 opacity-100" />
        
        {/* Pinned Games Global Overlay */}
        {pinnedGamesList.length > 0 && (
          <div className="fixed top-10 right-10 z-[100] flex flex-col items-end gap-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsPinnedMinimized(!isPinnedMinimized)}
              className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-2xl pointer-events-auto cursor-pointer hover:bg-white/10 transition-all group"
            >
              <Pin size={14} className="text-white fill-white group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">PINNED ACCESS</span>
              {isPinnedMinimized ? <ChevronRight size={14} className="text-white/40" /> : <X size={14} className="text-white/40" />}
            </motion.div>
            <AnimatePresence>
              {!isPinnedMinimized && (
                <motion.div 
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  className="flex flex-col gap-3 pointer-events-auto"
                >
                  {pinnedGamesList.slice(0, 6).map(game => (
                    <motion.button
                      key={game.id}
                      whileHover={{ scale: 1.05, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleGameSelect(game)}
                      className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group"
                    >
                      <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <Play size={16} fill="currentColor" className="text-white ml-0.5" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {<InteractiveBackground user={user} enabled={!user.settings.performanceMode} />}
        {user.settings.customCursor && <CustomCursor />}
        
          <div className="proto-content-shell">
          <div className="min-h-screen transition-colors duration-1000 bg-background/40 text-white font-inter selection:bg-theme selection:text-black overflow-x-hidden">
            {/* Background Effects */}
            {isMatrixRain && !user.settings.performanceMode && <MatrixRain performanceMode={user.settings.performanceMode} />}
            {isRainbowChaos && <div className="rainbow-chaos-overlay" />}
            
            <div className={`relative z-10 ${isGravityChaos ? 'gravity-chaos-active' : ''}`}>
              <Layout 
                user={user}
                onSearch={setSearchQuery} 
                onSetTheme={(theme) => setUser(prev => ({ ...prev, currentTheme: theme }))}
                currentView={currentView}
                selectedCategoryId={selectedCategoryId}
                onViewChange={handleViewChange}
                onProfileClick={() => {
                  setViewingProfileUser(null);
                  handleViewChange(AppRoute.ACCOUNT);
                }}
                onLogin={handleLogin}
                onLogout={handleLogout}
                firebaseUser={firebaseUser}
                onlineCount={systemStats.activeUsers}
              >
                <>
                  {user.isBanned && (
                    <div key="banned-overlay" className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-8 text-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md space-y-8"
                      >
                        <div className="w-24 h-24 bg-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 border border-rose-500/20 mx-auto shadow-[0_0_50px_rgba(244,63,94,0.3)]">
                          <Shield size={48} />
                        </div>
                        <div className="space-y-4">
                          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Account <span className="text-rose-500">Restricted</span></h1>
                          <p className="text-white/40 font-medium leading-relaxed uppercase text-[10px] tracking-widest text-center">Your access has been restricted by an administrator. Please contact support if you think this is a mistake.</p>
                        </div>
                        <div className="pt-8 border-t border-white/5">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Status: Suspended</p>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {renderContent()}
                </>
              </Layout>
            </div>
          </div>
        </div>

        <div key="notifications-container" className="fixed bottom-8 right-8 z-[2000] flex flex-col-reverse gap-3 pointer-events-none w-80">
          <AnimatePresence mode="popLayout">
            {notifications.map(n => (
              <motion.div 
                key={n.id} 
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                className="group relative flex flex-col p-5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden transition-all hover:bg-black/80 hover:border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 shrink-0 ${
                    n.type === 'error' ? 'text-rose-500 bg-rose-500/10' : 
                    n.type === 'success' ? 'text-emerald-500 bg-emerald-500/10' : 
                    'text-cyan-500 bg-cyan-500/10'
                  }`}>
                    {n.icon || <Zap size={18} />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] truncate italic">{n.title || 'SYSTEM'}</p>
                    <p className="text-xs font-black text-white tracking-tight uppercase italic leading-tight">{n.message}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                    className="p-1 text-white/20 hover:text-white transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <div className="absolute bottom-0 left-0 h-1 bg-white/[0.02] w-full">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className={`h-full ${
                      n.type === 'error' ? 'bg-rose-500' : 
                      n.type === 'success' ? 'bg-emerald-500' : 
                      'bg-cyan-500'
                    } shadow-[0_0_15px_currentColor]`}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* Modals outside effect containers */}
        {activeGame && (
          <GameModal 
            game={activeGame} 
            isFavorite={(user.pinnedGames || []).includes(activeGame.id)} 
            onToggleFavorite={togglePin} 
            onClose={() => setActiveGame(null)} 
            lockInfo={lockedGames[activeGame.id]}
            isOwner={isPlatformOwner(user, firebaseUser || auth.currentUser)}
          />
        )}
        {playingGame && (
          <GameView 
            game={playingGame} 
            onClose={() => setPlayingGame(null)} 
            onReportGame={(game) => handleOpenReportModal('game_broken', game)}
          />
        )}
        
        {/* Global Announcement 10s Broadcast Overlay */}
        {broadcastAnnouncement && (
          <AnnouncementBroadcastModal
            announcement={broadcastAnnouncement}
            durationSeconds={10}
            onClose={() => setBroadcastAnnouncement(null)}
          />
        )}

        {/* Global Reporting Modal */}
        <ReportModal
          isOpen={reportModalData.isOpen}
          onClose={handleCloseReportModal}
          type={reportModalData.type}
          target={reportModalData.target}
          currentUser={user}
          firebaseUser={firebaseUser}
          onSuccess={() => {
            addNotification('Report Submitted', 'Your report has been sent to the owner portal for review.', 'success');
          }}
        />
        {isProfileModalOpen && (
          <ProfileModal 
            user={user} 
            firebaseUser={firebaseUser}
            isSuperAdmin={isPlatformOwner(user, firebaseUser || auth.currentUser)}
            onUpdateUser={setUser}
            onClose={() => setIsProfileModalOpen(false)} 
            onOpenAccount={() => {
              setIsProfileModalOpen(false);
              setCurrentView(AppRoute.ACCOUNT);
            }}
            onLogout={() => {
              safeLocalStorageRemove('classroom9x_local_profile_v4');
              window.location.reload();
            }}
          />
        )}
        
        {showBoss && (
          <BossEvent onDefeat={() => {
            setShowBoss(false);
            setUser(prev => ({ ...prev, score: prev.score + 500000 }));
            addNotification('VICTORY', 'VOID BOSS DEFEATED! +1,000,000 EXP FOR EVERYONE!', 'success', <Trophy className="text-amber-400" />);
          }} />
        )}
        {showBadgeRain && user.settings.backgroundEffects && (
          <StarRain onCollect={() => {
            setUser(prev => ({ ...prev, score: prev.score + 25000 }));
            addNotification('STAR COLLECTED', `+25,000 EXP! Catch them all!`, 'success', <Star className="text-amber-400" />);
          }} />
        )}
        {showExpRain && user.settings.backgroundEffects && (
          <ExpRain onCollect={(amount) => {
            setUser(prev => ({ ...prev, score: prev.score + amount }));
            addNotification('EXP COLLECTED', `+${amount} EXP!`, 'success', <Zap size={14} className="text-cyan-400" />);
          }} />
        )}

        {isFireStorm && (
          <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-red-600/20 to-transparent animate-pulse"
            />
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: window.innerHeight + 20, 
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  y: -100,
                  scale: [0, 1.5, 1, 0],
                  opacity: [0, 1, 0.5, 0],
                  x: (Math.random() - 0.5) * 300 + (Math.random() * window.innerWidth)
                }}
                transition={{ 
                  duration: 1.5 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{ color: Math.random() > 0.5 ? '#f97316' : '#ef4444' }}
              >
                <Flame size={16 + Math.random() * 32} className="animate-pulse" />
              </motion.div>
            ))}
          </div>
        )}

        {isRainbowChaos && (
          <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-green-500/20 to-blue-500/20 animate-[rainbow-bg_5s_linear_infinite] blur-[100px]"
            />
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: -20, 
                  scale: 0,
                  rotate: 0,
                  color: `hsl(${Math.random() * 360}, 100%, 50%)`
                }}
                animate={{ 
                  y: window.innerHeight + 20,
                  scale: [0, 1, 1, 0],
                  rotate: 360,
                  x: (Math.random() - 0.5) * 200 + (Math.random() * window.innerWidth)
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
                className="absolute text-2xl"
              >
                <Palette size={24 + Math.random() * 24} />
              </motion.div>
            ))}
          </div>
        )}

        {isVoidStorm && (
          <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden bg-purple-950/20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0.2, 0.5, 0] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 bg-white/5"
            />
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 4, 0],
                  opacity: [0, 0.3, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut"
                }}
                className="absolute text-purple-500/30"
              >
                <Ghost size={100 + Math.random() * 200} />
              </motion.div>
            ))}
          </div>
        )}

        {isSystemOverload && (
          <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                backgroundColor: ['rgba(245,158,11,0)', 'rgba(245,158,11,0.1)', 'rgba(245,158,11,0)']
              }}
              transition={{ duration: 0.1, repeat: Infinity }}
              className="absolute inset-0"
            />
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 1000 + (Math.random() * window.innerWidth),
                  y: (Math.random() - 0.5) * 1000 + (Math.random() * window.innerHeight)
                }}
                transition={{ 
                  duration: 0.5 + Math.random() * 1,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "circOut"
                }}
                className="absolute text-amber-500"
              >
                <Zap size={20 + Math.random() * 40} />
              </motion.div>
            ))}
          </div>
        )}

        {isGoldenHour && (
          <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-yellow-500/10"
            />
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: -20, 
                  scale: 0,
                  rotate: 0
                }}
                animate={{ 
                  y: window.innerHeight + 20,
                  scale: [0, 1, 1, 0],
                  rotate: 720,
                  x: (Math.random() - 0.5) * 100 + (Math.random() * window.innerWidth)
                }}
                transition={{ 
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 10,
                  ease: "linear"
                }}
                className="absolute text-yellow-400"
              >
                <Star size={16 + Math.random() * 16} fill="currentColor" />
              </motion.div>
            ))}
          </div>
        )}

        {selectPlayerModal}
        
        <AnimatePresence>
          {isAuthPortalOpen && (!firebaseUser || firebaseUser.isAnonymous) && (
            <AuthPortal 
              isOpen={isAuthPortalOpen} 
              isFirstTime={isFirstTimeVisitor}
              onClose={() => {
                setIsAuthPortalOpen(false);
                setIsFirstTimeVisitor(false);
              }} 
              addNotification={addNotification} 
            />
          )}
        </AnimatePresence>

        {/* Global SVG Gradients for Badges */}
        <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden' }}>
          <defs>
            <linearGradient id="mythic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ff0000' }} />
              <stop offset="14%" style={{ stopColor: '#ff7f00' }} />
              <stop offset="28%" style={{ stopColor: '#ffff00' }} />
              <stop offset="42%" style={{ stopColor: '#00ff00' }} />
              <stop offset="57%" style={{ stopColor: '#0000ff' }} />
              <stop offset="71%" style={{ stopColor: '#4b0082' }} />
              <stop offset="85%" style={{ stopColor: '#9400d3' }} />
              <stop offset="100%" style={{ stopColor: '#ff0000' }} />
            </linearGradient>
            <radialGradient id="transcendent-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{ stopColor: '#ffd700' }} />
              <stop offset="30%" style={{ stopColor: '#ff8c00' }} />
              <stop offset="60%" style={{ stopColor: '#4b0082' }} />
              <stop offset="100%" style={{ stopColor: '#000000' }} />
            </radialGradient>
          </defs>
        </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return renderCurrentView();
};

export default App;
