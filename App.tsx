
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { quickActionTips as initialTips, Tip, SymptomReport, reportedSymptomsData as initialSymptoms, Role, UserProfile } from './constants';
import ConnectionStatusIndicator from './components/ConnectionStatusIndicator';
import { 
    getStoredSymptomReports, 
    saveSymptomReports, 
    getOfflineQueue, 
    addToOfflineQueue, 
    clearOfflineQueue,
    saveTips,
    getLocalStorageUsage
} from './storage';

// Lazy load components for better initial performance
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const VillagerDashboard = lazy(() => import('./components/VillagerDashboard'));
const HealthWorkerDashboard = lazy(() => import('./components/HealthWorkerDashboard'));
const ProfileModal = lazy(() => import('./components/ProfileModal'));
const AppGuideModal = lazy(() => import('./components/AppGuideModal'));
const DeviceHealthModal = lazy(() => import('./components/DeviceHealthModal'));
const AboutModal = lazy(() => import('./components/AboutModal'));
const HardwareManualModal = lazy(() => import('./components/HardwareManualModal'));
const StorageManagerModal = lazy(() => import('./components/StorageManagerModal'));


const App: React.FC = () => {
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

  // Centralized state for all symptom reports, sourced from storage service
  const [symptomsData, setSymptomsData] = useState<SymptomReport[]>(() => getStoredSymptomReports(initialSymptoms));

  // State for offline functionality
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [storageUsage, setStorageUsage] = useState(0);


  useEffect(() => {
    saveSymptomReports(symptomsData);
    setStorageUsage(getLocalStorageUsage());
  }, [symptomsData]);


  useEffect(() => {
    const syncOfflineData = () => {
      const offlineQueue = getOfflineQueue();
      if (offlineQueue.length > 0) {
        setSyncStatus('syncing');
        // Simulate network delay
        setTimeout(() => {
          setSymptomsData(prev => [...offlineQueue, ...prev]);
          clearOfflineQueue();
          setOfflineQueueCount(0);
          setSyncStatus('synced');
          // Hide status after a few seconds
          setTimeout(() => setSyncStatus('idle'), 3000);
        }, 2000);
      }
    };
    
    const handleOnline = () => {
        setIsOnline(true);
        syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const initialQueue = getOfflineQueue();
    setOfflineQueueCount(initialQueue.length);
    setStorageUsage(getLocalStorageUsage());

    if (navigator.onLine) {
        syncOfflineData();
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);


  const handleLogin = useCallback((selectedRole: Role) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const handleAddTip = useCallback((newTip: Omit<Tip, 'id'>) => {
    const updatedTips = [...quickActionTips, { ...newTip, id: Date.now() }];
    setQuickActionTips(updatedTips);
    saveTips(updatedTips);
  }, [quickActionTips]);

  const handleUpdateTip = useCallback((updatedTip: Tip) => {
    const updatedTips = quickActionTips.map(tip => tip.id === updatedTip.id ? updatedTip : tip);
    setQuickActionTips(updatedTips);
    saveTips(updatedTips);
  }, [quickActionTips]);

  const handleDeleteTip = useCallback((tipId: number) => {
    const updatedTips = quickActionTips.filter(tip => tip.id !== tipId);
    setQuickActionTips(updatedTips);
    saveTips(updatedTips);
  }, [quickActionTips]);
  
  const handleSymptomReport = useCallback((newReportData: Omit<SymptomReport, 'id' | 'reportedAt' | 'resolved'>) => {
    const newReport: SymptomReport = {
        ...newReportData,
        id: Date.now(),
        reportedAt: 'Just now',
        resolved: false,
    };

    if (isOnline) {
        setSymptomsData(prev => [newReport, ...prev]);
    } else {
        addToOfflineQueue(newReport);
        setOfflineQueueCount(prev => prev + 1);
    }
  }, [isOnline]);
  
  const handleResolveSymptom = useCallback((reportId: number) => {
    setSymptomsData(prevData =>
        prevData.map(report =>
            report.id === reportId ? { ...report, resolved: true } : report
        )
    );
  }, []);

  const handleUpdateProfile = useCallback((updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  }, []);

  const handleHardwareConnect = useCallback((deviceName: string) => {
    setIsHardwareConnected(true);
    setConnectedDeviceName(deviceName);
  }, []);

  const handleHardwareDisconnect = useCallback(() => {
    setIsHardwareConnected(false);
    setConnectedDeviceName(null);
  }, []);

  const handleExportLog = useCallback(() => {
    if (symptomsData.length === 0) {
        alert("There is no log data to export.");
        return;
    }
    const dataStr = JSON.stringify(symptomsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = `health_log_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  }, [symptomsData]);

  const handleRestoreLog = useCallback((file: File) => {
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

  const handleClearLog = useCallback(() => {
      setSymptomsData([]);
      // Also clear offline queue to be safe
      clearOfflineQueue();
      setOfflineQueueCount(0);
  }, []);

  const onOpenProfile = useCallback(() => setIsProfileModalOpen(true), []);
  const onOpenAppGuide = useCallback(() => setIsAppGuideOpen(true), []);
  const onOpenDeviceHealth = useCallback(() => setIsDeviceHealthOpen(true), []);
  const onOpenHardwareModal = useCallback(() => setIsHardwareModalOpen(true), []);
  const onOpenAbout = useCallback(() => setIsAboutModalOpen(true), []);
  const onOpenHardwareManual = useCallback(() => setIsHardwareManualOpen(true), []);
  const onOpenStorageManager = useCallback(() => setIsStorageManagerOpen(true), []);


  const renderContent = () => {
    if (!isAuthenticated) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    const dashboardProps = {
      onLogout: handleLogout,
      onOpenProfile: onOpenProfile,
      language,
      onLanguageChange: setLanguage,
      userProfile,
      onOpenAppGuide: onOpenAppGuide,
      onOpenDeviceHealth: onOpenDeviceHealth,
      onOpenHardwareModal: onOpenHardwareModal,
      onOpenAbout: onOpenAbout,
      isHardwareConnected,
      offlineQueueCount,
      onOpenStorageManager,
    };

    switch (role) {
      case 'villager':
        return <VillagerDashboard 
                  {...dashboardProps} 
                  tips={quickActionTips} 
                  onReportSymptoms={handleSymptomReport}
                />;
      case 'health_worker':
        return <HealthWorkerDashboard 
                  {...dashboardProps}
                  tips={quickActionTips}
                  onAddTip={handleAddTip}
                  onUpdateTip={handleUpdateTip}
                  onDeleteTip={handleDeleteTip}
                  isHardwareModalOpen={isHardwareModalOpen}
                  onCloseHardwareModal={() => setIsHardwareModalOpen(false)}
                  onHardwareConnect={handleHardwareConnect}
                  onHardwareDisconnect={handleHardwareDisconnect}
                  symptomsData={symptomsData}
                  onResolveSymptom={handleResolveSymptom}
                  connectedDeviceName={connectedDeviceName}
                  onOpenHardwareManual={onOpenHardwareManual}
                />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  const FullScreenLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#0D1A26] overflow-y-auto font-sans">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0D1A26] via-emerald-900/80 to-cyan-900/80 animate-background-flow"></div>
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/wavy-lines.png')]"></div>
      <style>{`
        :root {
            --red-rgb: 239, 68, 68;
            --yellow-rgb: 234, 179, 8;
            --cyan-rgb: 34, 211, 238;
        }
        @keyframes background-flow {
            0% { background-position: 0% 50%; background-size: 200% 200%; }
            25% { background-position: 100% 50%; background-size: 250% 250%; }
            50% { background-position: 0% 50%; background-size: 300% 300%; }
            75% { background-position: 100% 50%; background-size: 250% 250%; }
            100% { background-position: 0% 50%; background-size: 200% 200%; }
        }
        .animate-background-flow {
          animation: background-flow 40s ease infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px 0px rgba(var(--glow-color), 0.4), inset 0 0 10px 0px rgba(var(--glow-color), 0.2); }
          50% { box-shadow: 0 0 30px 5px rgba(var(--glow-color), 0.7), inset 0 0 15px 2px rgba(var(--glow-color), 0.5); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3.5s ease-in-out infinite;
        }
        @keyframes orb-pulse {
            0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 10px rgba(var(--cyan-rgb), 0.4));
            }
            50% {
                transform: scale(1.05);
                filter: drop-shadow(0 0 25px rgba(var(--cyan-rgb), 0.8));
            }
        }
        .animate-orb-pulse {
            animation: orb-pulse 5s ease-in-out infinite;
        }
        @keyframes pulse-glow-bar {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-pulse-glow-bar {
            animation: pulse-glow-bar 2s linear infinite;
        }
        .will-change-transform { will-change: transform; }
      `}</style>
      
      <main className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen">
         <Suspense fallback={<FullScreenLoader />}>
            {renderContent()}
         </Suspense>
      </main>
      
      <ConnectionStatusIndicator isOnline={isOnline} syncStatus={syncStatus} />

      <Suspense fallback={null}>
        {isProfileModalOpen && <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={userProfile}
          onSave={handleUpdateProfile}
        />}
        {isAppGuideOpen && <AppGuideModal
          isOpen={isAppGuideOpen}
          onClose={() => setIsAppGuideOpen(false)}
          role={role}
          onOpenAbout={() => {
            setIsAppGuideOpen(false);
            setIsAboutModalOpen(true);
          }}
        />}
        {isDeviceHealthOpen && <DeviceHealthModal
          isOpen={isDeviceHealthOpen}
          onClose={() => setIsDeviceHealthOpen(false)}
          offlineQueueCount={offlineQueueCount}
        />}
        {isAboutModalOpen && <AboutModal
          isOpen={isAboutModalOpen}
          onClose={() => setIsAboutModalOpen(false)}
        />}
        {isHardwareManualOpen && <HardwareManualModal
          isOpen={isHardwareManualOpen}
          onClose={() => setIsHardwareManualOpen(false)}
        />}
        {isStorageManagerOpen && <StorageManagerModal
            isOpen={isStorageManagerOpen}
            onClose={() => setIsStorageManagerOpen(false)}
            storageUsage={storageUsage}
            onExport={handleExportLog}
            onRestore={handleRestoreLog}
            onClear={handleClearLog}
        />}
      </Suspense>
    </div>
  );
};

export default App;
