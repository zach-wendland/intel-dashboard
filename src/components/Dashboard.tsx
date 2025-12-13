// Unified Dashboard Component - Consolidates Left and Right Wing Dashboards
import { useState, useEffect } from 'react';
import {
  Activity,
  Globe,
  Radio,
  BookOpen,
  Shield,
  ShieldAlert,
  Server,
  Database,
  AlertTriangle,
  Cpu,
  Users,
  Zap,
  ExternalLink,
  RefreshCw,
  Wifi,
  LogOut,
  Bookmark,
  BookmarkCheck,
  Play
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { feedService, type FeedItem, type FeedStatus, type SourceItem } from '../services/feedService';

// Import modular components
import { FeedGridSkeleton } from './LoadingState';
import { SearchBar } from './ui/SearchBar';
import { TrendingWidget } from './ui/TrendingWidget';
import { useSearch } from '../hooks/useSearch';
import { useTrending } from '../hooks/useTrending';
import { useBookmarks } from '../hooks/useBookmarks';
import { useReadingHistory } from '../hooks/useReadingHistory';
import type { MediaSettings } from '../types';
import { MediaView } from './views/MediaView';

// Import configurations from both perspectives
import {
  RIGHT_LIVE_FEEDS,
  RIGHT_SOURCE_CATEGORIES,
  RIGHT_SOURCES,
} from '../config/rightWingSources';
import {
  LEFT_LIVE_FEEDS,
  LEFT_SOURCE_CATEGORIES,
  LEFT_SOURCES,
} from '../config/leftWingSources';

export type Perspective = 'right' | 'left';

// Icon mapping for dynamic icon rendering
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Radio,
  Users,
  Globe,
  Shield,
  ShieldAlert,
  Server,
  Zap
};

// Perspective-specific configuration
interface PerspectiveConfig {
  title: string;
  subtitle: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  selectionColor: string;
  switchLabel: string;
  liveFeeds: SourceItem[];
  sourceCategories: Record<string, { label: string; icon: string; color: string }>;
  sources: SourceItem[];
  sidebarTitle: string;
  sidebarItems: string[];
  trendingTags: string[];
  tierHighlight: string;
}

const PERSPECTIVE_CONFIG: Record<Perspective, PerspectiveConfig> = {
  right: {
    title: 'RIGHT-WING INTELLIGENCE GRID',
    subtitle: 'CONSERVATIVE',
    accentColor: 'text-red-500',
    accentBg: 'bg-red-600/20',
    accentBorder: 'border-red-500/30',
    selectionColor: 'selection:bg-red-900',
    switchLabel: 'Switch to Left-Wing',
    liveFeeds: RIGHT_LIVE_FEEDS,
    sourceCategories: RIGHT_SOURCE_CATEGORIES,
    sources: RIGHT_SOURCES,
    sidebarTitle: 'Threat Vectors (Simulated)',
    sidebarItems: ['Censorship/De-platforming', 'Foreign Aid Bills', 'Cultural Subversion', 'Surveillance State'],
    trendingTags: ['AIPAC', 'ADL', 'WEF', 'Neocons', 'Open Borders', 'USS Liberty', 'Section 230'],
    tierHighlight: 'bg-red-900/20 text-red-400 border-red-900/30'
  },
  left: {
    title: 'LEFT-WING INTELLIGENCE GRID',
    subtitle: 'PROGRESSIVE',
    accentColor: 'text-blue-500',
    accentBg: 'bg-blue-600/20',
    accentBorder: 'border-blue-500/30',
    selectionColor: 'selection:bg-blue-900',
    switchLabel: 'Switch to Right-Wing',
    liveFeeds: LEFT_LIVE_FEEDS,
    sourceCategories: LEFT_SOURCE_CATEGORIES,
    sources: LEFT_SOURCES,
    sidebarTitle: 'Priority Issues (Simulated)',
    sidebarItems: ['Climate Crisis', 'Healthcare Access', 'Income Inequality', 'Voting Rights'],
    trendingTags: ['Climate Justice', 'Labor Rights', 'Healthcare For All', 'Voting Rights', 'Wealth Tax', 'Green New Deal', 'Student Debt'],
    tierHighlight: 'bg-blue-900/20 text-blue-400 border-blue-900/30'
  }
};

