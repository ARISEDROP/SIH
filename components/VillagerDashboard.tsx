

import React, { useState, useMemo, useEffect, lazy, Suspense, useCallback } from 'react';
import Header from './Header';
import WaterStatusCard from './WaterStatusCard';
import { PlusIcon, SparklesIcon, AlertOctagonIcon, SpeakerIcon, BookOpenIcon, ScannerIcon, CameraIcon, XIcon } from './icons';
import { waterQualityMetrics, generateRandomMetrics, WaterStatus, WaterQualityMetrics, diseaseTrendsData, Tip, waterQualityHistory, SymptomReport, UserProfile } from '../constants';
import { analyzeWaterImage, translateText } from '../gemini';
import { speakText } from '../voice';

const SymptomsFormModal = lazy(() => import('./SymptomsFormModal'));
const ChatbotModal = lazy(() => import('./ChatbotModal'));
const GuideModal = lazy(() => import('./GuideModal'));
const ScannerAnimationModal = lazy(() => import('./ScannerAnimationModal'));


interface VillagerDashboardProps {
  onLogout: () => void;
  tips: Tip[];
  onOpenProfile: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  userProfile: UserProfile;
  onOpenAppGuide: () => void;
  onOpenDeviceHealth: () => void;
  onOpenHardwareModal: () => void;
  onOpenAbout: () => void;
  isHardwareConnected: boolean;
  onReportSymptoms: (data: Omit<SymptomReport, 'id' | 'reportedAt' | 'resolved'>) => void;
  onOpenStorageManager: () => void;
  offlineQueueCount: number;
}

interface OutbreakAlertBannerProps {
  diseaseName: string;
  language: string;
}


