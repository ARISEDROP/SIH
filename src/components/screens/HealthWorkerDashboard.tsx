import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Header from '../common/Header';
import { villageData } from '../../constants';
import { WaterStatus, SymptomReport, Tip, Village } from '../../types';
import { MapIcon, UserGroupIcon, CheckCircleIcon, BookOpenIcon, PlusIcon, PencilIcon, TrashIcon, SyncIcon, ShieldCheckIcon, AlertTriangleIcon, AlertOctagonIcon, SignalIcon, WifiOffIcon, DownloadIcon, WrenchIcon, BluetoothIcon, FileWarningIcon } from '../common/icons';
import AIOutbreakForecast from '../dashboard/AIOutbreakForecast';
import WaterStatusCard from '../dashboard/WaterStatusCard';
import MapBackground from '../map/MapBackground';
import RippleEffect from '../common/RippleEffect';
import MapSearchBar from '../map/MapSearchBar';
import { useAppContext } from '../../context/AppContext';
import AIMapAnalysis from '../dashboard/AIMapAnalysis';
import { useTranslation } from '../../hooks/useTranslation';

const Modal = lazy(() => import('../modals/Modal'));
const TipEditorModal = lazy(() => import('../modals/TipEditorModal'));
const VillageDetailPanel = lazy(() => import('../map/VillageDetailPanel'));

// --- Map & GPS Constants ---
const MAP_BOUNDS = {
    lat: { min: 26.5, max: 28.5 },
    lng: { min: 91.5, max: 96.5 },
};
const LOCATION_SMOOTHING_FACTOR = 0.5;


const statusConfig: { [key in WaterStatus]: { icon: React.ReactElement<any>; textClass: string; bgClass: string; } } = {
  safe: { icon: <ShieldCheckIcon />, textClass: 'text-emerald-300', bgClass: 'bg-emerald-500/20' },
  caution: { icon: <AlertTriangleIcon />, textClass: 'text-yellow-300', bgClass: 'bg-yellow-500/20' },
  unsafe: { icon: <AlertOctagonIcon />, textClass: 'text-red-400', bgClass: 'bg-red-500/20' },
};

const GeoBeaconPin: React.FC<{ status: WaterStatus; isSelected: boolean; isOnline: boolean }> = ({ status, isSelected, isOnline }) => {
    const colors = {
        safe: { base: 'hsl(160, 100%, 40%)', glow: 'hsl(160, 100%, 50%)' },
        caution: { base: 'hsl(45, 100%, 50%)', glow: 'hsl(45, 100%, 60%)' },
        unsafe: { base: 'hsl(0, 100%, 60%)', glow: 'hsl(0, 100%, 70%)' },
    };
    const color = colors[status];
    
    if (!isOnline) {
        return (
            <svg width="48" height="48" viewBox="0 0 48 48" className="opacity-50">
                <g transform="translate(24 24)">
                    <circle cx="0" cy="0" r="8" fill="rgba(100, 116, 139, 0.5)" stroke="#94a3b8" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="4" fill="#cbd5e1" />
                </g>
            </svg>
        );
    }
    
    const coreAnimation = {
        safe: 'animate-pulse',
        caution: 'animate-pulse',
        unsafe: 'animate-[holographic-glitch_1.5s_ease-in-out_infinite]',
    };

    return (
        <svg width="64" height="64" viewBox="0 0 64 64" className="transition-transform duration-300 group-hover:scale-125" style={{ filter: isSelected ? `drop-shadow(0 0 12px ${color.glow})` : `drop-shadow(0 0 5px ${color.base})` }}>
            <g transform="translate(32 32)">
                {/* Radiating Rings */}
                <circle r="8" fill="none" stroke={color.base} strokeWidth="1.5" className="animate-radiate origin-center" style={{ animationDelay: '0s', animationDuration: '2s' }} />
                <circle r="8" fill="none" stroke={color.base} strokeWidth="1" className="animate-radiate origin-center" style={{ animationDelay: '1s', animationDuration: '2s' }} />

                {/* Pulsating Core */}
                <g className={coreAnimation[status]}>
                    <circle cx="0" cy="0" r="8" fill={color.base} fillOpacity="0.3" />
                    <circle cx="0" cy="0" r="4" fill={color.base} />
                </g>
            </g>
        </svg>
    );
};

