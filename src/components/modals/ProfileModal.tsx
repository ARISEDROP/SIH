import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { UserProfile } from '../../types';
import { CameraIcon, SaveIcon } from '../common/icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user.name);
  const [village, setVillage] = useState(user.village);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setVillage(user.village);
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [isOpen, user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // In a real app, you'd upload the avatarFile if it exists.
    // For this prototype, we'll just use the preview URL if available,
    // otherwise keep the original avatar.
    const updatedAvatar = avatarPreview || user.avatar;
    onSave({ name, village, avatar: updatedAvatar });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <img 
              src={avatarPreview || user.avatar} 
              alt="User Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-slate-700"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Change profile picture"
            >
              <CameraIcon className="w-8 h-8" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-cyan-200">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full bg-slate-800/60 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <div>
          <label htmlFor="village" className="block text-sm font-medium text-cyan-200">Village</label>
          <input
            type="text"
            id="village"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            className="mt-1 block w-full bg-slate-800/60 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <div className="pt-2 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors">
            <SaveIcon className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ProfileModal);