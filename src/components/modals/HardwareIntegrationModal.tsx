import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { BluetoothIcon, SyncIcon, CheckCircleIcon, BluetoothOffIcon, AlertTriangleIcon, RadarIcon, EjectIcon } from '../common/icons';
import { useTranslation } from '../../hooks/useTranslation';

// Add Web Bluetooth type definitions for TypeScript to resolve compilation errors.
// In a real project, this would be handled by including "web-bluetooth" in tsconfig.json's "lib" option.
declare global {
    interface BluetoothDevice extends EventTarget {
        readonly id: string;
        readonly name?: string;
        gatt?: BluetoothRemoteGATTServer;
    }

    interface BluetoothRemoteGATTServer {
        readonly device: BluetoothDevice;
        readonly connected: boolean;
        connect(): Promise<BluetoothRemoteGATTServer>;
        disconnect(): void;
    }

    interface Navigator {
        bluetooth: {
            requestDevice(options?: any): Promise<BluetoothDevice>;
        };
    }
}

type Status = 'idle' | 'scanning' | 'connecting' | 'connected' | 'error';

interface SensorData {
    ph: number;
    turbidity: number;
    temperature: number;
}

interface HardwareIntegrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (deviceName: string) => void;
    onDataReceived: (data: SensorData) => void;
    onDisconnect: () => void;
    onOpenManual: () => void;
}

