import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { ChevronRight, Sparkles } from 'lucide-react';

export const LoadingScreen = ({ onComplete, onCosmicEvent }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stage, setStage] = useState('initializing');
  const [isWarping, setIsWarping] = useState(false);
  const [hasDoge, setHasDoge] = useState(false);

  useEffect(() => {
    // 1% chance roll for doge
    const roll = Math.random() < 0.01;
    if (roll) {
      setHasDoge(true);
    }
  }, []);
  
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const warpSpeedRef = useRef(1);
  const progressRef = useRef(0);
  const hasSpawnedHugeStarRef = useRef(false);

  // Setup Starfield Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars only once to avoid jumping positions when effect re-triggers
    if (starsRef.current.length === 0) {
      const starCount = 250;
      const initStars = [];
      const baseW = window.innerWidth || 1200;
      const baseH = window.innerHeight || 800;
      for (let i = 0; i < starCount; i++) {
        initStars.push({
          x: Math.random() * baseW - baseW / 2,
          y: Math.random() * baseH - baseH / 2,
          z: Math.random() * baseW,
          color: `rgba(${200 + Math.random() * 55}, ${220 + Math.random() * 35}, 255, ${0.4 + Math.random() * 0.6})`,
          size: 0.5 + Math.random() * 1.5,
        });
      }
      starsRef.current = initStars;
    }

    // Animation Loop
    const animate = () => {
      // Create a trails look by clearing with semi-transparent background
      const baseAlpha = isWarping ? 0.25 : 0.85;
      ctx.fillStyle = `rgba(3, 4, 7, ${baseAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background glowing ambiance
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 10,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.6
      );
      gradient.addColorStop(0, 'rgba(20, 10, 30, 0.4)');
      gradient.addColorStop(0.5, 'rgba(8, 4, 15, 0.15)');
      gradient.addColorStop(1, 'rgba(2, 2, 4, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Handle Stars
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const currentWarp = warpSpeedRef.current;

      starsRef.current.forEach((star) => {
        // Move star closer
        star.z -= currentWarp * 1.8;

        // Reset star if it gets past screen boundaries
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - cx;
          star.y = Math.random() * canvas.height - cy;
          star.z = canvas.width;
        }

        // Project coordinate 3D -> 2D
        const px = (star.x / star.z) * cx * 2 + cx;
        const py = (star.y / star.z) * cy * 2 + cy;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / canvas.width) * star.size * 2;
          
          if (isWarping) {
            // Draw warp lines
            const prevZ = star.z + currentWarp * 4.5;
            const ppx = (star.x / prevZ) * cx * 2 + cx;
            const ppy = (star.y / prevZ) * cy * 2 + cy;

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(ppx, ppy);
            ctx.strokeStyle = `rgba(220, 235, 255, ${0.1 + (1 - star.z / canvas.width) * 0.5})`;
            ctx.lineWidth = size * 0.6;
            ctx.stroke();
          } else {
            // Draw point star
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.fill();
            
            // Subtle glow for brighter stars
            if (size > 1.8) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
              ctx.fillStyle = '#ffffff';
              ctx.fill();
              ctx.shadowBlur = 0; // reset
            }
          }
        }
      });

      // Handle Cinematic HUGE Shooting Star Trigger (0.1% chance per frame)
      const currentProgress = progressRef.current;
      if (currentProgress > 35 && currentProgress < 75 && !hasSpawnedHugeStarRef.current && !isWarping && Math.random() < 0.001) {
        hasSpawnedHugeStarRef.current = true;
        shootingStarsRef.current.push({
          x: -500,
          y: Math.random() * (canvas.height * 0.3) + 50,
          len: 3000 + Math.random() * 1000,
          dx: 35 + Math.random() * 8,
          dy: 8 + Math.random() * 3,
          life: 2.0,
          color: 'rgba(255, 223, 100, 1)',
          isHuge: true,
          triggeredEvent: false
        });
      }

      // Handle Regular ambient Shooting Stars (These DO NOT reward stargazer badge)
      if (Math.random() < 0.0035 && shootingStarsRef.current.length < 2 && !isWarping) {
        shootingStarsRef.current.push({
          x: Math.random() * (canvas.width * 0.4),
          y: Math.random() * (canvas.height * 0.3),
          len: 45 + Math.random() * 45,
          dx: 8 + Math.random() * 8,
          dy: 2 + Math.random() * 3,
          life: 1.0,
          color: `rgba(200, 220, 255, 0.8)`,
          isHuge: false
        });
      }

      shootingStarsRef.current.forEach((ss, idx) => {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.len, ss.y - (ss.len * ss.dy / ss.dx));
        
        if (ss.isHuge) {
          grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
          grad.addColorStop(0.15, `rgba(253, 224, 71, ${ss.life * 0.95})`); // Yellow shadow
          grad.addColorStop(0.5, `rgba(244, 63, 94, ${ss.life * 0.6})`);  // Rose flare
          grad.addColorStop(1, 'rgba(124, 58, 237, 0)');                 // Violet tail
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = 55;
          ctx.shadowBlur = 180;
          ctx.shadowColor = 'rgba(253, 224, 71, 1)';
        } else {
          grad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
          grad.addColorStop(0.3, `rgba(147, 197, 253, ${ss.life * 0.7})`);
          grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
        }
        
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.len, ss.y - (ss.len * ss.dy / ss.dx));
        ctx.stroke();

        if (ss.isHuge) {
          ctx.shadowBlur = 0; // reset
        }

        // Update shooting star physics
        ss.x += ss.dx;
        ss.y += ss.dy;
        ss.life -= ss.isHuge ? 0.008 : 0.02; // HUGE star glides majestically and slowly!

        // Trigger stargazing badge only on the HUGE shooting star!
        if (ss.isHuge && !ss.triggeredEvent) {
          ss.triggeredEvent = true;
          if (onCosmicEvent) {
            try { onCosmicEvent(); } catch (e) {}
          }
        }

        if (ss.life <= 0 || ss.x > canvas.width + ss.len || ss.y > canvas.height + ss.len) {
          shootingStarsRef.current.splice(idx, 1);
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isWarping, onCosmicEvent]);

  // Loading ticker simulator
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800; // ~2.8s smooth deterministic beautiful progression

    const updateLoader = () => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / duration);
      
      // Beautiful easeOutCubic curve for visual organic pacing
      const ease = 1 - Math.pow(1 - ratio, 3);
      const nextProgress = ease * 100;
      setProgress(nextProgress);
      progressRef.current = nextProgress;

      if (ratio < 1) {
        requestAnimationFrame(updateLoader);
      } else {
        setProgress(100);
        progressRef.current = 100;
        setStage('ready');
        setTimeout(() => setIsLoaded(true), 150);
      }
    };

    requestAnimationFrame(updateLoader);
  }, []);

  // Handle Konami and Doge sequences
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    let konamiIndex = 0;

    const dogeCode = ['1', '2', '1', '2'];
    let dogeIndex = 0;

    const handleKeyDown = (e) => {
      // Check Konami Code
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          // Trigger easter egg warp speed
          setIsWarping(true);
          warpSpeedRef.current = 18;
          
          // Trigger the huge shooting star visually immediately!
          try {
            shootingStarsRef.current.push({
              x: -500,
              y: Math.random() * (window.innerHeight * 0.3) + 50,
              len: 3000 + Math.random() * 1000,
              dx: 35 + Math.random() * 8,
              dy: 8 + Math.random() * 3,
              life: 2.0,
              color: 'rgba(255, 223, 100, 1)',
              isHuge: true,
              triggeredEvent: false
            });
          } catch (err) {
            console.error('Error spawning huge star:', err);
          }

          if (onCosmicEvent) {
            try { onCosmicEvent(); } catch (err) {}
          }
          
          setTimeout(() => {
            setIsWarping(false);
            warpSpeedRef.current = 1;
          }, 3500);
          
          konamiIndex = 0;
        }
      } else {
        konamiIndex = e.key === 'ArrowUp' ? 1 : 0;
      }

      // Check Doge Code
      if (e.key === dogeCode[dogeIndex]) {
        dogeIndex++;
        if (dogeIndex === dogeCode.length) {
          // Trigger doge loading event
          setHasDoge(true);
          dogeIndex = 0;
        }
      } else {
        dogeIndex = e.key === '1' ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCosmicEvent]);

  // Handle keyboard ENTER to submit when fully loaded
  useEffect(() => {
    if (!isLoaded || stage !== 'ready') return;

    const handleEnterPress = (e) => {
      if (e.key === 'Enter') {
        handleEnter();
      }
    };

    window.addEventListener('keydown', handleEnterPress);
    return () => window.removeEventListener('keydown', handleEnterPress);
  }, [isLoaded, stage]);

  // Handle stage change of warp when user presses ENTER
  const handleEnter = () => {
    setStage('entering');
    setIsWarping(true);
    
    // Accelerate stars to hyperdrive
    let speed = 1;
    const accelInterval = setInterval(() => {
      speed += 1.5;
      warpSpeedRef.current = Math.min(30, speed);
    }, 30);

    setTimeout(() => {
      clearInterval(accelInterval);
      if (onComplete) onComplete();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: stage === 'entering' ? 0 : 1,
        filter: stage === 'entering' ? 'blur(20px)' : 'blur(0px)',
      }}
      transition={{ 
        duration: 1.0, 
        ease: [0.16, 1, 0.3, 1]
      }}
      className="fixed inset-0 z-[99999] bg-[#030407] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* 2D Accelerated Ambient Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
      />

      <AnimatePresence>
        {hasDoge && (
          <motion.img
            src="https://flyclipart.com/thumbs/doge-meme-1690949.png"
            referrerPolicy="no-referrer"
            initial={{ x: '-150vw', y: '25vh', rotate: 0 }}
            animate={{ x: '150vw', y: '-25vh', rotate: 360 }}
            transition={{ duration: 7, ease: 'linear' }}
            className="absolute w-36 h-36 z-[999999] pointer-events-none select-none opacity-90"
            onAnimationComplete={() => {
              if (onCosmicEvent) {
                try {
                  onCosmicEvent('doge');
                } catch (e) {
                  console.error('Error triggering doge cosmic event:', e);
                }
              }
              setHasDoge(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cinematic Vignette Inner Frame Shadow */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,2,4,0.85)_100%)]" />

      {/* Main Content Layout Container */}
      <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center justify-between h-full py-24 pointer-events-none">
        {/* Top Space Filler (to balance beautiful vertical rhythm) */}
        <div className="w-full h-8" />

        {/* Center Title Showcase Section */}
        <div className="flex flex-col items-center gap-6 w-full my-auto">
          <div className="relative flex flex-col items-center">
            {/* Ambient Background Glowing Orb behind title */}
            <div className="absolute -inset-10 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
            
            {/* Spinning Brand Logo */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mb-8 text-white relative flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
            >
              <Logo className="w-full h-full" />
            </motion.div>

            <div className="flex items-center justify-center">
              <span className="text-5xl md:text-6xl font-black italic uppercase text-white tracking-[0.35em] font-sans drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] select-none">
                CINE
              </span>
            </div>

            {/* Microscopic Elegance Line */}
            <div className="h-[1px] w-36 bg-gradient-to-r from-transparent via-white/20 to-transparent mt-8" />
          </div>

          {/* Interactive Portal Display Button or Progress */}
          <div className="w-full max-w-xs flex flex-col items-center gap-8 min-h-[100px] justify-center">
            <AnimatePresence mode="wait">
              {!isLoaded ? (
                <motion.div 
                  key="loader-view"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="w-full flex justify-between items-end px-1">
                    <span className="text-[9px] font-black text-white/40 tracking-[0.3em] uppercase italic animate-pulse">
                      {progress < 40 ? 'LOADING DATABASE' : progress < 85 ? 'PREPARING CORE INTERFACE' : 'SYSTEM READY'}
                    </span>
                    <span className="text-[10px] font-black text-white/50 tracking-widest font-mono select-none">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  {/* Microscopic Load Meter */}
                  <div className="w-full h-[4px] bg-white/[0.04] relative rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div 
                      style={{ width: `${progress}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="enter-view"
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex items-center justify-center text-center"
                >
                  <button
                    onClick={handleEnter}
                    disabled={stage === 'entering'}
                    className="pointer-events-auto group relative mx-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-amber-500/20 border-2 border-white/20 hover:border-cyan-400/80 backdrop-blur-2xl text-white font-black text-xs uppercase italic tracking-widest transition-all duration-300 shadow-[0_0_35px_rgba(59,130,246,0.35)] hover:shadow-[0_0_55px_rgba(168,85,247,0.6)] cursor-pointer active:scale-95 flex items-center justify-center gap-2 overflow-hidden text-center"
                  >
                    {/* Ambient glow inside button */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                      <span>ENTER CINE</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-cyan-300" />
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Minimalist Spacer */}
        <div className="w-full h-8" />
      </div>
    </motion.div>
  );
};
