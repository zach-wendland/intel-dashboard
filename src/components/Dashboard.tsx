// America First Intelligence Grid Dashboard
import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Globe,
  AlertTriangle,
  Cpu,
  Zap,
  RefreshCw,
  Wifi,
  Play,
  Menu,
  X,
  Bookmark,
  History,
  Trash2,
  Tv
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
import { feedService, type FeedItem, type FeedStatus, type SourceItem } from '../services/feedService';

// Import modular components
import { FeedGridSkeleton } from './LoadingState';
import { SearchBar } from './ui/SearchBar';
import { FilterPanel } from './ui/FilterPanel';
import { TrendingWidget } from './ui/TrendingWidget';
import { TopicHeatmap } from './ui/TopicHeatmap';
import { useSearch } from '../hooks/useSearch';
import { useTrending } from '../hooks/useTrending';
import { useBookmarks } from '../hooks/useBookmarks';
import { useReadingHistory } from '../hooks/useReadingHistory';
import type { MediaSettings } from '../types';
import { MediaView } from './views/MediaView';
import { FeedItemCard } from './ui/FeedItem';
import { LiveStreamsView } from './views/LiveStreamsView';
import { EmailCapturePopup } from './ui/EmailCapturePopup';
import { useEmailCapturePopup } from '../hooks/useEmailCapturePopup';
import { PremiumBanner } from './ui/PremiumBanner';
import { Toaster } from 'react-hot-toast';
import { AuthModal } from './ui/AuthModal';
import { UserMenu } from './ui/UserMenu';

// Import America First configuration
import { RIGHT_LIVE_FEEDS as AMERICA_FIRST_LIVE_FEEDS } from '../config/americaFirstSources';


