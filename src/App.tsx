import { useState, useEffect } from 'react'; // Removed unused 'React' import
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
  Wifi
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

// --- TYPESCRIPT INTERFACES ---
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

interface SourceItem {
  id: number | string;
  name: string;
  category: string;
  tier?: string;
  focus?: string;
  url: string;
  topic_map?: string;
}

// --- CONFIGURATION: Live RSS Endpoints ---
// Only includes feeds that are currently accessible via rss2json.com proxy
const LIVE_FEEDS: SourceItem[] = [
  {
    id: 'breitbart',
    name: 'Breitbart News',
    url: 'http://feeds.feedburner.com/breitbart',
    category: 'BROADCAST',
    topic_map: 'Culture War'
  },
  {
    id: 'antiwar',
    name: 'Antiwar.com',
    url: 'https://www.antiwar.com/blog/feed/',
    category: 'LIBERTARIANS',
    topic_map: 'Foreign Policy'
  },
  {
    id: 'zerohedge',
    name: 'ZeroHedge',
    url: 'http://feeds.feedburner.com/zerohedge/feed',
    category: 'BROADCAST',
    topic_map: 'Finance'
  },
  {
    id: 'canon',
    name: 'Canon Press (Blog)',
    url: 'https://dougwils.com/feed',
    category: 'THEOLOGIANS',
    topic_map: 'Religion'
  }
];

const SOURCE_CATEGORIES: Record<string, { label: string; icon: any; color: string }> = {
  INTELLECTUALS: { label: "Paleoconservative Vanguard", icon: BookOpen, color: "text-blue-400" },
  BROADCAST: { label: "MAGA Broadcast Network", icon: Radio, color: "text-red-400" },
  RADICALS: { label: "Dissident Right / Groypers", icon: Zap, color: "text-yellow-400" },
  LIBERTARIANS: { label: "Libertarian / Anti-War", icon: Globe, color: "text-green-400" },
  THEOLOGIANS: { label: "Theological Dissent", icon: ShieldAlert, color: "text-purple-400" },
  INFRASTRUCTURE: { label: "Digital Infrastructure", icon: Server, color: "text-gray-400" }
};

