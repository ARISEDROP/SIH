import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface ScannerAnimationModalProps {
  isOpen: boolean;
}

const ScannerAnimationModal: React.FC<ScannerAnimationModalProps> = ({ isOpen }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scan-line-anim { 
            0% { transform: translateY(-10%); } 
            100% { transform: translateY(100%); } 
        }
        @keyframes hud-flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
      `}</style>
      <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md z-50 flex flex-col justify-center items-center animate-fade-in" style={{ animationDuration: '300ms' }}>
        <div className="relative w-64 h-64">
            {/* Corner Brackets */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-400/80 animate-hud-flicker"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-400/80 animate-hud-flicker"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-cyan-400/80 animate-hud-flicker"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-400/80 animate-hud-flicker"></div>

            {/* Rotating Rings */}
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-rotate" style={{animation: 'rotate 6s linear infinite'}}></div>
            <div className="absolute inset-4 border-2 border-cyan-500/40 rounded-full" style={{animation: 'rotate 8s linear infinite reverse'}}></div>
            
            {/* Grid and Scan Line */}
            <div className="absolute inset-8 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.cyan.500/0.1)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.cyan.500/0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,transparent_50%,#000_100%)]"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-cyan-400 shadow-[0_0_20px_5px_theme(colors.cyan.400)]" style={{animation: 'scan-line-anim 2.5s ease-in-out infinite alternate'}}></div>
            </div>
            
             {/* Center Icon */}
             <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-cyan-300 drop-shadow-[0_0_5px_theme(colors.cyan.400)] animate-pulse">
                    <path d="M50,10 C70,10 90,30 90,50 S70,90 50,90 S10,70 10,50 S30,10 50,10 Z" stroke="currentColor" strokeWidth="3" fill="none" />
                    <circle cx="50" cy="50" r="15" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>
        </div>
        <p className="mt-8 text-xl font-semibold text-white tracking-widest animate-pulse">{t('modals.analyzing')}</p>
      </div>
    </>
  );
};

export default React.memo(ScannerAnimationModal);