import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import { HardDriveIcon, TrashIcon, DownloadIcon, UploadIcon, SyncIcon, FileTextIcon } from '../common/icons';
import { useTranslation } from '../../hooks/useTranslation';

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageUsage: number; // in bytes
  onExport: () => void;
  onRestore: (file: File) => void;
  onClear: () => void;
  onExportPdf: () => void;
}

const StorageManagerModal: React.FC<StorageManagerModalProps> = ({ isOpen, onClose, storageUsage, onExport, onRestore, onClear, onExportPdf }) => {
    const { t } = useTranslation();
    const [isClearing, setIsClearing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onRestore(file);
        }
    };

    const handleClear = () => {
        setIsClearing(true);
        // Simulate async operation
        setTimeout(() => {
            onClear();
            setIsClearing(false);
            setShowConfirm(false);
        }, 1000);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Reset confirmation state when modal is closed to ensure correct view on reopen.
    useEffect(() => {
        if (!isOpen) {
            setShowConfirm(false);
            setIsClearing(false);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('modals.storageManagerTitle')}>
            <div className="p-6">
                {showConfirm ? (
                    <div className="text-center animate-fade-in">
                        <h4 className="font-bold text-red-400 text-lg">{t('modals.clearConfirmTitle')}</h4>
                        <p className="text-gray-300 mt-2">{t('modals.clearConfirmText')}</p>
                         <div className="mt-6 flex justify-center gap-4">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600">
                                {t('modals.cancel')}
                            </button>
                            <button onClick={handleClear} disabled={isClearing} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 disabled:bg-red-800">
                                {isClearing && <SyncIcon className="w-4 h-4 animate-spin" />}
                                {isClearing ? t('modals.clearing') : t('modals.yesClear')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-800/60 rounded-lg">
                            <HardDriveIcon className="w-8 h-8 text-cyan-400" />
                            <div>
                                <p className="text-sm text-gray-400">{t('modals.estimatedUsage')}</p>
                                <p className="text-xl font-bold text-white">{formatBytes(storageUsage)}</p>
                            </div>
                        </div>

                        <ActionButton icon={<DownloadIcon />} label={t('modals.exportJson')} description={t('modals.exportJsonDesc')} onClick={onExport} />
                        <ActionButton icon={<FileTextIcon />} label={t('modals.exportPdf')} description={t('modals.exportPdfDesc')} onClick={onExportPdf} />
                        <ActionButton icon={<UploadIcon />} label={t('modals.restoreJson')} description={t('modals.restoreJsonDesc')} onClick={() => fileInputRef.current?.click()} />
                        <ActionButton icon={<TrashIcon />} label={t('modals.clearData')} description={t('modals.clearDataDesc')} onClick={() => setShowConfirm(true)} isDanger={true} />
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/json" />
                    </div>
                )}
            </div>
        </Modal>
    );
};

const ActionButton: React.FC<{icon: React.ReactNode, label: string, description: string, onClick: () => void, isDanger?: boolean}> = ({ icon, label, description, onClick, isDanger }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-start gap-4 p-4 text-left rounded-lg transition-colors duration-200 ${
            isDanger ? 'bg-red-900/40 hover:bg-red-900/60' : 'bg-slate-800/60 hover:bg-slate-700/80'
        }`}
    >
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md ${isDanger ? 'text-red-400' : 'text-cyan-300'}`}>
            {icon}
        </div>
        <div>
            <p className={`font-semibold ${isDanger ? 'text-red-300' : 'text-white'}`}>{label}</p>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
    </button>
);

export default React.memo(StorageManagerModal);