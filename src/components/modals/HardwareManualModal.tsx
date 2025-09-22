import React from 'react';
import Modal from './Modal';
import { BluetoothIcon, CheckCircleIcon, RadarIcon, ChipIcon, TestTubeIcon, ThermometerIcon, DropletsIcon, SignalIcon, MapPinIcon } from '../common/icons';
import { useTranslation } from '../../hooks/useTranslation';

interface HardwareManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Step: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <li className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400">{icon}</div>
        <div>
            <h4 className="font-bold text-white">{title}</h4>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
    </li>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div>
        <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-3">
            {icon} {title}
        </h3>
        {children}
    </div>
);

const SensorItem: React.FC<{ icon: React.ReactNode; name: string; description: string }> = ({ icon, name, description }) => (
     <li className="flex items-start gap-3 py-2">
        <div className="flex-shrink-0 w-8 h-8 bg-slate-800/60 rounded-lg flex items-center justify-center text-cyan-300">{icon}</div>
        <div>
            <p className="font-semibold text-white">{name}</p>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
    </li>
);


const HardwareManualModal: React.FC<HardwareManualModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const step1 = t('modals.manualStep1');
  const step2 = t('modals.manualStep2');
  const step3 = t('modals.manualStep3');
  const step4 = t('modals.manualStep4');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.hardwareManualTitle')}>
      <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
        <Section icon={<ChipIcon className="w-5 h-5" />} title={t('modals.requiredSensors')}>
            <p className="text-sm text-gray-400 mb-4">
                {t('modals.sensorsDescription')}
            </p>
            <ul className="space-y-2">
                <SensorItem icon={<TestTubeIcon />} name="pH Sensor" description="Measures the acidity or alkalinity of the water." />
                <SensorItem icon={<DropletsIcon />} name="Turbidity Sensor" description="Detects water cloudiness or haziness caused by suspended particles." />
                <SensorItem icon={<ThermometerIcon />} name="Temperature Sensor (DS18B20)" description="Measures the water temperature, which affects other parameters." />
                <SensorItem icon={<SignalIcon />} name="TDS/EC Sensor" description="Measures Total Dissolved Solids and Electrical Conductivity to gauge purity." />
                <SensorItem icon={<MapPinIcon />} name="GPS Module" description="Provides precise latitude and longitude for accurate location tagging." />
                <SensorItem icon={<BluetoothIcon />} name="Bluetooth Module (HC-05 or built-in)" description="Enables wireless communication between the sensor unit and this app." />
            </ul>
        </Section>
        
        <Section icon={<CheckCircleIcon className="w-5 h-5" />} title={t('modals.connectionSteps')}>
            <ol className="space-y-5">
                 <Step
                    icon={<span className="font-bold text-2xl">1</span>}
                    title={step1.title}
                    description={step1.description}
                />
                <Step
                    icon={<BluetoothIcon className="w-6 h-6" />}
                    title={step2.title}
                    description={step2.description}
                />
                <Step
                    icon={<RadarIcon className="w-6 h-6" />}
                    title={step3.title}
                    description={step3.description}
                />
                <Step
                    icon={<CheckCircleIcon className="w-6 h-6" />}
                    title={step4.title}
                    description={step4.description}
                />
            </ol>
        </Section>
        
        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-gray-500">
                {t('modals.manualFooter')}
            </p>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(HardwareManualModal);