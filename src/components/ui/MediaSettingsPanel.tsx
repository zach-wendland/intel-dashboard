import { useState } from 'react';
import { Settings, Plus, X, Video, Twitter } from 'lucide-react';
import type { MediaSettings, RumbleChannel, TwitterAccount } from '../../types';

interface MediaSettingsPanelProps {
  settings: MediaSettings;
  onSettingsChange: (settings: MediaSettings) => void;
}

/**
 * Settings panel for configuring media sources (Rumble channels, X accounts)
 */
export function MediaSettingsPanel({
  settings,
  onSettingsChange,
}: MediaSettingsPanelProps) {
  const [newRumbleId, setNewRumbleId] = useState('');
  const [newRumbleName, setNewRumbleName] = useState('');
  const [newTwitterHandle, setNewTwitterHandle] = useState('');
  const [newTwitterName, setNewTwitterName] = useState('');

  // Add Rumble channel
  const handleAddRumble = () => {
    if (!newRumbleId.trim() || !newRumbleName.trim()) return;

    const newChannel: RumbleChannel = {
      id: newRumbleId.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: newRumbleName.trim(),
      embedId: newRumbleId.trim(),
    };

    // Check for duplicates
    if (settings.rumbleChannels.some(c => c.embedId === newChannel.embedId)) {
      return;
    }

    onSettingsChange({
      ...settings,
      rumbleChannels: [...settings.rumbleChannels, newChannel],
    });

    setNewRumbleId('');
    setNewRumbleName('');
  };

  // Remove Rumble channel
  const handleRemoveRumble = (id: string) => {
    onSettingsChange({
      ...settings,
      rumbleChannels: settings.rumbleChannels.filter(c => c.id !== id),
    });
  };

  // Add Twitter account
  const handleAddTwitter = () => {
    if (!newTwitterHandle.trim()) return;

    const handle = newTwitterHandle.trim().replace('@', '');
    const name = newTwitterName.trim() || handle;

    const newAccount: TwitterAccount = {
      handle,
      name,
    };

    // Check for duplicates
    if (settings.twitterAccounts.some(a => a.handle.toLowerCase() === handle.toLowerCase())) {
      return;
    }

    onSettingsChange({
      ...settings,
      twitterAccounts: [...settings.twitterAccounts, newAccount],
    });

    setNewTwitterHandle('');
    setNewTwitterName('');
  };

  // Remove Twitter account
  const handleRemoveTwitter = (handle: string) => {
    onSettingsChange({
      ...settings,
      twitterAccounts: settings.twitterAccounts.filter(a => a.handle !== handle),
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <Settings className="h-4 w-4 text-slate-400" />
        Media Settings
      </h3>

      {/* Rumble Channels */}
      <div className="mb-6">
        <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Video className="h-3 w-3 text-green-500" />
          Rumble Channels
        </h4>

        {/* Current channels */}
        <div className="space-y-2 mb-3">
          {settings.rumbleChannels.map(channel => (
            <div
              key={channel.id}
              className="flex items-center justify-between p-2 bg-slate-800 rounded-lg group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">{channel.name}</span>
                <span className="text-xs text-slate-500">({channel.embedId})</span>
              </div>
              <button
                onClick={() => handleRemoveRumble(channel.id)}
                className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${channel.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new channel */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newRumbleName}
            onChange={(e) => setNewRumbleName(e.target.value)}
            placeholder="Channel name"
            className="flex-1 px-3 py-2 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg
                       text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-500"
          />
          <input
            type="text"
            value={newRumbleId}
            onChange={(e) => setNewRumbleId(e.target.value)}
            placeholder="Embed ID"
            className="w-32 px-3 py-2 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg
                       text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleAddRumble}
            disabled={!newRumbleId.trim() || !newRumbleName.trim()}
            className="px-3 py-2 min-h-[44px] bg-green-600 text-white rounded-lg
                       hover:bg-green-500 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          Find the embed ID in the Rumble channel URL (e.g., rumble.com/c/<strong>channelid</strong>)
        </p>
      </div>

      {/* Twitter Accounts */}
      <div>
        <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Twitter className="h-3 w-3 text-blue-400" />
          X / Twitter Accounts
        </h4>

        {/* Current accounts */}
        <div className="space-y-2 mb-3">
          {settings.twitterAccounts.map(account => (
            <div
              key={account.handle}
              className="flex items-center justify-between p-2 bg-slate-800 rounded-lg group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">{account.name}</span>
                <span className="text-xs text-slate-500">@{account.handle}</span>
              </div>
              <button
                onClick={() => handleRemoveTwitter(account.handle)}
                className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove @${account.handle}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new account */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTwitterName}
            onChange={(e) => setNewTwitterName(e.target.value)}
            placeholder="Display name (optional)"
            className="flex-1 px-3 py-2 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg
                       text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newTwitterHandle}
            onChange={(e) => setNewTwitterHandle(e.target.value)}
            placeholder="@username"
            className="w-32 px-3 py-2 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg
                       text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTwitter()}
          />
          <button
            onClick={handleAddTwitter}
            disabled={!newTwitterHandle.trim()}
            className="px-3 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg
                       hover:bg-blue-500 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MediaSettingsPanel;
