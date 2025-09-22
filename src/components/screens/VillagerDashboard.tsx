import React, { useState, useMemo, useEffect, lazy, Suspense, useCallback, useRef } from 'react';
import Header from '../common/Header';
import WaterStatusCard from '../dashboard/WaterStatusCard';
import { PlusIcon, SparklesIcon, AlertOctagonIcon, SpeakerIcon, BookOpenIcon, ScannerIcon, CameraIcon, UploadIcon, XIcon } from '../common/icons';
import { waterQualityMetrics, generateRandomMetrics, diseaseTrendsData, waterQualityHistory } from '../../constants';
import { analyzeWaterImage, translateText } from '../../services/gemini';
import { speakText } from '../../services/voice';
import { useAppContext } from '../../context/AppContext';
import { WaterStatus, Tip, WaterQualityMetrics, WaterScanResult } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

const SymptomsFormModal = lazy(() => import('../modals/SymptomsFormModal'));
const ChatbotModal = lazy(() => import('../modals/ChatbotModal'));
const GuideModal = lazy(() => import('../modals/GuideModal'));
const ScannerAnimationModal = lazy(() => import('../modals/ScannerAnimationModal'));
const WaterScanResultModal = lazy(() => import('../modals/WaterScanResultModal'));

interface OutbreakAlertBannerProps {
  diseaseName: string;
  language: string;
}

