import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { SyncIcon, CameraIcon, ThermometerIcon, StomachIcon, HeadacheIcon } from '../common/icons';
import { commonSymptoms } from '../../constants';
import { SymptomReport } from '../../types';

interface SymptomsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SymptomReport, 'id' | 'reportedAt' | 'resolved'>) => void;
  userVillage: string;
}

const iconMap = {
    ThermometerIcon,
    StomachIcon,
    HeadacheIcon,
};

const SymptomsFormModal: React.FC<SymptomsFormModalProps> = ({ isOpen, onClose, onSubmit, userVillage }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSymptom = (symptomName: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomName)
        ? prev.filter(s => s !== symptomName)
        : [...prev, symptomName]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        if (e.target.files[0].size > 5 * 1024 * 1024) { // 5MB limit
            alert("File is too large. Please select a file smaller than 5MB.");
            return;
        }
        setPhoto(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setSelectedSymptoms([]);
    setNotes('');
    setPhoto(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setSubmitted(false);
  };

  const handleClose = () => {
    onClose();
    // Reset state after close animation
    setTimeout(resetForm, 300);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
        alert("Please select at least one symptom.");
        return;
    }
    setIsSubmitting(true);

    const submitData = (photoString?: string) => {
        onSubmit({
            village: userVillage,
            symptoms: selectedSymptoms.join(', '),
            notes: notes,
            photo: photoString,
        });

        // Use a short timeout for user feedback, as data is saved instantly locally
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setTimeout(handleClose, 2000); // Close modal after success message
        }, 500);
    };

    if (photo) {
        const reader = new FileReader();
        reader.onloadend = () => {
            submitData(reader.result as string);
        };
        reader.readAsDataURL(photo);
    } else {
        submitData();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report Symptoms">
      {submitted ? (
        <div className="text-center p-8 animate-fade-in">
            <svg className="w-16 h-16 mx-auto text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-2xl font-bold text-white">Report Saved!</h3>
            <p className="mt-2 text-gray-300">Your report has been saved and will be sent when you're online.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium text-cyan-200 mb-2">Which symptoms are you experiencing?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {commonSymptoms.map((symptom) => {
                const IconComponent = iconMap[symptom.iconName];
                const isSelected = selectedSymptoms.includes(symptom.name);
                return (
                  <button
                    type="button"
                    key={symptom.name}
                    onClick={() => toggleSymptom(symptom.name)}
                    className={`flex flex-col items-center justify-center text-center p-3 rounded-lg border-2 transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-gray-300 hover:bg-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <IconComponent className="w-8 h-8 mb-2" />
                    <span className="text-sm font-semibold">{symptom.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-cyan-200">Additional Notes (Optional)</label>
            <textarea 
                id="notes" 
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full bg-slate-800/60 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            ></textarea>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-cyan-200">Upload Photo (Optional)</label>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 w-full flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium text-cyan-200 bg-slate-800/60 border-2 border-dashed border-slate-700 rounded-lg hover:bg-slate-700/80 hover:border-slate-600 transition-colors"
              >
                  <CameraIcon className="w-5 h-5" />
                  <span>{photo ? photo.name : 'Add Photo Evidence'}</span>
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
                accept="image/*"
              />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-cyan-800/80 disabled:cursor-not-allowed transition-transform active:scale-[0.98]"
            >
              {isSubmitting ? <SyncIcon className="w-5 h-5 animate-spin" /> : null}
              {isSubmitting ? 'Saving...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default React.memo(SymptomsFormModal);