import React from 'react';

const Loader360 = ({ fullPage = false, statusText = "Chargement..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6 animate-fade-in select-none">
      {/* Self-contained CSS Animations */}
      <style>{`
        @keyframes logo-draw {
          0% { stroke-dashoffset: 240; }
          100% { stroke-dashoffset: -240; }
        }
        @keyframes logo-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.95); }
          50% { opacity: 0.4; transform: scale(1.08); }
        }
        @keyframes text-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .animate-logo-draw {
          animation: logo-draw 5s linear infinite;
        }
        .animate-logo-orbit {
          animation: logo-orbit 4s linear infinite;
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .animate-text-glow {
          animation: text-glow 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Motion Logo Container */}
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Glow behind the logo */}
        <div className="absolute inset-0 bg-brand-orange/10 blur-2xl rounded-full scale-110 animate-glow-pulse"></div>

        {/* Premium SVG Motion Logo */}
        <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7A00" />
              <stop offset="100%" stopColor="#FFB800" />
            </linearGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Main Orbit Track (thin, elegant background) */}
          <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="38" stroke="#E2E8F0" strokeWidth="1" strokeOpacity="0.5" />
          
          {/* Animated Orbit Circle (gradient) */}
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            stroke="url(#logoGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeDasharray="240" 
            strokeDashoffset="240" 
            className="animate-logo-draw" 
          />
          
          {/* Rotating Satellite (360 degree point) */}
          <g className="animate-logo-orbit" style={{ transformOrigin: '50px 50px' }}>
            <circle cx="50" cy="12" r="5" fill="#FF7A00" filter="url(#glow)" />
            <circle cx="50" cy="12" r="2" fill="#FFFFFF" />
          </g>
          
          {/* Center Building / BTP Pillars (static and sharp) */}
          <g style={{ transformOrigin: '50px 50px' }}>
            {/* Structural base plate */}
            <rect x="32" y="62" width="36" height="4" rx="2" fill="#1E293B" />
            {/* Columns */}
            <rect x="36" y="44" width="6" height="18" rx="1" fill="#1E293B" />
            <rect x="47" y="40" width="6" height="22" rx="1" fill="#FF7A00" />
            <rect x="58" y="44" width="6" height="18" rx="1" fill="#1E293B" />
            {/* Pediment (Triangle Roof) */}
            <path d="M30 40 L50 25 L70 40 Z" fill="#1E293B" />
            <path d="M44 33 L50 28 L56 33 Z" fill="#FF7A00" />
          </g>
        </svg>
      </div>

      {/* Brand Text & Loading Message */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black text-brand-dark tracking-wider">
          BTP <span className="text-brand-orange">360</span>
        </h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] animate-text-glow">
          {statusText}
        </p>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-20 flex justify-center w-full">{content}</div>;
};

export default Loader360;
