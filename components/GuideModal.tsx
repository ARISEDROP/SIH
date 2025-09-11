
import React from 'react';
import Modal from './Modal';
import { Tip } from '../constants';
import { SpeakerIcon } from './icons';
import { speakText } from '../voice';
import { translateText } from '../gemini';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: Tip | null;
  language: string;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, guide, language }) => {
  if (!guide) return null;

  const handlePlayGuide = async () => {
    const textToSpeak = `${guide.title}. ${guide.steps.join('. ')}`;
    let translatedText = textToSpeak;
    if (language !== 'en-US') {
        translatedText = await translateText(textToSpeak, language);
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
    <Modal isOpen={isOpen} onClose={handleClose} title={guide.title}>
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 mb-6">
                <div className="text-6xl">{guide.icon}</div>
                <div className="flex-grow">
                    <p className="text-gray-300">{guide.description}</p>
                </div>
                 <button 
                    onClick={handlePlayGuide}
                    aria-label="Read guide aloud"
                    className="p-3 bg-slate-800/70 rounded-full text-cyan-300 hover:bg-slate-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900">
                    <SpeakerIcon className="w-6 h-6" />
                </button>
            </div>

            <ol className="space-y-3 list-decimal list-inside text-gray-300 bg-slate-800/60 p-4 rounded-lg border border-slate-700">
                {guide.steps.map((step, index) => (
                    <li key={index} className="pl-2 leading-relaxed">
                        <span className="font-semibold text-white">{step.split('.')[0]}.</span>{step.substring(step.indexOf('.') + 1)}
                    </li>
                ))}
            </ol>
        </div>
    </Modal>
  );
};

export default React.memo(GuideModal);
