import { useState, useCallback, useEffect } from 'react';
import type { FeedItem, FeedStatus, RSSResponse, RSSItem } from '../types';
import { LIVE_FEEDS, RSS_API_BASE, FEED_CONFIG } from '../config/feeds';
import { isValidUrl, parseDate, formatTime } from '../utils/validators';
import { getCachedFeed, setCachedFeed } from '../utils/cache';

interface UseFeedReturn {
  feed: FeedItem[];
  feedStatus: Record<string | number, FeedStatus>;
  errorMessages: Record<string | number, string>;
  isRefreshing: boolean;
  lastUpdated: string | null;
  fetchLiveFeed: (forceRefresh?: boolean) => Promise<void>;
}

/**
 * Hook for managing RSS feed fetching with caching and error handling
 */
export function useFeed(): UseFeedReturn {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [feedStatus, setFeedStatus] = useState<Record<string | number, FeedStatus>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string | number, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchLiveFeed = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedFeed();
      if (cached) {
        setFeed(cached.items);
        setLastUpdated(formatTime(new Date(cached.timestamp)));
        // Set all feeds as ok if using cache
        const status: Record<string | number, FeedStatus> = {};
        LIVE_FEEDS.forEach(f => { status[f.id] = 'ok'; });
        setFeedStatus(status);
        return;
      }
    }

    setIsRefreshing(true);
    setErrorMessages({});

    const newStatus: Record<string | number, FeedStatus> = {};
    const errors: Record<string | number, string> = {};
    let allItems: FeedItem[] = [];

    // Fetch all feeds in parallel with timeout protection
    const promises = LIVE_FEEDS.map(async (source) => {
      newStatus[source.id] = 'loading';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FEED_CONFIG.timeout);

      try {
        const apiUrl = `${RSS_API_BASE}?rss_url=${encodeURIComponent(source.url)}`;
        const response = await fetch(apiUrl, { signal: controller.signal });

        if (!response.ok) {
          newStatus[source.id] = 'error';
          errors[source.id] = `HTTP ${response.status}`;
          console.warn(`${source.name}: HTTP ${response.status}`);
          return [];
        }

        const data: RSSResponse = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
          newStatus[source.id] = 'ok';

          // Filter and validate items
          const validItems = data.items
            .filter(item => item.title && item.link && item.pubDate)
            .map((item: RSSItem, index: number) => {
              const pubDate = parseDate(item.pubDate);

              if (!pubDate) {
                console.warn(`${source.name}: Invalid date - ${item.pubDate}`);
                return null;
              }

              if (!isValidUrl(item.link || '')) {
                console.warn(`${source.name}: Invalid URL - ${item.link}`);
                return null;
              }

              return {
                id: `${source.id}-${index}`,
                title: item.title || 'Untitled',
                source: source.name,
                topic: source.topic_map || 'General',
                time: formatTime(pubDate),
                rawDate: pubDate,
                url: item.link!,
                velocity: Math.floor(Math.random() * (100 - 40) + 40), // Will be replaced with real analytics
                category: source.category
              };
            })
            .filter((item): item is FeedItem => item !== null);

          return validItems;
        } else {
          newStatus[source.id] = 'error';
          errors[source.id] = data.message || 'No items returned';
          console.warn(`${source.name}: ${data.message || 'No items'}`);
          return [];
        }
      } catch (error) {
        newStatus[source.id] = 'error';

        if (error instanceof DOMException && error.name === 'AbortError') {
          errors[source.id] = 'Request timeout';
          console.warn(`${source.name}: Timeout`);
        } else {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors[source.id] = errorMsg.substring(0, 50);
          console.error(`${source.name}: ${errorMsg}`);
        }
        return [];
      } finally {
        clearTimeout(timeoutId);
      }
    });

    try {
      const results = await Promise.all(promises);
      allItems = results.flat();

      // Sort by newest first
      allItems.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

      // Save to cache
      if (allItems.length > 0) {
        setCachedFeed(allItems);
      }

      setFeed(allItems);
      setFeedStatus(newStatus);
      if (Object.keys(errors).length > 0) {
        setErrorMessages(errors);
      }
      setLastUpdated(formatTime(new Date()));
    } catch (e) {
      console.error("Global fetch error", e);
      setFeedStatus(newStatus);
      setErrorMessages(errors);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchLiveFeed();
  }, [fetchLiveFeed]);

  return {
    feed,
    feedStatus,
    errorMessages,
    isRefreshing,
    lastUpdated,
    fetchLiveFeed,
  };
}

export default useFeed;
