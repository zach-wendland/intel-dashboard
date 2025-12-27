import { useState } from 'react';
import { Crown, Sparkles, Zap } from 'lucide-react';
import { WaitlistModal } from './WaitlistModal';

export function PremiumBanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="relative bg-gradient-to-r from-yellow-900/20 via-yellow-800/20 to-yellow-900/20 border-2 border-yellow-600/50 rounded-xl p-4 sm:p-6 overflow-hidden mb-4">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent animate-pulse" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="bg-yellow-600/20 p-3 rounded-lg border border-yellow-500/30 flex-shrink-0">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-yellow-400">
                Premium Features Coming Soon
              </h3>
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse hidden sm:block" />
            </div>
            <p className="text-sm text-yellow-200/80 mb-3">
              Cloud sync, advanced filters, ad-free experience, exclusive content, and more.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-300">
                <Zap className="h-3 w-3" />
                Unlimited Bookmarks
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-300">
                <Zap className="h-3 w-3" />
                Live Stream Alerts
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-300">
                <Zap className="h-3 w-3" />
                Priority Support
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex-shrink-0 bg-yellow-600 hover:bg-yellow-700 text-yellow-950 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all transform active:scale-[0.98] whitespace-nowrap flex items-center gap-2 text-sm sm:text-base"
          >
            <Crown className="h-4 w-4" />
            Join Waitlist
          </button>
        </div>
      </div>

      {/* Waitlist Modal */}
      {showModal && <WaitlistModal onClose={() => setShowModal(false)} />}
    </>
  );
}
