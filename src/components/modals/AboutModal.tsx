import React from 'react';
import Modal from './Modal';
import { HeartIcon, UserGroupIcon, AquaLogoIcon } from '../common/icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400">{icon}</div>
        <div>
            <h4 className="font-bold text-white text-lg">{title}</h4>
            <div className="text-sm text-gray-400 mt-1 space-y-2">{children}</div>
        </div>
    </div>
);

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About Aqua Guardian">
      <div className="p-6">
        <div className="text-center mb-6">
            <AquaLogoIcon className="w-12 h-12 text-cyan-400 mx-auto"/>
            <h3 className="text-2xl font-bold text-white mt-2">Smart Health Water Alert</h3>
            <p className="text-cyan-200">Your Community's Guardian</p>
        </div>
        <div className="space-y-6">
            <InfoSection icon={<HeartIcon />} title="Our Mission">
                <p>
                    To empower villagers and health workers in rural Northeast India with accessible, real-time data about water quality. We aim to prevent water-borne diseases, improve public health outcomes, and foster a proactive approach to community well-being through technology.
                </p>
            </InfoSection>
             <InfoSection icon={<UserGroupIcon />} title="Our Team">
                <p>
                    This application is a prototype developed by the Civic Tech Initiative in collaboration with regional health partners and community leaders. It represents a commitment to using technology for social good.
                </p>
            </InfoSection>
            <div className="pt-2 text-center">
                 <a 
                    href="https://www.unicef.org/india/what-we-do/water-sanitation-hygiene" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
                >
                    Learn More About Water Safety
                </a>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(AboutModal);
