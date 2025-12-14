import { useState, useMemo, useCallback } from 'react';
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

// Compute cutoff time from dateRange (pure function, safe in render)
function computeCutoffTime(dateRange: DateRangeValue): number {
  if (dateRange === 'all') return 0;
  const hours = DATE_RANGE_HOURS[dateRange];
  return Date.now() - hours * 60 * 60 * 1000;
}

/**
 * Hook for search and filtering functionality
 */
export function useSearch(feed: FeedItem[]): UseSearchReturn {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [presets, setPresets] = useLocalStorage<FilterPreset[]>('intel-filter-presets', []);

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
    // Compute cutoff time inside useMemo (pure derivation, no ref access)
    const cutoffTime = computeCutoffTime(filters.dateRange);

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

      // Date range filter
      if (cutoffTime > 0 && item.rawDate.getTime() < cutoffTime) {
        return false;
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
