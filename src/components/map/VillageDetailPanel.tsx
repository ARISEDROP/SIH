import React from 'react';
import { Village, WaterStatus, QualityHistory } from '../../types';
import { XIcon, ClockIcon, ShieldCheckIcon, AlertTriangleIcon, AlertOctagonIcon, CompassIcon, FileWarningIcon } from '../common/icons';
import { useTranslation } from '../../hooks/useTranslation';

const statusConfig: { [key in WaterStatus]: { icon: React.ReactElement<any>; textClass: string; bgClass: string; borderColor: string; } } = {
  safe: { icon: <ShieldCheckIcon />, textClass: 'text-emerald-300', bgClass: 'bg-emerald-500/20', borderColor: 'border-emerald-500/50' },
  caution: { icon: <AlertTriangleIcon />, textClass: 'text-yellow-300', bgClass: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50' },
  unsafe: { icon: <AlertOctagonIcon />, textClass: 'text-red-400', bgClass: 'bg-red-500/20', borderColor: 'border-red-500/50' },
};

const timelineDotColor: { [key in WaterStatus]: string } = {
    safe: 'bg-emerald-500',
    caution: 'bg-yellow-500',
    unsafe: 'bg-red-500',
};

const generateMockHistory = (currentStatus: WaterStatus): QualityHistory[] => {
    const statuses: WaterStatus[] = ['safe', 'caution', 'unsafe'];
    const history: QualityHistory[] = [{ day: 'Today', status: currentStatus }];
    let lastStatus = currentStatus;
    
    for (let i = 1; i < 5; i++) {
        let nextStatus: WaterStatus;
        const rand = Math.random();
        if (rand < 0.5) {
            nextStatus = lastStatus;
        } else if (rand < 0.75) {
            nextStatus = statuses[Math.max(0, statuses.indexOf(lastStatus) - 1)];
        } else {
            nextStatus = statuses[Math.min(statuses.length - 1, statuses.indexOf(lastStatus) + 1)];
        }
        history.unshift({ day: i === 1 ? 'Yesterday' : `${i}d ago`, status: nextStatus });
        lastStatus = nextStatus;
    }
    return history;
};

interface VillageDetailPanelProps {
  village: Village;
  onClose: () => void;
  onRecenter: () => void;
  isOnline: boolean;
  distance: number | null;
  onReportMissingData: () => void;
}

const VillageDetailPanel: React.FC<VillageDetailPanelProps> = ({ village, onClose, onRecenter, isOnline, distance, onReportMissingData }) => {
    const { t, t_html } = useTranslation();
    const config = statusConfig[village.status];
    const history = generateMockHistory(village.status);

    const glowShadow: { [key in WaterStatus]: string } = {
        safe: 'shadow-[0_0_30px_5px_rgba(45,212,191,0.4)]',
        caution: 'shadow-[0_0_30px_5px_rgba(250,204,21,0.4)]',
        unsafe: 'shadow-[0_0_30px_5px_rgba(248,113,113,0.4)]',
    };

    const offlineStyles = {
        borderColor: 'border-slate-600',
        glowShadow: 'shadow-none',
        bgClass: 'bg-slate-700/50',
        textClass: 'text-gray-300',
    };

    return (
        <div className={`relative bg-slate-900/95 backdrop-blur-lg p-4 rounded-l-2xl border-l border-t border-b h-full flex flex-col ${isOnline ? `${config.borderColor} ${glowShadow[village.status]}` : `${offlineStyles.borderColor} ${offlineStyles.glowShadow}`}`}>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[background-size:1.5rem_1.5rem] opacity-50 pointer-events-none rounded-l-2xl"></div>
            <div className="relative z-10 flex justify-between items-center mb-4">
                <button onClick={onRecenter} className="focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-md -ml-1 p-1 group">
                    <h4 className="font-semibold text-cyan-200 text-lg group-hover:text-cyan-100 group-hover:underline">{t_html('healthWorker.villageDetails', { villageName: village.name })}</h4>
                </button>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-slate-700/80 hover:text-white transition-colors" aria-label="Close details">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className={`relative z-10 p-3 rounded-lg flex items-center gap-3 ${isOnline ? config.bgClass : offlineStyles.bgClass} mb-4`}>
                {React.cloneElement(config.icon, { className: `w-6 h-6 ${isOnline ? config.textClass : offlineStyles.textClass}`})}
                <div>
                    <p className="text-sm text-gray-300">{t('healthWorker.currentStatus')}</p>
                    <p className={`font-bold text-lg ${isOnline ? config.textClass : offlineStyles.textClass}`}>{village.status.charAt(0).toUpperCase() + village.status.slice(1)}</p>
                </div>
            </div>

            <div className="relative z-10 bg-slate-800/60 p-3 rounded-lg mb-4">
                 <div className="flex items-center gap-3">
                    <CompassIcon className="w-6 h-6 text-cyan-300 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-gray-300">{t('healthWorker.locationData')}</p>
                        <p className="font-mono text-xs text-white">{village.lat.toFixed(4)}, {village.lng.toFixed(4)}</p>
                        {distance !== null && <p className="text-xs text-cyan-200">{t_html('healthWorker.kmAway', { distance: distance.toFixed(1) })}</p>}
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex-grow overflow-y-auto pr-2">
                <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="w-5 h-5 text-cyan-300" />
                    <h5 className="font-semibold text-cyan-300">{t('healthWorker.history')}</h5>
                </div>
                <div className="relative pl-5">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-600 rounded-full" style={{ left: 'calc(0.375rem - 1px)' }}></div>
                    {history.map((item, index) => (
                        <div key={index} className="relative pb-4 last:pb-0">
                            <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-slate-600 ${timelineDotColor[item.status]}`}></div>
                            <p className="text-sm font-semibold text-white">{item.day}</p>
                            <p className={`text-xs mt-1 ${isOnline ? statusConfig[item.status].textClass : offlineStyles.textClass}`}>Status: {item.status}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 mt-4 pt-4 border-t border-slate-700/50">
                <button
                    onClick={onReportMissingData}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-yellow-800/80 text-yellow-200 hover:bg-yellow-700/80 transition-colors"
                >
                    <FileWarningIcon className="w-4 h-4" />
                    {t('header.reportMissingData')}
                </button>
            </div>
        </div>
    );
};

export default React.memo(VillageDetailPanel);
