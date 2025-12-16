import { useState } from 'react';
import {
  Play,
  ExternalLink,
  Radio,
  Users,
  Clock,
  Tv,
  Maximize2,
  X
} from 'lucide-react';
import {
  ALL_STREAMERS,
  FEATURED_STREAMERS,
  STREAMER_CATEGORIES,
  PLATFORM_CONFIG,
  type Streamer,
  type Platform
} from '../../config/streamers';

// Platform icons mapping
const PLATFORM_ICONS: Record<Platform, string> = {
  kick: '🟢',
  rumble: '🟩',
  youtube: '🔴',
  twitch: '🟣',
  cozy: '🔵'
};

interface StreamCardProps {
  streamer: Streamer;
  onExpand: (streamer: Streamer) => void;
}

function StreamCard({ streamer, onExpand }: StreamCardProps) {
  const platformConfig = PLATFORM_CONFIG[streamer.platform];
  const categoryConfig = STREAMER_CATEGORIES[streamer.category];

  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-slate-900/50">
      {/* Thumbnail / Preview Area */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-slate-950/80" />

        {/* Platform badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-mono uppercase ${platformConfig.bgColor} ${platformConfig.color} border border-current/20`}>
          {PLATFORM_ICONS[streamer.platform]} {platformConfig.label}
        </div>

        {/* Live indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-red-900/80 rounded text-[10px] font-mono text-red-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          LIVE
        </div>

        {/* Center play button */}
        <button
          onClick={() => onExpand(streamer)}
          className="relative z-10 p-4 bg-slate-800/80 hover:bg-red-600/80 rounded-full transition-all group-hover:scale-110"
        >
          <Play className="h-8 w-8 text-white fill-white" />
        </button>

        {/* Expand button */}
        <button
          onClick={() => onExpand(streamer)}
          className="absolute bottom-2 right-2 p-2 bg-slate-800/80 hover:bg-slate-700 rounded transition-all opacity-0 group-hover:opacity-100"
          title="Expand stream"
        >
          <Maximize2 className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* Info section */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-200 truncate">{streamer.name}</h3>
          <a
            href={streamer.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-slate-800 rounded transition-all flex-shrink-0"
            title="Open channel"
          >
            <ExternalLink className="h-4 w-4 text-slate-500 hover:text-slate-300" />
          </a>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{streamer.description}</p>

        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className={categoryConfig.color}>{categoryConfig.label}</span>
          {streamer.followers && (
            <span className="text-slate-500 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {streamer.followers}
            </span>
          )}
        </div>

        {streamer.schedule && (
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-500">
            <Clock className="h-3 w-3" />
            {streamer.schedule}
          </div>
        )}
      </div>
    </div>
  );
}

interface ExpandedStreamProps {
  streamer: Streamer;
  onClose: () => void;
}

function ExpandedStream({ streamer, onClose }: ExpandedStreamProps) {
  const platformConfig = PLATFORM_CONFIG[streamer.platform];
  const embedUrl = platformConfig.getEmbedUrl(streamer.username);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded ${platformConfig.bgColor} ${platformConfig.color} text-sm font-mono`}>
              {PLATFORM_ICONS[streamer.platform]} {platformConfig.label}
            </div>
            <h2 className="text-xl font-bold text-white">{streamer.name}</h2>
            <a
              href={streamer.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open Channel
            </a>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="h-6 w-6 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Video embed */}
        <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen"
            title={`${streamer.name} live stream`}
          />
        </div>

        {/* Info footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <p>{streamer.description}</p>
          {streamer.schedule && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {streamer.schedule}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function LiveStreamsView() {
  const [platformFilter, setPlatformFilter] = useState<Platform | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<Streamer['category'] | 'ALL'>('ALL');
  const [expandedStreamer, setExpandedStreamer] = useState<Streamer | null>(null);

  // Filter streamers
  const filteredStreamers = ALL_STREAMERS.filter(streamer => {
    if (platformFilter !== 'ALL' && streamer.platform !== platformFilter) return false;
    if (categoryFilter !== 'ALL' && streamer.category !== categoryFilter) return false;
    return true;
  });

  // Get featured streamers for top section
  const featuredToShow = FEATURED_STREAMERS.filter(s =>
    (platformFilter === 'ALL' || s.platform === platformFilter) &&
    (categoryFilter === 'ALL' || s.category === categoryFilter)
  ).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600/20 rounded-lg border border-red-500/30">
            <Tv className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">LIVE STREAMS</h2>
            <p className="text-xs text-slate-400 font-mono">
              {filteredStreamers.length} PATRIOT BROADCASTERS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-red-400 font-mono">BROADCASTING LIVE</span>
        </div>
      </div>

      {/* Platform filters */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
        <button
          onClick={() => setPlatformFilter('ALL')}
          className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border transition-all ${
            platformFilter === 'ALL'
              ? 'bg-slate-800 border-slate-600 text-white'
              : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'
          }`}
        >
          All Platforms
        </button>
        {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG[Platform]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setPlatformFilter(key)}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border flex items-center gap-2 transition-all ${
              platformFilter === key
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'
            }`}
          >
            <span>{PLATFORM_ICONS[key]}</span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border transition-all ${
            categoryFilter === 'ALL'
              ? 'bg-slate-800 border-slate-600 text-white'
              : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'
          }`}
        >
          All Categories
        </button>
        {(Object.entries(STREAMER_CATEGORIES) as [Streamer['category'], typeof STREAMER_CATEGORIES[Streamer['category']]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setCategoryFilter(key)}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border flex items-center gap-2 transition-all ${
              categoryFilter === key
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'
            }`}
          >
            <span className={config.color}>●</span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Featured section */}
      {featuredToShow.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-500" />
            FEATURED STREAMS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredToShow.map(streamer => (
              <StreamCard
                key={streamer.id}
                streamer={streamer}
                onExpand={setExpandedStreamer}
              />
            ))}
          </div>
        </div>
      )}

      {/* All streams grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          ALL BROADCASTERS ({filteredStreamers.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStreamers.map(streamer => (
            <StreamCard
              key={streamer.id}
              streamer={streamer}
              onExpand={setExpandedStreamer}
            />
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredStreamers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Tv className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">No streamers match your filters.</p>
          <button
            onClick={() => {
              setPlatformFilter('ALL');
              setCategoryFilter('ALL');
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Expanded stream modal */}
      {expandedStreamer && (
        <ExpandedStream
          streamer={expandedStreamer}
          onClose={() => setExpandedStreamer(null)}
        />
      )}
    </div>
  );
}
