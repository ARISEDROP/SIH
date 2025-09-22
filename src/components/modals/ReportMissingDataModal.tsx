import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Village } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { SyncIcon, CheckCircleIcon } from '../common/icons';

interface ReportMissingDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  village: Village | null;
}

const ReportMissingDataModal: React.FC<ReportMissingDataModalProps> = ({ isOpen, onClose, village }) => {
  const { reportMissingData } = useAppContext();
  const { t } = useTranslation();
  
  const [dataType, setDataType] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDataType('');
      setNotes('');
      setIsSubmitting(false);
      setSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  if (!village) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataType) {
      setError(t('modals.selectDataTypeError'));
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      await reportMissingData({
        villageId: village.id,
        villageName: village.name,
        dataType: dataType as any,
        notes: notes,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('modals.locationError'));
      // If there's a location error, we still want to show the success message because the report was saved.
      setSubmitted(true);
      setTimeout(() => {
          onClose();
      }, 3000); // Give user more time to read error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('header.reportMissingData')} for ${village.name}`}>
      {submitted ? (
        <div className="text-center p-8 animate-fade-in">
            <CheckCircleIcon className="w-16 h-16 mx-auto text-emerald-400" />
            <h3 className="mt-4 text-2xl font-bold text-white">{t('modals.reportSubmitted')}</h3>
            <p className="mt-2 text-gray-300">{t('modals.reportSubmittedDesc')}</p>
            {error && <p className="mt-2 text-sm text-yellow-300">{error}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label htmlFor="dataType" className="block text-sm font-medium text-cyan-200">{t('modals.missingDataType')}</label>
            <select
              id="dataType"
              value={dataType}
              onChange={(e) => { setDataType(e.target.value); if (e.target.value) setError(''); }}
              required
              className={`mt-1 block w-full bg-slate-800/60 border rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 transition-colors ${error && !dataType ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'}`}
            >
              <option value="" disabled>{t('modals.selectDataType')}</option>
              <option value="Water Quality Sensor Data">{t('modals.waterQualitySensorData')}</option>
              <option value="Symptom Report">{t('modals.symptomReport')}</option>
              <option value="Other">{t('modals.other')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-cyan-200">{t('modals.briefNote')}</label>
            <textarea 
                id="notes" 
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full bg-slate-800/60 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                placeholder={t('modals.notePlaceholder')}
            ></textarea>
          </div>
          {error && !dataType && <p className="text-sm text-red-400">{error}</p>}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-cyan-800/80 disabled:cursor-not-allowed transition-transform active:scale-[0.98]"
            >
              {isSubmitting ? <SyncIcon className="w-5 h-5 animate-spin" /> : null}
              {isSubmitting ? t('modals.submitting') : t('modals.submitReport')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ReportMissingDataModal;