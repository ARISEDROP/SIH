
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Header from './Header';
import { villageData, WaterStatus, SymptomReport, diseaseTrendsData, DiseaseTrend, ThreatLevel, Trend, Tip, WaterQualityMetrics, Village, UserProfile } from '../constants';
import { ShieldCheckIcon, AlertTriangleIcon, AlertOctagonIcon, MapIcon, UserGroupIcon, CheckCircleIcon, VirusIcon, TrendingUpIcon, TrendingDownIcon, SyncIcon, DownloadIcon, BookOpenIcon, PlusIcon, PencilIcon, TrashIcon, ChipIcon, Settings2Icon, BluetoothIcon, RadarIcon, BluetoothOffIcon, WrenchIcon, HardDriveIcon } from './icons';
import AIOutbreakForecast from './AIOutbreakForecast';
import WaterStatusCard from './WaterStatusCard';
import { analyzeSensorHealth, interpretSensorData } from '../gemini';
import MapBackground from './MapBackground';
import RippleEffect from './RippleEffect';
import MapSearchBar from './MapSearchBar';

const Modal = lazy(() => import('./Modal'));
const TipEditorModal = lazy(() => import('./TipEditorModal'));
const HardwareIntegrationModal = lazy(() => import('./HardwareIntegrationModal'));
const VillageDetailPanel = lazy(() => import('./VillageDetailPanel'));

interface HealthWorkerDashboardProps {
  onLogout: () => void;
  tips: Tip[];
  onAddTip: (tip: Omit<Tip, 'id'>) => void;
  onUpdateTip: (tip: Tip) => void;
  onDeleteTip: (tipId: number) => void;
  onOpenProfile: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  userProfile: UserProfile;
  onOpenAppGuide: () => void;
  onOpenDeviceHealth: () => void;
  onOpenHardwareModal: () => void;
  onOpenAbout: () => void;
  onOpenStorageManager: () => void;
  isHardwareModalOpen: boolean;
  onCloseHardwareModal: () => void;
  isHardwareConnected: boolean;
  onHardwareConnect: (deviceName: string) => void;
  onHardwareDisconnect: () => void;
  symptomsData: SymptomReport[];
  onResolveSymptom: (reportId: number) => void;
  connectedDeviceName: string | null;
  onOpenHardwareManual: () => void;
  offlineQueueCount: number;
}

interface SensorData {
    ph: number;
    turbidity: number;
    temperature: number;
}

interface SensorHealth {
    status: 'good' | 'warning' | 'error';
    message: string;
}


const statusConfig: { [key in WaterStatus]: { icon: React.ReactElement<any>; textClass: string; bgClass: string; pinColor: string; glowVar: string; } } = {
  safe: { icon: <ShieldCheckIcon />, textClass: 'text-emerald-300', bgClass: 'bg-emerald-500/20', pinColor: 'text-emerald-400', glowVar: '--cyan-rgb' },
  caution: { icon: <AlertTriangleIcon />, textClass: 'text-yellow-300', bgClass: 'bg-yellow-500/20', pinColor: 'text-yellow-400', glowVar: '--yellow-rgb' },
  unsafe: { icon: <AlertOctagonIcon />, textClass: 'text-red-400', bgClass: 'bg-red-500/20', pinColor: 'text-red-500', glowVar: '--red-rgb' },
};

const threatLevelConfig: { [key in ThreatLevel]: { textClass: string; bgClass: string; } } = {
    low: { textClass: 'text-emerald-300', bgClass: 'bg-emerald-500/20' },
    moderate: { textClass: 'text-yellow-300', bgClass: 'bg-yellow-500/20' },
    high: { textClass: 'text-red-400', bgClass: 'bg-red-500/20' },
};

const trendConfig: { [key in Trend]: { icon: React.ReactElement<any>; textClass: string; } } = {
    increasing: { icon: <TrendingUpIcon />, textClass: 'text-red-400' },
    decreasing: { icon: <TrendingDownIcon />, textClass: 'text-emerald-400' },
    stable: { icon: <></>, textClass: 'text-gray-400' },
};

