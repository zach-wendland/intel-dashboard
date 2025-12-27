import { useState } from 'react';
import { X, Mail, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailCapturePopupProps {
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export function EmailCapturePopup({ onClose, onSubmit }: EmailCapturePopupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email);
      toast.success('Thanks! Check your email for the daily digest.');
      setTimeout(onClose, 1500);
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border-2 border-red-600/50 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-600/20 p-4 rounded-full border border-red-500/30">
            <TrendingUp className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2 text-white">
          Join America First Intelligence
        </h2>

        {/* Subtitle */}
        <p className="text-center text-slate-400 mb-6 text-sm">
          Get curated patriot news delivered daily. No spam, no BS. Just the intel you need.
        </p>

        {/* Benefits list */}
        <ul className="space-y-2 mb-6 text-sm">
          <li className="flex items-start gap-2 text-slate-300">
            <span className="text-red-500 mt-0.5">✓</span>
            <span><strong>Daily digest</strong> of top stories from 30+ patriot sources</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300">
            <span className="text-red-500 mt-0.5">✓</span>
            <span><strong>Exclusive alerts</strong> when your favorite streamers go live</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300">
            <span className="text-red-500 mt-0.5">✓</span>
            <span><strong>Early access</strong> to premium features launching soon</span>
          </li>
        </ul>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Get Daily Intel
              </>
            )}
          </button>
        </form>

        {/* Privacy note */}
        <p className="text-center text-xs text-slate-500 mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
