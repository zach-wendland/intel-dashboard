import { useState } from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { isStripeConfigured, PREMIUM_PRICE } from '../../lib/stripe';

interface PremiumUpgradeModalProps {
  onClose: () => void;
}

export function PremiumUpgradeModal({ onClose }: PremiumUpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isConfigured: isAuthConfigured } = useAuth();

  const features = [
    'Unlimited bookmarks synced to cloud',
    'Reading history across all devices',
    'Live stream alerts via email',
    'Ad-free experience',
    'Priority customer support',
    'Early access to new features',
    'Custom RSS feed sources',
    'Advanced filtering & search'
  ];

  const handleUpgrade = async () => {
    if (!user && isAuthConfigured) {
      toast.error('Please sign in first to upgrade');
      return;
    }

    if (!isStripeConfigured) {
      toast('Premium subscriptions coming soon!', { icon: '🚀' });
      return;
    }

    setIsLoading(true);
    try {
      // For now, show a coming soon message
      // In production, you would redirect to Stripe Checkout
      toast('Premium subscriptions launching soon! Join the waitlist.', { icon: '🚀' });
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPrice = PREMIUM_PRICE[billingCycle];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border-2 border-yellow-600/50 rounded-xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600/20 rounded-full border border-yellow-500/30 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-slate-400 text-sm">
            Unlock the full power of America First Intelligence
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-yellow-600 text-yellow-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-yellow-600 text-yellow-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Yearly
            {billingCycle !== 'yearly' && (
              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                Save {PREMIUM_PRICE.yearly.savings}
              </span>
            )}
          </button>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-white mb-1">
            {selectedPrice.label}
          </div>
          {billingCycle === 'yearly' && (
            <p className="text-sm text-green-400">
              Save {PREMIUM_PRICE.yearly.savings} compared to monthly
            </p>
          )}
        </div>

        {/* Features */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Everything in Premium
          </h3>
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-yellow-950 font-bold py-4 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-yellow-950/30 border-t-yellow-950 rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Crown className="h-5 w-5" />
              Upgrade Now
            </>
          )}
        </button>

        {/* Guarantee */}
        <p className="text-center text-xs text-slate-500 mt-4">
          30-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
