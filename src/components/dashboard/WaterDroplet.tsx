import React from 'react';
import { WaterStatus } from '../../types';

interface WaterDropletProps {
  status: WaterStatus;
}

const WaterDroplet: React.FC<WaterDropletProps> = ({ status }) => {
  const statusClasses = {
    safe: {
      dropColor: 'text-cyan-400',
      waterColor: 'text-cyan-500',
      animation: 'animate-wobble-slow',
    },
    caution: {
      dropColor: 'text-yellow-400',
      waterColor: 'text-yellow-600',
      animation: 'animate-wobble-medium',
    },
    unsafe: {
      dropColor: 'text-red-400',
      waterColor: 'text-yellow-800', // Murky color
      animation: 'animate-wobble-fast',
    },
  };

  const currentStatus = statusClasses[status];

  return (
    <>
      <style>{`
        .droplet-path {
          /* Smoothly transition the stroke color of the droplet's outline */
          transition: stroke 0.5s ease-in-out;
        }
        #waterGradient stop.water-color-stop {
          /* Smoothly transition the fill color of the droplet's body */
          transition: stop-color 0.5s ease-in-out;
        }
        @keyframes wobble {
          0%, 100% { transform: scale(1) rotate(0deg) translateY(0); }
          25% { transform: scale(1.05) rotate(-2deg) translateY(-3px); }
          75% { transform: scale(0.95) rotate(2deg) translateY(3px); }
        }
        .animate-wobble-slow { animation: wobble 6s ease-in-out infinite; }
        .animate-wobble-medium { animation: wobble 4s ease-in-out infinite; }
        .animate-wobble-fast { animation: wobble 2s ease-in-out infinite; }

        @keyframes float-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          25% { transform: translate(5px, 10px) scale(1.2); }
          50% { transform: translate(-5px, 20px) scale(0.8); opacity: 1; }
          75% { transform: translate(8px, 10px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        }
         @keyframes float-2 {
          0% { transform: translate(0, 0) scale(1.2); opacity: 1; }
          25% { transform: translate(-8px, -12px) scale(0.9); }
          50% { transform: translate(4px, -20px) scale(1.1); opacity: 0.7; }
          75% { transform: translate(-6px, -15px) scale(1); }
          100% { transform: translate(0, 0) scale(1.2); opacity: 1; }
        }
        .particle-1 { animation: float-1 10s ease-in-out infinite; }
        .particle-2 { animation: float-2 12s ease-in-out infinite; }
        .particle-3 { animation: float-1 8s ease-in-out infinite reverse; }
        .particle-4 { animation: float-2 15s ease-in-out infinite reverse; }
        .particle-5 { animation: float-1 9s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 100 100" className={`w-full h-full will-change-transform ${currentStatus.animation}`}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(50, 50)">
          <path
            d="M0 -40 C30 -40 40 -10 40 0 C40 25 0 45 0 45 S-40 25 -40 0 C-40 -10 -30 -40 0 -40 Z"
            className={`${currentStatus.dropColor} stroke-current droplet-path`}
            strokeWidth="3"
            fill="url(#waterGradient)"
            filter="url(#glow)"
          />
          <radialGradient id="waterGradient">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" className={`${currentStatus.waterColor} fill-current water-color-stop`} stopOpacity="0.8" />
          </radialGradient>
        </g>
        
        {/* Particles for caution and unsafe */}
        { (status === 'caution' || status === 'unsafe') && (
            <g transform="translate(50, 50)" className="text-yellow-900/80 fill-current">
                <circle cx="0" cy="0" r="2" className="particle-1" />
                <circle cx="10" cy="-10" r="1.5" className="particle-2" />
                <circle cx="-15" cy="15" r="1" className="particle-3" />
                 { status === 'unsafe' && (
                     <>
                        <circle cx="20" cy="5" r="2.5" className="particle-4" />
                        <circle cx="-5" cy="-20" r="2" className="particle-5" />
                        <circle cx="15" cy="25" r="1.5" className="particle-1" style={{animationDelay: '-2s'}}/>
                        <circle cx="-20" cy="-10" r="2" className="particle-2" style={{animationDelay: '-4s'}}/>
                     </>
                 )}
            </g>
        )}

      </svg>
    </>
  );
};

export default React.memo(WaterDroplet);
