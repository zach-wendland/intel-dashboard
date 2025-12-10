import { useState } from 'react';
import { Settings } from 'lucide-react';
import type { MediaSettings } from '../../types';
import { RumbleWidget } from '../ui/RumbleWidget';
import { TwitterWidget } from '../ui/TwitterWidget';
import { MediaSettingsPanel } from '../ui/MediaSettingsPanel';

interface MediaViewProps {
  settings: MediaSettings;
  onSettingsChange: (settings: MediaSettings) => void;
}

/**
 * Media view combining Rumble and Twitter widgets with settings
 */
export function MediaView({ settings, onSettingsChange }: MediaViewProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with settings toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200">
          Live Media Streams
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg text-sm transition-all active:scale-95
            ${showSettings
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Settings panel (collapsible) */}
      {showSettings && (
        <MediaSettingsPanel
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}

      {/* Media widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RumbleWidget channels={settings.rumbleChannels} />
        <TwitterWidget accounts={settings.twitterAccounts} />
      </div>

      {/* Info note */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <p className="text-xs text-slate-500">
          <strong className="text-slate-400">Note:</strong> Media embeds may be blocked by your browser
          or content provider policies. If embeds don't load, use the direct links to view content
          on their respective platforms.
        </p>
      </div>
    </div>
  );
}

export default MediaView;
