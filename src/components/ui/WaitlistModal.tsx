import { useState } from 'react';
import { X, Crown, Mail, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveEmailSignup } from '../../lib/supabase';

interface WaitlistModalProps {
  onClose: () => void;
}

export function WaitlistModal({ onClose }: WaitlistModalProps) {
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
      // Save to Supabase
      const { error } = await saveEmailSignup(email, 'premium_waitlist');

      if (error) {
        // Fallback to localStorage if Supabase fails
        console.warn('Supabase error, falling back to localStorage:', error);
        const waitlist = JSON.parse(localStorage.getItem('premium_waitlist') || '[]');
        waitlist.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('premium_waitlist', JSON.stringify(waitlist));
      }

      toast.success("You're on the premium waitlist!");
      setTimeout(onClose, 1500);
    } catch {
      // Fallback to localStorage on any error
      const waitlist = JSON.parse(localStorage.getItem('premium_waitlist') || '[]');
      waitlist.push({ email, timestamp: new Date().toISOString() });
      localStorage.setItem('premium_waitlist', JSON.stringify(waitlist));
      toast.success("You're on the premium waitlist!");
      setTimeout(onClose, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border-2 border-yellow-600/50 rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in duration-200">
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
          <div className="bg-yellow-600/20 p-4 rounded-full border border-yellow-500/30">
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2 text-white">
          Join Premium Waitlist
        </h2>

        {/* Subtitle */}
        <p className="text-center text-slate-400 mb-6 text-sm">
          Be first to access exclusive features when we launch.
        </p>

        {/* Benefits list */}
        <ul className="space-y-2 mb-6 text-sm">
          <li className="flex items-start gap-2 text-slate-300">
            <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span><strong>Cloud sync</strong> - Access bookmarks & history anywhere</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300">
            <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span><strong>Live alerts</strong> - Know when your streamers go live</span>
          </li>
          <li className="flex items-start gap-2 text-slate-300">
            <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span><strong>Ad-free</strong> - Clean, distraction-free experience</span>
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
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-yellow-950 font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-yellow-950/30 border-t-yellow-950 rounded-full animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4" />
                Join Waitlist
              </>
            )}
          </button>
        </form>

        {/* Privacy note */}
        <p className="text-center text-xs text-slate-500 mt-4">
          No spam. We'll only email you about premium launch.
        </p>
      </div>
    </div>
  );
}