// America First configuration
const CONFIG = {
  title: 'AMERICA FIRST INTELLIGENCE GRID',
  subtitle: 'PATRIOT NETWORK',
  accentColor: 'text-red-500',
  accentBg: 'bg-red-600/20',
  accentBorder: 'border-red-500/30',
  selectionColor: 'selection:bg-red-900',
  liveFeeds: AMERICA_FIRST_LIVE_FEEDS,
  sidebarTitle: 'Priority Watch List',
  sidebarItems: ['Big Tech Censorship', 'Border Invasion', 'Deep State Exposure', 'Globalist Agenda', 'Foreign Aid / Israel'],
  trendingTags: ['America First', 'MAGA', 'Groyper', 'Deep State', 'Border Crisis', 'Globalists', 'Big Tech', 'AIPAC']
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

// Default media settings
const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  rumbleChannels: [
    { id: '1', name: 'Rumble Trending', embedId: 'c/Trending' },
  ],
  twitterAccounts: [
    { handle: 'elonmusk', name: 'Elon Musk' },
  ],
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'grid' | 'feed' | 'synthesis' | 'media' | 'bookmarks' | 'history'>('grid');
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [feedStatus, setFeedStatus] = useState<Record<string | number, FeedStatus>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string | number, string>>({});
  const [mediaSettings, setMediaSettings] = useState<MediaSettings>(DEFAULT_MEDIA_SETTINGS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Use modular hooks for search, trending, bookmarks, and history
  const { filters, updateFilter, resetFilters, filteredFeed, resultCount, presets, savePreset, loadPreset, deletePreset } = useSearch(feed);
  const { trending, chartData: trendingChartData, narrativeData: trendingNarrativeData, sourceMatrix } = useTrending(feed);
  const { bookmarks, isBookmarked, addBookmark, removeBookmark, clearAllBookmarks } = useBookmarks();
  const { history, hasRead, addToHistory, clearHistory } = useReadingHistory();

  // Use trending data for charts
  const chartData = trendingChartData;
  const narrativeData = trendingNarrativeData;

  // Email capture popup
  const { showPopup, handleClose, handleSubmit } = useEmailCapturePopup();

  const fetchLiveFeed = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessages({});

    try {
      // Clear cache to force fresh fetch
      feedService.clearCache();

      const result = await feedService.fetchFeeds(CONFIG.liveFeeds);

      setFeed(result.items);
      setFeedStatus(result.status);
      setErrorMessages(result.errors);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    } catch (e) {
      console.error("Global fetch error", e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveFeed();
  }, [fetchLiveFeed]);

  const metrics = calculateFeedMetrics(feedStatus, CONFIG.liveFeeds.length);
  const colors = getStatusColors(metrics);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 font-sans ${CONFIG.selectionColor} selection:text-white`}>
      {/* Toast notifications */}
      <Toaster position="top-center" />

      {/* Email capture popup */}
      {showPopup && (
        <EmailCapturePopup onClose={handleClose} onSubmit={handleSubmit} />
      )}

      {/* Auth modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className={`${CONFIG.accentBg} p-2 rounded-lg border ${CONFIG.accentBorder}`}>
              <Activity className={`h-5 w-5 sm:h-6 sm:w-6 ${CONFIG.accentColor}`} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">{CONFIG.title}</h1>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                {CONFIG.subtitle}
                <span className="text-slate-600">|</span>
                STATUS: {isRefreshing ? <span className="text-yellow-400 animate-pulse">SYNCING...</span> : <span className="text-green-400">ONLINE</span>}
              </p>
            </div>
            {/* Compact mobile title */}
            <div className="sm:hidden">
              <h1 className="text-sm font-bold tracking-tight text-white">AMERICA FIRST</h1>
              <p className="text-[10px] text-slate-400 font-mono">
                {isRefreshing ? <span className="text-yellow-400">SYNCING</span> : <span className="text-green-400">ONLINE</span>}
              </p>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            <button onClick={() => setActiveTab('grid')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'grid' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Tv className="h-4 w-4 inline mr-2" />Live Streams
            </button>
            <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'feed' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Zap className="h-4 w-4 inline mr-2" />
              Patriot Wire
            </button>
            <button onClick={() => setActiveTab('bookmarks')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'bookmarks' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Bookmark className="h-4 w-4 inline mr-2" />Bookmarks
              {bookmarks.length > 0 && <span className="ml-1 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 rounded">{bookmarks.length}</span>}
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <History className="h-4 w-4 inline mr-2" />History
            </button>
            <button onClick={() => setActiveTab('synthesis')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'synthesis' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Cpu className="h-4 w-4 inline mr-2" />Synthesis
            </button>
            <button onClick={() => setActiveTab('media')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'media' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Play className="h-4 w-4 inline mr-2" />Media
            </button>
          </nav>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={fetchLiveFeed} disabled={isRefreshing} className={`flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-all ${isRefreshing ? 'opacity-70 cursor-wait' : ''}`}>
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
              {isRefreshing ? 'SYNCING...' : 'SYNC PATRIOT FEEDS'}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs border" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
              <span className="relative flex h-2 w-2">
                <span className={`${isRefreshing ? 'animate-spin' : 'animate-pulse'} absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: colors.indicator }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: colors.indicator }}></span>
              </span>
              FEEDS: {metrics.okCount}/{metrics.totalCount}
            </div>
            <UserMenu onSignInClick={() => setShowAuthModal(true)} />
          </div>

          {/* Mobile action buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={fetchLiveFeed} disabled={isRefreshing} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-800 border border-slate-700 rounded transition-all active:scale-95 ${isRefreshing ? 'opacity-70' : ''}`}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-red-400' : 'text-slate-300'}`} />
            </button>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs border" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
              <span className="relative flex h-2 w-2">
                <span className={`${isRefreshing ? 'animate-spin' : 'animate-pulse'} absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: colors.indicator }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: colors.indicator }}></span>
              </span>
              <span className="font-mono">{metrics.okCount}/{metrics.totalCount}</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-800 border border-slate-700 rounded transition-all active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-slate-300" /> : <Menu className="h-5 w-5 text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
            <nav className="flex flex-col p-2 gap-1">
              <button
                onClick={() => { setActiveTab('grid'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${activeTab === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Tv className="h-5 w-5" />
                Live Streams
              </button>
              <button
                onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${activeTab === 'feed' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Zap className="h-5 w-5" />
                Patriot Wire
              </button>
              <button
                onClick={() => { setActiveTab('bookmarks'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${activeTab === 'bookmarks' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Bookmark className="h-5 w-5" />
                Bookmarks
                {bookmarks.length > 0 && <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-1.5 rounded">{bookmarks.length}</span>}
              </button>
              <button
                onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${activeTab === 'history' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <History className="h-5 w-5" />
                History
              </button>
              <button
                onClick={() => { setActiveTab('synthesis'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${activeTab === 'synthesis' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Cpu className="h-5 w-5" />
                Synthesis
              </button>
              <button
                onClick={() => { setActiveTab('media'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${activeTab === 'media' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <Play className="h-5 w-5" />
                Media
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Premium Banner - shown on all tabs */}
        <PremiumBanner />

        {activeTab === 'grid' && <LiveStreamsView />}

        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main feed content */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
              <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Wifi className={`h-4 w-4 sm:h-5 sm:w-5 ${CONFIG.accentColor} animate-pulse`} />
                  <span className="hidden sm:inline">Patriot Wire Intercepts</span>
                  <span className="sm:hidden">Patriot Wire</span>
                  {lastUpdated && <span className="text-[10px] sm:text-xs font-mono font-normal text-slate-500 ml-1 sm:ml-2">(UPDATED: {lastUpdated})</span>}
                </h2>
                <span className="text-[10px] sm:text-xs text-slate-500 font-mono">
                  {resultCount} / {feed.length} articles
                </span>
              </div>

              {/* Search bar for filtering articles */}
              <SearchBar
                value={filters.query}
                onChange={(value) => updateFilter('query', value)}
                placeholder="Search articles..."
              />

              {/* Filter panel for advanced filtering */}
              <FilterPanel
                filters={filters}
                onFilterChange={updateFilter}
                onReset={resetFilters}
                presets={presets}
                onSavePreset={savePreset}
                onLoadPreset={loadPreset}
                onDeletePreset={deletePreset}
                resultCount={resultCount}
                totalCount={feed.length}
              />

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[300px] sm:min-h-[400px]">
                <FeedErrorAlert errorMessages={errorMessages} liveFeeds={CONFIG.liveFeeds} />

                {/* Loading skeleton */}
                {isRefreshing && feed.length === 0 && (
                  <FeedGridSkeleton count={6} />
                )}

                {/* Empty state */}
                {feed.length === 0 && !isRefreshing && (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-500">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-50" />
                    <p className="text-sm">No signals intercepted. Check connection.</p>
                  </div>
                )}

                {/* No results from search */}
                {feed.length > 0 && filteredFeed.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-slate-500">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 mb-2 opacity-50" />
                    <p className="text-sm">No articles match your search.</p>
                  </div>
                )}

                {/* Feed items with bookmark buttons */}
                {filteredFeed.map((item) => (
                  <FeedItemCard
                    key={item.id}
                    item={item}
                    isBookmarked={isBookmarked(item.id)}
                    hasRead={hasRead(item.id)}
                    onBookmark={(id: string) => addBookmark(id, item.title, item.url, item.source)}
                    onRemoveBookmark={removeBookmark}
                    onRead={addToHistory}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar - shows first on mobile for quick access to trending */}
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              {/* Trending Widget first on mobile */}
              <div className="lg:hidden">
                <TrendingWidget
                  trending={trending}
                  onTopicClick={(topic) => updateFilter('query', topic)}
                  maxItems={5}
                />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  {CONFIG.sidebarTitle}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {CONFIG.sidebarItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-400">{item}</span>
                      <span className="text-red-400 font-mono text-[10px] sm:text-xs">CRITICAL</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Widget for desktop */}
              <div className="hidden lg:block">
                <TrendingWidget
                  trending={trending}
                  onTopicClick={(topic) => updateFilter('query', topic)}
                  maxItems={8}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${CONFIG.accentColor}`} />
                <span>Saved Bookmarks</span>
                <span className="text-xs font-mono font-normal text-slate-500 ml-2">({bookmarks.length} items)</span>
              </h2>
              {bookmarks.length > 0 && (
                <button
                  onClick={clearAllBookmarks}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-800/50 rounded transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear All
                </button>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[300px]">
              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Bookmark className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No bookmarks yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Click the bookmark icon on any article to save it.</p>
                </div>
              ) : (
                bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="relative border-b border-slate-800">
                    <a
                      href={bookmark.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 sm:p-4 hover:bg-slate-800/80 transition-all group cursor-pointer pr-12 sm:pr-16"
                    >
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <span className="text-[10px] sm:text-xs font-mono text-yellow-400 bg-yellow-900/10 px-1.5 py-0.5 rounded">
                          BOOKMARKED
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-slate-500 flex-shrink-0">
                          {new Date(bookmark.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-slate-200 group-hover:text-red-400 transition-colors mb-2 pr-4 sm:pr-6 line-clamp-2">
                        {bookmark.articleTitle}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {bookmark.source}
                        </span>
                      </div>
                    </a>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="absolute top-3 sm:top-4 right-2 sm:right-4 p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg transition-all active:scale-95 text-red-400 hover:bg-red-900/20"
                      title="Remove bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <History className={`h-4 w-4 sm:h-5 sm:w-5 ${CONFIG.accentColor}`} />
                <span>Reading History</span>
                <span className="text-xs font-mono font-normal text-slate-500 ml-2">({history.length} items)</span>
              </h2>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-800/50 rounded transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear History
                </button>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[300px]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <History className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No reading history yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Articles you read will appear here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.articleId} className="relative border-b border-slate-800">
                    <a
                      href={item.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 sm:p-4 hover:bg-slate-800/80 transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <span className="text-[10px] sm:text-xs font-mono text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                          READ
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-slate-500 flex-shrink-0">
                          {new Date(item.readAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-slate-400 group-hover:text-red-400 transition-colors mb-2 line-clamp-2">
                        {item.articleTitle}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {item.source}
                        </span>
                      </div>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'synthesis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="lg:col-span-2 bg-green-900/10 border border-green-700/30 p-3 sm:p-4 rounded-lg mb-2 sm:mb-4 flex items-start sm:items-center gap-3">
              <Activity className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs sm:text-sm text-green-200">
                <strong>LIVE DATA:</strong> Charts below are computed from <em>actual feed data</em>. Topic distribution and volume are derived from {feed.length} articles.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 sm:mb-6">Article Volume Over Time</h3>
              <div className="h-48 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.length > 0 ? chartData : [{ name: 'No data', volume: 0, sentiment: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" fontSize={10} tick={{ fontSize: 10 }} width={30} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="volume" stroke="#ef4444" strokeWidth={2} dot={false} name="Volume" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 sm:mb-6">Topic Distribution (from feeds)</h3>
              <div className="h-48 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={narrativeData.length > 0 ? narrativeData : [{ topic: 'No data', value: 0 }]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={10} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="topic" type="category" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} cursor={{ fill: '#1e293b' }} />
                    <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} name="Articles %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Topic Heatmap - Source × Topic Matrix */}
            <div className="lg:col-span-2">
              <TopicHeatmap sourceMatrix={sourceMatrix} maxSources={8} />
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
