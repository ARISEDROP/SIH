import React from 'react';
import Modal from './Modal';
import { WaterScanResult, WaterStatus } from '../../types';
import { ShieldCheckIcon, AlertTriangleIcon, AlertOctagonIcon, LightBulbIcon, SpeakerIcon, InfoIcon } from '../common/icons';
import { useAppContext } from '../../context/AppContext';
import { translateText } from '../../services/gemini';
import { speakText } from '../../services/voice';
import { useTranslation } from '../../hooks/useTranslation';

interface WaterScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: WaterScanResult | null;
  onLogConcern: (notes: string) => void;
}

const statusConfig: { [key in WaterStatus]: { icon: React.ReactElement<any>; textClass: string; bgClass: string; borderColor: string; glowColor: string; } } = {
  safe: { icon: <ShieldCheckIcon />, textClass: 'text-emerald-300', bgClass: 'bg-emerald-500/20', borderColor: 'border-emerald-500/50', glowColor: 'text-emerald-400' },
  caution: { icon: <AlertTriangleIcon />, textClass: 'text-yellow-300', bgClass: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', glowColor: 'text-yellow-400' },
  unsafe: { icon: <AlertOctagonIcon />, textClass: 'text-red-400', bgClass: 'bg-red-500/20', borderColor: 'border-red-500/50', glowColor: 'text-red-400' },
};


const ConfidenceMeter: React.FC<{ value: number, status: WaterStatus }> = ({ value, status }) => {
    const { t } = useTranslation();
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const config = statusConfig[status];

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-slate-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${config.glowColor} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                    style={{ filter: `drop-shadow(0 0 5px currentColor)`}}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold text-white`}>{value}</span>
                <span className="text-xs text-gray-400">{t('modals.confidence')}</span>
            </div>
        </div>
    );
};


export const WaterScanResultModal: React.FC<WaterScanResultModalProps> = ({ isOpen, onClose, result, onLogConcern }) => {
  const { language } = useAppContext();
  const { t } = useTranslation();
  
  if (!result) return null;

  const config = statusConfig[result.status];
  const notesForLog = `Water quality scan for ${result.userName} showed a status of '${result.status}' with ${result.confidence}% confidence. AI Explanation: "${result.explanation}"`;

  const finalRecommendations = [...result.recommendations];
  if (result.confidence < 60 && !result.imageQualityFeedback?.toLowerCase().includes('retake')) {
      finalRecommendations.push('Retake photo in better conditions for higher accuracy.');
  }

  const handleSpeak = async () => {
    const textToSpeak = `
      AI analysis for ${result.userName} is complete. 
      The water status is ${result.status}, with a confidence score of ${result.confidence} percent. 
      AI Explanation: ${result.explanation}. 
      ${result.imageQualityFeedback ? `Image Quality Feedback: ${result.imageQualityFeedback}.` : ''}
      Recommendations: ${finalRecommendations.join('. ')}
    `;
    let translatedText = textToSpeak;
    if (language !== 'en-US') {
        const translationResult = await translateText(textToSpeak, language);
        if(translationResult) translatedText = translationResult;
    }
    await speakText(translatedText, language);
  };

  const handleClose = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('modals.scanResultTitle')}>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400 pr-4">{t('modals.reportFor')} <span className="font-bold text-white">{result.userName}</span> {t('modals.on')} {result.timestamp}</p>
            <button
                onClick={handleSpeak}
                aria-label={t('modals.readAloud')}
                className="flex-shrink-0 p-2 bg-slate-800/70 rounded-full text-cyan-300 hover:bg-slate-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
                <SpeakerIcon className="w-5 h-5" />
            </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
                <img src={result.image} alt="Water sample" className="w-32 h-32 object-cover rounded-lg border-2 border-slate-700" />
            </div>
            <div className={`flex-grow w-full p-4 rounded-lg flex items-center gap-4 ${config.bgClass} ${config.borderColor} border`}>
                {React.cloneElement(config.icon, { className: `w-8 h-8 ${config.textClass}`})}
                <div>
                    <p className="text-sm text-gray-300">AI Status</p>
                    <p className={`font-bold text-2xl ${config.textClass}`}>{result.status.charAt(0).toUpperCase() + result.status.slice(1)}</p>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-4 bg-slate-800/60 rounded-lg">
            <ConfidenceMeter value={result.confidence} status={result.status} />
            <div className="flex-grow text-sm text-gray-300">
                <p><span className="font-semibold text-white">Explanation:</span> {result.explanation}</p>
                {result.imageQualityFeedback && (
                    <div className="mt-2 p-2 bg-yellow-900/40 border border-yellow-500/30 rounded-md">
                        <p className="flex items-center gap-2 text-xs text-yellow-200">
                            <InfoIcon className="w-4 h-4" /> 
                            <span className="font-semibold">{t('modals.imageQualityFeedback')}:</span> {result.imageQualityFeedback}
                        </p>
                    </div>
                )}
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-cyan-200 mb-2 flex items-center gap-2"><LightBulbIcon /> {t('modals.recommendations')}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300 bg-slate-800/60 p-4 rounded-lg border border-slate-700">
                {finalRecommendations.map((rec, index) => <li key={index}>{rec}</li>)}
            </ul>
        </div>
        
        <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
            <button 
                onClick={() => onLogConcern(notesForLog)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-yellow-200 bg-yellow-800/80 rounded-lg hover:bg-yellow-700/80 transition-colors"
            >
                {t('modals.logConcern')}
            </button>
            <button 
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors"
            >
                {t('modals.close')}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(WaterScanResultModal);
