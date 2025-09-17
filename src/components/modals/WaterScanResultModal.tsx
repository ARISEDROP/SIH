import React from 'react';
import Modal from './Modal';
import { WaterScanResult, WaterStatus } from '../../types';
import { ShieldCheckIcon, AlertTriangleIcon, AlertOctagonIcon, LightBulbIcon } from '../common/icons';

interface WaterScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: WaterScanResult | null;
  onLogConcern: (notes: string) => void;
}

const statusConfig: { [key in WaterStatus]: { icon: React.ReactElement<any>; textClass: string; bgClass: string; borderColor: string; } } = {
  safe: { icon: <ShieldCheckIcon />, textClass: 'text-emerald-300', bgClass: 'bg-emerald-500/20', borderColor: 'border-emerald-500/50' },
  caution: { icon: <AlertTriangleIcon />, textClass: 'text-yellow-300', bgClass: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50' },
  unsafe: { icon: <AlertOctagonIcon />, textClass: 'text-red-400', bgClass: 'bg-red-500/20', borderColor: 'border-red-500/50' },
};

const WaterScanResultModal: React.FC<WaterScanResultModalProps> = ({ isOpen, onClose, result, onLogConcern }) => {
  if (!result) return null;

  const config = statusConfig[result.status];
  const notesForLog = `Water quality scan for ${result.userName} showed a status of '${result.status}'. AI Explanation: "${result.explanation}"`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Water Quality Report">
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-400">Report generated for <span className="font-bold text-white">{result.userName}</span> on {result.timestamp}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <img src={result.image} alt="Water sample" className="rounded-lg w-full h-48 object-cover border-2 border-slate-700" />
          <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center h-48 ${config.bgClass} border ${config.borderColor}`}>
            {React.cloneElement(config.icon, { className: `w-12 h-12 ${config.textClass}` })}
            <p className={`text-2xl font-bold mt-2 ${config.textClass}`}>{result.status.charAt(0).toUpperCase() + result.status.slice(1)}</p>
            <p className="text-sm text-gray-300 mt-1">{result.explanation}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-cyan-200 mb-2 flex items-center gap-2"><LightBulbIcon className="w-5 h-5"/> Recommended Actions</h4>
          <ul className="space-y-2 list-disc list-inside text-gray-300 bg-slate-800/60 p-4 rounded-lg border border-slate-700">
            {result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
        
        <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600">
            Close
          </button>
          <button onClick={() => onLogConcern(notesForLog)} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500">
            Log as Health Concern
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(WaterScanResultModal);
