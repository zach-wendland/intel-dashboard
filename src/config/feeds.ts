import type { SourceItem } from '../types';

// Live RSS Endpoints - these are actively fetched
export const LIVE_FEEDS: SourceItem[] = [
  {
    id: 'tac',
    name: 'The American Conservative',
    url: 'https://www.theamericanconservative.com/feed/',
    category: 'INTELLECTUALS',
    topic_map: 'Politics'
  },
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
    id: 'lew',
    name: 'LewRockwell.com',
    url: 'https://www.lewrockwell.com/feed/',
    category: 'LIBERTARIANS',
    topic_map: 'Economics'
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

// RSS API endpoint
export const RSS_API_BASE = 'https://api.rss2json.com/v1/api.json';

// Feed fetch configuration
export const FEED_CONFIG = {
  timeout: 10000, // 10 seconds
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  maxRetries: 2,
};
