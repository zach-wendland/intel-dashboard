# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Intel Dashboard is a React/TypeScript news aggregation dashboard that displays live RSS feeds from various political news sources. It features a "Global Intelligence Grid" UI with real-time feed status monitoring, category filtering, and data visualization.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server (default: http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run lint         # Run ESLint on TypeScript/TSX files
npm run preview      # Preview production build locally
```

## Architecture

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

### Key File Structure
```
src/
├── types/index.ts           # All TypeScript interfaces
├── config/
│   ├── feeds.ts             # LIVE_FEEDS array, RSS_API_BASE, FEED_CONFIG
│   ├── sources.ts           # SOURCES array (55 sources)
│   └── categories.ts        # SOURCE_CATEGORIES with lucide icons
├── hooks/
│   ├── useFeed.ts           # RSS fetching with caching
│   ├── useTrending.ts       # Topic analytics computation
│   ├── useSearch.ts         # Search + filters + presets
│   └── useLocalStorage.ts   # Generic localStorage persistence
├── utils/
│   ├── validators.ts        # URL/date validation, sanitization
│   ├── analytics.ts         # Topic extraction, trending computation
│   └── cache.ts             # localStorage cache helpers
├── components/
│   ├── ui/
│   │   ├── SearchBar.tsx    # Debounced search input
│   │   ├── FilterPanel.tsx  # Expandable filters + presets
│   │   ├── TrendingWidget.tsx
│   │   ├── TopicHeatmap.tsx
│   │   ├── RumbleWidget.tsx
│   │   ├── TwitterWidget.tsx
│   │   └── MediaSettingsPanel.tsx
│   └── views/
│       └── MediaView.tsx    # Media tab combining widgets
├── App.tsx                  # Main app with mobile-optimized UI
└── main.tsx                 # React entry point
```

### Modular Component Architecture
- **Types**: All interfaces in `src/types/index.ts` (FeedItem, TrendingTopic, SearchFilters, etc.)
- **Config**: Feed sources, categories, and settings extracted to `src/config/`
- **Hooks**: Custom hooks for feed fetching, trending analytics, search/filters
- **Utils**: Validators, analytics computations, caching helpers
- **Components**: Reusable UI components and view containers
- **Views**: Four tabs - "Intel Grid", "Live Wire", "Synthesis", "Media"

### RSS Feed Integration
Feeds are fetched from `https://api.rss2json.com/v1/api.json?rss_url=...` with:
- AbortController timeout (10s)
- Per-feed status tracking (`ok`, `error`, `loading`)
- URL validation to prevent XSS
- Date validation to prevent sort crashes

### Data Flow
1. `fetchLiveFeed()` called on mount and refresh button click
2. Parallel fetch to all feeds in `LIVE_FEEDS` array
3. Response validation: HTTP status, RSS status, date parsing, URL validation
4. Items sorted by `rawDate` (newest first)
5. Feed status and error messages stored in state for UI display

## Configuration

### Adding New RSS Feeds
Add entries to `LIVE_FEEDS` array in `App.tsx`:
```typescript
{
  id: 'unique-id',
  name: 'Display Name',
  url: 'https://example.com/feed/',
  category: 'INTELLECTUALS' | 'BROADCAST' | 'RADICALS' | 'LIBERTARIANS' | 'THEOLOGIANS' | 'INFRASTRUCTURE',
  topic_map: 'Topic Label'
}
```

### Source Categories
Categories defined in `SOURCE_CATEGORIES` with icons, labels, and colors. Used for filtering in Intel Grid view and displaying feed items in Live Wire view.

## Known Considerations

### External API Dependency
The app relies on rss2json.com as a CORS proxy. This free tier may have rate limits (~100 requests/day). Consider implementing client-side caching if hitting limits.

### Analytics & Trending
- Topic extraction via keyword matching in `src/utils/analytics.ts`
- Trending computed from feed data (topic frequency, velocity, source distribution)
- Hourly aggregates for chart visualization
- Source-topic matrix for heatmap

### Caching Strategy
- Feed cache: 5-minute TTL in localStorage (`src/utils/cache.ts`)
- User preferences: Persisted indefinitely
- Filter presets: User-managed, localStorage

### Error Handling Pattern
Feed errors are tracked per-source and displayed in a collapsible error alert. The feed health indicator shows green (all ok), orange (partial), or red (all failed) based on `feedStatus` state.

### Mobile Optimization
- Mobile-first responsive design with sm:/md:/lg: breakpoints
- 44px minimum tap targets on all interactive elements
- Touch feedback states (active:scale-95, active:bg-*)
- External link icons visible on mobile (opacity-60), hover-only on desktop
- Responsive chart heights (h-48 sm:h-64)
- Separate mobile navigation with icon-only buttons
