import React from 'react';
import Modal from './Modal';
import { Role } from '../../types';
import { UserIcon, UserGroupIcon, ScannerIcon, PlusIcon, MapIcon, BookOpenIcon, SparklesIcon, RadarIcon, InfoIcon } from '../common/icons';
import { useTranslation } from '../../hooks/useTranslation';

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
    const { t } = useTranslation();
    const villagerGuideItems = t('modals.villagerGuide');
    const healthWorkerGuideItems = t('modals.healthWorkerGuide');
    
    const villagerGuide = (
        <>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5"/> {t('modals.villagerGuideTitle')}</h3>
            <ul className="space-y-4">
                <GuideItem icon={<ScannerIcon />} title={villagerGuideItems[0].title} description={villagerGuideItems[0].description} />
                <GuideItem icon={<PlusIcon />} title={villagerGuideItems[1].title} description={villagerGuideItems[1].description} />
                <GuideItem icon={<BookOpenIcon />} title={villagerGuideItems[2].title} description={villagerGuideItems[2].description} />
                <GuideItem icon={<SparklesIcon />} title={villagerGuideItems[3].title} description={villagerGuideItems[3].description} />
            </ul>
        </>
    );

    const healthWorkerGuide = (
        <>
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> {t('modals.healthWorkerGuideTitle')}</h3>
            <ul className="space-y-4">
                 <GuideItem icon={<MapIcon />} title={healthWorkerGuideItems[0].title} description={healthWorkerGuideItems[0].description} />
                <GuideItem icon={<UserGroupIcon />} title={healthWorkerGuideItems[1].title} description={healthWorkerGuideItems[1].description} />
                <GuideItem icon={<RadarIcon />} title={healthWorkerGuideItems[2].title} description={healthWorkerGuideItems[2].description} />
                <GuideItem icon={<BookOpenIcon />} title={healthWorkerGuideItems[3].title} description={healthWorkerGuideItems[3].description} />
            </ul>
        </>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.appGuideTitle')}>
      <div className="p-6">
        {role === 'villager' ? villagerGuide : healthWorkerGuide}
        <div className="mt-6 pt-6 border-t border-slate-700">
             <button
                onClick={onOpenAbout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all duration-300 ease-in-out bg-slate-800/60 text-cyan-300 hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
            >
                <InfoIcon className="w-5 h-5" />
                {t('modals.aboutProject')}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(AppGuideModal);