import React from 'react';
import { PROFILE_BANNERS } from '../constants';

export const BannerDisplay = ({ 
  banner, 
  className = '', 
  compact = false, 
  showMetaBadge = false,
  children 
}) => {
  // Resolve banner object
  const bannerObj = typeof banner === 'string'
    ? PROFILE_BANNERS.find(b => b.id === banner) || PROFILE_BANNERS[0]
    : banner || PROFILE_BANNERS[0];

  const bannerId = bannerObj?.id || 'default';
  const level = bannerObj?.level || 1;
  const isElite = level >= 100;

  // Render specific animated themes for Level 100+
  const renderBannerGraphics = () => {
    switch (bannerId) {
      /* =========================================================================
         LEVEL 100: GOLDEN SOVEREIGN (Regal 24K Gold, Sunburst, Floating Sparkles)
         ========================================================================= */
      case 'golden-glory':
        return (
          <div className="absolute inset-0 banner-gold-shimmer overflow-hidden pointer-events-none">
            {/* Ambient Radial Golden Corona */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(254,240,138,0.35),transparent_70%)]" />
            
            {/* Rotating Sunburst Rays */}
            <div 
              className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] opacity-20"
              style={{ animation: 'goldRaySpin 45s linear infinite' }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full text-yellow-200 fill-current">
                {[...Array(16)].map((_, i) => (
                  <polygon 
                    key={i} 
                    points="200,200 190,0 210,0" 
                    transform={`rotate(${i * 22.5} 200 200)`} 
                  />
                ))}
              </svg>
            </div>

            {/* Floating Golden Dust Particles */}
            {!compact && (
              <div className="absolute inset-0 overflow-hidden">
                {[
                  { left: '15%', top: '35%', delay: '0s', dur: '4s' },
                  { left: '30%', top: '65%', delay: '1.2s', dur: '3.5s' },
                  { left: '55%', top: '25%', delay: '0.6s', dur: '4.8s' },
                  { left: '72%', top: '55%', delay: '2s', dur: '3.8s' },
                  { left: '88%', top: '30%', delay: '1.5s', dur: '4.2s' },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-yellow-100 shadow-[0_0_12px_#fef08a]"
                    style={{
                      left: s.left,
                      top: s.top,
                      animation: `goldSparkleFloat ${s.dur} ease-in-out infinite`,
                      animationDelay: s.delay
                    }}
                  />
                ))}
              </div>
            )}

            {/* High-metallic foil sheen line */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/15" />
          </div>
        );

      /* =========================================================================
         LEVEL 150: PHANTOM SUPERNOVA (Hot Neon Magenta / Ultraviolet Explosion)
         ========================================================================= */
      case 'phantom-supernova':
        return (
          <div className="absolute inset-0 banner-supernova-bg overflow-hidden pointer-events-none">
            {/* Pulsing Incandescent Core */}
            <div 
              className="absolute right-[22%] top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-400 to-white"
              style={{ animation: 'supernovaPulse 4s ease-in-out infinite' }}
            />

            {/* Expanding Shockwave Rings */}
            {!compact && (
              <>
                <div 
                  className="absolute right-[22%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-64 h-64 rounded-full border-2 border-fuchsia-300/60"
                  style={{ animation: 'shockwaveExpand 3.5s cubic-bezier(0.2, 0.8, 0.4, 1) infinite' }}
                />
                <div 
                  className="absolute right-[22%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-64 h-64 rounded-full border border-rose-400/40"
                  style={{ animation: 'shockwaveExpand 3.5s cubic-bezier(0.2, 0.8, 0.4, 1) infinite', animationDelay: '1.75s' }}
                />
              </>
            )}

            {/* 8-Point Supernova Diffraction Star Spikes */}
            <div className="absolute right-[22%] top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-80">
              <div className="w-72 h-1 bg-gradient-to-r from-transparent via-white to-transparent blur-[1px]" />
              <div className="w-1 h-72 bg-gradient-to-b from-transparent via-white to-transparent blur-[1px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-fuchsia-200 to-transparent rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-fuchsia-200 to-transparent -rotate-45 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Cosmic Ultraviolet Embers */}
            {!compact && (
              <div className="absolute inset-0">
                {[
                  { x: '10%', y: '20%', size: '3px', delay: '0s' },
                  { x: '45%', y: '70%', size: '4px', delay: '1s' },
                  { x: '80%', y: '80%', size: '2px', delay: '2s' },
                ].map((e, idx) => (
                  <div
                    key={idx}
                    className="absolute rounded-full bg-fuchsia-200 shadow-[0_0_10px_#f43f5e]"
                    style={{ left: e.x, top: e.y, width: e.size, height: e.size, animation: 'supernovaPulse 3s infinite', animationDelay: e.delay }}
                  />
                ))}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          </div>
        );

      /* =========================================================================
         LEVEL 200: QUANTUM HYPERDRIVE (Electric Neon Cyan & Tech Warp Corridors)
         ========================================================================= */
      case 'hyperdrive-quantum':
        return (
          <div className="absolute inset-0 banner-quantum-bg overflow-hidden pointer-events-none">
            {/* Subatomic Perspective Grid */}
            <div 
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: 'linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                animation: 'quantumGridFlow 2.5s linear infinite'
              }}
            />

            {/* High-Velocity Warp Speed Streaks */}
            <div className="absolute inset-0 overflow-hidden">
              {[
                { top: '15%', height: '2px', width: '280px', dur: '1.2s', delay: '0s', opacity: 0.9 },
                { top: '32%', height: '3px', width: '420px', dur: '0.8s', delay: '0.3s', opacity: 1 },
                { top: '48%', height: '1.5px', width: '320px', dur: '1.5s', delay: '0.6s', opacity: 0.75 },
                { top: '65%', height: '3.5px', width: '480px', dur: '0.9s', delay: '0.2s', opacity: 0.95 },
                { top: '82%', height: '2px', width: '250px', dur: '1.4s', delay: '0.5s', opacity: 0.8 },
              ].map((streak, i) => (
                <div
                  key={i}
                  className="absolute bg-gradient-to-r from-transparent via-cyan-300 to-white shadow-[0_0_15px_#22d3ee] rounded-full"
                  style={{
                    top: streak.top,
                    height: streak.height,
                    width: streak.width,
                    opacity: streak.opacity,
                    animation: `hyperdriveStream ${streak.dur} linear infinite`,
                    animationDelay: streak.delay
                  }}
                />
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>
        );

      /* =========================================================================
         LEVEL 300: VOID DRAGON SOVEREIGN (Abyssal Obsidian & Toxic Emerald Flame)
         ========================================================================= */
      case 'void-dragon':
        return (
          <div className="absolute inset-0 banner-void-dragon-bg overflow-hidden pointer-events-none">
            {/* Draconic Nether Smoke & Toxic Flame Waves */}
            <div 
              className="absolute -bottom-10 left-0 right-0 h-44 opacity-60"
              style={{ animation: 'voidDragonFlame 5s ease-in-out infinite' }}
            >
              <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full text-emerald-500 fill-current opacity-40 blur-[4px]">
                <path d="M0,100 C150,180 350,20 500,110 C650,200 850,30 1000,120 C1100,170 1180,90 1200,100 L1200,200 L0,200 Z" />
              </svg>
            </div>

            <div 
              className="absolute -bottom-6 left-0 right-0 h-36 opacity-75"
              style={{ animation: 'voidDragonFlame 3.8s ease-in-out infinite', animationDelay: '1.2s' }}
            >
              <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full text-emerald-400 fill-current opacity-30 blur-[2px]">
                <path d="M0,120 C200,40 400,160 600,80 C800,160 1000,60 1200,110 L1200,200 L0,200 Z" />
              </svg>
            </div>

            {/* Void Dragon Eyes & Runic Aura */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-6 opacity-70">
              <div className="w-4 h-8 rounded-full bg-emerald-300 shadow-[0_0_25px_#10b981] rotate-12 animate-pulse" />
              <div className="w-4 h-8 rounded-full bg-emerald-300 shadow-[0_0_25px_#10b981] -rotate-12 animate-pulse" />
            </div>

            {/* Toxic Green Drifting Embers */}
            {!compact && (
              <div className="absolute inset-0">
                {[
                  { x: '20%', y: '75%', delay: '0s', dur: '4s' },
                  { x: '42%', y: '85%', delay: '1.5s', dur: '3.6s' },
                  { x: '68%', y: '80%', delay: '0.8s', dur: '4.5s' },
                  { x: '85%', y: '70%', delay: '2.2s', dur: '3.9s' },
                ].map((ember, i) => (
                  <div
                    key={i}
                    className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399]"
                    style={{
                      left: ember.x,
                      top: ember.y,
                      animation: `voidEmberDrift ${ember.dur} ease-out infinite`,
                      animationDelay: ember.delay
                    }}
                  />
                ))}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </div>
        );

      /* =========================================================================
         LEVEL 500: ASTRAL DEMIGOD HORIZON (Celestial Rose-Gold & Solar Dawn)
         ========================================================================= */
      case 'astral-demigod':
        return (
          <div className="absolute inset-0 banner-demigod-bg overflow-hidden pointer-events-none">
            {/* Radiant Ascendant Solar Pillars */}
            <div 
              className="absolute inset-0 flex justify-around opacity-30"
              style={{ animation: 'demigodRaysAscend 5s ease-in-out infinite' }}
            >
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-12 h-full bg-gradient-to-t from-transparent via-rose-200/50 to-amber-100 blur-[8px]" 
                />
              ))}
            </div>

            {/* Sacred Concentric Halo Circles */}
            <div 
              className="absolute left-[30%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-64 h-64 rounded-full border-2 border-dashed border-rose-200/40 opacity-50"
              style={{ animation: 'demigodHaloRotate 30s linear infinite' }}
            />
            <div 
              className="absolute left-[30%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-48 h-48 rounded-full border border-amber-300/50 opacity-60"
              style={{ animation: 'demigodHaloRotate 20s linear infinite reverse' }}
            />
            <div className="absolute left-[30%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-r from-rose-300 to-amber-200 shadow-[0_0_50px_#fb7185] opacity-80" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>
        );

      /* =========================================================================
         LEVEL 750: CELESTIAL SINGULARITY (Molten Lava-Orange Black Hole Accretion)
         ========================================================================= */
      case 'celestial-singularity':
        return (
          <div className="absolute inset-0 banner-singularity-bg overflow-hidden pointer-events-none">
            {/* Relativistic Jet Pulses (Vertical Polar Blasts) */}
            <div 
              className="absolute right-[28%] top-0 bottom-0 w-2.5 bg-gradient-to-y from-orange-400 via-white to-orange-400 blur-[1px] shadow-[0_0_30px_#f97316]"
              style={{ animation: 'singularityJetPulse 2s ease-in-out infinite' }}
            />

            {/* Swirling Molten Accretion Disk */}
            <div 
              className="absolute right-[28%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-85"
              style={{ animation: 'accretionVortexSpin 16s linear infinite' }}
            >
              <div 
                className="w-full h-full rounded-full border-8 border-orange-500/70 border-t-red-600 border-r-yellow-400 blur-[2px] shadow-[0_0_60px_#ea580c]"
                style={{ transform: 'rotateX(65deg)' }}
              />
            </div>

            {/* Gravitational Lensing Arc (Bending light around the event horizon) */}
            <div 
              className="absolute right-[28%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-52 h-52 rounded-full border-4 border-amber-300/80 shadow-[0_0_40px_#f59e0b] opacity-90"
            />

            {/* Pitch-Black Event Horizon (Singularity Center) */}
            <div className="absolute right-[28%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-black border-2 border-orange-500/40 shadow-[inset_0_0_30px_#000]" />

            {/* Searing Radiation Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_50%,rgba(234,88,12,0.35),transparent_65%)]" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </div>
        );

      /* =========================================================================
         LEVEL 999: THE ABSOLUTE PINNACLE APEX (Transcendent Rainbow Holo-Foil)
         ========================================================================= */
      case 'celestial-999':
        return (
          <div className="absolute inset-0 banner-pinnacle-holo overflow-hidden pointer-events-none">
            {/* Shimmering Holographic Sheen Wipe */}
            <div 
              className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[6px]"
              style={{ animation: 'holoSheenPass 4s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
            />

            {/* Prismatic Diamond Star Twinkles */}
            <div className="absolute inset-0">
              {[
                { x: '12%', y: '30%', delay: '0s' },
                { x: '35%', y: '65%', delay: '1.2s' },
                { x: '60%', y: '25%', delay: '0.7s' },
                { x: '82%', y: '60%', delay: '1.8s' },
              ].map((star, idx) => (
                <div
                  key={idx}
                  className="absolute bg-white shadow-[0_0_14px_rgba(255,255,255,1)] rotate-45 rounded-[1px]"
                  style={{
                    left: star.x,
                    top: star.y,
                    width: compact ? 6 : 9,
                    height: compact ? 6 : 9,
                    animation: 'goldSparkleFloat 3s ease-in-out infinite',
                    animationDelay: star.delay
                  }}
                />
              ))}
            </div>

            {/* Dynamic Contrast Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />
          </div>
        );

      /* =========================================================================
         DEFAULT FALLBACK FOR LEVELS < 100
         ========================================================================= */
      default:
        return (
          <div className={`absolute inset-0 bg-gradient-to-r ${bannerObj.gradient} overflow-hidden pointer-events-none transition-all duration-500`}>
            {/* Subtle ambient noise/radial light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_65%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          </div>
        );
    }
  };

  return (
    <div className={`relative overflow-hidden transition-all duration-300 ${className}`}>
      {/* Background Graphic Engine */}
      {renderBannerGraphics()}

      {/* Optional Metadata Badge (Level / Animated tag) */}
      {showMetaBadge && isElite && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-pulse" />
            ANIMATED • LVL {level}
          </span>
        </div>
      )}

      {/* Children elements (Close button, profile badges, custom controls, etc.) */}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
};