const BeaconPin: React.FC<{ status: WaterStatus; isSelected: boolean }> = ({ status, isSelected }) => {
    const colors = {
        safe: { base: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.7)' },
        caution: { base: '#facc15', glow: 'rgba(250, 204, 21, 0.7)' },
        unsafe: { base: '#f87171', glow: 'rgba(248, 113, 113, 0.7)' },
    };
    const color = colors[status];

    return (
        <svg width="40" height="40" viewBox="0 0 40 40" className="transition-transform duration-300 group-hover:scale-125" style={{ filter: isSelected ? `drop-shadow(0 0 10px ${color.glow})` : 'none', willChange: 'transform' }}>
            <defs>
                <radialGradient id={`grad-${status}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                    <stop offset="60%" style={{ stopColor: color.base, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: color.base, stopOpacity: 0 }} />
                </radialGradient>
            </defs>
            {/* Pulsing glow for selected pin */}
            {isSelected && <circle cx="20" cy="20" r="10" fill={color.base} className="opacity-70 animate-pulse" />}
            {/* Beacon Orb */}
            <circle cx="20" cy="20" r="8" fill={`url(#grad-${status})`} />
            {/* Beacon Base */}
            <path d="M 16 28 L 24 28 L 22 32 L 18 32 Z" fill="rgba(203, 213, 225, 0.6)" />
        </svg>
    );
};


// --- Performance Optimization: Memoized VillagePin Component ---
interface VillagePinProps {
    village: Village;
    position: { top: string; left: string; };
    isSelected: boolean;
    onClick: (village: Village, position: {top: string, left: string}) => void;
    isVisible: boolean;
}

const VillagePin: React.FC<VillagePinProps> = React.memo(({ village, position, isSelected, onClick, isVisible }) => {
    return (
        <div
            className="absolute group transition-opacity duration-300"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -50%)',
                opacity: isVisible ? 1 : 0.2,
                pointerEvents: isVisible ? 'auto' : 'none',
                willChange: 'opacity, transform'
            }}
        >
            <button
                onClick={() => onClick(village, position)}
                className="relative focus:outline-none transition-transform active:scale-95 will-change-transform"
                aria-label={`View details for ${village.name}`}
            >
               <BeaconPin status={village.status} isSelected={isSelected} />
            </button>
            <div className="absolute bottom-full mb-2 w-max bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white text-xs rounded-md shadow-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 left-1/2 z-10 pointer-events-none">
                {village.name} - <span className={statusConfig[village.status].textClass}>{village.status}</span>
            </div>
        </div>
    );
});

