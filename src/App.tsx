import React, { Suspense, lazy } from 'react';
import { useAppContext } from './context/AppContext';
import ConnectionStatusIndicator from './components/common/ConnectionStatusIndicator';

// Lazy load components for better initial performance
const LoginScreen = lazy(() => import('./components/screens/LoginScreen'));
const VillagerDashboard = lazy(() => import('./components/screens/VillagerDashboard'));
const HealthWorkerDashboard = lazy(() => import('./components/screens/HealthWorkerDashboard'));
const ProfileModal = lazy(() => import('./components/modals/ProfileModal'));
const AppGuideModal = lazy(() => import('./components/modals/AppGuideModal'));
const DeviceHealthModal = lazy(() => import('./components/modals/DeviceHealthModal'));
const AboutModal = lazy(() => import('./components/modals/AboutModal'));
const HardwareManualModal = lazy(() => import('./components/modals/HardwareManualModal'));
const StorageManagerModal = lazy(() => import('./components/modals/StorageManagerModal'));
const HardwareIntegrationModal = lazy(() => import('./components/modals/HardwareIntegrationModal'));

const App: React.FC = () => {
  const {
    isAuthenticated,
    role,
    isOnline,
    syncStatus,
    isProfileModalOpen,
    isAppGuideOpen,
    isDeviceHealthOpen,
    isAboutModalOpen,
    isHardwareManualOpen,
    isStorageManagerOpen,
    isHardwareModalOpen,
    closeAllModals,
    userProfile,
    updateProfile,
    offlineQueueCount,
    storageUsage,
    exportLog,
    restoreLog,
    clearLog,
    exportPdfReport,
    hardwareConnect,
    hardwareDisconnect,
    openAboutModal,
    openHardwareManual,
    handleDataReceived,
  } = useAppContext();

  const renderContent = () => {
    if (!isAuthenticated) {
      return <LoginScreen />;
    }
    switch (role) {
      case 'villager':
        return <VillagerDashboard />;
      case 'health_worker':
        return <HealthWorkerDashboard />;
      default:
        return <LoginScreen />;
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
      
      <main className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen">
         <Suspense fallback={<FullScreenLoader />}>
            {renderContent()}
         </Suspense>
      </main>
      
      <ConnectionStatusIndicator isOnline={isOnline} syncStatus={syncStatus} offlineQueueCount={offlineQueueCount} />

      <Suspense fallback={null}>
        {isProfileModalOpen && <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={closeAllModals}
          user={userProfile}
          onSave={updateProfile}
        />}
        {isAppGuideOpen && <AppGuideModal
          isOpen={isAppGuideOpen}
          onClose={closeAllModals}
          role={role}
          onOpenAbout={() => {
            closeAllModals();
            openAboutModal();
          }}
        />}
        {isDeviceHealthOpen && <DeviceHealthModal
          isOpen={isDeviceHealthOpen}
          onClose={closeAllModals}
          offlineQueueCount={offlineQueueCount}
        />}
        {isAboutModalOpen && <AboutModal
          isOpen={isAboutModalOpen}
          onClose={closeAllModals}
        />}
        {isHardwareManualOpen && <HardwareManualModal
          isOpen={isHardwareManualOpen}
          onClose={closeAllModals}
        />}
        {isStorageManagerOpen && <StorageManagerModal
            isOpen={isStorageManagerOpen}
            onClose={closeAllModals}
            storageUsage={storageUsage}
            onExport={exportLog}
            onRestore={restoreLog}
            onClear={clearLog}
            onExportPdf={exportPdfReport}
        />}
         {isHardwareModalOpen && role === 'health_worker' && <HardwareIntegrationModal
            isOpen={isHardwareModalOpen}
            onClose={closeAllModals}
            onConnect={hardwareConnect}
            onDisconnect={hardwareDisconnect}
            onDataReceived={handleDataReceived}
            onOpenManual={() => {
                closeAllModals();
                openHardwareManual();
            }}
        />}
      </Suspense>
    </div>
  );
};

export default App;