const SOURCES: SourceItem[] = [
  // 2. Paleoconservative Vanguard
  { id: 1, name: "The American Conservative", category: "INTELLECTUALS", tier: "High", focus: "Realism/Policy", url: "https://www.theamericanconservative.com" },
  { id: 2, name: "Chronicles Magazine", category: "INTELLECTUALS", tier: "High", focus: "Culture/Old Right", url: "https://chroniclesmagazine.org" },
  { id: 3, name: "The Unz Review", category: "INTELLECTUALS", tier: "Medium", focus: "Revisionism/Aggregation", url: "https://www.unz.com" },
  { id: 4, name: "VDARE", category: "INTELLECTUALS", tier: "Medium", focus: "Immigration/Demographics", url: "https://vdare.com" },
  { id: 5, name: "Taki's Magazine", category: "INTELLECTUALS", tier: "Medium", focus: "Cultural Critique", url: "https://www.takimag.com" },
  { id: 6, name: "The Occidental Observer", category: "INTELLECTUALS", tier: "Low", focus: "Group Strategy", url: "https://www.theoccidentalobserver.net" },
  { id: 7, name: "Counter-Currents", category: "INTELLECTUALS", tier: "Low", focus: "Ethnonationalism", url: "https://counter-currents.com" },
  { id: 8, name: "American Renaissance", category: "INTELLECTUALS", tier: "Medium", focus: "Race Realism", url: "https://www.amren.com" },
  { id: 9, name: "Modern Age (ISI)", category: "INTELLECTUALS", tier: "High", focus: "Academic Tradition", url: "https://home.isi.org/modern-age" },
  { id: 10, name: "Fleming Foundation", category: "INTELLECTUALS", tier: "Low", focus: "Regionalism", url: "https://fleming.foundation" },
  { id: 11, name: "Revolver News", category: "INTELLECTUALS", tier: "High", focus: "National Security/Deep State", url: "https://www.revolver.news" },
  { id: 12, name: "Big League Politics", category: "INTELLECTUALS", tier: "Medium", focus: "Muckraking", url: "https://bigleaguepolitics.com" },
  { id: 13, name: "American Greatness", category: "INTELLECTUALS", tier: "High", focus: "Nationalism", url: "https://amgreatness.com" },
  { id: 14, name: "National Justice Party", category: "INTELLECTUALS", tier: "Low", focus: "Hardline Politics", url: "https://nationaljusticeparty.com" },
  { id: 15, name: "The Right Stuff (TRS)", category: "INTELLECTUALS", tier: "Low", focus: "Cultural Satire", url: "https://therightstuff.biz" },
  { id: 16, name: "Red Ice TV", category: "INTELLECTUALS", tier: "Low", focus: "Demographics", url: "https://redice.tv" },

  // 3. MAGA Broadcast Network
  { id: 17, name: "Tucker Carlson Network", category: "BROADCAST", tier: "High", focus: "Mass Media/Narrative", url: "https://tuckercarlson.com" },
  { id: 18, name: "War Room (Bannon)", category: "BROADCAST", tier: "High", focus: "Grassroots Action", url: "https://warroom.org" },
  { id: 19, name: "Candace Owens", category: "BROADCAST", tier: "High", focus: "Cultural/Religious", url: "https://candaceowens.com" },
  { id: 20, name: "Jack Posobiec", category: "BROADCAST", tier: "High", focus: "Info Warfare", url: "https://humanevents.com/author/jack-posobiec" },
  { id: 21, name: "Stew Peters", category: "BROADCAST", tier: "Medium", focus: "Conspiracy/Shock", url: "https://stewpeters.com" },
  { id: 22, name: "Infowars", category: "BROADCAST", tier: "High", focus: "Globalism/Conspiracy", url: "https://www.infowars.com" },
  { id: 23, name: "ZeroHedge", category: "BROADCAST", tier: "High", focus: "Finance/Geopolitics", url: "https://www.zerohedge.com" },
  { id: 24, name: "Valuetainment", category: "BROADCAST", tier: "High", focus: "Debate/Business", url: "https://www.valuetainment.com" },
  { id: 25, name: "Judge Napolitano", category: "BROADCAST", tier: "Medium", focus: "Legal/Anti-War", url: "https://www.judgenap.com" },

  // 4. Dissident Right / Groypers
  { id: 26, name: "Nick Fuentes / AF", category: "RADICALS", tier: "Medium", focus: "Youth/Entryism", url: "https://americafirst.live" },
  { id: 27, name: "Keith Woods", category: "RADICALS", tier: "Medium", focus: "Theory/History", url: "https://keithwoods.pub" },
  { id: 28, name: "Jake Shields", category: "RADICALS", tier: "Medium", focus: "Confrontation", url: "https://x.com/jakeshieldsajj" },
  { id: 29, name: "Sneako", category: "RADICALS", tier: "High", focus: "Gen Z/Red Pill", url: "https://rumble.com/c/SNEAKO" },
  { id: 30, name: "Lucas Gage", category: "RADICALS", tier: "Medium", focus: "Shock Commentary", url: "https://x.com/Lucas_Gage_" },
  { id: 31, name: "Jackson Hinkle", category: "RADICALS", tier: "High", focus: "MAGA Communism", url: "https://x.com/jacksonhinkle" },
  { id: 32, name: "Dan Bilzerian", category: "RADICALS", tier: "High", focus: "Normie Outreach", url: "https://x.com/DanBilzerian" },
  { id: 33, name: "Auron MacIntyre", category: "RADICALS", tier: "Medium", focus: "Political Theory", url: "https://auronmacintyre.substack.com" },
  { id: 34, name: "Cozy.tv Collective", category: "RADICALS", tier: "Medium", focus: "Streaming", url: "https://cozy.tv" },
  { id: 35, name: "Bronze Age Pervert", category: "RADICALS", tier: "Medium", focus: "Vitalism/Aesthetics", url: "https://twitter.com/bronzeageperv" },

  // 5. Libertarian / Anti-War
  { id: 36, name: "Scott Horton", category: "LIBERTARIANS", tier: "Medium", focus: "History/Foreign Policy", url: "https://scotthorton.org" },
  { id: 37, name: "Antiwar.com", category: "LIBERTARIANS", tier: "Medium", focus: "News Aggregation", url: "https://www.antiwar.com" },
  { id: 38, name: "Glenn Greenwald", category: "LIBERTARIANS", tier: "High", focus: "Civil Liberties", url: "https://greenwald.substack.com" },
  { id: 39, name: "Michael Tracey", category: "LIBERTARIANS", tier: "Medium", focus: "Journalism", url: "https://mtracey.substack.com" },
  { id: 40, name: "Dave Smith", category: "LIBERTARIANS", tier: "Medium", focus: "Libertarian Party", url: "https://partoftheproblem.com" },
  { id: 41, name: "Ron Paul Institute", category: "LIBERTARIANS", tier: "Medium", focus: "Non-Intervention", url: "http://ronpaulinstitute.org" },
  { id: 42, name: "LewRockwell.com", category: "LIBERTARIANS", tier: "Medium", focus: "Paleolibertarianism", url: "https://www.lewrockwell.com" },
  { id: 43, name: "The Grayzone", category: "LIBERTARIANS", tier: "Medium", focus: "Anti-Imperialism", url: "https://thegrayzone.com" },

  // 6. Theological Dissent
  { id: 44, name: "Canon Press", category: "THEOLOGIANS", tier: "Medium", focus: "Reformed Theology", url: "https://canonpress.com" },
  { id: 45, name: "CrossPolitic", category: "THEOLOGIANS", tier: "Medium", focus: "Christian Nationalism", url: "https://crosspolitic.com" },
  { id: 46, name: "Gab / Andrew Torba", category: "THEOLOGIANS", tier: "High", focus: "Parallel Economy", url: "https://gab.com" },
  { id: 47, name: "TruNews", category: "THEOLOGIANS", tier: "Low", focus: "Fundamentalism", url: "https://www.trunews.com" },
  { id: 48, name: "Church Militant", category: "THEOLOGIANS", tier: "Medium", focus: "Catholic Integralism", url: "https://www.churchmilitant.com" },

  // 7. Digital Infrastructure
  { id: 49, name: "X (Twitter)", category: "INFRASTRUCTURE", tier: "High", focus: "Public Square", url: "https://x.com" },
  { id: 50, name: "Rumble", category: "INFRASTRUCTURE", tier: "High", focus: "Video Hosting", url: "https://rumble.com" },
  { id: 51, name: "Substack", category: "INFRASTRUCTURE", tier: "High", focus: "Publishing", url: "https://substack.com" },
  { id: 52, name: "Odysee", category: "INFRASTRUCTURE", tier: "Medium", focus: "Decentralized Video", url: "https://odysee.com" },
  { id: 53, name: "Telegram", category: "INFRASTRUCTURE", tier: "High", focus: "Messaging/Coordination", url: "https://telegram.org" },
  { id: 54, name: "Truth Social", category: "INFRASTRUCTURE", tier: "High", focus: "MAGA Base", url: "https://truthsocial.com" },
  { id: 55, name: "Breitbart Community", category: "INFRASTRUCTURE", tier: "High", focus: "Comment Section", url: "https://www.breitbart.com" },
];