// Helper Functions
function calculateFeedMetrics(feedStatus: Record<string | number, FeedStatus>, totalFeeds: number) {
  const okCount = Object.values(feedStatus).filter(s => s === 'ok').length;
  return {
    okCount,
    totalCount: totalFeeds,
    allHealthy: okCount === totalFeeds,
    someHealthy: okCount > 0,
  };
}

function getStatusColors(metrics: ReturnType<typeof calculateFeedMetrics>) {
  if (metrics.allHealthy) {
    return {
      bg: 'rgb(20 83 11 / 0.2)',
      border: 'rgb(34 197 94 / 0.3)',
      text: '#22c55e',
      indicator: 'rgb(34 197 94)',
    };
  } else if (metrics.someHealthy) {
    return {
      bg: 'rgb(120 53 15 / 0.2)',
      border: 'rgb(217 119 6 / 0.3)',
      text: '#d97706',
      indicator: 'rgb(217 119 6)',
    };
  } else {
    return {
      bg: 'rgb(127 29 29 / 0.2)',
      border: 'rgb(239 68 68 / 0.3)',
      text: '#ef4444',
      indicator: 'rgb(239 68 68)',
    };
  }
}

// Error Alert Component
function FeedErrorAlert({
  errorMessages,
  liveFeeds
}: {
  errorMessages: Record<string | number, string>;
  liveFeeds: SourceItem[];
}) {
  if (Object.keys(errorMessages).length === 0) return null;

  return (
    <div className="bg-red-900/20 border-b border-red-800/50 p-4 text-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-semibold mb-2">Feed Errors:</p>
          <ul className="text-red-200 space-y-1 text-xs">
            {Object.entries(errorMessages).map(([feedId, error]) => {
              const feed = liveFeeds.find(f => String(f.id) === feedId);
              return (
                <li key={feedId}>
                  <span className="text-red-300">{feed?.name || feedId}:</span> {error}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Props interface
interface DashboardProps {
  perspective: Perspective;
  onSwitchPerspective: () => void;
}

// Default media settings
const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  rumbleChannels: [
    { id: '1', name: 'Rumble Trending', embedId: 'c/Trending' },
  ],
  twitterAccounts: [
    { handle: 'elonmusk', name: 'Elon Musk' },
  ],
};

export default function Dashboard({ perspective, onSwitchPerspective }: DashboardProps) {
  const config = PERSPECTIVE_CONFIG[perspective];
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [feedStatus, setFeedStatus] = useState<Record<string | number, FeedStatus>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string | number, string>>({});
  const [mediaSettings, setMediaSettings] = useState<MediaSettings>(DEFAULT_MEDIA_SETTINGS);

  // Use modular hooks for search, trending, bookmarks, and history
  const { filters, updateFilter, filteredFeed, resultCount } = useSearch(feed);
  const { trending, chartData: trendingChartData, narrativeData: trendingNarrativeData } = useTrending(feed);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { hasRead, addToHistory } = useReadingHistory();

  // Use trending data for charts (replaces inline computation)
  const chartData = trendingChartData;
  const narrativeData = trendingNarrativeData;

  const fetchLiveFeed = async () => {
    setIsRefreshing(true);
    setErrorMessages({});

    try {
      // Clear cache to force fresh fetch
      feedService.clearCache();

      const result = await feedService.fetchFeeds(config.liveFeeds);

      setFeed(result.items);
      setFeedStatus(result.status);
      setErrorMessages(result.errors);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      // Note: chartData and narrativeData are now computed by useTrending hook
    } catch (e) {
      console.error("Global fetch error", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();
  }, [perspective]); // Re-fetch when perspective changes

  const filteredSources = filter === 'ALL'
    ? config.sources
    : config.sources.filter(s => s.category === filter);

  const metrics = calculateFeedMetrics(feedStatus, config.liveFeeds.length);
  const colors = getStatusColors(metrics);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans ${config.selectionColor} selection:text-white`}>
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${config.accentBg} p-2 rounded-lg border ${config.accentBorder}`}>
              <Activity className={`h-6 w-6 ${config.accentColor}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{config.title}</h1>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                PERSPECTIVE: {config.subtitle}
                <span className="text-slate-600">|</span>
                STATUS: {isRefreshing ? <span className="text-yellow-400 animate-pulse">SYNCING...</span> : <span className="text-green-400">ONLINE</span>}
              </p>
            </div>
          </div>

          <nav className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            <button onClick={() => setActiveTab('grid')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'grid' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Database className="h-4 w-4 inline mr-2" />Intel Grid
            </button>
            <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'feed' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              {perspective === 'right' ? <Zap className="h-4 w-4 inline mr-2" /> : <Users className="h-4 w-4 inline mr-2" />}
              Live Wire
            </button>
            <button onClick={() => setActiveTab('synthesis')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'synthesis' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Cpu className="h-4 w-4 inline mr-2" />Synthesis
            </button>
            <button onClick={() => setActiveTab('media')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'media' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Play className="h-4 w-4 inline mr-2" />Media
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onSwitchPerspective}
              className={`text-xs px-3 py-1.5 ${perspective === 'right' ? 'bg-blue-900/30 border-blue-700/50 text-blue-300 hover:bg-blue-900/50' : 'bg-red-900/30 border-red-700/50 text-red-300 hover:bg-red-900/50'} border rounded transition-all`}
            >
              {config.switchLabel}
            </button>
            <button onClick={fetchLiveFeed} disabled={isRefreshing} className={`flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-all ${isRefreshing ? 'opacity-70 cursor-wait' : ''}`}>
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              {isRefreshing ? 'SYNCING...' : 'REFRESH INTEL'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs border" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
              <span className="relative flex h-2 w-2">
                <span className={`${isRefreshing ? 'animate-spin' : 'animate-pulse'} absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: colors.indicator }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: colors.indicator }}></span>
              </span>
              FEEDS: {metrics.okCount}/{metrics.totalCount}
            </div>
            {user && (
              <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-all">
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'grid' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
              <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border ${filter === 'ALL' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'}`}>All Sources</button>
              {Object.entries(config.sourceCategories).map(([key, catConfig]) => {
                const IconComponent = ICON_MAP[catConfig.icon];
                return (
                  <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border flex items-center gap-2 ${filter === key ? 'bg-slate-800 border-slate-600 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                    {IconComponent && <IconComponent className={`h-3 w-3 ${catConfig.color}`} />}
                    {catConfig.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSources.map((source) => {
                const categoryConfig = config.sourceCategories[source.category];
                const CategoryIcon = categoryConfig ? ICON_MAP[categoryConfig.icon] : null;

                return (
                  <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" className="group bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-500 transition-all hover:shadow-lg hover:shadow-slate-900/50 hover:-translate-y-1 block relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded bg-slate-950 border border-slate-800 ${categoryConfig?.color || 'text-slate-400'}`}>
                        {CategoryIcon && <CategoryIcon className="h-5 w-5" />}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${source.tier === 'High' ? config.tierHighlight : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        TIER: {source.tier?.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-200 group-hover:text-white truncate pr-6">{source.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-3">{source.focus}</p>
                    <div className="flex items-center justify-between text-xs text-slate-600 font-mono mt-auto pt-3 border-t border-slate-800/50">
                      <span>STATUS: ONLINE</span>
                      <Activity className="h-3 w-3 text-green-500" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wifi className={`h-5 w-5 ${config.accentColor} animate-pulse`} />
                  Live Wire Intercepts
                  {lastUpdated && <span className="text-xs font-mono font-normal text-slate-500 ml-2">(UPDATED: {lastUpdated})</span>}
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  {resultCount} / {feed.length} articles
                </span>
              </div>

              {/* Search bar for filtering articles */}
              <SearchBar
                value={filters.query}
                onChange={(value) => updateFilter('query', value)}
                placeholder="Search articles..."
              />

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
                <FeedErrorAlert errorMessages={errorMessages} liveFeeds={config.liveFeeds} />

                {/* Loading skeleton */}
                {isRefreshing && feed.length === 0 && (
                  <FeedGridSkeleton count={6} />
                )}

                {/* Empty state */}
                {feed.length === 0 && !isRefreshing && (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                    <p>No signals intercepted. Check connection.</p>
                  </div>
                )}

                {/* No results from search */}
                {feed.length > 0 && filteredFeed.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                    <p>No articles match your search.</p>
                  </div>
                )}

                {/* Feed items with bookmark buttons */}
                {filteredFeed.map((item) => {
                  const bookmarked = isBookmarked(item.id);
                  const read = hasRead(item.id);

                  return (
                    <div key={item.id} className={`relative border-b border-slate-800 ${read ? 'opacity-70' : ''}`}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => addToHistory(item.id, item.title, item.url, item.source, perspective)}
                        className="block p-4 hover:bg-slate-800/80 transition-all group cursor-pointer pr-16"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-mono text-blue-400 bg-blue-900/10 px-1.5 py-0.5 rounded">{item.topic.toUpperCase()}</span>
                          <span className="text-xs font-mono text-slate-500">{item.time}</span>
                        </div>
                        <h3 className={`text-sm font-medium ${read ? 'text-slate-400' : 'text-slate-200'} group-hover:text-blue-400 transition-colors mb-2 pr-6 line-clamp-2`}>
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-slate-300">
                              <Globe className="h-3 w-3" />
                              {item.source}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-600">VIRALITY:</span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${perspective === 'right' ? 'bg-gradient-to-r from-blue-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                                style={{ width: `${item.velocity}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </a>

                      {/* Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (bookmarked) {
                            // Find the bookmark to remove
                            removeBookmark(item.id);
                          } else {
                            addBookmark(item.id, item.title, item.url, item.source);
                          }
                        }}
                        className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
                          bookmarked
                            ? 'text-yellow-400 bg-yellow-900/20'
                            : 'text-slate-500 hover:text-yellow-400 hover:bg-yellow-900/10'
                        }`}
                        title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  {config.sidebarTitle}
                </h3>
                <div className="space-y-3">
                  {config.sidebarItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{item}</span>
                      <span className={`${perspective === 'right' ? 'text-red-400' : 'text-blue-400'} font-mono`}>
                        {perspective === 'right' ? 'CRITICAL' : 'HIGH'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use TrendingWidget with real trending data */}
              <TrendingWidget
                trending={trending}
                onTopicClick={(topic) => updateFilter('query', topic)}
                maxItems={8}
              />
            </div>
          </div>
        )}

        {activeTab === 'synthesis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2 bg-green-900/10 border border-green-700/30 p-4 rounded-lg mb-4 flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-500" />
              <p className="text-sm text-green-200">
                <strong>LIVE DATA:</strong> Charts below are computed from <em>actual feed data</em>. Topic distribution and volume are derived from {feed.length} articles.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Article Volume Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.length > 0 ? chartData : [{ name: 'No data', volume: 0, sentiment: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={false} name="Volume" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Topic Distribution (from feeds)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={narrativeData.length > 0 ? narrativeData : [{ topic: 'No data', value: 0 }]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="topic" type="category" stroke="#94a3b8" fontSize={12} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} cursor={{ fill: '#1e293b' }} />
                    <Bar dataKey="value" fill={perspective === 'right' ? '#6366f1' : '#3b82f6'} radius={[0, 4, 4, 0]} name="Articles %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <MediaView
            settings={mediaSettings}
            onSettingsChange={setMediaSettings}
          />
        )}
      </main>
    </div>
  );
}
