import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { quickActionTips as initialTips, reportedSymptomsData as initialSymptoms } from '../constants';
import { Tip, SymptomReport, Role, UserProfile, SensorData, WaterQualityMetrics, WaterStatus, SensorHealth } from '../types';
import { 
    getStoredSymptomReports, 
    saveSymptomReports, 
    getOfflineQueue, 
    addToOfflineQueue, 
    clearOfflineQueue,
    saveTips,
    getLocalStorageUsage
} from '../services/storage';
import { interpretSensorData, analyzeSensorHealth } from '../services/gemini';

interface AppContextState {
    // Auth and User
    isAuthenticated: boolean;
    role: Role;
    userProfile: UserProfile;
    login: (role: Role) => void;
    logout: () => void;
    updateProfile: (profile: UserProfile) => void;

    // Language
    language: string;
    setLanguage: (lang: string) => void;

    // Data
    quickActionTips: Tip[];
    symptomsData: SymptomReport[];
    addTip: (newTip: Omit<Tip, 'id'>) => void;
    updateTip: (updatedTip: Tip) => void;
    deleteTip: (tipId: number) => void;
    reportSymptom: (newReportData: Omit<SymptomReport, 'id' | 'reportedAt' | 'resolved'>) => void;
    resolveSymptom: (reportId: number) => void;

    // Offline & Sync
    isOnline: boolean;
    syncStatus: 'idle' | 'syncing' | 'synced';
    offlineQueueCount: number;

    // Hardware
    isHardwareConnected: boolean;
    connectedDeviceName: string | null;
    hardwareConnect: (deviceName: string) => void;
    hardwareDisconnect: () => void;
    handleDataReceived: (data: SensorData) => void;
    liveMetrics: WaterQualityMetrics | null;
    liveStatus: WaterStatus;
    sensorHealth: SensorHealth | null;
    aiInterpretation: string | null;
    
    // Storage
    storageUsage: number;
    exportLog: () => void;
    restoreLog: (file: File) => void;
    clearLog: () => void;

