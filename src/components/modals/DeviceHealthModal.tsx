import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { CpuIcon, MemoryStickIcon, BatteryChargingIcon, HardDriveIcon, WifiIcon, SaveIcon } from '../common/icons';
import { useTranslation } from '../../hooks/useTranslation';

interface DeviceInfo {
  cpuCores?: number;
  memory?: number;
  battery?: { level: number; charging: boolean };
  storage?: { usage: string; quota: string };
  connection?: { type: string; effectiveType: string };
}

interface DeviceHealthModalProps {
    isOpen: boolean;
    onClose: () => void;
    offlineQueueCount: number;
}

const DeviceHealthModal: React.FC<DeviceHealthModalProps> = ({ isOpen, onClose, offlineQueueCount }) => {
  const { t } = useTranslation();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const getDeviceInfo = async () => {
      setIsLoading(true);
      const info: DeviceInfo = {};

      // CPU Cores
      if (navigator.hardwareConcurrency) {
        info.cpuCores = navigator.hardwareConcurrency;
      }

      // Memory
      if ('deviceMemory' in navigator) {
        info.memory = (navigator as any).deviceMemory;
      }

      // Connection
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        info.connection = {
          type: conn.type || 'unknown',
          effectiveType: conn.effectiveType || 'unknown',
        };
      }
      
      // Battery
      try {
        if ('getBattery' in navigator) {
            const battery = await (navigator as any).getBattery();
            info.battery = {
              level: Math.round(battery.level * 100),
              charging: battery.charging,
            };
        }
      } catch (e) {
        console.warn("Could not get battery status:", e);
      }

      // Storage
      try {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            const formatBytes = (bytes: number | undefined) => {
                if (!bytes || bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            };
            info.storage = {
                usage: formatBytes(estimate.usage),
                quota: formatBytes(estimate.quota),
            };
        }
      } catch (e) {
        console.warn("Could not get storage estimate:", e);
      }


      setDeviceInfo(info);
      setIsLoading(false);
    };

    getDeviceInfo();
  }, [isOpen]);

  const renderInfoItem = (icon: React.ReactNode, title: string, value: string | undefined | null, subValue?: string | undefined | null) => (
      <div className="flex items-center gap-4 p-3 bg-slate-800/60 rounded-lg">
          <div className="text-cyan-400 flex-shrink-0 w-6 h-6 flex items-center justify-center">{icon}</div>
          <div className="flex-grow min-w-0">
              <p className="text-sm text-gray-400">{title}</p>
              {value ? <p className="font-semibold text-white truncate">{value}</p> : <p className="text-sm text-gray-500">{t('modals.notAvailable')}</p>}
          </div>
           {subValue && <span className="text-xs font-medium bg-slate-700 text-cyan-200 px-2 py-1 rounded-full flex-shrink-0">{subValue}</span>}
      </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.deviceHealthTitle')}>
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-6">
            {t('modals.deviceHealthDescription')}
        </p>
        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
            <div className="space-y-3">
                {renderInfoItem(<CpuIcon />, t('modals.cpu'), deviceInfo.cpuCores ? `${deviceInfo.cpuCores} ${t('modals.cpuCores')}` : undefined)}
                {renderInfoItem(<MemoryStickIcon />, t('modals.memory'), deviceInfo.memory ? `~${deviceInfo.memory} ${t('modals.ram')}` : undefined)}
                {renderInfoItem(<BatteryChargingIcon />, t('modals.battery'), deviceInfo.battery ? `${deviceInfo.battery.level}%` : undefined, deviceInfo.battery?.charging ? t('modals.charging') : t('modals.discharging'))}
                {renderInfoItem(<HardDriveIcon />, t('modals.storage'), deviceInfo.storage ? `${deviceInfo.storage.usage} / ${deviceInfo.storage.quota}`: undefined)}
                {renderInfoItem(<WifiIcon />, t('modals.network'), deviceInfo.connection?.type ? deviceInfo.connection.type.charAt(0).toUpperCase() + deviceInfo.connection.type.slice(1) : undefined, deviceInfo.connection?.effectiveType)}
                {renderInfoItem(<SaveIcon />, t('modals.appStorage'), `${offlineQueueCount} ${t('modals.reportsQueued')}`)}
            </div>
        )}
      </div>
    </Modal>
  );
};
export default React.memo(DeviceHealthModal);