interface VillagePinProps {
    village: Village;
    position: { top: string; left: string; };
    isSelected: boolean;
    onClick: (village: Village, position: {top: string, left: string}) => void;
    isVisible: boolean;
    isOnline: boolean;
}

const VillagePin: React.FC<VillagePinProps> = React.memo(({ village, position, isSelected, onClick, isVisible, isOnline }) => {
    const { t, t_html } = useTranslation();
    return (
        <div
            className="absolute group transition-opacity duration-300"
            style={{
                top: position.top, left: position.left, transform: 'translate(-50%, -50%)',
                opacity: isVisible ? 1 : 0.2, pointerEvents: isVisible ? 'auto' : 'none', willChange: 'opacity, transform'
            }}
        >
            <button
                onClick={() => onClick(village, position)}
                className="relative focus:outline-none transition-transform active:scale-95 will-change-transform"
                aria-label={t_html('healthWorker.viewDetailsFor', { villageName: village.name })}
            >
               <GeoBeaconPin status={village.status} isSelected={isSelected} isOnline={isOnline} />
            </button>
             <div className="absolute bottom-full mb-2 w-max bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white text-xs rounded-md shadow-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 left-1/2 z-10 pointer-events-none">
                {village.name} - <span className={statusConfig[village.status].textClass}>{village.status}</span>
            </div>
        </div>
    );
});

