import type { FeedItem, FeedCache, UserPreferences, FilterPreset, MediaSettings } from '../types';
import { FEED_CONFIG } from '../config/feeds';

// Storage keys
const STORAGE_KEYS = {
  FEED_CACHE: 'intel-dashboard:feed-cache',
  PREFERENCES: 'intel-dashboard:preferences',
  FILTER_PRESETS: 'intel-dashboard:filter-presets',
  MEDIA_SETTINGS: 'intel-dashboard:media-settings',
} as const;

// Default media settings
const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  rumbleChannels: [
    { id: 'tucker', name: 'Tucker Carlson', embedId: 'tuckercarlson' },
    { id: 'warroom', name: 'War Room', embedId: 'warroom' },
  ],
  twitterAccounts: [
    { handle: 'TuckerCarlson', name: 'Tucker Carlson' },
    { handle: 'RealCandaceO', name: 'Candace Owens' },
    { handle: 'JackPosobiec', name: 'Jack Posobiec' },
  ],
};

// Default user preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultTab: 'feed',
  defaultCategory: 'ALL',
  filterPresets: [],
  mediaSettings: DEFAULT_MEDIA_SETTINGS,
};

/**
 * Get cached feed data if still valid
 */
export function getCachedFeed(): FeedCache | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.FEED_CACHE);
    if (!cached) return null;

    const parsed: FeedCache = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - parsed.timestamp > FEED_CONFIG.cacheTTL) {
      localStorage.removeItem(STORAGE_KEYS.FEED_CACHE);
      return null;
    }

    // Restore Date objects (JSON doesn't preserve Date type)
    parsed.items = parsed.items.map(item => ({
      ...item,
      rawDate: new Date(item.rawDate),
    }));

    return parsed;
  } catch (error) {
    console.error('Error reading feed cache:', error);
    return null;
  }
}

/**
 * Save feed data to cache
 */
export function setCachedFeed(items: FeedItem[]): void {
  try {
    const cache: FeedCache = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.FEED_CACHE, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving feed cache:', error);
  }
}

/**
 * Clear feed cache
 */
export function clearFeedCache(): void {
  localStorage.removeItem(STORAGE_KEYS.FEED_CACHE);
}

/**
 * Get user preferences
 */
export function getPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save user preferences
 */
export function savePreferences(prefs: Partial<UserPreferences>): void {
  try {
    const current = getPreferences();
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({ ...current, ...prefs })
    );
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

/**
 * Get filter presets
 */
export function getFilterPresets(): FilterPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FILTER_PRESETS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save filter presets
 */
export function saveFilterPresets(presets: FilterPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTER_PRESETS, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving filter presets:', error);
  }
}

/**
 * Get media settings
 */
export function getMediaSettings(): MediaSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MEDIA_SETTINGS);
    if (!stored) return DEFAULT_MEDIA_SETTINGS;
    return { ...DEFAULT_MEDIA_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_MEDIA_SETTINGS;
  }
}

/**
 * Save media settings
 */
export function saveMediaSettings(settings: MediaSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDIA_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving media settings:', error);
  }
}
