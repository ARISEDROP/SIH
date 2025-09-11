import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { HardDriveIcon, TrashIcon, DownloadIcon, UploadIcon, SyncIcon } from '../common/icons';

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageUsage: number; // in bytes
  onExport: () => void;
  onRestore: (file: File) => void;
  onClear: () => void;
}

const STORAGE_LIMIT_MB = 200;
const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_MB * 1024 * 1024;

const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius*2} ${radius*2}`} className="-rotate-90">
            <circle
                stroke="rgba(0, 255, 255, 0.15)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="url(#progressGradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, strokeLinecap: 'round' }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-out"
            />
             <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
            </defs>
        </svg>
    );
};


const StorageManagerModal: React.FC<StorageManagerModalProps> = ({ isOpen, onClose, storageUsage, onExport, onRestore, onClear }) => {
    const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
    const [isClearing, setIsClearing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const usagePercentage = Math.min(100, (storageUsage / STORAGE_LIMIT_BYTES) * 100);
    
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const handleClearClick = () => {
        if(window.confirm("Are you sure you want to clear the entire symptom log? This action cannot be undone.")) {
            setIsClearing(true);
            setTimeout(() => {
                onClear();
                setIsClearing(false);
            }, 1000); // Simulate network delay
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onRestore(file);
        }
    };

    const TabButton: React.FC<{ tab: 'internal' | 'external', children: React.ReactNode }> = ({ tab, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-1/2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-700/50'}`}
        >
            {children}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Storage Manager">
            <div className="p-6">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <CircularProgress percentage={usagePercentage} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{Math.round(usagePercentage)}%</span>
                        </div>
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-white">Internal App Storage</h3>
                        <p className="text-cyan-200">{formatBytes(storageUsage)} / {STORAGE_LIMIT_MB} MB used</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Symptom logs and app data are stored locally on your device for offline access.
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700">
                        <TabButton tab="internal">Internal Storage</TabButton>
                        <TabButton tab="external">External Storage</TabButton>
                    </div>
                    <div className="mt-4 p-4 bg-slate-900/40 rounded-lg min-h-[150px]">
                        {activeTab === 'internal' ? (
                            <div className="animate-fade-in" style={{animationDuration: '300ms'}}>
                                <h4 className="font-semibold text-white mb-2">Manage Local Data</h4>
                                <p className="text-sm text-gray-400 mb-4">
                                    Clearing the log will remove all symptom reports from this device. This is useful if you need to free up space.
                                </p>
                                <button
                                    onClick={handleClearClick}
                                    disabled={isClearing}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-800/80 text-red-200 hover:bg-red-700/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isClearing ? <SyncIcon className="w-4 h-4 animate-spin"/> : <TrashIcon className="w-4 h-4" />}
                                    {isClearing ? 'Clearing...' : 'Clear Symptom Log'}
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in space-y-3" style={{animationDuration: '300ms'}}>
                                <h4 className="font-semibold text-white mb-2">Backup & Restore</h4>
                                <p className="text-sm text-gray-400 mb-4">
                                    Backup your data to a file for safekeeping, or restore from a previously saved backup file.
                                </p>
                                <button
                                    onClick={onExport}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 text-white hover:bg-slate-600"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                    Backup Log to Device
                                </button>
                                <button
                                    onClick={handleRestoreClick}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 text-white hover:bg-slate-600"
                                >
                                    <UploadIcon className="w-4 h-4" />
                                    Restore Log from Device
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json"/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default StorageManagerModal;