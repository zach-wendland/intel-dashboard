// Centralized feed fetching service with caching and error handling

import { feedCache } from './feedCache';
import { isValidUrl, parseDate } from '../utils/security';
import { calculateFreshnessScore } from '../utils/analytics';

export interface SourceItem {
  id: number | string;
  name: string;
  category: string;
  tier?: string;
  focus?: string;
  url: string;
  topic_map?: string;
}

export interface FeedItem {
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

export type FeedStatus = 'ok' | 'error' | 'loading';

export interface FeedResult {
  items: FeedItem[];
  status: Record<string | number, FeedStatus>;
  errors: Record<string | number, string>;
}

export class FeedService {
  private static instance: FeedService;
  private requestCache: Map<string, Promise<FeedItem[]>> = new Map();

  private constructor() {}

  static getInstance(): FeedService {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService();
    }
    return FeedService.instance;
  }

  /**
   * Fetch feeds from multiple sources with caching
   */
  async fetchFeeds(sources: SourceItem[]): Promise<FeedResult> {
    const cacheKey = `feeds_${sources.map(s => s.id).join('_')}`;

    // Check cache first
    const cached = feedCache.get<FeedResult>(cacheKey);
    if (cached) {
      console.log('Serving from cache:', cacheKey);
      return cached;
    }

    const newStatus: Record<string | number, FeedStatus> = {};
    const errors: Record<string | number, string> = {};

    // Fetch all feeds in parallel
    const promises = sources.map(source => this.fetchSingleFeed(source, newStatus, errors));
    const results = await Promise.all(promises);

    // Flatten and sort
    const allItems = results.flat();
    allItems.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

    const result: FeedResult = {
      items: allItems,
      status: newStatus,
      errors
    };

    // Cache the result
    feedCache.set(cacheKey, result, 15); // 15 minutes

    return result;
  }

  /**
   * Fetch a single feed source
   */
  private async fetchSingleFeed(
    source: SourceItem,
    statusMap: Record<string | number, FeedStatus>,
    errorMap: Record<string | number, string>
  ): Promise<FeedItem[]> {
    const cacheKey = `feed_${source.id}`;

    // Check cache for individual feed
    const cached = feedCache.get<FeedItem[]>(cacheKey);
    if (cached) {
      statusMap[source.id] = 'ok';
      return cached;
    }

    // Check if there's already a pending request for this feed
    const pendingRequest = this.requestCache.get(cacheKey);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Create new request
    const request = this._fetchFeed(source, statusMap, errorMap, cacheKey);
    this.requestCache.set(cacheKey, request);

    try {
      const result = await request;
      return result;
    } finally {
      // Clean up pending request
      this.requestCache.delete(cacheKey);
    }
  }

  private async _fetchFeed(
    source: SourceItem,
    statusMap: Record<string | number, FeedStatus>,
    errorMap: Record<string | number, string>,
    cacheKey: string
  ): Promise<FeedItem[]> {
    statusMap[source.id] = 'loading';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
      const response = await fetch(apiUrl, { signal: controller.signal });

      if (!response.ok) {
        statusMap[source.id] = 'error';
        errorMap[source.id] = `HTTP ${response.status}`;
        return [];
      }

      const data: RSSResponse = await response.json();

      if (data.status === 'ok' && data.items && data.items.length > 0) {
        statusMap[source.id] = 'ok';

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
              time: pubDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }),
              rawDate: pubDate,
              url: item.link,
              velocity: calculateFreshnessScore(pubDate),
              category: source.category
            };
          })
          .filter((item): item is FeedItem => item !== null);

        // Cache individual feed result
        feedCache.set(cacheKey, validItems, 15);

        return validItems;
      } else {
        statusMap[source.id] = 'error';
        errorMap[source.id] = data.message || 'No items returned';
        return [];
      }
    } catch (error) {
      statusMap[source.id] = 'error';

      if (error instanceof DOMException && error.name === 'AbortError') {
        errorMap[source.id] = 'Request timeout (10s)';
      } else {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errorMap[source.id] = errorMsg.substring(0, 50);
      }
      return [];
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Force refresh by clearing cache
   */
  clearCache(): void {
    feedCache.clear();
    this.requestCache.clear();
  }

  /**
   * Clear cache for specific source
   */
  clearSourceCache(sourceId: string | number): void {
    feedCache.delete(`feed_${sourceId}`);
  }
}

// Export singleton instance
export const feedService = FeedService.getInstance();