const OutbreakAlertBanner: React.FC<OutbreakAlertBannerProps> = ({ diseaseName, language }) => {
    const alertText = `High alert for ${diseaseName} in your area. Please ensure water is boiled before consumption and wash hands frequently.`;
    
    const handlePlayAlert = useCallback(async () => {
        let textToSpeak = alertText;
        if (language !== 'en-US') {
            textToSpeak = await translateText(alertText, language);
        }
        await speakText(textToSpeak, language);
    }, [alertText, language]);

    useEffect(() => {
        // Automatically play the alert when the banner appears.
        handlePlayAlert();
        
        // Cleanup function to stop speech synthesis when the banner is unmounted
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [handlePlayAlert]);

    return (
        <div className="bg-red-900/80 backdrop-blur-md border border-red-500 rounded-2xl p-4 flex items-center gap-4 animate-pulse-glow" style={{'--glow-color': 'var(--red-rgb)'} as React.CSSProperties}>
            <AlertOctagonIcon className="w-10 h-10 text-red-300 flex-shrink-0" />
            <div className="flex-grow">
                <h3 className="font-bold text-red-200 text-lg">High Threat Alert</h3>
                <p className="text-red-200 text-sm">{alertText}</p>
            </div>
            <button 
                onClick={handlePlayAlert}
                aria-label="Read alert aloud"
                className="p-2 bg-red-800/70 rounded-full text-red-200 hover:bg-red-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-red-900">
                <SpeakerIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

const VillagerDashboard: React.FC<VillagerDashboardProps> = ({ onLogout, tips, onOpenProfile, language, onLanguageChange, userProfile, onOpenAppGuide, onOpenDeviceHealth, onOpenHardwareModal, onOpenAbout, isHardwareConnected, onReportSymptoms, onOpenStorageManager, offlineQueueCount }) => {
  const [isSymptomsModalOpen, setIsSymptomsModalOpen] = useState(false);
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<Tip | null>(null);
  const [currentStatus, setCurrentStatus] = useState<WaterStatus>('caution');
  const [currentMetrics, setCurrentMetrics] = useState<WaterQualityMetrics>(waterQualityMetrics);
  const [history, setHistory] = useState(waterQualityHistory);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [localTips, setLocalTips] = useState<Tip[]>(tips);
  const [descriptionOverride, setDescriptionOverride] = useState<string | null>(null);
  
  // State for scan notification with smooth transitions
  const [scanNotification, setScanNotification] = useState<string | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [scanForAnother, setScanForAnother] = useState(false);
  const [otherUserName, setOtherUserName] = useState('');

  useEffect(() => {
    // Load tips from localStorage first for offline access, then fall back to props.
    try {
        const storedTips = localStorage.getItem('quickActionTips');
        if (storedTips) {
            const parsedTips = JSON.parse(storedTips);
            if (Array.isArray(parsedTips) && parsedTips.length > 0) {
                setLocalTips(parsedTips);
            }
        }
    } catch (e) {
        console.error("Failed to parse tips from localStorage", e);
    }
  }, []);
  
  // When tips from props change (e.g., updated by Health Worker), update state and localStorage.
  useEffect(() => {
    setLocalTips(tips);
    try {
        localStorage.setItem('quickActionTips', JSON.stringify(tips));
    } catch (e) {
        console.error("Failed to save tips to localStorage", e);
    }
  }, [tips]);
  
  // Effect to automatically hide the notification after a delay
  useEffect(() => {
    if (isNotificationVisible) {
        const timer = setTimeout(() => {
            setIsNotificationVisible(false);
        }, 5500); // Start hiding after 5.5s
        return () => clearTimeout(timer);
    }
  }, [isNotificationVisible]);

  const handleNotificationTransitionEnd = () => {
      // When the fade-out transition ends, remove the notification from the DOM
      if (!isNotificationVisible) {
          setScanNotification(null);
      }
  };

  const highThreatDisease = useMemo(() => diseaseTrendsData.find(d => d.threatLevel === 'high'), []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartScan = async () => {
    setIsCheckingQuality(true);
    const oldStatus = currentStatus;
    // Show scanner animation for at least 2.5s
    await new Promise(resolve => setTimeout(resolve, 2500));

    let newStatus: WaterStatus;
    let newMetrics: WaterQualityMetrics;

    if (imageFile && imageBase64) {
        const base64Data = imageBase64.split(',')[1];
        const mimeType = imageFile.type;
        const result = await analyzeWaterImage(base64Data, mimeType);
        newStatus = result.status;
        newMetrics = generateRandomMetrics(newStatus);
        setDescriptionOverride(result.explanation);
    } else {
        const statuses: WaterStatus[] = ['safe', 'caution', 'unsafe'];
        const availableStatuses = statuses.filter(s => s !== currentStatus);
        newStatus = availableStatuses[Math.floor(Math.random() * availableStatuses.length)] || 'safe';
        newMetrics = generateRandomMetrics(newStatus);
        setDescriptionOverride(null); // Clear override
    }
    
    // Automatically play a generic "unsafe" alert if there is no specific outbreak alert.
    if (newStatus === 'unsafe' && oldStatus !== 'unsafe' && !highThreatDisease) {
        const alertText = "Warning. The water quality is now unsafe. High contamination levels detected. Do not drink this water.";
        const playGenericAlert = async () => {
            let textToSpeak = await translateText(alertText, language);
            await speakText(textToSpeak, language);
        };
        playGenericAlert();
    }
    
    setHistory(prevHistory => 
        prevHistory.map(item => 
            item.day === 'Today' ? { ...item, status: newStatus } : item
        )
    );
    setCurrentStatus(newStatus);
    setCurrentMetrics(newMetrics);
    setIsCheckingQuality(false);
    setImageFile(null);
    setImageBase64('');
    setScanForAnother(false);
    setOtherUserName('');

    let notificationMessage = '';
    if (newStatus === oldStatus) {
        notificationMessage = `Water quality remains '${newStatus}'. Impurity levels are stable.`;
    } else {
        const statusValues: Record<WaterStatus, number> = { safe: 1, caution: 2, unsafe: 3 };
        if (statusValues[newStatus] < statusValues[oldStatus]) {
            notificationMessage = `Improvement detected! Water quality has improved from '${oldStatus}' to '${newStatus}'. Impurity levels appear lower.`;
        } else {
            notificationMessage = `Degradation detected. Water quality has changed from '${oldStatus}' to '${newStatus}'. Impurity levels may have increased.`;
        }
    }
    // Set notification content and trigger visibility
    setScanNotification(notificationMessage);
    setIsNotificationVisible(true);
  };

  const safetyGuides = useMemo(() => localTips.map(tip => (
    <button 
        key={tip.id}
        onClick={() => setActiveGuide(tip)}
        className="bg-slate-800/60 p-6 rounded-lg border border-slate-700 h-full text-center transition-all duration-300 hover:bg-slate-700/80 hover:border-cyan-500/50 hover:scale-105 active:scale-[0.98] will-change-transform"
    >
        <div className="text-4xl mb-3">{tip.icon}</div>
        <h4 className="font-bold text-white text-lg mb-2">{tip.title}</h4>
        <p className="text-sm text-gray-400">{tip.description}</p>
    </button>
  )), [localTips]);

  const isAlertStatus = currentStatus === 'caution' || currentStatus === 'unsafe';

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <Header 
        role="Villager" 
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
        isHardwareConnected={isHardwareConnected}
        onOpenStorageManager={onOpenStorageManager}
        offlineQueueCount={offlineQueueCount}
       />
      <div className="mt-8 space-y-8">
        {currentStatus === 'unsafe' && highThreatDisease && <OutbreakAlertBanner diseaseName={highThreatDisease.name} language={language} />}

        <WaterStatusCard 
          status={currentStatus} 
          metrics={currentMetrics}
          isChecking={isCheckingQuality}
          descriptionOverride={descriptionOverride}
          history={history}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Scanner Action */}
            <div 
                className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6 flex flex-col items-center text-center transition-all duration-300 hover:bg-slate-800/60 hover:border-cyan-500/40 ${isAlertStatus ? 'animate-pulse-glow' : ''}`}
                style={{'--glow-color': 'var(--cyan-rgb)'} as React.CSSProperties}
            >
                <div className="mb-4 text-cyan-400"><ScannerIcon className="w-10 h-10" /></div>
                <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">AI Water Scanner</h3>
                <p className="text-gray-400 mt-2 mb-4 text-sm flex-grow">Use AI to analyze a photo of your water or run a simulated test.</p>
                
                <div className="w-full">
                    <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="scan-for-another"
                                name="scan-for-another"
                                type="checkbox"
                                checked={scanForAnother}
                                onChange={(e) => setScanForAnother(e.target.checked)}
                                className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-500 rounded bg-slate-700"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="scan-for-another" className="font-medium text-gray-300">
                                This scan is for another person
                            </label>
                        </div>
                    </div>

                    {scanForAnother && (
                        <div className="w-full mt-3 animate-fade-in" style={{animationDuration: '300ms'}}>
                            <input
                                type="text"
                                value={otherUserName}
                                onChange={(e) => setOtherUserName(e.target.value)}
                                placeholder="Enter other person's name (optional)"
                                className="block w-full bg-slate-800/60 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                            />
                        </div>
                    )}
                </div>

                <div className="w-full mt-4">
                    <input type="file" id="water-photo" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <label htmlFor="water-photo" className="w-full cursor-pointer flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-slate-700 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 active:scale-[0.98]">
                        <CameraIcon className="w-5 h-5" />
                        {imageFile ? imageFile.name : 'Upload Photo'}
                    </label>
                    {imageBase64 && (
                        <div className="mt-4">
                            <img src={imageBase64} alt="Water sample preview" className="w-24 h-24 object-cover rounded-lg mx-auto border-2 border-cyan-500/50" />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleStartScan}
                    disabled={isCheckingQuality}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transform hover:scale-105 disabled:bg-slate-700 disabled:cursor-not-allowed active:scale-[0.98] will-change-transform"
                >
                    {imageFile ? 'Analyze Photo' : 'Start Simulated Scan'}
                </button>
            </div>

            {/* Report Symptoms Action */}
            <div 
                className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-red-500/20 p-6 flex flex-col items-center text-center transition-all duration-300 hover:bg-slate-800/60 hover:border-red-500/40 ${isAlertStatus ? 'animate-pulse-glow' : ''}`}
                style={{'--glow-color': 'var(--red-rgb)'} as React.CSSProperties}
            >
                <div className="mb-4 text-red-400"><PlusIcon className="w-10 h-10" /></div>
                <h3 className="text-xl font-semibold text-red-300 tracking-wide">Report Symptoms</h3>
                <p className="text-gray-400 mt-2 mb-4 text-sm flex-grow">Feeling unwell? Log your symptoms for a health worker.</p>
                <button
                    onClick={() => setIsSymptomsModalOpen(true)}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transform hover:scale-105 active:scale-[0.98] will-change-transform"
                >
                    Log Symptoms
                </button>
            </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-cyan-400"><BookOpenIcon /></div>
            <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">Safety Guides</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safetyGuides}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setIsChatbotModalOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 flex items-center justify-center gap-2 w-16 h-16 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/20 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-4 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-110 active:scale-100 animate-pulse-glow will-change-transform"
        style={{'--glow-color': '147, 51, 234'} as React.CSSProperties}
        aria-label="Open AI Chatbot"
      >
        <SparklesIcon className="w-8 h-8"/>
      </button>

      <Suspense fallback={null}>
        {isCheckingQuality && <ScannerAnimationModal isOpen={isCheckingQuality} />}
        {isSymptomsModalOpen && <SymptomsFormModal 
          isOpen={isSymptomsModalOpen} 
          onClose={() => setIsSymptomsModalOpen(false)} 
          onSubmit={onReportSymptoms}
          userVillage={userProfile.village}
        />}
        {isChatbotModalOpen && <ChatbotModal isOpen={isChatbotModalOpen} onClose={() => setIsChatbotModalOpen(false)} />}
        {activeGuide && <GuideModal isOpen={!!activeGuide} onClose={() => setActiveGuide(null)} guide={activeGuide} language={language} />}
      </Suspense>

      {scanNotification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
             <div 
                onTransitionEnd={handleNotificationTransitionEnd}
                className={`bg-slate-800/80 backdrop-blur-md text-white px-6 py-4 rounded-lg shadow-lg border border-cyan-500/30 flex items-center justify-between transition-all duration-500 ease-in-out ${isNotificationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
             >
                <p className="text-sm">{scanNotification}</p>
                <button 
                  onClick={() => setIsNotificationVisible(false)} 
                  className="text-gray-400 hover:text-white ml-4 flex-shrink-0"
                  aria-label="Dismiss notification"
                >
                    <XIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(VillagerDashboard);