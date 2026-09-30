import React from 'react';

export const Logo = ({ className = "w-full h-full", glowColor = "rgba(255, 255, 255, 0.4)" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
    >
      <defs>
        {/* Soft white-to-gray radial gradient for the planet sphere */}
        <radialGradient id="planet-body" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#d4d4d8" />
          <stop offset="100%" stopColor="#27272a" />
        </radialGradient>
        
        {/* Subtle white/silver linear gradient */}
        <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#a1a1aa" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>

        <linearGradient id="white-fade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Orbit Rings (Outer constellation guide) */}
      <circle 
        cx="50" 
        cy="50" 
        r="46" 
        stroke="#ffffff" 
        strokeWidth="0.75" 
        strokeDasharray="4 8" 
        className="opacity-30 origin-center animate-[spin_60s_linear_infinite]" 
      />
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        strokeDasharray="20 40" 
        className="opacity-40 origin-center animate-[spin_45s_linear_infinite]" 
      />

      {/* Subtle background space nebula circle (low opacity radial) */}
      <circle 
        cx="50" 
        cy="50" 
        r="38" 
        fill="rgba(255, 255, 255, 0.03)" 
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="1"
      />

      {/* Tilted Saturn-style Rings (Behind the planet sphere) */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="40" 
        ry="10" 
        stroke="url(#white-fade)" 
        strokeWidth="2" 
        transform="rotate(-22 50 50)"
        className="opacity-40"
      />
      <ellipse 
        cx="50" 
        cy="50" 
        rx="36" 
        ry="7.5" 
        stroke="#ffffff" 
        strokeWidth="0.75" 
        strokeDasharray="5 2"
        transform="rotate(-22 50 50)"
        className="opacity-30"
      />

      {/* Stars in Space */}
      {/* Star 1 - Sparkle */}
      <path 
        d="M25,25 Q25,30 20,30 Q25,30 25,35 Q25,30 30,30 Q25,30 25,25 Z" 
        fill="#ffffff" 
        className="animate-pulse opacity-80"
      />
      {/* Star 2 - Sparkle */}
      <path 
        d="M75,22 Q75,26 71,26 Q75,26 75,30 Q75,26 79,26 Q75,26 75,22 Z" 
        fill="#ffffff" 
        className="animate-pulse opacity-90"
        style={{ animationDelay: '0.5s' }}
      />
      {/* Star 3 - Dot */}
      <circle cx="15" cy="55" r="1" fill="#ffffff" className="opacity-60" />
      {/* Star 4 - Dot */}
      <circle cx="85" cy="58" r="1.5" fill="#ffffff" className="opacity-70 animate-ping" style={{ animationDuration: '3s' }} />
      {/* Star 5 - Dot */}
      <circle cx="50" cy="12" r="1" fill="#ffffff" className="opacity-80" />

      {/* Planet Sphere */}
      <circle 
        cx="50" 
        cy="50" 
        r="22" 
        fill="url(#planet-body)" 
        stroke="#ffffff"
        strokeWidth="1"
        className="shadow-2xl"
      />

      {/* Tilted Rings (Front layer to overlap planet) */}
      <path 
        d="M 12.87 64.97 A 40 10 0 0 0 50 50" 
        stroke="#ffffff" 
        strokeWidth="2" 
        className="opacity-50"
        transform="rotate(-22 50 50)"
      />
      
      {/* Futuristic Styled Cosmic "CINE" Text */}
      <g transform="translate(0, 0)">
        <text
          x="50"
          y="49.5"
          textAnchor="middle"
          dominantBaseline="central"
          fill="none"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
          className="font-black tracking-widest uppercase italic"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '9px', fontWeight: 900 }}
        >
          CINE
        </text>
        <text
          x="50"
          y="49.5"
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#silver-grad)"
          stroke="#ffffff"
          strokeWidth="0.8"
          strokeLinejoin="round"
          className="font-black tracking-widest uppercase italic"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '9px', fontWeight: 900 }}
        >
          CINE
        </text>
      </g>

      {/* Tiny Astronaut visor highlight overlay */}
      <path 
        d="M 46,41 Q 50,38 54,41" 
        stroke="#ffffff" 
        strokeWidth="0.75" 
        strokeLinecap="round" 
        className="opacity-80"
      />
    </svg>
  );
};
