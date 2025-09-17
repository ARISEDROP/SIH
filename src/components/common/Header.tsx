import React, { useState, useEffect, useRef } from 'react';
import { LogoutIcon, UserIcon, GlobeIcon, ChipIcon, BookOpenIcon, Settings2Icon, ChevronDownIcon, RadarIcon, InfoIcon, WifiOffIcon, HardDriveIcon } from './icons';
import Logo from './Logo';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
  const {
    role,
    userProfile,
    logout,
    openProfileModal,
    language,
    setLanguage,
    openAppGuide,
    openDeviceHealth,
    openHardwareModal,
    openAboutModal,
    openStorageManager,
    isHardwareConnected,
    offlineQueueCount = 0,
    openHardwareManual,
  } = useAppContext();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const roleName = role === 'villager' ? 'Villager' : 'Health Worker';
  const { name: userName, avatar: userAvatar } = userProfile;

  useEffect(() => {
    setIsBluetoothSupported(!!navigator.bluetooth);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex justify-between items-center w-full">
      <div className="flex items-center gap-4">
        <Logo size="small" />
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-white">{roleName} Dashboard</h2>
          <p className="text-sm text-cyan-300">Aqua Guardian Project</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {offlineQueueCount > 0 && (
            <div className="flex items-center gap-2 text-yellow-300" title={`${offlineQueueCount} reports queued offline`}>
                <WifiOffIcon className="w-5 h-5" />
                <span className="font-bold">{offlineQueueCount}</span>
            </div>
        )}
        {isHardwareConnected && role === 'health_worker' && (
            <div className="hidden sm:flex items-center gap-2 text-emerald-300 animate-pulse" title="Hardware sensor connected">
                <RadarIcon className="w-5 h-5"/>
                <span className="text-sm font-semibold">LIVE</span>
            </div>
        )}

        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-xl p-2 rounded-full border border-slate-700 hover:border-cyan-500/50 transition-all duration-200 active:scale-95">
            <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
            <span className="hidden md:inline font-semibold text-white">{userName}</span>
            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg z-20 animate-fade-in" style={{animationDuration: '150ms'}}>
              <div className="p-2">
                <div className="px-2 py-2">
                  <p className="font-semibold text-white">{userName}</p>
                  <p className="text-sm text-gray-400">{roleName}</p>
                </div>
                <div className="h-px bg-slate-700 my-1"></div>
                <MenuItem icon={<UserIcon />} label="Edit Profile" onClick={() => { openProfileModal(); setIsMenuOpen(false); }} />
                <MenuItem icon={<BookOpenIcon />} label="App Guide" onClick={() => { openAppGuide(); setIsMenuOpen(false); }} />
                <MenuItem icon={<ChipIcon />} label="Device Health" onClick={() => { openDeviceHealth(); setIsMenuOpen(false); }} />
                 {role === 'health_worker' && (
                    <MenuItem icon={<HardDriveIcon />} label="Storage Manager" onClick={() => { openStorageManager(); setIsMenuOpen(false); }} />
                )}
                {role === 'health_worker' && isBluetoothSupported && (
                    <MenuItem icon={<Settings2Icon />} label="Hardware Settings" onClick={() => { openHardwareModal(); setIsMenuOpen(false); }} />
                )}
                {role === 'health_worker' && (
                    <MenuItem icon={<BookOpenIcon />} label="Hardware Manual" onClick={() => { openHardwareManual?.(); setIsMenuOpen(false); }} />
                )}
                 <MenuItem icon={<InfoIcon />} label="About Aqua" onClick={() => { openAboutModal(); setIsMenuOpen(false); }} />
                <div className="h-px bg-slate-700 my-1"></div>
                 <div className="p-2">
                    <div className="relative">
                        <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-slate-800/60 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none"
                        >
                            <option value="en-US">English</option>
                            <option value="hi-IN">हिन्दी (Hindi)</option>
                            <option value="ta-IN">தமிழ் (Tamil)</option>
                            <option value="as-IN">অসমীয়া (Assamese)</option>
                        </select>
                         <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="h-px bg-slate-700 my-1"></div>
                <MenuItem icon={<LogoutIcon />} label="Logout" onClick={logout} isDanger={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, isDanger?: boolean }> = ({ icon, label, onClick, isDanger }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isDanger ? 'text-red-400 hover:bg-red-500/20 active:bg-red-500/30' : 'text-gray-300 hover:bg-slate-700/80 hover:text-white active:bg-slate-700/50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default React.memo(Header);