const OutbreakAlertBanner: React.FC<OutbreakAlertBannerProps> = ({ diseaseName, language }) => {
    const { t_html } = useTranslation();
    const alertText = t_html('villager.highThreatText', { diseaseName });
    
    useEffect(() => {
        const playAlert = async () => {
            const translatedText = await translateText(alertText, language);
            // If translation fails (null), speak original alert in English.
            await speakText(translatedText || alertText, translatedText ? language : 'en-US');
        };
        playAlert();
        
        return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
    }, [diseaseName, language, alertText]);

    const handlePlayAlert = async () => {
        const translatedText = await translateText(alertText, language);
        await speakText(translatedText || alertText, translatedText ? language : 'en-US');
    };

    return (
        <div className="bg-red-900/80 backdrop-blur-md border border-red-500 rounded-2xl p-4 flex items-center gap-4 animate-crackling-glow" style={{'--glow-color': 'var(--red-rgb)'} as React.CSSProperties}>
            <AlertOctagonIcon className="w-10 h-10 text-red-300 flex-shrink-0" />
            <div className="flex-grow">
                <h3 className="font-bold text-red-200 text-lg">{t_html('villager.highThreatAlert')}</h3>
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
  const { 
    quickActionTips, 
    reportSymptom, 
    userProfile, 
    language,
    isHardwareConnected,
    liveStatus,
    liveMetrics
  } = useAppContext();
  const { t } = useTranslation();
  
  const [isSymptomsModalOpen, setIsSymptomsModalOpen] = useState(false);
  const [symptomModalInitialNotes, setSymptomModalInitialNotes] = useState('');
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<Tip | null>(null);
  
  // Local state for simulated/scanned data
  const [localStatus, setLocalStatus] = useState<WaterStatus>('caution');
  const [localMetrics, setLocalMetrics] = useState<WaterQualityMetrics>(waterQualityMetrics);
  const [history, setHistory] = useState(waterQualityHistory);
  
  const [isCheckingQuality, setIsCheckingQuality] = useState(false); // For scanner animation
  const [descriptionOverride, setDescriptionOverride] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  
  const [scanTarget, setScanTarget] = useState<'me' | 'other'>('me');
  const [otherUserName, setOtherUserName] = useState('');
  
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState<WaterScanResult | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Determine which data source to use for the main status card
  const displayStatus = isHardwareConnected ? liveStatus : localStatus;
  const displayMetrics = (isHardwareConnected && liveMetrics) ? liveMetrics : localMetrics;
  const isCheckingHardware = isHardwareConnected && !liveMetrics;
  
  // Update description based on data source
  const currentDescription = isHardwareConnected && liveMetrics 
    ? "Live data from nearby sensor." 
    : descriptionOverride;

  const highThreatDisease = useMemo(() => diseaseTrendsData.find(d => d.threatLevel === 'high'), []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File is too large. Please select a file smaller than 5MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const handleClearImage = () => {
    setImageFile(null);
    setImageBase64('');
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  const playScanResultAlert = useCallback(async (result: { status: WaterStatus; recommendations: string[] }) => {
    let alertTextPrefix = '';
    if (result.status === 'unsafe' || result.status === 'caution') {
      alertTextPrefix = 'Warning. ';
    }
    const alertText = `${alertTextPrefix}Water status is ${result.status}. Recommendations: ${result.recommendations.join('. ')}`;
    const translatedText = await translateText(alertText, language);
    // If translation fails (null), speak original alert in English.
    await speakText(translatedText || alertText, translatedText ? language : 'en-US');
  }, [language]);

  const handleSimulatedScan = async () => {
    setIsCheckingQuality(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

    const statuses: WaterStatus[] = ['safe', 'caution', 'unsafe'];
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const newMetrics = generateRandomMetrics(newStatus);
    
    setLocalStatus(newStatus);
    setLocalMetrics(newMetrics);
    setHistory(prev => prev.map(item => item.day === 'Today' ? { ...item, status: newStatus } : item));
    setDescriptionOverride(`Simulated scan result is '${newStatus}'. This is a random result for demonstration purposes.`);
    
    const alertText = `Simulated scan complete. Water status is ${newStatus}.`;
    try {
        const translatedText = await translateText(alertText, language);
        await speakText(translatedText || alertText, translatedText ? language : 'en-US');
    } catch(e) {
        console.error("Error in text-to-speech for simulated scan:", e);
    }

    setIsCheckingQuality(false);
  };

  const handleStartScan = async () => {
    if (!imageBase64 || !imageFile) return;

    setIsCheckingQuality(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 1. Get AI analysis in English
    const analysisResult = await analyzeWaterImage(imageBase64.split(',')[1], imageFile.type);
    
    // 2. Play alert using original English text (which will be translated by the function)
    await playScanResultAlert(analysisResult);

    // 3. Translate results for display if the user's language is not English
    let displayExplanation = analysisResult.explanation;
    let displayRecommendations = analysisResult.recommendations;

    if (language !== 'en-US' && analysisResult.explanation) {
        try {
            const [translatedExplanation, ...translatedRecs] = await Promise.all([
                translateText(analysisResult.explanation, language),
                ...analysisResult.recommendations.map(rec => translateText(rec, language))
            ]);
            displayExplanation = translatedExplanation || analysisResult.explanation;
            displayRecommendations = translatedRecs.map((t, i) => t || analysisResult.recommendations[i]);
        } catch (e) {
            console.error("Translation failed for scan result display:", e);
        }
    }

    const newStatus = analysisResult.status;
    const newMetrics = generateRandomMetrics(newStatus);
    
    // Update local state with the original English explanation from AI to keep a consistent internal state
    setDescriptionOverride(analysisResult.explanation);
    setHistory(prev => prev.map(item => item.day === 'Today' ? { ...item, status: newStatus } : item));
    setLocalStatus(newStatus);
    setLocalMetrics(newMetrics);

    // 4. Prepare data for the results modal using the translated text
    const resultData: WaterScanResult = {
        status: analysisResult.status,
        explanation: displayExplanation,
        recommendations: displayRecommendations,
        confidence: analysisResult.confidence,
        imageQualityFeedback: analysisResult.imageQualityFeedback,
        image: imageBase64,
        userName: scanTarget === 'me' ? userProfile.name : otherUserName.trim() || 'Unnamed',
        timestamp: new Date().toLocaleString(),
    };
    
    setScanResult(resultData);
    setIsResultModalOpen(true);

    setIsCheckingQuality(false);
    handleClearImage();
    setOtherUserName('');
  };

  const handleLogConcern = (notes: string) => {
    setIsResultModalOpen(false);
    setSymptomModalInitialNotes(notes);
    setTimeout(() => {
      setIsSymptomsModalOpen(true);
    }, 300);
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

  const isAlertStatus = displayStatus === 'caution' || displayStatus === 'unsafe';

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
      <Header />
      <div className="mt-8 space-y-8">
        {displayStatus === 'unsafe' && highThreatDisease && <OutbreakAlertBanner diseaseName={highThreatDisease.name} language={language} />}

        <WaterStatusCard 
          status={displayStatus} 
          metrics={displayMetrics}
          isChecking={isCheckingQuality || isCheckingHardware}
          descriptionOverride={currentDescription}
          history={history}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
                className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6 flex flex-col text-center transition-all duration-300 shadow-cyan-500/10 shadow-[0_0_15px] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]`}
            >
                <div className="mb-4 text-cyan-400"><ScannerIcon className="w-10 h-10 mx-auto" /></div>
                <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">{t('villager.aiScanner')}</h3>
                <p className="text-gray-400 mt-2 text-sm">{t('villager.aiScannerDesc')}</p>
                
                <div className="w-full space-y-4 mt-4 flex-grow flex flex-col">
                  <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700">
                      <button onClick={() => setScanTarget('me')} className={`w-1/2 py-2 text-sm font-semibold rounded-lg transition-colors ${scanTarget === 'me' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`}>{t('villager.forMe')}</button>
                      <button onClick={() => setScanTarget('other')} className={`w-1/2 py-2 text-sm font-semibold rounded-lg transition-colors ${scanTarget === 'other' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`}>{t('villager.forSomeoneElse')}</button>
                  </div>

                  {scanTarget === 'other' && (
                      <div className="animate-fade-in" style={{animationDuration: '300ms'}}>
                          <input
                              type="text" value={otherUserName} onChange={(e) => setOtherUserName(e.target.value)}
                              placeholder={t('villager.enterNamePlaceholder')}
                              className="block w-full bg-slate-800/60 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                          />
                      </div>
                  )}

                  <div className="flex-grow flex flex-col justify-center">
                    <div className="w-full h-32 bg-slate-800/60 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center p-2">
                        {imageBase64 ? (
                            <div className="relative">
                                <img src={imageBase64} alt="Water sample preview" className="max-w-full max-h-28 object-contain rounded-lg" />
                                <button 
                                    onClick={handleClearImage}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-500 transition-transform active:scale-90"
                                    aria-label="Clear image"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <span className="text-slate-400 text-sm px-4">{t('villager.imageSourceHint')}</span>
                        )}
                    </div>
                  </div>

                  <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                  <input ref={galleryInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => cameraInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-700/60 hover:border-cyan-500/50 hover:text-cyan-300">
                        <CameraIcon className="w-5 h-5" />
                        {t('villager.takePhoto')}
                    </button>
                    <button onClick={() => galleryInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-700/60 hover:border-cyan-500/50 hover:text-cyan-300">
                        <UploadIcon className="w-5 h-5" />
                        {t('villager.fromGallery')}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={handleSimulatedScan}
                        disabled={isCheckingQuality || !!imageBase64}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-slate-700 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {t('villager.runSimulatedScan')}
                    </button>
                    <button
                        onClick={handleStartScan}
                        disabled={isCheckingQuality || !imageBase64}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-cyan-800 disabled:text-gray-400 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        <ScannerIcon className="w-5 h-5" />
                        {t('villager.analyzePhoto')}
                    </button>
                </div>
            </div>
             <div 
                className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-red-500/20 p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-red-500/40 ${isAlertStatus ? 'animate-crackling-glow' : 'shadow-red-500/10 shadow-[0_0_15px]'} hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]`}
                style={{'--glow-color': 'var(--red-rgb)'} as React.CSSProperties}
            >
                <div className="mb-4 text-red-400"><PlusIcon className="w-10 h-10" /></div>
                <h3 className="text-xl font-semibold text-red-300 tracking-wide">{t('villager.reportSymptoms')}</h3>
                <p className="text-gray-400 mt-2 mb-4 text-sm flex-grow">{t('villager.reportSymptomsDesc')}</p>
                <button
                    onClick={() => { setSymptomModalInitialNotes(''); setIsSymptomsModalOpen(true); }}
                    className="mt-auto w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transform hover:scale-105 active:scale-[0.98] will-change-transform"
                >
                    {t('villager.logSymptoms')}
                </button>
            </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-cyan-400"><BookOpenIcon /></div>
            <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">{t('villager.safetyGuides')}</h3>
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
        aria-label={t('villager.openAIChat')}
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
          initialNotes={symptomModalInitialNotes}
        />}
        {isChatbotModalOpen && <ChatbotModal isOpen={isChatbotModalOpen} onClose={() => setIsChatbotModalOpen(false)} />}
        {activeGuide && <GuideModal isOpen={!!activeGuide} onClose={() => setActiveGuide(null)} guide={activeGuide} language={language} />}
        {isResultModalOpen && <WaterScanResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          result={scanResult}
          onLogConcern={handleLogConcern}
        />}
      </Suspense>
    </div>
  );
};

export default React.memo(VillagerDashboard);
