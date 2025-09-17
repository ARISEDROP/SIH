import React from 'react';
import { WaterStatus } from '../../types';

interface Metric3DProps {
  icon: React.ReactNode;
  metric: { value: number; status: WaterStatus };
  unit: string;
  name: string;
  max: number;
}

const statusColors = {
  safe: {
    base: 'hsl(180, 70%, 50%)', // cyan
    light: 'hsl(180, 70%, 60%)',
    dark: 'hsl(180, 70%, 40%)',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_15px_3px_hsla(180,70%,50%,0.6)]',
  },
  caution: {
    base: 'hsl(45, 90%, 50%)', // yellow
    light: 'hsl(45, 90%, 60%)',
    dark: 'hsl(45, 90%, 40%)',
    text: 'text-yellow-300',
    glow: 'shadow-[0_0_15px_3px_hsla(45,90%,50%,0.6)]',
  },
  unsafe: {
    base: 'hsl(0, 80%, 60%)', // red
    light: 'hsl(0, 80%, 70%)',
    dark: 'hsl(0, 80%, 50%)',
    text: 'text-red-400',
    glow: 'shadow-[0_0_15px_3px_hsla(0,80%,60%,0.6)]',
  },
};


const Metric3D: React.FC<Metric3DProps> = ({ icon, metric, unit, name, max }) => {
    const heightPercentage = Math.max(0, Math.min(100, (metric.value / max) * 100));
    const colors = statusColors[metric.status];

    return (
        <div className="flex flex-col items-center justify-end h-48 text-center group">
             {/* Icon */}
             <div className={`mb-2 transition-all duration-300 group-hover:scale-110 ${colors.text}`}>
                 {icon}
             </div>

             {/* Value and Name */}
            <div className="mb-2 transition-transform duration-300 group-hover:-translate-y-1">
                <p className={`text-xl font-bold text-white`}>
                    {metric.value.toFixed(1)}
                    <span className="text-sm font-normal text-gray-400">{unit}</span>
                </p>
                <p className="text-xs text-gray-400">{name}</p>
            </div>
            
            {/* 3D visualization container */}
            <div style={{ perspective: '1000px' }}>
                <div className="relative w-16 h-24 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2 will-change-transform" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-15deg) rotateY(20deg)' }}>
                    
                    {/* Back Panel with Scale */}
                    <div className="absolute w-full h-full bg-slate-800/30 rounded-lg" style={{ transform: 'translateZ(-10px)' }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="absolute left-1/2 -translate-x-1/2 w-3/4 h-px bg-slate-600" style={{ top: `${25 * (i+1)}%` }}></div>
                        ))}
                    </div>

                    {/* Glass Tube */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-full border-2 border-slate-500/50 rounded-full bg-gradient-to-r from-slate-700/20 via-transparent to-slate-700/20" style={{ transform: 'translateZ(5px)' }}>
                        {/* Base */}
                         <div className="absolute bottom-[-2px] left-[-2px] w-7 h-3 bg-slate-600 rounded-b-full"></div>
                    </div>
                   
                    {/* Liquid Fill */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 rounded-t-full rounded-b-full overflow-hidden"
                        style={{
                            height: `calc(${heightPercentage}% - 2px)`,
                            transition: 'height 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
                            transform: 'translateZ(5px)',
                        }}
                    >
                         <div
                            className={`w-full h-full transition-all duration-300 ${colors.glow} group-hover:shadow-[0_0_20px_5px_hsla(var(--glow-hsl),0.8)]`}
                            style={{
                                '--glow-hsl': metric.status === 'safe' ? '180,70%,50%' : metric.status === 'caution' ? '45,90%,50%' : '0,80%,60%',
                                background: `linear-gradient(to top, ${colors.dark}, ${colors.base}, ${colors.light})`,
                            } as React.CSSProperties}
                        ></div>
                        {/* Meniscus (top surface) */}
                        <div
                            className="absolute top-0 left-0 w-full h-2 rounded-full"
                            style={{ backgroundColor: colors.light, transform: 'scaleY(0.5)' }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Metric3D);