const FilterButton: React.FC<{ status: WaterStatus | 'all', currentFilter: WaterStatus | 'all', setFilter: (status: WaterStatus | 'all') => void }> = ({ status, currentFilter, setFilter }) => {
    const isActive = status === currentFilter;
    const config = {
        all: { text: 'All', color: 'bg-slate-700', hover: 'hover:bg-slate-600', active: 'bg-cyan-600' },
        safe: { text: 'Safe', color: 'bg-emerald-800', hover: 'hover:bg-emerald-700', active: 'bg-emerald-600' },
        caution: { text: 'Caution', color: 'bg-yellow-800', hover: 'hover:bg-yellow-700', active: 'bg-yellow-600' },
        unsafe: { text: 'Unsafe', color: 'bg-red-800', hover: 'hover:bg-red-700', active: 'bg-red-600' },
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


const HealthWorkerDashboard: React.FC<HealthWorkerDashboardProps> = ({ 
    onLogout, tips, onAddTip, onUpdateTip, onDeleteTip, onOpenProfile, language, onLanguageChange, 
    userProfile, onOpenAppGuide, onOpenDeviceHealth, onOpenHardwareModal, onOpenAbout, onOpenStorageManager,
    isHardwareModalOpen, onCloseHardwareModal, isHardwareConnected, onHardwareConnect, onHardwareDisconnect, 
    symptomsData, onResolveSymptom, connectedDeviceName, onOpenHardwareManual, offlineQueueCount
}) => {
  const [view, setView] = useState<'list' | 'map'>('map');
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  
  const [isTipEditorOpen, setIsTipEditorOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [deletingTipId, setDeletingTipId] = useState<number | null>(null);

  const [liveMetrics, setLiveMetrics] = useState<WaterQualityMetrics | null>(null);
  const [liveStatus, setLiveStatus] = useState<WaterStatus>('safe');
  
  // State for AI-powered sensor features
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const [sensorHealth, setSensorHealth] = useState<SensorHealth | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);

  const [mapFilter, setMapFilter] = useState<WaterStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ripplePosition, setRipplePosition] = useState<{top: string, left: string} | null>(null);
  const [mapTransform, setMapTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isLogLoading, setIsLogLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching log data
    const timer = setTimeout(() => {
        setIsLogLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const positions = useMemo(() => [
    { top: '20%', left: '25%' }, { top: '40%', left: '60%' },
    { top: '30%', left: '80%' }, { top: '65%', left: '35%' },
    { top: '50%', left: '10%' }, { top: '75%', left: '70%' },
  ], []);
  
  const calculateTransform = (position: {top: string, left: string}) => {
    // A simple function to calculate a zoom-in transform towards a pin.
    // In a real app, this would be more complex, involving getBoundingClientRect and viewport dimensions.
    const topPercent = parseFloat(position.top);
    const leftPercent = parseFloat(position.left);
    
    // Translate the map's center towards the clicked point.
    const x = (50 - leftPercent) * 1.5; // Multiplier for zoom effect
    const y = (50 - topPercent) * 1.5;
    
    setMapTransform({ scale: 1.8, x, y });
  };
  
  const handlePinClick = (village: Village, position: {top: string, left: string}) => {
    setSelectedVillage(village);
    setRipplePosition(position);
    calculateTransform(position);
    setTimeout(() => setRipplePosition(null), 1000); // Ripple duration
  };

  const handleCloseDetailPanel = () => {
      setSelectedVillage(null);
      setMapTransform({ scale: 1, x: 0, y: 0 }); // Reset zoom
  };

  const filteredVillages = useMemo(() => {
      let villages = villageData;
      if (mapFilter !== 'all') {
          villages = villages.filter(v => v.status === mapFilter);
      }
      if (searchQuery) {
          villages = villages.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return villages;
  }, [mapFilter, searchQuery]);


  const handleDataReceived = useCallback(async (data: SensorData) => {
      const newHistory = [...dataHistory, data].slice(-20); // Keep last 20 readings
      setDataHistory(newHistory);

      const interpretation = await interpretSensorData(data);
      if (interpretation) {
          setAiInterpretation(interpretation.summary);
      }

      const health = await analyzeSensorHealth(newHistory);
      setSensorHealth(health);

      // Simple logic to determine status from data
      let status: WaterStatus = 'safe';
      if (data.turbidity > 8 || data.ph < 6.5 || data.ph > 8.5) {
          status = 'unsafe';
      } else if (data.turbidity > 5 || data.ph < 6.8 || data.ph > 8.0) {
          status = 'caution';
      }

      setLiveStatus(status);
      setLiveMetrics({
          ph: { value: data.ph, status: data.ph < 6.5 || data.ph > 8.5 ? 'unsafe' : data.ph < 6.8 || data.ph > 8.0 ? 'caution' : 'safe' },
          turbidity: { value: data.turbidity, status: data.turbidity > 8 ? 'unsafe' : data.turbidity > 5 ? 'caution' : 'safe' },
          temperature: { value: data.temperature, status: data.temperature > 30 ? 'caution' : 'safe' },
      });
  }, [dataHistory]);

  const handleResolveClick = (reportId: number) => {
    setShowConfirmModal(reportId);
  };
  
  const handleConfirmResolve = () => {
    if (showConfirmModal) {
      setIsResolving(true);
      setTimeout(() => {
        onResolveSymptom(showConfirmModal);
        setShowConfirmModal(null);
        setIsResolving(false);
      }, 1000); // Simulate network delay
    }
  };

  const handleAddNewTip = () => {
      setEditingTip(null);
      setIsTipEditorOpen(true);
  };

  const handleEditTip = (tip: Tip) => {
      setEditingTip(tip);
      setIsTipEditorOpen(true);
  };
  
  const handleSaveTip = (tipData: Omit<Tip, 'id'> | Tip) => {
    if ('id' in tipData) {
      onUpdateTip(tipData);
    } else {
      onAddTip(tipData);
    }
    setIsTipEditorOpen(false);
  };
  
  const openDeleteConfirm = (tipId: number) => {
      setDeletingTipId(tipId);
  };

  const confirmDeleteTip = () => {
    if (deletingTipId) {
        onDeleteTip(deletingTipId);
        setDeletingTipId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in-up">
      <Header 
        role="Health Worker" 
        onLogout={onLogout} 
        onOpenProfile={onOpenProfile}
        language={language} 
        onLanguageChange={onLanguageChange}
        userName={userProfile.name}
        userAvatar={userProfile.avatar}
        onOpenAppGuide={onOpenAppGuide}
        onOpenDeviceHealth={onOpenDeviceHealth}
        onOpenHardwareModal={onOpenHardwareModal}
        onOpenAbout={onOpenAbout}
        onOpenStorageManager={onOpenStorageManager}
        isHardwareConnected={isHardwareConnected}
        offlineQueueCount={offlineQueueCount}
        onOpenHardwareManual={onOpenHardwareManual}
       />
       <div className="mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AIOutbreakForecast />
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                    <Settings2Icon className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">OneTap Connect</h3>
                </div>
                <p className="text-sm text-gray-400 flex-grow mb-4">Connect to a hardware sensor to stream live water quality data.</p>
                <button
                    onClick={onOpenHardwareModal}
                    className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 active:scale-[0.98]"
                >
                     {isHardwareConnected ? <><BluetoothIcon className="w-5 h-5"/>{connectedDeviceName}</> : <><BluetoothIcon className="w-5 h-5" />Discover Devices</>}
                </button>
            </div>
        </div>

        { isHardwareConnected && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in" style={{animationDuration: '500ms'}}>
                <WaterStatusCard status={liveStatus} metrics={liveMetrics!} isChecking={!liveMetrics} history={[]} />
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-500/30 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <WrenchIcon className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-semibold text-purple-300 tracking-wide">Live Sensor Diagnostics</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-800/60 rounded-lg">
                            <p className="text-sm font-medium text-cyan-200">AI Interpretation</p>
                            <p className="text-sm text-gray-300 min-h-[20px]">{aiInterpretation || 'Awaiting stable data...'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${sensorHealth?.status === 'error' ? 'bg-red-900/80' : sensorHealth?.status === 'warning' ? 'bg-yellow-900/80' : 'bg-slate-800/60'}`}>
                             <p className="text-sm font-medium text-cyan-200">Sensor Health</p>
                            <p className="text-sm text-gray-300 min-h-[20px]">{sensorHealth?.message || 'Monitoring...'}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6 relative">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
                <MapIcon className="text-cyan-400" />
                <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">Regional Water Quality Map</h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 p-1 rounded-full">
              <button onClick={() => setView('map')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${view === 'map' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>Map</button>
              <button onClick={() => setView('list')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${view === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>List</button>
            </div>
          </div>
          {view === 'map' ? (
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden border border-slate-700">
                <MapBackground />
                <MapSearchBar value={searchQuery} onChange={setSearchQuery} />
                <div 
                    className="absolute inset-0 transition-transform duration-700"
                    style={{
                        transform: `scale(${mapTransform.scale}) translate(${mapTransform.x}%, ${mapTransform.y}%)`,
                        transformOrigin: 'center center',
                        willChange: 'transform'
                    }}
                >
                    {villageData.map((village, index) => (
                        <VillagePin
                            key={village.id}
                            village={village}
                            position={positions[index]}
                            isSelected={selectedVillage?.id === village.id}
                            onClick={handlePinClick}
                            isVisible={filteredVillages.some(v => v.id === village.id)}
                        />
                    ))}
                </div>

                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <FilterButton status="all" currentFilter={mapFilter} setFilter={setMapFilter} />
                    <FilterButton status="safe" currentFilter={mapFilter} setFilter={setMapFilter} />
                    <FilterButton status="caution" currentFilter={mapFilter} setFilter={setMapFilter} />
                    <FilterButton status="unsafe" currentFilter={mapFilter} setFilter={setMapFilter} />
                </div>
                {ripplePosition && <RippleEffect {...ripplePosition} />}
                 {selectedVillage && (
                    <div className="absolute top-0 right-0 h-full w-full max-w-sm z-20 animate-fade-in" style={{animationDuration: '300ms'}}>
                        <VillageDetailPanel village={selectedVillage} onClose={handleCloseDetailPanel} onRecenter={() => calculateTransform(positions[villageData.findIndex(v => v.id === selectedVillage.id)])} />
                    </div>
                )}
            </div>
            ) : (
             <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/60">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Village</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Last Checked</th>
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
                        </tr>
                    ))}
                    </tbody>
                </table>
             </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <UserGroupIcon className="text-cyan-400" />
                    <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">Community Health Log</h3>
                </div>
                <div className="overflow-y-auto max-h-96 pr-2">
                 {isLogLoading ? (
                     [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-slate-800/60 p-4 rounded-lg mb-3 animate-pulse">
                            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                        </div>
                    ))
                 ) : (
                    symptomsData.map(report => (
                        <div key={report.id} className={`p-4 rounded-lg mb-3 transition-colors ${report.resolved ? 'bg-slate-800/50' : 'bg-red-900/40 border border-red-500/30'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`font-bold ${report.resolved ? 'text-gray-400' : 'text-red-300'}`}>{report.village}</p>
                                    <p className={`text-sm ${report.resolved ? 'text-gray-500' : 'text-white'}`}>{report.symptoms}</p>
                                    {report.notes && <p className={`text-xs mt-1 italic ${report.resolved ? 'text-gray-600' : 'text-gray-400'}`}>"{report.notes}"</p>}
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className={`text-xs ${report.resolved ? 'text-gray-500' : 'text-gray-300'}`}>{report.reportedAt}</p>
                                    {report.resolved ? (
                                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400"><CheckCircleIcon className="w-4 h-4" /> Resolved</span>
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
                        <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">Manage Quick Action Tips</h3>
                    </div>
                     <button onClick={handleAddNewTip} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500">
                        <PlusIcon className="w-4 h-4" /> Add Tip
                    </button>
                </div>
                 <div className="space-y-3">
                    {tips.map(tip => (
                        <div key={tip.id} className="bg-slate-800/60 p-3 rounded-lg flex justify-between items-center">
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
            <Modal isOpen={true} onClose={() => setShowConfirmModal(null)} title="Confirm Resolution">
                <div className="p-6">
                    <p className="text-gray-300">Are you sure you want to mark this symptom report as resolved?</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={() => setShowConfirmModal(null)} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600">Cancel</button>
                        <button onClick={handleConfirmResolve} disabled={isResolving} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 disabled:bg-cyan-800 flex items-center gap-2">
                            {isResolving && <SyncIcon className="w-4 h-4 animate-spin" />}
                            Confirm
                        </button>
                    </div>
                </div>
            </Modal>
        )}
         {isTipEditorOpen && <TipEditorModal isOpen={isTipEditorOpen} onClose={() => setIsTipEditorOpen(false)} onSave={handleSaveTip} tipToEdit={editingTip} />}
         {deletingTipId !== null && (
              <Modal isOpen={true} onClose={() => setDeletingTipId(null)} title="Confirm Deletion">
                <div className="p-6">
                    <p className="text-gray-300">Are you sure you want to delete this tip? This action cannot be undone.</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <button onClick={() => setDeletingTipId(null)} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600">Cancel</button>
                        <button onClick={confirmDeleteTip} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500">Delete</button>
                    </div>
                </div>
            </Modal>
         )}
        {isHardwareModalOpen && <HardwareIntegrationModal
            isOpen={isHardwareModalOpen}
            onClose={onCloseHardwareModal}
            onConnect={onHardwareConnect}
            onDisconnect={onHardwareDisconnect}
            onDataReceived={handleDataReceived}
            onOpenManual={onOpenHardwareManual}
        />}
      </Suspense>
    </div>
  );
};

export default React.memo(HealthWorkerDashboard);