const UserLocationPin: React.FC<{position: { top: string; left: string; }}> = ({ position }) => (
     <div className="absolute pointer-events-none" style={{ top: position.top, left: position.left, transform: 'translate(-50%, -50%)' }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
            <g transform="translate(16 16)">
                <circle r="12" fill="none" stroke="hsl(180, 100%, 70%)" className="animate-ping origin-center" />
                <circle r="4" fill="hsl(180, 100%, 70%)" />
            </g>
        </svg>
    </div>
);

const FilterButton: React.FC<{ status: WaterStatus | 'all', currentFilter: WaterStatus | 'all', setFilter: (status: WaterStatus | 'all') => void }> = ({ status, currentFilter, setFilter }) => {
    const { t } = useTranslation();
    const isActive = status === currentFilter;
    const config = {
        all: { text: t('healthWorker.all'), color: 'bg-slate-700', hover: 'hover:bg-slate-600', active: 'bg-cyan-600' },
        safe: { text: t('healthWorker.safe'), color: 'bg-emerald-800', hover: 'hover:bg-emerald-700', active: 'bg-emerald-600' },
        caution: { text: t('healthWorker.caution'), color: 'bg-yellow-800', hover: 'hover:bg-yellow-700', active: 'bg-yellow-600' },
        unsafe: { text: t('healthWorker.unsafe'), color: 'bg-red-800', hover: 'hover:bg-red-700', active: 'bg-red-600' },
    };
    const currentConfig = config[status];

    return (
        <button
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-xs font-bold text-white rounded-full transition-all duration-200 active:scale-95 ${isActive ? currentConfig.active : `${currentConfig.color} ${currentConfig.hover}`}`}
        >
            {currentConfig.text}
        </button>
    );
};

const HealthWorkerDashboard: React.FC = () => {
    const { 
        quickActionTips, addTip, updateTip, deleteTip, symptomsData, resolveSymptom, 
        isHardwareConnected, isOnline, liveMetrics, liveStatus, sensorHealth, aiInterpretation,
        openHardwareModal, openReportMissingDataModal
    } = useAppContext();
    const { t } = useTranslation();

  const [view, setView] = useState<'list' | 'map'>('map');
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedVillageDistance, setSelectedVillageDistance] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [isTipEditorOpen, setIsTipEditorOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [deletingTipId, setDeletingTipId] = useState<number | null>(null);

  const [mapFilter, setMapFilter] = useState<WaterStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ripplePosition, setRipplePosition] = useState<{top: string, left: string} | null>(null);
  const [mapTransform, setMapTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isLogLoading, setIsLogLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLogLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newRawLocation = { lat: latitude, lng: longitude };
                setCurrentUserLocation(prevLocation => {
                    if (!prevLocation) return newRawLocation;
                    const smoothedLat = LOCATION_SMOOTHING_FACTOR * newRawLocation.lat + (1 - LOCATION_SMOOTHING_FACTOR) * prevLocation.lat;
                    const smoothedLng = LOCATION_SMOOTHING_FACTOR * newRawLocation.lng + (1 - LOCATION_SMOOTHING_FACTOR) * prevLocation.lng;
                    return { lat: smoothedLat, lng: smoothedLng };
                });
                setLocationError(null);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationError("Could not get your location.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        setLocationError("Geolocation is not supported by this browser.");
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, []);

  const convertLatLngToPercent = useCallback((lat: number, lng: number) => {
    const latPercent = ((lat - MAP_BOUNDS.lat.min) / (MAP_BOUNDS.lat.max - MAP_BOUNDS.lat.min)) * 100;
    const lngPercent = ((lng - MAP_BOUNDS.lng.min) / (MAP_BOUNDS.lng.max - MAP_BOUNDS.lng.min)) * 100;
    return { top: `${100 - latPercent}%`, left: `${lngPercent}%` };
  }, []);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);
  
  const calculateTransform = (position: {top: string, left: string}) => {
    const topPercent = parseFloat(position.top);
    const leftPercent = parseFloat(position.left);
    const x = (50 - leftPercent) * 1.5;
    const y = (50 - topPercent) * 1.5;
    setMapTransform({ scale: 1.8, x, y });
  };
  
  const handlePinClick = (village: Village, position: {top: string, left: string}) => {
    setSelectedVillage(village);
    if (currentUserLocation) {
        setSelectedVillageDistance(calculateDistance(currentUserLocation.lat, currentUserLocation.lng, village.lat, village.lng));
    } else {
        setSelectedVillageDistance(null);
    }
    setRipplePosition(position);
    calculateTransform(position);
    setTimeout(() => setRipplePosition(null), 1000);
  };

  const handleCloseDetailPanel = () => {
      setSelectedVillage(null);
      setSelectedVillageDistance(null);
      setMapTransform({ scale: 1, x: 0, y: 0 });
  };

  const filteredVillages = useMemo(() => {
      let villages = villageData;
      if (mapFilter !== 'all') villages = villages.filter(v => v.status === mapFilter);
      if (searchQuery) villages = villages.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return villages;
  }, [mapFilter, searchQuery]);
  
  const handleDownloadList = useCallback(() => {
    if (villageData.length === 0) { alert("No data to download."); return; }
    const headers = ["ID", "Village Name", "Status", "Last Checked", "Latitude", "Longitude"];
    const csvRows = [ headers.join(','), ...villageData.map(v => [v.id, `"${v.name}"`, v.status, `"${v.lastChecked}"`, v.lat, v.lng].join(',')) ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `regional_water_quality_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleResolveClick = (reportId: number) => setShowConfirmModal(reportId);
  
  const handleConfirmResolve = () => {
    if (showConfirmModal) {
      setIsResolving(true);
      setTimeout(() => {
        resolveSymptom(showConfirmModal);
        setShowConfirmModal(null);
        setIsResolving(false);
      }, 1000);
    }
  };

  const handleAddNewTip = () => { setEditingTip(null); setIsTipEditorOpen(true); };
  const handleEditTip = (tip: Tip) => { setEditingTip(tip); setIsTipEditorOpen(true); };
  
  const handleSaveTip = (tipData: Omit<Tip, 'id'> | Tip) => {
    if ('id' in tipData) updateTip(tipData); else addTip(tipData);
    setIsTipEditorOpen(false);
  };
  
  const openDeleteConfirm = (tipId: number) => setDeletingTipId(tipId);
  const confirmDeleteTip = () => { if (deletingTipId) { deleteTip(deletingTipId); setDeletingTipId(null); } };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up">
      <Header />
       <div className="mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AIOutbreakForecast />
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                    <SignalIcon className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">{t('healthWorker.liveSensorFeed')}</h3>
                </div>
                 {isHardwareConnected ? (
                    <div className="flex-grow flex flex-col justify-center animate-fade-in space-y-4">
                        <WaterStatusCard status={liveStatus} metrics={liveMetrics!} isChecking={!liveMetrics} history={[]} />
                         <div className="bg-slate-800/60 rounded-2xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <WrenchIcon className="w-5 h-5 text-purple-400" />
                                <h4 className="font-semibold text-purple-300">{t('healthWorker.sensorDiagnostics')}</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-900/50 rounded-lg">
                                    <p className="text-xs font-medium text-cyan-200">{t('healthWorker.aiInterpretation')}</p>
                                    <p className="text-sm text-gray-300 min-h-[20px]">{aiInterpretation || 'Awaiting stable data...'}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${sensorHealth?.status === 'error' ? 'bg-red-900/80' : sensorHealth?.status === 'warning' ? 'bg-yellow-900/80' : 'bg-slate-900/50'}`}>
                                    <p className="text-xs font-medium text-cyan-200">{t('healthWorker.sensorHealth')}</p>
                                    <p className="text-sm text-gray-300 min-h-[20px]">{sensorHealth?.message || 'Monitoring...'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400 p-4">
                        <WifiOffIcon className="w-10 h-10 mb-4" />
                        <h3 className="font-semibold text-lg text-white">{t('healthWorker.noSensor')}</h3>
                        <p className="text-sm mt-1 mb-6">{t('healthWorker.noSensorDesc')}</p>
                        <button
                            onClick={openHardwareModal}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 active:scale-[0.98]"
                        >
                            <BluetoothIcon className="w-5 h-5" />
                            {t('healthWorker.connectSensor')}
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6 relative">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
                <MapIcon className="text-cyan-400" />
                <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">{t('healthWorker.regionalMap')}</h3>
            </div>
             <div className="flex items-center gap-2">
                {view === 'list' && (
                    <button onClick={handleDownloadList} className="p-2 text-cyan-300 hover:text-white bg-slate-800/60 rounded-full hover:bg-slate-700 transition-colors" aria-label={t('healthWorker.downloadList')}>
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                )}
                <div className="flex items-center gap-2 bg-slate-800/60 p-1 rounded-full">
                    <button onClick={() => setView('map')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${view === 'map' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>{t('healthWorker.map')}</button>
                    <button onClick={() => setView('list')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${view === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>{t('healthWorker.list')}</button>
                </div>
            </div>
          </div>
          {view === 'map' ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 relative w-full h-[400px] xl:h-[500px] rounded-lg overflow-hidden border border-slate-700">
                    <MapBackground isOnline={isOnline} />
                    <MapSearchBar value={searchQuery} onChange={setSearchQuery} />
                    <div 
                        className="absolute inset-0 transition-transform duration-700 ease-out"
                        style={{ transform: `scale(${mapTransform.scale}) translate(${mapTransform.x}%, ${mapTransform.y}%)`, transformOrigin: 'center center', willChange: 'transform' }}
                    >
                        {villageData.map((village) => {
                            const position = convertLatLngToPercent(village.lat, village.lng);
                            return (
                                <VillagePin
                                    key={village.id} village={village} position={position}
                                    isSelected={selectedVillage?.id === village.id} onClick={handlePinClick}
                                    isVisible={filteredVillages.some(v => v.id === village.id)} isOnline={isOnline}
                                />
                            );
                        })}
                        {currentUserLocation && <UserLocationPin position={convertLatLngToPercent(currentUserLocation.lat, currentUserLocation.lng)} />}
                    </div>

                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        <FilterButton status="all" currentFilter={mapFilter} setFilter={setMapFilter} />
                        <FilterButton status="safe" currentFilter={mapFilter} setFilter={setMapFilter} />
                        <FilterButton status="caution" currentFilter={mapFilter} setFilter={setMapFilter} />
                        <FilterButton status="unsafe" currentFilter={mapFilter} setFilter={setMapFilter} />
                    </div>
                    {locationError && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-red-900/80 backdrop-blur-sm text-red-200 text-xs font-semibold px-3 py-2 rounded-full border border-red-500/50">
                            {locationError}
                        </div>
                    )}
                    {ripplePosition && <RippleEffect {...ripplePosition} />}
                    {selectedVillage && (
                        <div className="absolute top-0 right-0 h-full w-full max-w-sm z-20 animate-slide-in-from-right">
                            <VillageDetailPanel 
                                village={selectedVillage} 
                                onClose={handleCloseDetailPanel} 
                                onRecenter={() => calculateTransform(convertLatLngToPercent(selectedVillage.lat, selectedVillage.lng))} 
                                isOnline={isOnline} 
                                distance={selectedVillageDistance}
                                onReportMissingData={() => openReportMissingDataModal(selectedVillage)}
                            />
                        </div>
                    )}
                </div>
                <div className="xl:col-span-1 h-full min-h-[250px] xl:h-auto">
                    <AIMapAnalysis />
                </div>
            </div>
            ) : (
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/60">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">{t('healthWorker.village')}</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">{t('healthWorker.status')}</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">{t('healthWorker.lastChecked')}</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                    {villageData.map((village) => (
                        <tr key={village.name} className="hover:bg-slate-800/40">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{village.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[village.status].bgClass} ${statusConfig[village.status].textClass}`}>
                                {React.cloneElement(statusConfig[village.status].icon, { className: 'w-4 h-4' })}
                                {village.status.charAt(0).toUpperCase() + village.status.slice(1)}
                            </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{village.lastChecked}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                                onClick={() => openReportMissingDataModal(village)}
                                className="flex items-center gap-1 text-yellow-300 hover:text-yellow-200 transition-colors"
                            >
                                <FileWarningIcon className="w-4 h-4" />
                                <span>{t('header.reportMissingData')}</span>
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
             </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <UserGroupIcon className="text-cyan-400" />
                        <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">{t('healthWorker.communityLog')}</h3>
                    </div>
                </div>
                <div className="overflow-y-auto max-h-96 pr-2 space-y-3">
                 {isLogLoading ? (
                     [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-slate-800/60 p-4 rounded-lg animate-pulse">
                            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                        </div>
                    ))
                 ) : (
                    symptomsData.map((report, index) => (
                        <div 
                            key={report.id} 
                            className={`p-4 rounded-lg transition-colors animate-fade-in-up ${report.resolved ? 'bg-slate-800/50' : 'bg-red-900/40 border border-red-500/30'}`}
                            style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3 flex-grow min-w-0">
                                    {report.userAvatar && <img src={report.userAvatar} alt={report.userName || ''} className="w-8 h-8 rounded-full flex-shrink-0" />}
                                    <div className="flex-grow">
                                        <p className={`font-bold ${report.resolved ? 'text-gray-400' : 'text-red-300'}`}>{report.village}</p>
                                        {report.userName && <p className={`text-xs ${report.resolved ? 'text-gray-500' : 'text-gray-300'}`}>{report.userName}</p>}
                                        
                                        {report.language && report.language !== 'en-US' ? (
                                            <div className="mt-2 p-2 bg-slate-700/50 rounded-md border border-slate-600">
                                                <div className="flex justify-between items-baseline">
                                                   <p className="text-xs font-semibold text-cyan-300">{t('pdf.originalReport')}</p>
                                                   <span className="text-xs bg-slate-600 text-cyan-200 px-1.5 py-0.5 rounded-full">{report.language}</span>
                                                </div>
                                                <p className="text-sm mt-1 text-white">{report.symptoms}</p>
                                                {report.notes && <p className="text-xs mt-1 italic text-gray-400">"{report.notes}"</p>}

                                                <div className="mt-2 pt-2 border-t border-slate-600/50">
                                                     <p className="text-xs font-semibold text-gray-400">{t('pdf.englishTranslation')}</p>
                                                     <p className="text-sm mt-1 text-gray-300">{report.symptoms_en || '(No translation available)'}</p>
                                                     {report.notes_en && <p className="text-xs mt-1 italic text-gray-500">"{report.notes_en}"</p>}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className={`text-sm mt-1 ${report.resolved ? 'text-gray-500' : 'text-white'}`}>{report.symptoms}</p>
                                                {report.notes && <p className={`text-xs mt-1 italic ${report.resolved ? 'text-gray-600' : 'text-gray-400'}`}>"{report.notes}"</p>}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className={`text-xs ${report.resolved ? 'text-gray-500' : 'text-gray-300'}`}>{report.reportedAt}</p>
                                    {report.resolved ? (
                                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400"><CheckCircleIcon className="w-4 h-4" /> {t('pdf.resolved')}</span>
                                    ) : (
                                        <button onClick={() => handleResolveClick(report.id)} className="mt-2 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md hover:bg-emerald-500/40">Mark as Resolved</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                 )}
                </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <BookOpenIcon className="text-cyan-400" />
                        <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">{t('healthWorker.manageTips')}</h3>
                    </div>
                     <button onClick={handleAddNewTip} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500">
                        <PlusIcon className="w-4 h-4" /> {t('healthWorker.addTip')}
                    </button>
                </div>
                 <div className="space-y-3">
                    {quickActionTips.map((tip, index) => (
                        <div 
                            key={tip.id} 
                            className="bg-slate-800/60 p-3 rounded-lg flex justify-between items-center animate-fade-in-up"
                            style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{tip.icon}</span>
                                <span className="font-semibold text-white">{tip.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEditTip(tip)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-slate-700"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => openDeleteConfirm(tip.id)} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-slate-700"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
       <Suspense fallback={null}>
        {showConfirmModal !== null && (
            <Modal isOpen={true} onClose={() => setShowConfirmModal(null)} title={t('healthWorker.confirmResolveTitle')}>
                <div className="p-6">
                    <p className="text-gray-300">{t('healthWorker.confirmResolveText')}</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={() => setShowConfirmModal(null)} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600">{t('modals.cancel')}</button>
                        <button onClick={handleConfirmResolve} disabled={isResolving} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 disabled:bg-cyan-800 flex items-center gap-2">
                            {isResolving && <SyncIcon className="w-4 h-4 animate-spin" />}
                            {t('healthWorker.confirm')}
                        </button>
                    </div>
                </div>
            </Modal>
        )}
         {isTipEditorOpen && <TipEditorModal isOpen={isTipEditorOpen} onClose={() => setIsTipEditorOpen(false)} onSave={handleSaveTip} tipToEdit={editingTip} />}
         {deletingTipId !== null && (
              <Modal isOpen={true} onClose={() => setDeletingTipId(null)} title={t('healthWorker.confirmDeleteTitle')}>
                <div className="p-6">
                    <p className="text-gray-300">{t('healthWorker.confirmDeleteText')}</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={() => setDeletingTipId(null)} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600">{t('modals.cancel')}</button>
                        <button onClick={confirmDeleteTip} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500">{t('healthWorker.delete')}</button>
                    </div>
                </div>
            </Modal>
         )}
      </Suspense>
    </div>
  );
};

export default React.memo(HealthWorkerDashboard);
