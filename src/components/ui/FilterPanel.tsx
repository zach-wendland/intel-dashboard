import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Save, Trash2 } from 'lucide-react';
import type { SearchFilters, DateRangeValue, FilterPreset } from '../../types';
import { ALL_TOPICS } from '../../utils/analytics';
import { CATEGORY_KEYS, SOURCE_CATEGORIES } from '../../config/categories';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  onReset: () => void;
  presets: FilterPreset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  resultCount: number;
  totalCount: number;
}

const DATE_RANGES: { label: string; value: DateRangeValue }[] = [
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: 'All', value: 'all' },
];

/**
 * Expandable filter panel with topics, categories, date range, and velocity
 */
export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  resultCount,
  totalCount,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresetInput, setShowPresetInput] = useState(false);

  const hasActiveFilters =
    filters.query ||
    filters.topics.length > 0 ||
    filters.categories.length > 0 ||
    filters.dateRange !== 'all' ||
    filters.velocityThreshold > 0;

  const toggleTopic = (topic: string) => {
    const current = filters.topics;
    const newTopics = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];
    onFilterChange('topics', newTopics);
  };

  const toggleCategory = (category: string) => {
    const current = filters.categories;
    const newCategories = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    onFilterChange('categories', newCategories);
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName('');
      setShowPresetInput(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 min-h-[44px]
                   hover:bg-slate-800/50 active:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {resultCount} / {totalCount}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-3 sm:p-4 pt-0 space-y-4 border-t border-slate-800">
          {/* Topics */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Topics</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-all active:scale-95
                    ${filters.topics.includes(topic)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
                    }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_KEYS.map(key => {
                const config = SOURCE_CATEGORIES[key];
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => toggleCategory(key)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95
                      ${filters.categories.includes(key)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
                      }`}
                  >
                    <Icon className={`h-3 w-3 ${filters.categories.includes(key) ? '' : config.color}`} />
                    <span className="hidden sm:inline">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase tracking-wide">Time Range</label>
            <div className="flex gap-2">
              {DATE_RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => onFilterChange('dateRange', range.value)}
                  className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all active:scale-95
                    ${filters.dateRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Velocity Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-500 uppercase tracking-wide">
                Min Velocity
              </label>
              <span className="text-xs text-slate-400">{filters.velocityThreshold}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.velocityThreshold}
              onChange={(e) => onFilterChange('velocityThreshold', Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-blue-500"
            />
          </div>

          {/* Presets */}
          {(presets.length > 0 || hasActiveFilters) && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Presets</span>
                {hasActiveFilters && !showPresetInput && (
                  <button
                    onClick={() => setShowPresetInput(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                )}
              </div>

              {/* Save preset input */}
              {showPresetInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name..."
                    className="flex-1 px-3 py-2 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg
                               text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                    autoFocus
                  />
                  <button
                    onClick={handleSavePreset}
                    className="px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg text-sm
                               hover:bg-blue-500 active:scale-95 transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowPresetInput(false)}
                    className="px-3 py-2 min-h-[44px] bg-slate-800 text-slate-400 rounded-lg text-sm
                               hover:bg-slate-700 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Preset list */}
              {presets.length > 0 && (
                <div className="space-y-1">
                  {presets.map(preset => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 group"
                    >
                      <button
                        onClick={() => onLoadPreset(preset.id)}
                        className="flex-1 text-left text-sm text-slate-300 hover:text-white"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete preset"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="w-full py-2 min-h-[44px] text-sm text-slate-400 hover:text-white
                         border border-slate-700 rounded-lg hover:border-slate-600 active:scale-[0.98] transition-all"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
