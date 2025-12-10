import { TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { TrendingTopic } from '../../types';

interface TrendingWidgetProps {
  trending: TrendingTopic[];
  onTopicClick?: (topic: string) => void;
  maxItems?: number;
}

/**
 * Widget showing trending topics with velocity indicators
 */
export function TrendingWidget({
  trending,
  onTopicClick,
  maxItems = 8,
}: TrendingWidgetProps) {
  const displayTopics = trending.slice(0, maxItems);

  const getVelocityIcon = (velocity: number) => {
    if (velocity > 2) return <ArrowUp className="h-3 w-3 text-green-400" />;
    if (velocity < 0.5) return <ArrowDown className="h-3 w-3 text-red-400" />;
    return <Minus className="h-3 w-3 text-slate-500" />;
  };

  const getVelocityColor = (velocity: number) => {
    if (velocity > 2) return 'text-green-400';
    if (velocity > 1) return 'text-yellow-400';
    if (velocity < 0.5) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-blue-500" />
        Trending Topics
      </h3>

      {displayTopics.length === 0 ? (
        <p className="text-xs text-slate-500">No trending data yet</p>
      ) : (
        <div className="space-y-2">
          {displayTopics.map((topic, index) => (
            <button
              key={topic.topic}
              onClick={() => onTopicClick?.(topic.topic)}
              className="w-full flex items-center justify-between p-2 rounded-lg
                         hover:bg-slate-800 active:bg-slate-700 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-slate-500 w-4">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-300 truncate group-hover:text-white">
                  {topic.topic}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500">
                  {topic.count} articles
                </span>
                <div className="flex items-center gap-1">
                  {getVelocityIcon(topic.velocity)}
                  <span className={`text-xs font-mono ${getVelocityColor(topic.velocity)}`}>
                    {topic.velocity.toFixed(1)}x
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {trending.length > maxItems && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          +{trending.length - maxItems} more topics
        </p>
      )}
    </div>
  );
}

export default TrendingWidget;
