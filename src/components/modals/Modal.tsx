import React from 'react';
import { XIcon } from '../common/icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in"
      aria-modal="true"
      role="dialog"
      style={{ animationDuration: '300ms' }}
    >
      <div
        className="relative bg-slate-900/80 w-full max-w-lg m-4 rounded-2xl shadow-2xl border border-cyan-500/20 animate-fade-in-up animate-pulse-glow"
        style={{ animationDuration: '300ms, 3s', '--glow-color': 'var(--cyan-rgb)' } as React.CSSProperties}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <XIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default React.memo(Modal);