const CHART_DATA = [
  { name: '08:00', sentiment: 45, volume: 120 },
  { name: '10:00', sentiment: 30, volume: 200 },
  { name: '12:00', sentiment: 20, volume: 450 },
  { name: '14:00', sentiment: 25, volume: 380 },
  { name: '16:00', sentiment: 15, volume: 500 },
  { name: '18:00', sentiment: 35, volume: 300 },
];

const NARRATIVE_DATA = [
  { topic: "Isolationism", value: 85 },
  { topic: "Anti-Zionism", value: 78 },
  { topic: "Deep State", value: 65 },
  { topic: "Censorship", value: 92 },
  { topic: "Economy", value: 55 },
];

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<string>('feed');
  // FIX: We now explicitly define the state type as an array of FeedItem objects
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Live RSS Fetcher
  const fetchLiveFeed = async () => {
    setIsRefreshing(true);
    let allItems: FeedItem[] = [];

    // We fetch multiple feeds in parallel
    const promises = LIVE_FEEDS.map(async (source) => {
      try {
        // Using rss2json proxy to avoid CORS issues in client-side React
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
          // FIX: Explicitly typing the map parameters to avoid implicit 'any' error
          return data.items.map((item: any, index: number) => ({
            id: `${source.id}-${index}`,
            title: item.title,
            source: source.name,
            topic: source.topic_map || 'General',
            time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawDate: new Date(item.pubDate),
            url: item.link,
            velocity: Math.floor(Math.random() * (100 - 40) + 40), // Simulated velocity for now
            category: source.category
          }));
        }
        return [];
      } catch (error) {
        console.error(`Failed to fetch ${source.name}`, error);
        return [];
      }
    });

    try {
      const results = await Promise.all(promises);
      allItems = results.flat();
      
      // Sort by newest first
      allItems.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      
      setFeed(allItems);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Global fetch error", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchLiveFeed();
  }, []);

  const filteredSources = filter === 'ALL' 
    ? SOURCES 
    : SOURCES.filter(s => s.category === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-900 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600/20 p-2 rounded-lg border border-red-500/30">
              <Activity className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">GLOBAL INTELLIGENCE GRID</h1>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                NODE: AMERICA_FIRST 
                <span className="text-slate-600">|</span> 
                STATUS: {isRefreshing ? <span className="text-yellow-400 animate-pulse">SYNCING...</span> : <span className="text-green-400">ONLINE</span>}
              </p>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('grid')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'grid' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Database className="h-4 w-4 inline mr-2" />
              Intel Grid
            </button>
            <button 
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'feed' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Live Wire
            </button>
            <button 
              onClick={() => setActiveTab('synthesis')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'synthesis' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <Cpu className="h-4 w-4 inline mr-2" />
              Synthesis
            </button>
          </nav>

          <div className="flex items-center gap-4">
             <button 
               onClick={fetchLiveFeed}
               disabled={isRefreshing}
               className={`flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-all ${isRefreshing ? 'opacity-70 cursor-wait' : ''}`}
             >
               <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
               {isRefreshing ? 'SYNCING...' : 'REFRESH INTEL'}
             </button>

             <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-500/30 rounded text-xs text-green-400">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                AGENTS ACTIVE: 55
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* VIEW: INTEL GRID */}
        {activeTab === 'grid' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
              <button 
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border ${filter === 'ALL' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                All Sources
              </button>
              {Object.entries(SOURCE_CATEGORIES).map(([key, config]) => (
                <button 
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider border flex items-center gap-2 ${filter === key ? 'bg-slate-800 border-slate-600 text-white' : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'}`}
                >
                  <config.icon className={`h-3 w-3 ${config.color}`} />
                  {config.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSources.map((source) => {
                const CategoryIcon = SOURCE_CATEGORIES[source.category as keyof typeof SOURCE_CATEGORIES].icon;
                const categoryColor = SOURCE_CATEGORIES[source.category as keyof typeof SOURCE_CATEGORIES].color;
                
                return (
                  <a 
                    key={source.id} 
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-500 transition-all hover:shadow-lg hover:shadow-slate-900/50 hover:-translate-y-1 block relative"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded bg-slate-950 border border-slate-800 ${categoryColor}`}>
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

        {/* VIEW: LIVE WIRE */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-red-500 animate-pulse" />
                  Live Wire Intercepts
                  {lastUpdated && <span className="text-xs font-mono font-normal text-slate-500 ml-2">(UPDATED: {lastUpdated})</span>}
                </h2>
                
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[400px]">
                {feed.length === 0 && !isRefreshing && (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                     <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                     <p>No signals intercepted. Check connection.</p>
                   </div>
                )}
                
                {feed.map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border-b border-slate-800 hover:bg-slate-800/80 transition-all group cursor-pointer relative"
                  >
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
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-red-500" 
                            style={{ width: `${item.velocity}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Sidebar Monitoring */}
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

        {/* VIEW: SYNTHESIS */}
        {activeTab === 'synthesis' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="lg:col-span-2 bg-yellow-900/10 border border-yellow-700/30 p-4 rounded-lg mb-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <p className="text-sm text-yellow-200">
                  <strong>NOTE:</strong> While the <em>Live Wire</em> is pulling real data, the Analysis Layer below is currently <strong>SIMULATED</strong>. Real-time narrative synthesis requires a backend NLP engine (e.g., Python/LangChain) which cannot run in this browser-only demo.
                </p>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-6">Narrative Sentiment Over Time</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="sentiment" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-slate-400">Mention Volume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-slate-400">Critical Sentiment</span>
                  </div>
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-6">Topic Dominance (Last 24h)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={NARRATIVE_DATA} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="topic" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                        cursor={{fill: '#1e293b'}}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
               <h3 className="text-lg font-semibold text-slate-200 mb-4">Synthesis & Analysis</h3>
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm leading-relaxed text-slate-400">
                 <p className="mb-4">
                   <span className="text-blue-400 font-bold">&gt;&gt; SYSTEM ALERT:</span> Significant divergence detected between "Broadcast" and "Intellectual" nodes.
                 </p>
                 <p className="mb-4">
                   <span className="text-green-400 font-bold">&gt;&gt; PATTERN RECOGNITION:</span> While Intellectual sources (TAC, Chronicles) are focusing on the fiscal implications of foreign aid bills, the Radical/Broadcast sector (Fuentes, Candace Owens) has shifted narrative focus to "Theological" arguments ("Christ is King" trending).
                 </p>
                 <p>
                   <span className="text-red-400 font-bold">&gt;&gt; PREDICTION:</span> Expect consolidation of the "Anti-Interventionist" and "Christian Nationalist" narratives within 48 hours. Monitoring keywords: "AIPAC", "Entangling Alliances", "Foreign Agents".
                 </p>
               </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}