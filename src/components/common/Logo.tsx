import React from 'react';
import { AquaLogoIcon } from './icons';

interface LogoProps {
  size?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'large' }) => {
  return (
    <div className={`flex items-center gap-3 ${size === 'large' ? 'flex-col text-center' : ''}`}>
      <div className={`relative ${size === 'small' ? '' : 'inline-block text-cyan-400 bg-slate-800 p-3 rounded-full'}`}>
        {size === 'large' && (
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-pulse"></div>
        )}
        <AquaLogoIcon className={size === 'small' ? 'w-8 h-8 text-cyan-400' : 'w-8 h-8'} />
      </div>
      <div>
        <h1 className={`font-bold tracking-tight text-white ${size === 'small' ? 'text-2xl' : 'text-3xl'}`}>
          Aqua
        </h1>
        {size === 'large' && (
          <p className="mt-1 text-cyan-200 text-sm">Your Community's Guardian</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(Logo);