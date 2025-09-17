import React, { useState, useMemo, useEffect, lazy, Suspense, useCallback } from 'react';
import Header from '../common/Header';
import WaterStatusCard from '../dashboard/WaterStatusCard';
import { PlusIcon, SparklesIcon, AlertOctagonIcon, SpeakerIcon, BookOpenIcon, ScannerIcon, CameraIcon, UserIcon } from '../common/icons';
import { waterQualityMetrics, generateRandomMetrics, diseaseTrendsData, waterQualityHistory } from '../../constants';
import { analyzeWaterImage, translateText } from '../../services/gemini';
import { speakText } from '../../services/voice';
import { useAppContext } from '../../context/AppContext';
import { WaterStatus, Tip, WaterQualityMetrics, WaterScanResult } from '../../types';

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
    const alertText = `High alert for ${diseaseName} in your area. Please ensure water is boiled before consumption and wash hands frequently.`;
    
    useEffect(() => {
        const playAlert = async () => {
            let textToSpeak = await translateText(alertText, language);
            await speakText(textToSpeak, language);
        };
        playAlert();
        
        return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
    }, [diseaseName, language, alertText]);

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
  const [symptomModalInitialNotes, setSymptomModalInitialNotes] = useState('');
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<Tip | null>(null);
  const [currentStatus, setCurrentStatus] = useState<WaterStatus>('caution');
  const [currentMetrics, setCurrentMetrics] = useState<WaterQualityMetrics>(waterQualityMetrics);
  const [history, setHistory] = useState(waterQualityHistory);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [descriptionOverride, setDescriptionOverride] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  
  const [scanTarget, setScanTarget] = useState<'me' | 'other'>('me');
  const [otherUserName, setOtherUserName] = useState('');
  
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState<WaterScanResult | null>(null);


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

  const playScanResultAlert = useCallback(async (result: { status: WaterStatus; recommendations: string[] }) => {
    let alertTextPrefix = '';
    if (result.status === 'unsafe' || result.status === 'caution') {
      alertTextPrefix = 'Warning. ';
    }
    const alertText = `${alertTextPrefix}Water status is ${result.status}. Recommendations: ${result.recommendations.join('. ')}`;
    const translatedText = await translateText(alertText, language);
    await speakText(translatedText, language);
  }, [language]);


  const handleStartScan = async () => {
    if (!imageBase64 || !imageFile) return;

    setIsCheckingQuality(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    const analysisResult = await analyzeWaterImage(imageBase64.split(',')[1], imageFile.type);
    
    // Play an immediate voice alert with the results.
    await playScanResultAlert(analysisResult);

    const newStatus = analysisResult.status;
    const newMetrics = generateRandomMetrics(newStatus);
    setDescriptionOverride(analysisResult.explanation);
    setHistory(prev => prev.map(item => item.day === 'Today' ? { ...item, status: newStatus } : item));
    setCurrentStatus(newStatus);
    setCurrentMetrics(newMetrics);

    // Create detailed report for modal
    const resultData: WaterScanResult = {
        ...analysisResult,
        image: imageBase64,
        userName: scanTarget === 'me' ? userProfile.name : otherUserName.trim() || 'Unnamed',
        timestamp: new Date().toLocaleString(),
    };
    
    setScanResult(resultData);
    setIsResultModalOpen(true);

    // Reset form
    setIsCheckingQuality(false);
    setImageFile(null);
    setImageBase64('');
    setOtherUserName('');
  };

  const handleLogConcern = (notes: string) => {
    setIsResultModalOpen(false);
    setSymptomModalInitialNotes(notes);
    setTimeout(() => {
      setIsSymptomsModalOpen(true);
    }, 300); // Delay to allow first modal to close
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
                className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-lg border border-cyan-500/20 p-6 flex flex-col text-center transition-all duration-300 ${isAlertStatus ? 'animate-pulse-glow' : ''}`}
                style={{'--glow-color': 'var(--cyan-rgb)'} as React.CSSProperties}
            >
                <div className="mb-4 text-cyan-400"><ScannerIcon className="w-10 h-10 mx-auto" /></div>
                <h3 className="text-xl font-semibold text-cyan-300 tracking-wide">AI Water Scanner</h3>
                <p className="text-gray-400 mt-2 text-sm">A guided process to analyze your water sample.</p>
                
                <div className="w-full space-y-4 mt-4 flex-grow flex flex-col">
                  {/* Step 1: Target Selection */}
                  <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700">
                      <button onClick={() => setScanTarget('me')} className={`w-1/2 py-2 text-sm font-semibold rounded-lg transition-colors ${scanTarget === 'me' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`}>For Me</button>
                      <button onClick={() => setScanTarget('other')} className={`w-1/2 py-2 text-sm font-semibold rounded-lg transition-colors ${scanTarget === 'other' ? 'bg-cyan-600 text-white' : 'text-gray-300'}`}>For Someone Else</button>
                  </div>

                  {/* Step 2: Name Input */}
                  {scanTarget === 'other' && (
                      <div className="animate-fade-in" style={{animationDuration: '300ms'}}>
                          <input
                              type="text" value={otherUserName} onChange={(e) => setOtherUserName(e.target.value)}
                              placeholder="Enter person's name"
                              className="block w-full bg-slate-800/60 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                          />
                      </div>
                  )}

                  {/* Step 3: Image Upload */}
                  <div className="flex-grow flex flex-col justify-center">
                    <input type="file" id="water-photo" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                    <label htmlFor="water-photo" className="w-full h-full cursor-pointer flex flex-col items-center justify-center gap-2 p-4 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-slate-800/60 border-2 border-dashed border-slate-700 text-slate-400 hover:bg-slate-700/60 hover:border-cyan-500/50 hover:text-cyan-300">
                      {imageBase64 ? (
                        <img src={imageBase64} alt="Water sample preview" className="w-24 h-24 object-cover rounded-lg" />
                      ) : (
                        <>
                          <CameraIcon className="w-8 h-8" />
                          <span>Tap to Capture or Upload Photo</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Step 4: Analyze Button */}
                <button
                    onClick={handleStartScan}
                    disabled={isCheckingQuality || !imageBase64}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-cyan-600 text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transform hover:scale-105 disabled:bg-slate-700 disabled:cursor-not-allowed active:scale-[0.98] will-change-transform"
                >
                    Analyze Water Sample
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
                    onClick={() => { setSymptomModalInitialNotes(''); setIsSymptomsModalOpen(true); }}
                    className="mt-auto w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transform hover:scale-105 active:scale-[0.98] will-change-transform"
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