    // Modals
    isProfileModalOpen: boolean;
    isAppGuideOpen: boolean;
    isDeviceHealthOpen: boolean;
    isAboutModalOpen: boolean;
    isHardwareManualOpen: boolean;
    isStorageManagerOpen: boolean;
    isHardwareModalOpen: boolean;
    openProfileModal: () => void;
    openAppGuide: () => void;
    openDeviceHealth: () => void;
    openAboutModal: () => void;
    openHardwareManual: () => void;
    openStorageManager: () => void;
    openHardwareModal: () => void;
    closeAllModals: () => void;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>('villager');
  const [language, setLanguage] = useState('en-US');
  const [quickActionTips, setQuickActionTips] = useState<Tip[]>(initialTips);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAppGuideOpen, setIsAppGuideOpen] = useState(false);
  const [isDeviceHealthOpen, setIsDeviceHealthOpen] = useState(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isHardwareManualOpen, setIsHardwareManualOpen] = useState(false);
  const [isStorageManagerOpen, setIsStorageManagerOpen] = useState(false);

  const [isHardwareConnected, setIsHardwareConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Aarav Sharma',
    village: 'Tawang',
    avatar: 'https://i.pravatar.cc/150?u=aaravsharma'
  });

  const [symptomsData, setSymptomsData] = useState<SymptomReport[]>(() => getStoredSymptomReports(initialSymptoms));
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [storageUsage, setStorageUsage] = useState(0);

  // Live sensor state
  const [liveMetrics, setLiveMetrics] = useState<WaterQualityMetrics | null>(null);
  const [liveStatus, setLiveStatus] = useState<WaterStatus>('safe');
  const [dataHistory, setDataHistory] = useState<SensorData[]>([]);
  const [sensorHealth, setSensorHealth] = useState<SensorHealth | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);


  useEffect(() => {
    saveSymptomReports(symptomsData);
    setStorageUsage(getLocalStorageUsage());
  }, [symptomsData]);

  useEffect(() => {
    const syncOfflineData = () => {
      const offlineQueue = getOfflineQueue();
      if (offlineQueue.length > 0) {
        setSyncStatus('syncing');
        setTimeout(() => {
          setSymptomsData(prev => [...offlineQueue, ...prev]);
          clearOfflineQueue();
          setOfflineQueueCount(0);
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 3000);
        }, 2000);
      }
    };
    
    const handleOnline = () => { setIsOnline(true); syncOfflineData(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setOfflineQueueCount(getOfflineQueue().length);
    setStorageUsage(getLocalStorageUsage());

    if (navigator.onLine) { syncOfflineData(); }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = useCallback((selectedRole: Role) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => setIsAuthenticated(false), []);
  const addTip = useCallback((newTip: Omit<Tip, 'id'>) => {
    const updatedTips = [...quickActionTips, { ...newTip, id: Date.now() }];
    setQuickActionTips(updatedTips);
    saveTips(updatedTips);
  }, [quickActionTips]);

  const updateTip = useCallback((updatedTip: Tip) => {
    const updatedTips = quickActionTips.map(tip => tip.id === updatedTip.id ? updatedTip : tip);
    setQuickActionTips(updatedTips);
    saveTips(updatedTips);
  }, [quickActionTips]);

  const deleteTip = useCallback((tipId: number) => {
    const updatedTips = quickActionTips.filter(tip => tip.id !== tipId);
    setQuickActionTips(updatedTips);
    saveTips(updatedTips);
  }, [quickActionTips]);
  
  const reportSymptom = useCallback((newReportData: Omit<SymptomReport, 'id' | 'reportedAt' | 'resolved'>) => {
    const newReport: SymptomReport = {
        ...newReportData, id: Date.now(), reportedAt: 'Just now', resolved: false,
    };
    if (isOnline) {
        setSymptomsData(prev => [newReport, ...prev]);
    } else {
        addToOfflineQueue(newReport);
        setOfflineQueueCount(prev => prev + 1);
    }
  }, [isOnline]);
  
  const resolveSymptom = useCallback((reportId: number) => {
    setSymptomsData(prevData => prevData.map(report => report.id === reportId ? { ...report, resolved: true } : report));
  }, []);

  const updateProfile = useCallback((updatedProfile: UserProfile) => setUserProfile(updatedProfile), []);
  const hardwareConnect = useCallback((deviceName: string) => { setIsHardwareConnected(true); setConnectedDeviceName(deviceName); }, []);
  const hardwareDisconnect = useCallback(() => { 
    setIsHardwareConnected(false); 
    setConnectedDeviceName(null); 
    setLiveMetrics(null);
    setDataHistory([]);
    setSensorHealth(null);
    setAiInterpretation(null);
  }, []);

  const exportLog = useCallback(() => {
    if (symptomsData.length === 0) { alert("There is no log data to export."); return; }
    const dataStr = JSON.stringify(symptomsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health_log_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [symptomsData]);

  const restoreLog = useCallback((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result;
              if (typeof content === 'string') {
                  const restoredData = JSON.parse(content);
                  if (Array.isArray(restoredData) && restoredData.every(item => 'id' in item && 'symptoms' in item)) {
                      setSymptomsData(restoredData);
                      alert("Log restored successfully!");
                      setIsStorageManagerOpen(false);
                  } else {
                      throw new Error("Invalid file format.");
                  }
              }
          } catch (error) {
              alert("Failed to restore log. The file may be corrupted or in the wrong format.");
              console.error("Restore error:", error);
          }
      };
      reader.readAsText(file);
  }, []);

  const clearLog = useCallback(() => {
      setSymptomsData([]);
      clearOfflineQueue();
      setOfflineQueueCount(0);
  }, []);
  
  const handleDataReceived = useCallback(async (data: SensorData) => {
      const newHistory = [...dataHistory, data].slice(-20); // Keep last 20 readings
      setDataHistory(newHistory);

      const interpretation = await interpretSensorData(data);
      if (interpretation) {
          setAiInterpretation(interpretation.summary);
      }

      const health = await analyzeSensorHealth(newHistory);
      setSensorHealth(health);

      let status: WaterStatus = 'safe';
      if (data.turbidity > 8 || data.ph < 6.5 || data.ph > 8.5) status = 'unsafe';
      else if (data.turbidity > 5 || data.ph < 6.8 || data.ph > 8.0) status = 'caution';

      setLiveStatus(status);
      setLiveMetrics({
          ph: { value: data.ph, status: data.ph < 6.5 || data.ph > 8.5 ? 'unsafe' : data.ph < 6.8 || data.ph > 8.0 ? 'caution' : 'safe' },
          turbidity: { value: data.turbidity, status: data.turbidity > 8 ? 'unsafe' : data.turbidity > 5 ? 'caution' : 'safe' },
          temperature: { value: data.temperature, status: data.temperature > 30 ? 'caution' : 'safe' },
      });
  }, [dataHistory]);
  
  const closeAllModals = () => {
    setIsProfileModalOpen(false);
    setIsAppGuideOpen(false);
    setIsDeviceHealthOpen(false);
    setIsHardwareModalOpen(false);
    setIsAboutModalOpen(false);
    setIsHardwareManualOpen(false);
    setIsStorageManagerOpen(false);
  };

  const value: AppContextState = {
      isAuthenticated, role, userProfile, login, logout, updateProfile,
      language, setLanguage,
      quickActionTips, symptomsData, addTip, updateTip, deleteTip, reportSymptom, resolveSymptom,
      isOnline, syncStatus, offlineQueueCount,
      isHardwareConnected, connectedDeviceName, hardwareConnect, hardwareDisconnect,
      storageUsage, exportLog, restoreLog, clearLog,
      isProfileModalOpen, isAppGuideOpen, isDeviceHealthOpen, isAboutModalOpen, isHardwareManualOpen, isStorageManagerOpen, isHardwareModalOpen,
      openProfileModal: () => setIsProfileModalOpen(true),
      openAppGuide: () => setIsAppGuideOpen(true),
      openDeviceHealth: () => setIsDeviceHealthOpen(true),
      openAboutModal: () => setIsAboutModalOpen(true),
      openHardwareManual: () => setIsHardwareManualOpen(true),
      openStorageManager: () => setIsStorageManagerOpen(true),
      openHardwareModal: () => setIsHardwareModalOpen(true),
      closeAllModals,
      handleDataReceived,
      liveMetrics,
      liveStatus,
      sensorHealth,
      aiInterpretation
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextState => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
