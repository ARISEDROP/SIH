import React from 'react';

interface MapBackgroundProps {
    isOnline: boolean;
}

const MapBackground: React.FC<MapBackgroundProps> = ({ isOnline }) => {
    if (!isOnline) {
        return (
            <div className="absolute inset-0 w-full h-full bg-[#0D1A26] overflow-hidden">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid-offline" width="50" height="50" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-offline)" />
                </svg>
            </div>
        );
    }
    
    return (
        <div className="absolute inset-0 w-full h-full bg-[#0D1A26] overflow-hidden">
             <style>{`
                @keyframes data-packet-h {
                    from { transform: translateX(0%); }
                    to { transform: translateX(100%); }
                }
                @keyframes data-packet-v {
                    from { transform: translateY(0%); }
                    to { transform: translateY(100%); }
                }
            `}</style>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0, 255, 255, 0.08)" strokeWidth="0.5"/>
                    </pattern>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(0, 255, 255, 0.15)" />
                        <stop offset="100%" stopColor="rgba(0, 255, 255, 0)" />
                    </radialGradient>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid)" />
                <rect width="100%" height="100%" fill="url(#centerGlow)" />

                 {/* Data Packets */}
                 <g fill="rgba(0, 255, 255, 0.7)" className="pointer-events-none">
                    <rect width="1%" height="2" y="20%" style={{ animation: 'data-packet-h 8s linear infinite', animationDelay: '0s' }} />
                    <rect width="1.5%" height="2" y="60%" style={{ animation: 'data-packet-h 6s linear infinite reverse', animationDelay: '-3s' }} />
                    <rect width="2" height="1%" x="30%" style={{ animation: 'data-packet-v 7s linear infinite', animationDelay: '-2s' }} />
                    <rect width="2" height="1.5%" x="75%" style={{ animation: 'data-packet-v 9s linear infinite reverse', animationDelay: '-5s' }} />
                </g>
            </svg>
        </div>
    );
};

export default MapBackground;