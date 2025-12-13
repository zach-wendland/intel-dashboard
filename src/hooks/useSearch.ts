import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { FeedItem, SearchFilters, DateRangeValue, FilterPreset } from '../types';
import { extractTopics } from '../utils/analytics';
import { useLocalStorage } from './useLocalStorage';

interface UseSearchReturn {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;
  filteredFeed: FeedItem[];
  resultCount: number;
  // Presets
  presets: FilterPreset[];
  savePreset: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  topics: [],
  categories: [],
  dateRange: 'all',
  velocityThreshold: 0,
};

// Date range hours mapping
const DATE_RANGE_HOURS: Record<DateRangeValue, number> = {
  '1h': 1,
  '6h': 6,
  '24h': 24,
  'all': Infinity,
};

/**
 * Hook for search and filtering functionality
 */
export function useSearch(feed: FeedItem[]): UseSearchReturn {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [presets, setPresets] = useLocalStorage<FilterPreset[]>('intel-filter-presets', []);

  // Store cutoff time in ref - updated via effect, not during render
  const cutoffTimeRef = useRef<number>(0);

  // Update cutoff time when dateRange changes (effect, not render)
  useEffect(() => {
    if (filters.dateRange !== 'all') {
      const hours = DATE_RANGE_HOURS[filters.dateRange];
      cutoffTimeRef.current = Date.now() - hours * 60 * 60 * 1000;
    } else {
      cutoffTimeRef.current = 0;
    }
  }, [filters.dateRange]);

  // Update a single filter field
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Filter the feed based on current filters
  const filteredFeed = useMemo(() => {
    return feed.filter(item => {
      // Full-text search on title
      if (filters.query) {
        const query = filters.query.toLowerCase();
        if (!item.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Topic filter (any match)
      if (filters.topics.length > 0) {
        const itemTopics = extractTopics(item.title);
        if (!filters.topics.some(t => itemTopics.includes(t))) {
          return false;
        }
      }

      // Category filter (any match)
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(item.category)) {
          return false;
        }
      }

      // Date range filter (using ref-stored cutoff time)
      if (filters.dateRange !== 'all' && cutoffTimeRef.current > 0) {
        if (item.rawDate.getTime() < cutoffTimeRef.current) {
          return false;
        }
      }

      // Velocity threshold
      if (item.velocity < filters.velocityThreshold) {
        return false;
      }

      return true;
    });
  }, [feed, filters]);

  // Save current filters as a preset
  const savePreset = useCallback((name: string) => {
    const newPreset: FilterPreset = {
      id: crypto.randomUUID(),
      name,
      filters: { ...filters },
      createdAt: Date.now(),
    };
    setPresets(prev => [...prev, newPreset]);
  }, [filters, setPresets]);

  // Load a preset
  const loadPreset = useCallback((id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      setFilters(preset.filters);
    }
  }, [presets]);

  // Delete a preset
  const deletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  }, [setPresets]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    filteredFeed,
    resultCount: filteredFeed.length,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
  };
}

export default useSearch;
