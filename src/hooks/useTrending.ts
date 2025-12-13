import { useMemo } from 'react';
import type { FeedItem, TrendingTopic, HourlyAggregate, SourceTopicMatrix } from '../types';
import {
  computeTrendingTopics,
  computeHourlyAggregates,
  computeSourceTopicMatrix,
  getChartData,
  getNarrativeData,
} from '../utils/analytics';

interface UseTrendingReturn {
  trending: TrendingTopic[];
  hourlyData: HourlyAggregate[];
  sourceMatrix: SourceTopicMatrix;
  chartData: Array<{ name: string; volume: number; sentiment: number }>;
  narrativeData: Array<{ topic: string; value: number }>;
  topTopics: string[];
}

/**
 * Hook for computing trending analytics from feed data
 * Uses memoization instead of effects to avoid cascading renders
 */
export function useTrending(feed: FeedItem[]): UseTrendingReturn {
  // Compute all analytics using useMemo - no effects needed
  const trending = useMemo(() => {
    if (feed.length === 0) return [];
    return computeTrendingTopics(feed);
  }, [feed]);

  const hourlyData = useMemo(() => {
    if (feed.length === 0) return [];
    return computeHourlyAggregates(feed);
  }, [feed]);

  const sourceMatrix = useMemo(() => {
    if (feed.length === 0) return {};
    return computeSourceTopicMatrix(feed);
  }, [feed]);

  // Derived data
  const chartData = useMemo(() => getChartData(hourlyData), [hourlyData]);
  const narrativeData = useMemo(() => getNarrativeData(trending, 5), [trending]);
  const topTopics = useMemo(() => trending.slice(0, 10).map(t => t.topic), [trending]);

  return {
    trending,
    hourlyData,
    sourceMatrix,
    chartData,
    narrativeData,
    topTopics,
  };
}

export default useTrending;
