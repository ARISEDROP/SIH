import React, { useState } from 'react';
import { GoogleIcon, FacebookIcon, MailIcon, LockIcon, UserIcon, UserGroupIcon } from '../common/icons';
import type { Role } from '../../types';
import Logo from '../common/Logo';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

const LoginScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>('villager');
  const { login } = useAppContext();
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in-up">
      <div className="bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-cyan-500/20 overflow-hidden">
        <div className="p-8 flex justify-center">
            <div className="animate-orb-pulse" style={{'--cyan-rgb': '34, 211, 238'} as React.CSSProperties}>
                 <Logo size="large" />
            </div>
        </div>
        
        <div className="px-8 pb-8">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <SocialButton icon={<GoogleIcon />} label="Google" />
                <SocialButton icon={<FacebookIcon />} label="Facebook" />
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-700/50" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-slate-900/20 px-2 text-sm text-gray-400 backdrop-blur-sm">{t('login.continueWith')}</span>
                </div>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); login(selectedRole); }}>
                <InputField icon={<MailIcon />} type="email" placeholder={t('login.emailPlaceholder')} required />
                <InputField icon={<LockIcon />} type="password" placeholder={t('login.passwordPlaceholder')} required />
                
                <div className="space-y-3 pt-2">
                    <p className="text-sm font-medium text-cyan-200 text-center">{t('login.selectRole')}</p>
                    <div className="grid grid-cols-2 gap-3">
                        <RoleToggle 
                            icon={<UserIcon />} 
                            label={t('login.villager')}
                            isActive={selectedRole === 'villager'}
                            onClick={() => setSelectedRole('villager')}
                        />
                        <RoleToggle 
                            icon={<UserGroupIcon />} 
                            label={t('login.healthWorker')}
                            isActive={selectedRole === 'health_worker'}
                            onClick={() => setSelectedRole('health_worker')}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-gradient-to-br from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all duration-300 transform active:scale-[0.98] animate-pulse-glow will-change-transform"
                        style={{'--glow-color': 'var(--cyan-rgb)'} as React.CSSProperties}
                    >
                         <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 bg-white/30 rounded-full transition-all duration-500 ease-out group-active:w-full group-active:h-full group-active:opacity-0"></span>
                        <span className="relative">{t('login.loginButton')}</span>
                    </button>
                </div>
            </form>
             <p className="mt-6 text-center text-sm text-gray-400">
                {t('login.noAccount')} <a href="#" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover:underline underline-offset-4">{t('login.signUp')}</a>
            </p>
        </div>
      </div>
    </div>
  );
};

const SocialButton: React.FC<{icon: React.ReactNode, label: string}> = ({ icon, label }) => (
    <button className="w-full inline-flex justify-center items-center gap-3 py-2.5 px-4 border border-white/20 rounded-lg text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-all duration-150 active:scale-[0.98]">
        {icon}
        {label}
    </button>
);

const InputField: React.FC<{icon: React.ReactElement<any>, type: string, placeholder: string, required?: boolean}> = ({icon, type, placeholder, required}) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 text-gray-400 group-focus-within:text-cyan-400">
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
        <input 
            type={type} 
            placeholder={placeholder}
            required={required}
            className="block w-full bg-white/5 border-2 border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/50"
        />
    </div>
);

const RoleToggle: React.FC<{icon: React.ReactElement<any>, label: string, isActive: boolean, onClick: () => void}> = ({icon, label, isActive, onClick}) => (
    <button 
        type="button" 
        onClick={onClick}
        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
            isActive 
            ? 'bg-cyan-500/30 border-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5),_inset_0_0_10px_rgba(34,211,238,0.3)]' 
            : 'bg-white/10 border-white/20 text-gray-300 hover:border-white/40 hover:bg-white/20'
        }`}
    >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        {label}
    </button>
);

export default React.memo(LoginScreen);