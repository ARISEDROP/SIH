import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import jsPDF from 'jspdf';
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
    reportSymptom: (newReportData: Omit<SymptomReport, 'id' | 'reportedAt' | 'resolved' | 'userName' | 'userAvatar'>) => void;
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
    exportPdfReport: () => void;

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
          setSymptomsData(prev => [...prev, ...offlineQueue].sort((a, b) => b.id - a.id));
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
  
  const reportSymptom = useCallback((newReportData: Omit<SymptomReport, 'id' | 'reportedAt' | 'resolved' | 'userName' | 'userAvatar'>) => {
    const newReport: SymptomReport = {
        ...newReportData, 
        id: Date.now(), 
        reportedAt: 'Just now', 
        resolved: false,
        userName: userProfile.name,
        userAvatar: userProfile.avatar,
    };
    if (isOnline) {
        setSymptomsData(prev => [newReport, ...prev]);
    } else {
        addToOfflineQueue(newReport);
        setOfflineQueueCount(prev => prev + 1);
    }
  }, [isOnline, userProfile]);
  
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
  
  const exportPdfReport = useCallback(() => {
    if (symptomsData.length === 0) {
        alert("No log data to export.");
        return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    const addHeader = () => {
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Community Health Log Report", pageWidth / 2, y, { align: 'center' });
        y += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
        doc.setTextColor(0);
        y += 15;
    };

    const addFooter = () => {
        const pageCount = (doc.internal as any).pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }
    };
    
    addHeader();

    const totalReports = symptomsData.length;
    const resolvedReports = symptomsData.filter(r => r.resolved).length;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Summary", margin, y);
    y += 7;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - margin * 2, 15, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Reports: ${totalReports}`, margin + 5, y + 9);
    doc.text(`Resolved: ${resolvedReports}`, margin + 70, y + 9);
    doc.text(`Unresolved: ${totalReports - resolvedReports}`, margin + 120, y + 9);
    y += 25;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Log", margin, y);
    y += 5;

    symptomsData.forEach((report) => {
        const contentWidth = pageWidth - margin * 2;
        let startY = y;
        let textY = startY + 10;
        let textX = margin + 5;
        let boxContentWidth = contentWidth - 10;
        let photoHeight = 0;

        if (report.photo) {
            try {
                const imgProps = doc.getImageProperties(report.photo);
                const photoWidth = 60;
                photoHeight = (imgProps.height * photoWidth) / imgProps.width;
                photoHeight = Math.min(photoHeight, 80);
                textX = margin + photoWidth + 10;
                boxContentWidth = contentWidth - photoWidth - 15;
            } catch (e) { console.error("Could not process image for PDF", e); }
        }
        
        let textBlockHeight = 0;
        const villageLines = doc.splitTextToSize(`${report.village} (${report.resolved ? "Resolved" : "Unresolved"})`, boxContentWidth);
        textBlockHeight += villageLines.length * 5 + 5;
        if(report.userName) {
             const userLines = doc.splitTextToSize(`Reported by: ${report.userName}`, boxContentWidth);
             textBlockHeight += userLines.length * 5 + 2;
        }
        const symptomsLines = doc.splitTextToSize(`Symptoms: ${report.symptoms}`, boxContentWidth);
        textBlockHeight += symptomsLines.length * 5;
        if(report.notes) {
            const notesLines = doc.splitTextToSize(`Notes: "${report.notes}"`, boxContentWidth);
            textBlockHeight += notesLines.length * 5 + 2;
        }
        textBlockHeight += 8;

        const boxHeight = Math.max(photoHeight + 10, textBlockHeight + 10);
        
        if (y + boxHeight > pageHeight - 20) {
            doc.addPage();
            y = margin;
            startY = y;
            textY = y + 10;
        }

        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, 'S');

        if (report.photo) {
            try {
                const format = report.photo.substring("data:image/".length, report.photo.indexOf(";base64")).toUpperCase();
                if (['JPEG', 'PNG', 'WEBP'].includes(format)) {
                    doc.addImage(report.photo, format, margin + 5, y + 5, 60, photoHeight);
                } else {
                     doc.addImage(report.photo, 'JPEG', margin + 5, y + 5, 60, photoHeight);
                }
            } catch (e) {
                 doc.setFontSize(8).setTextColor(150,0,0).text("Image Error", margin + 5, y + 10);
            }
        }
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        if (report.resolved) doc.setTextColor(0, 100, 0); else doc.setTextColor(190, 0, 0);
        doc.text(villageLines, textX, textY);
        doc.setTextColor(0);
        textY += villageLines.length * 5 + 2;

        if (report.userName) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80);
            doc.text(`Reported by: ${report.userName}`, textX, textY);
            doc.setTextColor(0);
            textY += 5;
        }
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        doc.text(symptomsLines, textX, textY);
        textY += symptomsLines.length * 5;

        if (report.notes) {
            textY += 2;
            doc.setFont("helvetica", "italic");
            doc.setTextColor(100);
            const notesLines = doc.splitTextToSize(`Notes: "${report.notes}"`, boxContentWidth);
            doc.text(notesLines, textX, textY);
            doc.setTextColor(0);
            textY += notesLines.length * 5;
        }
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8).setTextColor(150).text(`Reported: ${report.reportedAt}`, textX, startY + boxHeight - 5);
        doc.setTextColor(0);
        
        y += boxHeight + 5;
    });

    addFooter();
    doc.save(`health_log_report_${new Date().toISOString().slice(0, 10)}.pdf`);
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
      const newHistory = [...dataHistory, data].slice(-20);
      setDataHistory(newHistory);

      const [interpretation, health] = await Promise.all([
          interpretSensorData(data),
          analyzeSensorHealth(newHistory)
      ]);

      if (interpretation) setAiInterpretation(interpretation.summary);
      if (health) setSensorHealth(health);

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
      storageUsage, exportLog, restoreLog, clearLog, exportPdfReport,
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
