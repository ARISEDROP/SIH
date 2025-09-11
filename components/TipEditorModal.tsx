
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Tip } from '../constants';

interface TipEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tip: Omit<Tip, 'id'> | Tip) => void;
  tipToEdit: Tip | null;
}

const TipEditorModal: React.FC<TipEditorModalProps> = ({ isOpen, onClose, onSave, tipToEdit }) => {
  const [icon, setIcon] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // FIX: Add state to manage the 'steps' field, which was missing.
  const [steps, setSteps] = useState('');

  useEffect(() => {
    if (tipToEdit) {
      setIcon(tipToEdit.icon);
      setTitle(tipToEdit.title);
      setDescription(tipToEdit.description);
      // FIX: Populate the steps field from the tip being edited.
      setSteps(tipToEdit.steps.join('\n'));
    } else {
      // Reset form for adding new tip
      setIcon('');
      setTitle('');
      setDescription('');
      // FIX: Reset the steps field for a new tip.
      setSteps('');
    }
  }, [tipToEdit, isOpen]); // Rerun effect when modal opens or tip data changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Convert the steps from the textarea back into an array.
    const stepsArray = steps.split('\n').filter(step => step.trim() !== '');
    // FIX: Include the 'steps' array in the data being saved to match the 'Tip' type. This resolves the type errors.
    const tipData = { icon, title, description, steps: stepsArray };
    if (tipToEdit) {
      onSave({ ...tipData, id: tipToEdit.id });
    } else {
      onSave(tipData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tipToEdit ? 'Edit Tip' : 'Add New Tip'}>
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label htmlFor="icon" className="block text-sm font-medium text-cyan-200">Icon (Emoji)</label>
          <input
            type="text"
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={2}
            required
            className="mt-1 block w-full bg-slate-800/60 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-cyan-200">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full bg-slate-800/60 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-cyan-200">Description</label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full bg-slate-800/60 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          ></textarea>
        </div>
        {/* FIX: Add a textarea to allow editing the tip's steps, which was missing. */}
        <div>
          <label htmlFor="steps" className="block text-sm font-medium text-cyan-200">Steps (one per line)</label>
          <textarea
            id="steps"
            rows={5}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
            className="mt-1 block w-full bg-slate-800/60 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          ></textarea>
        </div>
        <div className="pt-4 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500">
            Save Tip
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default React.memo(TipEditorModal);
