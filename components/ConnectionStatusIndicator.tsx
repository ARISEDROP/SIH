import React from 'react';
import { WifiOffIcon, SyncIcon, CheckCircleIcon } from './icons';

interface ConnectionStatusIndicatorProps {
    isOnline: boolean;
    syncStatus: 'idle' | 'syncing' | 'synced';
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ isOnline, syncStatus }) => {
    
    if (!isOnline) {
        return (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
                 <div className="bg-yellow-900/80 backdrop-blur-md text-yellow-200 px-4 py-3 rounded-lg shadow-lg border border-yellow-500/30 flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                    <WifiOffIcon className="w-5 h-5" />
                    <p className="text-sm font-medium">You are offline. Reports will be saved.</p>
                </div>
            </div>
        );
    }
    
    switch (syncStatus) {
        case 'syncing':
            return (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
                    <div className="bg-slate-800/80 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg border border-cyan-500/30 flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                       <SyncIcon className="w-5 h-5 animate-spin" />
                       <p className="text-sm font-medium">Syncing offline reports...</p>
                    </div>
                </div>
            );
        case 'synced':
            return (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
                    <div className="bg-slate-800/80 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg border border-cyan-500/30 flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                       <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                       <p className="text-sm font-medium">All data is up to date.</p>
                    </div>
                </div>
            );
        case 'idle':
        default:
            return null;
    }
};

export default ConnectionStatusIndicator;