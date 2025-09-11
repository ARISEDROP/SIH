import React from 'react';
import { TestTubeIcon, DropletsIcon, ThermometerIcon, ClockIcon } from '../common/icons';
import { WaterStatus, WaterQualityMetrics, QualityHistory } from '../../types';
import WaterDroplet from './WaterDroplet';
import Metric3D from './Metric3D';

interface WaterStatusCardProps {
  status: WaterStatus;
  metrics: WaterQualityMetrics;
  isChecking: boolean;
  descriptionOverride?: string | null;
  history: QualityHistory[];
}

const statusConfig = {
  safe: {
    title: 'Water is Safe',
    description: 'Current water supply is clean and safe for consumption.',
    colorClass: 'cyan',
    borderColor: 'border-cyan-500/40',
    glowBarColor: 'via-cyan-500',
    titleColor: 'text-cyan-300',
  },
  caution: {
    title: 'Caution Advised',
    description: 'Contamination detected. Boil water before use.',
    colorClass: 'yellow',
    borderColor: 'border-yellow-500/40',
    glowBarColor: 'via-yellow-500',
    titleColor: 'text-yellow-300',
  },
  unsafe: {
    title: 'Water is Unsafe',
    description: 'High contamination level. Do not drink the water.',
    colorClass: 'red',
    borderColor: 'border-red-500/40',
    glowBarColor: 'via-red-500',
    titleColor: 'text-red-300',
  },
};

const timelineDotColor: { [key in WaterStatus]: string } = {
    safe: 'bg-emerald-500',
    caution: 'bg-yellow-500',
    unsafe: 'bg-red-500',
};

const MetricSkeleton3D: React.FC = () => (
    <div className="flex flex-col items-center justify-end h-48 text-center animate-pulse">
        {/* Icon placeholder */}
        <div className="w-6 h-6 mb-2 bg-slate-700/80 rounded-full"></div>
        {/* Text placeholders */}
        <div className="mb-2 space-y-1">
            <div className="h-6 w-12 mx-auto bg-slate-700/80 rounded-md"></div>
            <div className="h-4 w-8 mx-auto bg-slate-700/80 rounded-md"></div>
        </div>
        {/* 3D visualization placeholder */}
        <div style={{ perspective: '1000px' }}>
            <div className="relative w-16 h-24" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-15deg) rotateY(20deg)' }}>
                {/* Back Panel */}
                <div className="absolute w-full h-full bg-slate-800/30 rounded-lg" style={{ transform: 'translateZ(-10px)' }}></div>
                {/* Tube */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-full border-2 border-slate-600 rounded-full" style={{ transform: 'translateZ(5px)' }}>
                     {/* Pulsing fill animation */}
                     <div className="absolute bottom-0 left-0 w-full bg-slate-700 rounded-full" style={{
                         animation: 'pulse-height 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                     }}></div>
                </div>
            </div>
        </div>
        <style>{`
            @keyframes pulse-height {
                0%, 100% { height: 20%; opacity: 0.7; }
                50% { height: 80%; opacity: 1; }
            }
        `}</style>
    </div>
);


const WaterStatusCard: React.FC<WaterStatusCardProps> = ({ status, metrics, isChecking, descriptionOverride, history }) => {
  const config = statusConfig[status];

  return (
    <div className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg ${config.borderColor} overflow-hidden transition-all duration-500 ease-in-out`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${config.glowBarColor} to-transparent animate-pulse-glow-bar`} style={{'--glow-color': `var(--${config.colorClass}-rgb)`} as React.CSSProperties}></div>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-24 h-24">
            <WaterDroplet status={status} />
          </div>
          <div className="flex-grow text-center sm:text-left">
            <h2 className={`text-2xl font-bold ${config.titleColor}`}>{config.title}</h2>
            <p className="text-gray-300 mt-1">{descriptionOverride || config.description}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700/60">
            <div className="grid grid-cols-3 gap-4">
                {isChecking ? (
                    <>
                        <MetricSkeleton3D />
                        <MetricSkeleton3D />
                        <MetricSkeleton3D />
                    </>
                ) : (
                    <>
                        <Metric3D icon={<TestTubeIcon width={24} height={24} />} metric={metrics.ph} unit="" name="pH Level" max={14} />
                        <Metric3D icon={<DropletsIcon width={24} height={24} />} metric={metrics.turbidity} unit=" NTU" name="Turbidity" max={25} />
                        <Metric3D icon={<ThermometerIcon width={24} height={24} />} metric={metrics.temperature} unit="°C" name="Temperature" max={40} />
                    </>
                )}
            </div>
        </div>

        {history && history.length > 0 && (
             <div className="mt-6 pt-6 border-t border-slate-700/60">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <ClockIcon className="w-5 h-5 text-cyan-300" />
                    <h4 className="font-semibold text-cyan-300">Recent Quality Timeline</h4>
                </div>
                <div className="relative flex justify-between items-center w-full max-w-sm mx-auto">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-0.5 bg-slate-700"></div>
                    {history.map((item: QualityHistory, index) => (
                        <div 
                            key={index}
                            className="relative text-center group"
                            title={`Status on ${item.day}: ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 border-slate-600 ${timelineDotColor[item.status]} transition-transform duration-200 group-hover:scale-125`}></div>
                            <p className="text-xs text-gray-400 mt-2">{item.day}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
       <div className="bg-slate-800/50 px-6 py-2 text-xs text-gray-400 text-center sm:text-right">
        Last synced: <span className="font-semibold text-gray-300">Just now</span>
      </div>
    </div>
  );
};

export default React.memo(WaterStatusCard);