import { useState } from 'react';
import { Video, ExternalLink, AlertTriangle } from 'lucide-react';
import type { RumbleChannel } from '../../types';

interface RumbleWidgetProps {
  channels: RumbleChannel[];
}

/**
 * Rumble video embed widget with channel selector
 */
export function RumbleWidget({ channels }: RumbleWidgetProps) {
  const [selectedChannel, setSelectedChannel] = useState(channels[0]?.id || '');
  const [hasError, setHasError] = useState(false);

  const channel = channels.find(c => c.id === selectedChannel);

  if (channels.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Video className="h-4 w-4 text-green-500" />
          Rumble Live
        </h3>
        <p className="text-xs text-slate-500">No channels configured</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <Video className="h-4 w-4 text-green-500" />
        Rumble Live
      </h3>

      {/* Channel selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {channels.map(ch => (
          <button
            key={ch.id}
            onClick={() => {
              setSelectedChannel(ch.id);
              setHasError(false);
            }}
            className={`px-3 py-2 min-h-[44px] rounded-lg text-sm transition-all active:scale-95
              ${selectedChannel === ch.id
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
              }`}
          >
            {ch.name}
          </button>
        ))}
      </div>

      {/* Video embed */}
      {channel && !hasError ? (
        <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden">
          <iframe
            src={`https://rumble.com/embed/${channel.embedId}/`}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            title={`Rumble: ${channel.name}`}
            onError={() => setHasError(true)}
          />
        </div>
      ) : (
        <div className="aspect-video bg-slate-950 rounded-lg flex flex-col items-center justify-center gap-3">
          <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
          <p className="text-sm text-slate-500">Unable to load video</p>
          {channel && (
            <a
              href={`https://rumble.com/c/${channel.embedId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg
                         hover:bg-green-500 active:scale-95 transition-all"
            >
              Watch on Rumble
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      <p className="text-xs text-slate-600 mt-2">
        Video availability depends on channel activity
      </p>
    </div>
  );
}

export default RumbleWidget;
