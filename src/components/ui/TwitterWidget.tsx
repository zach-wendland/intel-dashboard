import { useState, useEffect, useRef } from 'react';
import { Twitter, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import type { TwitterAccount } from '../../types';

// Declare Twitter widget API
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
        createTimeline: (
          dataSource: { sourceType: string; screenName: string },
          targetEl: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
    };
  }
}

interface TwitterWidgetProps {
  accounts: TwitterAccount[];
}

/**
 * Twitter/X timeline embed widget with account selector
 */
export function TwitterWidget({ accounts }: TwitterWidgetProps) {
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.handle || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const account = accounts.find(a => a.handle === selectedAccount);

  // Load Twitter widgets.js script
  useEffect(() => {
    const loadTwitterScript = () => {
      if (window.twttr) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Twitter widgets'));
        document.body.appendChild(script);
      });
    };

    loadTwitterScript().catch(() => setHasError(true));
  }, []);

  // Create timeline when account changes
  useEffect(() => {
    if (!account || !containerRef.current) return;

    setIsLoading(true);
    setHasError(false);

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Wait for twttr to be available
    const createTimeline = async () => {
      try {
        // Give time for script to initialize
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!window.twttr?.widgets?.createTimeline) {
          throw new Error('Twitter widgets not available');
        }

        const result = await window.twttr.widgets.createTimeline(
          {
            sourceType: 'profile',
            screenName: account.handle,
          },
          containerRef.current!,
          {
            theme: 'dark',
            height: 400,
            chrome: 'noheader nofooter noborders transparent',
          }
        );

        if (!result) {
          throw new Error('Timeline creation failed');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Twitter widget error:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    createTimeline();
  }, [selectedAccount, account]);

  if (accounts.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Twitter className="h-4 w-4 text-blue-400" />
          X / Twitter Feed
        </h3>
        <p className="text-xs text-slate-500">No accounts configured</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <Twitter className="h-4 w-4 text-blue-400" />
        X / Twitter Feed
      </h3>

      {/* Account selector */}
      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
        {accounts.map(acc => (
          <button
            key={acc.handle}
            onClick={() => setSelectedAccount(acc.handle)}
            className={`px-3 py-2 min-h-[44px] rounded-lg text-sm whitespace-nowrap transition-all active:scale-95
              ${selectedAccount === acc.handle
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
              }`}
          >
            @{acc.handle}
          </button>
        ))}
      </div>

      {/* Timeline container */}
      <div className="max-h-[400px] overflow-y-auto bg-slate-950 rounded-lg min-h-[200px]">
        {isLoading && !hasError && (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
          </div>
        )}

        {hasError && (
          <div className="flex flex-col items-center justify-center h-[200px] gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
            <p className="text-sm text-slate-500 text-center">
              Unable to load timeline
            </p>
            {account && (
              <a
                href={`https://twitter.com/${account.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg
                           hover:bg-blue-500 active:scale-95 transition-all"
              >
                View on X
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        <div
          ref={containerRef}
          className={isLoading || hasError ? 'hidden' : ''}
        />
      </div>
    </div>
  );
}

export default TwitterWidget;
