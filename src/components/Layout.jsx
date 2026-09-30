import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { House, Gamepad2, LayoutGrid, Globe, Shield, Palette, Settings as SettingsIcon, User, Users, Music, Key, Waves } from 'lucide-react';
import { AppRoute } from '../constants'; // Changed from types to constants
import { FPSCounter } from './FPSCounter';
import { Sidebar } from './Sidebar';

const WaveTransition = ({ isVisible }) => (
  <AnimatePresence mode="wait">
    {isVisible && (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '-130%' }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.65, 0, 0.35, 1] 
        }}
        className="fixed inset-0 z-[1000] pointer-events-none"
      >
        {/* Main Water Body */}
        <div className="absolute inset-x-0 top-0 h-[100vh] bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent flex flex-col justify-center items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1.2, opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3, type: "spring" }}
              className="flex flex-col items-center gap-2"
            >
               <Waves className="text-white w-16 h-16 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
               <span className="text-[14px] font-black tracking-[1.5em] text-white italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] ml-4">SPLASH!</span>
            </motion.div>
        </div>

        {/* Wave Head */}
        <div className="absolute top-0 inset-x-0 h-48 -translate-y-full">
           <svg viewBox="0 0 800 200" className="w-full h-full fill-cyan-400" preserveAspectRatio="none">
             <path d="M 0 100 C 150 -50 250 250 400 100 C 550 -50 650 250 800 100 V 200 H 0 Z" />
           </svg>
        </div>
        
        {/* Secondary Foam Layer */}
        <div className="absolute top-0 inset-x-0 h-40 -translate-y-full opacity-70">
           <svg viewBox="0 0 800 200" className="w-full h-full fill-white" preserveAspectRatio="none">
             <path d="M 0 100 C 100 180 300 20 400 100 C 500 180 700 20 800 100 V 200 H 0 Z" />
           </svg>
        </div>

        {/* Splash Drops - More explosive */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: '50vw', y: '100vh' }}
            animate={{ 
              scale: [0, 2.5, 0],
              x: `${Math.random() * 100}vw`,
              y: '-30vh'
            }}
            transition={{ 
              duration: 0.5 + Math.random() * 0.3, 
              delay: i * 0.02,
              ease: "easeOut"
            }}
            className="absolute w-12 h-12 bg-white/50 rounded-full blur-xl shadow-2xl"
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

export const Layout = ({ 
  children, 
  onSearch, 
  onSetTheme, 
  currentView, 
  selectedCategoryId,
  onViewChange, 
  onProfileClick,
  onLogin,
  onLogout,
  firebaseUser,
  user,
  onlineCount
}) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showWave, setShowWave] = useState(false);
  const [prevView, setPrevView] = useState(currentView);

  // Initialize sidebar state once user settings are available
  const settingsInitialized = React.useRef(false);
  useEffect(() => {
    if (user?.settings && !settingsInitialized.current) {
      setIsSidebarExpanded(!user.settings.sidebarAutoHide);
      settingsInitialized.current = true;
    }
  }, [user?.settings]);

  useEffect(() => {
    if (user?.uid && user?.settings) {
       // Allow dynamic updates if setting changes
       setIsSidebarExpanded(!user.settings.sidebarAutoHide);
    }
  }, [user?.settings?.sidebarAutoHide]);

  useEffect(() => {
    setPrevView(currentView);
  }, [currentView]);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // Use 1600px as the target desktop width for "perfect" fit
      // If screen is smaller, we scale down everything proportionally
      // We only scale between 1024px and 1600px for desktop-ish views
      if (window.innerWidth >= 1024 && window.innerWidth < 1600) {
        setScale(window.innerWidth / 1600);
      } else {
        setScale(1);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: AppRoute.HOME, icon: House, label: 'Home', isReleased: true },
    { id: AppRoute.LIBRARY, icon: Gamepad2, label: 'Games', isReleased: true },
    { id: AppRoute.APPS, icon: LayoutGrid, label: 'Apps', isReleased: true },
    { id: AppRoute.CODES, icon: Key, label: 'Codes', isReleased: true },
    { id: AppRoute.PROXY, icon: Globe, label: 'Proxy', isReleased: true },
    { id: AppRoute.SETTINGS, icon: SettingsIcon, label: 'Config', isReleased: true },
  ].filter(item => {
    if (user?.settings?.hideUnreleased && item.isReleased === false) return false;
    return true;
  });

  const isPotatoMode = user?.settings?.performanceMode;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white font-sans relative overflow-x-hidden">
      <WaveTransition isVisible={showWave} />
      
        {/* Global Sidebar - Stays OUTSIDE scaling wrapper for total stability */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Sidebar 
            user={user}
            currentView={currentView}
            onViewChange={onViewChange}
            onProfileClick={onProfileClick}
            onLogin={onLogin}
            onLogout={onLogout}
            firebaseUser={firebaseUser}
            isExpanded={isSidebarExpanded}
            onToggleExpand={setIsSidebarExpanded}
            onlineCount={onlineCount}
          />
        </div>
      </div>

      {/* Scaling Content Wrapper */}
      <div 
        style={scale !== 1 ? {
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: `${100 / scale}%`,
          marginLeft: `${(1 - 1 / scale) * 50}%`,
        } : {}}
        className="min-h-screen"
      >
        {/* Global Background Effects */}
        {user?.settings?.backgroundEffects && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.02),transparent_70%)]"></div>
            
            {!isPotatoMode && (
              <>
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-white/[0.01] rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-white/[0.01] rounded-full blur-[80px]"></div>
              </>
            )}
            
            {!isPotatoMode && (
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
            )}
          </div>
        )}

        {/* Main Content Shell */}
        <motion.main 
          initial={false}
          animate={{
            paddingLeft: window.innerWidth >= 1024 
              ? (isSidebarExpanded ? '316px' : '120px') 
              : 0
          }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 min-h-screen pb-24 lg:pb-0"
        >
          <div className="max-w-[140rem] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 15, scale: 0.99, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -15, scale: 0.99, filter: 'blur(10px)' }}
                transition={{ 
                  duration: isPotatoMode ? 0.2 : 0.5, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className="w-full h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </div>

      {/* FIXED HUD ELEMENTS - STAY OUTSIDE SCALING WRAPPER */}
      {/* Mobile Bottom Navigation (Dock) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-2 flex items-center justify-around shadow-2xl overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => (
            <MobileNavItem 
              key={item.id}
              icon={<item.icon size={20} />} 
              label={item.label} 
              active={currentView === item.id} 
              onClick={() => onViewChange(item.id)} 
            />
          ))}
          <MobileNavItem 
            key="profile-mobile"
            icon={<User size={20} />} 
            label="Profile" 
            active={false} 
            onClick={onProfileClick} 
          />
        </motion.nav>
      </div>

      {/* FPS Widget */}
      {user?.settings?.showFPS && (
        <div key="fps-widget" className={`fixed bottom-6 z-[100] hidden md:block transition-all duration-500 ${user?.isAdmin ? 'right-28' : 'right-6'}`}>
          <FPSCounter />
        </div>
      )}
    </div>
  );
};

const MobileNavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 min-w-[64px] ${
      active ? 'text-primary' : 'text-white/40 hover:text-white/60'
    }`}
  >
    {active && (
      <motion.div 
        layoutId="mobile-active-pill"
        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl -z-10"
      />
    )}
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
