import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import Header from '../common/Header';
import WaterStatusCard from '../dashboard/WaterStatusCard';
import { PlusIcon, SparklesIcon, AlertOctagonIcon, SpeakerIcon, BookOpenIcon, ScannerIcon, CameraIcon, XIcon } from '../common/icons';
import { waterQualityMetrics, generateRandomMetrics, diseaseTrendsData, waterQualityHistory } from '../../constants';
import { analyzeWaterImage, translateText } from '../../services/gemini';
import { speakText } from '../../services/voice';
import { useAppContext } from '../../context/AppContext';
import { WaterStatus, Tip, WaterQualityMetrics } from '../../types';

const SymptomsFormModal = lazy(() => import('../modals/SymptomsFormModal'));
const ChatbotModal = lazy(() => import('../modals/ChatbotModal'));
const GuideModal = lazy(() => import('../modals/GuideModal'));
const ScannerAnimationModal = lazy(() => import('../modals/ScannerAnimationModal'));

interface OutbreakAlertBannerProps {
  diseaseName: string;
  language: string;
}

const OutbreakAlertBanner: React.FC<OutbreakAlertBannerProps> = ({ diseaseName, language }) => {
    const alertText = `High alert for ${diseaseName} in your area. Please ensure water is boiled before consumption and wash hands frequently.`;
    
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    const handlePlayAlert = async () => {
        let textToSpeak = await translateText(alertText, language);
        await speakText(textToSpeak, language);
    };

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

const VillagerDashboard: React.FC = () => {
  const { quickActionTips, reportSymptom, userProfile, language } = useAppContext();
  const [isSymptomsModalOpen, setIsSymptomsModalOpen] = useState(false);
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<Tip | null>(null);
  const [currentStatus, setCurrentStatus] = useState<WaterStatus>('caution');
  const [currentMetrics, setCurrentMetrics] = useState<WaterQualityMetrics>(waterQualityMetrics);
  const [history, setHistory] = useState(waterQualityHistory);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [descriptionOverride, setDescriptionOverride] = useState<string | null>(null);
  
  const [scanNotification, setScanNotification] = useState<string | null>(null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [scanForAnother, setScanForAnother] = useState(false);
  const [otherUserName, setOtherUserName] = useState('');

  useEffect(() => {
    if (isNotificationVisible) {
        const timer = setTimeout(() => setIsNotificationVisible(false), 5500);
        return () => clearTimeout(timer);
    }
  }, [isNotificationVisible]);

  const handleNotificationTransitionEnd = () => {
      if (!isNotificationVisible) setScanNotification(null);
  };

  const highThreatDisease = useMemo(() => diseaseTrendsData.find(d => d.threatLevel === 'high'), []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStartScan = async () => {
    setIsCheckingQuality(true);
    const oldStatus = currentStatus;
    await new Promise(resolve => setTimeout(resolve, 2500));

    let newStatus: WaterStatus;
    let newMetrics: WaterQualityMetrics;

    if (imageFile && imageBase64) {
        const result = await analyzeWaterImage(imageBase64.split(',')[1], imageFile.type);
        newStatus = result.status;
        newMetrics = generateRandomMetrics(newStatus);
        setDescriptionOverride(result.explanation);
    } else {
        const statuses: WaterStatus[] = ['safe', 'caution', 'unsafe'];
        newStatus = statuses.filter(s => s !== currentStatus)[Math.floor(Math.random() * 2)] || 'safe';
        newMetrics = generateRandomMetrics(newStatus);
        setDescriptionOverride(null);
    }
    
    setHistory(prev => prev.map(item => item.day === 'Today' ? { ...item, status: newStatus } : item));
    setCurrentStatus(newStatus);
    setCurrentMetrics(newMetrics);
    setIsCheckingQuality(false);
    setImageFile(null);
    setImageBase64('');
    setScanForAnother(false);
    setOtherUserName('');

    let notificationMessage = newStatus === oldStatus
        ? `Water quality remains '${newStatus}'. Impurity levels are stable.`
        : `Water quality has changed from '${oldStatus}' to '${newStatus}'.`;
    setScanNotification(notificationMessage);
    setIsNotificationVisible(true);
  };

  const safetyGuides = useMemo(() => quickActionTips.map(tip => (
    <button 
        key={tip.id}
        onClick={() => setActiveGuide(tip)}
        className="bg-slate-800/60 p-6 rounded-lg border border-slate-700 h-full text-center transition-all duration-300 hover:bg-slate-700/80 hover:border-cyan-500/50 hover:scale-105 active:scale-[0.98] will-change-transform"
    >
        <div className="text-4xl mb-3">{tip.icon}</div>
        <h4 className="font-bold text-white text-lg mb-2">{tip.title}</h4>
        <p className="text-sm text-gray-400">{tip.description}</p>
    </button>
  )), [quickActionTips]);

  const isAlertStatus = currentStatus === 'caution' || currentStatus === 'unsafe';

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <Header />
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
            <div 
                className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6 flex flex-col items-center text-center transition-all duration-300 hover:bg-slate-800/60 hover:border-cyan-500/40 ${isAlertStatus ? 'animate-pulse-glow' : ''}`}
                style={{'--glow-color': 'var(--cyan-rgb)'} as React.CSSProperties}
            >
                <div className="mb-4 text-cyan-400"><ScannerIcon className="w-10 h-10" /></div>
                <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">AI Water Scanner</h3>
                <p className="text-gray-400 mt-2 mb-4 text-sm flex-grow">Use AI to analyze a photo of your water or run a simulated test.</p>
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
          onSubmit={reportSymptom}
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