const HardwareIntegrationModal: React.FC<HardwareIntegrationModalProps> = ({ isOpen, onClose, onConnect, onDataReceived, onDisconnect, onOpenManual }) => {
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
    const [connectingDeviceName, setConnectingDeviceName] = useState<string>('');
    const [isEjecting, setIsEjecting] = useState(false);
    const dataIntervalRef = useRef<number | null>(null);
    const tickCounterRef = useRef(0);
    const { t, t_html } = useTranslation();

    const cleanup = () => {
        if (dataIntervalRef.current) {
            clearInterval(dataIntervalRef.current);
            dataIntervalRef.current = null;
        }
        if (connectedDevice && connectedDevice.gatt?.connected) {
            connectedDevice.gatt.disconnect();
        }
        setConnectedDevice(null);
        setErrorMessage('');
        setConnectingDeviceName('');
        setStatus('idle');
        setIsEjecting(false);
        tickCounterRef.current = 0;
    };
    
    // Effect to cleanup on modal close or component unmount
    useEffect(() => {
        if (!isOpen) {
            // Delay cleanup to allow for closing animation
            setTimeout(cleanup, 300);
        }
        return cleanup; // Cleanup on unmount
    }, [isOpen]);


    const onGattServerDisconnected = () => {
        console.log('Device disconnected.');
        onDisconnect(); // Notify parent
        cleanup();
    };

    const handleScanAndConnect = async () => {
        if (!navigator.bluetooth) {
            setErrorMessage(t('modals.hwErrorBluetooth'));
            setStatus('error');
            return;
        }

        setStatus('scanning');
        setErrorMessage('');
        setConnectingDeviceName('');

        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
            });
            
            setConnectingDeviceName(device.name || 'Unknown Device');
            setStatus('connecting');
            console.log('Connecting to GATT Server...');
            device.addEventListener('gattserverdisconnected', onGattServerDisconnected);
            await device.gatt?.connect();
            
            setConnectedDevice(device);
            setStatus('connected');
            onConnect(device.name || 'Unknown Device'); // Notify parent with device name
            console.log('Device Connected:', device.name);

            // Simulate receiving data from the sensor, occasionally sending bad data for AI to detect.
            dataIntervalRef.current = window.setInterval(() => {
                tickCounterRef.current++;
                let ph = 7.2 + (Math.random() - 0.5);
                let turbidity = 4.5 + (Math.random() - 0.5) * 2;
                let temperature = 21 + Math.random() * 2;
                
                // --- Anomaly Simulation for AI Health Check ---
                if (tickCounterRef.current > 10 && tickCounterRef.current < 15) {
                    // Simulate an erratic spike
                    turbidity = 45 + Math.random() * 10;
                } else if (tickCounterRef.current > 20 && tickCounterRef.current < 25) {
                    // Simulate a flatline
                    ph = 7.5;
                } else if (tickCounterRef.current > 30) {
                    tickCounterRef.current = 0; // Reset counter
                }

                onDataReceived({ ph, turbidity, temperature });
            }, 2000);

        } catch (error: any) {
            // The user cancelling the device chooser throws a "NotFoundError". This is a normal user action, not a system error.
            if (error.name === 'NotFoundError') {
                console.log('User cancelled the device selection prompt. Resetting to idle state.');
                setStatus('idle');
                return; // Gracefully exit without showing an error to the user.
            }
            
            // For all other errors, log them and display an appropriate message.
            console.error('Bluetooth connection failed:', error);
            if (error.name === 'NotAllowedError') {
                 setErrorMessage(t('modals.hwErrorPermission'));
            } else {
                setErrorMessage(t('modals.hwErrorGeneric'));
            }
            setStatus('error');
        }
    };

    const handleDisconnect = () => {
        if (connectedDevice?.gatt?.connected) {
            connectedDevice.gatt.disconnect(); // This will trigger the 'gattserverdisconnected' event
        } else {
            cleanup(); // Fallback cleanup
        }
    };

    const handleSafeEject = () => {
        setIsEjecting(true);
        // Simulate flushing data
        setTimeout(() => {
            setIsEjecting(false);
            handleDisconnect();
        }, 2000);
    };

    const handleTryAgain = () => {
        setStatus('idle');
        setErrorMessage('');
        setConnectingDeviceName('');
    };

    const renderContent = () => {
        switch (status) {
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center h-56 text-center">
                        <AlertTriangleIcon className="w-10 h-10 text-red-400 mb-4" />
                        <h3 className="font-semibold text-white text-lg">{t('modals.hwErrorTitle')}</h3>
                        <p className="text-gray-400 text-sm mt-1">{errorMessage}</p>
                        <p className="text-gray-500 text-xs mt-4 px-4">
                            {t('modals.hwErrorTroubleshoot')}
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <button onClick={handleTryAgain} className="px-4 py-2 text-sm font-semibold text-white bg-slate-600 rounded-lg hover:bg-slate-500">
                                {t('modals.tryAgain')}
                            </button>
                            <button onClick={onOpenManual} className="px-4 py-2 text-sm font-semibold text-cyan-300 bg-slate-800/60 rounded-lg hover:bg-slate-700/80 border border-slate-600">
                                {t('modals.openManual')}
                            </button>
                        </div>
                    </div>
                );
            case 'scanning':
                return (
                    <div className="flex flex-col items-center justify-center h-56">
                        <RadarIcon className="w-10 h-10 text-cyan-400 animate-pulse" />
                        <p className="font-semibold text-white mt-4">{t('modals.scanningTitle')}</p>
                        <p className="text-sm text-gray-400 mt-1">{t('modals.scanningDesc')}</p>
                    </div>
                );
            case 'connecting':
                return (
                    <div className="flex flex-col items-center justify-center h-56">
                        <SyncIcon className="w-10 h-10 text-cyan-400 animate-spin" />
                        <p className="font-semibold text-white mt-4">
                            {`${t('modals.connectingTitle')} ${connectingDeviceName}...`}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {t('modals.connectingDesc')}
                        </p>
                    </div>
                );
            case 'connected':
                return (
                    <div className="animate-fade-in flex flex-col items-center justify-center h-56 text-center">
                        <CheckCircleIcon className="w-12 h-12 text-emerald-400 mb-4" />
                        <h3 className="font-semibold text-white text-lg">{t('modals.connectedTitle')}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            {t('modals.connectedDesc')} <span className="font-bold text-gray-200">{connectedDevice?.name || 'Unknown Device'}</span>.
                        </p>
                        <p className="text-gray-400 text-sm">{t('modals.connectedLive')}</p>
                        <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
                            <button 
                                onClick={handleSafeEject}
                                disabled={isEjecting}
                                className="w-32 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-yellow-800/80 text-yellow-200 hover:bg-yellow-700/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isEjecting ? <SyncIcon className="w-4 h-4 animate-spin" /> : <EjectIcon className="w-4 h-4" />}
                                {isEjecting ? t('modals.ejecting') : t('modals.safeEject')}
                            </button>
                            <button 
                                onClick={handleDisconnect}
                                disabled={isEjecting} 
                                className="w-32 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 text-red-300 hover:bg-slate-600 disabled:opacity-50"
                            >
                                <BluetoothOffIcon className="w-4 h-4" />
                                {t('modals.disconnect')}
                            </button>
                        </div>
                    </div>
                );
            case 'idle':
            default:
                return (
                     <div className="flex flex-col items-center justify-center h-56 text-center">
                        <BluetoothIcon className="w-10 h-10 text-cyan-400 mb-4" />
                        <h3 className="font-semibold text-white text-lg">{t('modals.connectSensorTitle')}</h3>
                        <p className="text-gray-400 text-sm mt-1 mb-6">{t('modals.connectSensorDesc')}</p>
                        <button onClick={handleScanAndConnect} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors">
                            {t('modals.scanForDevices')}
                        </button>
                    </div>
                );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('modals.oneTapConnect')}>
            <div className="p-6 min-h-[350px]">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default HardwareIntegrationModal;