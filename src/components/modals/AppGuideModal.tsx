import React from 'react';
import Modal from './Modal';
import { Role } from '../../types';
import { UserIcon, UserGroupIcon, ScannerIcon, PlusIcon, MapIcon, BookOpenIcon, SparklesIcon, RadarIcon, InfoIcon } from '../common/icons';

interface AppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  onOpenAbout: () => void;
}

const GuideItem: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
    <li className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400">{icon}</div>
        <div>
            <h4 className="font-bold text-white">{title}</h4>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
    </li>
);

const AppGuideModal: React.FC<AppGuideModalProps> = ({ isOpen, onClose, role, onOpenAbout }) => {
    
    const villagerGuide = (
        <>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5"/> Villager Guide</h3>
            <ul className="space-y-4">
                <GuideItem icon={<ScannerIcon />} title="1. Check Water Quality" description="Use the 'AI Water Scanner' on your dashboard. You can run a simulated test or upload a photo of a water sample for an AI-powered analysis." />
                <GuideItem icon={<PlusIcon />} title="2. Report Symptoms" description="If you feel unwell, tap 'Report Symptoms'. Select what you're feeling and add notes. This alerts local health workers." />
                <GuideItem icon={<BookOpenIcon />} title="3. Learn Safety Tips" description="Browse the 'Safety Guides' section for essential health information, like how to boil water correctly or wash hands properly." />
                <GuideItem icon={<SparklesIcon />} title="4. Ask the AI Assistant" description="Tap the purple sparkle button to chat with Aqua, our AI. Ask questions about water safety, but always consult a health worker for medical advice." />
            </ul>
        </>
    );

    const healthWorkerGuide = (
        <>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> Health Worker Guide</h3>
            <ul className="space-y-4">
                <GuideItem icon={<MapIcon />} title="1. Monitor Villages" description="Your dashboard shows the real-time water status for all villages. Use the list or map view to quickly assess the situation." />
                <GuideItem icon={<UserGroupIcon />} title="2. Manage Health Logs" description="Review and resolve symptom reports from villagers in the 'Community Health Log'. You can also export this data for your records." />
                <GuideItem icon={<RadarIcon />} title="3. Connect Hardware" description="Use 'OneTap Connect' to link with Bluetooth water sensors for live data streaming directly to your dashboard." />
                <GuideItem icon={<BookOpenIcon />} title="4. Update Safety Guides" description="You can add, edit, or delete the safety tips that villagers see. Tap 'Manage Quick Action Tips' to keep the information current." />
            </ul>
        </>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How to Use the App">
      <div className="p-6">
        {role === 'villager' ? villagerGuide : healthWorkerGuide}
        <div className="mt-6 pt-6 border-t border-slate-700">
             <button
                onClick={onOpenAbout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-slate-800/60 text-cyan-300 hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
            >
                <InfoIcon className="w-5 h-5" />
                About This Project
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(AppGuideModal);