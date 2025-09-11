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
                @keyframes pulse-faint {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.4; }
                }
                 @keyframes pulse-strong {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
                @keyframes move-texture {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
                .animate-pulse-faint {
                    animation: pulse-faint 8s ease-in-out infinite;
                }
                .animate-pulse-strong {
                    animation: pulse-strong 6s ease-in-out infinite;
                }
            `}</style>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0, 255, 255, 0.08)" strokeWidth="0.5"/>
                    </pattern>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(0, 255, 255, 0.15)" />
                        <stop offset="100%" stopColor="rgba(0, 255, 255, 0)" />
                    </radialGradient>
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="turbulence"/>
                        <feComposite operator="in" in="turbulence" in2="SourceAlpha" result="composite"/>
                        <feColorMatrix in="composite" type="matrix" values="0 0 0 0 0.1 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1 0" result="color"/>
                        <feBlend in="SourceGraphic" in2="color" mode="screen" />
                    </filter>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid)" />
                <rect width="100%" height="100%" fill="url(#centerGlow)" />
                <rect width="100%" height="100%" filter="url(#noise)" opacity="0.3" style={{ animation: 'move-texture 10s linear infinite' }} />

                {/* Concentric Circles */}
                <g transform="translate(50%, 50%)" fill="none" stroke="rgba(0, 255, 255, 0.15)">
                    <circle r="50" strokeWidth="1" className="animate-pulse-faint" />
                    <circle r="100" strokeWidth="1" />
                    <circle r="150" strokeWidth="1" className="animate-pulse-strong" style={{animationDelay: '2s'}}/>
                    <circle r="200" strokeWidth="1" />
                    <circle r="250" strokeWidth="1" className="animate-pulse-faint" style={{animationDelay: '4s'}}/>
                    <circle r="300" strokeWidth="1" />
                </g>
                
                {/* HUD Lines */}
                 <g stroke="rgba(0, 255, 255, 0.3)">
                    <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="0.5" strokeDasharray="5 5" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="0.5" strokeDasharray="5 5" />
                </g>

                {/* Abstract Contour Lines */}
                <g fill="none" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M -10,50 C 50,10 100,100 150,80 S 250,0 310,50" className="animate-pulse-strong" />
                    <path d="M 95%,5 C 80%,50 70%,-20 50%, 50 S 20%,150 5%,95%" className="animate-pulse-faint" />
                    <path d="M 5,95% C 30%,80% 60%,110% 95%,85%" className="animate-pulse-strong" style={{animationDelay: '-3s'}} />
                    <path d="M 10%, 10% C 20%, 40% 40%, 20% 50%, 30% S 70%, 80% 90%, 60%" className="animate-pulse-faint" />
                </g>
            </svg>
        </div>
    );
};

export default MapBackground;