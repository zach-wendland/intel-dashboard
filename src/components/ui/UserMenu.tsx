import { useState } from 'react';
import { User, LogOut, Settings, Crown, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { PremiumUpgradeModal } from './PremiumUpgradeModal';

interface UserMenuProps {
  onSignInClick: () => void;
}

export function UserMenu({ onSignInClick }: UserMenuProps) {
  const { user, signOut, isConfigured } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!isConfigured) {
    return null;
  }

  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-all"
      >
        <User className="h-3.5 w-3.5" />
        Sign In
      </button>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded transition-all"
        >
          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline max-w-[100px] truncate">
            {user.email?.split('@')[0]}
          </span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm text-white truncate">{user.email}</p>
              </div>

              <button
                onClick={() => { setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>

              <button
                onClick={() => { setIsOpen(false); setShowUpgradeModal(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-slate-800 transition-colors"
              >
                <Crown className="h-4 w-4" />
                Upgrade to Premium
              </button>

              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showUpgradeModal && (
        <PremiumUpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </>
  );
}
