
import React from 'react';
import Modal from './Modal';
import { BluetoothIcon, CheckCircleIcon, RadarIcon } from './icons';

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

const HardwareManualModal: React.FC<HardwareManualModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hardware Connection Manual">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-6">
            Follow these steps to connect a water quality sensor to the app using Bluetooth.
        </p>
        <ol className="space-y-5">
            <Step
                icon={<span className="font-bold text-2xl">1</span>}
                title="Power On Your Sensor"
                description="Ensure your water quality sensor is turned on, charged, and in 'discoverable' or 'pairing' mode. Refer to your sensor's own manual if needed."
            />
            <Step
                icon={<BluetoothIcon className="w-6 h-6" />}
                title="Enable Device Bluetooth"
                description="Make sure Bluetooth is enabled on this device (your phone or tablet). You can usually find this in your device's settings or control center."
            />
            <Step
                icon={<RadarIcon className="w-6 h-6" />}
                title="Start Scanning in the App"
                description="On the dashboard, find the 'OneTap Connect' card and tap the 'Discover Devices' button. This will open your browser's Bluetooth device picker."
            />
             <Step
                icon={<CheckCircleIcon className="w-6 h-6" />}
                title="Select Your Sensor"
                description="A pop-up will appear listing nearby Bluetooth devices. Find your sensor's name in the list, select it, and tap 'Pair' or 'Connect'."
            />
        </ol>
        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-gray-500">
                If you encounter issues, make sure no other devices are currently connected to your sensor.
            </p>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(HardwareManualModal);
