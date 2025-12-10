import { useState, useEffect, useMemo } from 'react';
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
 */
export function useTrending(feed: FeedItem[]): UseTrendingReturn {
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyAggregate[]>([]);
  const [sourceMatrix, setSourceMatrix] = useState<SourceTopicMatrix>({});

  // Recompute analytics when feed changes
  useEffect(() => {
    if (feed.length === 0) {
      setTrending([]);
      setHourlyData([]);
      setSourceMatrix({});
      return;
    }

    // Compute all analytics
    const newTrending = computeTrendingTopics(feed);
    const newHourlyData = computeHourlyAggregates(feed);
    const newSourceMatrix = computeSourceTopicMatrix(feed);

    setTrending(newTrending);
    setHourlyData(newHourlyData);
    setSourceMatrix(newSourceMatrix);
  }, [feed]);

  // Memoized chart data
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
