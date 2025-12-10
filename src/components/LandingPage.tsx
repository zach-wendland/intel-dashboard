import { useState } from 'react';
import { Activity, ArrowRight, Shield, Users, TrendingUp, BookOpen, DollarSign, Database, UserCheck } from 'lucide-react';

interface LandingPageProps {
  onSelectPerspective: (perspective: 'right' | 'left') => void;
  onOpenPoliticalTracker?: () => void;
}

export default function LandingPage({ onSelectPerspective, onOpenPoliticalTracker }: LandingPageProps) {
  const [hoveredCard, setHoveredCard] = useState<'right' | 'left' | 'political' | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">INTELLIGENCE DASHBOARD</h1>
              <p className="text-xs text-slate-400 font-mono">Multi-Perspective News Aggregator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Perspective</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Access curated news feeds from different political perspectives.
            Stay informed with transparency about your sources.
          </p>
        </div>

        {/* Perspective Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Right-Wing Card */}
          <div
            onMouseEnter={() => setHoveredCard('right')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative bg-gradient-to-br from-red-900/20 to-slate-900 border-2 rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
              hoveredCard === 'right'
                ? 'border-red-500 shadow-2xl shadow-red-500/20 scale-105'
                : 'border-red-800/50 hover:border-red-700'
            }`}
            onClick={() => onSelectPerspective('right')}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="bg-red-600/20 p-3 rounded-xl border border-red-500/30">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-red-900/30 text-red-400 border border-red-800/50 rounded-full">
                CONSERVATIVE
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">Right-Wing Perspective</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              News aggregated from conservative, paleoconservative, libertarian, and nationalist sources.
              Focuses on traditional values, national sovereignty, and limited government.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <BookOpen className="h-4 w-4 text-red-400" />
                <span>55+ Conservative Sources</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Users className="h-4 w-4 text-red-400" />
                <span>6 Category Networks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <TrendingUp className="h-4 w-4 text-red-400" />
                <span>Real-time RSS Feeds</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all">
              Enter Dashboard
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Left-Wing Card */}
          <div
            onMouseEnter={() => setHoveredCard('left')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative bg-gradient-to-br from-blue-900/20 to-slate-900 border-2 rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
              hoveredCard === 'left'
                ? 'border-blue-500 shadow-2xl shadow-blue-500/20 scale-105'
                : 'border-blue-800/50 hover:border-blue-700'
            }`}
            onClick={() => onSelectPerspective('left')}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="bg-blue-600/20 p-3 rounded-xl border border-blue-500/30">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full">
                PROGRESSIVE
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">Left-Wing Perspective</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              News aggregated from progressive, liberal, socialist, and social justice sources.
              Focuses on equality, workers' rights, environmental protection, and social reform.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>50+ Progressive Sources</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Users className="h-4 w-4 text-blue-400" />
                <span>6 Category Networks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span>Real-time RSS Feeds</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all">
              Enter Dashboard
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Political Donor Tracker Card */}
        {onOpenPoliticalTracker && (
          <div className="max-w-5xl mx-auto mb-12">
            <div
              onMouseEnter={() => setHoveredCard('political')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`relative bg-gradient-to-br from-emerald-900/20 to-slate-900 border-2 rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
                hoveredCard === 'political'
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02]'
                  : 'border-emerald-800/50 hover:border-emerald-700'
              }`}
              onClick={onOpenPoliticalTracker}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-emerald-600/20 p-3 rounded-xl border border-emerald-500/30">
                      <DollarSign className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-white">Political Donor Tracker</h3>
                        <span className="text-xs font-mono px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-full">
                          NEW
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Track campaign contributions, PAC expenditures, and lobbyist disclosures.
                        Comprehensive data from FEC, OpenSecrets, and state-level portals.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <span>55+ Data Sources</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      <span>Donor Profiles</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <span>Lobbyist Disclosures</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span>Live RSS Feeds</span>
                    </div>
                  </div>
                </div>

                <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all whitespace-nowrap">
                  Open Tracker
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Why Multi-Perspective News?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-green-600/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <h4 className="font-semibold text-white mb-2">Transparent Sources</h4>
                <p className="text-sm text-slate-400">Know exactly where your news comes from</p>
              </div>
              <div>
                <div className="bg-purple-600/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <h4 className="font-semibold text-white mb-2">Break Echo Chambers</h4>
                <p className="text-sm text-slate-400">Understand different viewpoints</p>
              </div>
              <div>
                <div className="bg-orange-600/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-500/30">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="font-semibold text-white mb-2">Real-Time Updates</h4>
                <p className="text-sm text-slate-400">Live RSS feeds from all sources</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>Intelligence Dashboard - Multi-Perspective News Aggregator</p>
          <p className="mt-2">All sources are clearly labeled. This platform does not endorse any political perspective.</p>
        </div>
      </footer>
    </div>
  );
}
