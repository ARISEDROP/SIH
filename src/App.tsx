import React, { Suspense, lazy } from 'react';
import { useAppContext } from './context/AppContext';
import ConnectionStatusIndicator from './components/common/ConnectionStatusIndicator';
import Logo from './components/common/Logo';

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
const ReportMissingDataModal = lazy(() => import('./components/modals/ReportMissingDataModal'));

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
    isReportMissingDataModalOpen,
    villageForReporting,
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
        <div className="animate-orb-pulse" style={{'--cyan-rgb': '34, 211, 238'} as React.CSSProperties}>
            <Logo size="large" />
        </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#0D1A26] overflow-y-auto overflow-x-hidden font-sans">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0D1A26] via-emerald-900/80 to-cyan-900/80 animate-background-flow"></div>
      <div 
        className="absolute inset-0 z-0 opacity-20 animate-background-pan" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="shooting-star"></div>
        <div className="shooting-star" style={{ top: '20%', right: '0%', left: 'auto', animationDelay: '1s', animationDuration: '2.5s' }}></div>
        <div className="shooting-star" style={{ top: '80%', right: 'auto', left: '30%', animationDelay: '2s', animationDuration: '3.5s' }}></div>
      </div>
      
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
        {isReportMissingDataModalOpen && role === 'health_worker' && <ReportMissingDataModal
            isOpen={isReportMissingDataModalOpen}
            onClose={closeAllModals}
            village={villageForReporting}
        />}
      </Suspense>
    </div>
  );
};

export default App;
