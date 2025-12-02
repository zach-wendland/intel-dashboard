// Right-Wing Dashboard (refactored from original App.tsx)
import { useState, useEffect } from 'react';
import {
  Activity,
  Globe,
  Radio,
  BookOpen,
  ShieldAlert,
  Server,
  Database,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Zap,
  ExternalLink,
  RefreshCw,
  Wifi,
  LogOut
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
import {
  RIGHT_LIVE_FEEDS,
  RIGHT_SOURCE_CATEGORIES,
  RIGHT_SOURCES,
  RIGHT_CHART_DATA,
  RIGHT_NARRATIVE_DATA
} from '../config/rightWingSources';
import { isValidUrl, parseDate } from '../utils/security';
import { useAuth } from '../contexts/AuthContext';

// TypeScript Interfaces
interface FeedItem {
  id: string;
  title: string;
  source: string;
  topic: string;
  time: string;
  rawDate: Date;
  url: string;
  velocity: number;
  category: string;
}

interface RSSItem {
  title?: string;
  pubDate?: string;
  link?: string;
  description?: string;
  content?: string;
}

interface RSSResponse {
  status: 'ok' | 'error';
  message?: string;
  items?: RSSItem[];
}

type FeedStatus = 'ok' | 'error' | 'loading';

// Icon mapping
const ICON_MAP: Record<string, any> = {
  BookOpen,
  Radio,
  Zap,
  Globe,
  ShieldAlert,
  Server
};

// Helper Functions
function calculateFeedMetrics(feedStatus: Record<string | number, FeedStatus>) {
  const okCount = Object.values(feedStatus).filter(s => s === 'ok').length;
  const totalCount = RIGHT_LIVE_FEEDS.length;

  return {
    okCount,
    totalCount,
    allHealthy: okCount === totalCount,
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

function FeedErrorAlert({ errorMessages }: { errorMessages: Record<string | number, string> }) {
  if (Object.keys(errorMessages).length === 0) return null;

  return (
    <div className="bg-red-900/20 border-b border-red-800/50 p-4 text-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-semibold mb-2">Feed Errors:</p>
          <ul className="text-red-200 space-y-1 text-xs">
            {Object.entries(errorMessages).map(([feedId, error]) => {
              const feed = RIGHT_LIVE_FEEDS.find(f => f.id === feedId);
              return (
                <li key={feedId}>
                  <span className="text-red-300">{feed?.name}:</span> {error}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface RightWingDashboardProps {
  onSwitchPerspective: () => void;
}

export default function RightWingDashboard({ onSwitchPerspective }: RightWingDashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [feedStatus, setFeedStatus] = useState<Record<string | number, FeedStatus>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string | number, string>>({});

  const fetchLiveFeed = async () => {
    setIsRefreshing(true);
    setErrorMessages({});
    const newStatus: Record<string | number, FeedStatus> = {};
    const errors: Record<string | number, string> = {};
    let allItems: FeedItem[] = [];

    const promises = RIGHT_LIVE_FEEDS.map(async (source) => {
      newStatus[source.id] = 'loading';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
        const response = await fetch(apiUrl, { signal: controller.signal });

        if (!response.ok) {
          newStatus[source.id] = 'error';
          errors[source.id] = `HTTP ${response.status}`;
          return [];
        }

        const data: RSSResponse = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
          newStatus[source.id] = 'ok';

          const validItems = data.items
            .filter(item => item.title && item.link && item.pubDate)
            .map((item: RSSItem, index: number) => {
              const pubDate = parseDate(item.pubDate);

              if (!pubDate || !isValidUrl(item.link || '')) {
                return null;
              }

              return {
                id: `${source.id}-${index}`,
                title: item.title || 'Untitled',
                source: source.name,
                topic: source.topic_map || 'General',
                time: pubDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                rawDate: pubDate,
                url: item.link,
                velocity: Math.floor(Math.random() * (100 - 40) + 40),
                category: source.category
              };
            })
            .filter((item): item is FeedItem => item !== null);

          return validItems;
        } else {
          newStatus[source.id] = 'error';
          errors[source.id] = data.message || 'No items returned';
          return [];
        }
      } catch (error) {
        newStatus[source.id] = 'error';
        if (error instanceof DOMException && error.name === 'AbortError') {
          errors[source.id] = 'Request timeout (10s)';
        } else {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors[source.id] = errorMsg.substring(0, 50);
        }
        return [];
      } finally {
        clearTimeout(timeoutId);
      }
    });

    try {
      const results = await Promise.all(promises);
      allItems = results.flat();
      allItems.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

      setFeed(allItems);
      setFeedStatus(newStatus);
      if (Object.keys(errors).length > 0) {
        setErrorMessages(errors);
      }
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    } catch (e) {
      console.error("Global fetch error", e);
      setFeedStatus(newStatus);
      setErrorMessages(errors);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();
  }, []);

  const filteredSources = filter === 'ALL' ? RIGHT_SOURCES : RIGHT_SOURCES.filter(s => s.category === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-900 selection:text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600/20 p-2 rounded-lg border border-red-500/30">
              <Activity className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">RIGHT-WING INTELLIGENCE GRID</h1>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                PERSPECTIVE: CONSERVATIVE
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
              <Zap className="h-4 w-4 inline mr-2" />Live Wire
            </button>
            <button onClick={() => setActiveTab('synthesis')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'synthesis' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Cpu className="h-4 w-4 inline mr-2" />Synthesis
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={onSwitchPerspective} className="text-xs px-3 py-1.5 bg-blue-900/30 border border-blue-700/50 text-blue-300 rounded hover:bg-blue-900/50 transition-all">
              Switch to Left-Wing
            </button>
            <button onClick={fetchLiveFeed} disabled={isRefreshing} className={`flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-all ${isRefreshing ? 'opacity-70 cursor-wait' : ''}`}>
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              {isRefreshing ? 'SYNCING...' : 'REFRESH INTEL'}
            </button>
            {(() => {
              const metrics = calculateFeedMetrics(feedStatus);
              const colors = getStatusColors(metrics);
              return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs border" style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
                  <span className="relative flex h-2 w-2">
                    <span className={`${isRefreshing ? 'animate-spin' : 'animate-pulse'} absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: colors.indicator }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: colors.indicator }}></span>
                  </span>
                  FEEDS: {metrics.okCount}/{metrics.totalCount}
                </div>
              );
            })()}
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
              {Object.entries(RIGHT_SOURCE_CATEGORIES).map(([key, config]) => {
                const IconComponent = ICON_MAP[config.icon];
                return (
                  <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border flex items-center gap-2 ${filter === key ? 'bg-slate-800 border-slate-600 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                    <IconComponent className={`h-3 w-3 ${config.color}`} />
                    {config.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSources.map((source) => {
                const categoryConfig = RIGHT_SOURCE_CATEGORIES[source.category];
                const CategoryIcon = ICON_MAP[categoryConfig.icon];

                return (
                  <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" className="group bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-500 transition-all hover:shadow-lg hover:shadow-slate-900/50 hover:-translate-y-1 block relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded bg-slate-950 border border-slate-800 ${categoryConfig.color}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${source.tier === 'High' ? 'bg-red-900/20 text-red-400 border-red-900/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-red-500 animate-pulse" />
                  Live Wire Intercepts
                  {lastUpdated && <span className="text-xs font-mono font-normal text-slate-500 ml-2">(UPDATED: {lastUpdated})</span>}
                </h2>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
                <FeedErrorAlert errorMessages={errorMessages} />
                {feed.length === 0 && !isRefreshing && (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                    <p>No signals intercepted. Check connection.</p>
                  </div>
                )}

                {feed.map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block p-4 border-b border-slate-800 hover:bg-slate-800/80 transition-all group cursor-pointer relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-blue-400 bg-blue-900/10 px-1.5 py-0.5 rounded">{item.topic.toUpperCase()}</span>
                      <span className="text-xs font-mono text-slate-500">{item.time}</span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors mb-2 pr-6 line-clamp-2">{item.title}</h3>
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
                          <div className="h-full bg-gradient-to-r from-blue-500 to-red-500" style={{ width: `${item.velocity}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Threat Vectors (Simulated)
                </h3>
                <div className="space-y-3">
                  {['Censorship/De-platforming', 'Foreign Aid Bills', 'Cultural Subversion', 'Surveillance State'].map((threat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{threat}</span>
                      <span className="text-red-400 font-mono">CRITICAL</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Top Entities Tracked
                </h3>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {['AIPAC', 'ADL', 'WEF', 'Neocons', 'Open Borders', 'USS Liberty', 'Section 230'].map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:border-slate-500 cursor-pointer hover:bg-slate-700 transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'synthesis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2 bg-yellow-900/10 border border-yellow-700/30 p-4 rounded-lg mb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-yellow-200">
                <strong>NOTE:</strong> While the <em>Live Wire</em> is pulling real data, the Analysis Layer below is currently <strong>SIMULATED</strong>.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Narrative Sentiment Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={RIGHT_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} itemStyle={{ color: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="sentiment" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Topic Dominance (Last 24h)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={RIGHT_NARRATIVE_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="topic" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} cursor={{ fill: '#1e293b' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
